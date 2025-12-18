/**
 * T025.3 - usePostToContPAQi Hook Tests
 *
 * Tests for the hook that orchestrates posting invoices to ContPAQi.
 * Handles duplicate check, vendor resolution, entry creation, and state updates.
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { usePostToContPAQi, type PostToContPAQiInput, type PostToContPAQiState } from './usePostToContPAQi';
import { BridgeServiceClient, BridgeServiceError } from '../services/bridge-service';

// Mock only the BridgeServiceClient class, not the entire module
// This preserves the BridgeServiceError class for instanceof checks
jest.mock('../services/bridge-service', () => {
  const originalModule = jest.requireActual('../services/bridge-service');
  return {
    ...originalModule,
    BridgeServiceClient: jest.fn(),
  };
});

const MockedBridgeServiceClient = BridgeServiceClient as jest.MockedClass<typeof BridgeServiceClient>;

describe('usePostToContPAQi', () => {
  let mockClient: jest.Mocked<BridgeServiceClient>;

  const defaultInput: PostToContPAQiInput = {
    vendorRfc: 'XAXX010101000',
    vendorName: 'Test Vendor SA de CV',
    invoiceNumber: 'FAC-001',
    invoiceDate: new Date('2024-12-08'),
    subtotal: 1000,
    ivaAmount: 160,
    total: 1160,
    lineItems: [
      { description: 'Item 1', quantity: 1, unitPrice: 1000, amount: 1000 },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockClient = {
      checkDuplicate: jest.fn(),
      createEntry: jest.fn(),
      getVendorByRfc: jest.fn(),
      createVendor: jest.fn(),
      checkHealth: jest.fn(),
    } as unknown as jest.Mocked<BridgeServiceClient>;

    MockedBridgeServiceClient.mockImplementation(() => mockClient);
  });

  // ===========================================================================
  // T025.3.1 - Initial State
  // ===========================================================================

  describe('Initial State', () => {
    it('should initialize with idle status', () => {
      const { result } = renderHook(() => usePostToContPAQi());

      expect(result.current.state.status).toBe('idle');
      expect(result.current.state.error).toBeNull();
      expect(result.current.state.folio).toBeNull();
    });

    it('should provide startPost function', () => {
      const { result } = renderHook(() => usePostToContPAQi());

      expect(typeof result.current.startPost).toBe('function');
    });

    it('should provide reset function', () => {
      const { result } = renderHook(() => usePostToContPAQi());

      expect(typeof result.current.reset).toBe('function');
    });
  });

  // ===========================================================================
  // T025.3.3 - Duplicate Check
  // ===========================================================================

  describe('Duplicate Check', () => {
    it('should check for duplicates before posting', async () => {
      mockClient.checkDuplicate.mockResolvedValue({
        isDuplicate: false,
        existingFolio: null,
        existingDate: null,
        message: null,
      });
      mockClient.getVendorByRfc.mockResolvedValue({
        code: 'P001',
        rfc: 'XAXX010101000',
        name: 'Test Vendor',
      });
      mockClient.createEntry.mockResolvedValue({
        success: true,
        folio: 'POL-2024-0001',
      });

      const { result } = renderHook(() => usePostToContPAQi());

      await act(async () => {
        await result.current.startPost(defaultInput);
      });

      expect(mockClient.checkDuplicate).toHaveBeenCalledWith({
        vendorRfc: 'XAXX010101000',
        invoiceNumber: 'FAC-001',
        invoiceDate: expect.any(Date),
      });
    });

    it('should enter duplicate_warning status when duplicate found', async () => {
      mockClient.checkDuplicate.mockResolvedValue({
        isDuplicate: true,
        existingFolio: 'POL-2024-0001',
        existingDate: '2024-12-08',
        message: 'Duplicate entry found',
      });

      const { result } = renderHook(() => usePostToContPAQi());

      await act(async () => {
        await result.current.startPost(defaultInput);
      });

      expect(result.current.state.status).toBe('duplicate_warning');
      expect(result.current.state.duplicateInfo).toEqual({
        existingFolio: 'POL-2024-0001',
        existingDate: '2024-12-08',
      });
    });

    it('should provide continueDespiteDuplicate function when duplicate found', async () => {
      mockClient.checkDuplicate.mockResolvedValue({
        isDuplicate: true,
        existingFolio: 'POL-2024-0001',
        existingDate: '2024-12-08',
        message: null,
      });

      const { result } = renderHook(() => usePostToContPAQi());

      await act(async () => {
        await result.current.startPost(defaultInput);
      });

      expect(typeof result.current.continueDespiteDuplicate).toBe('function');
    });

    it('should continue with forceDuplicate when user confirms', async () => {
      mockClient.checkDuplicate.mockResolvedValue({
        isDuplicate: true,
        existingFolio: 'POL-2024-0001',
        existingDate: '2024-12-08',
        message: null,
      });
      mockClient.getVendorByRfc.mockResolvedValue({
        code: 'P001',
        rfc: 'XAXX010101000',
        name: 'Test Vendor',
      });
      mockClient.createEntry.mockResolvedValue({
        success: true,
        folio: 'POL-2024-0002',
      });

      const { result } = renderHook(() => usePostToContPAQi());

      await act(async () => {
        await result.current.startPost(defaultInput);
      });

      await act(async () => {
        await result.current.continueDespiteDuplicate();
      });

      expect(mockClient.createEntry).toHaveBeenCalledWith(
        expect.objectContaining({
          forceDuplicate: true,
        })
      );
    });
  });

  // ===========================================================================
  // T025.3.4 - Vendor Resolution
  // ===========================================================================

  describe('Vendor Resolution', () => {
    it('should check if vendor exists after duplicate check passes', async () => {
      mockClient.checkDuplicate.mockResolvedValue({
        isDuplicate: false,
        existingFolio: null,
        existingDate: null,
        message: null,
      });
      mockClient.getVendorByRfc.mockResolvedValue({
        code: 'P001',
        rfc: 'XAXX010101000',
        name: 'Test Vendor',
      });
      mockClient.createEntry.mockResolvedValue({
        success: true,
        folio: 'POL-2024-0001',
      });

      const { result } = renderHook(() => usePostToContPAQi());

      await act(async () => {
        await result.current.startPost(defaultInput);
      });

      expect(mockClient.getVendorByRfc).toHaveBeenCalledWith('XAXX010101000');
    });

    it('should enter vendor_required status when vendor not found', async () => {
      mockClient.checkDuplicate.mockResolvedValue({
        isDuplicate: false,
        existingFolio: null,
        existingDate: null,
        message: null,
      });
      mockClient.getVendorByRfc.mockResolvedValue(null);

      const { result } = renderHook(() => usePostToContPAQi());

      await act(async () => {
        await result.current.startPost(defaultInput);
      });

      expect(result.current.state.status).toBe('vendor_required');
      expect(result.current.state.vendorInfo).toEqual({
        rfc: 'XAXX010101000',
        suggestedName: 'Test Vendor SA de CV',
      });
    });

    it('should provide createVendorAndContinue function when vendor not found', async () => {
      mockClient.checkDuplicate.mockResolvedValue({
        isDuplicate: false,
        existingFolio: null,
        existingDate: null,
        message: null,
      });
      mockClient.getVendorByRfc.mockResolvedValue(null);

      const { result } = renderHook(() => usePostToContPAQi());

      await act(async () => {
        await result.current.startPost(defaultInput);
      });

      expect(typeof result.current.createVendorAndContinue).toBe('function');
    });

    it('should create vendor and continue when user provides data', async () => {
      mockClient.checkDuplicate.mockResolvedValue({
        isDuplicate: false,
        existingFolio: null,
        existingDate: null,
        message: null,
      });
      mockClient.getVendorByRfc.mockResolvedValue(null);
      mockClient.createVendor.mockResolvedValue({
        code: 'P001',
        rfc: 'XAXX010101000',
        name: 'New Vendor Name',
      });
      mockClient.createEntry.mockResolvedValue({
        success: true,
        folio: 'POL-2024-0001',
      });

      const { result } = renderHook(() => usePostToContPAQi());

      await act(async () => {
        await result.current.startPost(defaultInput);
      });

      await act(async () => {
        await result.current.createVendorAndContinue({
          rfc: 'XAXX010101000',
          name: 'New Vendor Name',
        });
      });

      expect(mockClient.createVendor).toHaveBeenCalledWith({
        rfc: 'XAXX010101000',
        name: 'New Vendor Name',
      });
      expect(result.current.state.status).toBe('success');
    });
  });

  // ===========================================================================
  // T025.3.5 - Entry Creation
  // ===========================================================================

  describe('Entry Creation', () => {
    it('should call createEntry with correct data', async () => {
      mockClient.checkDuplicate.mockResolvedValue({
        isDuplicate: false,
        existingFolio: null,
        existingDate: null,
        message: null,
      });
      mockClient.getVendorByRfc.mockResolvedValue({
        code: 'P001',
        rfc: 'XAXX010101000',
        name: 'Test Vendor',
      });
      mockClient.createEntry.mockResolvedValue({
        success: true,
        folio: 'POL-2024-0001',
      });

      const { result } = renderHook(() => usePostToContPAQi());

      await act(async () => {
        await result.current.startPost(defaultInput);
      });

      expect(mockClient.createEntry).toHaveBeenCalledWith({
        vendorRfc: 'XAXX010101000',
        invoiceNumber: 'FAC-001',
        invoiceDate: expect.any(Date),
        subtotal: 1000,
        ivaAmount: 160,
        total: 1160,
        lineItems: [
          { description: 'Item 1', quantity: 1, unitPrice: 1000, amount: 1000 },
        ],
        forceDuplicate: false,
      });
    });

    it('should include concept if provided', async () => {
      mockClient.checkDuplicate.mockResolvedValue({
        isDuplicate: false,
        existingFolio: null,
        existingDate: null,
        message: null,
      });
      mockClient.getVendorByRfc.mockResolvedValue({
        code: 'P001',
        rfc: 'XAXX010101000',
        name: 'Test Vendor',
      });
      mockClient.createEntry.mockResolvedValue({
        success: true,
        folio: 'POL-2024-0001',
      });

      const { result } = renderHook(() => usePostToContPAQi());

      await act(async () => {
        await result.current.startPost({
          ...defaultInput,
          concept: 'Compra de materiales',
        });
      });

      expect(mockClient.createEntry).toHaveBeenCalledWith(
        expect.objectContaining({
          concept: 'Compra de materiales',
        })
      );
    });
  });

  // ===========================================================================
  // T025.3.8 - Success State
  // ===========================================================================

  describe('Success State', () => {
    it('should enter success status after entry creation', async () => {
      mockClient.checkDuplicate.mockResolvedValue({
        isDuplicate: false,
        existingFolio: null,
        existingDate: null,
        message: null,
      });
      mockClient.getVendorByRfc.mockResolvedValue({
        code: 'P001',
        rfc: 'XAXX010101000',
        name: 'Test Vendor',
      });
      mockClient.createEntry.mockResolvedValue({
        success: true,
        folio: 'POL-2024-0001',
        timestamp: '2024-12-08T10:00:00Z',
      });

      const { result } = renderHook(() => usePostToContPAQi());

      await act(async () => {
        await result.current.startPost(defaultInput);
      });

      expect(result.current.state.status).toBe('success');
      expect(result.current.state.folio).toBe('POL-2024-0001');
    });

    it('should reset state when reset is called', async () => {
      mockClient.checkDuplicate.mockResolvedValue({
        isDuplicate: false,
        existingFolio: null,
        existingDate: null,
        message: null,
      });
      mockClient.getVendorByRfc.mockResolvedValue({
        code: 'P001',
        rfc: 'XAXX010101000',
        name: 'Test Vendor',
      });
      mockClient.createEntry.mockResolvedValue({
        success: true,
        folio: 'POL-2024-0001',
      });

      const { result } = renderHook(() => usePostToContPAQi());

      await act(async () => {
        await result.current.startPost(defaultInput);
      });

      act(() => {
        result.current.reset();
      });

      expect(result.current.state.status).toBe('idle');
      expect(result.current.state.folio).toBeNull();
    });
  });

  // ===========================================================================
  // T025.3.9 - Error Handling
  // ===========================================================================

  describe('Error Handling', () => {
    it('should enter error status on duplicate check failure', async () => {
      mockClient.checkDuplicate.mockRejectedValue(
        new BridgeServiceError('Connection failed', undefined, 'Network error')
      );

      const { result } = renderHook(() => usePostToContPAQi());

      await act(async () => {
        await result.current.startPost(defaultInput);
      });

      expect(result.current.state.status).toBe('error');
      expect(result.current.state.error).toBe('Connection failed');
    });

    it('should enter error status on entry creation failure', async () => {
      mockClient.checkDuplicate.mockResolvedValue({
        isDuplicate: false,
        existingFolio: null,
        existingDate: null,
        message: null,
      });
      mockClient.getVendorByRfc.mockResolvedValue({
        code: 'P001',
        rfc: 'XAXX010101000',
        name: 'Test Vendor',
      });
      mockClient.createEntry.mockResolvedValue({
        success: false,
        errorMessage: 'Invalid entry data',
      });

      const { result } = renderHook(() => usePostToContPAQi());

      await act(async () => {
        await result.current.startPost(defaultInput);
      });

      expect(result.current.state.status).toBe('error');
      expect(result.current.state.error).toBe('Invalid entry data');
    });

    it('should enter error status on vendor creation failure', async () => {
      mockClient.checkDuplicate.mockResolvedValue({
        isDuplicate: false,
        existingFolio: null,
        existingDate: null,
        message: null,
      });
      mockClient.getVendorByRfc.mockResolvedValue(null);
      mockClient.createVendor.mockRejectedValue(
        new BridgeServiceError('Vendor creation failed', 400, 'Invalid RFC')
      );

      const { result } = renderHook(() => usePostToContPAQi());

      await act(async () => {
        await result.current.startPost(defaultInput);
      });

      await act(async () => {
        await result.current.createVendorAndContinue({
          rfc: 'XAXX010101000',
          name: 'Test Vendor',
        });
      });

      expect(result.current.state.status).toBe('error');
      expect(result.current.state.error).toBe('Vendor creation failed');
    });

    it('should handle network timeout errors', async () => {
      mockClient.checkDuplicate.mockRejectedValue(
        new BridgeServiceError('La solicitud excedió el tiempo de espera', undefined, 'Timeout')
      );

      const { result } = renderHook(() => usePostToContPAQi());

      await act(async () => {
        await result.current.startPost(defaultInput);
      });

      expect(result.current.state.status).toBe('error');
      expect(result.current.state.error).toContain('tiempo de espera');
    });
  });

  // ===========================================================================
  // Loading States
  // ===========================================================================

  describe('Loading States', () => {
    it('should show checking_duplicate status during duplicate check', async () => {
      let resolveCheck: (value: any) => void;
      mockClient.checkDuplicate.mockImplementation(() =>
        new Promise((resolve) => {
          resolveCheck = resolve;
        })
      );

      const { result } = renderHook(() => usePostToContPAQi());

      act(() => {
        result.current.startPost(defaultInput);
      });

      // Should be in checking state
      expect(result.current.state.status).toBe('checking_duplicate');

      // Resolve the check
      await act(async () => {
        resolveCheck!({
          isDuplicate: false,
          existingFolio: null,
          existingDate: null,
          message: null,
        });
      });
    });

    it('should show creating_entry status during entry creation', async () => {
      mockClient.checkDuplicate.mockResolvedValue({
        isDuplicate: false,
        existingFolio: null,
        existingDate: null,
        message: null,
      });
      mockClient.getVendorByRfc.mockResolvedValue({
        code: 'P001',
        rfc: 'XAXX010101000',
        name: 'Test Vendor',
      });

      let resolveEntry: (value: any) => void;
      mockClient.createEntry.mockImplementation(() =>
        new Promise((resolve) => {
          resolveEntry = resolve;
        })
      );

      const { result } = renderHook(() => usePostToContPAQi());

      await act(async () => {
        result.current.startPost(defaultInput);
        // Wait for duplicate check and vendor check
        await new Promise((r) => setTimeout(r, 10));
      });

      // Should be in creating state
      expect(result.current.state.status).toBe('creating_entry');

      // Resolve the creation
      await act(async () => {
        resolveEntry!({
          success: true,
          folio: 'POL-2024-0001',
        });
      });
    });
  });

  // ===========================================================================
  // Cancel Flow
  // ===========================================================================

  describe('Cancel Flow', () => {
    it('should return to idle when cancel is called during duplicate warning', async () => {
      mockClient.checkDuplicate.mockResolvedValue({
        isDuplicate: true,
        existingFolio: 'POL-2024-0001',
        existingDate: '2024-12-08',
        message: null,
      });

      const { result } = renderHook(() => usePostToContPAQi());

      await act(async () => {
        await result.current.startPost(defaultInput);
      });

      act(() => {
        result.current.cancel();
      });

      expect(result.current.state.status).toBe('idle');
    });

    it('should return to idle when cancel is called during vendor_required', async () => {
      mockClient.checkDuplicate.mockResolvedValue({
        isDuplicate: false,
        existingFolio: null,
        existingDate: null,
        message: null,
      });
      mockClient.getVendorByRfc.mockResolvedValue(null);

      const { result } = renderHook(() => usePostToContPAQi());

      await act(async () => {
        await result.current.startPost(defaultInput);
      });

      act(() => {
        result.current.cancel();
      });

      expect(result.current.state.status).toBe('idle');
    });
  });
});
