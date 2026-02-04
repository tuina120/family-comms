import { DurableObject } from "cloudflare:workers";

const MAX_PEERS = 4;
const MAX_NAME_LEN = 32;
const MAX_MSG_LEN = 1000;
const DEFAULT_PASSCODE = "Sr@20050829";
const VAPID_EXP_SECONDS = 12 * 60 * 60;
const ADMIN_NAME = "weijin";
const CHAT_RETENTION_MS = 90 * 24 * 60 * 60 * 1000;
const CHAT_HISTORY_LIMIT = 200;
const CHAT_PRUNE_INTERVAL_MS = 60 * 60 * 1000;
const CALL_NOTIFY_DURATION_MS = 45 * 1000;
const CALL_NOTIFY_INTERVAL_MS = 15 * 1000;

const textDecoder = new TextDecoder();
const textEncoder = new TextEncoder();

function parseList(raw) {
  if (!raw) return [];
  return raw
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseAllowedNames(raw) {
  const entries = parseList(raw)
    .map((name) => name.slice(0, MAX_NAME_LEN))
    .map((name) => name.toLowerCase());
  if (!entries.length) return null;
  return new Set(entries);
}

function safeParseJson(message) {
  try {
    return JSON.parse(message);
  } catch {
    return null;
  }
}

function normalizeName(name) {
  if (!name) return "Guest";
  const trimmed = name.trim().slice(0, MAX_NAME_LEN);
  return trimmed || "Guest";
}

function isAdmin(name) {
  return Boolean(name && name.toLowerCase() === ADMIN_NAME);
}

function normalizeText(text) {
  if (!text) return "";
  const trimmed = text.trim().slice(0, MAX_MSG_LEN);
  return trimmed;
}

function base64UrlEncode(bytes) {
  let binary = "";
  for (const b of bytes) {
    binary += String.fromCharCode(b);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function base64UrlDecode(value) {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/");
  const pad = "=".repeat((4 - (padded.length % 4)) % 4);
  const binary = atob(padded + pad);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function getAudience(endpoint) {
  const url = new URL(endpoint);
  return `${url.protocol}//${url.host}`;
}

async function createVapidToken({ audience, subject, publicKey, privateKey }) {
  const pubBytes = base64UrlDecode(publicKey);
  const privBytes = base64UrlDecode(privateKey);
  const x = base64UrlEncode(pubBytes.slice(1, 33));
  const y = base64UrlEncode(pubBytes.slice(33, 65));
  const d = base64UrlEncode(privBytes);

  const jwk = {
    kty: "EC",
    crv: "P-256",
    x,
    y,
    d,
    ext: true,
    key_ops: ["sign"],
  };

  const key = await crypto.subtle.importKey(
    "jwk",
    jwk,
    { name: "ECDSA", namedCurve: "P-256" },
    false,
    ["sign"],
  );

  const header = { typ: "JWT", alg: "ES256" };
  const payload = {
    aud: audience,
    exp: Math.floor(Date.now() / 1000) + VAPID_EXP_SECONDS,
    sub: subject,
  };
  const encodedHeader = base64UrlEncode(
    textEncoder.encode(JSON.stringify(header)),
  );
  const encodedPayload = base64UrlEncode(
    textEncoder.encode(JSON.stringify(payload)),
  );
  const unsignedToken = `${encodedHeader}.${encodedPayload}`;
  const signature = await crypto.subtle.sign(
    { name: "ECDSA", hash: "SHA-256" },
    key,
    textEncoder.encode(unsignedToken),
  );
  const encodedSig = base64UrlEncode(new Uint8Array(signature));
  return `${unsignedToken}.${encodedSig}`;
}

function isValidSubscription(subscription) {
  return (
    subscription &&
    typeof subscription.endpoint === "string" &&
    subscription.endpoint.length > 0 &&
    subscription.keys &&
    typeof subscription.keys.p256dh === "string" &&
    typeof subscription.keys.auth === "string"
  );
}

export class Room extends DurableObject {
  constructor(ctx, env) {
    super(ctx, env);
    this.ctx = ctx;
    this.env = env;
    this.lastChatPrune = 0;
  }

  async appendChatMessage(message) {
    const key = `chat:${message.ts}:${crypto.randomUUID()}`;
    await this.ctx.storage.put(key, message);
    this.pruneOldChats().catch(() => {});
  }

  async pruneOldChats() {
    const now = Date.now();
    if (now - this.lastChatPrune < CHAT_PRUNE_INTERVAL_MS) return;
    this.lastChatPrune = now;
    const cutoff = now - CHAT_RETENTION_MS;
    let cursor = undefined;
    do {
      const page = await this.ctx.storage.list({
        prefix: "chat:",
        cursor,
        limit: 1000,
      });
      const toDelete = [];
      for (const [key, value] of page.entries()) {
        if (!value || typeof value.ts !== "number" || value.ts < cutoff) {
          toDelete.push(key);
        }
      }
      if (toDelete.length) {
        await this.ctx.storage.delete(toDelete);
      }
      cursor = page.cursor;
    } while (cursor);
  }

  async getChatHistory() {
    const cutoff = Date.now() - CHAT_RETENTION_MS;
    let cursor = undefined;
    const messages = [];
    do {
      const page = await this.ctx.storage.list({
        prefix: "chat:",
        cursor,
        limit: 1000,
      });
      for (const [, value] of page.entries()) {
        if (!value || typeof value.ts !== "number") continue;
        if (value.ts < cutoff) continue;
        messages.push(value);
      }
      cursor = page.cursor;
    } while (cursor);

    messages.sort((a, b) => a.ts - b.ts);
    if (messages.length > CHAT_HISTORY_LIMIT) {
      return messages.slice(-CHAT_HISTORY_LIMIT);
    }
    return messages;
  }

  async scheduleNextAlarm() {
    const calls = await this.ctx.storage.list({ prefix: "call:" });
    let next = null;
    for (const [, record] of calls.entries()) {
      if (!record || typeof record.nextAt !== "number") continue;
      if (next === null || record.nextAt < next) {
        next = record.nextAt;
      }
    }
    if (next) {
      const scheduled = Math.max(next, Date.now() + 500);
      await this.ctx.storage.setAlarm(scheduled);
    }
  }

  async scheduleCallRepeat(callerName, targetName) {
    if (!this.getVapidConfig()) return;
    const now = Date.now();
    const key = targetName
      ? `call:${targetName.toLowerCase()}`
      : "call:all";
    const record = {
      callerName: callerName || "",
      targetName: targetName || null,
      endAt: now + CALL_NOTIFY_DURATION_MS,
      nextAt: now + CALL_NOTIFY_INTERVAL_MS,
    };
    await this.ctx.storage.put(key, record);
    await this.scheduleNextAlarm();
  }

  async processScheduledCalls() {
    const now = Date.now();
    const calls = await this.ctx.storage.list({ prefix: "call:" });
    if (!calls.size) return;
    const deletions = [];
    const updates = new Map();

    for (const [key, record] of calls.entries()) {
      if (!record || typeof record.endAt !== "number") {
        deletions.push(key);
        continue;
      }
      if (now >= record.endAt) {
        deletions.push(key);
        continue;
      }
      if (typeof record.nextAt === "number" && now >= record.nextAt) {
        await this.notifyOffline(record.callerName, record.targetName);
        record.nextAt = now + CALL_NOTIFY_INTERVAL_MS;
        updates.set(key, record);
      }
    }

    if (deletions.length) {
      await this.ctx.storage.delete(deletions);
    }
    for (const [key, record] of updates.entries()) {
      await this.ctx.storage.put(key, record);
    }
    await this.scheduleNextAlarm();
  }

  async handleSubscribe(request) {
    let data;
    try {
      data = await request.json();
    } catch {
      return new Response("Invalid JSON", { status: 400 });
    }

    const name = normalizeName(data && data.name);
    const subscription = data && data.subscription;
    if (!isValidSubscription(subscription)) {
      return new Response("Invalid subscription", { status: 400 });
    }

    const allowedNames = parseAllowedNames(this.env.ALLOWED_NAMES);
    if (allowedNames && !allowedNames.has(name.toLowerCase())) {
      return new Response("Name not allowed", { status: 403 });
    }

    const key = `sub:${subscription.endpoint}`;
    const record = {
      endpoint: subscription.endpoint,
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth,
      name,
      ua: data && data.ua ? String(data.ua).slice(0, 200) : "",
      updatedAt: Date.now(),
    };
    await this.ctx.storage.put(key, record);

    return new Response(JSON.stringify({ ok: true }), {
      headers: { "content-type": "application/json" },
    });
  }

  async fetch(request) {
    const url = new URL(request.url);
    if (url.pathname === "/subscribe") {
      if (request.method !== "POST") {
        return new Response("Method Not Allowed", { status: 405 });
      }
      return this.handleSubscribe(request);
    }

    const upgrade = request.headers.get("Upgrade");
    if (!upgrade || upgrade.toLowerCase() !== "websocket") {
      return new Response("Expected WebSocket", { status: 426 });
    }

    const name = normalizeName(url.searchParams.get("name"));
    const passcode = url.searchParams.get("pass") || "";

    const requiredPasscode = this.env.ROOM_PASSCODE || DEFAULT_PASSCODE;
    if (requiredPasscode && passcode !== requiredPasscode) {
      return new Response("Invalid passcode", { status: 403 });
    }

    const allowedNames = parseAllowedNames(this.env.ALLOWED_NAMES);
    if (allowedNames && !allowedNames.has(name.toLowerCase())) {
      return new Response("Name not allowed", { status: 403 });
    }

    const sockets = this.ctx.getWebSockets();
    const normalizedName = name.toLowerCase();
    let existing = null;
    for (const socket of sockets) {
      const info = socket.deserializeAttachment();
      if (info && info.name && info.name.toLowerCase() === normalizedName) {
        existing = socket;
        break;
      }
    }
    if (sockets.length >= MAX_PEERS && !existing) {
      return new Response("Room is full", { status: 403 });
    }
    if (existing) {
      this.safeSend(existing, { type: "kicked", reason: "duplicate" });
      existing.close(4002, "Replaced by new login");
    }

    const pair = new WebSocketPair();
    const client = pair[0];
    const server = pair[1];

    this.ctx.acceptWebSocket(server);

    const id = crypto.randomUUID();
    server.serializeAttachment({ id, name });

    const peers = sockets
      .map((ws) => ws.deserializeAttachment())
      .filter(Boolean)
      .map((info) => ({ id: info.id, name: info.name }));
    const history = await this.getChatHistory();

    server.send(
      JSON.stringify({
        type: "welcome",
        id,
        name,
        peers,
        maxPeers: MAX_PEERS,
        history,
      }),
    );

    this.broadcast({ type: "peer-joined", id, name }, server);

    return new Response(null, { status: 101, webSocket: client });
  }

  webSocketMessage(ws, message) {
    const payload =
      typeof message === "string" ? message : textDecoder.decode(message);
    const data = safeParseJson(payload);

    if (!data || typeof data.type !== "string") {
      this.safeSend(ws, { type: "error", message: "Invalid message" });
      return;
    }

    const info = ws.deserializeAttachment() || {};

    switch (data.type) {
      case "chat": {
        const text = normalizeText(data.text);
        if (!text) return;
        const message = {
          type: "chat",
          id: info.id,
          name: info.name,
          text,
          ts: Date.now(),
        };
        this.broadcast({
          type: "chat",
          id: message.id,
          name: message.name,
          text: message.text,
          ts: message.ts,
        });
        this.appendChatMessage(message).catch(() => {});
        return;
      }
      case "signal": {
        const targetId = data.to;
        if (!targetId || !data.data) return;
        const target = this.findSocketById(targetId);
        if (!target) return;
        this.safeSend(target, {
          type: "signal",
          from: info.id,
          data: data.data,
        });
        return;
      }
      case "rename": {
        const newName = normalizeName(data.name);
        const allowedNames = parseAllowedNames(this.env.ALLOWED_NAMES);
        if (allowedNames && !allowedNames.has(newName.toLowerCase())) {
          this.safeSend(ws, { type: "error", message: "Name not allowed" });
          return;
        }
        if (this.isNameInUse(newName, ws)) {
          this.safeSend(ws, { type: "error", message: "Name already in use" });
          return;
        }
        ws.serializeAttachment({ id: info.id, name: newName });
        this.broadcast({
          type: "peer-renamed",
          id: info.id,
          name: newName,
        });
        return;
      }
      case "ping": {
        this.safeSend(ws, { type: "pong", ts: Date.now() });
        return;
      }
      case "kick": {
        if (!isAdmin(info.name)) {
          this.safeSend(ws, { type: "error", code: "not_authorized" });
          return;
        }
        const rawTarget =
          typeof data.name === "string" ? data.name.trim().slice(0, MAX_NAME_LEN) : "";
        if (!rawTarget) return;
        const targetName = normalizeName(rawTarget);
        if (!targetName || targetName.toLowerCase() === info.name.toLowerCase()) {
          return;
        }
        const target = this.findSocketByName(targetName);
        if (!target) {
          this.safeSend(ws, {
            type: "error",
            code: "kick_not_online",
            name: targetName,
          });
          return;
        }
        this.safeSend(target, { type: "kicked", by: info.name, ts: Date.now() });
        target.close(4001, "Kicked");
        return;
      }
      case "call": {
        const targetName =
          typeof data.to === "string" ? data.to.trim().slice(0, MAX_NAME_LEN) : "";
        const payload = {
          type: "call",
          id: info.id,
          name: info.name,
          ts: Date.now(),
          to: targetName || null,
        };
        if (targetName) {
          this.sendToName(targetName, payload, ws);
          this.notifyOffline(info.name, targetName).catch(() => {});
          this.scheduleCallRepeat(info.name, targetName).catch(() => {});
        } else {
          this.broadcast(payload, ws);
          this.notifyOffline(info.name).catch(() => {});
          this.scheduleCallRepeat(info.name, null).catch(() => {});
        }
        return;
      }
      default: {
        this.safeSend(ws, { type: "error", message: "Unknown type" });
      }
    }
  }

  webSocketClose(ws, code, reason, wasClean) {
    const info = ws.deserializeAttachment() || {};
    this.broadcast({ type: "peer-left", id: info.id }, ws);
    if (ws.readyState <= 1) {
      ws.close(code, reason);
    }
  }

  webSocketError(ws, error) {
    const info = ws.deserializeAttachment() || {};
    this.broadcast({ type: "peer-left", id: info.id }, ws);
    if (ws.readyState <= 1) {
      ws.close(1011, "WebSocket error");
    }
  }

  async alarm() {
    await this.processScheduledCalls();
  }

  broadcast(message, except) {
    const payload = JSON.stringify(message);
    for (const ws of this.ctx.getWebSockets()) {
      if (ws === except) continue;
      this.safeSendRaw(ws, payload);
    }
  }

  sendToName(name, message, except) {
    const target = name.toLowerCase();
    const payload = JSON.stringify(message);
    for (const ws of this.ctx.getWebSockets()) {
      if (ws === except) continue;
      const info = ws.deserializeAttachment();
      if (info && info.name && info.name.toLowerCase() === target) {
        this.safeSendRaw(ws, payload);
      }
    }
  }

  safeSend(ws, message) {
    this.safeSendRaw(ws, JSON.stringify(message));
  }

  safeSendRaw(ws, payload) {
    try {
      ws.send(payload);
    } catch {
      // Ignore send errors on closing sockets.
    }
  }

  findSocketById(id) {
    for (const ws of this.ctx.getWebSockets()) {
      const info = ws.deserializeAttachment();
      if (info && info.id === id) return ws;
    }
    return null;
  }

  findSocketByName(name) {
    const target = name.toLowerCase();
    for (const ws of this.ctx.getWebSockets()) {
      const info = ws.deserializeAttachment();
      if (info && info.name && info.name.toLowerCase() === target) {
        return ws;
      }
    }
    return null;
  }

  isNameInUse(name, except) {
    const target = name.toLowerCase();
    for (const ws of this.ctx.getWebSockets()) {
      if (ws === except) continue;
      const info = ws.deserializeAttachment();
      if (info && info.name && info.name.toLowerCase() === target) {
        return true;
      }
    }
    return false;
  }

  getVapidConfig() {
    const publicKey = this.env.VAPID_PUBLIC_KEY;
    const privateKey = this.env.VAPID_PRIVATE_KEY;
    const subject = this.env.VAPID_SUBJECT;
    if (!publicKey || !privateKey || !subject) return null;
    return { publicKey, privateKey, subject };
  }

  getOnlineNames() {
    const names = new Set();
    for (const ws of this.ctx.getWebSockets()) {
      const info = ws.deserializeAttachment();
      if (info && info.name) {
        names.add(info.name.toLowerCase());
      }
    }
    return names;
  }

  async notifyOffline(callerName, targetName = null) {
    const vapid = this.getVapidConfig();
    if (!vapid) return;

    const onlineNames = this.getOnlineNames();
    if (callerName) {
      onlineNames.add(callerName.toLowerCase());
    }

    const subs = await this.ctx.storage.list({ prefix: "sub:" });
    if (!subs.size) return;

    for (const [key, record] of subs.entries()) {
      if (!record || !record.endpoint) continue;
      const name = record.name ? String(record.name).toLowerCase() : "";
      if (name && onlineNames.has(name)) continue;
      if (targetName && name && name !== targetName.toLowerCase()) continue;

      const res = await this.sendWebPush(record, vapid);
      if (res && (res.status === 404 || res.status === 410)) {
        await this.ctx.storage.delete(key);
      }
    }
  }

  async sendWebPush(record, vapid) {
    try {
      const audience = getAudience(record.endpoint);
      const token = await createVapidToken({
        audience,
        subject: vapid.subject,
        publicKey: vapid.publicKey,
        privateKey: vapid.privateKey,
      });
      const headers = {
        TTL: "60",
        Authorization: `vapid t=${token}, k=${vapid.publicKey}`,
        "Crypto-Key": `p256ecdsa=${vapid.publicKey}`,
      };
      return await fetch(record.endpoint, { method: "POST", headers });
    } catch {
      return null;
    }
  }
}
