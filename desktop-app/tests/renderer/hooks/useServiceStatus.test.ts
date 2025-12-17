/**
 * T010.2.1 useServiceStatus Hook Tests
 *
 * Tests for the status polling hook that manages AI and Bridge service status.
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock the electronAPI before importing the hook
const mockInvoke = jest.fn();
const mockOn = jest.fn();
const mockRemoveListener = jest.fn();

const mockElectronAPI = {
  invoke: mockInvoke,
  on: mockOn,
  removeListener: mockRemoveListener,
  send: jest.fn(),
  removeAllListeners: jest.fn(),
};

// Setup window.electronAPI mock
beforeAll(() => {
  Object.defineProperty(window, 'electronAPI', {
    value: mockElectronAPI,
    writable: true,
    configurable: true,
  });
});

// Import hook after setting up mock
import { useServiceStatus } from '../../../src/renderer/hooks/useServiceStatus';

describe('T010.2 - useServiceStatus Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();

    // Default mock responses
    mockInvoke.mockImplementation((channel: string) => {
      if (channel === 'ai:get-status') {
        return Promise.resolve({ status: 'stopped', running: false });
      }
      if (channel === 'bridge:check-health') {
        return Promise.resolve({ status: 'stopped', healthy: false });
      }
      return Promise.resolve(null);
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  // ==========================================================================
  // T010.2.1 - Hook Structure Tests
  // ==========================================================================

  describe('T010.2.1 - Hook Structure', () => {
    it('should export useServiceStatus hook', () => {
      expect(useServiceStatus).toBeDefined();
      expect(typeof useServiceStatus).toBe('function');
    });

    it('should return aiStatus', async () => {
      const { result } = renderHook(() => useServiceStatus());

      await waitFor(() => {
        expect(result.current.aiStatus).toBeDefined();
      });
    });

    it('should return bridgeStatus', async () => {
      const { result } = renderHook(() => useServiceStatus());

      await waitFor(() => {
        expect(result.current.bridgeStatus).toBeDefined();
      });
    });

    it('should return companyName', async () => {
      const { result } = renderHook(() => useServiceStatus());

      await waitFor(() => {
        expect(result.current).toHaveProperty('companyName');
      });
    });

    it('should return isLoading flag', async () => {
      const { result } = renderHook(() => useServiceStatus());

      expect(typeof result.current.isLoading).toBe('boolean');
    });

    it('should return refresh function', async () => {
      const { result } = renderHook(() => useServiceStatus());

      expect(typeof result.current.refresh).toBe('function');
    });
  });

  // ==========================================================================
  // T010.2.2 - Polling Tests
  // ==========================================================================

  describe('T010.2.2 - Status Polling', () => {
    it('should fetch status on mount', async () => {
      renderHook(() => useServiceStatus());

      await waitFor(() => {
        expect(mockInvoke).toHaveBeenCalledWith('ai:get-status');
        expect(mockInvoke).toHaveBeenCalledWith('bridge:check-health');
      });
    });

    it('should poll every 5 seconds', async () => {
      jest.useFakeTimers();

      renderHook(() => useServiceStatus());

      // Initial fetch
      await act(async () => {
        await Promise.resolve();
      });

      expect(mockInvoke).toHaveBeenCalledTimes(2); // ai + bridge

      // Fast forward 5 seconds
      await act(async () => {
        jest.advanceTimersByTime(5000);
        await Promise.resolve();
      });

      expect(mockInvoke).toHaveBeenCalledTimes(4); // 2 more calls
    });

    it('should stop polling on unmount', async () => {
      jest.useFakeTimers();

      const { unmount } = renderHook(() => useServiceStatus());

      await act(async () => {
        await Promise.resolve();
      });

      expect(mockInvoke).toHaveBeenCalled();

      const callCountBeforeUnmount = mockInvoke.mock.calls.length;
      unmount();

      await act(async () => {
        jest.advanceTimersByTime(10000);
        await Promise.resolve();
      });

      // Should not have made any more calls after unmount
      expect(mockInvoke).toHaveBeenCalledTimes(callCountBeforeUnmount);
    });

    it('should update aiStatus from poll response', async () => {
      mockInvoke.mockImplementation((channel: string) => {
        if (channel === 'ai:get-status') {
          return Promise.resolve({ status: 'running', running: true });
        }
        if (channel === 'bridge:check-health') {
          return Promise.resolve({ status: 'stopped', healthy: false });
        }
        return Promise.resolve(null);
      });

      const { result } = renderHook(() => useServiceStatus());

      await waitFor(() => {
        expect(result.current.aiStatus).toBe('running');
      });
    });

    it('should update bridgeStatus from poll response', async () => {
      mockInvoke.mockImplementation((channel: string) => {
        if (channel === 'ai:get-status') {
          return Promise.resolve({ status: 'stopped', running: false });
        }
        if (channel === 'bridge:check-health') {
          return Promise.resolve({ status: 'running', healthy: true });
        }
        return Promise.resolve(null);
      });

      const { result } = renderHook(() => useServiceStatus());

      await waitFor(() => {
        expect(result.current.bridgeStatus).toBe('running');
      });
    });

    it('should handle poll errors gracefully', async () => {
      mockInvoke.mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useServiceStatus());

      // Should set error status
      await waitFor(() => {
        expect(result.current.aiStatus).toBe('error');
      });
    });
  });

  // ==========================================================================
  // T010.2.3 - Event-based Updates
  // ==========================================================================

  describe('T010.2.3 - Event Updates', () => {
    it('should subscribe to ai:status-changed on mount', async () => {
      renderHook(() => useServiceStatus());

      await waitFor(() => {
        expect(mockOn).toHaveBeenCalledWith('ai:status-changed', expect.any(Function));
      });
    });

    it('should subscribe to bridge:status-changed on mount', async () => {
      renderHook(() => useServiceStatus());

      await waitFor(() => {
        expect(mockOn).toHaveBeenCalledWith('bridge:status-changed', expect.any(Function));
      });
    });

    it('should unsubscribe from events on unmount', async () => {
      const { unmount } = renderHook(() => useServiceStatus());

      await waitFor(() => {
        expect(mockOn).toHaveBeenCalled();
      });

      unmount();

      expect(mockRemoveListener).toHaveBeenCalledWith('ai:status-changed', expect.any(Function));
      expect(mockRemoveListener).toHaveBeenCalledWith('bridge:status-changed', expect.any(Function));
    });

    it('should update aiStatus when ai:status-changed event fires', async () => {
      let aiStatusCallback: ((data: any) => void) | null = null;

      mockOn.mockImplementation((channel: string, callback: (data: any) => void) => {
        if (channel === 'ai:status-changed') {
          aiStatusCallback = callback;
        }
      });

      const { result } = renderHook(() => useServiceStatus());

      // Wait for initial state
      await waitFor(() => {
        expect(result.current.aiStatus).toBeDefined();
      });

      // Simulate status change event
      await act(async () => {
        if (aiStatusCallback) {
          aiStatusCallback({ status: 'running' });
        }
      });

      expect(result.current.aiStatus).toBe('running');
    });

    it('should update bridgeStatus when bridge:status-changed event fires', async () => {
      let bridgeStatusCallback: ((data: any) => void) | null = null;

      mockOn.mockImplementation((channel: string, callback: (data: any) => void) => {
        if (channel === 'bridge:status-changed') {
          bridgeStatusCallback = callback;
        }
      });

      const { result } = renderHook(() => useServiceStatus());

      await waitFor(() => {
        expect(result.current.bridgeStatus).toBeDefined();
      });

      await act(async () => {
        if (bridgeStatusCallback) {
          bridgeStatusCallback({ status: 'error' });
        }
      });

      expect(result.current.bridgeStatus).toBe('error');
    });
  });

  // ==========================================================================
  // T010.2.4 - Startup State
  // ==========================================================================

  describe('T010.2.4 - Startup State', () => {
    it('should show "starting" as initial state', () => {
      // Make the first poll slow
      mockInvoke.mockImplementation(() => new Promise(() => {})); // Never resolves

      const { result } = renderHook(() => useServiceStatus());

      // Initial state should be starting
      expect(result.current.aiStatus).toBe('starting');
      expect(result.current.bridgeStatus).toBe('starting');
    });

    it('should show isLoading true during initial fetch', () => {
      mockInvoke.mockImplementation(() => new Promise(() => {}));

      const { result } = renderHook(() => useServiceStatus());

      expect(result.current.isLoading).toBe(true);
    });

    it('should show isLoading false after fetch completes', async () => {
      const { result } = renderHook(() => useServiceStatus());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });

    it('should transition from starting to actual status', async () => {
      let resolveAi: (value: any) => void;
      const aiPromise = new Promise((resolve) => {
        resolveAi = resolve;
      });

      mockInvoke.mockImplementation((channel: string) => {
        if (channel === 'ai:get-status') {
          return aiPromise;
        }
        return Promise.resolve({ status: 'stopped' });
      });

      const { result } = renderHook(() => useServiceStatus());

      // Initially starting
      expect(result.current.aiStatus).toBe('starting');

      // Resolve the promise
      await act(async () => {
        resolveAi!({ status: 'running', running: true });
        await Promise.resolve();
      });

      await waitFor(() => {
        expect(result.current.aiStatus).toBe('running');
      });
    });
  });

  // ==========================================================================
  // Refresh Function Tests
  // ==========================================================================

  describe('Refresh Function', () => {
    it('should allow manual refresh', async () => {
      const { result } = renderHook(() => useServiceStatus());

      await waitFor(() => {
        expect(mockInvoke).toHaveBeenCalled();
      });

      const callCountBefore = mockInvoke.mock.calls.length;

      await act(async () => {
        result.current.refresh();
        await Promise.resolve();
      });

      await waitFor(() => {
        expect(mockInvoke.mock.calls.length).toBeGreaterThan(callCountBefore);
      });
    });
  });
});
