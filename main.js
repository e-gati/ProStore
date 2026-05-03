const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const path   = require("path");
const http   = require("http");
const os     = require("os");

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
let mainWin  = null;
let splashWin = null;

// ── Локален HTTP сървър за баркод от телефон ──────────────────────────────────
let barcodeServer = null;
let serverInfo    = null;   // { ip, port, url }

function getLocalIP() {
  const ifaces = os.networkInterfaces();
  for (const name of Object.keys(ifaces)) {
    for (const iface of ifaces[name]) {
      if (iface.family === "IPv4" && !iface.internal) return iface.address;
    }
  }
  return "127.0.0.1";
}

function startBarcodeServer() {
  barcodeServer = http.createServer((req, res) => {
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

    // Мобилна страница за сканиране
    if (req.method === "GET" && req.url === "/") {
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      res.end(mobileScannerHTML());
      return;
    }

    res.writeHead(404); res.end("Not found");
  });

  barcodeServer.listen(0, "0.0.0.0", () => {
    const port = barcodeServer.address().port;
    const ip   = getLocalIP();
    serverInfo = { ip, port, url: `http://${ip}:${port}` };
  });
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
    show:            false,          // показваме след ready-to-show
    backgroundColor: "#f0f0f0",      // предотвратява бял flash
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
      backgroundThrottling: false,   // не забавяй когато прозорецът е на заден план
    },
  });

  // Зареди Vite dev сървъра или продукционните файлове
  const isDev = !app.isPackaged;
if (isDev) {
  mainWin.loadURL("http://localhost:5173");
} else {
  mainWin.loadFile(path.join(__dirname, "dist", "index.html"));
}

  // ── Покажи прозореца само когато React е готов ────────────────────────────
  mainWin.once("ready-to-show", () => {
    // Унищожи splash-а
    if (splashWin && !splashWin.isDestroyed()) {
      splashWin.destroy();
      splashWin = null;
    }
    mainWin.show();
    mainWin.focus();
  });

  // ── Втори инстанс → фокусирай съществуващия ──────────────────────────────
  app.on("second-instance", () => {
    if (mainWin) {
      if (mainWin.isMinimized()) mainWin.restore();
      mainWin.focus();
    }
  });

  mainWin.on("closed", () => { mainWin = null; });
}

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
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>ProStore · Скенер</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:system-ui,sans-serif;background:#111827;color:#fff;
    display:flex;flex-direction:column;align-items:center;
    justify-content:center;min-height:100vh;padding:20px;text-align:center}
  h1{font-size:22px;font-weight:800;margin-bottom:6px}
  p{font-size:14px;color:#9ca3af;margin-bottom:24px;line-height:1.5}
  video{width:100%;max-width:360px;border-radius:14px;background:#000}
  .status{margin-top:16px;padding:10px 18px;border-radius:10px;
    font-weight:600;font-size:14px;background:#1f2937}
  .ok{background:#14532d;color:#86efac}
  .err{background:#7f1d1d;color:#fca5a5}
  input{width:100%;max-width:360px;padding:12px;border-radius:10px;
    border:none;font-size:16px;margin-top:16px;font-family:monospace}
  button{margin-top:10px;padding:12px 24px;background:#1d4ed8;color:#fff;
    border:none;border-radius:10px;font-size:15px;font-weight:700;
    cursor:pointer;width:100%;max-width:360px}
</style>
</head>
<body>
<div style="font-size:36px;margin-bottom:10px">🏪</div>
<h1>ProStore Скенер</h1>
<p>Насочи камерата към баркода<br/>или въведи кода ръчно</p>
<video id="v" autoplay playsinline muted></video>
<div class="status" id="st">📷 Стартиране на камерата…</div>
<input id="inp" type="text" placeholder="Ръчно въвеждане на баркод…" inputmode="numeric"/>
<button onclick="sendManual()">✓ Изпрати</button>

<script>
const SERVER = location.origin;
const st = document.getElementById('st');
const inp = document.getElementById('inp');

async function send(code) {
  try {
    await fetch(SERVER + '/barcode', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({code})
    });
    st.textContent = '✓ Изпратено: ' + code;
    st.className = 'status ok';
    inp.value = '';
    setTimeout(() => { st.textContent = '📷 Готов за следващ…'; st.className = 'status'; }, 2500);
  } catch(e) {
    st.textContent = '✗ Грешка при изпращане'; st.className = 'status err';
  }
}

function sendManual() { if(inp.value.trim()) send(inp.value.trim()); }
inp.addEventListener('keydown', e => { if(e.key === 'Enter') sendManual(); });

async function startCamera() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia(
      {video:{facingMode:{ideal:'environment'}}}
    );
    document.getElementById('v').srcObject = stream;

    if(window.BarcodeDetector) {
      const det = new BarcodeDetector({formats:['ean_13','ean_8','code_128','code_39','upc_a','upc_e','qr_code']});
      let last = '';
      setInterval(async () => {
        try {
          const v = document.getElementById('v');
          const r = await det.detect(v);
          if(r.length && r[0].rawValue !== last) {
            last = r[0].rawValue;
            send(last);
            setTimeout(() => last = '', 3000);
          }
        } catch(_) {}
      }, 300);
      st.textContent = '📷 Готов за сканиране';
      st.className = 'status';
    } else {
      st.textContent = '⚠️ Използвай ръчно въвеждане';
      st.className = 'status err';
    }
  } catch(e) {
    st.textContent = '🔒 Разреши достъп до камерата';
    st.className = 'status err';
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
