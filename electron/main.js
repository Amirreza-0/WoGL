import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const squirrel = require('electron-squirrel-startup');

// Handle Squirrel events for Windows installer
if (squirrel) {
  app.quit();
}

let mainWindow = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 768,
    title: 'The War of Gutlands',
    icon: path.join(__dirname, '../public/icon.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
    // Steam overlay compatibility
    backgroundColor: '#fffbeb', // amber-50
    show: false,
  });

  // Remove menu bar for cleaner look
  mainWindow.setMenuBarVisibility(false);

  // Load the app
  // Check if running in development (Vite dev server) or production
  const isDev = !app.isPackaged;

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    // Uncomment to enable DevTools in development:
    // mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  // Show window when ready to prevent visual flash
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// App lifecycle
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC handlers for game functionality
ipcMain.handle('get-app-path', () => {
  return app.getPath('userData');
});

ipcMain.handle('get-version', () => {
  return app.getVersion();
});

// Save/Load game handlers
ipcMain.handle('save-game', async (_event, data) => {
  const fs = await import('fs/promises');
  const savePath = path.join(app.getPath('userData'), 'savegame.json');
  try {
    await fs.writeFile(savePath, JSON.stringify(data, null, 2), 'utf-8');
    return { success: true };
  } catch (error) {
    console.error('Failed to save game:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('load-game', async () => {
  const fs = await import('fs/promises');
  const savePath = path.join(app.getPath('userData'), 'savegame.json');
  try {
    const data = await fs.readFile(savePath, 'utf-8');
    return { success: true, data: JSON.parse(data) };
  } catch (error) {
    console.error('Failed to load game:', error);
    return { success: false, error: error.message };
  }
});

// Settings handlers
ipcMain.handle('save-settings', async (_event, settings) => {
  const fs = await import('fs/promises');
  const settingsPath = path.join(app.getPath('userData'), 'settings.json');
  try {
    await fs.writeFile(settingsPath, JSON.stringify(settings, null, 2), 'utf-8');
    return { success: true };
  } catch (error) {
    console.error('Failed to save settings:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('load-settings', async () => {
  const fs = await import('fs/promises');
  const settingsPath = path.join(app.getPath('userData'), 'settings.json');
  try {
    const data = await fs.readFile(settingsPath, 'utf-8');
    return { success: true, data: JSON.parse(data) };
  } catch (error) {
    // Settings file doesn't exist yet - return defaults
    return { success: true, data: {} };
  }
});

// Steam handlers (stubs until Steamworks SDK is integrated)
ipcMain.handle('steam-unlock-achievement', async (_event, achievementId) => {
  console.log('Steam achievement unlock requested:', achievementId);
  // TODO: Implement with Steamworks SDK
  return { success: false, reason: 'Steam not initialized' };
});

ipcMain.handle('steam-update-stat', async (_event, statName, value) => {
  console.log('Steam stat update requested:', statName, value);
  // TODO: Implement with Steamworks SDK
  return { success: false, reason: 'Steam not initialized' };
});

ipcMain.handle('steam-get-username', async () => {
  // TODO: Implement with Steamworks SDK
  return null;
});
