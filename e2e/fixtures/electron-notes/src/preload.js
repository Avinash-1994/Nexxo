// Electron Preload Script — bridge between main and renderer
// contextBridge exposes typed IPC invoke wrappers

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // note:save(id: string, content: string): Promise<{ success: boolean; id: string }>
  saveNote: (id, content) => ipcRenderer.invoke('note:save', { id, content }),

  // note:load(id: string): Promise<string | null>
  loadNote: (id) => ipcRenderer.invoke('note:load', id),

  // note:list(): Promise<string[]>
  listNotes: () => ipcRenderer.invoke('note:list'),
});
