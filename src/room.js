import { DurableObject } from "cloudflare:workers";

const MAX_PEERS = 4;
const MAX_NAME_LEN = 32;
const MAX_MSG_LEN = 1000;
const DEFAULT_PASSCODE = "Sr@20050829";

const textDecoder = new TextDecoder();

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

function normalizeText(text) {
  if (!text) return "";
  const trimmed = text.trim().slice(0, MAX_MSG_LEN);
  return trimmed;
}

export class Room extends DurableObject {
  constructor(ctx, env) {
    super(ctx, env);
    this.ctx = ctx;
    this.env = env;
  }

  async fetch(request) {
    const upgrade = request.headers.get("Upgrade");
    if (!upgrade || upgrade.toLowerCase() !== "websocket") {
      return new Response("Expected WebSocket", { status: 426 });
    }

    const url = new URL(request.url);
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
    for (const socket of sockets) {
      const info = socket.deserializeAttachment();
      if (info && info.name && info.name.toLowerCase() === normalizedName) {
        return new Response("Name already in use", { status: 409 });
      }
    }
    if (sockets.length >= MAX_PEERS) {
      return new Response("Room is full", { status: 403 });
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

    server.send(
      JSON.stringify({
        type: "welcome",
        id,
        name,
        peers,
        maxPeers: MAX_PEERS,
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
        this.broadcast({
          type: "chat",
          id: info.id,
          name: info.name,
          text,
          ts: Date.now(),
        });
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
      case "call": {
        this.broadcast({
          type: "call",
          id: info.id,
          name: info.name,
          ts: Date.now(),
        }, ws);
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

  broadcast(message, except) {
    const payload = JSON.stringify(message);
    for (const ws of this.ctx.getWebSockets()) {
      if (ws === except) continue;
      this.safeSendRaw(ws, payload);
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
}
