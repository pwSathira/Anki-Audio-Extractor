const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const express = require('express');
const cors = require('cors');
const ankiPackageService = require('./services/ankiPackageService');

let mainWindow;
let server;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js'),
            sandbox: false
        }
    });

    // Load the index.html file
    mainWindow.loadFile(path.join(__dirname, 'index.html'));

    // Open DevTools in development
    if (process.env.NODE_ENV === 'development') {
        mainWindow.webContents.openDevTools();
    }
}

async function startServer() {
    const expressApp = express();
    expressApp.use(cors());
    expressApp.use(express.json());

    expressApp.post('/api/extract', async (req, res) => {
        try {
            const { apkgPath, outputDir } = req.body;
            if (!apkgPath || !outputDir) {
                throw new Error('Missing required parameters');
            }
            const extractedFiles = await ankiPackageService.extractAudioFiles(apkgPath, outputDir);
            res.json({ success: true, extractedFiles });
        } catch (error) {
            console.error('Extraction error:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    });

    return new Promise((resolve) => {
        server = expressApp.listen(4567, () => {
            console.log('Server started on port 4567');
            resolve();
        });
    });
}

app.whenReady().then(async () => {
    await startServer();
    createWindow();

    app.on('activate', function () {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit();
});

app.on('before-quit', () => {
    if (server) {
        server.close();
    }
});

ipcMain.handle('create-directory', async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
        properties: ['openDirectory', 'createDirectory']
    });
    
    if (!result.canceled && result.filePaths.length > 0) {
        return result.filePaths[0];
    }
    return null;
});

ipcMain.handle('select-file', async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
        properties: ['openFile'],
        filters: [
            { name: 'Anki Package', extensions: ['apkg'] }
        ]
    });
    
    if (!result.canceled && result.filePaths.length > 0) {
        return result.filePaths[0];
    }
    return null;
}); 