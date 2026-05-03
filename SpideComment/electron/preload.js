const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  selectExportPath: (defaultName) => ipcRenderer.invoke('select-export-path', defaultName),
  exportFile: (filePath, data) => ipcRenderer.invoke('export-file', filePath, data),
  showMessage: (options) => ipcRenderer.invoke('show-message', options)
});
