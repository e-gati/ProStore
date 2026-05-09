const { contextBridge, ipcRenderer } = require("electron");

// ── Сигурен мост между Main и React ──────────────────────────────────────────
contextBridge.exposeInMainWorld("electron", {

  // Информация за локалния HTTP сървър (IP, port, URL за QR кода)
  getServerInfo: () => ipcRenderer.invoke("get-server-info"),

  // Слушай за баркодове изпратени от телефона
  onBarcode: (callback) => {
    const handler = (_event, code) => callback(code);
    ipcRenderer.on("barcode-scanned", handler);
    return () => ipcRenderer.removeListener("barcode-scanned", handler);
  },

  // Премахни listener за баркодове
  offBarcode: () => {
    ipcRenderer.removeAllListeners("barcode-scanned");
  },

  // Телефонът се свърза успешно (камерата тръгна) → затвори QR модала
  onPhoneConnected: (callback) => {
    ipcRenderer.on("phone-connected", callback);
  },
  offPhoneConnected: () => {
    ipcRenderer.removeAllListeners("phone-connected");
  },

  // Диалог за отваряне на файл
  showOpenDialog: (opts) => ipcRenderer.invoke("show-open-dialog", opts),

  // ── Автоматичен ъпдейт ────────────────────────────────────────────────────

  // Извикай се когато има нова версия (започва изтегляне)
  onUpdateAvailable: (callback) => {
    ipcRenderer.on("update-available", callback);
  },

  // Извикай се когато ъпдейтът е изтеглен и готов за инсталация
  onUpdateDownloaded: (callback) => {
    ipcRenderer.on("update-downloaded", callback);
  },

  // Инсталирай ъпдейта и рестартирай приложението
  installUpdate: () => {
    ipcRenderer.send("install-update");
  },

});