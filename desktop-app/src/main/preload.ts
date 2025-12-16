/**
 * ContPAQ Win - Electron Preload Script
 *
 * This script runs in an isolated context before the renderer process loads.
 * It uses contextBridge to safely expose a limited API to the renderer,
 * maintaining security while enabling IPC communication.
 *
 * SECURITY NOTES:
 * - Never expose the entire ipcRenderer object
 * - Only expose specific, validated channels
 * - Use invoke for request/response patterns
 * - Use send for fire-and-forget messages
 */

import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';

/**
 * Type definitions for the exposed API
 */
export interface ElectronAPI {
  // Two-way IPC (request/response)
  invoke: (channel: string, ...args: unknown[]) => Promise<unknown>;

  // One-way IPC (fire and forget)
  send: (channel: string, ...args: unknown[]) => void;

  // Subscribe to events from main process
  on: (channel: string, callback: (...args: unknown[]) => void) => void;

  // Unsubscribe from events
  removeListener: (channel: string, callback: (...args: unknown[]) => void) => void;

  // Remove all listeners for a channel
  removeAllListeners: (channel: string) => void;
}

/**
 * Allowed IPC channels for security
 * Only these channels can be used for communication
 */
const validInvokeChannels: string[] = [
  // AI Service
  'ai:extract-invoice',
  'ai:check-health',
  'ai:get-status',

  // Windows Bridge
  'bridge:check-health',
  'bridge:get-vendors',
  'bridge:get-vendor-by-rfc',
  'bridge:create-vendor',
  'bridge:check-duplicate',
  'bridge:create-entry',

  // Database
  'db:get-invoices',
  'db:get-invoice',
  'db:save-invoice',
  'db:update-invoice',
  'db:delete-invoice',

  // App
  'app:get-version',
  'app:get-config',
  'app:open-file-dialog',
  'app:save-file-dialog',
];

const validSendChannels: string[] = [
  'app:log',
  'app:error',
  'window:minimize',
  'window:maximize',
  'window:close',
];

const validReceiveChannels: string[] = [
  'ai:status-changed',
  'bridge:status-changed',
  'app:update-available',
  'app:update-downloaded',
  'invoice:processing-progress',
];

/**
 * Validates if a channel is allowed
 */
function isValidChannel(channel: string, validChannels: string[]): boolean {
  return validChannels.includes(channel);
}

/**
 * Exposed API object
 * This is the only interface available to the renderer process
 */
const electronAPI: ElectronAPI = {
  /**
   * Invoke a handler in the main process and wait for response
   * Use for request/response patterns
   */
  invoke: (channel: string, ...args: unknown[]): Promise<unknown> => {
    if (!isValidChannel(channel, validInvokeChannels)) {
      return Promise.reject(new Error(`Invalid invoke channel: ${channel}`));
    }
    return ipcRenderer.invoke(channel, ...args);
  },

  /**
   * Send a message to the main process (fire and forget)
   * Use for notifications that don't need a response
   */
  send: (channel: string, ...args: unknown[]): void => {
    if (!isValidChannel(channel, validSendChannels)) {
      console.error(`Invalid send channel: ${channel}`);
      return;
    }
    ipcRenderer.send(channel, ...args);
  },

  /**
   * Subscribe to events from the main process
   */
  on: (channel: string, callback: (...args: unknown[]) => void): void => {
    if (!isValidChannel(channel, validReceiveChannels)) {
      console.error(`Invalid receive channel: ${channel}`);
      return;
    }
    // Wrap callback to strip the event object for security
    const subscription = (_event: IpcRendererEvent, ...args: unknown[]) => {
      callback(...args);
    };
    ipcRenderer.on(channel, subscription);
  },

  /**
   * Remove a specific listener for a channel
   */
  removeListener: (channel: string, callback: (...args: unknown[]) => void): void => {
    if (!isValidChannel(channel, validReceiveChannels)) {
      return;
    }
    ipcRenderer.removeListener(channel, callback as (event: IpcRendererEvent, ...args: unknown[]) => void);
  },

  /**
   * Remove all listeners for a channel
   */
  removeAllListeners: (channel: string): void => {
    if (!isValidChannel(channel, validReceiveChannels)) {
      return;
    }
    ipcRenderer.removeAllListeners(channel);
  },
};

/**
 * Expose the API to the renderer process under window.electronAPI
 * This is the secure way to provide IPC access
 */
contextBridge.exposeInMainWorld('electronAPI', electronAPI);

// Also expose under 'api' for convenience
contextBridge.exposeInMainWorld('api', electronAPI);

/**
 * Type declaration for global window object
 * This allows TypeScript to recognize window.electronAPI and window.api
 */
declare global {
  interface Window {
    electronAPI: ElectronAPI;
    api: ElectronAPI;
  }
}
