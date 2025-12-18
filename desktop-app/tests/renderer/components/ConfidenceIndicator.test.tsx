/**
 * T018.1 - ConfidenceIndicator Component Tests
 *
 * Tests for the confidence indicator that:
 * - Creates ConfidenceIndicator.tsx component
 * - Displays colored dot (green/orange/red)
 * - Shows percentage on hover
 * - Adds tooltip with confidence explanation
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

// Will be created in T018.1.2
let ConfidenceIndicator: typeof import('../../../src/renderer/components/ConfidenceIndicator').ConfidenceIndicator;

describe('T018.1 - ConfidenceIndicator Component', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    const module = await import('../../../src/renderer/components/ConfidenceIndicator');
    ConfidenceIndicator = module.ConfidenceIndicator;
  });

  // ==========================================================================
  // T018.1.1 - Component Structure Tests
  // ==========================================================================

  describe('T018.1.1 - Component Structure', () => {
    it('should export ConfidenceIndicator component', async () => {
      const module = await import('../../../src/renderer/components/ConfidenceIndicator');
      expect(module.ConfidenceIndicator).toBeDefined();
      expect(typeof module.ConfidenceIndicator).toBe('function');
    });

    it('should render without crashing', () => {
      expect(() => {
        render(<ConfidenceIndicator confidence={85} />);
      }).not.toThrow();
    });

    it('should render indicator container', () => {
      render(<ConfidenceIndicator confidence={85} />);
      expect(screen.getByTestId('confidence-indicator')).toBeInTheDocument();
    });

    it('should render colored dot', () => {
      render(<ConfidenceIndicator confidence={85} />);
      expect(screen.getByTestId('confidence-dot')).toBeInTheDocument();
    });

    it('should accept confidence prop as number 0-100', () => {
      expect(() => {
        render(<ConfidenceIndicator confidence={0} />);
      }).not.toThrow();

      expect(() => {
        render(<ConfidenceIndicator confidence={100} />);
      }).not.toThrow();
    });
  });

  // ==========================================================================
  // T018.1.2 - Green (High Confidence) Tests - >= 90%
  // ==========================================================================

  describe('T018.1.2 - Green Indicator (High Confidence)', () => {
    it('should display green dot for 100% confidence', () => {
      render(<ConfidenceIndicator confidence={100} />);
      const dot = screen.getByTestId('confidence-dot');
      expect(dot).toHaveClass('bg-green-500');
    });

    it('should display green dot for 95% confidence', () => {
      render(<ConfidenceIndicator confidence={95} />);
      const dot = screen.getByTestId('confidence-dot');
      expect(dot).toHaveClass('bg-green-500');
    });

    it('should display green dot for exactly 90% confidence', () => {
      render(<ConfidenceIndicator confidence={90} />);
      const dot = screen.getByTestId('confidence-dot');
      expect(dot).toHaveClass('bg-green-500');
    });

    it('should show "Alto" level text for high confidence', () => {
      render(<ConfidenceIndicator confidence={95} showLabel />);
      expect(screen.getByText('Alto')).toBeInTheDocument();
    });
  });

  // ==========================================================================
  // T018.1.3 - Orange (Medium Confidence) Tests - 70-89%
  // ==========================================================================

  describe('T018.1.3 - Orange Indicator (Medium Confidence)', () => {
    it('should display orange dot for 89% confidence', () => {
      render(<ConfidenceIndicator confidence={89} />);
      const dot = screen.getByTestId('confidence-dot');
      expect(dot).toHaveClass('bg-orange-500');
    });

    it('should display orange dot for 80% confidence', () => {
      render(<ConfidenceIndicator confidence={80} />);
      const dot = screen.getByTestId('confidence-dot');
      expect(dot).toHaveClass('bg-orange-500');
    });

    it('should display orange dot for exactly 70% confidence', () => {
      render(<ConfidenceIndicator confidence={70} />);
      const dot = screen.getByTestId('confidence-dot');
      expect(dot).toHaveClass('bg-orange-500');
    });

    it('should show "Medio" level text for medium confidence', () => {
      render(<ConfidenceIndicator confidence={80} showLabel />);
      expect(screen.getByText('Medio')).toBeInTheDocument();
    });
  });

  // ==========================================================================
  // T018.1.4 - Red (Low Confidence) Tests - < 70%
  // ==========================================================================

  describe('T018.1.4 - Red Indicator (Low Confidence)', () => {
    it('should display red dot for 69% confidence', () => {
      render(<ConfidenceIndicator confidence={69} />);
      const dot = screen.getByTestId('confidence-dot');
      expect(dot).toHaveClass('bg-red-500');
    });

    it('should display red dot for 50% confidence', () => {
      render(<ConfidenceIndicator confidence={50} />);
      const dot = screen.getByTestId('confidence-dot');
      expect(dot).toHaveClass('bg-red-500');
    });

    it('should display red dot for 0% confidence', () => {
      render(<ConfidenceIndicator confidence={0} />);
      const dot = screen.getByTestId('confidence-dot');
      expect(dot).toHaveClass('bg-red-500');
    });

    it('should show "Bajo" level text for low confidence', () => {
      render(<ConfidenceIndicator confidence={50} showLabel />);
      expect(screen.getByText('Bajo')).toBeInTheDocument();
    });
  });

  // ==========================================================================
  // T018.1.5 - Percentage Display Tests
  // ==========================================================================

  describe('T018.1.5 - Percentage Display', () => {
    it('should show percentage when showPercentage is true', () => {
      render(<ConfidenceIndicator confidence={85} showPercentage />);
      expect(screen.getByText('85%')).toBeInTheDocument();
    });

    it('should not show percentage by default', () => {
      render(<ConfidenceIndicator confidence={85} />);
      expect(screen.queryByText('85%')).not.toBeInTheDocument();
    });

    it('should show 100% correctly', () => {
      render(<ConfidenceIndicator confidence={100} showPercentage />);
      expect(screen.getByText('100%')).toBeInTheDocument();
    });

    it('should show 0% correctly', () => {
      render(<ConfidenceIndicator confidence={0} showPercentage />);
      expect(screen.getByText('0%')).toBeInTheDocument();
    });

    it('should round decimal percentages', () => {
      render(<ConfidenceIndicator confidence={85.7} showPercentage />);
      expect(screen.getByText('86%')).toBeInTheDocument();
    });
  });

  // ==========================================================================
  // Tooltip Tests
  // ==========================================================================

  describe('Tooltip on Hover', () => {
    it('should show tooltip on hover', async () => {
      render(<ConfidenceIndicator confidence={85} />);
      const indicator = screen.getByTestId('confidence-indicator');

      fireEvent.mouseEnter(indicator);

      await waitFor(() => {
        expect(screen.getByTestId('confidence-tooltip')).toBeInTheDocument();
      });
    });

    it('should hide tooltip on mouse leave', async () => {
      render(<ConfidenceIndicator confidence={85} />);
      const indicator = screen.getByTestId('confidence-indicator');

      fireEvent.mouseEnter(indicator);
      await waitFor(() => {
        expect(screen.getByTestId('confidence-tooltip')).toBeInTheDocument();
      });

      fireEvent.mouseLeave(indicator);
      await waitFor(() => {
        expect(screen.queryByTestId('confidence-tooltip')).not.toBeInTheDocument();
      });
    });

    it('should show percentage in tooltip', async () => {
      render(<ConfidenceIndicator confidence={85} />);
      const indicator = screen.getByTestId('confidence-indicator');

      fireEvent.mouseEnter(indicator);

      await waitFor(() => {
        const tooltip = screen.getByTestId('confidence-tooltip');
        expect(tooltip).toHaveTextContent('85%');
      });
    });

    it('should show explanation for high confidence in tooltip', async () => {
      render(<ConfidenceIndicator confidence={95} />);
      const indicator = screen.getByTestId('confidence-indicator');

      fireEvent.mouseEnter(indicator);

      await waitFor(() => {
        const tooltip = screen.getByTestId('confidence-tooltip');
        expect(tooltip).toHaveTextContent(/alta|confiable/i);
      });
    });

    it('should show explanation for medium confidence in tooltip', async () => {
      render(<ConfidenceIndicator confidence={80} />);
      const indicator = screen.getByTestId('confidence-indicator');

      fireEvent.mouseEnter(indicator);

      await waitFor(() => {
        const tooltip = screen.getByTestId('confidence-tooltip');
        expect(tooltip).toHaveTextContent(/revisar|verificar/i);
      });
    });

    it('should show explanation for low confidence in tooltip', async () => {
      render(<ConfidenceIndicator confidence={50} />);
      const indicator = screen.getByTestId('confidence-indicator');

      fireEvent.mouseEnter(indicator);

      await waitFor(() => {
        const tooltip = screen.getByTestId('confidence-tooltip');
        expect(tooltip).toHaveTextContent(/baja|verificación/i);
      });
    });
  });

  // ==========================================================================
  // Size Variants Tests
  // ==========================================================================

  describe('Size Variants', () => {
    it('should render small size by default', () => {
      render(<ConfidenceIndicator confidence={85} />);
      const dot = screen.getByTestId('confidence-dot');
      expect(dot).toHaveClass('w-2');
      expect(dot).toHaveClass('h-2');
    });

    it('should render medium size when specified', () => {
      render(<ConfidenceIndicator confidence={85} size="md" />);
      const dot = screen.getByTestId('confidence-dot');
      expect(dot).toHaveClass('w-3');
      expect(dot).toHaveClass('h-3');
    });

    it('should render large size when specified', () => {
      render(<ConfidenceIndicator confidence={85} size="lg" />);
      const dot = screen.getByTestId('confidence-dot');
      expect(dot).toHaveClass('w-4');
      expect(dot).toHaveClass('h-4');
    });
  });

  // ==========================================================================
  // Tailwind Styling Tests
  // ==========================================================================

  describe('Tailwind Styling', () => {
    it('should have rounded dot', () => {
      render(<ConfidenceIndicator confidence={85} />);
      const dot = screen.getByTestId('confidence-dot');
      expect(dot).toHaveClass('rounded-full');
    });

    it('should have inline-flex container', () => {
      render(<ConfidenceIndicator confidence={85} />);
      const container = screen.getByTestId('confidence-indicator');
      expect(container).toHaveClass('inline-flex');
    });

    it('should have items aligned center', () => {
      render(<ConfidenceIndicator confidence={85} />);
      const container = screen.getByTestId('confidence-indicator');
      expect(container).toHaveClass('items-center');
    });

    it('should have gap between dot and text', () => {
      render(<ConfidenceIndicator confidence={85} showPercentage />);
      const container = screen.getByTestId('confidence-indicator');
      expect(container).toHaveClass('gap-1');
    });

    it('should have cursor pointer for hover interaction', () => {
      render(<ConfidenceIndicator confidence={85} />);
      const container = screen.getByTestId('confidence-indicator');
      expect(container).toHaveClass('cursor-pointer');
    });

    it('should position tooltip absolutely', async () => {
      render(<ConfidenceIndicator confidence={85} />);
      const indicator = screen.getByTestId('confidence-indicator');

      fireEvent.mouseEnter(indicator);

      await waitFor(() => {
        const tooltip = screen.getByTestId('confidence-tooltip');
        expect(tooltip).toHaveClass('absolute');
      });
    });
  });

  // ==========================================================================
  // Edge Cases Tests
  // ==========================================================================

  describe('Edge Cases', () => {
    it('should handle boundary value 89.9 (rounds to 90 = high)', () => {
      render(<ConfidenceIndicator confidence={89.9} />);
      const dot = screen.getByTestId('confidence-dot');
      // 89.9 rounds to 90, which is >= 90 (high)
      expect(dot).toHaveClass('bg-green-500');
    });

    it('should handle boundary value 69.9 (rounds to 70 = medium)', () => {
      render(<ConfidenceIndicator confidence={69.9} />);
      const dot = screen.getByTestId('confidence-dot');
      // 69.9 rounds to 70, which is >= 70 (medium)
      expect(dot).toHaveClass('bg-orange-500');
    });

    it('should handle negative confidence as 0', () => {
      render(<ConfidenceIndicator confidence={-5} />);
      const dot = screen.getByTestId('confidence-dot');
      expect(dot).toHaveClass('bg-red-500');
    });

    it('should handle confidence > 100 as 100', () => {
      render(<ConfidenceIndicator confidence={150} showPercentage />);
      expect(screen.getByText('100%')).toBeInTheDocument();
    });
  });

  // ==========================================================================
  // Accessibility Tests
  // ==========================================================================

  describe('Accessibility', () => {
    it('should have aria-label on container', () => {
      render(<ConfidenceIndicator confidence={85} />);
      const container = screen.getByTestId('confidence-indicator');
      expect(container).toHaveAttribute('aria-label');
    });

    it('should include confidence level in aria-label', () => {
      render(<ConfidenceIndicator confidence={95} />);
      const container = screen.getByTestId('confidence-indicator');
      expect(container.getAttribute('aria-label')).toMatch(/95|alto|high/i);
    });
  });
});
