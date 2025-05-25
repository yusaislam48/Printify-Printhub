const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Authentication
  loginBoothManager: (credentials) => ipcRenderer.invoke('login-booth-manager', credentials),
  logoutBoothManager: () => ipcRenderer.invoke('logout-booth-manager'),
  getCurrentBoothManager: () => ipcRenderer.invoke('get-current-booth-manager'),
  
  // Dashboard
  getBoothManagerProfile: () => ipcRenderer.invoke('get-booth-manager-profile'),
  updatePaperCount: (paperData) => ipcRenderer.invoke('update-paper-count', paperData),
  
  // Print Hub functionality
  searchPrintJobs: (studentId) => ipcRenderer.invoke('search-print-jobs', studentId),
  markJobCompleted: (jobId) => ipcRenderer.invoke('mark-job-completed', jobId),
  printJobNow: (jobId, jobData) => ipcRenderer.invoke('print-job-now', jobId, jobData),
  viewPdf: (jobId) => ipcRenderer.invoke('view-pdf', jobId),
  downloadPdf: (jobIdOrUrl, fileName) => ipcRenderer.invoke('download-pdf', jobIdOrUrl, fileName),
  openPdfExternal: (jobId) => ipcRenderer.invoke('open-pdf-external', jobId),
  openExternal: (url) => ipcRenderer.invoke('open-external', url),
  
  // System
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  quitApp: () => ipcRenderer.invoke('quit-app'),
  testPrint: () => ipcRenderer.invoke('test-print'),
  
  // Utility methods
  log: (message) => console.log(message),
  error: (message) => console.error(message)
}); 