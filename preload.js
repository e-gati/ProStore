const { contextBridge, ipcRenderer } = require("electron");

// ── Сигурен мост между Main и React ──────────────────────────────────────────
// Само изрично дефинираните функции са достъпни в renderer-а.
// contextIsolation: true гарантира, че renderer няма достъп до Node.js директно.

contextBridge.exposeInMainWorld("electron", {

  // Информация за локалния HTTP сървър (IP, port, URL за QR кода)
  getServerInfo: () => ipcRenderer.invoke("get-server-info"),

  // Слушай за баркодове изпратени от телефона
  onBarcode: (callback) => {
    const handler = (_event, code) => callback(code);
    ipcRenderer.on("barcode-scanned", handler);
    // Връща cleanup функция
    return () => ipcRenderer.removeListener("barcode-scanned", handler);
  },

  // Премахни listener за баркодове
  offBarcode: () => {
    ipcRenderer.removeAllListeners("barcode-scanned");
  },

  // Диалог за отваряне на файл (ако е нужен в бъдеще)
  showOpenDialog: (opts) => ipcRenderer.invoke("show-open-dialog", opts),

});
