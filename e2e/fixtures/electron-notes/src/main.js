// Electron Main Process — Node.js target (no browser globals)
// This file runs in the Node.js context inside Electron's main process

const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

// IPC handlers — parsed by Lunx electron adapter for TypeScript type generation
// Channel: 'note:save'
ipcMain.handle('note:save', async (event, { id, content }) => {
  const notesDir = path.join(app.getPath('userData'), 'notes');
  fs.mkdirSync(notesDir, { recursive: true });
  fs.writeFileSync(path.join(notesDir, `${id}.txt`), content, 'utf-8');
  return { success: true, id };
});

// Channel: 'note:load'
ipcMain.handle('note:load', async (event, id) => {
  const notePath = path.join(app.getPath('userData'), 'notes', `${id}.txt`);
  if (!fs.existsSync(notePath)) return null;
  return fs.readFileSync(notePath, 'utf-8');
});

// Channel: 'note:list'
ipcMain.handle('note:list', async () => {
  const notesDir = path.join(app.getPath('userData'), 'notes');
  if (!fs.existsSync(notesDir)) return [];
  return fs.readdirSync(notesDir).map(f => f.replace('.txt', ''));
});

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    }
  });

  // In dev: load from Lunx dev server via ELECTRON_DEV_SERVER_URL
  // In prod: load from built dist/renderer/index.html
  const devUrl = process.env.ELECTRON_DEV_SERVER_URL;
  if (devUrl) {
    win.loadURL(devUrl);
  } else {
    win.loadFile(path.join(__dirname, '../dist/renderer/index.html'));
  }
}

app.whenReady().then(createWindow);
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
