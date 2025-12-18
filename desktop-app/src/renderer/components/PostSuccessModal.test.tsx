/**
 * T025.3 - PostSuccessModal Component Tests
 *
 * Tests for the modal that shows successful posting to ContPAQi
 * with the folio number.
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { PostSuccessModal, type PostSuccessModalProps } from './PostSuccessModal';

describe('PostSuccessModal', () => {
  const defaultProps: PostSuccessModalProps = {
    isOpen: true,
    folio: 'POL-2024-0001',
    onClose: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ===========================================================================
  // T025.3.8 - Show success with folio number
  // ===========================================================================

  describe('Modal Rendering', () => {
    it('should render when isOpen is true', () => {
      render(<PostSuccessModal {...defaultProps} />);

      expect(screen.getByTestId('post-success-modal')).toBeInTheDocument();
    });

    it('should not render when isOpen is false', () => {
      render(<PostSuccessModal {...defaultProps} isOpen={false} />);

      expect(screen.queryByTestId('post-success-modal')).not.toBeInTheDocument();
    });

    it('should display success title in Spanish', () => {
      render(<PostSuccessModal {...defaultProps} />);

      expect(screen.getByText(/Póliza Creada/i)).toBeInTheDocument();
    });

    it('should display success icon', () => {
      render(<PostSuccessModal {...defaultProps} />);

      expect(screen.getByTestId('success-icon')).toBeInTheDocument();
    });

    it('should have overlay background', () => {
      render(<PostSuccessModal {...defaultProps} />);

      expect(screen.getByTestId('modal-overlay')).toBeInTheDocument();
    });
  });

  describe('Folio Display', () => {
    it('should display the folio number', () => {
      render(<PostSuccessModal {...defaultProps} folio="POL-2024-0001" />);

      expect(screen.getByText('POL-2024-0001')).toBeInTheDocument();
    });

    it('should display folio label in Spanish', () => {
      render(<PostSuccessModal {...defaultProps} />);

      expect(screen.getByText(/Número de Folio/i)).toBeInTheDocument();
    });

    it('should display success message', () => {
      render(<PostSuccessModal {...defaultProps} />);

      expect(screen.getByText(/se ha registrado correctamente/i)).toBeInTheDocument();
    });
  });

  describe('Action Button', () => {
    it('should display "Aceptar" button', () => {
      render(<PostSuccessModal {...defaultProps} />);

      expect(screen.getByRole('button', { name: /Aceptar/i })).toBeInTheDocument();
    });

    it('should call onClose when "Aceptar" is clicked', () => {
      const onClose = jest.fn();
      render(<PostSuccessModal {...defaultProps} onClose={onClose} />);

      fireEvent.click(screen.getByRole('button', { name: /Aceptar/i }));

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('should call onClose when clicking overlay', () => {
      const onClose = jest.fn();
      render(<PostSuccessModal {...defaultProps} onClose={onClose} />);

      fireEvent.click(screen.getByTestId('modal-overlay'));

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('should close on Escape key press', () => {
      const onClose = jest.fn();
      render(<PostSuccessModal {...defaultProps} onClose={onClose} />);

      fireEvent.keyDown(document, { key: 'Escape' });

      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('Accessibility', () => {
    it('should have role="dialog"', () => {
      render(<PostSuccessModal {...defaultProps} />);

      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('should have aria-modal="true"', () => {
      render(<PostSuccessModal {...defaultProps} />);

      expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true');
    });

    it('should have aria-labelledby pointing to title', () => {
      render(<PostSuccessModal {...defaultProps} />);

      const dialog = screen.getByRole('dialog');
      const titleId = dialog.getAttribute('aria-labelledby');
      expect(titleId).toBeTruthy();
      expect(document.getElementById(titleId!)).toBeInTheDocument();
    });
  });

  describe('Styling', () => {
    it('should style button as primary action (green)', () => {
      render(<PostSuccessModal {...defaultProps} />);

      const button = screen.getByRole('button', { name: /Aceptar/i });
      expect(button).toHaveClass('bg-green-500');
    });
  });
});
