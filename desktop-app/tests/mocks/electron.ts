/**
 * Electron IPC Mock
 *
 * Provides mock implementations for Electron's IPC communication
 * for testing renderer process code without a real Electron environment.
 */

type IpcCallback = (event: unknown, ...args: unknown[]) => void;

interface MockIpcRenderer {
  invoke: jest.Mock;
  send: jest.Mock;
  on: jest.Mock;
  once: jest.Mock;
  removeListener: jest.Mock;
  removeAllListeners: jest.Mock;
}

interface MockElectronAPI {
  invoke: jest.Mock;
  send: jest.Mock;
  on: jest.Mock;
  removeListener: jest.Mock;
}

/**
 * Create a fresh mock IPC renderer
 */
export function createMockIpcRenderer(): MockIpcRenderer {
  const listeners: Map<string, IpcCallback[]> = new Map();

  return {
    invoke: jest.fn().mockResolvedValue(undefined),
    send: jest.fn(),
    on: jest.fn((channel: string, callback: IpcCallback) => {
      const existing = listeners.get(channel) || [];
      listeners.set(channel, [...existing, callback]);
    }),
    once: jest.fn((channel: string, callback: IpcCallback) => {
      const existing = listeners.get(channel) || [];
      listeners.set(channel, [...existing, callback]);
    }),
    removeListener: jest.fn((channel: string, callback: IpcCallback) => {
      const existing = listeners.get(channel) || [];
      listeners.set(channel, existing.filter(cb => cb !== callback));
    }),
    removeAllListeners: jest.fn((channel?: string) => {
      if (channel) {
        listeners.delete(channel);
      } else {
        listeners.clear();
      }
    }),
  };
}

/**
 * Create a mock Electron API (exposed via preload)
 */
export function createMockElectronAPI(): MockElectronAPI {
  return {
    invoke: jest.fn().mockResolvedValue(undefined),
    send: jest.fn(),
    on: jest.fn(),
    removeListener: jest.fn(),
  };
}

/**
 * Default mock responses for common IPC channels
 */
export const defaultMockResponses = {
  // AI Service
  'ai:health': {
    status: 'healthy',
    version: '1.0.0',
    modelsLoaded: true,
    ocrAvailable: true,
  },
  'ai:extract': {
    success: true,
    data: {
      vendorRfc: 'XAXX010101000',
      vendorName: 'Proveedor de Prueba',
      invoiceNumber: 'F-001',
      invoiceDate: '2024-01-15',
      subtotal: 10000.0,
      ivaAmount: 1600.0,
      total: 11600.0,
      lineItems: [],
    },
    processingTimeMs: 1500,
  },

  // Bridge Service
  'bridge:health': {
    status: 'healthy',
    sdkVersion: '13.0.0',
    connected: true,
    company: 'Empresa de Prueba',
  },
  'bridge:vendors': [],
  'bridge:checkDuplicate': { isDuplicate: false },
  'bridge:createEntry': { success: true, folio: 'POL-001' },

  // Database
  'db:getInvoices': [],
  'db:getInvoice': null,
  'db:saveInvoice': { id: '1' },

  // App
  'app:getVersion': '0.1.0',
  'app:getPlatform': 'win32',
};

/**
 * Setup mock Electron API with default responses
 */
export function setupMockElectronAPI(
  customResponses: Partial<typeof defaultMockResponses> = {}
): MockElectronAPI {
  const responses = { ...defaultMockResponses, ...customResponses };
  const mockAPI = createMockElectronAPI();

  mockAPI.invoke.mockImplementation((channel: string) => {
    const response = responses[channel as keyof typeof responses];
    return Promise.resolve(response);
  });

  // Attach to window
  (window as unknown as { electron: MockElectronAPI }).electron = mockAPI;

  return mockAPI;
}

/**
 * Reset all Electron mocks
 */
export function resetElectronMocks(): void {
  const mockAPI = (window as unknown as { electron: MockElectronAPI }).electron;
  if (mockAPI) {
    mockAPI.invoke.mockClear();
    mockAPI.send.mockClear();
    mockAPI.on.mockClear();
    mockAPI.removeListener.mockClear();
  }
}

export default {
  createMockIpcRenderer,
  createMockElectronAPI,
  setupMockElectronAPI,
  resetElectronMocks,
  defaultMockResponses,
};
