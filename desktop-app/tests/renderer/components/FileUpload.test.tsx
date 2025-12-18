/**
 * T015.2 - FileUpload Component Tests
 *
 * Tests for the file upload UI component that:
 * - Allows users to select PDF files
 * - Supports drag and drop
 * - Shows upload progress
 * - Displays error messages in Spanish
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';

// Will be created in T015.2.2
let FileUpload: typeof import('../../../src/renderer/components/FileUpload').FileUpload;

// Mock props type
interface FileUploadProps {
  onFileSelect: (file: File) => void;
  onUploadStart?: () => void;
  onUploadComplete?: () => void;
  onError?: (error: string) => void;
  isUploading?: boolean;
  progress?: number;
  accept?: string;
  maxSizeMB?: number;
  disabled?: boolean;
}

describe('T015.2 - FileUpload Component', () => {
  let mockOnFileSelect: jest.Mock;
  let mockOnError: jest.Mock;

  beforeEach(() => {
    mockOnFileSelect = jest.fn();
    mockOnError = jest.fn();
  });

  // ==========================================================================
  // T015.2.1 - Component Structure Tests
  // ==========================================================================

  describe('T015.2.1 - Component Structure', () => {
    it('should export FileUpload component', async () => {
      const module = await import('../../../src/renderer/components/FileUpload');
      expect(module.FileUpload).toBeDefined();
      expect(typeof module.FileUpload).toBe('function');
    });

    it('should render without crashing', async () => {
      const module = await import('../../../src/renderer/components/FileUpload');
      const { FileUpload: FU } = module;

      expect(() => {
        render(<FU onFileSelect={mockOnFileSelect} />);
      }).not.toThrow();
    });

    it('should render drop zone container', async () => {
      const module = await import('../../../src/renderer/components/FileUpload');
      const { FileUpload: FU } = module;

      render(<FU onFileSelect={mockOnFileSelect} />);

      expect(screen.getByTestId('drop-zone')).toBeInTheDocument();
    });
  });

  // ==========================================================================
  // T015.2.2 - File Picker Tests
  // ==========================================================================

  describe('T015.2.2 - File Picker', () => {
    it('should have hidden file input', async () => {
      const module = await import('../../../src/renderer/components/FileUpload');
      const { FileUpload: FU } = module;

      render(<FU onFileSelect={mockOnFileSelect} />);

      const input = screen.getByTestId('file-input') as HTMLInputElement;
      expect(input).toBeInTheDocument();
      expect(input.type).toBe('file');
    });

    it('should only accept PDF files by default', async () => {
      const module = await import('../../../src/renderer/components/FileUpload');
      const { FileUpload: FU } = module;

      render(<FU onFileSelect={mockOnFileSelect} />);

      const input = screen.getByTestId('file-input') as HTMLInputElement;
      expect(input.accept).toBe('.pdf,application/pdf');
    });

    it('should display button to select file', async () => {
      const module = await import('../../../src/renderer/components/FileUpload');
      const { FileUpload: FU } = module;

      render(<FU onFileSelect={mockOnFileSelect} />);

      expect(screen.getByText(/Seleccionar archivo/i)).toBeInTheDocument();
    });

    it('should trigger file input when button clicked', async () => {
      const module = await import('../../../src/renderer/components/FileUpload');
      const { FileUpload: FU } = module;

      render(<FU onFileSelect={mockOnFileSelect} />);

      const input = screen.getByTestId('file-input') as HTMLInputElement;
      const clickSpy = jest.spyOn(input, 'click');

      const button = screen.getByText(/Seleccionar archivo/i);
      fireEvent.click(button);

      expect(clickSpy).toHaveBeenCalled();
    });

    it('should call onFileSelect when file is selected', async () => {
      const module = await import('../../../src/renderer/components/FileUpload');
      const { FileUpload: FU } = module;

      render(<FU onFileSelect={mockOnFileSelect} />);

      const input = screen.getByTestId('file-input') as HTMLInputElement;
      const file = new File(['%PDF-1.4'], 'invoice.pdf', { type: 'application/pdf' });

      Object.defineProperty(input, 'files', {
        value: [file],
      });

      fireEvent.change(input);

      expect(mockOnFileSelect).toHaveBeenCalledWith(file);
    });
  });

  // ==========================================================================
  // T015.2.3 - Drag and Drop Tests
  // ==========================================================================

  describe('T015.2.3 - Drag and Drop Zone', () => {
    it('should display drag and drop instructions', async () => {
      const module = await import('../../../src/renderer/components/FileUpload');
      const { FileUpload: FU } = module;

      render(<FU onFileSelect={mockOnFileSelect} />);

      expect(screen.getByText(/arrastre.*PDF/i)).toBeInTheDocument();
    });

    it('should change style when file is dragged over', async () => {
      const module = await import('../../../src/renderer/components/FileUpload');
      const { FileUpload: FU } = module;

      render(<FU onFileSelect={mockOnFileSelect} />);

      const dropZone = screen.getByTestId('drop-zone');

      fireEvent.dragEnter(dropZone, {
        dataTransfer: { types: ['Files'] },
      });

      expect(dropZone).toHaveClass('border-blue-500');
    });

    it('should reset style when file is dragged out', async () => {
      const module = await import('../../../src/renderer/components/FileUpload');
      const { FileUpload: FU } = module;

      render(<FU onFileSelect={mockOnFileSelect} />);

      const dropZone = screen.getByTestId('drop-zone');

      fireEvent.dragEnter(dropZone, {
        dataTransfer: { types: ['Files'] },
      });

      fireEvent.dragLeave(dropZone);

      expect(dropZone).not.toHaveClass('border-blue-500');
    });

    it('should call onFileSelect when PDF is dropped', async () => {
      const module = await import('../../../src/renderer/components/FileUpload');
      const { FileUpload: FU } = module;

      render(<FU onFileSelect={mockOnFileSelect} />);

      const dropZone = screen.getByTestId('drop-zone');
      const file = new File(['%PDF-1.4'], 'invoice.pdf', { type: 'application/pdf' });

      fireEvent.drop(dropZone, {
        dataTransfer: {
          files: [file],
          types: ['Files'],
        },
      });

      expect(mockOnFileSelect).toHaveBeenCalledWith(file);
    });

    it('should prevent default on drag events', async () => {
      const module = await import('../../../src/renderer/components/FileUpload');
      const { FileUpload: FU } = module;

      render(<FU onFileSelect={mockOnFileSelect} />);

      const dropZone = screen.getByTestId('drop-zone');

      const dragOverEvent = new Event('dragover', { bubbles: true });
      Object.defineProperty(dragOverEvent, 'preventDefault', { value: jest.fn() });

      fireEvent(dropZone, dragOverEvent);

      expect(dragOverEvent.preventDefault).toHaveBeenCalled();
    });
  });

  // ==========================================================================
  // T015.2.4 - Upload Progress Tests
  // ==========================================================================

  describe('T015.2.4 - Upload Progress', () => {
    it('should not show progress bar by default', async () => {
      const module = await import('../../../src/renderer/components/FileUpload');
      const { FileUpload: FU } = module;

      render(<FU onFileSelect={mockOnFileSelect} />);

      expect(screen.queryByTestId('progress-bar')).not.toBeInTheDocument();
    });

    it('should show progress bar when isUploading is true', async () => {
      const module = await import('../../../src/renderer/components/FileUpload');
      const { FileUpload: FU } = module;

      render(<FU onFileSelect={mockOnFileSelect} isUploading={true} progress={50} />);

      expect(screen.getByTestId('progress-bar')).toBeInTheDocument();
    });

    it('should display progress percentage', async () => {
      const module = await import('../../../src/renderer/components/FileUpload');
      const { FileUpload: FU } = module;

      render(<FU onFileSelect={mockOnFileSelect} isUploading={true} progress={75} />);

      expect(screen.getByText(/75%/)).toBeInTheDocument();
    });

    it('should update progress bar width based on progress', async () => {
      const module = await import('../../../src/renderer/components/FileUpload');
      const { FileUpload: FU } = module;

      render(<FU onFileSelect={mockOnFileSelect} isUploading={true} progress={60} />);

      const progressFill = screen.getByTestId('progress-fill');
      expect(progressFill).toHaveStyle({ width: '60%' });
    });

    it('should show uploading message in Spanish', async () => {
      const module = await import('../../../src/renderer/components/FileUpload');
      const { FileUpload: FU } = module;

      render(<FU onFileSelect={mockOnFileSelect} isUploading={true} progress={30} />);

      expect(screen.getByText(/Procesando/i)).toBeInTheDocument();
    });

    it('should disable file selection while uploading', async () => {
      const module = await import('../../../src/renderer/components/FileUpload');
      const { FileUpload: FU } = module;

      render(<FU onFileSelect={mockOnFileSelect} isUploading={true} progress={50} />);

      const button = screen.queryByText(/Seleccionar archivo/i);
      if (button) {
        expect(button).toBeDisabled();
      }

      const input = screen.getByTestId('file-input') as HTMLInputElement;
      expect(input.disabled).toBe(true);
    });
  });

  // ==========================================================================
  // T015.2.5 - Error Message Tests
  // ==========================================================================

  describe('T015.2.5 - Error Messages in Spanish', () => {
    it('should reject non-PDF files with Spanish error', async () => {
      const module = await import('../../../src/renderer/components/FileUpload');
      const { FileUpload: FU } = module;

      render(<FU onFileSelect={mockOnFileSelect} onError={mockOnError} />);

      const dropZone = screen.getByTestId('drop-zone');
      const file = new File(['content'], 'document.txt', { type: 'text/plain' });

      fireEvent.drop(dropZone, {
        dataTransfer: {
          files: [file],
          types: ['Files'],
        },
      });

      expect(mockOnError).toHaveBeenCalledWith(
        expect.stringMatching(/PDF/i)
      );
    });

    it('should reject files exceeding max size', async () => {
      const module = await import('../../../src/renderer/components/FileUpload');
      const { FileUpload: FU } = module;

      render(<FU onFileSelect={mockOnFileSelect} onError={mockOnError} maxSizeMB={1} />);

      const dropZone = screen.getByTestId('drop-zone');
      // Create a file larger than 1MB
      const largeContent = new Array(1024 * 1024 + 1).fill('a').join('');
      const file = new File([largeContent], 'large.pdf', { type: 'application/pdf' });

      fireEvent.drop(dropZone, {
        dataTransfer: {
          files: [file],
          types: ['Files'],
        },
      });

      expect(mockOnError).toHaveBeenCalledWith(
        expect.stringMatching(/tamaño|MB/i)
      );
    });

    it('should display error message in UI', async () => {
      const module = await import('../../../src/renderer/components/FileUpload');
      const { FileUpload: FU } = module;

      const { rerender } = render(<FU onFileSelect={mockOnFileSelect} />);

      // Simulate error state by passing error prop
      rerender(<FU onFileSelect={mockOnFileSelect} error="El archivo no es un PDF válido" />);

      expect(screen.getByText(/El archivo no es un PDF válido/i)).toBeInTheDocument();
    });

    it('should show error message in red color', async () => {
      const module = await import('../../../src/renderer/components/FileUpload');
      const { FileUpload: FU } = module;

      render(<FU onFileSelect={mockOnFileSelect} error="Error de prueba" />);

      const errorElement = screen.getByText(/Error de prueba/i);
      expect(errorElement).toHaveClass('text-red-500');
    });

    it('should clear error when new valid file is selected', async () => {
      const module = await import('../../../src/renderer/components/FileUpload');
      const { FileUpload: FU } = module;

      const { rerender } = render(
        <FU onFileSelect={mockOnFileSelect} error="Error previo" />
      );

      expect(screen.getByText(/Error previo/i)).toBeInTheDocument();

      // Simulate error being cleared
      rerender(<FU onFileSelect={mockOnFileSelect} />);

      expect(screen.queryByText(/Error previo/i)).not.toBeInTheDocument();
    });
  });

  // ==========================================================================
  // PDF Icon and File Info Tests
  // ==========================================================================

  describe('File Info Display', () => {
    it('should show PDF icon in drop zone', async () => {
      const module = await import('../../../src/renderer/components/FileUpload');
      const { FileUpload: FU } = module;

      render(<FU onFileSelect={mockOnFileSelect} />);

      const icon = screen.getByTestId('pdf-icon');
      expect(icon).toBeInTheDocument();
    });

    it('should show accepted file types', async () => {
      const module = await import('../../../src/renderer/components/FileUpload');
      const { FileUpload: FU } = module;

      render(<FU onFileSelect={mockOnFileSelect} maxSizeMB={50} />);

      expect(screen.getByText(/PDF.*50.*MB/i)).toBeInTheDocument();
    });
  });

  // ==========================================================================
  // Disabled State Tests
  // ==========================================================================

  describe('Disabled State', () => {
    it('should disable interactions when disabled prop is true', async () => {
      const module = await import('../../../src/renderer/components/FileUpload');
      const { FileUpload: FU } = module;

      render(<FU onFileSelect={mockOnFileSelect} disabled={true} />);

      const dropZone = screen.getByTestId('drop-zone');
      expect(dropZone).toHaveClass('opacity-50');
    });

    it('should not trigger file select when disabled', async () => {
      const module = await import('../../../src/renderer/components/FileUpload');
      const { FileUpload: FU } = module;

      render(<FU onFileSelect={mockOnFileSelect} disabled={true} />);

      const dropZone = screen.getByTestId('drop-zone');
      const file = new File(['%PDF-1.4'], 'invoice.pdf', { type: 'application/pdf' });

      fireEvent.drop(dropZone, {
        dataTransfer: {
          files: [file],
          types: ['Files'],
        },
      });

      expect(mockOnFileSelect).not.toHaveBeenCalled();
    });
  });

  // ==========================================================================
  // Tailwind Styling Tests
  // ==========================================================================

  describe('Tailwind Styling', () => {
    it('should have dashed border on drop zone', async () => {
      const module = await import('../../../src/renderer/components/FileUpload');
      const { FileUpload: FU } = module;

      render(<FU onFileSelect={mockOnFileSelect} />);

      const dropZone = screen.getByTestId('drop-zone');
      expect(dropZone).toHaveClass('border-dashed');
    });

    it('should have rounded corners', async () => {
      const module = await import('../../../src/renderer/components/FileUpload');
      const { FileUpload: FU } = module;

      render(<FU onFileSelect={mockOnFileSelect} />);

      const dropZone = screen.getByTestId('drop-zone');
      expect(dropZone).toHaveClass('rounded-lg');
    });

    it('should have hover effect on drop zone', async () => {
      const module = await import('../../../src/renderer/components/FileUpload');
      const { FileUpload: FU } = module;

      render(<FU onFileSelect={mockOnFileSelect} />);

      const dropZone = screen.getByTestId('drop-zone');
      expect(dropZone).toHaveClass('hover:border-blue-400');
    });

    it('should have proper padding', async () => {
      const module = await import('../../../src/renderer/components/FileUpload');
      const { FileUpload: FU } = module;

      render(<FU onFileSelect={mockOnFileSelect} />);

      const dropZone = screen.getByTestId('drop-zone');
      expect(dropZone).toHaveClass('p-8');
    });
  });
});
