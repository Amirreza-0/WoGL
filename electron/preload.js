const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  getAppPath: () => ipcRenderer.invoke('get-app-path'),
  getVersion: () => ipcRenderer.invoke('get-version'),

  // Steam integration (to be implemented)
  steam: {
    isAvailable: () => false, // Will be true when Steamworks is integrated
    unlockAchievement: (achievementId) => {
      console.log('Achievement unlock:', achievementId);
      return ipcRenderer.invoke('steam-unlock-achievement', achievementId);
    },
    updateStat: (statName, value) => {
      console.log('Stat update:', statName, value);
      return ipcRenderer.invoke('steam-update-stat', statName, value);
    },
    getUserName: () => ipcRenderer.invoke('steam-get-username'),
  },

  // Save/Load system
  saveGame: (data) => ipcRenderer.invoke('save-game', data),
  loadGame: () => ipcRenderer.invoke('load-game'),

  // Settings
  saveSettings: (settings) => ipcRenderer.invoke('save-settings', settings),
  loadSettings: () => ipcRenderer.invoke('load-settings'),
});
