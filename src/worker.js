import { Room } from "./room.js";

export { Room };

const DEFAULT_STUN_URLS = ["stun:stun.l.google.com:19302"];
const DEFAULT_ALLOWED_NAMES = ["weijin", "sunran", "gyl", "syx"];
const DEFAULT_PASSCODE = "Sr@20050829";
const MAX_PEERS = 4;

function parseList(raw) {
  if (!raw) return [];
  return raw
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function buildConfig(env) {
  const allowedNamesRaw = parseList(env.ALLOWED_NAMES).map((name) =>
    name.slice(0, 32),
  );
  const allowedNames = allowedNamesRaw.length
    ? allowedNamesRaw
    : DEFAULT_ALLOWED_NAMES;
  const passcodeRequired = Boolean(env.ROOM_PASSCODE || DEFAULT_PASSCODE);
  const stunUrls = parseList(env.STUN_URLS);
  const resolvedStun = stunUrls.length ? stunUrls : DEFAULT_STUN_URLS;
  const turnUrls = parseList(env.TURN_URLS);

  let turn = null;
  if (turnUrls.length && env.TURN_USERNAME && env.TURN_CREDENTIAL) {
    turn = {
      urls: turnUrls,
      username: env.TURN_USERNAME,
      credential: env.TURN_CREDENTIAL,
    };
  }

  return {
    passcodeRequired,
    allowedNames,
    maxPeers: MAX_PEERS,
    stunUrls: resolvedStun,
    turn,
  };
}

function jsonResponse(payload) {
  return new Response(JSON.stringify(payload), {
    headers: {
      "content-type": "application/json",
      "cache-control": "no-store",
    },
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/config") {
      return jsonResponse(buildConfig(env));
    }

    if (url.pathname === "/ws") {
      if (request.headers.get("Upgrade") !== "websocket") {
        return new Response("Expected WebSocket", { status: 426 });
      }
      const room = (url.searchParams.get("room") || "family").slice(0, 64);
      const id = env.ROOM.idFromName(room);
      const stub = env.ROOM.get(id);
      return stub.fetch(request);
    }

    return env.ASSETS.fetch(request);
  },
};
