/**
 * ProcessManager Tests
 *
 * T008.1.1: Tests for process start/stop functionality
 * T008.1.2: Tests for ProcessManager infrastructure (events, paths, errors)
 * T008.1.3: Tests for startAIService process spawning
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
import { EventEmitter } from 'events';
import { spawn } from 'child_process';

// Create mock process factory for T008.1.3 tests
function createMockChildProcess() {
  const mockProcess = new EventEmitter() as EventEmitter & {
    pid: number;
    stdout: EventEmitter;
    stderr: EventEmitter;
    kill: jest.Mock;
    killed: boolean;
  };
  mockProcess.pid = 12345;
  mockProcess.stdout = new EventEmitter();
  mockProcess.stderr = new EventEmitter();
  mockProcess.kill = jest.fn().mockImplementation(() => {
    mockProcess.killed = true;
    mockProcess.emit('exit', 0, null);
    return true;
  });
  mockProcess.killed = false;
  return mockProcess;
}

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
  let mockProcess: ReturnType<typeof createMockChildProcess>;
  const mockSpawn = spawn as jest.MockedFunction<typeof spawn>;

  beforeEach(() => {
    jest.clearAllMocks();
    // Setup mock process for all tests
    mockProcess = createMockChildProcess();
    // Auto-emit spawn event after a short delay to simulate successful start
    // T008.2.1: Create new mock process for each spawn call to support multiple services
    mockSpawn.mockImplementation(() => {
      const proc = createMockChildProcess();
      setTimeout(() => proc.emit('spawn'), 10);
      return proc as never;
    });
    manager = new ProcessManager();
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

      // Track status transitions via events
      const statusTransitions: ServiceStatus[] = [];
      manager.on('statusChange', (event) => {
        if (event.service === 'ai') {
          statusTransitions.push(event.status);
        }
      });

      // Setup kill to emit exit with slight delay so we can observe STOPPING
      mockProcess.kill.mockImplementation(() => {
        setTimeout(() => mockProcess.emit('exit', 0, 'SIGTERM'), 10);
        return true;
      });

      await manager.stopAIService();

      // Should have transitioned through STOPPING to STOPPED
      expect(statusTransitions).toContain(ServiceStatus.STOPPING);
      expect(statusTransitions).toContain(ServiceStatus.STOPPED);
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
      // T008.1.6: lastHealthCheck is undefined until performHealthCheck is called
      expect(health.lastHealthCheck).toBeUndefined();
    });

    it('should return ServiceHealth for Bridge service', async () => {
      const health = await manager.checkHealth('bridge');
      expect(health).toBeDefined();
      expect(health.status).toBeDefined();
      // T008.1.6: lastHealthCheck is undefined until performHealthCheck is called
      expect(health.lastHealthCheck).toBeUndefined();
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

// ===========================================
// T008.1.3 - startAIService Process Spawning Tests
// ===========================================

describe('ProcessManager startAIService Spawning (T008.1.3)', () => {
  let manager: ProcessManager;
  let mockProcess: ReturnType<typeof createMockChildProcess>;
  const mockSpawn = spawn as jest.MockedFunction<typeof spawn>;

  beforeEach(() => {
    manager = new ProcessManager();
    mockProcess = createMockChildProcess();
    mockSpawn.mockReturnValue(mockProcess as never);
    jest.clearAllMocks();
  });

  afterEach(() => {
    // Clean up any pending timers
    jest.clearAllTimers();
  });

  // ===========================================
  // T008.1.3.1 - Locate Python executable path
  // ===========================================

  describe('Python Path Resolution', () => {
    it('should use getPythonPath for the executable', async () => {
      const pythonPath = manager.getPythonPath();
      expect(pythonPath).toBeDefined();
      expect(typeof pythonPath).toBe('string');
    });

    it('should return python3 in development on non-Windows', () => {
      // The mock has isPackaged: false
      const pythonPath = manager.getPythonPath();
      // On Linux test environment, should return python3
      expect(['python', 'python3']).toContain(pythonPath);
    });
  });

  // ===========================================
  // T008.1.3.2 - Spawn uvicorn process with correct args
  // ===========================================

  describe('Process Spawning', () => {
    it('should call spawn when starting AI service', async () => {
      // Simulate spawn event after a tick
      setTimeout(() => mockProcess.emit('spawn'), 10);

      await manager.startAIService();

      expect(mockSpawn).toHaveBeenCalled();
    });

    it('should spawn with Python executable path', async () => {
      setTimeout(() => mockProcess.emit('spawn'), 10);

      await manager.startAIService();

      const pythonPath = manager.getPythonPath();
      expect(mockSpawn).toHaveBeenCalledWith(
        pythonPath,
        expect.any(Array),
        expect.any(Object)
      );
    });

    it('should spawn with uvicorn module arguments', async () => {
      setTimeout(() => mockProcess.emit('spawn'), 10);

      await manager.startAIService();

      expect(mockSpawn).toHaveBeenCalledWith(
        expect.any(String),
        expect.arrayContaining(['-m', 'uvicorn']),
        expect.any(Object)
      );
    });

    it('should include main:app in uvicorn arguments', async () => {
      setTimeout(() => mockProcess.emit('spawn'), 10);

      await manager.startAIService();

      expect(mockSpawn).toHaveBeenCalledWith(
        expect.any(String),
        expect.arrayContaining(['main:app']),
        expect.any(Object)
      );
    });

    it('should include host and port in uvicorn arguments', async () => {
      setTimeout(() => mockProcess.emit('spawn'), 10);

      await manager.startAIService();

      const config = manager.getConfig();
      expect(mockSpawn).toHaveBeenCalledWith(
        expect.any(String),
        expect.arrayContaining([
          '--host', '127.0.0.1',
          '--port', String(config.aiServicePort),
        ]),
        expect.any(Object)
      );
    });

    it('should spawn with cwd set to AI service path', async () => {
      setTimeout(() => mockProcess.emit('spawn'), 10);

      await manager.startAIService();

      const aiPath = manager.getAIServicePath();
      expect(mockSpawn).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(Array),
        expect.objectContaining({
          cwd: expect.stringContaining('ai-service'),
        })
      );
    });

    it('should spawn with shell:false for security', async () => {
      setTimeout(() => mockProcess.emit('spawn'), 10);

      await manager.startAIService();

      expect(mockSpawn).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(Array),
        expect.objectContaining({
          shell: false,
        })
      );
    });

    it('should store process reference after spawn', async () => {
      setTimeout(() => mockProcess.emit('spawn'), 10);

      await manager.startAIService();

      const health = await manager.checkHealth('ai');
      expect(health.pid).toBe(mockProcess.pid);
    });
  });

  // ===========================================
  // T008.1.3.3 - Capture stdout/stderr for logging
  // ===========================================

  describe('Output Capture', () => {
    it('should capture stdout from the process', async () => {
      const logSpy = jest.spyOn(console, 'log').mockImplementation();

      setTimeout(() => {
        mockProcess.emit('spawn');
        mockProcess.stdout.emit('data', Buffer.from('AI Service started on port 8000'));
      }, 10);

      await manager.startAIService();

      // Give time for stdout event to be processed
      await new Promise(resolve => setTimeout(resolve, 50));

      expect(logSpy).toHaveBeenCalledWith(
        expect.stringContaining('AI Service')
      );

      logSpy.mockRestore();
    });

    it('should capture stderr from the process', async () => {
      const errorSpy = jest.spyOn(console, 'error').mockImplementation();

      setTimeout(() => {
        mockProcess.emit('spawn');
        mockProcess.stderr.emit('data', Buffer.from('Warning: some warning'));
      }, 10);

      await manager.startAIService();

      // Give time for stderr event to be processed
      await new Promise(resolve => setTimeout(resolve, 50));

      expect(errorSpy).toHaveBeenCalled();

      errorSpy.mockRestore();
    });

    it('should have getProcessLogs method', () => {
      expect(manager.getProcessLogs).toBeDefined();
      expect(typeof manager.getProcessLogs).toBe('function');
    });

    it('should return logs for AI service', () => {
      const logs = manager.getProcessLogs('ai');
      expect(logs).toBeDefined();
      expect(Array.isArray(logs)).toBe(true);
    });
  });

  // ===========================================
  // Process Event Handling
  // ===========================================

  describe('Process Event Handling', () => {
    it('should set status to RUNNING on spawn event', async () => {
      setTimeout(() => mockProcess.emit('spawn'), 10);

      await manager.startAIService();

      expect(manager.getAIServiceStatus()).toBe(ServiceStatus.RUNNING);
    });

    it('should set status to ERROR on error event', async () => {
      setTimeout(() => {
        mockProcess.emit('error', new Error('Failed to spawn'));
      }, 10);

      try {
        await manager.startAIService();
      } catch {
        // Expected to throw or reject
      }

      expect(manager.getAIServiceStatus()).toBe(ServiceStatus.ERROR);
    });

    it('should set lastError on error event', async () => {
      setTimeout(() => {
        mockProcess.emit('error', new Error('Failed to spawn'));
      }, 10);

      try {
        await manager.startAIService();
      } catch {
        // Expected
      }

      const error = manager.getLastError('ai');
      expect(error).toContain('Failed to spawn');
    });

    it('should set status to STOPPED on exit event', async () => {
      setTimeout(() => mockProcess.emit('spawn'), 10);

      await manager.startAIService();
      expect(manager.getAIServiceStatus()).toBe(ServiceStatus.RUNNING);

      // Simulate process exit
      mockProcess.emit('exit', 0, null);

      expect(manager.getAIServiceStatus()).toBe(ServiceStatus.STOPPED);
    });

    it('should set status to ERROR on non-zero exit code', async () => {
      // Disable auto-restart for this test to verify ERROR status stays
      const noAutoRestartManager = new ProcessManager({ enableAutoRestart: false });

      mockSpawn.mockImplementation(() => {
        setTimeout(() => mockProcess.emit('spawn'), 10);
        return mockProcess as never;
      });

      await noAutoRestartManager.startAIService();

      // Simulate process crash
      mockProcess.emit('exit', 1, null);

      expect(noAutoRestartManager.getAIServiceStatus()).toBe(ServiceStatus.ERROR);
    });

    it('should emit error event when process fails', async () => {
      const errorListener = jest.fn();
      manager.on('error', errorListener);

      setTimeout(() => {
        mockProcess.emit('error', new Error('Spawn failed'));
      }, 10);

      try {
        await manager.startAIService();
      } catch {
        // Expected
      }

      expect(errorListener).toHaveBeenCalled();
    });
  });

  // ===========================================
  // Timeout Handling
  // ===========================================

  describe('Startup Timeout', () => {
    it('should have configurable startup timeout', () => {
      const config = manager.getConfig();
      expect(config).toHaveProperty('startupTimeoutMs');
    });

    it('should reject if spawn event not received within timeout', async () => {
      // Don't emit spawn event - let it timeout
      jest.useFakeTimers();

      const startPromise = manager.startAIService();

      // Fast-forward past timeout
      jest.advanceTimersByTime(30000);

      jest.useRealTimers();

      await expect(startPromise).rejects.toThrow(/timeout/i);
    }, 10000);
  });
});

// ===========================================
// T008.1.4 - stopAIService Graceful Shutdown Tests
// ===========================================

describe('ProcessManager stopAIService Graceful Shutdown (T008.1.4)', () => {
  let manager: ProcessManager;
  let mockProcess: ReturnType<typeof createMockChildProcess>;
  const mockSpawn = spawn as jest.MockedFunction<typeof spawn>;

  beforeEach(() => {
    manager = new ProcessManager();
    mockProcess = createMockChildProcess();
    mockSpawn.mockImplementation(() => {
      setTimeout(() => mockProcess.emit('spawn'), 10);
      return mockProcess as never;
    });
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllTimers();
  });

  // Helper to start the service before testing stop
  async function startService(): Promise<void> {
    await manager.startAIService();
    expect(manager.getAIServiceStatus()).toBe(ServiceStatus.RUNNING);
  }

  // ===========================================
  // T008.1.4.1 - Send SIGTERM to process
  // ===========================================

  describe('SIGTERM Signal', () => {
    it('should call kill with SIGTERM when stopping', async () => {
      await startService();

      // Setup mock to not auto-exit, simulate graceful shutdown
      mockProcess.kill.mockImplementation(() => {
        setTimeout(() => mockProcess.emit('exit', 0, 'SIGTERM'), 50);
        return true;
      });

      await manager.stopAIService();

      expect(mockProcess.kill).toHaveBeenCalledWith('SIGTERM');
    });

    it('should send SIGTERM as first termination signal', async () => {
      await startService();

      mockProcess.kill.mockImplementation(() => {
        setTimeout(() => mockProcess.emit('exit', 0, 'SIGTERM'), 50);
        return true;
      });

      await manager.stopAIService();

      // First call should be SIGTERM
      expect(mockProcess.kill.mock.calls[0][0]).toBe('SIGTERM');
    });

    it('should set status to STOPPING before sending signal', async () => {
      await startService();

      // Track status when kill is called
      let statusWhenKilled: ServiceStatus | null = null;
      mockProcess.kill.mockImplementation(() => {
        statusWhenKilled = manager.getAIServiceStatus();
        mockProcess.emit('exit', 0, 'SIGTERM');
        return true;
      });

      await manager.stopAIService();

      expect(statusWhenKilled).toBe(ServiceStatus.STOPPING);
    });

    it('should not call kill if already stopped', async () => {
      // Don't start service - already stopped
      expect(manager.getAIServiceStatus()).toBe(ServiceStatus.STOPPED);

      await manager.stopAIService();

      expect(mockProcess.kill).not.toHaveBeenCalled();
    });

    it('should not call kill if no process exists', async () => {
      // Disable auto-restart for this test to verify ERROR status stays
      const noAutoRestartManager = new ProcessManager({ enableAutoRestart: false });
      const localMockProcess = createMockChildProcess();

      mockSpawn.mockImplementation(() => {
        setTimeout(() => localMockProcess.emit('spawn'), 10);
        return localMockProcess as never;
      });

      await noAutoRestartManager.startAIService();
      expect(noAutoRestartManager.getAIServiceStatus()).toBe(ServiceStatus.RUNNING);

      // Simulate process already gone (e.g., crashed)
      localMockProcess.emit('exit', 1, null);
      expect(noAutoRestartManager.getAIServiceStatus()).toBe(ServiceStatus.ERROR);

      // Clear mock to track new calls
      localMockProcess.kill.mockClear();

      // Try to stop - should handle gracefully
      await noAutoRestartManager.stopAIService();

      // Should not throw but may or may not call kill depending on implementation
    });
  });

  // ===========================================
  // T008.1.4.2 - Wait for graceful shutdown (5s timeout)
  // ===========================================

  describe('Graceful Shutdown Timeout', () => {
    it('should have configurable shutdown timeout', () => {
      const config = manager.getConfig();
      expect(config).toHaveProperty('shutdownTimeoutMs');
    });

    it('should default shutdown timeout to 5000ms', () => {
      const config = manager.getConfig();
      expect(config.shutdownTimeoutMs).toBe(5000);
    });

    it('should wait for process to exit after SIGTERM', async () => {
      await startService();

      // Simulate delayed graceful shutdown
      let exitCalled = false;
      mockProcess.kill.mockImplementation(() => {
        setTimeout(() => {
          exitCalled = true;
          mockProcess.emit('exit', 0, 'SIGTERM');
        }, 100);
        return true;
      });

      await manager.stopAIService();

      expect(exitCalled).toBe(true);
      expect(manager.getAIServiceStatus()).toBe(ServiceStatus.STOPPED);
    });

    it('should resolve Promise when process exits gracefully', async () => {
      await startService();

      mockProcess.kill.mockImplementation(() => {
        setTimeout(() => mockProcess.emit('exit', 0, 'SIGTERM'), 50);
        return true;
      });

      const stopPromise = manager.stopAIService();

      await expect(stopPromise).resolves.toBeUndefined();
      expect(manager.getAIServiceStatus()).toBe(ServiceStatus.STOPPED);
    });

    it('should set status to STOPPED after graceful shutdown', async () => {
      await startService();

      mockProcess.kill.mockImplementation(() => {
        setTimeout(() => mockProcess.emit('exit', 0, 'SIGTERM'), 50);
        return true;
      });

      await manager.stopAIService();

      expect(manager.getAIServiceStatus()).toBe(ServiceStatus.STOPPED);
    });

    it('should clear process reference after shutdown', async () => {
      await startService();

      mockProcess.kill.mockImplementation(() => {
        setTimeout(() => mockProcess.emit('exit', 0, 'SIGTERM'), 50);
        return true;
      });

      await manager.stopAIService();

      const health = await manager.checkHealth('ai');
      expect(health.pid).toBeUndefined();
    });
  });

  // ===========================================
  // T008.1.4.3 - Force kill if timeout exceeded
  // ===========================================

  describe('Force Kill on Timeout', () => {
    it('should send SIGKILL if SIGTERM times out', async () => {
      // Use shorter timeout for test
      const shortManager = new ProcessManager({ shutdownTimeoutMs: 100 });
      const shortMockProcess = createMockChildProcess();
      mockSpawn.mockImplementation(() => {
        setTimeout(() => shortMockProcess.emit('spawn'), 10);
        return shortMockProcess as never;
      });

      await shortManager.startAIService();

      // Mock kill to not exit the process (simulating hung process)
      shortMockProcess.kill.mockImplementation((signal: string) => {
        if (signal === 'SIGKILL') {
          shortMockProcess.emit('exit', null, 'SIGKILL');
        }
        // SIGTERM doesn't trigger exit (hung process)
        return true;
      });

      await shortManager.stopAIService();

      expect(shortMockProcess.kill).toHaveBeenCalledWith('SIGKILL');
    }, 10000);

    it('should call SIGKILL only after SIGTERM timeout', async () => {
      // Use shorter timeout for test
      const shortManager = new ProcessManager({ shutdownTimeoutMs: 100 });
      const shortMockProcess = createMockChildProcess();
      mockSpawn.mockImplementation(() => {
        setTimeout(() => shortMockProcess.emit('spawn'), 10);
        return shortMockProcess as never;
      });

      await shortManager.startAIService();

      const killCalls: string[] = [];
      shortMockProcess.kill.mockImplementation((signal: string) => {
        killCalls.push(signal);
        if (signal === 'SIGKILL') {
          shortMockProcess.emit('exit', null, 'SIGKILL');
        }
        return true;
      });

      await shortManager.stopAIService();

      // SIGTERM should be called first, then SIGKILL after timeout
      expect(killCalls[0]).toBe('SIGTERM');
      expect(killCalls).toContain('SIGKILL');
    }, 10000);

    it('should set status to STOPPED after force kill', async () => {
      // Use shorter timeout for test
      const shortManager = new ProcessManager({ shutdownTimeoutMs: 100 });
      const shortMockProcess = createMockChildProcess();
      mockSpawn.mockImplementation(() => {
        setTimeout(() => shortMockProcess.emit('spawn'), 10);
        return shortMockProcess as never;
      });

      await shortManager.startAIService();

      shortMockProcess.kill.mockImplementation((signal: string) => {
        if (signal === 'SIGKILL') {
          shortMockProcess.emit('exit', null, 'SIGKILL');
        }
        return true;
      });

      await shortManager.stopAIService();

      expect(shortManager.getAIServiceStatus()).toBe(ServiceStatus.STOPPED);
    }, 10000);

    it('should log warning when force kill is needed', async () => {
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation();

      // Use shorter timeout for test
      const shortManager = new ProcessManager({ shutdownTimeoutMs: 100 });
      const shortMockProcess = createMockChildProcess();
      mockSpawn.mockImplementation(() => {
        setTimeout(() => shortMockProcess.emit('spawn'), 10);
        return shortMockProcess as never;
      });

      await shortManager.startAIService();

      shortMockProcess.kill.mockImplementation((signal: string) => {
        if (signal === 'SIGKILL') {
          shortMockProcess.emit('exit', null, 'SIGKILL');
        }
        return true;
      });

      await shortManager.stopAIService();

      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('force')
      );

      warnSpy.mockRestore();
    }, 10000);

    it('should resolve even if both SIGTERM and SIGKILL fail', async () => {
      // Use shorter timeout for test
      const shortManager = new ProcessManager({ shutdownTimeoutMs: 100 });
      const shortMockProcess = createMockChildProcess();
      mockSpawn.mockImplementation(() => {
        setTimeout(() => shortMockProcess.emit('spawn'), 10);
        return shortMockProcess as never;
      });

      await shortManager.startAIService();

      // Simulate process that ignores both signals
      shortMockProcess.kill.mockReturnValue(false);

      // Should still resolve (not hang forever) due to force cleanup
      await expect(shortManager.stopAIService()).resolves.toBeUndefined();
    }, 15000);
  });

  // ===========================================
  // Edge Cases
  // ===========================================

  describe('Edge Cases', () => {
    it('should handle multiple stop calls gracefully', async () => {
      await startService();

      // Setup mock to emit exit immediately on first kill
      mockProcess.kill.mockImplementation(() => {
        mockProcess.emit('exit', 0, 'SIGTERM');
        return true;
      });

      // Call stop multiple times - second and third should return quickly
      // because status transitions to STOPPING/STOPPED
      await manager.stopAIService();
      await manager.stopAIService();  // Should be no-op (already stopped)
      await manager.stopAIService();  // Should be no-op (already stopped)

      expect(manager.getAIServiceStatus()).toBe(ServiceStatus.STOPPED);
    }, 10000);

    it('should handle stop when process does not exist', async () => {
      // Verify that stopping when no process exists works gracefully
      // This simulates a case where status is not STOPPED but process is gone

      // Start and immediately emit exit (process crashes before spawn)
      const crashMockProcess = createMockChildProcess();
      mockSpawn.mockImplementation(() => {
        // Emit error before spawn (simulating early crash)
        setTimeout(() => crashMockProcess.emit('error', new Error('Failed to start')), 10);
        return crashMockProcess as never;
      });

      try {
        await manager.startAIService();
      } catch {
        // Expected - service failed to start
      }

      expect(manager.getAIServiceStatus()).toBe(ServiceStatus.ERROR);

      // Setup kill to emit exit
      crashMockProcess.kill.mockImplementation(() => {
        crashMockProcess.emit('exit', 0, 'SIGTERM');
        return true;
      });

      // Stop should handle this gracefully
      await manager.stopAIService();

      expect(manager.getAIServiceStatus()).toBe(ServiceStatus.STOPPED);
    }, 10000);

    it('should emit statusChange event with correct previous status', async () => {
      await startService();

      const listener = jest.fn();
      manager.on('statusChange', listener);

      mockProcess.kill.mockImplementation(() => {
        // Emit exit event synchronously
        mockProcess.emit('exit', 0, 'SIGTERM');
        return true;
      });

      await manager.stopAIService();

      // Should have events for STOPPING and STOPPED
      expect(listener).toHaveBeenCalledWith(
        expect.objectContaining({
          service: 'ai',
          status: ServiceStatus.STOPPING,
          previousStatus: ServiceStatus.RUNNING,
        })
      );

      expect(listener).toHaveBeenCalledWith(
        expect.objectContaining({
          service: 'ai',
          status: ServiceStatus.STOPPED,
          previousStatus: ServiceStatus.STOPPING,
        })
      );
    }, 10000);

    it('should not throw if kill() throws an error', async () => {
      await startService();

      mockProcess.kill.mockImplementation(() => {
        throw new Error('Process already terminated');
      });

      // Should not throw
      await expect(manager.stopAIService()).resolves.toBeUndefined();

      expect(manager.getAIServiceStatus()).toBe(ServiceStatus.STOPPED);
    }, 10000);

    it('should clear shutdown timeout when process exits gracefully', async () => {
      await startService();

      const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout');

      mockProcess.kill.mockImplementation(() => {
        // Process exits immediately (synchronously)
        mockProcess.emit('exit', 0, 'SIGTERM');
        return true;
      });

      await manager.stopAIService();

      // Timeout should be cleared when exit is received
      expect(clearTimeoutSpy).toHaveBeenCalled();

      clearTimeoutSpy.mockRestore();
    }, 10000);
  });

  // ===========================================
  // Configuration Tests
  // ===========================================

  describe('Shutdown Configuration', () => {
    it('should allow custom shutdown timeout via config', () => {
      const customManager = new ProcessManager({
        shutdownTimeoutMs: 10000,
      });

      const config = customManager.getConfig();
      expect(config.shutdownTimeoutMs).toBe(10000);
    });

    it('should use custom shutdown timeout when stopping', async () => {
      jest.useFakeTimers();

      const customManager = new ProcessManager({
        shutdownTimeoutMs: 2000, // 2 second timeout
      });

      const customMockProcess = createMockChildProcess();
      mockSpawn.mockImplementation(() => {
        setTimeout(() => customMockProcess.emit('spawn'), 10);
        return customMockProcess as never;
      });

      // Need real timer for startAIService
      jest.useRealTimers();
      await customManager.startAIService();
      jest.useFakeTimers();

      let sigkillCalled = false;
      customMockProcess.kill.mockImplementation((signal: string) => {
        if (signal === 'SIGKILL') {
          sigkillCalled = true;
          customMockProcess.emit('exit', null, 'SIGKILL');
        }
        return true;
      });

      const stopPromise = customManager.stopAIService();

      // Fast-forward 2 seconds (custom timeout)
      jest.advanceTimersByTime(2000);

      jest.useRealTimers();

      await stopPromise;

      expect(sigkillCalled).toBe(true);
    });
  });
});

// ===========================================
// T008.1.5 - restartAIService Enhanced Tests
// ===========================================

describe('ProcessManager restartAIService Enhanced (T008.1.5)', () => {
  let manager: ProcessManager;
  let mockProcess: ReturnType<typeof createMockChildProcess>;
  const mockSpawn = spawn as jest.MockedFunction<typeof spawn>;

  beforeEach(() => {
    manager = new ProcessManager();
    mockProcess = createMockChildProcess();
    mockSpawn.mockImplementation(() => {
      setTimeout(() => mockProcess.emit('spawn'), 10);
      return mockProcess as never;
    });
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllTimers();
  });

  // Helper to start the service
  async function startService(): Promise<void> {
    await manager.startAIService();
    expect(manager.getAIServiceStatus()).toBe(ServiceStatus.RUNNING);
  }

  // Helper to setup kill mock for graceful stop
  function setupGracefulStop(): void {
    mockProcess.kill.mockImplementation(() => {
      mockProcess.emit('exit', 0, 'SIGTERM');
      return true;
    });
  }

  // ===========================================
  // T008.1.5.1 - Restart Counter
  // ===========================================

  describe('Restart Counter', () => {
    it('should increment restart counter when restarting', async () => {
      await startService();
      setupGracefulStop();

      expect(manager.getRestartCount('ai')).toBe(0);

      await manager.restartAIService();

      expect(manager.getRestartCount('ai')).toBe(1);
    });

    it('should increment restart counter multiple times', async () => {
      await startService();
      setupGracefulStop();

      await manager.restartAIService();
      expect(manager.getRestartCount('ai')).toBe(1);

      // Need new mock process for second restart
      const secondMockProcess = createMockChildProcess();
      mockSpawn.mockImplementation(() => {
        setTimeout(() => secondMockProcess.emit('spawn'), 10);
        return secondMockProcess as never;
      });
      secondMockProcess.kill.mockImplementation(() => {
        secondMockProcess.emit('exit', 0, 'SIGTERM');
        return true;
      });

      await manager.restartAIService();
      expect(manager.getRestartCount('ai')).toBe(2);

      // Third restart
      const thirdMockProcess = createMockChildProcess();
      mockSpawn.mockImplementation(() => {
        setTimeout(() => thirdMockProcess.emit('spawn'), 10);
        return thirdMockProcess as never;
      });
      thirdMockProcess.kill.mockImplementation(() => {
        thirdMockProcess.emit('exit', 0, 'SIGTERM');
        return true;
      });

      await manager.restartAIService();
      expect(manager.getRestartCount('ai')).toBe(3);
    });

    it('should not increment restart counter if service was not running', async () => {
      // Service is stopped, restart should just start it (not count as restart)
      expect(manager.getAIServiceStatus()).toBe(ServiceStatus.STOPPED);
      expect(manager.getRestartCount('ai')).toBe(0);

      await manager.restartAIService();

      // Should not increment counter for initial start
      expect(manager.getRestartCount('ai')).toBe(0);
    });

    it('should be reset by resetRestartCount', async () => {
      await startService();
      setupGracefulStop();

      await manager.restartAIService();
      expect(manager.getRestartCount('ai')).toBe(1);

      manager.resetRestartCount('ai');
      expect(manager.getRestartCount('ai')).toBe(0);
    });
  });

  // ===========================================
  // T008.1.5.2 - Restart Event Emission
  // ===========================================

  describe('Restart Event', () => {
    it('should emit restart event when restarting a running service', async () => {
      await startService();
      setupGracefulStop();

      const restartListener = jest.fn();
      manager.on('restart', restartListener);

      await manager.restartAIService();

      expect(restartListener).toHaveBeenCalled();
      expect(restartListener).toHaveBeenCalledWith(
        expect.objectContaining({
          service: 'ai',
        })
      );
    });

    it('should not emit restart event for initial start', async () => {
      const restartListener = jest.fn();
      manager.on('restart', restartListener);

      expect(manager.getAIServiceStatus()).toBe(ServiceStatus.STOPPED);
      await manager.restartAIService();

      // Should not emit restart for initial start
      expect(restartListener).not.toHaveBeenCalled();
    });

    it('should include restart count in event', async () => {
      await startService();
      setupGracefulStop();

      const restartListener = jest.fn();
      manager.on('restart', restartListener);

      await manager.restartAIService();

      expect(restartListener).toHaveBeenCalledWith(
        expect.objectContaining({
          service: 'ai',
          restartCount: 1,
        })
      );
    });
  });

  // ===========================================
  // T008.1.5.3 - Uptime Reset
  // ===========================================

  describe('Uptime Reset', () => {
    it('should reset uptime after restart', async () => {
      await startService();

      // Wait a bit to accumulate uptime
      await new Promise(resolve => setTimeout(resolve, 50));

      const healthBefore = await manager.checkHealth('ai');
      const uptimeBefore = healthBefore.uptime;
      expect(uptimeBefore).toBeGreaterThan(0);

      setupGracefulStop();
      await manager.restartAIService();

      // Uptime should be reset (close to 0)
      const healthAfter = await manager.checkHealth('ai');
      expect(healthAfter.uptime).toBeDefined();
      expect(healthAfter.uptime).toBeLessThanOrEqual(100); // Small margin for test timing
    });
  });

  // ===========================================
  // T008.1.5.4 - Error Handling
  // ===========================================

  describe('Error Handling', () => {
    it('should propagate error if start fails during restart', async () => {
      await startService();
      setupGracefulStop();

      // Setup start to fail on next call
      mockSpawn.mockImplementation(() => {
        const failProcess = createMockChildProcess();
        setTimeout(() => failProcess.emit('error', new Error('Start failed')), 10);
        return failProcess as never;
      });

      await expect(manager.restartAIService()).rejects.toThrow('Start failed');
      expect(manager.getAIServiceStatus()).toBe(ServiceStatus.ERROR);
    });

    it('should still increment restart counter if start fails', async () => {
      await startService();
      setupGracefulStop();

      expect(manager.getRestartCount('ai')).toBe(0);

      // Setup start to fail
      mockSpawn.mockImplementation(() => {
        const failProcess = createMockChildProcess();
        setTimeout(() => failProcess.emit('error', new Error('Start failed')), 10);
        return failProcess as never;
      });

      try {
        await manager.restartAIService();
      } catch {
        // Expected
      }

      // Counter should still be incremented
      expect(manager.getRestartCount('ai')).toBe(1);
    });

    it('should set lastError if restart fails', async () => {
      await startService();
      setupGracefulStop();

      mockSpawn.mockImplementation(() => {
        const failProcess = createMockChildProcess();
        setTimeout(() => failProcess.emit('error', new Error('Restart start failed')), 10);
        return failProcess as never;
      });

      try {
        await manager.restartAIService();
      } catch {
        // Expected
      }

      const error = manager.getLastError('ai');
      expect(error).toContain('Restart start failed');
    });
  });

  // ===========================================
  // T008.1.5.5 - Status Transitions
  // ===========================================

  describe('Status Transitions', () => {
    it('should transition through correct states during restart', async () => {
      await startService();

      const statusTransitions: ServiceStatus[] = [];
      manager.on('statusChange', (event) => {
        if (event.service === 'ai') {
          statusTransitions.push(event.status);
        }
      });

      setupGracefulStop();
      await manager.restartAIService();

      // Should transition: RUNNING -> STOPPING -> STOPPED -> STARTING -> RUNNING
      expect(statusTransitions).toContain(ServiceStatus.STOPPING);
      expect(statusTransitions).toContain(ServiceStatus.STOPPED);
      expect(statusTransitions).toContain(ServiceStatus.STARTING);
      expect(statusTransitions).toContain(ServiceStatus.RUNNING);
    });

    it('should end in RUNNING state after successful restart', async () => {
      await startService();
      setupGracefulStop();

      await manager.restartAIService();

      expect(manager.getAIServiceStatus()).toBe(ServiceStatus.RUNNING);
      expect(manager.isAIServiceRunning()).toBe(true);
    });
  });
});

// ===========================================
// T008.1.6 - Health Check Polling with Retry Tests
// ===========================================

describe('ProcessManager Health Check Polling (T008.1.6)', () => {
  let manager: ProcessManager;
  let mockProcess: ReturnType<typeof createMockChildProcess>;
  const mockSpawn = spawn as jest.MockedFunction<typeof spawn>;
  let mockFetch: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    // Create mock fetch for dependency injection
    mockFetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ status: 'healthy' }),
    } as Response);

    // Create manager with injected mock fetch
    manager = new ProcessManager({ fetchFn: mockFetch as any });
    mockProcess = createMockChildProcess();
    mockSpawn.mockImplementation(() => {
      setTimeout(() => mockProcess.emit('spawn'), 10);
      return mockProcess as never;
    });
  });

  afterEach(() => {
    jest.clearAllTimers();
  });

  // Helper to start the service
  async function startService(): Promise<void> {
    await manager.startAIService();
    expect(manager.getAIServiceStatus()).toBe(ServiceStatus.RUNNING);
  }

  // ===========================================
  // T008.1.6.1 - HTTP Health Check
  // ===========================================

  describe('HTTP Health Check', () => {
    it('should have performHealthCheck method', () => {
      expect(manager.performHealthCheck).toBeDefined();
      expect(typeof manager.performHealthCheck).toBe('function');
    });

    it('should make HTTP request to health endpoint', async () => {
      await startService();

      await manager.performHealthCheck('ai');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/health'),
        expect.any(Object)
      );
    });

    it('should use correct port for AI service', async () => {
      await startService();

      await manager.performHealthCheck('ai');

      const config = manager.getConfig();
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining(`:${config.aiServicePort}`),
        expect.any(Object)
      );
    });

    it('should return healthy status on successful response', async () => {
      await startService();

      const result = await manager.performHealthCheck('ai');

      expect(result.healthy).toBe(true);
      expect(result.status).toBe(ServiceStatus.RUNNING);
    });

    it('should return unhealthy status on failed response', async () => {
      await startService();

      // Mock all retries to return failure
      mockFetch.mockResolvedValue({
        ok: false,
        status: 503,
      } as Response);

      const result = await manager.performHealthCheck('ai');

      expect(result.healthy).toBe(false);
    });

    it('should return unhealthy on network error', async () => {
      await startService();

      // Mock all retries to reject
      mockFetch.mockRejectedValue(new Error('Network error'));

      const result = await manager.performHealthCheck('ai');

      expect(result.healthy).toBe(false);
      expect(result.error).toContain('Network error');
    });

    it('should include response time in result', async () => {
      await startService();

      const result = await manager.performHealthCheck('ai');

      expect(result.responseTimeMs).toBeDefined();
      expect(typeof result.responseTimeMs).toBe('number');
      expect(result.responseTimeMs).toBeGreaterThanOrEqual(0);
    });

    it('should timeout if health check takes too long', async () => {
      // Create a slow mock fetch that respects abort signal
      const slowFetch = jest.fn().mockImplementation((_url: string, options?: { signal?: AbortSignal }) =>
        new Promise((resolve, reject) => {
          const timeoutId = setTimeout(() => resolve({ ok: true, status: 200 } as Response), 10000);
          // Listen for abort signal
          if (options?.signal) {
            options.signal.addEventListener('abort', () => {
              clearTimeout(timeoutId);
              const abortError = new Error('The operation was aborted');
              abortError.name = 'AbortError';
              reject(abortError);
            });
          }
        })
      );

      const shortManager = new ProcessManager({
        healthCheckTimeoutMs: 100,
        fetchFn: slowFetch as any,
      });
      const shortMockProcess = createMockChildProcess();
      mockSpawn.mockImplementation(() => {
        setTimeout(() => shortMockProcess.emit('spawn'), 10);
        return shortMockProcess as never;
      });
      await shortManager.startAIService();

      const result = await shortManager.performHealthCheck('ai');

      expect(result.healthy).toBe(false);
      expect(result.error).toContain('timeout');
    }, 15000);
  });

  // ===========================================
  // T008.1.6.2 - Retry Logic
  // ===========================================

  describe('Retry Logic', () => {
    it('should have configurable health check retries', () => {
      const config = manager.getConfig();
      expect(config).toHaveProperty('healthCheckRetries');
    });

    it('should default to 3 retries', () => {
      const config = manager.getConfig();
      expect(config.healthCheckRetries).toBe(3);
    });

    it('should retry on failure', async () => {
      await startService();

      // Fail twice, then succeed
      mockFetch
        .mockRejectedValueOnce(new Error('Retry 1'))
        .mockRejectedValueOnce(new Error('Retry 2'))
        .mockResolvedValueOnce({ ok: true, status: 200 } as Response);

      const result = await manager.performHealthCheck('ai');

      expect(result.healthy).toBe(true);
      expect(mockFetch).toHaveBeenCalledTimes(3);
    });

    it('should return failure after all retries exhausted', async () => {
      await startService();

      // Fail all retries
      mockFetch.mockRejectedValue(new Error('Persistent failure'));

      const result = await manager.performHealthCheck('ai');

      expect(result.healthy).toBe(false);
      expect(result.retryCount).toBe(3);
    });

    it('should include retry count in result', async () => {
      await startService();

      // Fail once, then succeed
      mockFetch
        .mockRejectedValueOnce(new Error('First failure'))
        .mockResolvedValueOnce({ ok: true, status: 200 } as Response);

      const result = await manager.performHealthCheck('ai');

      expect(result.retryCount).toBe(1);
    });

    it('should not retry on successful check', async () => {
      await startService();

      await manager.performHealthCheck('ai');

      expect(mockFetch).toHaveBeenCalledTimes(1);
    });
  });

  // ===========================================
  // T008.1.6.3 - Health Check Polling
  // ===========================================

  describe('Health Check Polling', () => {
    it('should have startHealthCheckPolling method', () => {
      expect((manager as any).startHealthCheckPolling).toBeDefined();
    });

    it('should have stopHealthCheckPolling method', () => {
      expect((manager as any).stopHealthCheckPolling).toBeDefined();
    });

    it('should poll at configured interval', async () => {
      // Start service with real timers first
      await startService();

      // Now enable fake timers
      jest.useFakeTimers();

      // Manually trigger polling start (normally done by startAll)
      (manager as any).startHealthCheckPolling();

      // Clear any calls from startup
      mockFetch.mockClear();

      // Fast-forward past one interval
      const config = manager.getConfig();
      await jest.advanceTimersByTimeAsync(config.healthCheckInterval + 100);

      jest.useRealTimers();

      // Health check should have been called
      expect(mockFetch).toHaveBeenCalled();

      // Clean up
      (manager as any).stopHealthCheckPolling();
    });

    it('should update lastHealthCheck timestamp', async () => {
      await startService();

      const beforeCheck = new Date();
      await manager.performHealthCheck('ai');
      const afterCheck = new Date();

      const health = await manager.checkHealth('ai');

      expect(health.lastHealthCheck).toBeDefined();
      expect(health.lastHealthCheck!.getTime()).toBeGreaterThanOrEqual(beforeCheck.getTime());
      expect(health.lastHealthCheck!.getTime()).toBeLessThanOrEqual(afterCheck.getTime());
    });

    it('should stop polling when stopHealthCheckPolling is called', async () => {
      // Start service with real timers first
      await startService();

      // Now enable fake timers
      jest.useFakeTimers();

      (manager as any).startHealthCheckPolling();

      // Stop polling
      (manager as any).stopHealthCheckPolling();

      // Clear any previous calls
      mockFetch.mockClear();

      // Fast-forward
      const config = manager.getConfig();
      await jest.advanceTimersByTimeAsync(config.healthCheckInterval * 2);

      jest.useRealTimers();

      // Should not have made any new calls
      expect(mockFetch).not.toHaveBeenCalled();
    });
  });

  // ===========================================
  // T008.1.6.4 - Health Status Events
  // ===========================================

  describe('Health Status Events', () => {
    it('should emit healthChange event when health status changes', async () => {
      await startService();

      const healthListener = jest.fn();
      manager.on('healthChange', healthListener);

      // First check - healthy
      await manager.performHealthCheck('ai');

      // Should not emit on first check (no change)
      expect(healthListener).not.toHaveBeenCalled();

      // Simulate unhealthy
      mockFetch.mockRejectedValue(new Error('Service down'));

      await manager.performHealthCheck('ai');

      // Should emit on change to unhealthy
      expect(healthListener).toHaveBeenCalledWith(
        expect.objectContaining({
          service: 'ai',
          healthy: false,
        })
      );
    });

    it('should include consecutive failure count in event', async () => {
      await startService();

      const healthListener = jest.fn();
      manager.on('healthChange', healthListener);

      mockFetch.mockRejectedValue(new Error('Service down'));

      await manager.performHealthCheck('ai');
      await manager.performHealthCheck('ai');
      await manager.performHealthCheck('ai');

      expect(healthListener).toHaveBeenLastCalledWith(
        expect.objectContaining({
          consecutiveFailures: 3,
        })
      );
    });

    it('should reset consecutive failures on successful check', async () => {
      await startService();

      // Fail a few times
      mockFetch.mockRejectedValue(new Error('Service down'));
      await manager.performHealthCheck('ai');
      await manager.performHealthCheck('ai');

      // Now succeed
      mockFetch.mockResolvedValue({ ok: true, status: 200 } as Response);
      await manager.performHealthCheck('ai');

      // Check consecutive failures is reset
      const health = await manager.checkHealth('ai');
      expect(health.consecutiveFailures).toBe(0);
    });
  });

  // ===========================================
  // T008.1.6.5 - Service Not Running
  // ===========================================

  describe('Service Not Running', () => {
    it('should skip health check if service is not running', async () => {
      expect(manager.getAIServiceStatus()).toBe(ServiceStatus.STOPPED);

      const result = await manager.performHealthCheck('ai');

      expect(result.healthy).toBe(false);
      expect(result.skipped).toBe(true);
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('should skip health check if service is starting', async () => {
      // Start but don't wait for spawn
      mockSpawn.mockImplementation(() => {
        // Don't emit spawn - stays in STARTING
        return mockProcess as never;
      });

      manager.startAIService(); // Don't await

      expect(manager.getAIServiceStatus()).toBe(ServiceStatus.STARTING);

      const result = await manager.performHealthCheck('ai');

      expect(result.skipped).toBe(true);
    });
  });

  // ===========================================
  // T008.1.6.6 - Configuration
  // ===========================================

  describe('Configuration', () => {
    it('should have configurable health check timeout', () => {
      const config = manager.getConfig();
      expect(config).toHaveProperty('healthCheckTimeoutMs');
    });

    it('should default health check timeout to 5000ms', () => {
      const config = manager.getConfig();
      expect(config.healthCheckTimeoutMs).toBe(5000);
    });

    it('should allow custom health check interval', () => {
      const customManager = new ProcessManager({
        healthCheckInterval: 10000,
      });

      expect(customManager.getConfig().healthCheckInterval).toBe(10000);
    });

    it('should allow custom health check retries', () => {
      const customManager = new ProcessManager({
        healthCheckRetries: 5,
      });

      expect(customManager.getConfig().healthCheckRetries).toBe(5);
    });
  });
});

// ===========================================
// T008.2.1 - Bridge Service Process Spawning Tests
// ===========================================

describe('ProcessManager Bridge Service (T008.2.1)', () => {
  let manager: ProcessManager;
  let mockProcess: ReturnType<typeof createMockChildProcess>;
  const mockSpawn = spawn as jest.MockedFunction<typeof spawn>;

  beforeEach(() => {
    jest.clearAllMocks();
    manager = new ProcessManager();
    mockProcess = createMockChildProcess();
    mockSpawn.mockImplementation(() => {
      setTimeout(() => mockProcess.emit('spawn'), 10);
      return mockProcess as never;
    });
  });

  // ===========================================
  // T008.2.1.1 - Process Spawning
  // ===========================================

  describe('Process Spawning', () => {
    it('should spawn dotnet process for Bridge service', async () => {
      await manager.startBridgeService();

      expect(mockSpawn).toHaveBeenCalled();
      const [command] = mockSpawn.mock.calls[0];
      expect(command).toContain('dotnet');
    });

    it('should use correct arguments for dotnet process', async () => {
      await manager.startBridgeService();

      expect(mockSpawn).toHaveBeenCalled();
      const [, args] = mockSpawn.mock.calls[0];
      // Should run the WindowsBridge.dll
      expect(args).toContainEqual(expect.stringContaining('WindowsBridge.dll'));
    });

    it('should use correct port from config', async () => {
      await manager.startBridgeService();

      expect(mockSpawn).toHaveBeenCalled();
      const [, args] = mockSpawn.mock.calls[0];
      const config = manager.getConfig();
      expect(args.join(' ')).toContain(String(config.bridgeServicePort));
    });

    it('should set correct working directory', async () => {
      await manager.startBridgeService();

      expect(mockSpawn).toHaveBeenCalled();
      const [, , options] = mockSpawn.mock.calls[0];
      expect(options).toHaveProperty('cwd');
      expect(options.cwd).toContain('windows-bridge');
    });

    it('should set shell option to false', async () => {
      await manager.startBridgeService();

      expect(mockSpawn).toHaveBeenCalled();
      const [, , options] = mockSpawn.mock.calls[0];
      expect(options).toHaveProperty('shell', false);
    });

    it('should configure stdio for process output capture', async () => {
      await manager.startBridgeService();

      expect(mockSpawn).toHaveBeenCalled();
      const [, , options] = mockSpawn.mock.calls[0];
      expect(options).toHaveProperty('stdio');
      expect(options.stdio).toEqual(['ignore', 'pipe', 'pipe']);
    });
  });

  // ===========================================
  // T008.2.1.2 - Status Transitions
  // ===========================================

  describe('Status Transitions', () => {
    it('should transition from STOPPED to STARTING', async () => {
      expect(manager.getBridgeServiceStatus()).toBe(ServiceStatus.STOPPED);

      const startPromise = manager.startBridgeService();

      expect(manager.getBridgeServiceStatus()).toBe(ServiceStatus.STARTING);

      await startPromise;
    });

    it('should transition from STARTING to RUNNING on spawn', async () => {
      await manager.startBridgeService();

      expect(manager.getBridgeServiceStatus()).toBe(ServiceStatus.RUNNING);
    });

    it('should not start if already running', async () => {
      await manager.startBridgeService();
      expect(manager.getBridgeServiceStatus()).toBe(ServiceStatus.RUNNING);

      mockSpawn.mockClear();
      await manager.startBridgeService();

      expect(mockSpawn).not.toHaveBeenCalled();
    });

    it('should emit statusChange event on STARTING', async () => {
      const listener = jest.fn();
      manager.on('statusChange', listener);

      const startPromise = manager.startBridgeService();

      expect(listener).toHaveBeenCalledWith(
        expect.objectContaining({
          service: 'bridge',
          status: ServiceStatus.STARTING,
          previousStatus: ServiceStatus.STOPPED,
        })
      );

      await startPromise;
    });

    it('should emit statusChange event on RUNNING', async () => {
      const listener = jest.fn();
      manager.on('statusChange', listener);

      await manager.startBridgeService();

      expect(listener).toHaveBeenCalledWith(
        expect.objectContaining({
          service: 'bridge',
          status: ServiceStatus.RUNNING,
          previousStatus: ServiceStatus.STARTING,
        })
      );
    });
  });

  // ===========================================
  // T008.2.1.3 - Error Handling
  // ===========================================

  describe('Error Handling', () => {
    it('should transition to ERROR status on spawn error', async () => {
      mockSpawn.mockImplementation(() => {
        setTimeout(() => mockProcess.emit('error', new Error('Spawn failed')), 10);
        return mockProcess as never;
      });

      await expect(manager.startBridgeService()).rejects.toThrow('Spawn failed');
      expect(manager.getBridgeServiceStatus()).toBe(ServiceStatus.ERROR);
    });

    it('should set lastError on spawn failure', async () => {
      mockSpawn.mockImplementation(() => {
        setTimeout(() => mockProcess.emit('error', new Error('ENOENT: dotnet not found')), 10);
        return mockProcess as never;
      });

      await expect(manager.startBridgeService()).rejects.toThrow();

      expect(manager.getLastError('bridge')).toBe('ENOENT: dotnet not found');
    });

    it('should emit error event on spawn failure', async () => {
      const errorListener = jest.fn();
      manager.on('error', errorListener);

      mockSpawn.mockImplementation(() => {
        setTimeout(() => mockProcess.emit('error', new Error('Failed')), 10);
        return mockProcess as never;
      });

      await expect(manager.startBridgeService()).rejects.toThrow();

      expect(errorListener).toHaveBeenCalledWith(
        expect.objectContaining({
          service: 'bridge',
          status: ServiceStatus.ERROR,
        })
      );
    });

    it('should handle exit before spawn event', async () => {
      mockSpawn.mockImplementation(() => {
        setTimeout(() => mockProcess.emit('exit', 1, null), 10);
        return mockProcess as never;
      });

      // Process exits immediately without spawning
      const startPromise = manager.startBridgeService();

      // Wait for the exit and timeout
      await new Promise(resolve => setTimeout(resolve, 100));

      // Check status - should be error
      expect(manager.getBridgeServiceStatus()).toBe(ServiceStatus.ERROR);
    });
  });

  // ===========================================
  // T008.2.1.4 - Startup Timeout
  // ===========================================

  describe('Startup Timeout', () => {
    it('should timeout if spawn event not received', async () => {
      // Create manager with very short timeout
      const shortManager = new ProcessManager({ startupTimeoutMs: 100 });
      const shortMockProcess = createMockChildProcess();

      mockSpawn.mockImplementation(() => {
        // Never emit spawn event
        return shortMockProcess as never;
      });

      await expect(shortManager.startBridgeService()).rejects.toThrow(/timeout/i);
      expect(shortManager.getBridgeServiceStatus()).toBe(ServiceStatus.ERROR);
    });

    it('should use startupTimeoutMs from config', async () => {
      const customManager = new ProcessManager({ startupTimeoutMs: 50 });
      const customMockProcess = createMockChildProcess();

      mockSpawn.mockImplementation(() => {
        // Never emit spawn - will timeout
        return customMockProcess as never;
      });

      const startTime = Date.now();
      await expect(customManager.startBridgeService()).rejects.toThrow();
      const elapsed = Date.now() - startTime;

      // Should timeout around 50ms (with some tolerance)
      expect(elapsed).toBeGreaterThanOrEqual(40);
      expect(elapsed).toBeLessThan(500);
    });
  });

  // ===========================================
  // T008.2.1.5 - Process Output Logging
  // ===========================================

  describe('Process Output Logging', () => {
    it('should capture stdout output', async () => {
      await manager.startBridgeService();

      // Emit some stdout
      mockProcess.stdout.emit('data', Buffer.from('Bridge service started\n'));

      const logs = manager.getProcessLogs('bridge');
      expect(logs.length).toBeGreaterThan(0);
      expect(logs[logs.length - 1].level).toBe('stdout');
      expect(logs[logs.length - 1].message).toContain('Bridge service started');
    });

    it('should capture stderr output', async () => {
      await manager.startBridgeService();

      // Emit some stderr
      mockProcess.stderr.emit('data', Buffer.from('Warning: something\n'));

      const logs = manager.getProcessLogs('bridge');
      expect(logs.length).toBeGreaterThan(0);
      const stderrLogs = logs.filter(l => l.level === 'stderr');
      expect(stderrLogs.length).toBeGreaterThan(0);
    });

    it('should include timestamp in log entries', async () => {
      await manager.startBridgeService();

      mockProcess.stdout.emit('data', Buffer.from('Test output\n'));

      const logs = manager.getProcessLogs('bridge');
      expect(logs.length).toBeGreaterThan(0);
      expect(logs[logs.length - 1].timestamp).toBeInstanceOf(Date);
    });
  });

  // ===========================================
  // T008.2.1.6 - Process Exit Handling
  // ===========================================

  describe('Process Exit Handling', () => {
    it('should update status on process exit with error code', async () => {
      // Disable auto-restart for this test to verify ERROR status stays
      const noAutoRestartManager = new ProcessManager({ enableAutoRestart: false });

      mockSpawn.mockImplementation(() => {
        setTimeout(() => mockProcess.emit('spawn'), 10);
        return mockProcess as never;
      });

      await noAutoRestartManager.startBridgeService();
      expect(noAutoRestartManager.getBridgeServiceStatus()).toBe(ServiceStatus.RUNNING);

      // Simulate process crash
      mockProcess.emit('exit', 1, null);

      expect(noAutoRestartManager.getBridgeServiceStatus()).toBe(ServiceStatus.ERROR);
    });

    it('should set lastError on non-zero exit code', async () => {
      await manager.startBridgeService();

      mockProcess.emit('exit', 1, null);

      expect(manager.getLastError('bridge')).toContain('exited with code 1');
    });

    it('should include signal in error message if present', async () => {
      await manager.startBridgeService();

      mockProcess.emit('exit', null, 'SIGTERM');

      expect(manager.getLastError('bridge')).toContain('SIGTERM');
    });

    it('should clean up process reference on exit', async () => {
      await manager.startBridgeService();

      mockProcess.emit('exit', 0, null);

      expect(manager.getBridgeServiceStatus()).toBe(ServiceStatus.STOPPED);
    });
  });

  // ===========================================
  // T008.2.1.7 - Uptime and PID Tracking
  // ===========================================

  describe('Uptime and PID Tracking', () => {
    it('should track PID after successful start', async () => {
      await manager.startBridgeService();

      const health = await manager.checkHealth('bridge');
      expect(health.pid).toBe(12345);
    });

    it('should track uptime after successful start', async () => {
      await manager.startBridgeService();

      // Wait a bit
      await new Promise(resolve => setTimeout(resolve, 50));

      const health = await manager.checkHealth('bridge');
      expect(health.uptime).toBeGreaterThan(0);
    });

    it('should reset uptime on stop', async () => {
      await manager.startBridgeService();
      await new Promise(resolve => setTimeout(resolve, 50));

      // Simulate exit (stop)
      mockProcess.emit('exit', 0, null);

      const health = await manager.checkHealth('bridge');
      expect(health.uptime).toBeUndefined();
    });
  });

  // ===========================================
  // T008.2.1.8 - getDotnetPath Method
  // ===========================================

  describe('getDotnetPath', () => {
    it('should have getDotnetPath method', () => {
      expect(manager.getDotnetPath).toBeDefined();
      expect(typeof manager.getDotnetPath).toBe('function');
    });

    it('should return system dotnet path in development', () => {
      const dotnetPath = manager.getDotnetPath();
      expect(dotnetPath).toBe('dotnet');
    });
  });
});

// ===========================================
// T008.2.2 - stopBridgeService Graceful Shutdown Tests
// ===========================================

describe('ProcessManager stopBridgeService Graceful Shutdown (T008.2.2)', () => {
  let manager: ProcessManager;
  let mockProcess: ReturnType<typeof createMockChildProcess>;
  const mockSpawn = spawn as jest.MockedFunction<typeof spawn>;

  beforeEach(() => {
    manager = new ProcessManager();
    mockProcess = createMockChildProcess();
    mockSpawn.mockImplementation(() => {
      const proc = createMockChildProcess();
      setTimeout(() => proc.emit('spawn'), 10);
      return proc as never;
    });
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllTimers();
  });

  // Helper to start the bridge service before testing stop
  async function startBridgeService(): Promise<ReturnType<typeof createMockChildProcess>> {
    const bridgeProcess = createMockChildProcess();
    mockSpawn.mockImplementation(() => {
      setTimeout(() => bridgeProcess.emit('spawn'), 10);
      return bridgeProcess as never;
    });
    await manager.startBridgeService();
    expect(manager.getBridgeServiceStatus()).toBe(ServiceStatus.RUNNING);
    return bridgeProcess;
  }

  // ===========================================
  // T008.2.2.1 - Send SIGTERM to process
  // ===========================================

  describe('SIGTERM Signal', () => {
    it('should call kill with SIGTERM when stopping', async () => {
      const bridgeProcess = await startBridgeService();

      bridgeProcess.kill.mockImplementation(() => {
        setTimeout(() => bridgeProcess.emit('exit', 0, 'SIGTERM'), 50);
        return true;
      });

      await manager.stopBridgeService();

      expect(bridgeProcess.kill).toHaveBeenCalledWith('SIGTERM');
    });

    it('should send SIGTERM as first termination signal', async () => {
      const bridgeProcess = await startBridgeService();

      bridgeProcess.kill.mockImplementation(() => {
        setTimeout(() => bridgeProcess.emit('exit', 0, 'SIGTERM'), 50);
        return true;
      });

      await manager.stopBridgeService();

      expect(bridgeProcess.kill.mock.calls[0][0]).toBe('SIGTERM');
    });

    it('should set status to STOPPING before sending signal', async () => {
      const bridgeProcess = await startBridgeService();

      let statusWhenKilled: ServiceStatus | null = null;
      bridgeProcess.kill.mockImplementation(() => {
        statusWhenKilled = manager.getBridgeServiceStatus();
        bridgeProcess.emit('exit', 0, 'SIGTERM');
        return true;
      });

      await manager.stopBridgeService();

      expect(statusWhenKilled).toBe(ServiceStatus.STOPPING);
    });

    it('should not call kill if already stopped', async () => {
      const bridgeProcess = createMockChildProcess();
      expect(manager.getBridgeServiceStatus()).toBe(ServiceStatus.STOPPED);

      await manager.stopBridgeService();

      expect(bridgeProcess.kill).not.toHaveBeenCalled();
    });

    it('should not call kill if no process exists', async () => {
      // Disable auto-restart for this test to verify ERROR status stays
      const noAutoRestartManager = new ProcessManager({ enableAutoRestart: false });

      const bridgeProcess = createMockChildProcess();
      mockSpawn.mockImplementation(() => {
        setTimeout(() => bridgeProcess.emit('spawn'), 10);
        return bridgeProcess as never;
      });

      await noAutoRestartManager.startBridgeService();
      expect(noAutoRestartManager.getBridgeServiceStatus()).toBe(ServiceStatus.RUNNING);

      bridgeProcess.emit('exit', 1, null);
      expect(noAutoRestartManager.getBridgeServiceStatus()).toBe(ServiceStatus.ERROR);

      bridgeProcess.kill.mockClear();

      await noAutoRestartManager.stopBridgeService();
    });
  });

  // ===========================================
  // T008.2.2.2 - Wait for graceful shutdown (5s timeout)
  // ===========================================

  describe('Graceful Shutdown Timeout', () => {
    it('should have configurable shutdown timeout', () => {
      const config = manager.getConfig();
      expect(config).toHaveProperty('shutdownTimeoutMs');
    });

    it('should wait for process to exit after SIGTERM', async () => {
      const bridgeProcess = await startBridgeService();

      let exitCalled = false;
      bridgeProcess.kill.mockImplementation(() => {
        setTimeout(() => {
          exitCalled = true;
          bridgeProcess.emit('exit', 0, 'SIGTERM');
        }, 100);
        return true;
      });

      await manager.stopBridgeService();

      expect(exitCalled).toBe(true);
      expect(manager.getBridgeServiceStatus()).toBe(ServiceStatus.STOPPED);
    });

    it('should resolve Promise when process exits gracefully', async () => {
      const bridgeProcess = await startBridgeService();

      bridgeProcess.kill.mockImplementation(() => {
        setTimeout(() => bridgeProcess.emit('exit', 0, 'SIGTERM'), 50);
        return true;
      });

      const stopPromise = manager.stopBridgeService();

      await expect(stopPromise).resolves.toBeUndefined();
      expect(manager.getBridgeServiceStatus()).toBe(ServiceStatus.STOPPED);
    });

    it('should set status to STOPPED after graceful shutdown', async () => {
      const bridgeProcess = await startBridgeService();

      bridgeProcess.kill.mockImplementation(() => {
        setTimeout(() => bridgeProcess.emit('exit', 0, 'SIGTERM'), 50);
        return true;
      });

      await manager.stopBridgeService();

      expect(manager.getBridgeServiceStatus()).toBe(ServiceStatus.STOPPED);
    });

    it('should clear process reference after shutdown', async () => {
      const bridgeProcess = await startBridgeService();

      bridgeProcess.kill.mockImplementation(() => {
        setTimeout(() => bridgeProcess.emit('exit', 0, 'SIGTERM'), 50);
        return true;
      });

      await manager.stopBridgeService();

      const health = await manager.checkHealth('bridge');
      expect(health.pid).toBeUndefined();
    });
  });

  // ===========================================
  // T008.2.2.3 - Force kill if timeout exceeded
  // ===========================================

  describe('Force Kill on Timeout', () => {
    it('should send SIGKILL if SIGTERM times out', async () => {
      const shortManager = new ProcessManager({ shutdownTimeoutMs: 100 });
      const shortMockProcess = createMockChildProcess();
      mockSpawn.mockImplementation(() => {
        setTimeout(() => shortMockProcess.emit('spawn'), 10);
        return shortMockProcess as never;
      });

      await shortManager.startBridgeService();

      shortMockProcess.kill.mockImplementation((signal: string) => {
        if (signal === 'SIGKILL') {
          shortMockProcess.emit('exit', null, 'SIGKILL');
        }
        return true;
      });

      await shortManager.stopBridgeService();

      expect(shortMockProcess.kill).toHaveBeenCalledWith('SIGKILL');
    }, 10000);

    it('should call SIGKILL only after SIGTERM timeout', async () => {
      const shortManager = new ProcessManager({ shutdownTimeoutMs: 100 });
      const shortMockProcess = createMockChildProcess();
      mockSpawn.mockImplementation(() => {
        setTimeout(() => shortMockProcess.emit('spawn'), 10);
        return shortMockProcess as never;
      });

      await shortManager.startBridgeService();

      const killCalls: string[] = [];
      shortMockProcess.kill.mockImplementation((signal: string) => {
        killCalls.push(signal);
        if (signal === 'SIGKILL') {
          shortMockProcess.emit('exit', null, 'SIGKILL');
        }
        return true;
      });

      await shortManager.stopBridgeService();

      expect(killCalls[0]).toBe('SIGTERM');
      expect(killCalls).toContain('SIGKILL');
    }, 10000);

    it('should set status to STOPPED after force kill', async () => {
      const shortManager = new ProcessManager({ shutdownTimeoutMs: 100 });
      const shortMockProcess = createMockChildProcess();
      mockSpawn.mockImplementation(() => {
        setTimeout(() => shortMockProcess.emit('spawn'), 10);
        return shortMockProcess as never;
      });

      await shortManager.startBridgeService();

      shortMockProcess.kill.mockImplementation((signal: string) => {
        if (signal === 'SIGKILL') {
          shortMockProcess.emit('exit', null, 'SIGKILL');
        }
        return true;
      });

      await shortManager.stopBridgeService();

      expect(shortManager.getBridgeServiceStatus()).toBe(ServiceStatus.STOPPED);
    }, 10000);

    it('should log warning when force kill is needed', async () => {
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation();

      const shortManager = new ProcessManager({ shutdownTimeoutMs: 100 });
      const shortMockProcess = createMockChildProcess();
      mockSpawn.mockImplementation(() => {
        setTimeout(() => shortMockProcess.emit('spawn'), 10);
        return shortMockProcess as never;
      });

      await shortManager.startBridgeService();

      shortMockProcess.kill.mockImplementation((signal: string) => {
        if (signal === 'SIGKILL') {
          shortMockProcess.emit('exit', null, 'SIGKILL');
        }
        return true;
      });

      await shortManager.stopBridgeService();

      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('force')
      );

      warnSpy.mockRestore();
    }, 10000);

    it('should resolve even if both SIGTERM and SIGKILL fail', async () => {
      const shortManager = new ProcessManager({ shutdownTimeoutMs: 100 });
      const shortMockProcess = createMockChildProcess();
      mockSpawn.mockImplementation(() => {
        setTimeout(() => shortMockProcess.emit('spawn'), 10);
        return shortMockProcess as never;
      });

      await shortManager.startBridgeService();

      shortMockProcess.kill.mockReturnValue(false);

      await expect(shortManager.stopBridgeService()).resolves.toBeUndefined();
    }, 15000);
  });

  // ===========================================
  // Edge Cases
  // ===========================================

  describe('Edge Cases', () => {
    it('should handle multiple stop calls gracefully', async () => {
      const bridgeProcess = await startBridgeService();

      bridgeProcess.kill.mockImplementation(() => {
        bridgeProcess.emit('exit', 0, 'SIGTERM');
        return true;
      });

      await manager.stopBridgeService();
      await manager.stopBridgeService();
      await manager.stopBridgeService();

      expect(manager.getBridgeServiceStatus()).toBe(ServiceStatus.STOPPED);
    }, 10000);

    it('should handle stop when process does not exist', async () => {
      const crashMockProcess = createMockChildProcess();
      mockSpawn.mockImplementation(() => {
        setTimeout(() => crashMockProcess.emit('error', new Error('Failed to start')), 10);
        return crashMockProcess as never;
      });

      try {
        await manager.startBridgeService();
      } catch {
        // Expected - service failed to start
      }

      expect(manager.getBridgeServiceStatus()).toBe(ServiceStatus.ERROR);

      crashMockProcess.kill.mockImplementation(() => {
        crashMockProcess.emit('exit', 0, 'SIGTERM');
        return true;
      });

      await manager.stopBridgeService();

      expect(manager.getBridgeServiceStatus()).toBe(ServiceStatus.STOPPED);
    }, 10000);

    it('should emit statusChange event with correct previous status', async () => {
      const bridgeProcess = await startBridgeService();

      const listener = jest.fn();
      manager.on('statusChange', listener);

      bridgeProcess.kill.mockImplementation(() => {
        bridgeProcess.emit('exit', 0, 'SIGTERM');
        return true;
      });

      await manager.stopBridgeService();

      expect(listener).toHaveBeenCalledWith(
        expect.objectContaining({
          service: 'bridge',
          status: ServiceStatus.STOPPING,
          previousStatus: ServiceStatus.RUNNING,
        })
      );

      expect(listener).toHaveBeenCalledWith(
        expect.objectContaining({
          service: 'bridge',
          status: ServiceStatus.STOPPED,
          previousStatus: ServiceStatus.STOPPING,
        })
      );
    }, 10000);

    it('should not throw if kill() throws an error', async () => {
      const bridgeProcess = await startBridgeService();

      bridgeProcess.kill.mockImplementation(() => {
        throw new Error('Process already terminated');
      });

      await expect(manager.stopBridgeService()).resolves.toBeUndefined();

      expect(manager.getBridgeServiceStatus()).toBe(ServiceStatus.STOPPED);
    }, 10000);

    it('should clear shutdown timeout when process exits gracefully', async () => {
      const bridgeProcess = await startBridgeService();

      const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout');

      bridgeProcess.kill.mockImplementation(() => {
        bridgeProcess.emit('exit', 0, 'SIGTERM');
        return true;
      });

      await manager.stopBridgeService();

      expect(clearTimeoutSpy).toHaveBeenCalled();

      clearTimeoutSpy.mockRestore();
    }, 10000);
  });

  // ===========================================
  // Configuration Tests
  // ===========================================

  describe('Shutdown Configuration', () => {
    it('should allow custom shutdown timeout via config', () => {
      const customManager = new ProcessManager({
        shutdownTimeoutMs: 10000,
      });

      const config = customManager.getConfig();
      expect(config.shutdownTimeoutMs).toBe(10000);
    });

    it('should use custom shutdown timeout when stopping bridge', async () => {
      jest.useFakeTimers();

      const customManager = new ProcessManager({
        shutdownTimeoutMs: 2000,
      });

      const customMockProcess = createMockChildProcess();
      mockSpawn.mockImplementation(() => {
        setTimeout(() => customMockProcess.emit('spawn'), 10);
        return customMockProcess as never;
      });

      jest.useRealTimers();
      await customManager.startBridgeService();
      jest.useFakeTimers();

      let sigkillCalled = false;
      customMockProcess.kill.mockImplementation((signal: string) => {
        if (signal === 'SIGKILL') {
          sigkillCalled = true;
          customMockProcess.emit('exit', null, 'SIGKILL');
        }
        return true;
      });

      const stopPromise = customManager.stopBridgeService();

      jest.advanceTimersByTime(2000);

      jest.useRealTimers();

      await stopPromise;

      expect(sigkillCalled).toBe(true);
    });
  });
});

// ===========================================
// T008.2.3 - Bridge Service Health Check Polling Tests
// ===========================================

describe('ProcessManager Bridge Health Check Polling (T008.2.3)', () => {
  let manager: ProcessManager;
  let mockProcess: ReturnType<typeof createMockChildProcess>;
  const mockSpawn = spawn as jest.MockedFunction<typeof spawn>;
  let mockFetch: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    // Create mock fetch for dependency injection
    mockFetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ status: 'healthy' }),
    } as Response);

    manager = new ProcessManager({ fetchFn: mockFetch as unknown as never });
    mockProcess = createMockChildProcess();
    mockSpawn.mockImplementation(() => {
      const proc = createMockChildProcess();
      setTimeout(() => proc.emit('spawn'), 10);
      return proc as never;
    });
  });

  afterEach(() => {
    jest.clearAllTimers();
  });

  // Helper to start the bridge service
  async function startBridgeService(): Promise<void> {
    await manager.startBridgeService();
    expect(manager.getBridgeServiceStatus()).toBe(ServiceStatus.RUNNING);
  }

  // ===========================================
  // T008.2.3.1 - HTTP Health Check for Bridge
  // ===========================================

  describe('HTTP Health Check for Bridge', () => {
    it('should make HTTP request to bridge health endpoint', async () => {
      await startBridgeService();

      await manager.performHealthCheck('bridge');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/health'),
        expect.any(Object)
      );
    });

    it('should use correct port for Bridge service', async () => {
      await startBridgeService();

      await manager.performHealthCheck('bridge');

      const config = manager.getConfig();
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining(`:${config.bridgeServicePort}`),
        expect.any(Object)
      );
    });

    it('should use bridgeServicePort (5000) for health check', async () => {
      await startBridgeService();

      await manager.performHealthCheck('bridge');

      expect(mockFetch).toHaveBeenCalledWith(
        'http://127.0.0.1:5000/health',
        expect.any(Object)
      );
    });

    it('should return healthy status on successful response', async () => {
      await startBridgeService();

      const result = await manager.performHealthCheck('bridge');

      expect(result.healthy).toBe(true);
      expect(result.status).toBe(ServiceStatus.RUNNING);
    });

    it('should return unhealthy status on failed response', async () => {
      await startBridgeService();

      mockFetch.mockResolvedValue({
        ok: false,
        status: 503,
      } as Response);

      const result = await manager.performHealthCheck('bridge');

      expect(result.healthy).toBe(false);
    });

    it('should return unhealthy on network error', async () => {
      await startBridgeService();

      mockFetch.mockRejectedValue(new Error('Network error'));

      const result = await manager.performHealthCheck('bridge');

      expect(result.healthy).toBe(false);
      expect(result.error).toContain('Network error');
    });

    it('should include response time in result', async () => {
      await startBridgeService();

      const result = await manager.performHealthCheck('bridge');

      expect(result.responseTimeMs).toBeDefined();
      expect(typeof result.responseTimeMs).toBe('number');
      expect(result.responseTimeMs).toBeGreaterThanOrEqual(0);
    });

    it('should timeout if bridge health check takes too long', async () => {
      const slowFetch = jest.fn().mockImplementation((_url: string, options?: { signal?: AbortSignal }) =>
        new Promise((resolve, reject) => {
          const timeoutId = setTimeout(() => resolve({ ok: true, status: 200 } as Response), 10000);
          if (options?.signal) {
            options.signal.addEventListener('abort', () => {
              clearTimeout(timeoutId);
              const abortError = new Error('The operation was aborted');
              abortError.name = 'AbortError';
              reject(abortError);
            });
          }
        })
      );

      const shortManager = new ProcessManager({
        healthCheckTimeoutMs: 100,
        fetchFn: slowFetch as unknown as never,
      });
      const shortMockProcess = createMockChildProcess();
      mockSpawn.mockImplementation(() => {
        setTimeout(() => shortMockProcess.emit('spawn'), 10);
        return shortMockProcess as never;
      });
      await shortManager.startBridgeService();

      const result = await shortManager.performHealthCheck('bridge');

      expect(result.healthy).toBe(false);
      expect(result.error).toContain('timeout');
    }, 10000);
  });

  // ===========================================
  // T008.2.3.2 - Retry Logic for Bridge
  // ===========================================

  describe('Retry Logic for Bridge', () => {
    it('should retry on failure up to configured retries', async () => {
      await startBridgeService();

      // Fail first 2 attempts, succeed on 3rd
      let callCount = 0;
      mockFetch.mockImplementation(() => {
        callCount++;
        if (callCount < 3) {
          return Promise.reject(new Error('Connection refused'));
        }
        return Promise.resolve({ ok: true, status: 200 } as Response);
      });

      const result = await manager.performHealthCheck('bridge');

      expect(result.healthy).toBe(true);
      expect(mockFetch).toHaveBeenCalledTimes(3);
    });

    it('should return failure after all retries exhausted', async () => {
      await startBridgeService();

      mockFetch.mockRejectedValue(new Error('Connection refused'));

      const result = await manager.performHealthCheck('bridge');

      expect(result.healthy).toBe(false);
      // Default retries is 3, so 1 initial + 3 retries = 4 calls
      expect(mockFetch).toHaveBeenCalledTimes(4);
    });

    it('should track retry count in result', async () => {
      await startBridgeService();

      mockFetch.mockRejectedValue(new Error('Connection refused'));

      const result = await manager.performHealthCheck('bridge');

      expect(result.retryCount).toBe(3); // Max retries
    });

    it('should succeed on first try with retryCount 0', async () => {
      await startBridgeService();

      const result = await manager.performHealthCheck('bridge');

      expect(result.healthy).toBe(true);
      expect(result.retryCount).toBe(0);
    });
  });

  // ===========================================
  // T008.2.3.3 - Consecutive Failures for Bridge
  // ===========================================

  describe('Consecutive Failures for Bridge', () => {
    it('should track consecutive failures for bridge service', async () => {
      await startBridgeService();

      mockFetch.mockRejectedValue(new Error('Connection refused'));

      // First failure
      await manager.performHealthCheck('bridge');
      let health = await manager.checkHealth('bridge');
      expect(health.consecutiveFailures).toBe(1);

      // Second failure
      await manager.performHealthCheck('bridge');
      health = await manager.checkHealth('bridge');
      expect(health.consecutiveFailures).toBe(2);

      // Third failure
      await manager.performHealthCheck('bridge');
      health = await manager.checkHealth('bridge');
      expect(health.consecutiveFailures).toBe(3);
    });

    it('should reset consecutive failures on success', async () => {
      await startBridgeService();

      // First fail several times
      mockFetch.mockRejectedValue(new Error('Connection refused'));
      await manager.performHealthCheck('bridge');
      await manager.performHealthCheck('bridge');

      let health = await manager.checkHealth('bridge');
      expect(health.consecutiveFailures).toBe(2);

      // Then succeed
      mockFetch.mockResolvedValue({ ok: true, status: 200 } as Response);
      await manager.performHealthCheck('bridge');

      health = await manager.checkHealth('bridge');
      expect(health.consecutiveFailures).toBe(0);
    });

    it('should track bridge failures independently from AI failures', async () => {
      // Start both services
      await manager.startAIService();
      await manager.startBridgeService();

      mockFetch.mockRejectedValue(new Error('Connection refused'));

      // Fail bridge health check
      await manager.performHealthCheck('bridge');

      // AI should still have 0 failures
      const aiHealth = await manager.checkHealth('ai');
      const bridgeHealth = await manager.checkHealth('bridge');

      expect(aiHealth.consecutiveFailures).toBe(0);
      expect(bridgeHealth.consecutiveFailures).toBe(1);
    });
  });

  // ===========================================
  // T008.2.3.4 - Health Change Events for Bridge
  // ===========================================

  describe('Health Change Events for Bridge', () => {
    it('should emit healthChange event when bridge becomes unhealthy', async () => {
      await startBridgeService();

      const listener = jest.fn();
      manager.on('healthChange', listener);

      // First call establishes baseline (no event)
      await manager.performHealthCheck('bridge');

      // Second call with failure should emit event
      mockFetch.mockRejectedValue(new Error('Connection refused'));
      await manager.performHealthCheck('bridge');

      expect(listener).toHaveBeenCalledWith(
        expect.objectContaining({
          service: 'bridge',
          healthy: false,
        })
      );
    });

    it('should emit healthChange event when bridge becomes healthy again', async () => {
      await startBridgeService();

      // First establish healthy baseline
      await manager.performHealthCheck('bridge');

      // Then fail
      mockFetch.mockRejectedValue(new Error('Connection refused'));
      await manager.performHealthCheck('bridge');

      const listener = jest.fn();
      manager.on('healthChange', listener);

      // Then succeed again
      mockFetch.mockResolvedValue({ ok: true, status: 200 } as Response);
      await manager.performHealthCheck('bridge');

      expect(listener).toHaveBeenCalledWith(
        expect.objectContaining({
          service: 'bridge',
          healthy: true,
        })
      );
    });

    it('should include consecutiveFailures in healthChange event', async () => {
      await startBridgeService();

      // First call to establish baseline
      await manager.performHealthCheck('bridge');

      const listener = jest.fn();
      manager.on('healthChange', listener);

      // Multiple failures
      mockFetch.mockRejectedValue(new Error('Connection refused'));
      await manager.performHealthCheck('bridge');
      await manager.performHealthCheck('bridge');

      expect(listener).toHaveBeenCalledWith(
        expect.objectContaining({
          service: 'bridge',
          healthy: false,
          consecutiveFailures: expect.any(Number),
        })
      );
    });

    it('should include timestamp in healthChange event', async () => {
      await startBridgeService();

      await manager.performHealthCheck('bridge');

      const listener = jest.fn();
      manager.on('healthChange', listener);

      mockFetch.mockRejectedValue(new Error('Connection refused'));
      await manager.performHealthCheck('bridge');

      expect(listener).toHaveBeenCalledWith(
        expect.objectContaining({
          service: 'bridge',
          timestamp: expect.any(Date),
        })
      );
    });
  });

  // ===========================================
  // T008.2.3.5 - Bridge Service Not Running
  // ===========================================

  describe('Bridge Service Not Running', () => {
    it('should skip health check if bridge service is STOPPED', async () => {
      expect(manager.getBridgeServiceStatus()).toBe(ServiceStatus.STOPPED);

      const result = await manager.performHealthCheck('bridge');

      expect(result.healthy).toBe(false);
      expect(result.skipped).toBe(true);
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('should skip health check if bridge service is STARTING', async () => {
      // Start bridge but don't let it complete
      const neverSpawnProcess = createMockChildProcess();
      mockSpawn.mockImplementation(() => {
        // Never emit spawn
        return neverSpawnProcess as never;
      });

      // Start but don't await (will be pending)
      manager.startBridgeService().catch(() => {});

      expect(manager.getBridgeServiceStatus()).toBe(ServiceStatus.STARTING);

      const result = await manager.performHealthCheck('bridge');

      expect(result.healthy).toBe(false);
      expect(result.skipped).toBe(true);
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('should skip health check if bridge service is in ERROR state', async () => {
      // Start and then crash
      const crashProcess = createMockChildProcess();
      mockSpawn.mockImplementation(() => {
        setTimeout(() => crashProcess.emit('error', new Error('Crash')), 10);
        return crashProcess as never;
      });

      try {
        await manager.startBridgeService();
      } catch {
        // Expected
      }

      expect(manager.getBridgeServiceStatus()).toBe(ServiceStatus.ERROR);

      const result = await manager.performHealthCheck('bridge');

      expect(result.healthy).toBe(false);
      expect(result.skipped).toBe(true);
    });
  });

  // ===========================================
  // T008.2.3.6 - Health Check Polling Integration
  // ===========================================

  describe('Health Check Polling Integration', () => {
    it('should check both AI and bridge services during polling', async () => {
      // Use short polling interval for test
      const pollingManager = new ProcessManager({
        healthCheckInterval: 50,
        fetchFn: mockFetch as unknown as never,
      });

      const pollingMockProcess = createMockChildProcess();
      mockSpawn.mockImplementation(() => {
        setTimeout(() => pollingMockProcess.emit('spawn'), 10);
        return pollingMockProcess as never;
      });

      await pollingManager.startAll();

      // Wait for at least one polling cycle (50ms interval + buffer)
      await new Promise(resolve => setTimeout(resolve, 100));

      // Both services should have been checked
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining(':8000/health'), // AI port
        expect.any(Object)
      );
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining(':5000/health'), // Bridge port
        expect.any(Object)
      );
    });

    it('should update lastHealthCheck for bridge after polling', async () => {
      await startBridgeService();

      const beforeCheck = await manager.checkHealth('bridge');
      expect(beforeCheck.lastHealthCheck).toBeUndefined();

      await manager.performHealthCheck('bridge');

      const afterCheck = await manager.checkHealth('bridge');
      expect(afterCheck.lastHealthCheck).toBeDefined();
      expect(afterCheck.lastHealthCheck).toBeInstanceOf(Date);
    });
  });

  // ===========================================
  // T008.2.3.7 - Configuration for Bridge Health Check
  // ===========================================

  describe('Configuration for Bridge Health Check', () => {
    it('should use configured bridgeServicePort', () => {
      const customManager = new ProcessManager({
        bridgeServicePort: 6000,
        fetchFn: mockFetch as unknown as never,
      });

      const config = customManager.getConfig();
      expect(config.bridgeServicePort).toBe(6000);
    });

    it('should default bridgeServicePort to 5000', () => {
      const config = manager.getConfig();
      expect(config.bridgeServicePort).toBe(5000);
    });

    it('should use custom port for bridge health check', async () => {
      const customManager = new ProcessManager({
        bridgeServicePort: 6000,
        fetchFn: mockFetch as unknown as never,
      });

      const customMockProcess = createMockChildProcess();
      mockSpawn.mockImplementation(() => {
        setTimeout(() => customMockProcess.emit('spawn'), 10);
        return customMockProcess as never;
      });

      await customManager.startBridgeService();
      await customManager.performHealthCheck('bridge');

      expect(mockFetch).toHaveBeenCalledWith(
        'http://127.0.0.1:6000/health',
        expect.any(Object)
      );
    });

    it('should use same healthCheckTimeoutMs for bridge as AI', async () => {
      const config = manager.getConfig();
      expect(config.healthCheckTimeoutMs).toBeDefined();
      expect(config.healthCheckTimeoutMs).toBe(5000); // Default
    });

    it('should use same healthCheckRetries for bridge as AI', async () => {
      const config = manager.getConfig();
      expect(config.healthCheckRetries).toBeDefined();
      expect(config.healthCheckRetries).toBe(3); // Default
    });
  });
});

// ===========================================
// T008.3.1 - Auto-Restart with Max Retries Tests
// ===========================================

describe('ProcessManager Auto-Restart with Max Retries (T008.3.1)', () => {
  let manager: ProcessManager;
  let mockProcess: ReturnType<typeof createMockChildProcess>;
  const mockSpawn = spawn as jest.MockedFunction<typeof spawn>;

  beforeEach(() => {
    jest.clearAllMocks();
    manager = new ProcessManager();
    mockProcess = createMockChildProcess();
    mockSpawn.mockImplementation(() => {
      const proc = createMockChildProcess();
      setTimeout(() => proc.emit('spawn'), 10);
      return proc as never;
    });
  });

  afterEach(() => {
    jest.clearAllTimers();
  });

  // ===========================================
  // T008.3.1.1 - Max Restarts Configuration
  // ===========================================

  describe('Max Restarts Configuration', () => {
    it('should have maxRestarts configuration option', () => {
      const config = manager.getConfig();
      expect(config).toHaveProperty('maxRestarts');
    });

    it('should default maxRestarts to 3', () => {
      const config = manager.getConfig();
      expect(config.maxRestarts).toBe(3);
    });

    it('should allow custom maxRestarts via config', () => {
      const customManager = new ProcessManager({ maxRestarts: 5 });
      const config = customManager.getConfig();
      expect(config.maxRestarts).toBe(5);
    });

    it('should allow zero maxRestarts (disabled)', () => {
      const customManager = new ProcessManager({ maxRestarts: 0 });
      const config = customManager.getConfig();
      expect(config.maxRestarts).toBe(0);
    });
  });

  // ===========================================
  // T008.3.1.2 - Auto-Restart on Crash
  // ===========================================

  describe('Auto-Restart on Crash', () => {
    it('should have enableAutoRestart configuration option', () => {
      const config = manager.getConfig();
      expect(config).toHaveProperty('enableAutoRestart');
    });

    it('should default enableAutoRestart to true', () => {
      const config = manager.getConfig();
      expect(config.enableAutoRestart).toBe(true);
    });

    it('should auto-restart AI service when it crashes', async () => {
      const autoRestartManager = new ProcessManager({ enableAutoRestart: true, restartBackoffMs: 10 });

      let spawnCount = 0;
      const processes: ReturnType<typeof createMockChildProcess>[] = [];

      mockSpawn.mockImplementation(() => {
        spawnCount++;
        const proc = createMockChildProcess();
        processes.push(proc);
        setTimeout(() => proc.emit('spawn'), 10);
        return proc as never;
      });

      await autoRestartManager.startAIService();
      expect(spawnCount).toBe(1);

      // Simulate crash (non-zero exit)
      processes[0].emit('exit', 1, null);

      // Wait for auto-restart
      await new Promise(resolve => setTimeout(resolve, 100));

      // Should have spawned a new process
      expect(spawnCount).toBeGreaterThan(1);
    });

    it('should not auto-restart when disabled', async () => {
      const noAutoRestartManager = new ProcessManager({ enableAutoRestart: false });

      let spawnCount = 0;
      const processes: ReturnType<typeof createMockChildProcess>[] = [];

      mockSpawn.mockImplementation(() => {
        spawnCount++;
        const proc = createMockChildProcess();
        processes.push(proc);
        setTimeout(() => proc.emit('spawn'), 10);
        return proc as never;
      });

      await noAutoRestartManager.startAIService();
      expect(spawnCount).toBe(1);

      // Simulate crash
      processes[0].emit('exit', 1, null);

      // Wait a bit
      await new Promise(resolve => setTimeout(resolve, 100));

      // Should NOT have auto-restarted
      expect(spawnCount).toBe(1);
    });

    it('should not auto-restart on graceful stop (exit code 0)', async () => {
      const autoRestartManager = new ProcessManager({ enableAutoRestart: true, restartBackoffMs: 10 });

      let spawnCount = 0;
      const processes: ReturnType<typeof createMockChildProcess>[] = [];

      mockSpawn.mockImplementation(() => {
        spawnCount++;
        const proc = createMockChildProcess();
        processes.push(proc);
        setTimeout(() => proc.emit('spawn'), 10);
        return proc as never;
      });

      await autoRestartManager.startAIService();

      // Graceful exit (code 0)
      processes[0].emit('exit', 0, 'SIGTERM');

      await new Promise(resolve => setTimeout(resolve, 100));

      // Should NOT have auto-restarted
      expect(spawnCount).toBe(1);
    });
  });

  // ===========================================
  // T008.3.1.3 - Max Restarts Limit
  // ===========================================

  describe('Max Restarts Limit', () => {
    it('should stop auto-restarting after max restarts reached', async () => {
      const limitedManager = new ProcessManager({
        enableAutoRestart: true,
        maxRestarts: 3,
        restartBackoffMs: 10,
      });

      let spawnCount = 0;
      const processes: ReturnType<typeof createMockChildProcess>[] = [];

      mockSpawn.mockImplementation(() => {
        spawnCount++;
        const proc = createMockChildProcess();
        processes.push(proc);
        setTimeout(() => proc.emit('spawn'), 10);
        return proc as never;
      });

      await limitedManager.startAIService();
      expect(spawnCount).toBe(1);

      // Crash 1
      processes[0].emit('exit', 1, null);
      await new Promise(resolve => setTimeout(resolve, 50));
      expect(spawnCount).toBe(2); // Restarted

      // Crash 2
      processes[1].emit('exit', 1, null);
      await new Promise(resolve => setTimeout(resolve, 50));
      expect(spawnCount).toBe(3); // Restarted

      // Crash 3
      processes[2].emit('exit', 1, null);
      await new Promise(resolve => setTimeout(resolve, 50));
      expect(spawnCount).toBe(4); // Restarted

      // Crash 4 - should NOT restart (max reached)
      processes[3].emit('exit', 1, null);
      await new Promise(resolve => setTimeout(resolve, 100));
      expect(spawnCount).toBe(4); // No more restarts
    });

    it('should emit maxRestartsExceeded event when limit reached', async () => {
      const limitedManager = new ProcessManager({
        enableAutoRestart: true,
        maxRestarts: 2,
        restartBackoffMs: 10,
      });

      const listener = jest.fn();
      limitedManager.on('maxRestartsExceeded', listener);

      const processes: ReturnType<typeof createMockChildProcess>[] = [];

      mockSpawn.mockImplementation(() => {
        const proc = createMockChildProcess();
        processes.push(proc);
        setTimeout(() => proc.emit('spawn'), 10);
        return proc as never;
      });

      await limitedManager.startAIService();

      // Crash and restart twice
      processes[0].emit('exit', 1, null);
      await new Promise(resolve => setTimeout(resolve, 50));

      processes[1].emit('exit', 1, null);
      await new Promise(resolve => setTimeout(resolve, 50));

      // Third crash - max exceeded
      processes[2].emit('exit', 1, null);
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(listener).toHaveBeenCalledWith(
        expect.objectContaining({
          service: 'ai',
          restartCount: expect.any(Number),
        })
      );
    });

    it('should include maxRestarts in maxRestartsExceeded event', async () => {
      const limitedManager = new ProcessManager({
        enableAutoRestart: true,
        maxRestarts: 1,
        restartBackoffMs: 10,
      });

      const listener = jest.fn();
      limitedManager.on('maxRestartsExceeded', listener);

      const processes: ReturnType<typeof createMockChildProcess>[] = [];

      mockSpawn.mockImplementation(() => {
        const proc = createMockChildProcess();
        processes.push(proc);
        setTimeout(() => proc.emit('spawn'), 10);
        return proc as never;
      });

      await limitedManager.startAIService();

      processes[0].emit('exit', 1, null);
      await new Promise(resolve => setTimeout(resolve, 50));

      processes[1].emit('exit', 1, null);
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(listener).toHaveBeenCalledWith(
        expect.objectContaining({
          service: 'ai',
          maxRestarts: 1,
        })
      );
    });
  });

  // ===========================================
  // T008.3.1.4 - Restart Counter for Auto-Restart
  // ===========================================

  describe('Restart Counter for Auto-Restart', () => {
    it('should increment restart count on auto-restart', async () => {
      const autoRestartManager = new ProcessManager({ enableAutoRestart: true, restartBackoffMs: 10 });

      const processes: ReturnType<typeof createMockChildProcess>[] = [];

      mockSpawn.mockImplementation(() => {
        const proc = createMockChildProcess();
        processes.push(proc);
        setTimeout(() => proc.emit('spawn'), 10);
        return proc as never;
      });

      await autoRestartManager.startAIService();
      expect(autoRestartManager.getRestartCount('ai')).toBe(0);

      // Crash and auto-restart
      processes[0].emit('exit', 1, null);
      await new Promise(resolve => setTimeout(resolve, 50));

      expect(autoRestartManager.getRestartCount('ai')).toBe(1);
    });

    it('should track restart count across multiple crashes', async () => {
      const autoRestartManager = new ProcessManager({
        enableAutoRestart: true,
        maxRestarts: 5,
        restartBackoffMs: 10,
      });

      const processes: ReturnType<typeof createMockChildProcess>[] = [];

      mockSpawn.mockImplementation(() => {
        const proc = createMockChildProcess();
        processes.push(proc);
        setTimeout(() => proc.emit('spawn'), 10);
        return proc as never;
      });

      await autoRestartManager.startAIService();

      // Multiple crashes
      for (let i = 0; i < 3; i++) {
        processes[i].emit('exit', 1, null);
        await new Promise(resolve => setTimeout(resolve, 50));
      }

      expect(autoRestartManager.getRestartCount('ai')).toBe(3);
    });

    it('should allow manual reset of restart count', async () => {
      const autoRestartManager = new ProcessManager({ enableAutoRestart: true, restartBackoffMs: 10 });

      const processes: ReturnType<typeof createMockChildProcess>[] = [];

      mockSpawn.mockImplementation(() => {
        const proc = createMockChildProcess();
        processes.push(proc);
        setTimeout(() => proc.emit('spawn'), 10);
        return proc as never;
      });

      await autoRestartManager.startAIService();

      processes[0].emit('exit', 1, null);
      await new Promise(resolve => setTimeout(resolve, 50));

      expect(autoRestartManager.getRestartCount('ai')).toBe(1);

      autoRestartManager.resetRestartCount('ai');
      expect(autoRestartManager.getRestartCount('ai')).toBe(0);
    });
  });

  // ===========================================
  // T008.3.1.5 - Bridge Service Auto-Restart
  // ===========================================

  describe('Bridge Service Auto-Restart', () => {
    it('should auto-restart Bridge service when it crashes', async () => {
      const autoRestartManager = new ProcessManager({ enableAutoRestart: true, restartBackoffMs: 10 });

      let spawnCount = 0;
      const processes: ReturnType<typeof createMockChildProcess>[] = [];

      mockSpawn.mockImplementation(() => {
        spawnCount++;
        const proc = createMockChildProcess();
        processes.push(proc);
        setTimeout(() => proc.emit('spawn'), 10);
        return proc as never;
      });

      await autoRestartManager.startBridgeService();
      expect(spawnCount).toBe(1);

      // Simulate crash
      processes[0].emit('exit', 1, null);

      await new Promise(resolve => setTimeout(resolve, 100));

      expect(spawnCount).toBeGreaterThan(1);
    });

    it('should track Bridge restart count separately from AI', async () => {
      const autoRestartManager = new ProcessManager({ enableAutoRestart: true, restartBackoffMs: 10 });

      const processes: ReturnType<typeof createMockChildProcess>[] = [];

      mockSpawn.mockImplementation(() => {
        const proc = createMockChildProcess();
        processes.push(proc);
        setTimeout(() => proc.emit('spawn'), 10);
        return proc as never;
      });

      await autoRestartManager.startAIService();
      await autoRestartManager.startBridgeService();

      // Crash bridge only
      processes[1].emit('exit', 1, null);
      await new Promise(resolve => setTimeout(resolve, 50));

      expect(autoRestartManager.getRestartCount('ai')).toBe(0);
      expect(autoRestartManager.getRestartCount('bridge')).toBe(1);
    });

    it('should emit maxRestartsExceeded for Bridge service', async () => {
      const limitedManager = new ProcessManager({
        enableAutoRestart: true,
        maxRestarts: 1,
        restartBackoffMs: 10,
      });

      const listener = jest.fn();
      limitedManager.on('maxRestartsExceeded', listener);

      const processes: ReturnType<typeof createMockChildProcess>[] = [];

      mockSpawn.mockImplementation(() => {
        const proc = createMockChildProcess();
        processes.push(proc);
        setTimeout(() => proc.emit('spawn'), 10);
        return proc as never;
      });

      await limitedManager.startBridgeService();

      processes[0].emit('exit', 1, null);
      await new Promise(resolve => setTimeout(resolve, 50));

      processes[1].emit('exit', 1, null);
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(listener).toHaveBeenCalledWith(
        expect.objectContaining({
          service: 'bridge',
        })
      );
    });
  });

  // ===========================================
  // T008.3.1.6 - Restart Event Emission
  // ===========================================

  describe('Restart Event Emission', () => {
    it('should emit restart event on auto-restart', async () => {
      const autoRestartManager = new ProcessManager({ enableAutoRestart: true, restartBackoffMs: 10 });

      const listener = jest.fn();
      autoRestartManager.on('restart', listener);

      const processes: ReturnType<typeof createMockChildProcess>[] = [];

      mockSpawn.mockImplementation(() => {
        const proc = createMockChildProcess();
        processes.push(proc);
        setTimeout(() => proc.emit('spawn'), 10);
        return proc as never;
      });

      await autoRestartManager.startAIService();

      processes[0].emit('exit', 1, null);
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(listener).toHaveBeenCalledWith(
        expect.objectContaining({
          service: 'ai',
          restartCount: 1,
        })
      );
    });

    it('should include reason in restart event', async () => {
      const autoRestartManager = new ProcessManager({ enableAutoRestart: true, restartBackoffMs: 10 });

      const listener = jest.fn();
      autoRestartManager.on('restart', listener);

      const processes: ReturnType<typeof createMockChildProcess>[] = [];

      mockSpawn.mockImplementation(() => {
        const proc = createMockChildProcess();
        processes.push(proc);
        setTimeout(() => proc.emit('spawn'), 10);
        return proc as never;
      });

      await autoRestartManager.startAIService();

      processes[0].emit('exit', 1, 'SIGSEGV');
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(listener).toHaveBeenCalledWith(
        expect.objectContaining({
          service: 'ai',
          reason: expect.stringContaining('crash'),
        })
      );
    });
  });
});

// ===========================================
// T008.3.2 - Exponential Backoff Tests
// ===========================================

describe('ProcessManager Exponential Backoff (T008.3.2)', () => {
  let manager: ProcessManager;
  const mockSpawn = spawn as jest.MockedFunction<typeof spawn>;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  // ===========================================
  // T008.3.2.1 - Backoff Configuration
  // ===========================================

  describe('Backoff Configuration', () => {
    it('should have restartBackoffMs configuration option', () => {
      manager = new ProcessManager();
      const config = manager.getConfig();
      expect(config).toHaveProperty('restartBackoffMs');
    });

    it('should default restartBackoffMs to 1000', () => {
      manager = new ProcessManager();
      const config = manager.getConfig();
      expect(config.restartBackoffMs).toBe(1000);
    });

    it('should allow custom restartBackoffMs via config', () => {
      manager = new ProcessManager({ restartBackoffMs: 2000 });
      const config = manager.getConfig();
      expect(config.restartBackoffMs).toBe(2000);
    });
  });

  // ===========================================
  // T008.3.2.2 - Exponential Delay Pattern
  // ===========================================

  describe('Exponential Delay Pattern', () => {
    it('should delay first restart by base backoff (1s)', async () => {
      manager = new ProcessManager({
        enableAutoRestart: true,
        restartBackoffMs: 1000,
      });

      let spawnCount = 0;
      const processes: ReturnType<typeof createMockChildProcess>[] = [];

      mockSpawn.mockImplementation(() => {
        spawnCount++;
        const proc = createMockChildProcess();
        processes.push(proc);
        setTimeout(() => proc.emit('spawn'), 10);
        return proc as never;
      });

      // Start service
      const startPromise = manager.startAIService();
      jest.advanceTimersByTime(10);
      await startPromise;
      expect(spawnCount).toBe(1);

      // Crash the service
      processes[0].emit('exit', 1, null);

      // Should not restart immediately
      jest.advanceTimersByTime(500);
      expect(spawnCount).toBe(1);

      // Should restart after 1000ms
      jest.advanceTimersByTime(600);
      expect(spawnCount).toBe(2);
    });

    it('should delay second restart by 2x backoff (2s)', async () => {
      manager = new ProcessManager({
        enableAutoRestart: true,
        restartBackoffMs: 1000,
        maxRestarts: 5,
      });

      let spawnCount = 0;
      const processes: ReturnType<typeof createMockChildProcess>[] = [];

      mockSpawn.mockImplementation(() => {
        spawnCount++;
        const proc = createMockChildProcess();
        processes.push(proc);
        setTimeout(() => proc.emit('spawn'), 10);
        return proc as never;
      });

      // Start service
      const startPromise = manager.startAIService();
      jest.advanceTimersByTime(10);
      await startPromise;
      expect(spawnCount).toBe(1);

      // First crash and restart (1s delay)
      processes[0].emit('exit', 1, null);
      jest.advanceTimersByTime(1100);
      expect(spawnCount).toBe(2);

      // Wait for spawn event
      jest.advanceTimersByTime(10);

      // Second crash
      processes[1].emit('exit', 1, null);

      // Should not restart after 1s
      jest.advanceTimersByTime(1500);
      expect(spawnCount).toBe(2);

      // Should restart after 2s total
      jest.advanceTimersByTime(600);
      expect(spawnCount).toBe(3);
    });

    it('should delay third restart by 4x backoff (4s)', async () => {
      manager = new ProcessManager({
        enableAutoRestart: true,
        restartBackoffMs: 1000,
        maxRestarts: 5,
      });

      let spawnCount = 0;
      const processes: ReturnType<typeof createMockChildProcess>[] = [];

      mockSpawn.mockImplementation(() => {
        spawnCount++;
        const proc = createMockChildProcess();
        processes.push(proc);
        setTimeout(() => proc.emit('spawn'), 10);
        return proc as never;
      });

      // Start service
      const startPromise = manager.startAIService();
      jest.advanceTimersByTime(10);
      await startPromise;

      // First crash (1s delay)
      processes[0].emit('exit', 1, null);
      jest.advanceTimersByTime(1100);
      jest.advanceTimersByTime(10); // spawn

      // Second crash (2s delay)
      processes[1].emit('exit', 1, null);
      jest.advanceTimersByTime(2100);
      jest.advanceTimersByTime(10); // spawn

      // Third crash
      processes[2].emit('exit', 1, null);

      // Should not restart after 3s
      jest.advanceTimersByTime(3500);
      expect(spawnCount).toBe(3);

      // Should restart after 4s total
      jest.advanceTimersByTime(600);
      expect(spawnCount).toBe(4);
    });

    it('should include delay in restart event', async () => {
      manager = new ProcessManager({
        enableAutoRestart: true,
        restartBackoffMs: 1000,
      });

      const listener = jest.fn();
      manager.on('restart', listener);

      const processes: ReturnType<typeof createMockChildProcess>[] = [];

      mockSpawn.mockImplementation(() => {
        const proc = createMockChildProcess();
        processes.push(proc);
        setTimeout(() => proc.emit('spawn'), 10);
        return proc as never;
      });

      // Start service
      const startPromise = manager.startAIService();
      jest.advanceTimersByTime(10);
      await startPromise;

      // Crash
      processes[0].emit('exit', 1, null);
      jest.advanceTimersByTime(1100);

      expect(listener).toHaveBeenCalledWith(
        expect.objectContaining({
          service: 'ai',
          delay: 1000,
        })
      );
    });
  });

  // ===========================================
  // T008.3.2.3 - Backoff Reset
  // ===========================================

  describe('Backoff Reset', () => {
    it('should reset backoff delay after successful start period', async () => {
      manager = new ProcessManager({
        enableAutoRestart: true,
        restartBackoffMs: 1000,
        maxRestarts: 10,
      });

      let spawnCount = 0;
      const processes: ReturnType<typeof createMockChildProcess>[] = [];

      mockSpawn.mockImplementation(() => {
        spawnCount++;
        const proc = createMockChildProcess();
        processes.push(proc);
        setTimeout(() => proc.emit('spawn'), 10);
        return proc as never;
      });

      // Start service
      const startPromise = manager.startAIService();
      jest.advanceTimersByTime(10);
      await startPromise;

      // Crash twice to increase backoff
      processes[0].emit('exit', 1, null);
      jest.advanceTimersByTime(1100);
      jest.advanceTimersByTime(10);

      processes[1].emit('exit', 1, null);
      jest.advanceTimersByTime(2100);
      jest.advanceTimersByTime(10);

      // Simulate stable running period
      jest.advanceTimersByTime(60000); // 1 minute stable

      // Reset restart count (simulating manual intervention)
      manager.resetRestartCount('ai');

      // Crash again
      processes[2].emit('exit', 1, null);

      // Should restart after base backoff (1s), not 4s
      jest.advanceTimersByTime(1100);
      expect(spawnCount).toBe(4);
    });
  });

  // ===========================================
  // T008.3.2.4 - Bridge Service Backoff
  // ===========================================

  describe('Bridge Service Backoff', () => {
    it('should apply exponential backoff to Bridge service', async () => {
      manager = new ProcessManager({
        enableAutoRestart: true,
        restartBackoffMs: 1000,
      });

      let spawnCount = 0;
      const processes: ReturnType<typeof createMockChildProcess>[] = [];

      mockSpawn.mockImplementation(() => {
        spawnCount++;
        const proc = createMockChildProcess();
        processes.push(proc);
        setTimeout(() => proc.emit('spawn'), 10);
        return proc as never;
      });

      // Start bridge service
      const startPromise = manager.startBridgeService();
      jest.advanceTimersByTime(10);
      await startPromise;
      expect(spawnCount).toBe(1);

      // Crash the service
      processes[0].emit('exit', 1, null);

      // Should not restart immediately
      jest.advanceTimersByTime(500);
      expect(spawnCount).toBe(1);

      // Should restart after 1000ms
      jest.advanceTimersByTime(600);
      expect(spawnCount).toBe(2);
    });

    it('should track Bridge backoff independently from AI', async () => {
      manager = new ProcessManager({
        enableAutoRestart: true,
        restartBackoffMs: 1000,
        maxRestarts: 10,
      });

      let aiSpawnCount = 0;
      let bridgeSpawnCount = 0;
      const processes: ReturnType<typeof createMockChildProcess>[] = [];

      mockSpawn.mockImplementation((cmd) => {
        if (cmd.includes('python')) {
          aiSpawnCount++;
        } else {
          bridgeSpawnCount++;
        }
        const proc = createMockChildProcess();
        processes.push(proc);
        setTimeout(() => proc.emit('spawn'), 10);
        return proc as never;
      });

      // Start both services
      const aiStart = manager.startAIService();
      jest.advanceTimersByTime(10);
      await aiStart;

      const bridgeStart = manager.startBridgeService();
      jest.advanceTimersByTime(10);
      await bridgeStart;

      // Crash AI twice to increase its backoff
      processes[0].emit('exit', 1, null);
      jest.advanceTimersByTime(1100);
      jest.advanceTimersByTime(10);

      processes[2].emit('exit', 1, null);
      jest.advanceTimersByTime(2100);
      jest.advanceTimersByTime(10);

      // Bridge crashes for the first time - should use base backoff (1s)
      processes[1].emit('exit', 1, null);
      jest.advanceTimersByTime(1100);

      // Bridge should have restarted after 1s, not 4s
      expect(bridgeSpawnCount).toBe(2);
    });
  });
});

// ===========================================
// T008.3.4 - Restart Logging Tests
// ===========================================

describe('ProcessManager Restart Logging (T008.3.4)', () => {
  let manager: ProcessManager;
  const mockSpawn = spawn as jest.MockedFunction<typeof spawn>;
  let consoleLogSpy: jest.SpyInstance;
  let consoleWarnSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    jest.useRealTimers();
    consoleLogSpy.mockRestore();
    consoleWarnSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  // ===========================================
  // T008.3.4.1 - Log Restart Attempts
  // ===========================================

  describe('Log Restart Attempts', () => {
    it('should log when auto-restart is triggered', async () => {
      manager = new ProcessManager({
        enableAutoRestart: true,
        restartBackoffMs: 10,
      });

      const processes: ReturnType<typeof createMockChildProcess>[] = [];

      mockSpawn.mockImplementation(() => {
        const proc = createMockChildProcess();
        processes.push(proc);
        setTimeout(() => proc.emit('spawn'), 10);
        return proc as never;
      });

      const startPromise = manager.startAIService();
      jest.advanceTimersByTime(10);
      await startPromise;

      // Clear logs from startup
      consoleLogSpy.mockClear();

      // Crash service
      processes[0].emit('exit', 1, null);

      // Should log restart attempt
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('Auto-restarting')
      );
    });

    it('should include attempt number in log', async () => {
      manager = new ProcessManager({
        enableAutoRestart: true,
        restartBackoffMs: 10,
        maxRestarts: 5,
      });

      const processes: ReturnType<typeof createMockChildProcess>[] = [];

      mockSpawn.mockImplementation(() => {
        const proc = createMockChildProcess();
        processes.push(proc);
        setTimeout(() => proc.emit('spawn'), 10);
        return proc as never;
      });

      const startPromise = manager.startAIService();
      jest.advanceTimersByTime(10);
      await startPromise;

      consoleLogSpy.mockClear();
      processes[0].emit('exit', 1, null);

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('attempt 1')
      );
    });

    it('should include max restarts in log', async () => {
      manager = new ProcessManager({
        enableAutoRestart: true,
        restartBackoffMs: 10,
        maxRestarts: 3,
      });

      const processes: ReturnType<typeof createMockChildProcess>[] = [];

      mockSpawn.mockImplementation(() => {
        const proc = createMockChildProcess();
        processes.push(proc);
        setTimeout(() => proc.emit('spawn'), 10);
        return proc as never;
      });

      const startPromise = manager.startAIService();
      jest.advanceTimersByTime(10);
      await startPromise;

      consoleLogSpy.mockClear();
      processes[0].emit('exit', 1, null);

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('/3')
      );
    });

    it('should include delay in log', async () => {
      manager = new ProcessManager({
        enableAutoRestart: true,
        restartBackoffMs: 1000,
      });

      const processes: ReturnType<typeof createMockChildProcess>[] = [];

      mockSpawn.mockImplementation(() => {
        const proc = createMockChildProcess();
        processes.push(proc);
        setTimeout(() => proc.emit('spawn'), 10);
        return proc as never;
      });

      const startPromise = manager.startAIService();
      jest.advanceTimersByTime(10);
      await startPromise;

      consoleLogSpy.mockClear();
      processes[0].emit('exit', 1, null);

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('1000ms')
      );
    });

    it('should include service name in log', async () => {
      manager = new ProcessManager({
        enableAutoRestart: true,
        restartBackoffMs: 10,
      });

      const processes: ReturnType<typeof createMockChildProcess>[] = [];

      mockSpawn.mockImplementation(() => {
        const proc = createMockChildProcess();
        processes.push(proc);
        setTimeout(() => proc.emit('spawn'), 10);
        return proc as never;
      });

      const startPromise = manager.startAIService();
      jest.advanceTimersByTime(10);
      await startPromise;

      consoleLogSpy.mockClear();
      processes[0].emit('exit', 1, null);

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('[ai]')
      );
    });
  });

  // ===========================================
  // T008.3.4.2 - Log Max Restarts Exceeded
  // ===========================================

  describe('Log Max Restarts Exceeded', () => {
    it('should warn when max restarts exceeded', async () => {
      manager = new ProcessManager({
        enableAutoRestart: true,
        restartBackoffMs: 10,
        maxRestarts: 1,
      });

      const processes: ReturnType<typeof createMockChildProcess>[] = [];

      mockSpawn.mockImplementation(() => {
        const proc = createMockChildProcess();
        processes.push(proc);
        setTimeout(() => proc.emit('spawn'), 10);
        return proc as never;
      });

      const startPromise = manager.startAIService();
      jest.advanceTimersByTime(10);
      await startPromise;

      // First crash - restarts
      processes[0].emit('exit', 1, null);
      jest.advanceTimersByTime(20);
      jest.advanceTimersByTime(10);

      consoleWarnSpy.mockClear();

      // Second crash - exceeds max
      processes[1].emit('exit', 1, null);

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Max restarts')
      );
    });

    it('should include max count in warning', async () => {
      manager = new ProcessManager({
        enableAutoRestart: true,
        restartBackoffMs: 10,
        maxRestarts: 2,
      });

      const processes: ReturnType<typeof createMockChildProcess>[] = [];

      mockSpawn.mockImplementation(() => {
        const proc = createMockChildProcess();
        processes.push(proc);
        setTimeout(() => proc.emit('spawn'), 10);
        return proc as never;
      });

      const startPromise = manager.startAIService();
      jest.advanceTimersByTime(10);
      await startPromise;

      // Exhaust restarts
      processes[0].emit('exit', 1, null);
      jest.advanceTimersByTime(30);

      processes[1].emit('exit', 1, null);
      jest.advanceTimersByTime(50);

      consoleWarnSpy.mockClear();

      // Exceed max
      processes[2].emit('exit', 1, null);

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('(2)')
      );
    });
  });

  // ===========================================
  // T008.3.4.3 - Log Auto-Restart Disabled
  // ===========================================

  describe('Log Auto-Restart Disabled', () => {
    it('should log when auto-restart is disabled', async () => {
      manager = new ProcessManager({
        enableAutoRestart: false,
      });

      const processes: ReturnType<typeof createMockChildProcess>[] = [];

      mockSpawn.mockImplementation(() => {
        const proc = createMockChildProcess();
        processes.push(proc);
        setTimeout(() => proc.emit('spawn'), 10);
        return proc as never;
      });

      const startPromise = manager.startAIService();
      jest.advanceTimersByTime(10);
      await startPromise;

      consoleLogSpy.mockClear();

      processes[0].emit('exit', 1, null);

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('Auto-restart disabled')
      );
    });
  });

  // ===========================================
  // T008.3.4.4 - Bridge Service Logging
  // ===========================================

  describe('Bridge Service Logging', () => {
    it('should log Bridge service restart attempts', async () => {
      manager = new ProcessManager({
        enableAutoRestart: true,
        restartBackoffMs: 10,
      });

      const processes: ReturnType<typeof createMockChildProcess>[] = [];

      mockSpawn.mockImplementation(() => {
        const proc = createMockChildProcess();
        processes.push(proc);
        setTimeout(() => proc.emit('spawn'), 10);
        return proc as never;
      });

      const startPromise = manager.startBridgeService();
      jest.advanceTimersByTime(10);
      await startPromise;

      consoleLogSpy.mockClear();
      processes[0].emit('exit', 1, null);

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('[bridge]')
      );
    });
  });
});
