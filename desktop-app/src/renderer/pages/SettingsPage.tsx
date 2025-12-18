/**
 * SettingsPage Component
 *
 * Settings page displaying:
 * - Company selection dropdown
 * - Service status indicators
 * - About/version information
 *
 * Uses Tailwind CSS for styling.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import type { ServiceStatus } from '../types';

/**
 * Company data structure
 */
interface Company {
  id: string;
  name: string;
  rfc: string;
}

/**
 * App configuration data structure
 */
interface AppConfig {
  version: string;
  platform: string;
  arch: string;
  userDataPath: string;
  isPackaged: boolean;
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
 * Maps platform to display text
 */
function getPlatformText(platform: string): string {
  switch (platform) {
    case 'win32':
      return 'Windows';
    case 'darwin':
      return 'macOS';
    case 'linux':
      return 'Linux';
    default:
      return platform;
  }
}

/**
 * Back Arrow Icon
 */
function BackIcon(): JSX.Element {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
    </svg>
  );
}

/**
 * Refresh Icon
 */
function RefreshIcon(): JSX.Element {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  );
}

/**
 * Chevron Down Icon for dropdown
 */
function ChevronDownIcon(): JSX.Element {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  );
}

/**
 * Status indicator component
 */
interface StatusIndicatorProps {
  status: ServiceStatus;
  testId: string;
}

function StatusIndicator({ status, testId }: StatusIndicatorProps): JSX.Element {
  return (
    <span
      data-testid={testId}
      className={`w-3 h-3 rounded-full ${getStatusColor(status)}`}
    />
  );
}

/**
 * Section Card component
 */
interface SectionCardProps {
  testId: string;
  title: string;
  children: React.ReactNode;
}

function SectionCard({ testId, title, children }: SectionCardProps): JSX.Element {
  return (
    <div
      data-testid={testId}
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
    >
      <h2 className="text-lg font-semibold text-gray-900 mb-4">{title}</h2>
      {children}
    </div>
  );
}

/**
 * Company Dropdown component
 */
interface CompanyDropdownProps {
  companies: Company[];
  selectedCompany: Company | null;
  onSelect: (company: Company) => void;
  loading: boolean;
  error: string | null;
}

function CompanyDropdown({
  companies,
  selectedCompany,
  onSelect,
  loading,
  error,
}: CompanyDropdownProps): JSX.Element {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (company: Company) => {
    onSelect(company);
    setIsOpen(false);
  };

  if (error) {
    return (
      <div className="text-red-600 text-sm">
        Error: {error}
      </div>
    );
  }

  if (companies.length === 0 && !loading) {
    return (
      <div className="text-gray-500 text-sm">
        No hay empresas disponibles
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        data-testid="company-dropdown"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-2 text-left bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
      >
        <span className={selectedCompany ? 'text-gray-900' : 'text-gray-500'}>
          {loading
            ? 'Cargando...'
            : selectedCompany?.name || 'Seleccionar empresa'}
        </span>
        <ChevronDownIcon />
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
          {companies.map((company) => (
            <button
              key={company.id}
              onClick={() => handleSelect(company)}
              className={`w-full px-4 py-2 text-left hover:bg-gray-100 ${
                selectedCompany?.id === company.id ? 'bg-primary-50 text-primary-700' : 'text-gray-900'
              }`}
            >
              <div className="font-medium">{company.name}</div>
              <div className="text-sm text-gray-500">{company.rfc}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * SettingsPage component
 */
export function SettingsPage(): JSX.Element {
  // Service status state
  const [aiStatus, setAiStatus] = useState<ServiceStatus>('starting');
  const [bridgeStatus, setBridgeStatus] = useState<ServiceStatus>('starting');

  // Company state
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [companiesLoading, setCompaniesLoading] = useState(true);
  const [companiesError, setCompaniesError] = useState<string | null>(null);

  // App config state
  const [appConfig, setAppConfig] = useState<AppConfig | null>(null);

  /**
   * Fetch service status
   */
  const fetchServiceStatus = useCallback(async () => {
    try {
      const aiResponse = await window.electronAPI.invoke('ai:get-status') as { status: ServiceStatus } | null;
      if (aiResponse) {
        setAiStatus(aiResponse.status);
      }
    } catch {
      setAiStatus('error');
    }

    try {
      const bridgeResponse = await window.electronAPI.invoke('bridge:check-health') as { status: ServiceStatus; company?: string } | null;
      if (bridgeResponse) {
        setBridgeStatus(bridgeResponse.status);
        // If we have a company name from bridge, try to match it with our companies list
        if (bridgeResponse.company) {
          const matchedCompany = companies.find(c => c.name.includes(bridgeResponse.company!));
          if (matchedCompany && !selectedCompany) {
            setSelectedCompany(matchedCompany);
          }
        }
      }
    } catch {
      setBridgeStatus('error');
    }
  }, [companies, selectedCompany]);

  /**
   * Fetch companies
   */
  const fetchCompanies = useCallback(async () => {
    setCompaniesLoading(true);
    setCompaniesError(null);

    try {
      const response = await window.electronAPI.invoke('bridge:get-companies') as { success: boolean; companies?: Company[]; error?: string };

      if (response?.success && response.companies) {
        setCompanies(response.companies);
      } else {
        setCompaniesError(response?.error || 'Error al cargar empresas');
      }
    } catch {
      setCompaniesError('Error de conexión');
    } finally {
      setCompaniesLoading(false);
    }
  }, []);

  /**
   * Fetch app config
   */
  const fetchAppConfig = useCallback(async () => {
    try {
      const config = await window.electronAPI.invoke('app:get-config') as AppConfig;
      setAppConfig(config);
    } catch {
      // Silently fail
    }
  }, []);

  /**
   * Handle company selection
   */
  const handleCompanySelect = async (company: Company) => {
    setSelectedCompany(company);
    try {
      await window.electronAPI.invoke('bridge:set-company', { id: company.id });
    } catch {
      // Handle error silently or show notification
    }
  };

  /**
   * Handle refresh button click
   */
  const handleRefresh = () => {
    fetchServiceStatus();
  };

  // Initial fetch on mount
  useEffect(() => {
    fetchServiceStatus();
    fetchCompanies();
    fetchAppConfig();
  }, [fetchServiceStatus, fetchCompanies, fetchAppConfig]);

  return (
    <div
      data-testid="settings-page"
      className="min-h-full bg-gray-50"
    >
      {/* Page Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center space-x-4">
            <Link
              to="/"
              data-testid="back-to-home"
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
            >
              <BackIcon />
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Configuración</h1>
          </div>
        </div>
      </header>

      {/* Settings Content */}
      <div data-testid="settings-content" className="max-w-3xl mx-auto p-4 space-y-6">
        {/* Company Section */}
        <SectionCard testId="company-section" title="Empresa">
          <p className="text-sm text-gray-500 mb-4">
            Seleccione la empresa de ContPAQi con la que desea trabajar.
          </p>
          <CompanyDropdown
            companies={companies}
            selectedCompany={selectedCompany}
            onSelect={handleCompanySelect}
            loading={companiesLoading}
            error={companiesError}
          />
        </SectionCard>

        {/* Services Section */}
        <SectionCard testId="services-section" title="Servicios">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-500">
              Estado de los servicios del sistema.
            </p>
            <button
              onClick={handleRefresh}
              className="flex items-center space-x-1 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors"
              aria-label="Actualizar estado"
            >
              <RefreshIcon />
              <span>Actualizar</span>
            </button>
          </div>

          <div className="space-y-3">
            {/* AI Service Status */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
              <div className="flex items-center space-x-3">
                <StatusIndicator status={aiStatus} testId="ai-status-indicator" />
                <span className="font-medium text-gray-700">AI Service</span>
              </div>
              <span className={`text-sm ${aiStatus === 'running' ? 'text-green-600' : aiStatus === 'error' ? 'text-red-600' : 'text-gray-500'}`}>
                {getStatusText(aiStatus)}
              </span>
            </div>

            {/* Bridge Service Status */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
              <div className="flex items-center space-x-3">
                <StatusIndicator status={bridgeStatus} testId="bridge-status-indicator" />
                <span className="font-medium text-gray-700">Bridge Service</span>
              </div>
              <span className={`text-sm ${bridgeStatus === 'running' ? 'text-green-600' : bridgeStatus === 'error' ? 'text-red-600' : 'text-gray-500'}`}>
                {getStatusText(bridgeStatus)}
              </span>
            </div>
          </div>
        </SectionCard>

        {/* About Section */}
        <SectionCard testId="about-section" title="Acerca de">
          <div className="space-y-4">
            {/* App Name and Version */}
            <div className="text-center pb-4 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">ContPAQ Win</h3>
              <p className="text-sm text-gray-500">
                Sistema de gestión de facturas con IA
              </p>
              <p className="mt-2 text-sm">
                <span className="text-gray-500">Versión: </span>
                <span className="font-medium text-gray-900">{appConfig?.version || '0.1.0'}</span>
              </p>
            </div>

            {/* System Info */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Plataforma:</span>
                <span className="text-gray-900">{appConfig ? getPlatformText(appConfig.platform) : 'Windows'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Arquitectura:</span>
                <span className="text-gray-900">{appConfig?.arch || 'x64'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Directorio de datos:</span>
                <span className="text-gray-900 text-right max-w-xs truncate" title={appConfig?.userDataPath}>
                  {appConfig?.userDataPath || 'N/A'}
                </span>
              </div>
            </div>

            {/* Help Link */}
            <div className="pt-4 border-t border-gray-200">
              <a
                href="https://github.com/danribes/contpaq-win#readme"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-sm text-primary-600 hover:text-primary-800"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Ayuda y documentación
              </a>
            </div>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}

export default SettingsPage;
