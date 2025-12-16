/**
 * ContPAQ Win - Electron Main Process Entry Point
 *
 * This is the main entry point for the Electron application.
 * It creates and manages the browser window, handles lifecycle events,
 * and sets up secure communication with the renderer process.
 */

import { app, BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';

// Keep a global reference of the window object to prevent garbage collection
let mainWindow: BrowserWindow | null = null;

// Determine if we're in development mode
const isDev = process.env.NODE_ENV === 'development';

/**
 * Creates the main application window with secure defaults.
 * Configures webPreferences for security best practices.
 */
function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    title: 'ContPAQ Win',
    show: false, // Don't show until ready-to-show
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      webSecurity: true,
      allowRunningInsecureContent: false,
    },
  });

  // Show window when ready to prevent visual flash
  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
  });

  // Load the app
  if (isDev) {
    // In development, load from Vite dev server
    mainWindow.loadURL('http://localhost:5173');
    // Open DevTools in development
    mainWindow.webContents.openDevTools();
  } else {
    // In production, load the built files
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }

  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

/**
 * Application lifecycle event handlers
 */

// This method will be called when Electron has finished initialization
app.whenReady().then(() => {
  createWindow();

  // On macOS, re-create window when dock icon is clicked and no windows are open
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed (except on macOS)
app.on('window-all-closed', () => {
  // On macOS, applications stay active until user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Security: Prevent navigation to external URLs
app.on('web-contents-created', (_event, contents) => {
  contents.on('will-navigate', (event, navigationUrl) => {
    const parsedUrl = new URL(navigationUrl);
    // Only allow navigation to localhost in development
    if (isDev && parsedUrl.origin === 'http://localhost:5173') {
      return;
    }
    // Block all other navigations
    event.preventDefault();
  });

  // Prevent new windows from being created
  contents.setWindowOpenHandler(() => {
    return { action: 'deny' };
  });
});

// Export for testing purposes
export { createWindow, mainWindow };
