/**
 * T010.1.1 StatusBar Component Tests
 *
 * Tests for the StatusBar UI component that displays service status
 * and company connection information.
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// Import will be created in T010.1.2
// eslint-disable-next-line @typescript-eslint/no-unused-vars
let StatusBar: typeof import('../../../src/renderer/components/StatusBar').StatusBar;

// Mock type for status props
interface StatusBarProps {
  aiStatus: 'stopped' | 'starting' | 'running' | 'stopping' | 'error';
  bridgeStatus: 'stopped' | 'starting' | 'running' | 'stopping' | 'error';
  companyName?: string;
}

describe('T010.1 - StatusBar Component', () => {
  // ==========================================================================
  // T010.1.1 - Class Structure Tests
  // ==========================================================================

  describe('T010.1.1 - Component Structure', () => {
    it('should export StatusBar component', async () => {
      const module = await import('../../../src/renderer/components/StatusBar');
      expect(module.StatusBar).toBeDefined();
      expect(typeof module.StatusBar).toBe('function');
    });

    it('should render without crashing', async () => {
      const module = await import('../../../src/renderer/components/StatusBar');
      const { StatusBar: SB } = module;

      expect(() => {
        render(<SB aiStatus="stopped" bridgeStatus="stopped" />);
      }).not.toThrow();
    });
  });

  // ==========================================================================
  // T010.1.3 - AI Service Status Display
  // ==========================================================================

  describe('T010.1.3 - AI Service Status Display', () => {
    it('should display AI service label', async () => {
      const module = await import('../../../src/renderer/components/StatusBar');
      const { StatusBar: SB } = module;

      render(<SB aiStatus="running" bridgeStatus="stopped" />);

      expect(screen.getByText(/AI Service/i)).toBeInTheDocument();
    });

    it('should display "Detenido" when AI status is stopped', async () => {
      const module = await import('../../../src/renderer/components/StatusBar');
      const { StatusBar: SB } = module;

      render(<SB aiStatus="stopped" bridgeStatus="running" />);

      // AI should show "Detenido", Bridge shows "Activo"
      expect(screen.getByText(/AI Service: Detenido/i)).toBeInTheDocument();
    });

    it('should display "Iniciando..." when AI status is starting', async () => {
      const module = await import('../../../src/renderer/components/StatusBar');
      const { StatusBar: SB } = module;

      render(<SB aiStatus="starting" bridgeStatus="stopped" />);

      expect(screen.getByText(/Iniciando/i)).toBeInTheDocument();
    });

    it('should display "Activo" when AI status is running', async () => {
      const module = await import('../../../src/renderer/components/StatusBar');
      const { StatusBar: SB } = module;

      render(<SB aiStatus="running" bridgeStatus="stopped" />);

      expect(screen.getByText(/Activo/i)).toBeInTheDocument();
    });

    it('should display "Deteniendo..." when AI status is stopping', async () => {
      const module = await import('../../../src/renderer/components/StatusBar');
      const { StatusBar: SB } = module;

      render(<SB aiStatus="stopping" bridgeStatus="stopped" />);

      expect(screen.getByText(/Deteniendo/i)).toBeInTheDocument();
    });

    it('should display "Error" when AI status is error', async () => {
      const module = await import('../../../src/renderer/components/StatusBar');
      const { StatusBar: SB } = module;

      render(<SB aiStatus="error" bridgeStatus="stopped" />);

      expect(screen.getByText(/Error/i)).toBeInTheDocument();
    });

    it('should show green indicator when AI is running', async () => {
      const module = await import('../../../src/renderer/components/StatusBar');
      const { StatusBar: SB } = module;

      render(<SB aiStatus="running" bridgeStatus="stopped" />);

      const indicator = screen.getByTestId('ai-status-indicator');
      expect(indicator).toHaveClass('bg-green-500');
    });

    it('should show yellow indicator when AI is starting', async () => {
      const module = await import('../../../src/renderer/components/StatusBar');
      const { StatusBar: SB } = module;

      render(<SB aiStatus="starting" bridgeStatus="stopped" />);

      const indicator = screen.getByTestId('ai-status-indicator');
      expect(indicator).toHaveClass('bg-yellow-400');
    });

    it('should show red indicator when AI has error', async () => {
      const module = await import('../../../src/renderer/components/StatusBar');
      const { StatusBar: SB } = module;

      render(<SB aiStatus="error" bridgeStatus="stopped" />);

      const indicator = screen.getByTestId('ai-status-indicator');
      expect(indicator).toHaveClass('bg-red-500');
    });

    it('should show gray indicator when AI is stopped', async () => {
      const module = await import('../../../src/renderer/components/StatusBar');
      const { StatusBar: SB } = module;

      render(<SB aiStatus="stopped" bridgeStatus="stopped" />);

      const indicator = screen.getByTestId('ai-status-indicator');
      expect(indicator).toHaveClass('bg-gray-400');
    });
  });

  // ==========================================================================
  // T010.1.4 - Bridge Status Display
  // ==========================================================================

  describe('T010.1.4 - Bridge Status Display', () => {
    it('should display Bridge service label', async () => {
      const module = await import('../../../src/renderer/components/StatusBar');
      const { StatusBar: SB } = module;

      render(<SB aiStatus="stopped" bridgeStatus="running" />);

      expect(screen.getByText(/Bridge/i)).toBeInTheDocument();
    });

    it('should display "Activo" when Bridge status is running', async () => {
      const module = await import('../../../src/renderer/components/StatusBar');
      const { StatusBar: SB } = module;

      render(<SB aiStatus="stopped" bridgeStatus="running" />);

      // Use getAllByText since both services can show "Activo"
      const activeTexts = screen.getAllByText(/Activo/i);
      expect(activeTexts.length).toBeGreaterThanOrEqual(1);
    });

    it('should show green indicator when Bridge is running', async () => {
      const module = await import('../../../src/renderer/components/StatusBar');
      const { StatusBar: SB } = module;

      render(<SB aiStatus="stopped" bridgeStatus="running" />);

      const indicator = screen.getByTestId('bridge-status-indicator');
      expect(indicator).toHaveClass('bg-green-500');
    });

    it('should show yellow indicator when Bridge is starting', async () => {
      const module = await import('../../../src/renderer/components/StatusBar');
      const { StatusBar: SB } = module;

      render(<SB aiStatus="stopped" bridgeStatus="starting" />);

      const indicator = screen.getByTestId('bridge-status-indicator');
      expect(indicator).toHaveClass('bg-yellow-400');
    });

    it('should show red indicator when Bridge has error', async () => {
      const module = await import('../../../src/renderer/components/StatusBar');
      const { StatusBar: SB } = module;

      render(<SB aiStatus="stopped" bridgeStatus="error" />);

      const indicator = screen.getByTestId('bridge-status-indicator');
      expect(indicator).toHaveClass('bg-red-500');
    });
  });

  // ==========================================================================
  // T010.1.5 - Company Name Display
  // ==========================================================================

  describe('T010.1.5 - Company Name Display', () => {
    it('should display company name when provided', async () => {
      const module = await import('../../../src/renderer/components/StatusBar');
      const { StatusBar: SB } = module;

      render(
        <SB
          aiStatus="running"
          bridgeStatus="running"
          companyName="Empresa de Prueba S.A. de C.V."
        />
      );

      expect(screen.getByText(/Empresa de Prueba/i)).toBeInTheDocument();
    });

    it('should not display company section when not provided', async () => {
      const module = await import('../../../src/renderer/components/StatusBar');
      const { StatusBar: SB } = module;

      render(<SB aiStatus="running" bridgeStatus="running" />);

      expect(screen.queryByTestId('company-name')).not.toBeInTheDocument();
    });

    it('should not display company section when empty string', async () => {
      const module = await import('../../../src/renderer/components/StatusBar');
      const { StatusBar: SB } = module;

      render(<SB aiStatus="running" bridgeStatus="running" companyName="" />);

      expect(screen.queryByTestId('company-name')).not.toBeInTheDocument();
    });

    it('should display company icon when company name provided', async () => {
      const module = await import('../../../src/renderer/components/StatusBar');
      const { StatusBar: SB } = module;

      render(
        <SB
          aiStatus="running"
          bridgeStatus="running"
          companyName="Test Company"
        />
      );

      const companySection = screen.getByTestId('company-name');
      expect(companySection).toBeInTheDocument();
    });
  });

  // ==========================================================================
  // Combined Status Tests
  // ==========================================================================

  describe('Combined Status Display', () => {
    it('should display both services as running', async () => {
      const module = await import('../../../src/renderer/components/StatusBar');
      const { StatusBar: SB } = module;

      render(<SB aiStatus="running" bridgeStatus="running" />);

      const aiIndicator = screen.getByTestId('ai-status-indicator');
      const bridgeIndicator = screen.getByTestId('bridge-status-indicator');

      expect(aiIndicator).toHaveClass('bg-green-500');
      expect(bridgeIndicator).toHaveClass('bg-green-500');
    });

    it('should display mixed status correctly', async () => {
      const module = await import('../../../src/renderer/components/StatusBar');
      const { StatusBar: SB } = module;

      render(<SB aiStatus="running" bridgeStatus="error" />);

      const aiIndicator = screen.getByTestId('ai-status-indicator');
      const bridgeIndicator = screen.getByTestId('bridge-status-indicator');

      expect(aiIndicator).toHaveClass('bg-green-500');
      expect(bridgeIndicator).toHaveClass('bg-red-500');
    });

    it('should display all elements together', async () => {
      const module = await import('../../../src/renderer/components/StatusBar');
      const { StatusBar: SB } = module;

      render(
        <SB
          aiStatus="running"
          bridgeStatus="running"
          companyName="Mi Empresa"
        />
      );

      expect(screen.getByText(/AI Service/i)).toBeInTheDocument();
      expect(screen.getByText(/Bridge/i)).toBeInTheDocument();
      expect(screen.getByText(/Mi Empresa/i)).toBeInTheDocument();
    });
  });

  // ==========================================================================
  // Styling Tests (Tailwind)
  // ==========================================================================

  describe('Tailwind Styling', () => {
    it('should have status bar container styles', async () => {
      const module = await import('../../../src/renderer/components/StatusBar');
      const { StatusBar: SB } = module;

      const { container } = render(<SB aiStatus="running" bridgeStatus="running" />);

      const statusBar = container.firstChild as HTMLElement;
      expect(statusBar).toHaveClass('bg-white');
      expect(statusBar).toHaveClass('border-t');
    });

    it('should have proper spacing between status items', async () => {
      const module = await import('../../../src/renderer/components/StatusBar');
      const { StatusBar: SB } = module;

      render(<SB aiStatus="running" bridgeStatus="running" />);

      const statusContainer = screen.getByTestId('status-items');
      expect(statusContainer).toHaveClass('space-x-4');
    });

    it('should have indicator as rounded circle', async () => {
      const module = await import('../../../src/renderer/components/StatusBar');
      const { StatusBar: SB } = module;

      render(<SB aiStatus="running" bridgeStatus="running" />);

      const indicator = screen.getByTestId('ai-status-indicator');
      expect(indicator).toHaveClass('rounded-full');
    });
  });
});
