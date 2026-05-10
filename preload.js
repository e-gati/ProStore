const { contextBridge, ipcRenderer } = require("electron");

// Пазим дали update-downloaded е пристигнало преди React да е готов
let updateDownloadedFired = false;
let updateAvailableFired = false;

ipcRenderer.on("update-downloaded", () => { updateDownloadedFired = true; });
ipcRenderer.on("update-available",  () => { updateAvailableFired  = true; });

contextBridge.exposeInMainWorld("electron", {

  getServerInfo: () => ipcRenderer.invoke("get-server-info"),

  onBarcode: (callback) => {
    const handler = (_event, code) => callback(code);
    ipcRenderer.on("barcode-scanned", handler);
    return () => ipcRenderer.removeListener("barcode-scanned", handler);
  },

  offBarcode: () => {
    ipcRenderer.removeAllListeners("barcode-scanned");
  },

  onPhoneConnected: (callback) => {
    ipcRenderer.on("phone-connected", callback);
  },
  offPhoneConnected: () => {
    ipcRenderer.removeAllListeners("phone-connected");
  },

  showOpenDialog: (opts) => ipcRenderer.invoke("show-open-dialog", opts),

  // ── Автоматичен ъпдейт ────────────────────────────────────────────────────

  // Ако събитието вече е пристигнало — извикай callback веднага
  onUpdateAvailable: (callback) => {
    if (updateAvailableFired) { setTimeout(callback, 100); }
    ipcRenderer.on("update-available", callback);
  },

  onUpdateDownloaded: (callback) => {
    if (updateDownloadedFired) { setTimeout(callback, 100); }
    ipcRenderer.on("update-downloaded", callback);
  },

  installUpdate: () => {
    ipcRenderer.send("install-update");
  },

});