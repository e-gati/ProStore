const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const { autoUpdater } = require("electron-updater");
const path       = require("path");
const https      = require("https");
const http       = require("http");
const os         = require("os");
const fs         = require("fs");
const forge = require("node-forge");

// ── Един единствен инстанс ────────────────────────────────────────────────────
const gotLock = app.requestSingleInstanceLock();
if (!gotLock) { app.quit(); process.exit(0); }

// ── Скрий командния ред при Windows (без конзола) ─────────────────────────────
if (process.platform === "win32") {
  app.commandLine.appendSwitch("disable-renderer-backgrounding");
}

// ── GPU оптимизации ───────────────────────────────────────────────────────────
app.commandLine.appendSwitch("enable-gpu-rasterization");
app.commandLine.appendSwitch("enable-zero-copy");

// ── Глобални референции (не ги оставяй на GC) ────────────────────────────────
let mainWin   = null;
let splashWin = null;

// ── Локален HTTPS сървър за баркод от телефон ─────────────────────────────────
let barcodeServer = null;
let serverInfo    = null;

function getLocalIP() {
  const ifaces = os.networkInterfaces();
  for (const name of Object.keys(ifaces)) {
    for (const iface of ifaces[name]) {
      if (iface.family === "IPv4" && !iface.internal) return iface.address;
    }
  }
  return "127.0.0.1";
}

// ── Генерира self-signed сертификат с node-forge (без openssl) ──────────────
function ensureCert() {
  const certDir  = path.join(app.getPath("userData"), "certs");
  const keyFile  = path.join(certDir, "server.key");
  const certFile = path.join(certDir, "server.crt");

  if (!fs.existsSync(certDir)) fs.mkdirSync(certDir, { recursive: true });

  if (!fs.existsSync(keyFile) || !fs.existsSync(certFile)) {
    try {
      // Генерирай RSA ключова двойка
      const keys = forge.pki.rsa.generateKeyPair(2048);
      const cert = forge.pki.createCertificate();
      cert.publicKey = keys.publicKey;
      cert.serialNumber = "01";
      cert.validity.notBefore = new Date();
      cert.validity.notAfter  = new Date();
      cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 10);
      const attrs = [{ name:"commonName", value:"ProStore" }];
      cert.setSubject(attrs);
      cert.setIssuer(attrs);
      cert.sign(keys.privateKey, forge.md.sha256.create());

      fs.writeFileSync(keyFile,  forge.pki.privateKeyToPem(keys.privateKey));
      fs.writeFileSync(certFile, forge.pki.certificateToPem(cert));
      console.log("[ProStore] Сертификат генериран в:", certDir);
    } catch (e) {
      console.error("forge грешка:", e.message);
      return null;
    }
  }

  try {
    return {
      key:  fs.readFileSync(keyFile),
      cert: fs.readFileSync(certFile),
    };
  } catch (e) {
    console.error("Четене на cert грешка:", e.message);
    return null;
  }
}

function startBarcodeServer() {
  const credentials = ensureCert();

  const handler = (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") { res.writeHead(204); res.end(); return; }

    if (req.method === "POST" && req.url === "/barcode") {
      let body = "";
      req.on("data", chunk => (body += chunk));
      req.on("end", () => {
        try {
          const { code } = JSON.parse(body);
          if (code && mainWin) {
            mainWin.webContents.send("barcode-scanned", code);
          }
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ ok: true }));
        } catch {
          res.writeHead(400); res.end("Bad Request");
        }
      });
      return;
    }

    if (req.method === "GET" && req.url === "/") {
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      res.end(mobileScannerHTML());
      return;
    }

    // Телефонът се свърза — затвори QR модала в React
    if (req.method === "POST" && req.url === "/ping") {
      if (mainWin) mainWin.webContents.send("phone-connected");
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ ok: true }));
      return;
    }

    res.writeHead(404); res.end("Not found");
  };

  // Ако имаме сертификат — HTTPS, иначе fallback към HTTP
  if (credentials) {
    barcodeServer = https.createServer(credentials, handler);
    barcodeServer.listen(0, "0.0.0.0", () => {
      const port = barcodeServer.address().port;
      const ip   = getLocalIP();
      serverInfo = { ip, port, url: `https://${ip}:${port}`, secure: true };
      console.log(`[ProStore] HTTPS сървър: https://${ip}:${port}`);
    });
  } else {
    // Fallback към HTTP ако openssl не е наличен
    barcodeServer = http.createServer(handler);
    barcodeServer.listen(0, "0.0.0.0", () => {
      const port = barcodeServer.address().port;
      const ip   = getLocalIP();
      serverInfo = { ip, port, url: `http://${ip}:${port}`, secure: false };
      console.log(`[ProStore] HTTP сървър (без SSL): http://${ip}:${port}`);
    });
  }
}

// ── Splash прозорец ───────────────────────────────────────────────────────────
function createSplash() {
  splashWin = new BrowserWindow({
    width:  400,
    height: 300,
    frame:       false,
    transparent: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable:   false,
    webPreferences: { nodeIntegration: false, contextIsolation: true },
  });
  splashWin.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(splashHTML())}`);
  splashWin.center();
}

// ── Главен прозорец ───────────────────────────────────────────────────────────
function createMainWindow() {
  mainWin = new BrowserWindow({
    show:            false,
    backgroundColor: "#f0f0f0",
    width:   1400,
    height:  860,
    minWidth:  900,
    minHeight: 600,
    icon: path.join(__dirname, "assets", "icon.png"),
    titleBarStyle: "default",
    webPreferences: {
      preload:         path.join(__dirname, "preload.js"),
      contextIsolation:   true,
      nodeIntegration:    false,
      backgroundThrottling: false,
    },
  });

  const isDev = !app.isPackaged;
  if (isDev) {
    mainWin.loadURL("http://localhost:5173");
  } else {
    mainWin.loadFile(path.join(__dirname, "dist", "index.html"));
  }

  mainWin.once("ready-to-show", () => {
    if (splashWin && !splashWin.isDestroyed()) {
      splashWin.destroy();
      splashWin = null;
    }
    mainWin.show();
    mainWin.focus();

    if (!isDev) {
      autoUpdater.checkForUpdatesAndNotify();
    }
  });

  app.on("second-instance", () => {
    if (mainWin) {
      if (mainWin.isMinimized()) mainWin.restore();
      mainWin.focus();
    }
  });

  mainWin.on("closed", () => { mainWin = null; });
}

// ── Автоматичен ъпдейт ────────────────────────────────────────────────────────
autoUpdater.autoDownload = true;
autoUpdater.autoInstallOnAppQuit = true;

autoUpdater.on("update-available", () => {
  if (mainWin) mainWin.webContents.send("update-available");
});

autoUpdater.on("update-downloaded", () => {
  if (mainWin) mainWin.webContents.send("update-downloaded");
});

autoUpdater.on("error", (err) => {
  console.error("AutoUpdater error:", err);
});

ipcMain.on("install-update", () => {
  autoUpdater.quitAndInstall();
});

// ── HTML шаблони ──────────────────────────────────────────────────────────────
function splashHTML() {
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"/>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  html, body { height:100%; background:transparent; font-family:system-ui,sans-serif; }
  body {
    display:flex; align-items:center; justify-content:center;
    -webkit-app-region: drag;
  }
  .box {
    text-align:center;
    background:#fff;
    border-radius:20px;
    padding:40px 48px;
    box-shadow:0 24px 60px rgba(0,0,0,.18);
  }
  .ico { font-size:52px; margin-bottom:12px; }
  .title { font-size:24px; font-weight:800; letter-spacing:-.03em; color:#111827; }
  .sub { font-size:13px; color:#9ca3af; margin-top:6px; }
  .bar {
    margin-top:20px;
    height:3px; width:180px;
    background:#e5e7eb; border-radius:99px;
    overflow:hidden; margin-left:auto; margin-right:auto;
  }
  .fill {
    height:100%; width:30%;
    background:#1d4ed8; border-radius:99px;
    animation: slide 1.4s ease-in-out infinite;
  }
  @keyframes slide {
    0%   { transform: translateX(-100%); }
    50%  { transform: translateX(200%); }
    100% { transform: translateX(500%); }
  }
</style>
</head>
<body>
  <div class="box">
    <div class="ico">🏪</div>
    <div class="title">ProStore</div>
    <div class="sub">Складова система · зареждане…</div>
    <div class="bar"><div class="fill"></div></div>
  </div>
</body>
</html>`;
}

function mobileScannerHTML() {
  return `<!DOCTYPE html>
<html lang="bg">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"/>
<meta name="apple-mobile-web-app-capable" content="yes"/>
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent"/>
<title>ProStore · Скенер</title>
<style>
*{margin:0;padding:0;box-sizing:border-box;-webkit-tap-highlight-color:transparent}
html,body{height:100%;overflow:hidden;background:#000;font-family:system-ui,sans-serif;color:#fff}

/* ── Fullscreen камера ── */
#v{position:fixed;inset:0;width:100%;height:100%;object-fit:cover;z-index:0}

/* ── Overlay UI ── */
#ui{position:fixed;inset:0;z-index:10;display:flex;flex-direction:column;align-items:center;justify-content:space-between;padding:env(safe-area-inset-top,16px) 16px env(safe-area-inset-bottom,24px)}

/* ── Хедър ── */
.hdr{width:100%;display:flex;align-items:center;justify-content:space-between;padding:12px 0 0}
.hdr-title{font-size:17px;font-weight:700;letter-spacing:-.02em;text-shadow:0 1px 4px rgba(0,0,0,.6)}
.torch-btn{width:42px;height:42px;border-radius:50%;background:rgba(255,255,255,.15);
  backdrop-filter:blur(8px);border:1px solid rgba(255,255,255,.2);
  color:#fff;font-size:20px;cursor:pointer;display:flex;align-items:center;justify-content:center;
  transition:all .15s}
.torch-btn.on{background:rgba(255,220,50,.35);border-color:rgba(255,220,50,.6)}

/* ── Прицел (центъра на екрана) ── */
#aim{position:fixed;top:50%;left:50%;transform:translate(-50%,-55%);
  width:min(72vw,280px);height:min(72vw,280px);z-index:5;pointer-events:none}
.corner{position:absolute;width:28px;height:28px}
.tl{top:0;left:0;border-top:3px solid #fff;border-left:3px solid #fff;border-radius:4px 0 0 0}
.tr{top:0;right:0;border-top:3px solid #fff;border-right:3px solid #fff;border-radius:0 4px 0 0}
.bl{bottom:0;left:0;border-bottom:3px solid #fff;border-left:3px solid #fff;border-radius:0 0 0 4px}
.br{bottom:0;right:0;border-bottom:3px solid #fff;border-right:3px solid #fff;border-radius:0 0 4px 0}
.scanline{position:absolute;left:4px;right:4px;height:2px;
  background:linear-gradient(90deg,transparent,rgba(255,255,255,.9),transparent);
  border-radius:1px;animation:scan 2s ease-in-out infinite}
@keyframes scan{0%,100%{top:8%;opacity:.6}50%{top:88%;opacity:1}}
#aim.success .tl,.aim.success .tr,#aim.success .bl,#aim.success .br{border-color:#4ade80;transition:border-color .1s}
#aim.success .scanline{background:linear-gradient(90deg,transparent,rgba(74,222,128,.9),transparent)}

/* ── Статус badge ── */
#st-wrap{position:fixed;top:50%;left:50%;transform:translate(-50%,calc(min(36vw,140px) + 8px));z-index:11;pointer-events:none}
#st{padding:8px 18px;border-radius:20px;font-size:14px;font-weight:600;
  background:rgba(0,0,0,.55);backdrop-filter:blur(10px);
  border:1px solid rgba(255,255,255,.12);white-space:nowrap;
  transition:background .2s,color .2s}
#st.ok{background:rgba(20,83,45,.85);color:#86efac;border-color:rgba(74,222,128,.3)}
#st.err{background:rgba(127,29,29,.85);color:#fca5a5;border-color:rgba(252,165,165,.3)}
#st.warn{background:rgba(120,53,15,.85);color:#fcd34d;border-color:rgba(252,211,77,.3)}

/* ── Дъно: ръчно въвеждане ── */
.bottom{width:100%;display:flex;flex-direction:column;align-items:center;gap:10px}
.manual-row{display:flex;gap:8px;width:100%;max-width:400px}
.inp{flex:1;height:48px;padding:0 16px;border-radius:12px;border:1px solid rgba(255,255,255,.15);
  font-size:17px;font-family:monospace;background:rgba(255,255,255,.1);
  color:#fff;backdrop-filter:blur(10px);outline:none;letter-spacing:.05em}
.inp::placeholder{color:rgba(255,255,255,.35);font-size:14px;font-family:system-ui;letter-spacing:0}
.inp:focus{border-color:rgba(255,255,255,.4);background:rgba(255,255,255,.15)}
.send-btn{height:48px;padding:0 20px;background:#1d4ed8;color:#fff;border:none;
  border-radius:12px;font-size:17px;font-weight:700;cursor:pointer;flex-shrink:0;
  transition:background .13s;-webkit-user-select:none}
.send-btn:active{background:#1e40af}
.hint{font-size:12px;color:rgba(255,255,255,.4);text-align:center}

/* ── SSL предупреждение ── */
.ssl-warn{position:fixed;top:0;left:0;right:0;z-index:50;
  padding:14px 16px;background:rgba(120,53,15,.95);color:#fcd34d;
  font-size:13px;line-height:1.5;text-align:center;backdrop-filter:blur(8px)}

/* ── Зареждане ── */
#loading{position:fixed;inset:0;background:#000;z-index:100;
  display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px}
.spinner{width:40px;height:40px;border:3px solid rgba(255,255,255,.15);
  border-top-color:#fff;border-radius:50%;animation:spin .8s linear infinite}
@keyframes spin{to{transform:rotate(360deg)}}

canvas{display:none}
</style>
</head>
<body>

<div id="loading">
  <div style="font-size:42px">🏪</div>
  <div class="spinner"></div>
  <div style="font-size:14px;color:rgba(255,255,255,.5)">Стартиране на камерата…</div>
</div>

<video id="v" autoplay playsinline muted></video>
<canvas id="c"></canvas>

<div id="aim">
  <div class="corner tl"></div>
  <div class="corner tr"></div>
  <div class="corner bl"></div>
  <div class="corner br"></div>
  <div class="scanline"></div>
</div>

<div id="st-wrap"><div id="st">Зареждане…</div></div>

<div id="ui">
  <div class="hdr">
    <div class="hdr-title">🏪 ProStore Скенер</div>
    <button class="torch-btn" id="torch" onclick="toggleTorch()" title="Фенерче">💡</button>
  </div>
  <div class="bottom">
    <div class="manual-row">
      <input class="inp" id="inp" type="text" placeholder="Въведи баркод ръчно…" inputmode="numeric" autocomplete="off" autocorrect="off"/>
      <button class="send-btn" onclick="sendManual()">→</button>
    </div>
    <div class="hint" id="hint">Насочи камерата към баркода</div>
  </div>
</div>

<!-- ZXing за EAN/Code128/Code39 (iOS + Android) -->
<script src="https://cdn.jsdelivr.net/npm/@zxing/library@0.21.3/umd/index.min.js"></script>

<script>
const SERVER = location.origin;
const st   = document.getElementById('st');
const inp  = document.getElementById('inp');
const vid  = document.getElementById('v');
const cvs  = document.getElementById('c');
const aim  = document.getElementById('aim');
const hint = document.getElementById('hint');
const load = document.getElementById('loading');

let lastCode = '', lastTime = 0, rafId = null, torchOn = false, track = null;

// ── SSL предупреждение ───────────────────────────────────────────────────────
if (location.protocol === 'https:') {
  const w = document.createElement('div');
  w.className = 'ssl-warn';
  w.innerHTML = '⚠️ Предупреждение за сертификат? Натисни <b>Разширени → Продължи</b>';
  document.body.prepend(w);
  setTimeout(() => w.style.display='none', 6000);
}

// ── Статус ───────────────────────────────────────────────────────────────────
function setStatus(txt, cls='') {
  st.textContent = txt;
  st.className = cls;
}

// ── Вибрация / haptic ────────────────────────────────────────────────────────
function vibrate() {
  try { navigator.vibrate && navigator.vibrate([60]); } catch(_) {}
}

// ── Изпращане ────────────────────────────────────────────────────────────────
async function send(code) {
  const now = Date.now();
  if (code === lastCode && now - lastTime < 2500) return;
  lastCode = code; lastTime = now;

  vibrate();
  aim.classList.add('success');
  setTimeout(() => aim.classList.remove('success'), 600);

  setStatus('✓ ' + code, 'ok');
  try {
    const r = await fetch(SERVER + '/barcode', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code })
    });
    if (!r.ok) throw new Error('HTTP ' + r.status);
  } catch(e) {
    setStatus('✗ Грешка при изпращане', 'err');
  }
  setTimeout(() => setStatus('📷 Готов', ''), 2000);
}

function sendManual() {
  const v = inp.value.trim();
  if (v) { send(v); inp.value = ''; inp.blur(); }
}
inp.addEventListener('keydown', e => { if (e.key === 'Enter') sendManual(); });

// ── Фенерче ──────────────────────────────────────────────────────────────────
async function toggleTorch() {
  if (!track) return;
  try {
    torchOn = !torchOn;
    await track.applyConstraints({ advanced: [{ torch: torchOn }] });
    document.getElementById('torch').classList.toggle('on', torchOn);
  } catch(_) { document.getElementById('torch').style.display='none'; }
}

// ── Нативен BarcodeDetector (Chrome Android — най-бърз) ──────────────────────
function startNative(stream) {
  const det = new BarcodeDetector({
    formats: ['ean_13','ean_8','code_128','code_39','upc_a','upc_e','qr_code','data_matrix']
  });
  const loop = async () => {
    if (vid.readyState >= 2) {
      try {
        const r = await det.detect(vid);
        if (r.length) send(r[0].rawValue);
      } catch(_) {}
    }
    rafId = requestAnimationFrame(loop);
  };
  rafId = requestAnimationFrame(loop);
  setStatus('📷 Готов', '');
  hint.textContent = 'Насочи камерата към баркода';
}

// ── ZXing (iOS Safari + Firefox — чете EAN-13/128/QR) ────────────────────────
function startZXing(stream) {
  // Намаляваме canvas до 640px за по-бързо декодиране
  const SCAN_W = 640;
  const ctx = cvs.getContext('2d', { willReadFrequently: true });

  if (!window.ZXing) {
    setStatus('⚠️ Използвай ръчно въвеждане', 'warn');
    hint.textContent = 'Библиотеката не се зареди';
    return;
  }

  const hints = new Map();
  const { DecodeHintType, BarcodeFormat } = ZXing;
  hints.set(DecodeHintType.POSSIBLE_FORMATS, [
    BarcodeFormat.EAN_13, BarcodeFormat.EAN_8,
    BarcodeFormat.CODE_128, BarcodeFormat.CODE_39,
    BarcodeFormat.UPC_A, BarcodeFormat.UPC_E,
    BarcodeFormat.QR_CODE, BarcodeFormat.DATA_MATRIX,
  ]);
  hints.set(DecodeHintType.TRY_HARDER, true);

  const reader = new ZXing.BrowserMultiFormatReader(hints);

  const scan = () => {
    if (vid.readyState === vid.HAVE_ENOUGH_DATA) {
      const scale = SCAN_W / vid.videoWidth;
      cvs.width  = SCAN_W;
      cvs.height = Math.round(vid.videoHeight * scale);
      ctx.drawImage(vid, 0, 0, cvs.width, cvs.height);
      try {
        const lum = new ZXing.HTMLCanvasElementLuminanceSource(cvs);
        const bmp = new ZXing.BinaryBitmap(new ZXing.HybridBinarizer(lum));
        const res = reader.decodeBitmap(bmp);
        if (res) send(res.getText());
      } catch(_) {}
    }
    rafId = requestAnimationFrame(scan);
  };
  rafId = requestAnimationFrame(scan);
  setStatus('📷 Готов', '');
  hint.textContent = 'Насочи камерата към баркода';
}

// ── Старт ─────────────────────────────────────────────────────────────────────
async function startCamera() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: { ideal: 'environment' },
        width:  { ideal: 1920 },
        height: { ideal: 1080 },
      }
    });
    vid.srcObject = stream;
    track = stream.getVideoTracks()[0];

    // Скрий loading при първи кадър
    vid.onloadedmetadata = () => {
      vid.play();
      load.style.display = 'none';

      // Извести Electron че телефонът е свързан → затваря QR модала
      fetch(SERVER + '/ping', { method: 'POST' }).catch(() => {});

      if (window.BarcodeDetector) {
        startNative(stream);
      } else {
        startZXing(stream);
      }
    };

    // Провери дали torch е наличен
    const caps = track.getCapabilities?.() || {};
    if (!caps.torch) document.getElementById('torch').style.display = 'none';

  } catch(e) {
    load.style.display = 'none';
    if (e.name === 'NotAllowedError') {
      setStatus('🔒 Разреши камерата', 'err');
      hint.innerHTML = 'Настройки → Safari → Камера → Разреши';
    } else {
      setStatus('✗ ' + e.message, 'err');
    }
  }
}

startCamera();
</script>
</body>
</html>`;
}

// ── IPC Handlers ──────────────────────────────────────────────────────────────
ipcMain.handle("get-server-info", () => serverInfo);

ipcMain.handle("show-open-dialog", async (_, opts) => {
  return dialog.showOpenDialog(mainWin, opts);
});

// ── App lifecycle ─────────────────────────────────────────────────────────────
app.whenReady().then(() => {
  startBarcodeServer();
  createSplash();
  createMainWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createMainWindow();
  });
});

app.on("window-all-closed", () => {
  if (barcodeServer) barcodeServer.close();
  if (process.platform !== "darwin") app.quit();
});