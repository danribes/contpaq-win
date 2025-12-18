/**
 * T025.2 - CreateVendorModal Component Tests
 *
 * Tests for the create vendor modal that shows when a vendor RFC
 * is not found in ContPAQi during the posting flow.
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { CreateVendorModal, type CreateVendorModalProps } from './CreateVendorModal';

describe('CreateVendorModal', () => {
  const defaultProps: CreateVendorModalProps = {
    isOpen: true,
    rfc: 'XAXX010101000',
    suggestedName: 'Empresa Ejemplo SA de CV',
    isLoading: false,
    onSubmit: jest.fn(),
    onCancel: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ===========================================================================
  // T025.2.1 - Modal Rendering
  // ===========================================================================

  describe('Modal Rendering', () => {
    it('should render when isOpen is true', () => {
      render(<CreateVendorModal {...defaultProps} />);

      expect(screen.getByTestId('create-vendor-modal')).toBeInTheDocument();
    });

    it('should not render when isOpen is false', () => {
      render(<CreateVendorModal {...defaultProps} isOpen={false} />);

      expect(screen.queryByTestId('create-vendor-modal')).not.toBeInTheDocument();
    });

    it('should display title in Spanish', () => {
      render(<CreateVendorModal {...defaultProps} />);

      expect(screen.getByText(/Crear Nuevo Proveedor/i)).toBeInTheDocument();
    });

    it('should display explanation message', () => {
      render(<CreateVendorModal {...defaultProps} />);

      expect(screen.getByText(/no se encontró en ContPAQi/i)).toBeInTheDocument();
    });

    it('should have overlay background', () => {
      render(<CreateVendorModal {...defaultProps} />);

      expect(screen.getByTestId('modal-overlay')).toBeInTheDocument();
    });
  });

  // ===========================================================================
  // T025.2.2 - RFC Display
  // ===========================================================================

  describe('RFC Display', () => {
    it('should display the RFC that was not found', () => {
      render(<CreateVendorModal {...defaultProps} rfc="ABC123456789" />);

      // RFC appears in both explanation and display - check display element specifically
      const rfcDisplay = screen.getByTestId('rfc-display');
      expect(rfcDisplay).toHaveTextContent('ABC123456789');
    });

    it('should show RFC label in Spanish', () => {
      render(<CreateVendorModal {...defaultProps} />);

      expect(screen.getByText(/RFC:/i)).toBeInTheDocument();
    });

    it('should display RFC as read-only', () => {
      render(<CreateVendorModal {...defaultProps} />);

      const rfcDisplay = screen.getByTestId('rfc-display');
      expect(rfcDisplay).toBeInTheDocument();
    });
  });

  // ===========================================================================
  // T025.2.3 - Name Input Form
  // ===========================================================================

  describe('Name Input Form', () => {
    it('should display vendor name input field', () => {
      render(<CreateVendorModal {...defaultProps} />);

      expect(screen.getByLabelText(/Nombre del Proveedor/i)).toBeInTheDocument();
    });

    it('should pre-fill name with suggested name', () => {
      render(<CreateVendorModal {...defaultProps} suggestedName="Test Company" />);

      const nameInput = screen.getByLabelText(/Nombre del Proveedor/i) as HTMLInputElement;
      expect(nameInput.value).toBe('Test Company');
    });

    it('should allow editing the vendor name', () => {
      render(<CreateVendorModal {...defaultProps} />);

      const nameInput = screen.getByLabelText(/Nombre del Proveedor/i);
      fireEvent.change(nameInput, { target: { value: 'New Company Name' } });

      expect(nameInput).toHaveValue('New Company Name');
    });

    it('should have commercial name field (optional)', () => {
      render(<CreateVendorModal {...defaultProps} />);

      expect(screen.getByLabelText(/Nombre Comercial/i)).toBeInTheDocument();
    });

    it('should show commercial name as optional', () => {
      render(<CreateVendorModal {...defaultProps} />);

      expect(screen.getByText(/opcional/i)).toBeInTheDocument();
    });
  });

  // ===========================================================================
  // T025.2.4 - Action Buttons
  // ===========================================================================

  describe('Action Buttons', () => {
    it('should display "Crear Proveedor" button', () => {
      render(<CreateVendorModal {...defaultProps} />);

      expect(screen.getByRole('button', { name: /Crear Proveedor/i })).toBeInTheDocument();
    });

    it('should display "Cancelar" button', () => {
      render(<CreateVendorModal {...defaultProps} />);

      expect(screen.getByRole('button', { name: /Cancelar/i })).toBeInTheDocument();
    });

    it('should call onSubmit with form data when "Crear Proveedor" is clicked', () => {
      const onSubmit = jest.fn();
      render(<CreateVendorModal {...defaultProps} onSubmit={onSubmit} />);

      const nameInput = screen.getByLabelText(/Nombre del Proveedor/i);
      fireEvent.change(nameInput, { target: { value: 'New Company' } });

      fireEvent.click(screen.getByRole('button', { name: /Crear Proveedor/i }));

      expect(onSubmit).toHaveBeenCalledWith({
        rfc: 'XAXX010101000',
        name: 'New Company',
        commercialName: undefined,
      });
    });

    it('should include commercial name if provided', () => {
      const onSubmit = jest.fn();
      render(<CreateVendorModal {...defaultProps} onSubmit={onSubmit} />);

      const nameInput = screen.getByLabelText(/Nombre del Proveedor/i);
      const commercialInput = screen.getByLabelText(/Nombre Comercial/i);

      fireEvent.change(nameInput, { target: { value: 'Legal Name SA' } });
      fireEvent.change(commercialInput, { target: { value: 'Brand Name' } });

      fireEvent.click(screen.getByRole('button', { name: /Crear Proveedor/i }));

      expect(onSubmit).toHaveBeenCalledWith({
        rfc: 'XAXX010101000',
        name: 'Legal Name SA',
        commercialName: 'Brand Name',
      });
    });

    it('should call onCancel when "Cancelar" is clicked', () => {
      const onCancel = jest.fn();
      render(<CreateVendorModal {...defaultProps} onCancel={onCancel} />);

      fireEvent.click(screen.getByRole('button', { name: /Cancelar/i }));

      expect(onCancel).toHaveBeenCalledTimes(1);
    });

    it('should call onCancel when clicking overlay', () => {
      const onCancel = jest.fn();
      render(<CreateVendorModal {...defaultProps} onCancel={onCancel} />);

      fireEvent.click(screen.getByTestId('modal-overlay'));

      expect(onCancel).toHaveBeenCalledTimes(1);
    });

    it('should close on Escape key press', () => {
      const onCancel = jest.fn();
      render(<CreateVendorModal {...defaultProps} onCancel={onCancel} />);

      fireEvent.keyDown(document, { key: 'Escape' });

      expect(onCancel).toHaveBeenCalledTimes(1);
    });
  });

  // ===========================================================================
  // Validation
  // ===========================================================================

  describe('Validation', () => {
    it('should disable submit button when name is empty', () => {
      render(<CreateVendorModal {...defaultProps} suggestedName="" />);

      const submitButton = screen.getByRole('button', { name: /Crear Proveedor/i });
      expect(submitButton).toBeDisabled();
    });

    it('should enable submit button when name is provided', () => {
      render(<CreateVendorModal {...defaultProps} suggestedName="Test" />);

      const submitButton = screen.getByRole('button', { name: /Crear Proveedor/i });
      expect(submitButton).toBeEnabled();
    });

    it('should trim whitespace from name for validation', () => {
      render(<CreateVendorModal {...defaultProps} suggestedName="   " />);

      const submitButton = screen.getByRole('button', { name: /Crear Proveedor/i });
      expect(submitButton).toBeDisabled();
    });

    it('should show required indicator for name field', () => {
      render(<CreateVendorModal {...defaultProps} />);

      expect(screen.getByText('*')).toBeInTheDocument();
    });
  });

  // ===========================================================================
  // Loading State
  // ===========================================================================

  describe('Loading State', () => {
    it('should disable all buttons when loading', () => {
      render(<CreateVendorModal {...defaultProps} isLoading={true} />);

      expect(screen.getByRole('button', { name: /Crear Proveedor/i })).toBeDisabled();
      expect(screen.getByRole('button', { name: /Cancelar/i })).toBeDisabled();
    });

    it('should show loading spinner when loading', () => {
      render(<CreateVendorModal {...defaultProps} isLoading={true} />);

      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    });

    it('should disable form inputs when loading', () => {
      render(<CreateVendorModal {...defaultProps} isLoading={true} />);

      const nameInput = screen.getByLabelText(/Nombre del Proveedor/i);
      const commercialInput = screen.getByLabelText(/Nombre Comercial/i);

      expect(nameInput).toBeDisabled();
      expect(commercialInput).toBeDisabled();
    });

    it('should not close on overlay click when loading', () => {
      const onCancel = jest.fn();
      render(<CreateVendorModal {...defaultProps} isLoading={true} onCancel={onCancel} />);

      fireEvent.click(screen.getByTestId('modal-overlay'));

      expect(onCancel).not.toHaveBeenCalled();
    });

    it('should not close on Escape when loading', () => {
      const onCancel = jest.fn();
      render(<CreateVendorModal {...defaultProps} isLoading={true} onCancel={onCancel} />);

      fireEvent.keyDown(document, { key: 'Escape' });

      expect(onCancel).not.toHaveBeenCalled();
    });
  });

  // ===========================================================================
  // Accessibility
  // ===========================================================================

  describe('Accessibility', () => {
    it('should have role="dialog"', () => {
      render(<CreateVendorModal {...defaultProps} />);

      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('should have aria-modal="true"', () => {
      render(<CreateVendorModal {...defaultProps} />);

      expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true');
    });

    it('should have aria-labelledby pointing to title', () => {
      render(<CreateVendorModal {...defaultProps} />);

      const dialog = screen.getByRole('dialog');
      const titleId = dialog.getAttribute('aria-labelledby');
      expect(titleId).toBeTruthy();
      expect(document.getElementById(titleId!)).toBeInTheDocument();
    });

    it('should associate label with input via htmlFor', () => {
      render(<CreateVendorModal {...defaultProps} />);

      const nameInput = screen.getByLabelText(/Nombre del Proveedor/i);
      expect(nameInput).toHaveAttribute('id');
    });
  });

  // ===========================================================================
  // Error Display
  // ===========================================================================

  describe('Error Display', () => {
    it('should display error message when provided', () => {
      render(<CreateVendorModal {...defaultProps} error="Error al crear proveedor" />);

      expect(screen.getByText(/Error al crear proveedor/i)).toBeInTheDocument();
    });

    it('should style error message in red', () => {
      render(<CreateVendorModal {...defaultProps} error="Error message" />);

      const errorElement = screen.getByTestId('error-message');
      expect(errorElement).toHaveClass('text-red-600');
    });

    it('should not show error area when no error', () => {
      render(<CreateVendorModal {...defaultProps} />);

      expect(screen.queryByTestId('error-message')).not.toBeInTheDocument();
    });
  });
});
