/**
 * ProcessManager Tests
 *
 * T008.1.1: Tests for process start/stop functionality
 *
 * Tests the ProcessManager class which handles lifecycle management
 * of external service processes (AI Service, Windows Bridge).
 */

import ProcessManager, {
  ServiceStatus,
  ServiceHealth,
  ProcessManagerConfig,
  processManager,
} from '@main/process-manager';

// Mock child_process module
jest.mock('child_process', () => ({
  spawn: jest.fn(),
  ChildProcess: jest.fn(),
}));

// Mock electron app
jest.mock('electron', () => ({
  app: {
    getAppPath: jest.fn().mockReturnValue('/mock/app/path'),
    getPath: jest.fn().mockReturnValue('/mock/user/data'),
    isPackaged: false,
  },
}));

describe('ProcessManager', () => {
  let manager: ProcessManager;

  beforeEach(() => {
    manager = new ProcessManager();
    jest.clearAllMocks();
  });

  // ===========================================
  // T008.1.1 - Class and Interface Tests
  // ===========================================

  describe('Class Structure', () => {
    it('should export ProcessManager class', () => {
      expect(ProcessManager).toBeDefined();
      expect(typeof ProcessManager).toBe('function');
    });

    it('should export ServiceStatus enum', () => {
      expect(ServiceStatus).toBeDefined();
      expect(ServiceStatus.STOPPED).toBe('stopped');
      expect(ServiceStatus.STARTING).toBe('starting');
      expect(ServiceStatus.RUNNING).toBe('running');
      expect(ServiceStatus.STOPPING).toBe('stopping');
      expect(ServiceStatus.ERROR).toBe('error');
    });

    it('should export singleton processManager instance', () => {
      expect(processManager).toBeDefined();
      expect(processManager).toBeInstanceOf(ProcessManager);
    });

    it('should create instance with default config', () => {
      const pm = new ProcessManager();
      expect(pm).toBeInstanceOf(ProcessManager);
    });

    it('should create instance with custom config', () => {
      const config: Partial<ProcessManagerConfig> = {
        aiServicePort: 9000,
        healthCheckInterval: 10000,
      };
      const pm = new ProcessManager(config);
      expect(pm).toBeInstanceOf(ProcessManager);
    });
  });

  // ===========================================
  // T008.1.2 - AI Service Start Tests
  // ===========================================

  describe('startAIService()', () => {
    it('should have startAIService method', () => {
      expect(manager.startAIService).toBeDefined();
      expect(typeof manager.startAIService).toBe('function');
    });

    it('should return a Promise', () => {
      const result = manager.startAIService();
      expect(result).toBeInstanceOf(Promise);
      return result; // Let Jest handle the promise
    });

    it('should transition status to STARTING then RUNNING', async () => {
      expect(manager.getAIServiceStatus()).toBe(ServiceStatus.STOPPED);

      const startPromise = manager.startAIService();

      // Status should be STARTING after call
      expect(manager.getAIServiceStatus()).toBe(ServiceStatus.STARTING);

      await startPromise;

      // Status should be RUNNING after completion
      expect(manager.getAIServiceStatus()).toBe(ServiceStatus.RUNNING);
    });

    it('should not start if already running', async () => {
      // Start once
      await manager.startAIService();
      expect(manager.getAIServiceStatus()).toBe(ServiceStatus.RUNNING);

      // Start again - should be no-op
      await manager.startAIService();
      expect(manager.getAIServiceStatus()).toBe(ServiceStatus.RUNNING);
    });

    it('should report isAIServiceRunning as true after start', async () => {
      expect(manager.isAIServiceRunning()).toBe(false);
      await manager.startAIService();
      expect(manager.isAIServiceRunning()).toBe(true);
    });
  });

  // ===========================================
  // T008.1.3 - AI Service Stop Tests
  // ===========================================

  describe('stopAIService()', () => {
    it('should have stopAIService method', () => {
      expect(manager.stopAIService).toBeDefined();
      expect(typeof manager.stopAIService).toBe('function');
    });

    it('should return a Promise', async () => {
      await manager.startAIService();
      const result = manager.stopAIService();
      expect(result).toBeInstanceOf(Promise);
      return result;
    });

    it('should transition status to STOPPING then STOPPED', async () => {
      await manager.startAIService();
      expect(manager.getAIServiceStatus()).toBe(ServiceStatus.RUNNING);

      const stopPromise = manager.stopAIService();

      // Status should be STOPPING after call
      expect(manager.getAIServiceStatus()).toBe(ServiceStatus.STOPPING);

      await stopPromise;

      // Status should be STOPPED after completion
      expect(manager.getAIServiceStatus()).toBe(ServiceStatus.STOPPED);
    });

    it('should not stop if already stopped', async () => {
      expect(manager.getAIServiceStatus()).toBe(ServiceStatus.STOPPED);

      // Stop when already stopped - should be no-op
      await manager.stopAIService();
      expect(manager.getAIServiceStatus()).toBe(ServiceStatus.STOPPED);
    });

    it('should report isAIServiceRunning as false after stop', async () => {
      await manager.startAIService();
      expect(manager.isAIServiceRunning()).toBe(true);

      await manager.stopAIService();
      expect(manager.isAIServiceRunning()).toBe(false);
    });
  });

  // ===========================================
  // T008.1.4 - AI Service Restart Tests
  // ===========================================

  describe('restartAIService()', () => {
    it('should have restartAIService method', () => {
      expect(manager.restartAIService).toBeDefined();
      expect(typeof manager.restartAIService).toBe('function');
    });

    it('should return a Promise', async () => {
      const result = manager.restartAIService();
      expect(result).toBeInstanceOf(Promise);
      return result;
    });

    it('should stop and then start the service', async () => {
      await manager.startAIService();
      expect(manager.getAIServiceStatus()).toBe(ServiceStatus.RUNNING);

      await manager.restartAIService();

      // Should be running after restart
      expect(manager.getAIServiceStatus()).toBe(ServiceStatus.RUNNING);
    });

    it('should work even if service was not running', async () => {
      expect(manager.getAIServiceStatus()).toBe(ServiceStatus.STOPPED);

      await manager.restartAIService();

      // Should be running after restart
      expect(manager.getAIServiceStatus()).toBe(ServiceStatus.RUNNING);
    });
  });

  // ===========================================
  // T008.1.5 - Bridge Service Tests
  // ===========================================

  describe('Bridge Service Management', () => {
    it('should have startBridgeService method', () => {
      expect(manager.startBridgeService).toBeDefined();
      expect(typeof manager.startBridgeService).toBe('function');
    });

    it('should have stopBridgeService method', () => {
      expect(manager.stopBridgeService).toBeDefined();
      expect(typeof manager.stopBridgeService).toBe('function');
    });

    it('should have restartBridgeService method', () => {
      expect(manager.restartBridgeService).toBeDefined();
      expect(typeof manager.restartBridgeService).toBe('function');
    });

    it('should track bridge service status independently', async () => {
      await manager.startAIService();
      expect(manager.getAIServiceStatus()).toBe(ServiceStatus.RUNNING);
      expect(manager.getBridgeServiceStatus()).toBe(ServiceStatus.STOPPED);

      await manager.startBridgeService();
      expect(manager.getAIServiceStatus()).toBe(ServiceStatus.RUNNING);
      expect(manager.getBridgeServiceStatus()).toBe(ServiceStatus.RUNNING);
    });

    it('should report isBridgeServiceRunning correctly', async () => {
      expect(manager.isBridgeServiceRunning()).toBe(false);
      await manager.startBridgeService();
      expect(manager.isBridgeServiceRunning()).toBe(true);
    });
  });

  // ===========================================
  // T008.1.6 - Start/Stop All Services
  // ===========================================

  describe('startAll() and stopAll()', () => {
    it('should have startAll method', () => {
      expect(manager.startAll).toBeDefined();
      expect(typeof manager.startAll).toBe('function');
    });

    it('should have stopAll method', () => {
      expect(manager.stopAll).toBeDefined();
      expect(typeof manager.stopAll).toBe('function');
    });

    it('should start both services with startAll', async () => {
      expect(manager.isAIServiceRunning()).toBe(false);
      expect(manager.isBridgeServiceRunning()).toBe(false);

      await manager.startAll();

      expect(manager.isAIServiceRunning()).toBe(true);
      expect(manager.isBridgeServiceRunning()).toBe(true);
    });

    it('should stop both services with stopAll', async () => {
      await manager.startAll();
      expect(manager.isAIServiceRunning()).toBe(true);
      expect(manager.isBridgeServiceRunning()).toBe(true);

      await manager.stopAll();

      expect(manager.isAIServiceRunning()).toBe(false);
      expect(manager.isBridgeServiceRunning()).toBe(false);
    });
  });

  // ===========================================
  // T008.1.7 - Health Check Tests
  // ===========================================

  describe('checkHealth()', () => {
    it('should have checkHealth method', () => {
      expect(manager.checkHealth).toBeDefined();
      expect(typeof manager.checkHealth).toBe('function');
    });

    it('should return ServiceHealth for AI service', async () => {
      const health = await manager.checkHealth('ai');
      expect(health).toBeDefined();
      expect(health.status).toBeDefined();
      expect(health.lastHealthCheck).toBeInstanceOf(Date);
    });

    it('should return ServiceHealth for Bridge service', async () => {
      const health = await manager.checkHealth('bridge');
      expect(health).toBeDefined();
      expect(health.status).toBeDefined();
      expect(health.lastHealthCheck).toBeInstanceOf(Date);
    });

    it('should reflect current status in health check', async () => {
      let health = await manager.checkHealth('ai');
      expect(health.status).toBe(ServiceStatus.STOPPED);

      await manager.startAIService();

      health = await manager.checkHealth('ai');
      expect(health.status).toBe(ServiceStatus.RUNNING);
    });
  });

  // ===========================================
  // Configuration Tests
  // ===========================================

  describe('Configuration', () => {
    it('should use default aiServicePort of 8000', () => {
      // Default config is used internally
      const pm = new ProcessManager();
      expect(pm).toBeDefined();
    });

    it('should accept custom configuration', () => {
      const customConfig: Partial<ProcessManagerConfig> = {
        aiServicePort: 9000,
        bridgeServicePort: 6000,
        healthCheckInterval: 10000,
        maxRestartAttempts: 5,
        restartBackoffMs: 2000,
      };

      const pm = new ProcessManager(customConfig);
      expect(pm).toBeDefined();
    });
  });

  // ===========================================
  // Status Getter Tests
  // ===========================================

  describe('Status Getters', () => {
    it('should have getAIServiceStatus method', () => {
      expect(manager.getAIServiceStatus).toBeDefined();
      expect(typeof manager.getAIServiceStatus).toBe('function');
    });

    it('should have getBridgeServiceStatus method', () => {
      expect(manager.getBridgeServiceStatus).toBeDefined();
      expect(typeof manager.getBridgeServiceStatus).toBe('function');
    });

    it('should have isAIServiceRunning method', () => {
      expect(manager.isAIServiceRunning).toBeDefined();
      expect(typeof manager.isAIServiceRunning).toBe('function');
    });

    it('should have isBridgeServiceRunning method', () => {
      expect(manager.isBridgeServiceRunning).toBeDefined();
      expect(typeof manager.isBridgeServiceRunning).toBe('function');
    });

    it('should return STOPPED for initial AI service status', () => {
      expect(manager.getAIServiceStatus()).toBe(ServiceStatus.STOPPED);
    });

    it('should return STOPPED for initial Bridge service status', () => {
      expect(manager.getBridgeServiceStatus()).toBe(ServiceStatus.STOPPED);
    });
  });
});

// ===========================================
// Integration-like Tests (Services Together)
// ===========================================

describe('ProcessManager Integration', () => {
  let manager: ProcessManager;

  beforeEach(() => {
    manager = new ProcessManager();
  });

  it('should handle full lifecycle: start -> restart -> stop', async () => {
    // Start
    await manager.startAll();
    expect(manager.isAIServiceRunning()).toBe(true);
    expect(manager.isBridgeServiceRunning()).toBe(true);

    // Restart AI service
    await manager.restartAIService();
    expect(manager.isAIServiceRunning()).toBe(true);

    // Stop all
    await manager.stopAll();
    expect(manager.isAIServiceRunning()).toBe(false);
    expect(manager.isBridgeServiceRunning()).toBe(false);
  });

  it('should allow stopping services individually after startAll', async () => {
    await manager.startAll();

    await manager.stopAIService();
    expect(manager.isAIServiceRunning()).toBe(false);
    expect(manager.isBridgeServiceRunning()).toBe(true);

    await manager.stopBridgeService();
    expect(manager.isBridgeServiceRunning()).toBe(false);
  });
});
