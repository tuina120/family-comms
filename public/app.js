const statusEl = document.querySelector("#status");
const joinPanel = document.querySelector("#joinPanel");
const joinBtn = document.querySelector("#joinBtn");
const nameInput = document.querySelector("#nameInput");
const roomField = document.querySelector("#roomField");
const roomInput = document.querySelector("#roomInput");
const passcodeField = document.querySelector("#passcodeField");
const passcodeInput = document.querySelector("#passcodeInput");
const joinError = document.querySelector("#joinError");
const nameHint = document.querySelector("#nameHint");
const nameOptions = document.querySelector("#nameOptions");
const mainLayout = document.querySelector("#mainLayout");
const localVideo = document.querySelector("#localVideo");
const videoGrid = document.querySelector("#videoGrid");
const toggleMicBtn = document.querySelector("#toggleMic");
const toggleCamBtn = document.querySelector("#toggleCam");
const leaveBtn = document.querySelector("#leaveBtn");
const participantCountEl = document.querySelector("#participantCount");
const participantsEl = document.querySelector("#participants");
const invitePanel = document.querySelector("#invitePanel");
const inviteLink = document.querySelector("#inviteLink");
const copyInviteBtn = document.querySelector("#copyInvite");
const shareInviteBtn = document.querySelector("#shareInvite");
const includePasscodeCheckbox = document.querySelector("#includePasscode");
const inviteQr = document.querySelector("#inviteQr");
const messagesEl = document.querySelector("#messages");
const chatForm = document.querySelector("#chatForm");
const chatInput = document.querySelector("#chatInput");
const langZhBtn = document.querySelector("#langZh");
const langEnBtn = document.querySelector("#langEn");

const FIXED_PASSCODE = "Sr@20050829";
const STORAGE_KEYS = {
  name: "fc_name",
  room: "fc_room",
};

const DEFAULT_STUN_URLS = ["stun:stun.l.google.com:19302"];

const i18n = {
  en: {
    app_name: "Family Comms",
    status_offline: "Offline",
    status_connecting: "Connecting...",
    status_connected: "Connected",
    status_error: "Connection error",
    join_title: "Family room",
    label_name: "Name",
    label_room: "Room",
    label_passcode: "Passcode",
    label_you: "You",
    panel_video: "Video",
    panel_chat: "Chat",
    placeholder_name: "Your name",
    placeholder_room: "Family room",
    placeholder_passcode: "Family code",
    join_button: "Enter",
    join_hint: "Your device will remember this name.",
    invite_title: "Invite family",
    invite_copy: "Copy",
    invite_share: "Share",
    invite_include_passcode: "Include passcode",
    invite_qr_hint: "QR is generated from the invite link.",
    chat_placeholder: "Type a message",
    send_button: "Send",
    mic_mute: "Mute",
    mic_unmute: "Unmute",
    cam_off: "Camera Off",
    cam_on: "Camera On",
    leave: "Leave",
    msg_connected_room: "Connected to the room.",
    msg_disconnected: "Disconnected.",
    msg_joined: "{name} joined.",
    msg_left: "Someone left.",
    msg_media_unsupported: "Media devices not supported in this browser.",
    msg_media_denied: "Camera/microphone permission denied.",
    msg_invite_copied: "Invite link copied.",
    msg_copy_failed: "Copy failed. Please select and copy the link.",
    error_passcode_required: "Passcode required.",
    error_name_not_allowed: "Name not allowed.",
    error_join_failed: "Unable to join. Check passcode or name.",
  },
  zh: {
    app_name: "惟谨家庭",
    status_offline: "离线",
    status_connecting: "连接中...",
    status_connected: "已连接",
    status_error: "连接错误",
    join_title: "家庭房间",
    label_name: "姓名",
    label_room: "房间",
    label_passcode: "口令",
    label_you: "你",
    panel_video: "视频",
    panel_chat: "聊天",
    placeholder_name: "你的名字",
    placeholder_room: "家庭房间",
    placeholder_passcode: "家庭口令",
    join_button: "进入",
    join_hint: "此设备只需填写一次名字。",
    invite_title: "邀请家人",
    invite_copy: "复制",
    invite_share: "分享",
    invite_include_passcode: "包含口令",
    invite_qr_hint: "二维码基于邀请链接生成。",
    chat_placeholder: "输入消息",
    send_button: "发送",
    mic_mute: "静音",
    mic_unmute: "取消静音",
    cam_off: "关闭摄像头",
    cam_on: "打开摄像头",
    leave: "离开",
    msg_connected_room: "已连接到房间。",
    msg_disconnected: "连接已断开。",
    msg_joined: "{name} 加入了。",
    msg_left: "有人离开了。",
    msg_media_unsupported: "当前浏览器不支持音视频设备。",
    msg_media_denied: "未允许摄像头/麦克风权限。",
    msg_invite_copied: "邀请链接已复制。",
    msg_copy_failed: "复制失败，请手动选择复制链接。",
    error_passcode_required: "需要口令。",
    error_name_not_allowed: "该名字不允许使用。",
    error_join_failed: "无法加入，请检查口令或名字。",
  },
};

const state = {
  ws: null,
  selfId: null,
  name: null,
  room: null,
  passcode: "",
  localStream: null,
  micEnabled: true,
  camEnabled: true,
  peers: new Map(),
  connecting: false,
  configLoaded: false,
  passcodeRequired: false,
  allowedNames: null,
  maxPeers: 4,
  iceServers: [{ urls: DEFAULT_STUN_URLS }],
  lang: "en",
  statusKey: "status_offline",
  joinErrorKey: "",
};

function setStatus(text) {
  if (!statusEl) return;
  const textEl = statusEl.querySelector(".status-text");
  if (textEl) {
    textEl.textContent = text;
  } else {
    statusEl.textContent = text;
  }
}

function t(key, vars) {
  const dict = i18n[state.lang] || i18n.en;
  let value = dict[key] || i18n.en[key] || key;
  if (vars) {
    value = value.replace(/\{(\w+)\}/g, (match, name) =>
      Object.prototype.hasOwnProperty.call(vars, name) ? vars[name] : match,
    );
  }
  return value;
}

function setStatusKey(key) {
  state.statusKey = key;
  if (statusEl) {
    statusEl.dataset.state = key;
  }
  setStatus(t(key));
}

function setJoinErrorText(text) {
  if (!joinError) return;
  if (!text) {
    joinError.textContent = "";
    joinError.hidden = true;
    return;
  }
  joinError.textContent = text;
  joinError.hidden = false;
}

function setJoinErrorKey(key) {
  state.joinErrorKey = key || "";
  setJoinErrorText(key ? t(key) : "");
}

function updateLangButtons() {
  if (langZhBtn) {
    langZhBtn.classList.toggle("active", state.lang === "zh");
  }
  if (langEnBtn) {
    langEnBtn.classList.toggle("active", state.lang === "en");
  }
}

function updateDynamicLabels() {
  updateLangButtons();
  if (toggleMicBtn) {
    toggleMicBtn.textContent = state.micEnabled
      ? t("mic_mute")
      : t("mic_unmute");
  }
  if (toggleCamBtn) {
    toggleCamBtn.textContent = state.camEnabled ? t("cam_off") : t("cam_on");
  }
  if (shareInviteBtn) {
    if (!navigator.share) {
      shareInviteBtn.textContent = t("invite_copy");
    } else {
      shareInviteBtn.textContent = t("invite_share");
    }
  }
  setStatus(t(state.statusKey));
  if (state.joinErrorKey) {
    setJoinErrorText(t(state.joinErrorKey));
  }
}

function updateText() {
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.dataset.i18n;
    if (!key) return;
    el.textContent = t(key);
  });
  document
    .querySelectorAll("[data-i18n-placeholder]")
    .forEach((el) => {
      const key = el.dataset.i18nPlaceholder;
      if (!key) return;
      el.setAttribute("placeholder", t(key));
    });
  updateLangButtons();
  updateDynamicLabels();
}

function detectLang() {
  const params = new URLSearchParams(window.location.search);
  const fromUrl = params.get("lang");
  if (fromUrl && i18n[fromUrl]) return fromUrl;
  const stored = localStorage.getItem("lang");
  if (stored && i18n[stored]) return stored;
  return navigator.language && navigator.language.startsWith("zh")
    ? "zh"
    : "en";
}

function setLang(lang) {
  state.lang = i18n[lang] ? lang : "en";
  localStorage.setItem("lang", state.lang);
  document.documentElement.lang = state.lang === "zh" ? "zh-Hans" : "en";
  updateText();
  renderParticipants();
}

function updateAccessUI() {
  const showSetup = params.get("setup") === "1";
  if (passcodeField && passcodeInput) {
    passcodeField.hidden = !showSetup;
    passcodeInput.required = false;
  }
  if (roomField) {
    roomField.hidden = !showSetup;
  }

  if (includePasscodeCheckbox) {
    includePasscodeCheckbox.checked = state.passcodeRequired || hasPrefillPass;
  }

  if (nameOptions) {
    nameOptions.innerHTML = "";
    if (Array.isArray(state.allowedNames) && state.allowedNames.length) {
      for (const name of state.allowedNames) {
        const option = document.createElement("option");
        option.value = name;
        nameOptions.appendChild(option);
      }
    }
  }

  if (nameHint) {
    if (Array.isArray(state.allowedNames) && state.allowedNames.length) {
      nameHint.textContent = `Allowed names: ${state.allowedNames.join(", ")}`;
      nameHint.hidden = false;
    } else {
      nameHint.textContent = "";
      nameHint.hidden = true;
    }
  }
}

function buildInviteLink(includePasscode) {
  const room = state.room || (roomInput ? roomInput.value.trim() : "family");
  const passcode =
    state.passcode || (passcodeInput ? passcodeInput.value.trim() : "");

  const url = new URL(window.location.href);
  url.pathname = "/";
  url.search = "";
  url.hash = "";
  url.searchParams.set("room", room || "family");
  if (includePasscode && passcode) {
    url.searchParams.set("pass", passcode);
  }
  return url.toString();
}

function updateInvite() {
  if (!invitePanel || !inviteLink) return;
  const hasPasscode = Boolean(state.passcode);
  if (includePasscodeCheckbox) {
    includePasscodeCheckbox.disabled = !hasPasscode;
    if (!hasPasscode) includePasscodeCheckbox.checked = false;
  }
  const includePass =
    includePasscodeCheckbox && includePasscodeCheckbox.checked;
  const link = buildInviteLink(includePass);
  inviteLink.value = link;
  if (inviteQr) {
    const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
      link,
    )}`;
    inviteQr.src = qrSrc;
  }
}

async function copyInvite() {
  if (!inviteLink) return;
  updateInvite();
  const link = inviteLink.value;
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(link);
    } else {
      inviteLink.focus();
      inviteLink.select();
      document.execCommand("copy");
    }
    addSystemMessage(t("msg_invite_copied"));
  } catch {
    addSystemMessage(t("msg_copy_failed"));
  }
}

async function shareInvite() {
  if (!inviteLink) return;
  updateInvite();
  const link = inviteLink.value;
  if (navigator.share) {
    try {
      await navigator.share({ title: "Family Comms", url: link });
      return;
    } catch {
      // Fall through to copy.
    }
  }
  await copyInvite();
}

function loadProfile() {
  const storedName = localStorage.getItem(STORAGE_KEYS.name) || "";
  const storedRoom = localStorage.getItem(STORAGE_KEYS.room) || "family";
  if (nameInput && !nameInput.value) {
    nameInput.value = storedName;
  }
  if (roomInput && (!roomInput.value || roomInput.value === "family")) {
    roomInput.value = storedRoom || "family";
  }
  return { storedName: storedName.trim(), storedRoom: storedRoom.trim() };
}

function saveProfile() {
  if (state.name) {
    localStorage.setItem(STORAGE_KEYS.name, state.name);
  }
  if (state.room) {
    localStorage.setItem(STORAGE_KEYS.room, state.room);
  }
}

function clearProfile() {
  localStorage.removeItem(STORAGE_KEYS.name);
  localStorage.removeItem(STORAGE_KEYS.room);
}

async function loadConfig() {
  try {
    const res = await fetch("/config", { cache: "no-store" });
    if (!res.ok) return;
    const data = await res.json();

    state.passcodeRequired = Boolean(data.passcodeRequired);
    if (Array.isArray(data.allowedNames) && data.allowedNames.length) {
      state.allowedNames = data.allowedNames;
    } else {
      state.allowedNames = null;
    }
    const maxPeers = Number(data.maxPeers);
    if (Number.isFinite(maxPeers) && maxPeers > 0) {
      state.maxPeers = maxPeers;
    }

    const iceServers = [];
    const stunUrls =
      Array.isArray(data.stunUrls) && data.stunUrls.length
        ? data.stunUrls
        : DEFAULT_STUN_URLS;
    if (stunUrls.length) {
      iceServers.push({ urls: stunUrls });
    }

    if (
      data.turn &&
      Array.isArray(data.turn.urls) &&
      data.turn.urls.length &&
      data.turn.username &&
      data.turn.credential
    ) {
      iceServers.push({
        urls: data.turn.urls,
        username: data.turn.username,
        credential: data.turn.credential,
      });
    }

    if (iceServers.length) {
      state.iceServers = iceServers;
    }
    state.configLoaded = true;
    updateAccessUI();
    updateInvite();
    updateParticipantCount();
    updateText();
} catch {
    // Ignore config fetch errors and keep defaults.
  }
}

function addSystemMessage(text) {
  const item = document.createElement("div");
  item.className = "message";
  const body = document.createElement("div");
  body.textContent = text;
  item.appendChild(body);
  messagesEl.appendChild(item);
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

function addChatMessage({ name, text, ts, self }) {
  const item = document.createElement("div");
  item.className = `message${self ? " self" : ""}`;
  const time = ts ? new Date(ts).toLocaleTimeString() : "";
  const body = document.createElement("div");
  body.textContent = text;
  const meta = document.createElement("div");
  meta.className = "meta";
  meta.textContent = `${name}${time ? ` - ${time}` : ""}`;
  item.appendChild(body);
  item.appendChild(meta);
  messagesEl.appendChild(item);
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

function updateParticipantCount() {
  if (!participantCountEl) return;
  const base = state.name ? 1 : 0;
  const total = base + state.peers.size;
  participantCountEl.textContent = `${total}/${state.maxPeers}`;
}

function renderParticipants() {
  participantsEl.innerHTML = "";
  const pills = [];
  if (state.name) {
    pills.push({
      id: state.selfId || "self",
      name: `${state.name} (${t("label_you")})`,
    });
  }
  for (const peer of state.peers.values()) {
    pills.push({ id: peer.id, name: peer.name });
  }
  for (const pill of pills) {
    const el = document.createElement("div");
    el.className = "participant-pill";
    el.textContent = pill.name;
    participantsEl.appendChild(el);
  }
  updateParticipantCount();
}

function createRemoteTile(peer) {
  const tile = document.createElement("div");
  tile.className = "video-tile";
  tile.dataset.peerId = peer.id;

  const video = document.createElement("video");
  video.autoplay = true;
  video.playsInline = true;
  video.srcObject = peer.stream;

  const label = document.createElement("div");
  label.className = "label";
  label.textContent = peer.name || "Guest";

  tile.appendChild(video);
  tile.appendChild(label);
  videoGrid.appendChild(tile);

  peer.videoEl = video;
  peer.tileEl = tile;
}

function removeRemoteTile(peerId) {
  const peer = state.peers.get(peerId);
  if (!peer) return;
  if (peer.tileEl && peer.tileEl.parentElement) {
    peer.tileEl.parentElement.removeChild(peer.tileEl);
  }
}

function clearRemoteTiles() {
  for (const peerId of state.peers.keys()) {
    removeRemoteTile(peerId);
  }
}

async function startLocalMedia() {
  if (state.localStream) return state.localStream;

  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    addSystemMessage(t("msg_media_unsupported"));
    toggleMicBtn.disabled = true;
    toggleCamBtn.disabled = true;
    return null;
  }

  try {
  const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: { facingMode: "user" },
    });
    state.localStream = stream;
    localVideo.srcObject = stream;
    state.micEnabled = true;
    state.camEnabled = true;
    updateDynamicLabels();
    return stream;
  } catch (error) {
    addSystemMessage(t("msg_media_denied"));
    toggleMicBtn.disabled = true;
    toggleCamBtn.disabled = true;
    return null;
  }
}

function attachLocalTracks(pc) {
  if (!state.localStream) return;
  for (const track of state.localStream.getTracks()) {
    pc.addTrack(track, state.localStream);
  }
}

function ensurePeer(id, name) {
  if (state.peers.has(id)) {
    const existing = state.peers.get(id);
    if (name && existing.name !== name) {
      existing.name = name;
      if (existing.tileEl) {
        const label = existing.tileEl.querySelector(".label");
        if (label) label.textContent = name;
      }
    }
    return existing;
  }

  const pc = new RTCPeerConnection({ iceServers: state.iceServers });
  const remoteStream = new MediaStream();
  const peer = { id, name: name || "Guest", pc, stream: remoteStream };

  attachLocalTracks(pc);

  pc.ontrack = (event) => {
    if (event.streams && event.streams[0]) {
      for (const track of event.streams[0].getTracks()) {
        remoteStream.addTrack(track);
      }
    } else if (event.track) {
      remoteStream.addTrack(event.track);
    }
  };

  pc.onicecandidate = (event) => {
    if (event.candidate) {
      sendSignal(id, { type: "candidate", candidate: event.candidate });
    }
  };

  pc.onconnectionstatechange = () => {
    if (pc.connectionState === "failed") {
      if (pc.restartIce) pc.restartIce();
    }
  };

  state.peers.set(id, peer);
  createRemoteTile(peer);
  renderParticipants();
  return peer;
}

async function createOffer(id) {
  const peer = ensurePeer(id);
  const offer = await peer.pc.createOffer();
  await peer.pc.setLocalDescription(offer);
  sendSignal(id, peer.pc.localDescription);
}

async function handleSignal({ from, data }) {
  if (!from || !data) return;
  const peer = ensurePeer(from);

  if (data.type === "offer") {
    await peer.pc.setRemoteDescription(new RTCSessionDescription(data));
    const answer = await peer.pc.createAnswer();
    await peer.pc.setLocalDescription(answer);
    sendSignal(from, peer.pc.localDescription);
    return;
  }

  if (data.type === "answer") {
    await peer.pc.setRemoteDescription(new RTCSessionDescription(data));
    return;
  }

  if (data.type === "candidate" && data.candidate) {
    try {
      await peer.pc.addIceCandidate(data.candidate);
    } catch (error) {
      console.warn("ICE candidate error", error);
    }
  }
}

function sendSignal(to, data) {
  if (!state.ws || state.ws.readyState !== WebSocket.OPEN) return;
  state.ws.send(JSON.stringify({ type: "signal", to, data }));
}

function sendChat(text) {
  if (!state.ws || state.ws.readyState !== WebSocket.OPEN) return;
  state.ws.send(JSON.stringify({ type: "chat", text }));
}

function connectWebSocket() {
  const url = new URL("/ws", window.location.href);
  url.searchParams.set("room", state.room);
  url.searchParams.set("name", state.name);
  if (state.passcode) {
    url.searchParams.set("pass", state.passcode);
  }

  url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
  const wsUrl = url.toString();
  const ws = new WebSocket(wsUrl);
  state.ws = ws;

  ws.onopen = () => {
    setStatusKey("status_connected");
  };

  ws.onclose = () => {
    if (state.ws !== ws) return;
    const wasConnecting = state.connecting;
    const hadJoined = state.selfId !== null;
    leaveRoom();
    if (wasConnecting && !hadJoined) {
      setJoinErrorKey("error_join_failed");
    } else {
      addSystemMessage(t("msg_disconnected"));
    }
  };

  ws.onerror = () => {
    setStatusKey("status_error");
  };

  ws.onmessage = async (event) => {
    const data = JSON.parse(event.data);

    switch (data.type) {
      case "welcome": {
        state.selfId = data.id;
        addSystemMessage(t("msg_connected_room"));
        state.connecting = false;
        saveProfile();
        renderParticipants();
        if (invitePanel) {
          invitePanel.hidden = false;
          invitePanel.open = false;
        }
        updateInvite();
        for (const peer of data.peers || []) {
          ensurePeer(peer.id, peer.name);
          await createOffer(peer.id);
        }
        return;
      }
      case "peer-joined": {
        if (data.id === state.selfId) return;
        ensurePeer(data.id, data.name);
        addSystemMessage(t("msg_joined", { name: data.name }));
        return;
      }
      case "peer-left": {
        if (!data.id) return;
        const peer = state.peers.get(data.id);
        if (peer) {
          peer.pc.close();
          removeRemoteTile(data.id);
          state.peers.delete(data.id);
          renderParticipants();
          addSystemMessage(t("msg_left"));
        }
        return;
      }
      case "peer-renamed": {
        ensurePeer(data.id, data.name);
        renderParticipants();
        return;
      }
      case "chat": {
        addChatMessage({
          name: data.name || "Guest",
          text: data.text,
          ts: data.ts,
          self: data.id === state.selfId,
        });
        return;
      }
      case "signal": {
        await handleSignal(data);
        return;
      }
      default:
        break;
    }
  };
}

async function joinRoom() {
  if (state.connecting) return;
  setJoinErrorKey("");
  state.connecting = true;
  joinBtn.disabled = true;

  if (!state.configLoaded) {
    await loadConfig();
  }

  state.name = (nameInput.value || "Guest").trim().slice(0, 32);
  state.room = (roomInput.value || "family").trim().slice(0, 64);
  state.passcode = FIXED_PASSCODE;
  state.selfId = null;

  if (state.passcodeRequired && !state.passcode) {
    setJoinErrorKey("error_passcode_required");
    joinBtn.disabled = false;
    state.connecting = false;
    return;
  }

  if (Array.isArray(state.allowedNames) && state.allowedNames.length) {
    const isAllowed = state.allowedNames.some(
      (name) => name.toLowerCase() === state.name.toLowerCase(),
    );
    if (!isAllowed) {
      setJoinErrorKey("error_name_not_allowed");
      joinBtn.disabled = false;
      state.connecting = false;
      return;
    }
  }

  await startLocalMedia();

  joinPanel.hidden = true;
  mainLayout.hidden = false;
  setStatusKey("status_connecting");

  connectWebSocket();
}

function leaveRoom() {
  if (state.ws) {
    if (state.ws.readyState !== WebSocket.CLOSED) {
      state.ws.close();
    }
    state.ws = null;
  }
  for (const peer of state.peers.values()) {
    peer.pc.close();
  }
  clearRemoteTiles();
  state.peers.clear();
  renderParticipants();

  if (state.localStream) {
    for (const track of state.localStream.getTracks()) {
      track.stop();
    }
    state.localStream = null;
    localVideo.srcObject = null;
  }

  setStatusKey("status_offline");
  joinPanel.hidden = false;
  mainLayout.hidden = true;
  joinBtn.disabled = false;
  state.connecting = false;
  state.selfId = null;
  state.passcode = FIXED_PASSCODE;
  if (passcodeInput) passcodeInput.value = "";
  setJoinErrorKey("");
  if (invitePanel) {
    invitePanel.hidden = true;
  }
  if (inviteLink) inviteLink.value = "";
  if (inviteQr) inviteQr.src = "";
}

function toggleMic() {
  if (!state.localStream) return;
  state.micEnabled = !state.micEnabled;
  for (const track of state.localStream.getAudioTracks()) {
    track.enabled = state.micEnabled;
  }
  updateDynamicLabels();
}

function toggleCam() {
  if (!state.localStream) return;
  state.camEnabled = !state.camEnabled;
  for (const track of state.localStream.getVideoTracks()) {
    track.enabled = state.camEnabled;
  }
  updateDynamicLabels();
}

const params = new URLSearchParams(window.location.search);
if (params.get("reset") === "1") {
  clearProfile();
}
const urlRoom = params.get("room");
if (urlRoom && roomInput) roomInput.value = urlRoom.slice(0, 64);
const urlName = params.get("name");
if (urlName && nameInput) nameInput.value = urlName.slice(0, 32);

setLang(detectLang());
const stored = loadProfile();
loadConfig();
updateText();

if (stored.storedName) {
  joinRoom();
}

joinBtn.addEventListener("click", () => {
  joinRoom();
});

if (nameInput) {
  nameInput.addEventListener("input", () => setJoinErrorKey(""));
}

if (passcodeInput) {
  passcodeInput.addEventListener("input", () => {
    setJoinErrorKey("");
    updateInvite();
  });
}

if (roomInput) {
  roomInput.addEventListener("input", () => {
    updateInvite();
  });
}

if (langZhBtn) {
  langZhBtn.addEventListener("click", () => setLang("zh"));
}

if (langEnBtn) {
  langEnBtn.addEventListener("click", () => setLang("en"));
}

toggleMicBtn.addEventListener("click", toggleMic);

toggleCamBtn.addEventListener("click", toggleCam);

leaveBtn.addEventListener("click", leaveRoom);

if (includePasscodeCheckbox) {
  includePasscodeCheckbox.addEventListener("change", () => {
    updateInvite();
  });
}

if (copyInviteBtn) {
  copyInviteBtn.addEventListener("click", () => {
    copyInvite();
  });
}

if (shareInviteBtn) {
  shareInviteBtn.addEventListener("click", () => {
    shareInvite();
  });
}

chatForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const text = chatInput.value.trim();
  if (!text) return;
  sendChat(text);
  chatInput.value = "";
});

window.addEventListener("beforeunload", () => {
  if (state.ws && state.ws.readyState === WebSocket.OPEN) {
    state.ws.close();
  }
});

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/sw.js").catch(() => {});
}
