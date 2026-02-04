# 惟谨家庭 / Family Comms (Cloudflare Workers)

中文说明与英文说明都在本文件中，界面支持中英切换。

This README includes both Chinese and English sections, and the UI supports
bilingual switching.

## 中文说明

惟谨家庭是一个 4 人家庭通讯站，支持文字聊天、语音和视频通话。

### 功能
- WebRTC 语音/视频（最多 4 人）
- Durable Objects + WebSocket 信令
- 房间口令/白名单（可选）
- 单名字单设备限制
- 手机浏览器适配 + PWA
- 中英文界面切换（右上角）

### 本地开发
1. 安装 Wrangler
2. 运行 `wrangler dev`
3. 多个设备访问同一房间名

### 语言切换
右上角切换语言，或使用 `?lang=zh` / `?lang=en`。

### 部署到 Cloudflare Workers
1. 运行 `wrangler deploy`
2. `wrangler.toml` 已配置 `call.qxyx.net/*` 路由，请确保该域名在你的
   Cloudflare 账号下
3. 在 Cloudflare 控制台绑定自定义域名 `call.qxyx.net`

### 访问控制（可选）
- `ROOM_PASSCODE`：进入房间的口令
- `ALLOWED_NAMES`：允许的名字列表（逗号分隔，不设置则不限制）

本地 `.dev.vars`：
```
ROOM_PASSCODE=Sr@20050829
ALLOWED_NAMES=weijin,sunran,gyl,syx
```

线上 Secret：
```
wrangler secret put ROOM_PASSCODE
wrangler secret put ALLOWED_NAMES
```

### 默认直达房间
- 页面会记住名字，之后打开 `call.qxyx.net` 会自动进入房间
- 如需重置名字：访问 `call.qxyx.net/?reset=1`
- 如需显示房间/口令输入：访问 `call.qxyx.net/?setup=1`

### 离线呼叫通知（Web Push）
说明：
- iPhone 需要 **添加到主屏幕的 PWA** 才能接收通知（iOS 16.4+）
- 需要配置 VAPID 密钥
 - 进入房间后点击 “开启通知”

生成 VAPID 密钥（推荐用 Node）：
```
node -e "const crypto=require('crypto').webcrypto;const b64u=b=>Buffer.from(b).toString('base64').replace(/\\+/g,'-').replace(/\\//g,'_').replace(/=+$/,'');(async()=>{const k=await crypto.subtle.generateKey({name:'ECDSA',namedCurve:'P-256'},true,['sign','verify']);const pub=await crypto.subtle.exportKey('raw',k.publicKey);const jwk=await crypto.subtle.exportKey('jwk',k.privateKey);console.log('VAPID_PUBLIC_KEY='+b64u(new Uint8Array(pub)));console.log('VAPID_PRIVATE_KEY='+jwk.d);})();"
```

设置 Secret：
```
wrangler secret put VAPID_PUBLIC_KEY
wrangler secret put VAPID_PRIVATE_KEY
wrangler secret put VAPID_SUBJECT
```
`VAPID_SUBJECT` 建议使用 `mailto:you@example.com`

### TURN / ICE（可选）
```
TURN_URLS=turn:turn.example.com:3478?transport=udp,turn:turn.example.com:3478?transport=tcp
TURN_USERNAME=family
TURN_CREDENTIAL=secret
STUN_URLS=stun:stun.l.google.com:19302
```

### GitHub Actions 自动部署
工作流：`.github/workflows/deploy.yml`

需要在 GitHub Secrets 中配置：
- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

默认监听 `main` 分支，可按需修改。

### 邀请二维码
二维码使用公共 QR 图片接口生成，如需避免第三方请求，可移除
`public/index.html` 的 QR 区块，并删除 `public/app.js` 中的相关逻辑。

### Android 打包（TWA）
参见 `twa/README.md`，包含 Bubblewrap 步骤和模板。
已准备：
- 包名：`com.qxyx.weijin`
- `public/.well-known/assetlinks.json` 已生成
- `public/icon-192.png` / `public/icon-512.png` 已生成
- keystore：`twa/keystore.p12`（PKCS12，密码请在本地保存）

## English

Family Comms is a 4-person private family communication site with chat, voice,
and video calling.

### Features
- WebRTC voice/video (mesh up to 4 people)
- Durable Objects + WebSocket signaling
- Optional room passcode and name allowlist
- Single active session per name
- Mobile-friendly UI + PWA
- Bilingual UI (EN/中文 toggle in the top bar)

### Local dev
1. Install Wrangler
2. Run `wrangler dev`
3. Join the same room name on multiple devices

### Language toggle
Use the top-right switch, or append `?lang=zh` / `?lang=en` to the URL.

### Deploy to Cloudflare Workers
1. Run `wrangler deploy`
2. `wrangler.toml` includes route `call.qxyx.net/*` — make sure the domain
   is in your Cloudflare account
3. Bind the custom domain `call.qxyx.net` in Cloudflare

### Access control (optional)
- `ROOM_PASSCODE`: room passcode
- `ALLOWED_NAMES`: comma-separated allowed names (leave empty to allow all)

Local `.dev.vars`:
```
ROOM_PASSCODE=Sr@20050829
ALLOWED_NAMES=weijin,sunran,gyl,syx
```

Production secrets:
```
wrangler secret put ROOM_PASSCODE
wrangler secret put ALLOWED_NAMES
```

### Auto enter room
- The app remembers the name and auto-enters `call.qxyx.net`
- Reset name: `call.qxyx.net/?reset=1`
- Show room/passcode fields: `call.qxyx.net/?setup=1`

### Offline call notifications (Web Push)
Notes:
- iPhone requires **Add to Home Screen** PWA (iOS 16.4+)
- VAPID keys are required
 - Click “Enable notifications” after joining

Generate VAPID keys (Node):
```
node -e "const crypto=require('crypto').webcrypto;const b64u=b=>Buffer.from(b).toString('base64').replace(/\\+/g,'-').replace(/\\//g,'_').replace(/=+$/,'');(async()=>{const k=await crypto.subtle.generateKey({name:'ECDSA',namedCurve:'P-256'},true,['sign','verify']);const pub=await crypto.subtle.exportKey('raw',k.publicKey);const jwk=await crypto.subtle.exportKey('jwk',k.privateKey);console.log('VAPID_PUBLIC_KEY='+b64u(new Uint8Array(pub)));console.log('VAPID_PRIVATE_KEY='+jwk.d);})();"
```

Set secrets:
```
wrangler secret put VAPID_PUBLIC_KEY
wrangler secret put VAPID_PRIVATE_KEY
wrangler secret put VAPID_SUBJECT
```
Use `mailto:you@example.com` for `VAPID_SUBJECT`.

### TURN / ICE (optional)
```
TURN_URLS=turn:turn.example.com:3478?transport=udp,turn:turn.example.com:3478?transport=tcp
TURN_USERNAME=family
TURN_CREDENTIAL=secret
STUN_URLS=stun:stun.l.google.com:19302
```

### GitHub Actions deploy
Workflow: `.github/workflows/deploy.yml`

Required GitHub secrets:
- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

The workflow deploys on pushes to `main`.

### Invite QR
QR uses a public QR image API. To avoid third-party requests, remove the QR
block in `public/index.html` and its logic in `public/app.js`.

### Android packaging (TWA)
See `twa/README.md` for Bubblewrap steps and manifest template.
Prepared:
- Package ID: `com.qxyx.weijin`
- `public/.well-known/assetlinks.json` generated
- `public/icon-192.png` / `public/icon-512.png` generated
- keystore: `twa/keystore.p12` (PKCS12; keep the password locally)
