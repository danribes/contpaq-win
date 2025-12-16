/**
 * ContPAQ Win - Process Manager
 *
 * Manages the lifecycle of external service processes:
 * - AI Service (Python/FastAPI)
 * - Windows Bridge (.NET/ASP.NET Core)
 *
 * This is a stub implementation that will be completed in T008.
 */

import { ChildProcess, spawn } from 'child_process';
import * as path from 'path';
import { app } from 'electron';

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

  constructor(config: Partial<ProcessManagerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
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

    this.aiServiceStatus = ServiceStatus.STARTING;
    console.log('Starting AI Service...');

    // TODO: Implement actual process spawning in T008
    // This is a stub that simulates successful start
    return new Promise((resolve) => {
      setTimeout(() => {
        this.aiServiceStatus = ServiceStatus.RUNNING;
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

    this.aiServiceStatus = ServiceStatus.STOPPING;
    console.log('Stopping AI Service...');

    // TODO: Implement actual process termination in T008
    // This is a stub that simulates successful stop
    return new Promise((resolve) => {
      setTimeout(() => {
        if (this.aiServiceProcess) {
          this.aiServiceProcess.kill();
          this.aiServiceProcess = null;
        }
        this.aiServiceStatus = ServiceStatus.STOPPED;
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

    this.bridgeServiceStatus = ServiceStatus.STARTING;
    console.log('Starting Bridge Service...');

    // TODO: Implement actual process spawning in T008
    // This is a stub that simulates successful start
    return new Promise((resolve) => {
      setTimeout(() => {
        this.bridgeServiceStatus = ServiceStatus.RUNNING;
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

    this.bridgeServiceStatus = ServiceStatus.STOPPING;
    console.log('Stopping Bridge Service...');

    // TODO: Implement actual process termination in T008
    // This is a stub that simulates successful stop
    return new Promise((resolve) => {
      setTimeout(() => {
        if (this.bridgeServiceProcess) {
          this.bridgeServiceProcess.kill();
          this.bridgeServiceProcess = null;
        }
        this.bridgeServiceStatus = ServiceStatus.STOPPED;
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
    const process = service === 'ai' ? this.aiServiceProcess : this.bridgeServiceProcess;

    // TODO: Implement actual HTTP health check in T008
    return {
      status,
      pid: process?.pid,
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
