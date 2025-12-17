/**
 * ContPAQ Win - Process Manager
 *
 * Manages the lifecycle of external service processes:
 * - AI Service (Python/FastAPI)
 * - Windows Bridge (.NET/ASP.NET Core)
 *
 * T008.1.1: Basic structure with stub implementations
 * T008.1.2: Added infrastructure (events, paths, errors, config)
 */

import { ChildProcess, spawn } from 'child_process';
import * as path from 'path';
import { app } from 'electron';

/**
 * Event types emitted by ProcessManager
 */
export type ProcessManagerEventType = 'statusChange' | 'error' | 'restart' | 'healthChange';

/**
 * Status change event payload
 */
export interface StatusChangeEvent {
  service: 'ai' | 'bridge';
  status: ServiceStatus;
  previousStatus: ServiceStatus;
  timestamp: Date;
}

/**
 * Restart event payload (T008.1.5)
 */
export interface RestartEvent {
  service: 'ai' | 'bridge';
  restartCount: number;
  timestamp: Date;
}

/**
 * Health change event payload (T008.1.6)
 */
export interface HealthChangeEvent {
  service: 'ai' | 'bridge';
  healthy: boolean;
  consecutiveFailures: number;
  timestamp: Date;
}

/**
 * Health check result (T008.1.6)
 */
export interface HealthCheckResult {
  healthy: boolean;
  status: ServiceStatus;
  error?: string;
  responseTimeMs?: number;
  retryCount?: number;
  skipped?: boolean;
}

/**
 * Event listener callback type
 */
export type EventListener = (event: StatusChangeEvent | RestartEvent | HealthChangeEvent) => void;

/**
 * Service status enumeration
 */
export enum ServiceStatus {
  STOPPED = 'stopped',
  STARTING = 'starting',
  RUNNING = 'running',
  STOPPING = 'stopping',
  ERROR = 'error',
}

/**
 * Service health information
 */
export interface ServiceHealth {
  status: ServiceStatus;
  pid?: number;
  uptime?: number;
  lastError?: string;
  lastHealthCheck?: Date;
  consecutiveFailures?: number; // T008.1.6
}

/**
 * Fetch function type for dependency injection (T008.1.6)
 */
export type FetchFunction = typeof globalThis.fetch;

/**
 * Process Manager configuration
 */
export interface ProcessManagerConfig {
  aiServicePort: number;
  bridgeServicePort: number;
  healthCheckInterval: number;
  maxRestartAttempts: number;
  restartBackoffMs: number;
  startupTimeoutMs: number;  // T008.1.3: Timeout for process startup
  shutdownTimeoutMs: number; // T008.1.4: Timeout for graceful shutdown before force kill
  healthCheckTimeoutMs: number; // T008.1.6: Timeout for individual health check
  healthCheckRetries: number; // T008.1.6: Number of retries for health check
  fetchFn?: FetchFunction; // T008.1.6: Injectable fetch for testing
}

/**
 * Log entry for process output
 */
export interface ProcessLogEntry {
  timestamp: Date;
  level: 'stdout' | 'stderr';
  message: string;
}

/**
 * Default configuration
 */
const DEFAULT_CONFIG: ProcessManagerConfig = {
  aiServicePort: 8000,
  bridgeServicePort: 5000,
  healthCheckInterval: 5000,
  maxRestartAttempts: 3,
  restartBackoffMs: 1000,
  startupTimeoutMs: 30000,  // T008.1.3: 30 second default timeout
  shutdownTimeoutMs: 5000,  // T008.1.4: 5 second default for graceful shutdown
  healthCheckTimeoutMs: 5000, // T008.1.6: 5 second default for health check timeout
  healthCheckRetries: 3, // T008.1.6: 3 retries by default
};

/**
 * ProcessManager class
 *
 * Handles starting, stopping, and monitoring of external service processes.
 * Implements auto-restart with exponential backoff on failures.
 */
export class ProcessManager {
  private config: ProcessManagerConfig;
  private aiServiceProcess: ChildProcess | null = null;
  private bridgeServiceProcess: ChildProcess | null = null;
  private aiServiceStatus: ServiceStatus = ServiceStatus.STOPPED;
  private bridgeServiceStatus: ServiceStatus = ServiceStatus.STOPPED;
  private aiRestartCount: number = 0;
  private bridgeRestartCount: number = 0;
  private healthCheckTimer: NodeJS.Timeout | null = null;

  // T008.1.2: Event emitter
  private eventListeners: Map<ProcessManagerEventType, Set<EventListener>> = new Map();

  // T008.1.2: Error tracking
  private aiLastError: string | null = null;
  private bridgeLastError: string | null = null;

  // T008.1.2: Start time tracking for uptime
  private aiStartTime: Date | null = null;
  private bridgeStartTime: Date | null = null;

  // T008.1.3: Process logs
  private aiProcessLogs: ProcessLogEntry[] = [];
  private bridgeProcessLogs: ProcessLogEntry[] = [];
  private readonly MAX_LOG_ENTRIES = 1000;

  // T008.1.6: Health check tracking
  private aiConsecutiveFailures: number = 0;
  private bridgeConsecutiveFailures: number = 0;
  private aiLastHealthCheck: Date | null = null;
  private bridgeLastHealthCheck: Date | null = null;
  private aiLastHealthStatus: boolean | null = null; // For change detection
  private bridgeLastHealthStatus: boolean | null = null;
  private fetchFn: FetchFunction;

  constructor(config: Partial<ProcessManagerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    // T008.1.6: Use injected fetch or default to globalThis.fetch
    this.fetchFn = config.fetchFn || globalThis.fetch;
    // Initialize event listener maps
    this.eventListeners.set('statusChange', new Set());
    this.eventListeners.set('error', new Set());
    this.eventListeners.set('restart', new Set());
    this.eventListeners.set('healthChange', new Set()); // T008.1.6
  }

  // ===========================================
  // T008.1.2: Event Emitter Methods
  // ===========================================

  /**
   * Subscribe to an event
   * @param event - Event type to subscribe to
   * @param listener - Callback function
   */
  on(event: ProcessManagerEventType, listener: EventListener): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.add(listener);
    }
  }

  /**
   * Unsubscribe from an event
   * @param event - Event type to unsubscribe from
   * @param listener - Callback function to remove
   */
  off(event: ProcessManagerEventType, listener: EventListener): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.delete(listener);
    }
  }

  /**
   * Emit an event to all listeners
   * @param event - Event type
   * @param payload - Event data
   */
  private emit(event: ProcessManagerEventType, payload: StatusChangeEvent | RestartEvent): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(listener => listener(payload));
    }
  }

  /**
   * Emit a restart event (T008.1.5)
   * @param service - Service that was restarted
   * @param restartCount - Current restart count
   */
  private emitRestart(service: 'ai' | 'bridge', restartCount: number): void {
    this.emit('restart', {
      service,
      restartCount,
      timestamp: new Date(),
    });
  }

  // ===========================================
  // T008.1.2: Path Resolution Methods
  // ===========================================

  /**
   * Get the path to the AI service directory
   * @returns Path to ai-service directory
   */
  getAIServicePath(): string {
    const appPath = app.getAppPath();
    if (app.isPackaged) {
      // In production, ai-service is bundled in resources
      return path.join(process.resourcesPath, 'ai-service');
    }
    // In development, it's a sibling directory
    return path.join(appPath, '..', 'ai-service');
  }

  /**
   * Get the path to the Windows Bridge service directory
   * @returns Path to windows-bridge directory
   */
  getBridgeServicePath(): string {
    const appPath = app.getAppPath();
    if (app.isPackaged) {
      // In production, windows-bridge is bundled in resources
      return path.join(process.resourcesPath, 'windows-bridge');
    }
    // In development, it's a sibling directory
    return path.join(appPath, '..', 'windows-bridge');
  }

  /**
   * Get the path to the Python executable
   * @returns Path to Python executable
   */
  getPythonPath(): string {
    if (app.isPackaged) {
      // In production, use bundled Python
      return path.join(process.resourcesPath, 'python', 'python.exe');
    }
    // In development, use system Python
    return process.platform === 'win32' ? 'python' : 'python3';
  }

  /**
   * Get the path to the dotnet executable (T008.2.1)
   * @returns Path to dotnet executable
   */
  getDotnetPath(): string {
    if (app.isPackaged) {
      // In production, use bundled dotnet runtime
      return path.join(process.resourcesPath, 'dotnet', 'dotnet.exe');
    }
    // In development, use system dotnet
    return 'dotnet';
  }

  // ===========================================
  // T008.1.2: Error Handling Methods
  // ===========================================

  /**
   * Get the last error for a service
   * @param service - Service to get error for
   * @returns Last error message or null
   */
  getLastError(service: 'ai' | 'bridge'): string | null {
    return service === 'ai' ? this.aiLastError : this.bridgeLastError;
  }

  /**
   * Clear the last error for a service
   * @param service - Service to clear error for
   */
  clearError(service: 'ai' | 'bridge'): void {
    if (service === 'ai') {
      this.aiLastError = null;
    } else {
      this.bridgeLastError = null;
    }
  }

  /**
   * Set an error for a service (internal)
   * @param service - Service that errored
   * @param error - Error message
   */
  private setError(service: 'ai' | 'bridge', error: string): void {
    if (service === 'ai') {
      this.aiLastError = error;
    } else {
      this.bridgeLastError = error;
    }
  }

  // ===========================================
  // T008.1.2: Configuration Access
  // ===========================================

  /**
   * Get a copy of the current configuration
   * @returns Copy of ProcessManagerConfig
   */
  getConfig(): ProcessManagerConfig {
    return { ...this.config };
  }

  // ===========================================
  // T008.1.2: Restart Counter Methods
  // ===========================================

  /**
   * Get the restart count for a service
   * @param service - Service to get count for
   * @returns Number of restarts
   */
  getRestartCount(service: 'ai' | 'bridge'): number {
    return service === 'ai' ? this.aiRestartCount : this.bridgeRestartCount;
  }

  /**
   * Reset the restart count for a service
   * @param service - Service to reset count for
   */
  resetRestartCount(service: 'ai' | 'bridge'): void {
    if (service === 'ai') {
      this.aiRestartCount = 0;
    } else {
      this.bridgeRestartCount = 0;
    }
  }

  // ===========================================
  // T008.1.3: Process Logging Methods
  // ===========================================

  /**
   * Get process logs for a service
   * @param service - Service to get logs for
   * @returns Array of log entries
   */
  getProcessLogs(service: 'ai' | 'bridge'): ProcessLogEntry[] {
    const logs = service === 'ai' ? this.aiProcessLogs : this.bridgeProcessLogs;
    return [...logs]; // Return copy
  }

  /**
   * Add a log entry for a service
   * @param service - Service to add log for
   * @param level - Log level (stdout or stderr)
   * @param message - Log message
   */
  private addLog(service: 'ai' | 'bridge', level: 'stdout' | 'stderr', message: string): void {
    const logs = service === 'ai' ? this.aiProcessLogs : this.bridgeProcessLogs;
    const entry: ProcessLogEntry = {
      timestamp: new Date(),
      level,
      message,
    };

    logs.push(entry);

    // Trim logs if exceeding max
    if (logs.length > this.MAX_LOG_ENTRIES) {
      logs.shift();
    }

    // Also log to console
    if (level === 'stdout') {
      console.log(`[AI Service] ${message}`);
    } else {
      console.error(`[AI Service ERROR] ${message}`);
    }
  }

  /**
   * Clear process logs for a service
   * @param service - Service to clear logs for
   */
  clearProcessLogs(service: 'ai' | 'bridge'): void {
    if (service === 'ai') {
      this.aiProcessLogs = [];
    } else {
      this.bridgeProcessLogs = [];
    }
  }

  // ===========================================
  // T008.1.2: Status Change Helper
  // ===========================================

  /**
   * Update service status and emit event
   * @param service - Service to update
   * @param newStatus - New status
   */
  private updateStatus(service: 'ai' | 'bridge', newStatus: ServiceStatus): void {
    const previousStatus = service === 'ai' ? this.aiServiceStatus : this.bridgeServiceStatus;

    if (service === 'ai') {
      this.aiServiceStatus = newStatus;
      // Track start time
      if (newStatus === ServiceStatus.RUNNING) {
        this.aiStartTime = new Date();
      } else if (newStatus === ServiceStatus.STOPPED) {
        this.aiStartTime = null;
      }
    } else {
      this.bridgeServiceStatus = newStatus;
      // Track start time
      if (newStatus === ServiceStatus.RUNNING) {
        this.bridgeStartTime = new Date();
      } else if (newStatus === ServiceStatus.STOPPED) {
        this.bridgeStartTime = null;
      }
    }

    // Emit status change event
    this.emit('statusChange', {
      service,
      status: newStatus,
      previousStatus,
      timestamp: new Date(),
    });
  }

  /**
   * Start the AI Service (Python/FastAPI)
   * @returns Promise that resolves when service is started
   */
  async startAIService(): Promise<void> {
    if (this.aiServiceStatus === ServiceStatus.RUNNING) {
      console.log('AI Service is already running');
      return;
    }

    this.updateStatus('ai', ServiceStatus.STARTING);
    console.log('Starting AI Service...');

    return new Promise((resolve, reject) => {
      // T008.1.3: Real process spawning implementation
      const pythonPath = this.getPythonPath();
      const aiServicePath = this.getAIServicePath();
      const srcPath = path.join(aiServicePath, 'src');

      const args = [
        '-m', 'uvicorn',
        'main:app',
        '--host', '127.0.0.1',
        '--port', String(this.config.aiServicePort),
      ];

      const spawnOptions = {
        cwd: srcPath,
        shell: false,
        stdio: ['ignore', 'pipe', 'pipe'] as const,
      };

      // Spawn the process
      this.aiServiceProcess = spawn(pythonPath, args, spawnOptions);

      // Setup timeout
      const timeoutId = setTimeout(() => {
        if (this.aiServiceStatus === ServiceStatus.STARTING) {
          const error = new Error(`AI Service startup timeout after ${this.config.startupTimeoutMs}ms`);
          this.setError('ai', error.message);
          this.updateStatus('ai', ServiceStatus.ERROR);
          this.emitError('ai', error);
          reject(error);
        }
      }, this.config.startupTimeoutMs);

      // Handle spawn event (process started successfully)
      this.aiServiceProcess.on('spawn', () => {
        clearTimeout(timeoutId);
        this.updateStatus('ai', ServiceStatus.RUNNING);
        console.log(`AI Service started (PID: ${this.aiServiceProcess?.pid})`);
        resolve();
      });

      // Handle error event (failed to spawn)
      this.aiServiceProcess.on('error', (error: Error) => {
        clearTimeout(timeoutId);
        this.setError('ai', error.message);
        this.updateStatus('ai', ServiceStatus.ERROR);
        this.emitError('ai', error);
        reject(error);
      });

      // Handle exit event (process terminated)
      this.aiServiceProcess.on('exit', (code: number | null, signal: string | null) => {
        clearTimeout(timeoutId);

        if (this.aiServiceStatus === ServiceStatus.STOPPING) {
          // Normal shutdown
          this.updateStatus('ai', ServiceStatus.STOPPED);
        } else if (code !== 0) {
          // Abnormal exit
          const errorMsg = `AI Service exited with code ${code}${signal ? ` (signal: ${signal})` : ''}`;
          this.setError('ai', errorMsg);
          this.updateStatus('ai', ServiceStatus.ERROR);
        } else {
          // Clean exit while running (unexpected)
          this.updateStatus('ai', ServiceStatus.STOPPED);
        }

        this.aiServiceProcess = null;
      });

      // Capture stdout
      if (this.aiServiceProcess.stdout) {
        this.aiServiceProcess.stdout.on('data', (data: Buffer) => {
          const message = data.toString().trim();
          if (message) {
            this.addLog('ai', 'stdout', message);
          }
        });
      }

      // Capture stderr
      if (this.aiServiceProcess.stderr) {
        this.aiServiceProcess.stderr.on('data', (data: Buffer) => {
          const message = data.toString().trim();
          if (message) {
            this.addLog('ai', 'stderr', message);
          }
        });
      }
    });
  }

  /**
   * Emit error event
   * @param service - Service that errored
   * @param error - Error object
   */
  private emitError(service: 'ai' | 'bridge', error: Error): void {
    this.emit('error', {
      service,
      status: ServiceStatus.ERROR,
      previousStatus: ServiceStatus.STARTING,
      timestamp: new Date(),
    });
  }

  /**
   * Stop the AI Service
   * T008.1.4: Graceful shutdown with SIGTERM, force kill with SIGKILL after timeout
   * @returns Promise that resolves when service is stopped
   */
  async stopAIService(): Promise<void> {
    if (this.aiServiceStatus === ServiceStatus.STOPPED) {
      console.log('AI Service is already stopped');
      return;
    }

    this.updateStatus('ai', ServiceStatus.STOPPING);
    console.log('Stopping AI Service...');

    // If no process exists (e.g., already crashed), just clean up
    if (!this.aiServiceProcess) {
      this.aiServiceProcess = null;
      this.updateStatus('ai', ServiceStatus.STOPPED);
      console.log('AI Service stopped (no process)');
      return;
    }

    return new Promise((resolve) => {
      const process = this.aiServiceProcess!;
      let shutdownTimeoutId: NodeJS.Timeout | null = null;
      let forceKillTimeoutId: NodeJS.Timeout | null = null;
      let isResolved = false;

      // Handler for process exit
      const onExit = () => {
        if (isResolved) return;
        isResolved = true;

        // Clear timeouts
        if (shutdownTimeoutId) {
          clearTimeout(shutdownTimeoutId);
          shutdownTimeoutId = null;
        }
        if (forceKillTimeoutId) {
          clearTimeout(forceKillTimeoutId);
          forceKillTimeoutId = null;
        }

        // Clean up
        this.aiServiceProcess = null;
        this.updateStatus('ai', ServiceStatus.STOPPED);
        console.log('AI Service stopped');
        resolve();
      };

      // Listen for exit event
      process.once('exit', onExit);

      // T008.1.4.1: Send SIGTERM for graceful shutdown
      try {
        process.kill('SIGTERM');
        console.log('Sent SIGTERM to AI Service');
      } catch (error) {
        // Process may already be dead
        console.log('Failed to send SIGTERM (process may have already exited)');
        onExit();
        return;
      }

      // T008.1.4.2: Set timeout for graceful shutdown
      shutdownTimeoutId = setTimeout(() => {
        if (isResolved) return;

        // T008.1.4.3: Force kill with SIGKILL
        console.warn('AI Service did not shut down gracefully, force killing...');

        try {
          process.kill('SIGKILL');
        } catch {
          // Process may already be dead
          console.log('Failed to send SIGKILL (process may have already exited)');
        }

        // Give SIGKILL a brief moment to take effect, then force resolve
        forceKillTimeoutId = setTimeout(() => {
          if (isResolved) return;

          // Force cleanup even if process didn't respond
          console.warn('AI Service process did not respond to SIGKILL, force cleaning up');
          process.removeListener('exit', onExit);
          onExit();
        }, 1000); // 1 second grace period for SIGKILL
      }, this.config.shutdownTimeoutMs);
    });
  }

  /**
   * Restart the AI Service
   * T008.1.5: Enhanced with restart counter and event emission
   * @returns Promise that resolves when service is restarted
   */
  async restartAIService(): Promise<void> {
    // T008.1.5: Track if this is a true restart (service was running)
    const wasRunning = this.aiServiceStatus === ServiceStatus.RUNNING ||
                       this.aiServiceStatus === ServiceStatus.STARTING;

    await this.stopAIService();

    // T008.1.5: Increment restart counter only for true restarts
    if (wasRunning) {
      this.aiRestartCount++;
    }

    // T008.1.5: Emit restart event before attempting start (for true restarts)
    if (wasRunning) {
      this.emitRestart('ai', this.aiRestartCount);
    }

    // Start the service (may throw if start fails)
    await this.startAIService();
  }

  /**
   * Start the Windows Bridge Service (.NET)
   * T008.2.1: Real process spawning implementation
   * @returns Promise that resolves when service is started
   */
  async startBridgeService(): Promise<void> {
    if (this.bridgeServiceStatus === ServiceStatus.RUNNING) {
      console.log('Bridge Service is already running');
      return;
    }

    this.updateStatus('bridge', ServiceStatus.STARTING);
    console.log('Starting Bridge Service...');

    return new Promise((resolve, reject) => {
      // T008.2.1: Real process spawning implementation
      const dotnetPath = this.getDotnetPath();
      const bridgeServicePath = this.getBridgeServicePath();
      const dllPath = path.join(bridgeServicePath, 'WindowsBridge.dll');

      const args = [
        dllPath,
        '--urls', `http://127.0.0.1:${this.config.bridgeServicePort}`,
      ];

      const spawnOptions = {
        cwd: bridgeServicePath,
        shell: false,
        stdio: ['ignore', 'pipe', 'pipe'] as const,
      };

      // Spawn the process
      this.bridgeServiceProcess = spawn(dotnetPath, args, spawnOptions);

      // Setup timeout
      const timeoutId = setTimeout(() => {
        if (this.bridgeServiceStatus === ServiceStatus.STARTING) {
          const error = new Error(`Bridge Service startup timeout after ${this.config.startupTimeoutMs}ms`);
          this.setError('bridge', error.message);
          this.updateStatus('bridge', ServiceStatus.ERROR);
          this.emitBridgeError(error);
          reject(error);
        }
      }, this.config.startupTimeoutMs);

      // Handle spawn event (process started successfully)
      this.bridgeServiceProcess.on('spawn', () => {
        clearTimeout(timeoutId);
        this.updateStatus('bridge', ServiceStatus.RUNNING);
        console.log(`Bridge Service started (PID: ${this.bridgeServiceProcess?.pid})`);
        resolve();
      });

      // Handle error event (failed to spawn)
      this.bridgeServiceProcess.on('error', (error: Error) => {
        clearTimeout(timeoutId);
        this.setError('bridge', error.message);
        this.updateStatus('bridge', ServiceStatus.ERROR);
        this.emitBridgeError(error);
        reject(error);
      });

      // Handle exit event (process terminated)
      this.bridgeServiceProcess.on('exit', (code: number | null, signal: string | null) => {
        clearTimeout(timeoutId);

        if (this.bridgeServiceStatus === ServiceStatus.STOPPING) {
          // Normal shutdown
          this.updateStatus('bridge', ServiceStatus.STOPPED);
        } else if (code !== 0) {
          // Abnormal exit
          const errorMsg = `Bridge Service exited with code ${code}${signal ? ` (signal: ${signal})` : ''}`;
          this.setError('bridge', errorMsg);
          this.updateStatus('bridge', ServiceStatus.ERROR);
        } else {
          // Clean exit while running (unexpected)
          this.updateStatus('bridge', ServiceStatus.STOPPED);
        }

        this.bridgeServiceProcess = null;
      });

      // Capture stdout
      if (this.bridgeServiceProcess.stdout) {
        this.bridgeServiceProcess.stdout.on('data', (data: Buffer) => {
          const message = data.toString().trim();
          if (message) {
            this.addBridgeLog('stdout', message);
          }
        });
      }

      // Capture stderr
      if (this.bridgeServiceProcess.stderr) {
        this.bridgeServiceProcess.stderr.on('data', (data: Buffer) => {
          const message = data.toString().trim();
          if (message) {
            this.addBridgeLog('stderr', message);
          }
        });
      }
    });
  }

  /**
   * Add a log entry for the bridge service (T008.2.1)
   * @param level - Log level (stdout or stderr)
   * @param message - Log message
   */
  private addBridgeLog(level: 'stdout' | 'stderr', message: string): void {
    const entry: ProcessLogEntry = {
      timestamp: new Date(),
      level,
      message,
    };

    this.bridgeProcessLogs.push(entry);

    // Trim logs if exceeding max
    if (this.bridgeProcessLogs.length > this.MAX_LOG_ENTRIES) {
      this.bridgeProcessLogs.shift();
    }

    // Also log to console
    if (level === 'stdout') {
      console.log(`[Bridge Service] ${message}`);
    } else {
      console.error(`[Bridge Service ERROR] ${message}`);
    }
  }

  /**
   * Emit error event for bridge service (T008.2.1)
   * @param error - Error object
   */
  private emitBridgeError(error: Error): void {
    this.emit('error', {
      service: 'bridge',
      status: ServiceStatus.ERROR,
      previousStatus: ServiceStatus.STARTING,
      timestamp: new Date(),
    });
  }

  /**
   * Stop the Windows Bridge Service
   * T008.2.2: Graceful shutdown with SIGTERM, force kill with SIGKILL after timeout
   * @returns Promise that resolves when service is stopped
   */
  async stopBridgeService(): Promise<void> {
    if (this.bridgeServiceStatus === ServiceStatus.STOPPED) {
      console.log('Bridge Service is already stopped');
      return;
    }

    this.updateStatus('bridge', ServiceStatus.STOPPING);
    console.log('Stopping Bridge Service...');

    // If no process exists (e.g., already crashed), just clean up
    if (!this.bridgeServiceProcess) {
      this.bridgeServiceProcess = null;
      this.updateStatus('bridge', ServiceStatus.STOPPED);
      console.log('Bridge Service stopped (no process)');
      return;
    }

    return new Promise((resolve) => {
      const process = this.bridgeServiceProcess!;
      let shutdownTimeoutId: NodeJS.Timeout | null = null;
      let forceKillTimeoutId: NodeJS.Timeout | null = null;
      let isResolved = false;

      // Handler for process exit
      const onExit = () => {
        if (isResolved) return;
        isResolved = true;

        // Clear timeouts
        if (shutdownTimeoutId) {
          clearTimeout(shutdownTimeoutId);
          shutdownTimeoutId = null;
        }
        if (forceKillTimeoutId) {
          clearTimeout(forceKillTimeoutId);
          forceKillTimeoutId = null;
        }

        // Clean up
        this.bridgeServiceProcess = null;
        this.updateStatus('bridge', ServiceStatus.STOPPED);
        console.log('Bridge Service stopped');
        resolve();
      };

      // Listen for exit event
      process.once('exit', onExit);

      // T008.2.2.1: Send SIGTERM for graceful shutdown
      try {
        process.kill('SIGTERM');
        console.log('Sent SIGTERM to Bridge Service');
      } catch (error) {
        // Process may already be dead
        console.log('Failed to send SIGTERM (process may have already exited)');
        onExit();
        return;
      }

      // T008.2.2.2: Set timeout for graceful shutdown
      shutdownTimeoutId = setTimeout(() => {
        if (isResolved) return;

        // T008.2.2.3: Force kill with SIGKILL
        console.warn('Bridge Service did not shut down gracefully, force killing...');

        try {
          process.kill('SIGKILL');
        } catch {
          // Process may already be dead
          console.log('Failed to send SIGKILL (process may have already exited)');
        }

        // Give SIGKILL a brief moment to take effect, then force resolve
        forceKillTimeoutId = setTimeout(() => {
          if (isResolved) return;

          // Force cleanup even if process didn't respond
          console.warn('Bridge Service process did not respond to SIGKILL, force cleaning up');
          process.removeListener('exit', onExit);
          onExit();
        }, 1000); // 1 second grace period for SIGKILL
      }, this.config.shutdownTimeoutMs);
    });
  }

  /**
   * Restart the Windows Bridge Service
   * @returns Promise that resolves when service is restarted
   */
  async restartBridgeService(): Promise<void> {
    await this.stopBridgeService();
    await this.startBridgeService();
  }

  /**
   * Start all services
   * @returns Promise that resolves when all services are started
   */
  async startAll(): Promise<void> {
    await Promise.all([
      this.startAIService(),
      this.startBridgeService(),
    ]);
    this.startHealthCheckPolling();
  }

  /**
   * Stop all services
   * @returns Promise that resolves when all services are stopped
   */
  async stopAll(): Promise<void> {
    this.stopHealthCheckPolling();
    await Promise.all([
      this.stopAIService(),
      this.stopBridgeService(),
    ]);
  }

  /**
   * Check health of AI Service
   * @returns Promise with health status
   */
  async checkHealth(service: 'ai' | 'bridge'): Promise<ServiceHealth> {
    const status = service === 'ai' ? this.aiServiceStatus : this.bridgeServiceStatus;
    const serviceProcess = service === 'ai' ? this.aiServiceProcess : this.bridgeServiceProcess;
    const startTime = service === 'ai' ? this.aiStartTime : this.bridgeStartTime;
    const lastError = service === 'ai' ? this.aiLastError : this.bridgeLastError;
    const lastHealthCheck = service === 'ai' ? this.aiLastHealthCheck : this.bridgeLastHealthCheck;
    const consecutiveFailures = service === 'ai' ? this.aiConsecutiveFailures : this.bridgeConsecutiveFailures;

    // Calculate uptime if service is running
    let uptime: number | undefined;
    if (startTime && status === ServiceStatus.RUNNING) {
      uptime = Date.now() - startTime.getTime();
    }

    return {
      status,
      pid: serviceProcess?.pid,
      uptime,
      lastError: lastError ?? undefined,
      lastHealthCheck: lastHealthCheck ?? undefined,
      consecutiveFailures,
    };
  }

  /**
   * Perform HTTP health check with retry logic (T008.1.6)
   * @param service - Service to check health of
   * @returns Promise with health check result
   */
  async performHealthCheck(service: 'ai' | 'bridge'): Promise<HealthCheckResult> {
    const status = service === 'ai' ? this.aiServiceStatus : this.bridgeServiceStatus;
    const port = service === 'ai' ? this.config.aiServicePort : this.config.bridgeServicePort;

    // Skip if service is not running
    if (status !== ServiceStatus.RUNNING) {
      return {
        healthy: false,
        status,
        skipped: true,
      };
    }

    const url = `http://127.0.0.1:${port}/health`;
    const startTime = Date.now();
    let lastError: string | undefined;

    // Retry loop
    for (let attempt = 0; attempt <= this.config.healthCheckRetries; attempt++) {
      try {
        // Create abort controller for timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.config.healthCheckTimeoutMs);

        const response = await this.fetchFn(url, {
          method: 'GET',
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        const responseTimeMs = Date.now() - startTime;

        if (response.ok) {
          // Success - reset consecutive failures
          if (service === 'ai') {
            this.aiConsecutiveFailures = 0;
            this.aiLastHealthCheck = new Date();
            this.emitHealthChangeIfNeeded(service, true);
          } else {
            this.bridgeConsecutiveFailures = 0;
            this.bridgeLastHealthCheck = new Date();
            this.emitHealthChangeIfNeeded(service, true);
          }

          return {
            healthy: true,
            status,
            responseTimeMs,
            retryCount: attempt, // Return actual attempt number as retry count
          };
        } else {
          // HTTP error response
          lastError = `HTTP ${response.status}`;
        }
      } catch (error) {
        // Network error or timeout
        if (error instanceof Error) {
          if (error.name === 'AbortError') {
            lastError = 'Health check timeout';
          } else {
            lastError = error.message;
          }
        } else {
          lastError = 'Unknown error';
        }
      }

      // If not last attempt, continue to next retry
      if (attempt < this.config.healthCheckRetries) {
        continue;
      }
    }

    // All retries exhausted - increment consecutive failures
    const responseTimeMs = Date.now() - startTime;

    if (service === 'ai') {
      this.aiConsecutiveFailures++;
      this.aiLastHealthCheck = new Date();
      this.emitHealthChangeIfNeeded(service, false);
    } else {
      this.bridgeConsecutiveFailures++;
      this.bridgeLastHealthCheck = new Date();
      this.emitHealthChangeIfNeeded(service, false);
    }

    return {
      healthy: false,
      status,
      error: lastError,
      responseTimeMs,
      retryCount: this.config.healthCheckRetries,
    };
  }

  /**
   * Emit health change event if status changed (T008.1.6)
   * @param service - Service that changed
   * @param healthy - New health status
   */
  private emitHealthChangeIfNeeded(service: 'ai' | 'bridge', healthy: boolean): void {
    const lastStatus = service === 'ai' ? this.aiLastHealthStatus : this.bridgeLastHealthStatus;
    const consecutiveFailures = service === 'ai' ? this.aiConsecutiveFailures : this.bridgeConsecutiveFailures;

    // Update last status
    if (service === 'ai') {
      this.aiLastHealthStatus = healthy;
    } else {
      this.bridgeLastHealthStatus = healthy;
    }

    // Don't emit on first check (no previous status to compare against)
    if (lastStatus === null) {
      return;
    }

    // Only emit if status changed (or on subsequent failures to update count)
    if (lastStatus !== healthy || (!healthy && consecutiveFailures > 0)) {
      this.emit('healthChange', {
        service,
        healthy,
        consecutiveFailures,
        timestamp: new Date(),
      });
    }
  }

  /**
   * Get status of AI Service
   * @returns Current service status
   */
  getAIServiceStatus(): ServiceStatus {
    return this.aiServiceStatus;
  }

  /**
   * Get status of Bridge Service
   * @returns Current service status
   */
  getBridgeServiceStatus(): ServiceStatus {
    return this.bridgeServiceStatus;
  }

  /**
   * Check if AI Service is running
   * @returns boolean indicating if service is running
   */
  isAIServiceRunning(): boolean {
    return this.aiServiceStatus === ServiceStatus.RUNNING;
  }

  /**
   * Check if Bridge Service is running
   * @returns boolean indicating if service is running
   */
  isBridgeServiceRunning(): boolean {
    return this.bridgeServiceStatus === ServiceStatus.RUNNING;
  }

  /**
   * Start health check polling (T008.1.6)
   */
  private startHealthCheckPolling(): void {
    if (this.healthCheckTimer) {
      return;
    }

    this.healthCheckTimer = setInterval(async () => {
      // T008.1.6: Perform health checks on running services
      if (this.aiServiceStatus === ServiceStatus.RUNNING) {
        await this.performHealthCheck('ai');
      }
      if (this.bridgeServiceStatus === ServiceStatus.RUNNING) {
        await this.performHealthCheck('bridge');
      }
    }, this.config.healthCheckInterval);
  }

  /**
   * Stop health check polling
   */
  private stopHealthCheckPolling(): void {
    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer);
      this.healthCheckTimer = null;
    }
  }
}

// Export singleton instance for convenience
export const processManager = new ProcessManager();

// Export default
export default ProcessManager;
