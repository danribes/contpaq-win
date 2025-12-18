/**
 * T019.1 - FieldInput Component Tests
 *
 * Tests for the field input component that:
 * - Displays field label, value, and confidence indicator
 * - Enables inline editing on click
 * - Marks field as "user_verified" after edit
 * - Validates input format (RFC, date, amounts)
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

// Will be created in T019.1.2
let FieldInput: typeof import('../../../src/renderer/components/FieldInput').FieldInput;

// Mock ConfidenceIndicator
jest.mock('../../../src/renderer/components/ConfidenceIndicator', () => ({
  ConfidenceIndicator: ({ confidence }: { confidence: number }) => (
    <div data-testid="confidence-indicator" data-confidence={confidence}>
      Confidence: {confidence}%
    </div>
  ),
}));

describe('T019.1 - FieldInput Component', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    const module = await import('../../../src/renderer/components/FieldInput');
    FieldInput = module.FieldInput;
  });

  // ==========================================================================
  // T019.1.1 - Component Structure Tests
  // ==========================================================================

  describe('T019.1.1 - Component Structure', () => {
    it('should export FieldInput component', async () => {
      const module = await import('../../../src/renderer/components/FieldInput');
      expect(module.FieldInput).toBeDefined();
      expect(typeof module.FieldInput).toBe('function');
    });

    it('should render without crashing', () => {
      expect(() => {
        render(
          <FieldInput
            label="RFC"
            value="ABC123456DEF"
            confidence={95}
            onChange={() => {}}
          />
        );
      }).not.toThrow();
    });

    it('should render field container', () => {
      render(
        <FieldInput
          label="RFC"
          value="ABC123456DEF"
          confidence={95}
          onChange={() => {}}
        />
      );
      expect(screen.getByTestId('field-input')).toBeInTheDocument();
    });
  });

  // ==========================================================================
  // T019.1.2 - Display Field Label, Value, Confidence
  // ==========================================================================

  describe('T019.1.2 - Display Field Information', () => {
    it('should display field label', () => {
      render(
        <FieldInput
          label="RFC del Proveedor"
          value="ABC123456DEF"
          confidence={95}
          onChange={() => {}}
        />
      );
      expect(screen.getByText('RFC del Proveedor')).toBeInTheDocument();
    });

    it('should display field value', () => {
      render(
        <FieldInput
          label="RFC"
          value="ABC123456DEF"
          confidence={95}
          onChange={() => {}}
        />
      );
      expect(screen.getByText('ABC123456DEF')).toBeInTheDocument();
    });

    it('should display confidence indicator', () => {
      render(
        <FieldInput
          label="RFC"
          value="ABC123456DEF"
          confidence={85}
          onChange={() => {}}
        />
      );
      const indicator = screen.getByTestId('confidence-indicator');
      expect(indicator).toBeInTheDocument();
      expect(indicator).toHaveAttribute('data-confidence', '85');
    });

    it('should display empty value placeholder', () => {
      render(
        <FieldInput
          label="RFC"
          value=""
          confidence={0}
          onChange={() => {}}
        />
      );
      expect(screen.getByText('Sin valor')).toBeInTheDocument();
    });
  });

  // ==========================================================================
  // T019.1.3 - User Verified Badge
  // ==========================================================================

  describe('T019.1.3 - User Verified Badge', () => {
    it('should not show verified badge by default', () => {
      render(
        <FieldInput
          label="RFC"
          value="ABC123456DEF"
          confidence={95}
          onChange={() => {}}
        />
      );
      expect(screen.queryByTestId('verified-badge')).not.toBeInTheDocument();
    });

    it('should show verified badge when userVerified is true', () => {
      render(
        <FieldInput
          label="RFC"
          value="ABC123456DEF"
          confidence={95}
          userVerified
          onChange={() => {}}
        />
      );
      expect(screen.getByTestId('verified-badge')).toBeInTheDocument();
    });

    it('should display checkmark in verified badge', () => {
      render(
        <FieldInput
          label="RFC"
          value="ABC123456DEF"
          confidence={95}
          userVerified
          onChange={() => {}}
        />
      );
      const badge = screen.getByTestId('verified-badge');
      expect(badge).toHaveTextContent(/✓|verificado/i);
    });
  });

  // ==========================================================================
  // T019.1.4 - Inline Editing
  // ==========================================================================

  describe('T019.1.4 - Inline Editing', () => {
    it('should show edit button on hover', async () => {
      render(
        <FieldInput
          label="RFC"
          value="ABC123456DEF"
          confidence={95}
          onChange={() => {}}
        />
      );
      const container = screen.getByTestId('field-input');
      fireEvent.mouseEnter(container);

      await waitFor(() => {
        expect(screen.getByTestId('edit-button')).toBeInTheDocument();
      });
    });

    it('should enter edit mode on click', async () => {
      render(
        <FieldInput
          label="RFC"
          value="ABC123456DEF"
          confidence={95}
          onChange={() => {}}
        />
      );

      // Click on value to edit
      const valueDisplay = screen.getByTestId('field-value');
      fireEvent.click(valueDisplay);

      await waitFor(() => {
        expect(screen.getByTestId('field-input-edit')).toBeInTheDocument();
      });
    });

    it('should show input field in edit mode', async () => {
      render(
        <FieldInput
          label="RFC"
          value="ABC123456DEF"
          confidence={95}
          onChange={() => {}}
        />
      );

      fireEvent.click(screen.getByTestId('field-value'));

      await waitFor(() => {
        const input = screen.getByRole('textbox');
        expect(input).toBeInTheDocument();
        expect(input).toHaveValue('ABC123456DEF');
      });
    });

    it('should focus input when entering edit mode', async () => {
      render(
        <FieldInput
          label="RFC"
          value="ABC123456DEF"
          confidence={95}
          onChange={() => {}}
        />
      );

      fireEvent.click(screen.getByTestId('field-value'));

      await waitFor(() => {
        const input = screen.getByRole('textbox');
        expect(input).toHaveFocus();
      });
    });

    it('should save value on Enter key', async () => {
      const handleChange = jest.fn();
      render(
        <FieldInput
          label="RFC"
          value="ABC123456DEF"
          confidence={95}
          onChange={handleChange}
        />
      );

      fireEvent.click(screen.getByTestId('field-value'));

      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: 'XYZ789012GHI' } });
      fireEvent.keyDown(input, { key: 'Enter' });

      await waitFor(() => {
        expect(handleChange).toHaveBeenCalledWith('XYZ789012GHI', true);
      });
    });

    it('should cancel edit on Escape key', async () => {
      const handleChange = jest.fn();
      render(
        <FieldInput
          label="RFC"
          value="ABC123456DEF"
          confidence={95}
          onChange={handleChange}
        />
      );

      fireEvent.click(screen.getByTestId('field-value'));

      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: 'XYZ789012GHI' } });
      fireEvent.keyDown(input, { key: 'Escape' });

      await waitFor(() => {
        expect(handleChange).not.toHaveBeenCalled();
        expect(screen.getByText('ABC123456DEF')).toBeInTheDocument();
      });
    });

    it('should save value on blur', async () => {
      const handleChange = jest.fn();
      render(
        <FieldInput
          label="RFC"
          value="ABC123456DEF"
          confidence={95}
          onChange={handleChange}
        />
      );

      fireEvent.click(screen.getByTestId('field-value'));

      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: 'XYZ789012GHI' } });
      fireEvent.blur(input);

      await waitFor(() => {
        expect(handleChange).toHaveBeenCalledWith('XYZ789012GHI', true);
      });
    });
  });

  // ==========================================================================
  // T019.1.5 - Mark as User Verified After Edit
  // ==========================================================================

  describe('T019.1.5 - Mark as User Verified', () => {
    it('should pass userVerified=true when value is changed', async () => {
      const handleChange = jest.fn();
      render(
        <FieldInput
          label="RFC"
          value="ABC123456DEF"
          confidence={95}
          onChange={handleChange}
        />
      );

      fireEvent.click(screen.getByTestId('field-value'));
      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: 'NEW_VALUE' } });
      fireEvent.keyDown(input, { key: 'Enter' });

      await waitFor(() => {
        expect(handleChange).toHaveBeenCalledWith('NEW_VALUE', true);
      });
    });

    it('should not call onChange if value unchanged', async () => {
      const handleChange = jest.fn();
      render(
        <FieldInput
          label="RFC"
          value="ABC123456DEF"
          confidence={95}
          onChange={handleChange}
        />
      );

      fireEvent.click(screen.getByTestId('field-value'));
      const input = screen.getByRole('textbox');
      // Don't change the value
      fireEvent.keyDown(input, { key: 'Enter' });

      await waitFor(() => {
        expect(handleChange).not.toHaveBeenCalled();
      });
    });
  });

  // ==========================================================================
  // T019.1.6 - Input Validation
  // ==========================================================================

  describe('T019.1.6 - RFC Validation', () => {
    it('should validate RFC format (12 or 13 chars)', async () => {
      render(
        <FieldInput
          label="RFC"
          value="ABC123456DEF"
          confidence={95}
          fieldType="rfc"
          onChange={() => {}}
        />
      );

      fireEvent.click(screen.getByTestId('field-value'));
      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: 'INVALID' } });
      fireEvent.keyDown(input, { key: 'Enter' });

      await waitFor(() => {
        expect(screen.getByTestId('validation-error')).toBeInTheDocument();
      });
    });

    it('should accept valid 12-char RFC', async () => {
      const handleChange = jest.fn();
      render(
        <FieldInput
          label="RFC"
          value=""
          confidence={0}
          fieldType="rfc"
          onChange={handleChange}
        />
      );

      fireEvent.click(screen.getByTestId('field-value'));
      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: 'ABC123456DEF' } });
      fireEvent.keyDown(input, { key: 'Enter' });

      await waitFor(() => {
        expect(handleChange).toHaveBeenCalled();
        expect(screen.queryByTestId('validation-error')).not.toBeInTheDocument();
      });
    });

    it('should accept valid 13-char RFC', async () => {
      const handleChange = jest.fn();
      render(
        <FieldInput
          label="RFC"
          value=""
          confidence={0}
          fieldType="rfc"
          onChange={handleChange}
        />
      );

      fireEvent.click(screen.getByTestId('field-value'));
      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: 'ABCD123456EFG' } });
      fireEvent.keyDown(input, { key: 'Enter' });

      await waitFor(() => {
        expect(handleChange).toHaveBeenCalled();
      });
    });
  });

  describe('T019.1.6 - Date Validation', () => {
    it('should validate date format', async () => {
      render(
        <FieldInput
          label="Fecha"
          value="2025-12-15"
          confidence={90}
          fieldType="date"
          onChange={() => {}}
        />
      );

      fireEvent.click(screen.getByTestId('field-value'));
      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: 'not-a-date' } });
      fireEvent.keyDown(input, { key: 'Enter' });

      await waitFor(() => {
        expect(screen.getByTestId('validation-error')).toBeInTheDocument();
      });
    });

    it('should accept valid ISO date', async () => {
      const handleChange = jest.fn();
      render(
        <FieldInput
          label="Fecha"
          value=""
          confidence={0}
          fieldType="date"
          onChange={handleChange}
        />
      );

      fireEvent.click(screen.getByTestId('field-value'));
      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: '2025-12-15' } });
      fireEvent.keyDown(input, { key: 'Enter' });

      await waitFor(() => {
        expect(handleChange).toHaveBeenCalled();
      });
    });

    it('should accept DD/MM/YYYY format', async () => {
      const handleChange = jest.fn();
      render(
        <FieldInput
          label="Fecha"
          value=""
          confidence={0}
          fieldType="date"
          onChange={handleChange}
        />
      );

      fireEvent.click(screen.getByTestId('field-value'));
      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: '15/12/2025' } });
      fireEvent.keyDown(input, { key: 'Enter' });

      await waitFor(() => {
        expect(handleChange).toHaveBeenCalled();
      });
    });
  });

  describe('T019.1.6 - Amount Validation', () => {
    it('should validate amount format', async () => {
      render(
        <FieldInput
          label="Total"
          value="1000.00"
          confidence={88}
          fieldType="amount"
          onChange={() => {}}
        />
      );

      fireEvent.click(screen.getByTestId('field-value'));
      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: 'abc' } });
      fireEvent.keyDown(input, { key: 'Enter' });

      await waitFor(() => {
        expect(screen.getByTestId('validation-error')).toBeInTheDocument();
      });
    });

    it('should accept valid decimal amount', async () => {
      const handleChange = jest.fn();
      render(
        <FieldInput
          label="Total"
          value=""
          confidence={0}
          fieldType="amount"
          onChange={handleChange}
        />
      );

      fireEvent.click(screen.getByTestId('field-value'));
      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: '1234.56' } });
      fireEvent.keyDown(input, { key: 'Enter' });

      await waitFor(() => {
        expect(handleChange).toHaveBeenCalled();
      });
    });

    it('should accept amount with comma separator', async () => {
      const handleChange = jest.fn();
      render(
        <FieldInput
          label="Total"
          value=""
          confidence={0}
          fieldType="amount"
          onChange={handleChange}
        />
      );

      fireEvent.click(screen.getByTestId('field-value'));
      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: '1,234.56' } });
      fireEvent.keyDown(input, { key: 'Enter' });

      await waitFor(() => {
        expect(handleChange).toHaveBeenCalled();
      });
    });

    it('should accept negative amounts', async () => {
      const handleChange = jest.fn();
      render(
        <FieldInput
          label="Total"
          value=""
          confidence={0}
          fieldType="amount"
          onChange={handleChange}
        />
      );

      fireEvent.click(screen.getByTestId('field-value'));
      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: '-100.00' } });
      fireEvent.keyDown(input, { key: 'Enter' });

      await waitFor(() => {
        expect(handleChange).toHaveBeenCalled();
      });
    });
  });

  describe('T019.1.6 - Text Field (No Validation)', () => {
    it('should accept any text for text field type', async () => {
      const handleChange = jest.fn();
      render(
        <FieldInput
          label="Nombre"
          value=""
          confidence={0}
          fieldType="text"
          onChange={handleChange}
        />
      );

      fireEvent.click(screen.getByTestId('field-value'));
      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: 'Any text here!' } });
      fireEvent.keyDown(input, { key: 'Enter' });

      await waitFor(() => {
        expect(handleChange).toHaveBeenCalled();
        expect(screen.queryByTestId('validation-error')).not.toBeInTheDocument();
      });
    });

    it('should default to text type if fieldType not specified', async () => {
      const handleChange = jest.fn();
      render(
        <FieldInput
          label="Campo"
          value=""
          confidence={0}
          onChange={handleChange}
        />
      );

      fireEvent.click(screen.getByTestId('field-value'));
      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: 'Any value' } });
      fireEvent.keyDown(input, { key: 'Enter' });

      await waitFor(() => {
        expect(handleChange).toHaveBeenCalled();
      });
    });
  });

  // ==========================================================================
  // Tailwind Styling Tests
  // ==========================================================================

  describe('Tailwind Styling', () => {
    it('should have border styling', () => {
      render(
        <FieldInput
          label="RFC"
          value="ABC123456DEF"
          confidence={95}
          onChange={() => {}}
        />
      );
      const container = screen.getByTestId('field-input');
      expect(container).toHaveClass('border');
    });

    it('should have rounded corners', () => {
      render(
        <FieldInput
          label="RFC"
          value="ABC123456DEF"
          confidence={95}
          onChange={() => {}}
        />
      );
      const container = screen.getByTestId('field-input');
      expect(container).toHaveClass('rounded');
    });

    it('should have padding', () => {
      render(
        <FieldInput
          label="RFC"
          value="ABC123456DEF"
          confidence={95}
          onChange={() => {}}
        />
      );
      const container = screen.getByTestId('field-input');
      expect(container.className).toMatch(/p-\d/);
    });

    it('should have hover state', () => {
      render(
        <FieldInput
          label="RFC"
          value="ABC123456DEF"
          confidence={95}
          onChange={() => {}}
        />
      );
      const container = screen.getByTestId('field-input');
      expect(container.className).toMatch(/hover:/);
    });

    it('should style validation error in red', async () => {
      render(
        <FieldInput
          label="RFC"
          value="ABC123456DEF"
          confidence={95}
          fieldType="rfc"
          onChange={() => {}}
        />
      );

      fireEvent.click(screen.getByTestId('field-value'));
      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: 'X' } });
      fireEvent.keyDown(input, { key: 'Enter' });

      await waitFor(() => {
        const error = screen.getByTestId('validation-error');
        expect(error.className).toMatch(/text-red/);
      });
    });
  });

  // ==========================================================================
  // Read-only Mode Tests
  // ==========================================================================

  describe('Read-only Mode', () => {
    it('should not allow editing when readOnly is true', () => {
      render(
        <FieldInput
          label="RFC"
          value="ABC123456DEF"
          confidence={95}
          readOnly
          onChange={() => {}}
        />
      );

      const valueDisplay = screen.getByTestId('field-value');
      fireEvent.click(valueDisplay);

      expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    });

    it('should not show edit button when readOnly', () => {
      render(
        <FieldInput
          label="RFC"
          value="ABC123456DEF"
          confidence={95}
          readOnly
          onChange={() => {}}
        />
      );

      const container = screen.getByTestId('field-input');
      fireEvent.mouseEnter(container);

      expect(screen.queryByTestId('edit-button')).not.toBeInTheDocument();
    });
  });

  // ==========================================================================
  // Field Selection Callback Tests
  // ==========================================================================

  describe('Field Selection', () => {
    it('should call onSelect when field is clicked', () => {
      const handleSelect = jest.fn();
      render(
        <FieldInput
          label="RFC"
          value="ABC123456DEF"
          confidence={95}
          onChange={() => {}}
          onSelect={handleSelect}
        />
      );

      const container = screen.getByTestId('field-input');
      fireEvent.click(container);

      expect(handleSelect).toHaveBeenCalled();
    });

    it('should highlight when selected', () => {
      render(
        <FieldInput
          label="RFC"
          value="ABC123456DEF"
          confidence={95}
          isSelected
          onChange={() => {}}
        />
      );

      const container = screen.getByTestId('field-input');
      expect(container.className).toMatch(/ring|border-blue/);
    });
  });
});
