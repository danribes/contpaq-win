/**
 * useServiceStatus Hook
 *
 * Custom React hook for managing AI and Bridge service status.
 * Polls services periodically and listens for status change events.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import type { ServiceStatus } from '../types';

/**
 * Polling interval in milliseconds (5 seconds)
 */
const POLL_INTERVAL = 5000;

/**
 * Response from ai:get-status IPC call
 */
interface AIStatusResponse {
  status: ServiceStatus;
  running: boolean;
}

/**
 * Response from bridge:check-health IPC call
 */
interface BridgeHealthResponse {
  status: ServiceStatus;
  healthy: boolean;
  company?: string;
}

/**
 * Status change event data
 */
interface StatusChangeEvent {
  status: ServiceStatus;
  previousStatus?: ServiceStatus;
}

/**
 * Return type for useServiceStatus hook
 */
export interface UseServiceStatusResult {
  /** Current AI service status */
  aiStatus: ServiceStatus;
  /** Current Bridge service status */
  bridgeStatus: ServiceStatus;
  /** Connected company name (if available) */
  companyName: string | undefined;
  /** Whether initial status fetch is in progress */
  isLoading: boolean;
  /** Manually refresh status */
  refresh: () => void;
}

/**
 * Hook for managing service status with polling and event-based updates.
 *
 * @example
 * ```tsx
 * function StatusDisplay() {
 *   const { aiStatus, bridgeStatus, companyName, isLoading } = useServiceStatus();
 *
 *   if (isLoading) return <div>Loading...</div>;
 *
 *   return (
 *     <StatusBar
 *       aiStatus={aiStatus}
 *       bridgeStatus={bridgeStatus}
 *       companyName={companyName}
 *     />
 *   );
 * }
 * ```
 */
export function useServiceStatus(): UseServiceStatusResult {
  // Status state - start with 'starting' while we fetch
  const [aiStatus, setAiStatus] = useState<ServiceStatus>('starting');
  const [bridgeStatus, setBridgeStatus] = useState<ServiceStatus>('starting');
  const [companyName, setCompanyName] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  // Track if component is mounted to avoid state updates after unmount
  const isMountedRef = useRef(true);

  // Reference to polling interval
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Fetch current status from both services
   */
  const fetchStatus = useCallback(async () => {
    if (!isMountedRef.current) return;

    try {
      // Fetch AI status
      const aiResponse = await window.electronAPI.invoke('ai:get-status') as AIStatusResponse | null;
      if (isMountedRef.current && aiResponse) {
        setAiStatus(aiResponse.status);
      }
    } catch (error) {
      console.error('Failed to fetch AI status:', error);
      if (isMountedRef.current) {
        setAiStatus('error');
      }
    }

    try {
      // Fetch Bridge status
      const bridgeResponse = await window.electronAPI.invoke('bridge:check-health') as BridgeHealthResponse | null;
      if (isMountedRef.current && bridgeResponse) {
        setBridgeStatus(bridgeResponse.status);
        if (bridgeResponse.company) {
          setCompanyName(bridgeResponse.company);
        }
      }
    } catch (error) {
      console.error('Failed to fetch Bridge status:', error);
      if (isMountedRef.current) {
        setBridgeStatus('error');
      }
    }

    if (isMountedRef.current) {
      setIsLoading(false);
    }
  }, []);

  /**
   * Handle AI status change event
   */
  const handleAiStatusChange = useCallback((data: StatusChangeEvent) => {
    if (isMountedRef.current) {
      setAiStatus(data.status);
    }
  }, []);

  /**
   * Handle Bridge status change event
   */
  const handleBridgeStatusChange = useCallback((data: StatusChangeEvent) => {
    if (isMountedRef.current) {
      setBridgeStatus(data.status);
    }
  }, []);

  /**
   * Manual refresh function
   */
  const refresh = useCallback(() => {
    fetchStatus();
  }, [fetchStatus]);

  // Setup polling and event listeners on mount
  useEffect(() => {
    isMountedRef.current = true;

    // Initial fetch
    fetchStatus();

    // Setup polling
    pollIntervalRef.current = setInterval(fetchStatus, POLL_INTERVAL);

    // Subscribe to status change events
    window.electronAPI.on('ai:status-changed', handleAiStatusChange);
    window.electronAPI.on('bridge:status-changed', handleBridgeStatusChange);

    // Cleanup on unmount
    return () => {
      isMountedRef.current = false;

      // Clear polling interval
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }

      // Unsubscribe from events
      window.electronAPI.removeListener('ai:status-changed', handleAiStatusChange);
      window.electronAPI.removeListener('bridge:status-changed', handleBridgeStatusChange);
    };
  }, [fetchStatus, handleAiStatusChange, handleBridgeStatusChange]);

  return {
    aiStatus,
    bridgeStatus,
    companyName,
    isLoading,
    refresh,
  };
}

export default useServiceStatus;
