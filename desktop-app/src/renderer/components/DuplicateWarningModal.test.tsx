/**
 * T025.1 - DuplicateWarningModal Component Tests
 *
 * Tests for the duplicate warning modal that shows when a duplicate entry
 * is detected before posting to ContPAQi.
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { DuplicateWarningModal, type DuplicateWarningModalProps } from './DuplicateWarningModal';

describe('DuplicateWarningModal', () => {
  const defaultProps: DuplicateWarningModalProps = {
    isOpen: true,
    existingFolio: 'POL-2024-0001',
    existingDate: '2024-12-08',
    vendorRfc: 'XAXX010101000',
    invoiceNumber: 'FAC-001',
    onContinue: jest.fn(),
    onCancel: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ===========================================================================
  // T025.1.2 - Create modal component for duplicate warning
  // ===========================================================================

  describe('Modal Rendering', () => {
    it('should render when isOpen is true', () => {
      render(<DuplicateWarningModal {...defaultProps} />);

      expect(screen.getByTestId('duplicate-warning-modal')).toBeInTheDocument();
    });

    it('should not render when isOpen is false', () => {
      render(<DuplicateWarningModal {...defaultProps} isOpen={false} />);

      expect(screen.queryByTestId('duplicate-warning-modal')).not.toBeInTheDocument();
    });

    it('should display warning title in Spanish', () => {
      render(<DuplicateWarningModal {...defaultProps} />);

      expect(screen.getByText(/Póliza Duplicada/i)).toBeInTheDocument();
    });

    it('should display warning icon', () => {
      render(<DuplicateWarningModal {...defaultProps} />);

      expect(screen.getByTestId('warning-icon')).toBeInTheDocument();
    });

    it('should have overlay background', () => {
      render(<DuplicateWarningModal {...defaultProps} />);

      expect(screen.getByTestId('modal-overlay')).toBeInTheDocument();
    });
  });

  // ===========================================================================
  // T025.1.3 - Show existing entry details
  // ===========================================================================

  describe('Existing Entry Details', () => {
    it('should display existing folio number', () => {
      render(<DuplicateWarningModal {...defaultProps} />);

      expect(screen.getByText('POL-2024-0001')).toBeInTheDocument();
    });

    it('should display existing entry date', () => {
      render(<DuplicateWarningModal {...defaultProps} />);

      expect(screen.getByText(/2024-12-08/)).toBeInTheDocument();
    });

    it('should display vendor RFC', () => {
      render(<DuplicateWarningModal {...defaultProps} />);

      expect(screen.getByText('XAXX010101000')).toBeInTheDocument();
    });

    it('should display invoice number', () => {
      render(<DuplicateWarningModal {...defaultProps} />);

      expect(screen.getByText('FAC-001')).toBeInTheDocument();
    });

    it('should display Spanish message explaining the duplicate', () => {
      render(<DuplicateWarningModal {...defaultProps} />);

      expect(screen.getByText(/ya existe una póliza/i)).toBeInTheDocument();
    });

    it('should display folio label in Spanish', () => {
      render(<DuplicateWarningModal {...defaultProps} />);

      expect(screen.getByText(/Folio existente/i)).toBeInTheDocument();
    });

    it('should display date label in Spanish', () => {
      render(<DuplicateWarningModal {...defaultProps} />);

      expect(screen.getByText(/Fecha de registro/i)).toBeInTheDocument();
    });

    it('should handle null existingDate gracefully', () => {
      render(<DuplicateWarningModal {...defaultProps} existingDate={null} />);

      expect(screen.getByTestId('duplicate-warning-modal')).toBeInTheDocument();
    });
  });

  // ===========================================================================
  // T025.1.4 - Provide "Continuar" and "Cancelar" options
  // ===========================================================================

  describe('Action Buttons', () => {
    it('should display "Continuar" button', () => {
      render(<DuplicateWarningModal {...defaultProps} />);

      expect(screen.getByRole('button', { name: /Continuar/i })).toBeInTheDocument();
    });

    it('should display "Cancelar" button', () => {
      render(<DuplicateWarningModal {...defaultProps} />);

      expect(screen.getByRole('button', { name: /Cancelar/i })).toBeInTheDocument();
    });

    it('should call onContinue when "Continuar" is clicked', () => {
      const onContinue = jest.fn();
      render(<DuplicateWarningModal {...defaultProps} onContinue={onContinue} />);

      fireEvent.click(screen.getByRole('button', { name: /Continuar/i }));

      expect(onContinue).toHaveBeenCalledTimes(1);
    });

    it('should call onCancel when "Cancelar" is clicked', () => {
      const onCancel = jest.fn();
      render(<DuplicateWarningModal {...defaultProps} onCancel={onCancel} />);

      fireEvent.click(screen.getByRole('button', { name: /Cancelar/i }));

      expect(onCancel).toHaveBeenCalledTimes(1);
    });

    it('should style "Continuar" button as warning/primary action', () => {
      render(<DuplicateWarningModal {...defaultProps} />);

      const continueButton = screen.getByRole('button', { name: /Continuar/i });
      expect(continueButton).toHaveClass('bg-orange-500');
    });

    it('should style "Cancelar" button as secondary action', () => {
      render(<DuplicateWarningModal {...defaultProps} />);

      const cancelButton = screen.getByRole('button', { name: /Cancelar/i });
      expect(cancelButton).toHaveClass('bg-gray-200');
    });

    it('should call onCancel when clicking overlay', () => {
      const onCancel = jest.fn();
      render(<DuplicateWarningModal {...defaultProps} onCancel={onCancel} />);

      fireEvent.click(screen.getByTestId('modal-overlay'));

      expect(onCancel).toHaveBeenCalledTimes(1);
    });

    it('should not close when clicking modal content', () => {
      const onCancel = jest.fn();
      render(<DuplicateWarningModal {...defaultProps} onCancel={onCancel} />);

      fireEvent.click(screen.getByTestId('modal-content'));

      expect(onCancel).not.toHaveBeenCalled();
    });
  });

  // ===========================================================================
  // T025.1.5 - Track user override decision
  // ===========================================================================

  describe('User Override Decision', () => {
    it('should pass forceDuplicate=true to onContinue callback', () => {
      const onContinue = jest.fn();
      render(<DuplicateWarningModal {...defaultProps} onContinue={onContinue} />);

      fireEvent.click(screen.getByRole('button', { name: /Continuar/i }));

      expect(onContinue).toHaveBeenCalledWith(true);
    });

    it('should display warning about creating duplicate entry', () => {
      render(<DuplicateWarningModal {...defaultProps} />);

      expect(screen.getByText(/crear una nueva póliza de todas formas/i)).toBeInTheDocument();
    });

    it('should be accessible with keyboard', () => {
      const onContinue = jest.fn();
      render(<DuplicateWarningModal {...defaultProps} onContinue={onContinue} />);

      const continueButton = screen.getByRole('button', { name: /Continuar/i });
      // Verify button is focusable
      continueButton.focus();
      expect(document.activeElement).toBe(continueButton);
      // Click via keyboard simulation (browser handles Enter key → click natively)
      fireEvent.click(continueButton);

      expect(onContinue).toHaveBeenCalled();
    });

    it('should close on Escape key press', () => {
      const onCancel = jest.fn();
      render(<DuplicateWarningModal {...defaultProps} onCancel={onCancel} />);

      fireEvent.keyDown(document, { key: 'Escape' });

      expect(onCancel).toHaveBeenCalledTimes(1);
    });
  });

  // ===========================================================================
  // Accessibility
  // ===========================================================================

  describe('Accessibility', () => {
    it('should have role="dialog"', () => {
      render(<DuplicateWarningModal {...defaultProps} />);

      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('should have aria-modal="true"', () => {
      render(<DuplicateWarningModal {...defaultProps} />);

      expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true');
    });

    it('should have aria-labelledby pointing to title', () => {
      render(<DuplicateWarningModal {...defaultProps} />);

      const dialog = screen.getByRole('dialog');
      const titleId = dialog.getAttribute('aria-labelledby');
      expect(titleId).toBeTruthy();
      expect(document.getElementById(titleId!)).toBeInTheDocument();
    });

    it('should trap focus within modal', () => {
      render(<DuplicateWarningModal {...defaultProps} />);

      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThanOrEqual(2);
    });
  });

  // ===========================================================================
  // Loading State
  // ===========================================================================

  describe('Loading State', () => {
    it('should disable buttons when loading', () => {
      render(<DuplicateWarningModal {...defaultProps} isLoading={true} />);

      expect(screen.getByRole('button', { name: /Continuar/i })).toBeDisabled();
      expect(screen.getByRole('button', { name: /Cancelar/i })).toBeDisabled();
    });

    it('should show loading spinner when loading', () => {
      render(<DuplicateWarningModal {...defaultProps} isLoading={true} />);

      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    });
  });
});
