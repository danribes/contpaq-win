/**
 * StatusBar Component
 *
 * Displays the status of AI Service and Windows Bridge services,
 * along with the connected company name if available.
 *
 * Uses Tailwind CSS for styling.
 */

import React from 'react';
import type { ServiceStatus } from '../types';

/**
 * Props for the StatusBar component
 */
export interface StatusBarProps {
  /** Current status of the AI Service */
  aiStatus: ServiceStatus;
  /** Current status of the Windows Bridge service */
  bridgeStatus: ServiceStatus;
  /** Name of the connected company (optional) */
  companyName?: string;
}

/**
 * Maps service status to display text (Spanish)
 */
function getStatusText(status: ServiceStatus): string {
  switch (status) {
    case 'running':
      return 'Activo';
    case 'starting':
      return 'Iniciando...';
    case 'stopping':
      return 'Deteniendo...';
    case 'stopped':
      return 'Detenido';
    case 'error':
      return 'Error';
    default:
      return 'Desconocido';
  }
}

/**
 * Maps service status to indicator color (Tailwind class)
 */
function getStatusColor(status: ServiceStatus): string {
  switch (status) {
    case 'running':
      return 'bg-green-500';
    case 'starting':
    case 'stopping':
      return 'bg-yellow-400';
    case 'error':
      return 'bg-red-500';
    case 'stopped':
    default:
      return 'bg-gray-400';
  }
}

/**
 * Status indicator component showing a colored dot
 */
interface StatusIndicatorProps {
  status: ServiceStatus;
  testId: string;
}

function StatusIndicator({ status, testId }: StatusIndicatorProps): JSX.Element {
  return (
    <span
      data-testid={testId}
      className={`w-2 h-2 rounded-full ${getStatusColor(status)}`}
    />
  );
}

/**
 * StatusBar component that displays service status and company info
 *
 * @example
 * ```tsx
 * <StatusBar
 *   aiStatus="running"
 *   bridgeStatus="running"
 *   companyName="Mi Empresa S.A."
 * />
 * ```
 */
export function StatusBar({
  aiStatus,
  bridgeStatus,
  companyName,
}: StatusBarProps): JSX.Element {
  return (
    <div className="bg-white border-t border-gray-200 px-4 py-2">
      <div className="flex items-center justify-between max-w-7xl mx-auto text-sm text-gray-500">
        {/* Service Status Items */}
        <div
          data-testid="status-items"
          className="flex items-center space-x-4"
        >
          {/* AI Service Status */}
          <span className="flex items-center space-x-2">
            <StatusIndicator status={aiStatus} testId="ai-status-indicator" />
            <span>AI Service: {getStatusText(aiStatus)}</span>
          </span>

          {/* Bridge Service Status */}
          <span className="flex items-center space-x-2">
            <StatusIndicator status={bridgeStatus} testId="bridge-status-indicator" />
            <span>Bridge: {getStatusText(bridgeStatus)}</span>
          </span>

          {/* Company Name (if connected) */}
          {companyName && companyName.length > 0 && (
            <span
              data-testid="company-name"
              className="flex items-center space-x-2 border-l border-gray-300 pl-4"
            >
              <svg
                className="w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
              <span className="font-medium text-gray-700">{companyName}</span>
            </span>
          )}
        </div>

        {/* Version Info */}
        <div>
          <span>v0.1.0</span>
        </div>
      </div>
    </div>
  );
}

export default StatusBar;
