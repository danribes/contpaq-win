/**
 * ContPAQ Win - IPC Handlers
 *
 * Registers all IPC handlers for communication between
 * the renderer process and main process.
 *
 * This is a stub implementation that will be completed as
 * features are implemented.
 */

import { ipcMain, dialog, app, BrowserWindow } from 'electron';
import { processManager } from './process-manager';

/**
 * AI Service IPC Handlers
 * Handles communication with the Python AI service
 */
function registerAIServiceHandlers(): void {
  // Extract invoice data from PDF
  ipcMain.handle('ai:extract-invoice', async (_event, filePath: string) => {
    // TODO: Implement actual AI service call
    console.log('Stub: ai:extract-invoice', filePath);
    return {
      success: false,
      error: 'Not implemented',
      message: 'AI extraction not yet implemented',
    };
  });

  // Check AI service health
  ipcMain.handle('ai:check-health', async () => {
    const health = await processManager.checkHealth('ai');
    return health;
  });

  // Get AI service status
  ipcMain.handle('ai:get-status', async () => {
    return {
      status: processManager.getAIServiceStatus(),
      running: processManager.isAIServiceRunning(),
    };
  });
}

/**
 * Windows Bridge IPC Handlers
 * Handles communication with the .NET Windows Bridge service
 */
function registerBridgeServiceHandlers(): void {
  // Check Bridge service health
  ipcMain.handle('bridge:check-health', async () => {
    const health = await processManager.checkHealth('bridge');
    return health;
  });

  // Get vendors from ContPAQi
  ipcMain.handle('bridge:get-vendors', async (_event, searchQuery?: string) => {
    // TODO: Implement actual Bridge service call
    console.log('Stub: bridge:get-vendors', searchQuery);
    return {
      success: false,
      error: 'Not implemented',
      vendors: [],
    };
  });

  // Get vendor by RFC
  ipcMain.handle('bridge:get-vendor-by-rfc', async (_event, rfc: string) => {
    // TODO: Implement actual Bridge service call
    console.log('Stub: bridge:get-vendor-by-rfc', rfc);
    return {
      success: false,
      error: 'Not implemented',
      vendor: null,
    };
  });

  // Create vendor in ContPAQi
  ipcMain.handle('bridge:create-vendor', async (_event, vendorData: unknown) => {
    // TODO: Implement actual Bridge service call
    console.log('Stub: bridge:create-vendor', vendorData);
    return {
      success: false,
      error: 'Not implemented',
    };
  });

  // Check for duplicate entry
  ipcMain.handle('bridge:check-duplicate', async (_event, invoiceData: unknown) => {
    // TODO: Implement actual Bridge service call
    console.log('Stub: bridge:check-duplicate', invoiceData);
    return {
      success: false,
      error: 'Not implemented',
      isDuplicate: false,
    };
  });

  // Create entry in ContPAQi
  ipcMain.handle('bridge:create-entry', async (_event, entryData: unknown) => {
    // TODO: Implement actual Bridge service call
    console.log('Stub: bridge:create-entry', entryData);
    return {
      success: false,
      error: 'Not implemented',
      folio: null,
    };
  });
}

/**
 * Database IPC Handlers
 * Handles local SQLite database operations
 */
function registerDatabaseHandlers(): void {
  // Get all invoices with optional filtering
  ipcMain.handle('db:get-invoices', async (_event, filters?: unknown) => {
    // TODO: Implement database query
    console.log('Stub: db:get-invoices', filters);
    return {
      success: false,
      error: 'Not implemented',
      invoices: [],
    };
  });

  // Get single invoice by ID
  ipcMain.handle('db:get-invoice', async (_event, invoiceId: string) => {
    // TODO: Implement database query
    console.log('Stub: db:get-invoice', invoiceId);
    return {
      success: false,
      error: 'Not implemented',
      invoice: null,
    };
  });

  // Save new invoice
  ipcMain.handle('db:save-invoice', async (_event, invoiceData: unknown) => {
    // TODO: Implement database insert
    console.log('Stub: db:save-invoice', invoiceData);
    return {
      success: false,
      error: 'Not implemented',
      id: null,
    };
  });

  // Update existing invoice
  ipcMain.handle('db:update-invoice', async (_event, invoiceId: string, updates: unknown) => {
    // TODO: Implement database update
    console.log('Stub: db:update-invoice', invoiceId, updates);
    return {
      success: false,
      error: 'Not implemented',
    };
  });

  // Delete invoice
  ipcMain.handle('db:delete-invoice', async (_event, invoiceId: string) => {
    // TODO: Implement database delete
    console.log('Stub: db:delete-invoice', invoiceId);
    return {
      success: false,
      error: 'Not implemented',
    };
  });
}

/**
 * App IPC Handlers
 * Handles general application operations
 */
function registerAppHandlers(): void {
  // Get application version
  ipcMain.handle('app:get-version', async () => {
    return app.getVersion();
  });

  // Get application configuration
  ipcMain.handle('app:get-config', async () => {
    return {
      version: app.getVersion(),
      platform: process.platform,
      arch: process.arch,
      userDataPath: app.getPath('userData'),
      isPackaged: app.isPackaged,
    };
  });

  // Open file dialog for PDF selection
  ipcMain.handle('app:open-file-dialog', async () => {
    const window = BrowserWindow.getFocusedWindow();
    if (!window) {
      return { canceled: true, filePaths: [] };
    }

    const result = await dialog.showOpenDialog(window, {
      title: 'Seleccionar Factura PDF',
      filters: [
        { name: 'PDF Files', extensions: ['pdf'] },
        { name: 'All Files', extensions: ['*'] },
      ],
      properties: ['openFile', 'multiSelections'],
    });

    return result;
  });

  // Save file dialog
  ipcMain.handle('app:save-file-dialog', async (_event, defaultName: string) => {
    const window = BrowserWindow.getFocusedWindow();
    if (!window) {
      return { canceled: true, filePath: undefined };
    }

    const result = await dialog.showSaveDialog(window, {
      title: 'Guardar Archivo',
      defaultPath: defaultName,
      filters: [
        { name: 'All Files', extensions: ['*'] },
      ],
    });

    return result;
  });
}

/**
 * Window IPC Handlers
 * Handles window control operations
 */
function registerWindowHandlers(): void {
  // Minimize window
  ipcMain.on('window:minimize', () => {
    const window = BrowserWindow.getFocusedWindow();
    window?.minimize();
  });

  // Maximize/restore window
  ipcMain.on('window:maximize', () => {
    const window = BrowserWindow.getFocusedWindow();
    if (window?.isMaximized()) {
      window.restore();
    } else {
      window?.maximize();
    }
  });

  // Close window
  ipcMain.on('window:close', () => {
    const window = BrowserWindow.getFocusedWindow();
    window?.close();
  });
}

/**
 * Register all IPC handlers
 * Call this function during app initialization
 */
export function registerHandlers(): void {
  console.log('Registering IPC handlers...');

  registerAIServiceHandlers();
  registerBridgeServiceHandlers();
  registerDatabaseHandlers();
  registerAppHandlers();
  registerWindowHandlers();

  console.log('IPC handlers registered');
}

/**
 * Unregister all IPC handlers
 * Call this function during app shutdown if needed
 */
export function unregisterHandlers(): void {
  // Remove AI service handlers
  ipcMain.removeHandler('ai:extract-invoice');
  ipcMain.removeHandler('ai:check-health');
  ipcMain.removeHandler('ai:get-status');

  // Remove Bridge service handlers
  ipcMain.removeHandler('bridge:check-health');
  ipcMain.removeHandler('bridge:get-vendors');
  ipcMain.removeHandler('bridge:get-vendor-by-rfc');
  ipcMain.removeHandler('bridge:create-vendor');
  ipcMain.removeHandler('bridge:check-duplicate');
  ipcMain.removeHandler('bridge:create-entry');

  // Remove Database handlers
  ipcMain.removeHandler('db:get-invoices');
  ipcMain.removeHandler('db:get-invoice');
  ipcMain.removeHandler('db:save-invoice');
  ipcMain.removeHandler('db:update-invoice');
  ipcMain.removeHandler('db:delete-invoice');

  // Remove App handlers
  ipcMain.removeHandler('app:get-version');
  ipcMain.removeHandler('app:get-config');
  ipcMain.removeHandler('app:open-file-dialog');
  ipcMain.removeHandler('app:save-file-dialog');

  // Note: ipcMain.on listeners (window handlers) would need
  // to be removed with removeListener if references were kept

  console.log('IPC handlers unregistered');
}

// Export individual registration functions for testing
export {
  registerAIServiceHandlers,
  registerBridgeServiceHandlers,
  registerDatabaseHandlers,
  registerAppHandlers,
  registerWindowHandlers,
};
