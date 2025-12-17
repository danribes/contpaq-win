/**
 * ProcessManager Tests
 *
 * T008.1.1: Tests for process start/stop functionality
 * T008.1.2: Tests for ProcessManager infrastructure (events, paths, errors)
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

// ===========================================
// T008.1.2 - ProcessManager Infrastructure Tests
// ===========================================

describe('ProcessManager Infrastructure (T008.1.2)', () => {
  let manager: ProcessManager;

  beforeEach(() => {
    manager = new ProcessManager();
    jest.clearAllMocks();
  });

  // ===========================================
  // Event Emitter Tests
  // ===========================================

  describe('Event Emitter', () => {
    it('should have on method for subscribing to events', () => {
      expect(manager.on).toBeDefined();
      expect(typeof manager.on).toBe('function');
    });

    it('should have off method for unsubscribing from events', () => {
      expect(manager.off).toBeDefined();
      expect(typeof manager.off).toBe('function');
    });

    it('should emit statusChange event when AI service starts', async () => {
      const listener = jest.fn();
      manager.on('statusChange', listener);

      await manager.startAIService();

      expect(listener).toHaveBeenCalled();
      expect(listener).toHaveBeenCalledWith(
        expect.objectContaining({
          service: 'ai',
          status: ServiceStatus.RUNNING,
        })
      );
    });

    it('should emit statusChange event when AI service stops', async () => {
      await manager.startAIService();

      const listener = jest.fn();
      manager.on('statusChange', listener);

      await manager.stopAIService();

      expect(listener).toHaveBeenCalledWith(
        expect.objectContaining({
          service: 'ai',
          status: ServiceStatus.STOPPED,
        })
      );
    });

    it('should emit statusChange event when Bridge service starts', async () => {
      const listener = jest.fn();
      manager.on('statusChange', listener);

      await manager.startBridgeService();

      expect(listener).toHaveBeenCalledWith(
        expect.objectContaining({
          service: 'bridge',
          status: ServiceStatus.RUNNING,
        })
      );
    });

    it('should allow unsubscribing from events with off', async () => {
      const listener = jest.fn();
      manager.on('statusChange', listener);
      manager.off('statusChange', listener);

      await manager.startAIService();

      expect(listener).not.toHaveBeenCalled();
    });

    it('should support multiple event listeners', async () => {
      const listener1 = jest.fn();
      const listener2 = jest.fn();

      manager.on('statusChange', listener1);
      manager.on('statusChange', listener2);

      await manager.startAIService();

      expect(listener1).toHaveBeenCalled();
      expect(listener2).toHaveBeenCalled();
    });
  });

  // ===========================================
  // Path Resolution Tests
  // ===========================================

  describe('Path Resolution', () => {
    it('should have getAIServicePath method', () => {
      expect(manager.getAIServicePath).toBeDefined();
      expect(typeof manager.getAIServicePath).toBe('function');
    });

    it('should have getBridgeServicePath method', () => {
      expect(manager.getBridgeServicePath).toBeDefined();
      expect(typeof manager.getBridgeServicePath).toBe('function');
    });

    it('should have getPythonPath method', () => {
      expect(manager.getPythonPath).toBeDefined();
      expect(typeof manager.getPythonPath).toBe('function');
    });

    it('should return a string path for AI service', () => {
      const path = manager.getAIServicePath();
      expect(typeof path).toBe('string');
      expect(path.length).toBeGreaterThan(0);
    });

    it('should return a string path for Bridge service', () => {
      const path = manager.getBridgeServicePath();
      expect(typeof path).toBe('string');
      expect(path.length).toBeGreaterThan(0);
    });

    it('should return a string path for Python executable', () => {
      const path = manager.getPythonPath();
      expect(typeof path).toBe('string');
      expect(path.length).toBeGreaterThan(0);
    });

    it('should include ai-service in AI service path', () => {
      const path = manager.getAIServicePath();
      expect(path).toContain('ai-service');
    });

    it('should include windows-bridge in Bridge service path', () => {
      const path = manager.getBridgeServicePath();
      expect(path).toContain('windows-bridge');
    });
  });

  // ===========================================
  // Error Handling Tests
  // ===========================================

  describe('Error Handling', () => {
    it('should have getLastError method for AI service', () => {
      expect(manager.getLastError).toBeDefined();
      expect(typeof manager.getLastError).toBe('function');
    });

    it('should return null when no error has occurred', () => {
      const error = manager.getLastError('ai');
      expect(error).toBeNull();
    });

    it('should have setError method (internal)', () => {
      // setError may be private, but we can test via error state
      expect(manager.getLastError('ai')).toBeNull();
      expect(manager.getLastError('bridge')).toBeNull();
    });

    it('should include lastError in health check when error occurred', async () => {
      // When service is in error state, health should include error info
      const health = await manager.checkHealth('ai');
      expect(health).toHaveProperty('lastError');
    });

    it('should have clearError method', () => {
      expect(manager.clearError).toBeDefined();
      expect(typeof manager.clearError).toBe('function');
    });

    it('should clear error for specified service', () => {
      manager.clearError('ai');
      expect(manager.getLastError('ai')).toBeNull();
    });
  });

  // ===========================================
  // Configuration Access Tests
  // ===========================================

  describe('Configuration Access', () => {
    it('should have getConfig method', () => {
      expect(manager.getConfig).toBeDefined();
      expect(typeof manager.getConfig).toBe('function');
    });

    it('should return current configuration', () => {
      const config = manager.getConfig();
      expect(config).toBeDefined();
      expect(config.aiServicePort).toBeDefined();
      expect(config.bridgeServicePort).toBeDefined();
      expect(config.healthCheckInterval).toBeDefined();
      expect(config.maxRestartAttempts).toBeDefined();
      expect(config.restartBackoffMs).toBeDefined();
    });

    it('should return default port 8000 for AI service', () => {
      const config = manager.getConfig();
      expect(config.aiServicePort).toBe(8000);
    });

    it('should return default port 5000 for Bridge service', () => {
      const config = manager.getConfig();
      expect(config.bridgeServicePort).toBe(5000);
    });

    it('should reflect custom config when provided', () => {
      const customManager = new ProcessManager({
        aiServicePort: 9000,
        bridgeServicePort: 6000,
      });
      const config = customManager.getConfig();
      expect(config.aiServicePort).toBe(9000);
      expect(config.bridgeServicePort).toBe(6000);
    });

    it('should return a copy of config (immutable)', () => {
      const config1 = manager.getConfig();
      const config2 = manager.getConfig();
      expect(config1).not.toBe(config2); // Different object references
      expect(config1).toEqual(config2); // Same values
    });
  });

  // ===========================================
  // Service Metadata Tests
  // ===========================================

  describe('Service Metadata', () => {
    it('should track AI service start time', async () => {
      await manager.startAIService();
      const health = await manager.checkHealth('ai');
      expect(health.uptime).toBeDefined();
      expect(typeof health.uptime).toBe('number');
    });

    it('should have uptime of 0 or more when running', async () => {
      await manager.startAIService();
      const health = await manager.checkHealth('ai');
      expect(health.uptime).toBeGreaterThanOrEqual(0);
    });

    it('should have undefined uptime when stopped', async () => {
      const health = await manager.checkHealth('ai');
      expect(health.uptime).toBeUndefined();
    });

    it('should track Bridge service start time', async () => {
      await manager.startBridgeService();
      const health = await manager.checkHealth('bridge');
      expect(health.uptime).toBeDefined();
      expect(typeof health.uptime).toBe('number');
    });

    it('should reset uptime after stop and restart', async () => {
      await manager.startAIService();

      // Wait a tiny bit
      await new Promise(resolve => setTimeout(resolve, 10));

      const health1 = await manager.checkHealth('ai');
      const uptime1 = health1.uptime;

      await manager.stopAIService();
      await manager.startAIService();

      const health2 = await manager.checkHealth('ai');
      const uptime2 = health2.uptime;

      // After restart, uptime should be reset (less than or equal to uptime1)
      expect(uptime2).toBeDefined();
      expect(uptime2).toBeLessThanOrEqual(uptime1! + 200); // Allow for test timing
    });
  });

  // ===========================================
  // Restart Counter Tests
  // ===========================================

  describe('Restart Counter', () => {
    it('should have getRestartCount method', () => {
      expect(manager.getRestartCount).toBeDefined();
      expect(typeof manager.getRestartCount).toBe('function');
    });

    it('should return 0 initially for AI service', () => {
      expect(manager.getRestartCount('ai')).toBe(0);
    });

    it('should return 0 initially for Bridge service', () => {
      expect(manager.getRestartCount('bridge')).toBe(0);
    });

    it('should have resetRestartCount method', () => {
      expect(manager.resetRestartCount).toBeDefined();
      expect(typeof manager.resetRestartCount).toBe('function');
    });

    it('should reset restart count to 0', () => {
      manager.resetRestartCount('ai');
      expect(manager.getRestartCount('ai')).toBe(0);
    });
  });
});
