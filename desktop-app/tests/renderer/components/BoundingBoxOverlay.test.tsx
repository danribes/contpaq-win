/**
 * T016.2 - BoundingBoxOverlay Component Tests
 *
 * Tests for the bounding box overlay component that:
 * - Renders boxes at correct positions over PDF
 * - Colors boxes by confidence level
 * - Highlights active field on hover/selection
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import type { BoundingBox, ExtractionField } from '../../../src/renderer/types';

// Will be created in T016.2.2
let BoundingBoxOverlay: typeof import('../../../src/renderer/components/BoundingBoxOverlay').BoundingBoxOverlay;

// Test data
const createField = (
  fieldName: string,
  confidence: number,
  bbox: BoundingBox
): ExtractionField => ({
  fieldName,
  value: `Value for ${fieldName}`,
  confidence,
  bbox,
  userVerified: false,
});

const mockFields: ExtractionField[] = [
  createField('vendor_rfc', 95, { x: 100, y: 50, width: 200, height: 20 }),
  createField('vendor_name', 85, { x: 100, y: 80, width: 250, height: 20 }),
  createField('invoice_number', 60, { x: 400, y: 50, width: 100, height: 20 }),
  createField('total', 92, { x: 400, y: 200, width: 80, height: 25 }),
];

describe('T016.2 - BoundingBoxOverlay Component', () => {
  // ==========================================================================
  // T016.2.1 - Component Structure Tests
  // ==========================================================================

  describe('T016.2.1 - Component Structure', () => {
    it('should export BoundingBoxOverlay component', async () => {
      const module = await import('../../../src/renderer/components/BoundingBoxOverlay');
      expect(module.BoundingBoxOverlay).toBeDefined();
      expect(typeof module.BoundingBoxOverlay).toBe('function');
    });

    it('should render without crashing', async () => {
      const module = await import('../../../src/renderer/components/BoundingBoxOverlay');
      const { BoundingBoxOverlay: BBO } = module;

      expect(() => {
        render(<BBO fields={mockFields} scale={1} />);
      }).not.toThrow();
    });

    it('should render overlay container', async () => {
      const module = await import('../../../src/renderer/components/BoundingBoxOverlay');
      const { BoundingBoxOverlay: BBO } = module;

      render(<BBO fields={mockFields} scale={1} />);

      expect(screen.getByTestId('bbox-overlay')).toBeInTheDocument();
    });

    it('should have absolute positioning', async () => {
      const module = await import('../../../src/renderer/components/BoundingBoxOverlay');
      const { BoundingBoxOverlay: BBO } = module;

      render(<BBO fields={mockFields} scale={1} />);

      const overlay = screen.getByTestId('bbox-overlay');
      expect(overlay).toHaveClass('absolute');
    });
  });

  // ==========================================================================
  // T016.2.2/3 - Box Rendering Tests
  // ==========================================================================

  describe('T016.2.2/3 - Box Rendering at Correct Positions', () => {
    it('should render a box for each field with bbox', async () => {
      const module = await import('../../../src/renderer/components/BoundingBoxOverlay');
      const { BoundingBoxOverlay: BBO } = module;

      render(<BBO fields={mockFields} scale={1} />);

      mockFields.forEach((field) => {
        expect(screen.getByTestId(`bbox-${field.fieldName}`)).toBeInTheDocument();
      });
    });

    it('should not render box for field without bbox', async () => {
      const module = await import('../../../src/renderer/components/BoundingBoxOverlay');
      const { BoundingBoxOverlay: BBO } = module;

      const fieldsWithMissing: ExtractionField[] = [
        ...mockFields,
        {
          fieldName: 'no_bbox_field',
          value: 'test',
          confidence: 80,
          userVerified: false,
          // No bbox
        },
      ];

      render(<BBO fields={fieldsWithMissing} scale={1} />);

      expect(screen.queryByTestId('bbox-no_bbox_field')).not.toBeInTheDocument();
    });

    it('should position box at correct x coordinate', async () => {
      const module = await import('../../../src/renderer/components/BoundingBoxOverlay');
      const { BoundingBoxOverlay: BBO } = module;

      render(<BBO fields={mockFields} scale={1} />);

      const box = screen.getByTestId('bbox-vendor_rfc');
      expect(box).toHaveStyle({ left: '100px' });
    });

    it('should position box at correct y coordinate', async () => {
      const module = await import('../../../src/renderer/components/BoundingBoxOverlay');
      const { BoundingBoxOverlay: BBO } = module;

      render(<BBO fields={mockFields} scale={1} />);

      const box = screen.getByTestId('bbox-vendor_rfc');
      expect(box).toHaveStyle({ top: '50px' });
    });

    it('should set box width correctly', async () => {
      const module = await import('../../../src/renderer/components/BoundingBoxOverlay');
      const { BoundingBoxOverlay: BBO } = module;

      render(<BBO fields={mockFields} scale={1} />);

      const box = screen.getByTestId('bbox-vendor_rfc');
      expect(box).toHaveStyle({ width: '200px' });
    });

    it('should set box height correctly', async () => {
      const module = await import('../../../src/renderer/components/BoundingBoxOverlay');
      const { BoundingBoxOverlay: BBO } = module;

      render(<BBO fields={mockFields} scale={1} />);

      const box = screen.getByTestId('bbox-vendor_rfc');
      expect(box).toHaveStyle({ height: '20px' });
    });

    it('should scale positions when scale > 1', async () => {
      const module = await import('../../../src/renderer/components/BoundingBoxOverlay');
      const { BoundingBoxOverlay: BBO } = module;

      render(<BBO fields={mockFields} scale={1.5} />);

      const box = screen.getByTestId('bbox-vendor_rfc');
      // 100 * 1.5 = 150
      expect(box).toHaveStyle({ left: '150px' });
      // 50 * 1.5 = 75
      expect(box).toHaveStyle({ top: '75px' });
      // 200 * 1.5 = 300
      expect(box).toHaveStyle({ width: '300px' });
    });

    it('should scale positions when scale < 1', async () => {
      const module = await import('../../../src/renderer/components/BoundingBoxOverlay');
      const { BoundingBoxOverlay: BBO } = module;

      render(<BBO fields={mockFields} scale={0.5} />);

      const box = screen.getByTestId('bbox-vendor_rfc');
      // 100 * 0.5 = 50
      expect(box).toHaveStyle({ left: '50px' });
      // 50 * 0.5 = 25
      expect(box).toHaveStyle({ top: '25px' });
    });
  });

  // ==========================================================================
  // T016.2.4 - Confidence Color Tests
  // ==========================================================================

  describe('T016.2.4 - Color Boxes by Confidence Level', () => {
    describe('T016.2.4.1 - Green for ≥90%', () => {
      it('should have green border for confidence >= 90', async () => {
        const module = await import('../../../src/renderer/components/BoundingBoxOverlay');
        const { BoundingBoxOverlay: BBO } = module;

        const highConfidenceFields = [
          createField('high_conf', 95, { x: 0, y: 0, width: 100, height: 20 }),
        ];

        render(<BBO fields={highConfidenceFields} scale={1} />);

        const box = screen.getByTestId('bbox-high_conf');
        expect(box).toHaveClass('border-green-500');
      });

      it('should have green background with opacity for confidence >= 90', async () => {
        const module = await import('../../../src/renderer/components/BoundingBoxOverlay');
        const { BoundingBoxOverlay: BBO } = module;

        const highConfidenceFields = [
          createField('high_conf', 90, { x: 0, y: 0, width: 100, height: 20 }),
        ];

        render(<BBO fields={highConfidenceFields} scale={1} />);

        const box = screen.getByTestId('bbox-high_conf');
        expect(box).toHaveClass('bg-green-500/20');
      });

      it('should apply green to exactly 90% confidence', async () => {
        const module = await import('../../../src/renderer/components/BoundingBoxOverlay');
        const { BoundingBoxOverlay: BBO } = module;

        const exactlyNinety = [
          createField('exactly_90', 90, { x: 0, y: 0, width: 100, height: 20 }),
        ];

        render(<BBO fields={exactlyNinety} scale={1} />);

        const box = screen.getByTestId('bbox-exactly_90');
        expect(box).toHaveClass('border-green-500');
      });
    });

    describe('T016.2.4.2 - Orange for 70-89%', () => {
      it('should have orange border for confidence 70-89', async () => {
        const module = await import('../../../src/renderer/components/BoundingBoxOverlay');
        const { BoundingBoxOverlay: BBO } = module;

        const mediumConfidenceFields = [
          createField('medium_conf', 85, { x: 0, y: 0, width: 100, height: 20 }),
        ];

        render(<BBO fields={mediumConfidenceFields} scale={1} />);

        const box = screen.getByTestId('bbox-medium_conf');
        expect(box).toHaveClass('border-orange-500');
      });

      it('should have orange background with opacity for confidence 70-89', async () => {
        const module = await import('../../../src/renderer/components/BoundingBoxOverlay');
        const { BoundingBoxOverlay: BBO } = module;

        const mediumConfidenceFields = [
          createField('medium_conf', 75, { x: 0, y: 0, width: 100, height: 20 }),
        ];

        render(<BBO fields={mediumConfidenceFields} scale={1} />);

        const box = screen.getByTestId('bbox-medium_conf');
        expect(box).toHaveClass('bg-orange-500/20');
      });

      it('should apply orange to exactly 70% confidence', async () => {
        const module = await import('../../../src/renderer/components/BoundingBoxOverlay');
        const { BoundingBoxOverlay: BBO } = module;

        const exactlySeventy = [
          createField('exactly_70', 70, { x: 0, y: 0, width: 100, height: 20 }),
        ];

        render(<BBO fields={exactlySeventy} scale={1} />);

        const box = screen.getByTestId('bbox-exactly_70');
        expect(box).toHaveClass('border-orange-500');
      });

      it('should apply orange to 89% confidence (boundary)', async () => {
        const module = await import('../../../src/renderer/components/BoundingBoxOverlay');
        const { BoundingBoxOverlay: BBO } = module;

        const eightyNine = [
          createField('eighty_nine', 89, { x: 0, y: 0, width: 100, height: 20 }),
        ];

        render(<BBO fields={eightyNine} scale={1} />);

        const box = screen.getByTestId('bbox-eighty_nine');
        expect(box).toHaveClass('border-orange-500');
      });
    });

    describe('T016.2.4.3 - Red for <70%', () => {
      it('should have red border for confidence < 70', async () => {
        const module = await import('../../../src/renderer/components/BoundingBoxOverlay');
        const { BoundingBoxOverlay: BBO } = module;

        const lowConfidenceFields = [
          createField('low_conf', 60, { x: 0, y: 0, width: 100, height: 20 }),
        ];

        render(<BBO fields={lowConfidenceFields} scale={1} />);

        const box = screen.getByTestId('bbox-low_conf');
        expect(box).toHaveClass('border-red-500');
      });

      it('should have red background with opacity for confidence < 70', async () => {
        const module = await import('../../../src/renderer/components/BoundingBoxOverlay');
        const { BoundingBoxOverlay: BBO } = module;

        const lowConfidenceFields = [
          createField('low_conf', 45, { x: 0, y: 0, width: 100, height: 20 }),
        ];

        render(<BBO fields={lowConfidenceFields} scale={1} />);

        const box = screen.getByTestId('bbox-low_conf');
        expect(box).toHaveClass('bg-red-500/20');
      });

      it('should apply red to 69% confidence (boundary)', async () => {
        const module = await import('../../../src/renderer/components/BoundingBoxOverlay');
        const { BoundingBoxOverlay: BBO } = module;

        const sixtyNine = [
          createField('sixty_nine', 69, { x: 0, y: 0, width: 100, height: 20 }),
        ];

        render(<BBO fields={sixtyNine} scale={1} />);

        const box = screen.getByTestId('bbox-sixty_nine');
        expect(box).toHaveClass('border-red-500');
      });

      it('should apply red to very low confidence', async () => {
        const module = await import('../../../src/renderer/components/BoundingBoxOverlay');
        const { BoundingBoxOverlay: BBO } = module;

        const veryLow = [
          createField('very_low', 10, { x: 0, y: 0, width: 100, height: 20 }),
        ];

        render(<BBO fields={veryLow} scale={1} />);

        const box = screen.getByTestId('bbox-very_low');
        expect(box).toHaveClass('border-red-500');
      });
    });
  });

  // ==========================================================================
  // T016.2.5 - Hover/Selection Highlight Tests
  // ==========================================================================

  describe('T016.2.5 - Highlight Active Field on Hover/Selection', () => {
    it('should highlight box on hover', async () => {
      const module = await import('../../../src/renderer/components/BoundingBoxOverlay');
      const { BoundingBoxOverlay: BBO } = module;

      render(<BBO fields={mockFields} scale={1} />);

      const box = screen.getByTestId('bbox-vendor_rfc');

      fireEvent.mouseEnter(box);

      expect(box).toHaveClass('ring-2');
    });

    it('should remove highlight on mouse leave', async () => {
      const module = await import('../../../src/renderer/components/BoundingBoxOverlay');
      const { BoundingBoxOverlay: BBO } = module;

      render(<BBO fields={mockFields} scale={1} />);

      const box = screen.getByTestId('bbox-vendor_rfc');

      fireEvent.mouseEnter(box);
      expect(box).toHaveClass('ring-2');

      fireEvent.mouseLeave(box);
      expect(box).not.toHaveClass('ring-2');
    });

    it('should highlight selected field', async () => {
      const module = await import('../../../src/renderer/components/BoundingBoxOverlay');
      const { BoundingBoxOverlay: BBO } = module;

      render(<BBO fields={mockFields} scale={1} selectedField="vendor_name" />);

      const selectedBox = screen.getByTestId('bbox-vendor_name');
      expect(selectedBox).toHaveClass('ring-2');
      expect(selectedBox).toHaveClass('ring-blue-500');
    });

    it('should not highlight non-selected fields', async () => {
      const module = await import('../../../src/renderer/components/BoundingBoxOverlay');
      const { BoundingBoxOverlay: BBO } = module;

      render(<BBO fields={mockFields} scale={1} selectedField="vendor_name" />);

      const otherBox = screen.getByTestId('bbox-vendor_rfc');
      expect(otherBox).not.toHaveClass('ring-blue-500');
    });

    it('should call onFieldClick when box is clicked', async () => {
      const module = await import('../../../src/renderer/components/BoundingBoxOverlay');
      const { BoundingBoxOverlay: BBO } = module;

      const onFieldClick = jest.fn();

      render(<BBO fields={mockFields} scale={1} onFieldClick={onFieldClick} />);

      const box = screen.getByTestId('bbox-vendor_rfc');
      fireEvent.click(box);

      expect(onFieldClick).toHaveBeenCalledWith('vendor_rfc');
    });

    it('should call onFieldHover when box is hovered', async () => {
      const module = await import('../../../src/renderer/components/BoundingBoxOverlay');
      const { BoundingBoxOverlay: BBO } = module;

      const onFieldHover = jest.fn();

      render(<BBO fields={mockFields} scale={1} onFieldHover={onFieldHover} />);

      const box = screen.getByTestId('bbox-vendor_rfc');
      fireEvent.mouseEnter(box);

      expect(onFieldHover).toHaveBeenCalledWith('vendor_rfc');
    });

    it('should call onFieldHover with null when mouse leaves', async () => {
      const module = await import('../../../src/renderer/components/BoundingBoxOverlay');
      const { BoundingBoxOverlay: BBO } = module;

      const onFieldHover = jest.fn();

      render(<BBO fields={mockFields} scale={1} onFieldHover={onFieldHover} />);

      const box = screen.getByTestId('bbox-vendor_rfc');
      fireEvent.mouseEnter(box);
      fireEvent.mouseLeave(box);

      expect(onFieldHover).toHaveBeenLastCalledWith(null);
    });

    it('should show tooltip with field name on hover', async () => {
      const module = await import('../../../src/renderer/components/BoundingBoxOverlay');
      const { BoundingBoxOverlay: BBO } = module;

      render(<BBO fields={mockFields} scale={1} showTooltip />);

      const box = screen.getByTestId('bbox-vendor_rfc');
      fireEvent.mouseEnter(box);

      expect(screen.getByTestId('bbox-tooltip')).toBeInTheDocument();
      expect(screen.getByTestId('bbox-tooltip')).toHaveTextContent('vendor_rfc');
    });
  });

  // ==========================================================================
  // Tailwind Styling Tests
  // ==========================================================================

  describe('Tailwind Styling', () => {
    it('should have border on boxes', async () => {
      const module = await import('../../../src/renderer/components/BoundingBoxOverlay');
      const { BoundingBoxOverlay: BBO } = module;

      render(<BBO fields={mockFields} scale={1} />);

      const box = screen.getByTestId('bbox-vendor_rfc');
      expect(box).toHaveClass('border-2');
    });

    it('should have pointer cursor on boxes', async () => {
      const module = await import('../../../src/renderer/components/BoundingBoxOverlay');
      const { BoundingBoxOverlay: BBO } = module;

      render(<BBO fields={mockFields} scale={1} />);

      const box = screen.getByTestId('bbox-vendor_rfc');
      expect(box).toHaveClass('cursor-pointer');
    });

    it('should have transition for smooth hover effects', async () => {
      const module = await import('../../../src/renderer/components/BoundingBoxOverlay');
      const { BoundingBoxOverlay: BBO } = module;

      render(<BBO fields={mockFields} scale={1} />);

      const box = screen.getByTestId('bbox-vendor_rfc');
      expect(box).toHaveClass('transition-all');
    });

    it('should position boxes absolutely within overlay', async () => {
      const module = await import('../../../src/renderer/components/BoundingBoxOverlay');
      const { BoundingBoxOverlay: BBO } = module;

      render(<BBO fields={mockFields} scale={1} />);

      const box = screen.getByTestId('bbox-vendor_rfc');
      expect(box).toHaveClass('absolute');
    });
  });

  // ==========================================================================
  // Edge Cases
  // ==========================================================================

  describe('Edge Cases', () => {
    it('should handle empty fields array', async () => {
      const module = await import('../../../src/renderer/components/BoundingBoxOverlay');
      const { BoundingBoxOverlay: BBO } = module;

      expect(() => {
        render(<BBO fields={[]} scale={1} />);
      }).not.toThrow();

      expect(screen.getByTestId('bbox-overlay')).toBeInTheDocument();
    });

    it('should handle zero confidence', async () => {
      const module = await import('../../../src/renderer/components/BoundingBoxOverlay');
      const { BoundingBoxOverlay: BBO } = module;

      const zeroConf = [
        createField('zero_conf', 0, { x: 0, y: 0, width: 100, height: 20 }),
      ];

      render(<BBO fields={zeroConf} scale={1} />);

      const box = screen.getByTestId('bbox-zero_conf');
      expect(box).toHaveClass('border-red-500');
    });

    it('should handle 100% confidence', async () => {
      const module = await import('../../../src/renderer/components/BoundingBoxOverlay');
      const { BoundingBoxOverlay: BBO } = module;

      const perfectConf = [
        createField('perfect_conf', 100, { x: 0, y: 0, width: 100, height: 20 }),
      ];

      render(<BBO fields={perfectConf} scale={1} />);

      const box = screen.getByTestId('bbox-perfect_conf');
      expect(box).toHaveClass('border-green-500');
    });
  });
});
