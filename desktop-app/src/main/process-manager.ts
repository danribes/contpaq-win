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
export type ProcessManagerEventType = 'statusChange' | 'error' | 'restart';

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
 * Event listener callback type
 */
export type EventListener = (event: StatusChangeEvent) => void;

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
}

/**
 * Process Manager configuration
 */
export interface ProcessManagerConfig {
  aiServicePort: number;
  bridgeServicePort: number;
  healthCheckInterval: number;
  maxRestartAttempts: number;
  restartBackoffMs: number;
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

  constructor(config: Partial<ProcessManagerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    // Initialize event listener maps
    this.eventListeners.set('statusChange', new Set());
    this.eventListeners.set('error', new Set());
    this.eventListeners.set('restart', new Set());
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
  private emit(event: ProcessManagerEventType, payload: StatusChangeEvent): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(listener => listener(payload));
    }
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

    // TODO: Implement actual process spawning in T008.1.3
    // This is a stub that simulates successful start
    return new Promise((resolve) => {
      setTimeout(() => {
        this.updateStatus('ai', ServiceStatus.RUNNING);
        console.log('AI Service started (stub)');
        resolve();
      }, 100);
    });
  }

  /**
   * Stop the AI Service
   * @returns Promise that resolves when service is stopped
   */
  async stopAIService(): Promise<void> {
    if (this.aiServiceStatus === ServiceStatus.STOPPED) {
      console.log('AI Service is already stopped');
      return;
    }

    this.updateStatus('ai', ServiceStatus.STOPPING);
    console.log('Stopping AI Service...');

    // TODO: Implement actual process termination in T008.1.4
    // This is a stub that simulates successful stop
    return new Promise((resolve) => {
      setTimeout(() => {
        if (this.aiServiceProcess) {
          this.aiServiceProcess.kill();
          this.aiServiceProcess = null;
        }
        this.updateStatus('ai', ServiceStatus.STOPPED);
        console.log('AI Service stopped (stub)');
        resolve();
      }, 100);
    });
  }

  /**
   * Restart the AI Service
   * @returns Promise that resolves when service is restarted
   */
  async restartAIService(): Promise<void> {
    await this.stopAIService();
    await this.startAIService();
  }

  /**
   * Start the Windows Bridge Service (.NET)
   * @returns Promise that resolves when service is started
   */
  async startBridgeService(): Promise<void> {
    if (this.bridgeServiceStatus === ServiceStatus.RUNNING) {
      console.log('Bridge Service is already running');
      return;
    }

    this.updateStatus('bridge', ServiceStatus.STARTING);
    console.log('Starting Bridge Service...');

    // TODO: Implement actual process spawning in T008.2.1
    // This is a stub that simulates successful start
    return new Promise((resolve) => {
      setTimeout(() => {
        this.updateStatus('bridge', ServiceStatus.RUNNING);
        console.log('Bridge Service started (stub)');
        resolve();
      }, 100);
    });
  }

  /**
   * Stop the Windows Bridge Service
   * @returns Promise that resolves when service is stopped
   */
  async stopBridgeService(): Promise<void> {
    if (this.bridgeServiceStatus === ServiceStatus.STOPPED) {
      console.log('Bridge Service is already stopped');
      return;
    }

    this.updateStatus('bridge', ServiceStatus.STOPPING);
    console.log('Stopping Bridge Service...');

    // TODO: Implement actual process termination in T008.2.2
    // This is a stub that simulates successful stop
    return new Promise((resolve) => {
      setTimeout(() => {
        if (this.bridgeServiceProcess) {
          this.bridgeServiceProcess.kill();
          this.bridgeServiceProcess = null;
        }
        this.updateStatus('bridge', ServiceStatus.STOPPED);
        console.log('Bridge Service stopped (stub)');
        resolve();
      }, 100);
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

    // Calculate uptime if service is running
    let uptime: number | undefined;
    if (startTime && status === ServiceStatus.RUNNING) {
      uptime = Date.now() - startTime.getTime();
    }

    // TODO: Implement actual HTTP health check in T008.1.6
    return {
      status,
      pid: serviceProcess?.pid,
      uptime,
      lastError: lastError ?? undefined,
      lastHealthCheck: new Date(),
    };
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
   * Start health check polling
   */
  private startHealthCheckPolling(): void {
    if (this.healthCheckTimer) {
      return;
    }

    this.healthCheckTimer = setInterval(async () => {
      // TODO: Implement actual health checks in T008
      console.log('Health check polling (stub)');
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
