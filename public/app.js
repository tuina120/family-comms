const statusEl = document.querySelector("#status");
const bodyEl = document.body;
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
const callBtn = document.querySelector("#callBtn");
const participantsEl = document.querySelector("#participants");
const invitePanel = document.querySelector("#invitePanel");
const inviteLink = document.querySelector("#inviteLink");
const copyInviteBtn = document.querySelector("#copyInvite");
const shareInviteBtn = document.querySelector("#shareInvite");
const includePasscodeCheckbox = document.querySelector("#includePasscode");
const inviteQr = document.querySelector("#inviteQr");
const notifyBtn = document.querySelector("#notifyBtn");
const notifyStatus = document.querySelector("#notifyStatus");
const installRow = document.querySelector("#installRow");
const installBtn = document.querySelector("#installBtn");
const installNote = document.querySelector("#installNote");
const callBanner = document.querySelector("#callBanner");
const callBannerText = document.querySelector("#callBannerText");
const callBannerDismiss = document.querySelector("#callBannerDismiss");
const soundBanner = document.querySelector("#soundBanner");
const soundEnableBtn = document.querySelector("#soundEnableBtn");
const messagesEl = document.querySelector("#messages");
const chatForm = document.querySelector("#chatForm");
const chatInput = document.querySelector("#chatInput");
const langZhBtn = document.querySelector("#langZh");
const langEnBtn = document.querySelector("#langEn");

const FIXED_ROOM = "family";
const ADMIN_NAME = "weijin";
const FIXED_PASSCODE = "Sr@20050829";
const CALL_ALERT_DURATION_MS = 60 * 1000;
const CALL_ALERT_INTERVAL_MS = 4000;
const STORAGE_KEYS = {
  name: "fc_name",
  room: "fc_room",
};

const DEFAULT_STUN_URLS = ["stun:stun.l.google.com:19302"];
const FAMILY_NAMES = ["weijin", "sunran", "gyl", "syx"];

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
    call_all_button: "Call all",
    call_button: "Call",
    call_dismiss: "Dismiss",
    sound_hint: "Tap to enable sound.",
    sound_enable: "Enable",
    kick_button: "Remove",
    roster_online: "Online",
    roster_offline: "Wake",
    placeholder_name: "Your name",
    placeholder_room: "Family room",
    placeholder_passcode: "Family code",
    join_button: "Enter",
    join_hint: "Your device will remember this name.",
    allowed_names_hint: "Allowed names: {names}",
    invite_title: "Invite family",
    invite_copy: "Copy",
    invite_share: "Share",
    invite_include_passcode: "Include passcode",
    invite_qr_hint: "QR is generated from the invite link.",
    notify_enable: "Enable notifications",
    notify_enabled: "Notifications enabled",
    notify_denied: "Notifications denied",
    notify_not_supported: "Notifications not supported",
    notify_config_missing: "Notifications not configured",
    notify_saved: "Notifications saved",
    install_button: "Add to Home Screen",
    install_note_android: "Add to Home Screen for quick access",
    install_note_ios:
      "iPhone: Share → Add to Home Screen to create the shortcut.",
    install_note_other: "Use your browser menu to add a desktop shortcut.",
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
    msg_call_sent: "Calling family.",
    msg_call_sent_to: "Calling {name}.",
    msg_no_one_online: "No one else is online right now.",
    msg_incoming_call: "{name} is calling you.",
    msg_kicked: "You were removed by the admin.",
    msg_kicked_duplicate: "You signed in on another device. This device is now offline.",
    msg_kick_sent: "Removed {name}.",
    msg_kick_failed: "Unable to remove {name}.",
    msg_kick_failed_generic: "Unable to remove the user.",
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
    call_all_button: "呼叫全部",
    call_button: "呼叫",
    call_dismiss: "关闭提示",
    sound_hint: "点击开启声音。",
    sound_enable: "开启",
    kick_button: "下线",
    roster_online: "在线",
    roster_offline: "待唤醒",
    placeholder_name: "你的名字",
    placeholder_room: "家庭房间",
    placeholder_passcode: "家庭口令",
    join_button: "进入",
    join_hint: "此设备只需填写一次名字。",
    allowed_names_hint: "仅允许以下名字：{names}",
    invite_title: "邀请家人",
    invite_copy: "复制",
    invite_share: "分享",
    invite_include_passcode: "包含口令",
    invite_qr_hint: "二维码基于邀请链接生成。",
    notify_enable: "开启通知",
    notify_enabled: "已开启通知",
    notify_denied: "通知被拒绝",
    notify_not_supported: "当前不支持通知",
    notify_config_missing: "通知未配置",
    notify_saved: "已保存通知设置",
    install_button: "添加到主屏幕",
    install_note_android: "添加到主屏幕，方便打开。",
    install_note_ios: "iPhone：点击分享 → 添加到主屏幕。",
    install_note_other: "请用浏览器菜单添加桌面快捷方式。",
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
    msg_call_sent: "正在呼叫家人。",
    msg_call_sent_to: "正在呼叫 {name}。",
    msg_no_one_online: "当前没有其他人在线。",
    msg_incoming_call: "{name} 正在呼叫你。",
    msg_kicked: "已被管理员下线。",
    msg_kicked_duplicate: "你已在其他设备登录，本机已下线。",
    msg_kick_sent: "已让 {name} 下线。",
    msg_kick_failed: "无法让 {name} 下线。",
    msg_kick_failed_generic: "无法让对方下线。",
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
  passcode: FIXED_PASSCODE,
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
  vapidPublicKey: null,
  lang: "en",
  statusKey: "status_offline",
  joinErrorKey: "",
  notifyStatusKey: "",
  incomingCallFrom: null,
  callBannerTimer: null,
  callAlertInterval: null,
  callAlertTimeout: null,
  audioUnlocked: false,
  audioContext: null,
};
let deferredInstallPrompt = null;

function canonicalizeName(name) {
  const trimmed = (name || "").trim().slice(0, 32);
  if (!trimmed) return "";
  const match = FAMILY_NAMES.find(
    (entry) => entry.toLowerCase() === trimmed.toLowerCase(),
  );
  return match || trimmed;
}

function isAdminUser(name) {
  return Boolean(name && name.toLowerCase() === ADMIN_NAME);
}

function isIOSDevice() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
}

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

function setNotifyStatus(key) {
  if (!notifyStatus) return;
  state.notifyStatusKey = key || "";
  notifyStatus.textContent = state.notifyStatusKey ? t(state.notifyStatusKey) : "";
}

function showSoundBanner() {
  if (!soundBanner) return;
  if (!state.selfId) return;
  const needsMic =
    state.localStream && state.localStream.getAudioTracks().length === 0;
  if (!isIOSDevice() && !needsMic) return;
  if (state.audioUnlocked && !needsMic) return;
  if (!state.selfId) return;
  soundBanner.hidden = false;
}

function hideSoundBanner() {
  if (soundBanner) soundBanner.hidden = true;
}

async function unlockAudio() {
  hideSoundBanner();
  if (!state.audioUnlocked) {
    state.audioUnlocked = true;
  }
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (AudioCtx) {
      if (!state.audioContext) {
        state.audioContext = new AudioCtx();
      }
      if (state.audioContext.state === "suspended") {
        await state.audioContext.resume();
      }
      const buffer = state.audioContext.createBuffer(1, 1, 22050);
      const src = state.audioContext.createBufferSource();
      src.buffer = buffer;
      src.connect(state.audioContext.destination);
      src.start(0);
    }
  } catch {
    // Ignore audio unlock errors.
  }
  await ensureLocalAudio();
  tryPlayAllRemoteVideos();
  unmuteRemoteVideos();
}

function prepareRemoteVideo(video) {
  if (!video) return;
  if (isIOSDevice() && !state.audioUnlocked) {
    video.muted = true;
  } else {
    video.muted = false;
  }
  video.volume = 1;
}

async function ensureLocalAudio() {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return;
  if (!state.localStream) return;
  const existingTracks = state.localStream.getAudioTracks();
  if (existingTracks.length) {
    for (const track of existingTracks) {
      track.enabled = true;
    }
    state.micEnabled = true;
    updateDynamicLabels();
    return;
  }

  try {
    const audioStream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: false,
    });
    const track = audioStream.getAudioTracks()[0];
    if (!track) return;
    state.localStream.addTrack(track);
    state.micEnabled = true;
    updateDynamicLabels();

    for (const peer of state.peers.values()) {
      const sender = peer.pc
        .getSenders()
        .find((item) => item.track && item.track.kind === "audio");
      if (sender) {
        await sender.replaceTrack(track);
      } else {
        peer.pc.addTrack(track, state.localStream);
        await createOffer(peer.id);
      }
    }
  } catch {
    // Keep silent if mic permission fails.
  }
}

function unmuteRemoteVideos() {
  document.querySelectorAll(".video-tile video").forEach((video) => {
    if (video.id === "localVideo") return;
    video.muted = false;
    video.volume = 1;
    tryPlayVideo(video);
  });
}

function tryPlayVideo(video) {
  if (!video || typeof video.play !== "function") return;
  const result = video.play();
  if (result && typeof result.catch === "function") {
    result.catch(() => {
      showSoundBanner();
    });
  }
}

function tryPlayAllRemoteVideos() {
  document.querySelectorAll(".video-tile video").forEach((video) => {
    if (video.id === "localVideo") return;
    prepareRemoteVideo(video);
    tryPlayVideo(video);
  });
}

function setConnectedUI(connected) {
  if (bodyEl) {
    if (connected) {
      bodyEl.dataset.connected = "1";
    } else {
      delete bodyEl.dataset.connected;
    }
  }
  if (joinPanel) joinPanel.hidden = connected;
  if (mainLayout) mainLayout.hidden = !connected;
  if (!connected) {
    hideSoundBanner();
  }
  updateInstallPrompt();
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
  if (state.notifyStatusKey) {
    setNotifyStatus(state.notifyStatusKey);
  }
  updateInstallPrompt();
  if (callBanner && !callBanner.hidden && state.incomingCallFrom) {
    callBannerText.textContent = t("msg_incoming_call", {
      name: state.incomingCallFrom,
    });
  }
  if (soundBanner) {
    const text = soundBanner.querySelector(".sound-banner-text");
    if (text) text.textContent = t("sound_hint");
  }
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
  updateAccessUI();
  renderParticipants();
}

function updateAccessUI() {
  const showSetup = params.get("setup") === "1";
  const hasPrefillPass = Boolean(passcodeInput && passcodeInput.value);
  if (passcodeField && passcodeInput) {
    passcodeField.hidden = !showSetup;
    passcodeInput.required = false;
  }
  if (roomField) {
    roomField.hidden = !showSetup;
  }
  if (roomInput) {
    roomInput.value = FIXED_ROOM;
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
      nameHint.textContent = t("allowed_names_hint", {
        names: state.allowedNames.join(", "),
      });
      nameHint.hidden = false;
    } else {
      nameHint.textContent = "";
      nameHint.hidden = true;
    }
  }
}

function buildInviteLink(includePasscode) {
  const room = FIXED_ROOM;
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

function base64UrlToUint8Array(base64Url) {
  const padding = "=".repeat((4 - (base64Url.length % 4)) % 4);
  const base64 = (base64Url + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const output = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i += 1) {
    output[i] = raw.charCodeAt(i);
  }
  return output;
}

async function sendSubscription(subscription) {
  if (!state.name) return;
  const res = await fetch(`/subscribe?room=${encodeURIComponent(state.room)}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      name: state.name,
      subscription,
      ua: navigator.userAgent,
    }),
  });
  if (!res.ok) {
    throw new Error("subscribe failed");
  }
}

async function enableNotifications() {
  if (
    !("Notification" in window) ||
    !("serviceWorker" in navigator) ||
    !("PushManager" in window)
  ) {
    setNotifyStatus("notify_not_supported");
    return;
  }
  if (!state.vapidPublicKey) {
    setNotifyStatus("notify_config_missing");
    return;
  }

  let permission = Notification.permission;
  if (permission === "default") {
    permission = await Notification.requestPermission();
  }
  if (permission !== "granted") {
    setNotifyStatus("notify_denied");
    return;
  }

  const reg = await navigator.serviceWorker.ready;
  let subscription = await reg.pushManager.getSubscription();
  if (!subscription) {
    const key = base64UrlToUint8Array(state.vapidPublicKey);
    subscription = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: key,
    });
  }
  await sendSubscription(subscription);
  setNotifyStatus("notify_enabled");
}

async function refreshNotificationStatus() {
  if (
    !("Notification" in window) ||
    !("serviceWorker" in navigator) ||
    !("PushManager" in window)
  ) {
    return;
  }
  if (Notification.permission !== "granted") {
    return;
  }
  const reg = await navigator.serviceWorker.ready;
  const subscription = await reg.pushManager.getSubscription();
  if (subscription) {
    setNotifyStatus("notify_enabled");
  }
}

function updateInstallPrompt() {
  if (!installRow) return;
  if (!state.selfId) {
    installRow.hidden = true;
    return;
  }
  installRow.hidden = false;
  if (deferredInstallPrompt) {
    if (installBtn) {
      installBtn.hidden = false;
      installBtn.disabled = false;
    }
    if (installNote) {
      installNote.textContent = t("install_note_android");
    }
    return;
  }
  if (installBtn) {
    installBtn.hidden = true;
  }
  if (installNote) {
    installNote.textContent = t(isIOSDevice() ? "install_note_ios" : "install_note_other");
  }
}

function loadProfile() {
  const storedNameRaw = localStorage.getItem(STORAGE_KEYS.name) || "";
  const storedName = canonicalizeName(storedNameRaw);
  const storedRoom = FIXED_ROOM;
  if (nameInput && !nameInput.value) {
    nameInput.value = storedName;
  }
  if (roomInput) {
    roomInput.value = storedRoom;
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
    if (data.vapidPublicKey) {
      state.vapidPublicKey = data.vapidPublicKey;
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
  const max = FAMILY_NAMES.length || state.maxPeers;
  participantCountEl.textContent = `${total}/${max}`;
}

function updateNotifyButton() {
  if (!notifyBtn) return;
  notifyBtn.disabled = !state.name;
}

function updateCallButton() {
  if (!callBtn) return;
  callBtn.disabled = !state.selfId;
}

function renderParticipants() {
  participantsEl.innerHTML = "";
  const onlineNames = new Set();
  if (state.name) {
    onlineNames.add(state.name.toLowerCase());
  }
  for (const peer of state.peers.values()) {
    if (peer.name) onlineNames.add(peer.name.toLowerCase());
  }
  const roster = FAMILY_NAMES.map((name) => ({
    name,
    key: name.toLowerCase(),
  }));
  const rosterKeys = new Set(roster.map((item) => item.key));
  const callingKey = state.incomingCallFrom
    ? state.incomingCallFrom.toLowerCase()
    : null;
  const isAdmin = isAdminUser(state.name);

  for (const person of roster) {
    const el = document.createElement("div");
    const isOnline = onlineNames.has(person.key);
    const isSelf = state.name && state.name.toLowerCase() === person.key;
    const isCalling = callingKey && callingKey === person.key;
    el.className = `participant-pill ${isOnline ? "online" : "offline"}${
      isSelf ? " self" : ""
    }${isCalling ? " calling" : ""}`;
    const dot = document.createElement("span");
    dot.className = "participant-dot";
    const label = document.createElement("span");
    label.textContent = isSelf
      ? `${person.name} (${t("label_you")})`
      : person.name;
    const status = document.createElement("span");
    status.className = "participant-status";
    status.textContent = isOnline ? t("roster_online") : t("roster_offline");
    const action = document.createElement("button");
    action.type = "button";
    action.className = "participant-call";
    action.textContent = t("call_button");
    action.disabled = !state.selfId || isSelf;
    action.addEventListener("click", (event) => {
      event.stopPropagation();
      sendCall(person.name);
    });
    let kickBtn = null;
    if (isAdmin && !isSelf) {
      kickBtn = document.createElement("button");
      kickBtn.type = "button";
      kickBtn.className = "participant-kick";
      kickBtn.textContent = t("kick_button");
      kickBtn.disabled = !state.selfId;
      kickBtn.addEventListener("click", (event) => {
        event.stopPropagation();
        sendKick(person.name);
      });
    }
    el.appendChild(dot);
    el.appendChild(label);
    el.appendChild(status);
    el.appendChild(action);
    if (kickBtn) el.appendChild(kickBtn);
    participantsEl.appendChild(el);
  }

  for (const name of onlineNames) {
    if (rosterKeys.has(name)) continue;
    const el = document.createElement("div");
    el.className = "participant-pill online";
    const dot = document.createElement("span");
    dot.className = "participant-dot";
    const label = document.createElement("span");
    label.textContent = name;
    const status = document.createElement("span");
    status.className = "participant-status";
    status.textContent = t("roster_online");
    el.appendChild(dot);
    el.appendChild(label);
    el.appendChild(status);
    participantsEl.appendChild(el);
  }
  updateParticipantCount();
  updateNotifyButton();
  updateCallButton();
}

function createRemoteTile(peer) {
  const tile = document.createElement("div");
  tile.className = "video-tile";
  tile.dataset.peerId = peer.id;

  const video = document.createElement("video");
  video.autoplay = true;
  video.playsInline = true;
  video.setAttribute("playsinline", "");
  video.setAttribute("webkit-playsinline", "");
  prepareRemoteVideo(video);
  video.srcObject = peer.stream;

  const label = document.createElement("div");
  label.className = "label";
  label.textContent = peer.name || "Guest";

  tile.appendChild(video);
  tile.appendChild(label);
  videoGrid.appendChild(tile);

  peer.videoEl = video;
  peer.tileEl = tile;
  tryPlayVideo(video);
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
    for (const track of stream.getAudioTracks()) {
      track.enabled = true;
    }
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
    if (peer.videoEl) {
      tryPlayVideo(peer.videoEl);
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

function sendCall(targetName) {
  if (!state.ws || state.ws.readyState !== WebSocket.OPEN) return;
  const payload = { type: "call" };
  if (targetName) {
    payload.to = targetName;
    addSystemMessage(t("msg_call_sent_to", { name: targetName }));
  } else {
    addSystemMessage(t("msg_call_sent"));
  }
  if (!targetName && state.peers.size === 0) {
    addSystemMessage(t("msg_no_one_online"));
  }
  state.ws.send(JSON.stringify(payload));
}

function sendKick(targetName) {
  if (!state.ws || state.ws.readyState !== WebSocket.OPEN) return;
  const payload = { type: "kick", name: targetName };
  state.ws.send(JSON.stringify(payload));
  addSystemMessage(t("msg_kick_sent", { name: targetName }));
}

function playRing() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;
    const gains = [];
    for (let i = 0; i < 3; i += 1) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = 740;
      const start = now + i * 0.45;
      const end = start + 0.2;
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(0.3, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, end);
      osc.connect(gain).connect(ctx.destination);
      osc.start(start);
      osc.stop(end + 0.02);
      gains.push(gain);
    }
    setTimeout(() => ctx.close(), 1500);
  } catch {
    // Ignore audio playback errors.
  }
}

function showCallBanner(name) {
  if (!callBanner || !callBannerText) return;
  callBannerText.textContent = t("msg_incoming_call", { name });
  callBanner.hidden = false;
  if (state.callBannerTimer) {
    clearTimeout(state.callBannerTimer);
  }
  state.callBannerTimer = setTimeout(() => {
    hideCallBanner();
  }, CALL_ALERT_DURATION_MS);
}

function hideCallBanner() {
  stopCallAlert();
  if (callBanner) callBanner.hidden = true;
  if (state.callBannerTimer) {
    clearTimeout(state.callBannerTimer);
    state.callBannerTimer = null;
  }
  if (state.incomingCallFrom) {
    state.incomingCallFrom = null;
    renderParticipants();
  }
}

function startCallAlert(name) {
  stopCallAlert();
  showCallBanner(name);
  playRing();
  if (navigator.vibrate) {
    navigator.vibrate([300, 150, 300, 150, 500]);
  }
  state.callAlertInterval = setInterval(() => {
    playRing();
    if (navigator.vibrate) {
      navigator.vibrate([300, 150, 300, 150, 500]);
    }
  }, CALL_ALERT_INTERVAL_MS);
  state.callAlertTimeout = setTimeout(() => {
    hideCallBanner();
  }, CALL_ALERT_DURATION_MS);
}

function stopCallAlert() {
  if (state.callAlertInterval) {
    clearInterval(state.callAlertInterval);
    state.callAlertInterval = null;
  }
  if (state.callAlertTimeout) {
    clearTimeout(state.callAlertTimeout);
    state.callAlertTimeout = null;
  }
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
        state.connecting = false;
        setConnectedUI(true);
        saveProfile();
        renderParticipants();
        if (invitePanel) {
          invitePanel.hidden = false;
          invitePanel.open = false;
        }
        updateInvite();
        if (messagesEl) {
          messagesEl.innerHTML = "";
        }
        if (Array.isArray(data.history)) {
          for (const item of data.history) {
            if (!item || !item.text) continue;
            addChatMessage({
              name: item.name || "Guest",
              text: item.text,
              ts: item.ts,
              self: item.id === state.selfId,
            });
          }
        }
        addSystemMessage(t("msg_connected_room"));
        showSoundBanner();
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
      case "call": {
        const fromName = data.name || "Family";
        addSystemMessage(t("msg_incoming_call", { name: fromName }));
        state.incomingCallFrom = fromName;
        renderParticipants();
        startCallAlert(fromName);
        return;
      }
      case "kicked": {
        if (data.reason === "duplicate") {
          addSystemMessage(t("msg_kicked_duplicate"));
        } else {
          addSystemMessage(t("msg_kicked"));
        }
        leaveRoom();
        return;
      }
      case "error": {
        if (data.code === "kick_not_online") {
          const name = data.name || "";
          if (name) {
            addSystemMessage(t("msg_kick_failed", { name }));
          } else {
            addSystemMessage(t("msg_kick_failed_generic"));
          }
          return;
        }
        if (data.message) {
          addSystemMessage(data.message);
        }
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

  state.name = canonicalizeName(
    (nameInput.value || "Guest").trim().slice(0, 32),
  );
  if (nameInput) nameInput.value = state.name;
  state.room = FIXED_ROOM;
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

  setConnectedUI(true);
  setStatusKey("status_connecting");

  connectWebSocket();
}

function leaveRoom() {
  stopCallAlert();
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
  setConnectedUI(false);
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
const urlName = params.get("name");
if (urlName && nameInput) nameInput.value = urlName.slice(0, 32);

setLang(detectLang());
const stored = loadProfile();
loadConfig();
updateText();
updateNotifyButton();
updateCallButton();
refreshNotificationStatus();
setConnectedUI(false);

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

if (notifyBtn) {
  notifyBtn.addEventListener("click", () => {
    enableNotifications().catch(() => {
      setNotifyStatus("notify_config_missing");
    });
  });
}

if (callBtn) {
  callBtn.addEventListener("click", () => {
    sendCall();
  });
}

if (callBannerDismiss) {
  callBannerDismiss.addEventListener("click", () => {
    hideCallBanner();
  });
}

if (soundEnableBtn) {
  const handler = () => {
    unlockAudio();
  };
  soundEnableBtn.addEventListener("click", handler);
  soundEnableBtn.addEventListener("touchend", handler);
  soundEnableBtn.addEventListener("pointerup", handler);
}

document.addEventListener(
  "click",
  () => {
    unlockAudio();
  },
  { once: true },
);

if (soundBanner) {
  soundBanner.addEventListener("click", () => {
    unlockAudio();
  });
}

window.addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault();
  deferredInstallPrompt = event;
  updateInstallPrompt();
});

if (installBtn) {
  installBtn.addEventListener("click", async () => {
    if (!deferredInstallPrompt) return;
    deferredInstallPrompt.prompt();
    try {
      await deferredInstallPrompt.userChoice;
    } catch {
      // Ignore userChoice errors.
    }
    deferredInstallPrompt = null;
    updateInstallPrompt();
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
