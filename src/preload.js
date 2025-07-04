const { contextBridge, ipcRenderer } = require('electron');
const path = require('path');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
    'electron',
    {
        selectDirectory: () => ipcRenderer.invoke('select-directory'),
        createDirectory: () => ipcRenderer.invoke('create-directory'),
        selectFile: () => ipcRenderer.invoke('select-file'),
        basename: (filePath) => path.basename(filePath)
    }
); 