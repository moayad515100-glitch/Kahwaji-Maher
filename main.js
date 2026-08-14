const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');

function createWindow() {
    const mainWindow = new BrowserWindow({
        width: 1280,
        height: 850,
        minWidth: 800,
        minHeight: 600,
        title: "قهوجي ماهر - تطبيق الكمبيوتر الرسمي ☕",
        icon: path.join(__dirname, 'icon-512.png'),
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        },
        backgroundColor: '#120e0a'
    });

    // Hide top menu bar for a clean, true app window
    Menu.setApplicationMenu(null);

    // Load local index.html directly from disk
    mainWindow.loadFile(path.join(__dirname, 'index.html'));
}

app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});
