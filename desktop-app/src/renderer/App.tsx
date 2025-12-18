/**
 * ContPAQ Win - Main Application Component
 *
 * This is the root component that sets up routing and the main
 * application layout using React Router and Tailwind CSS.
 */

import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { ProcessingPage } from './pages/ProcessingPage';
import { SettingsPage } from './pages/SettingsPage';

const NotFoundPage: React.FC = () => (
  <div className="flex flex-col items-center justify-center min-h-[60vh]">
    <h1 className="text-4xl font-bold text-gray-800 mb-4">404</h1>
    <p className="text-gray-600">
      Página no encontrada
    </p>
  </div>
);

/**
 * Main Application Component
 *
 * Sets up the application structure with:
 * - HashRouter for Electron file:// compatibility
 * - Main layout with header, content area, and status bar
 * - Route definitions for all pages
 */
function App(): JSX.Element {
  return (
    <HashRouter>
      <div className="flex flex-col min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-4 py-3">
          <nav className="flex items-center justify-between max-w-7xl mx-auto">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold text-primary-600">
                ContPAQ Win
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              {/* Navigation links will be added later */}
            </div>
          </nav>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-4">
          <div className="max-w-7xl mx-auto">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/processing" element={<ProcessingPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </div>
        </main>

        {/* Status Bar */}
        <footer className="bg-white border-t border-gray-200 px-4 py-2">
          <div className="flex items-center justify-between max-w-7xl mx-auto text-sm text-gray-500">
            <div className="flex items-center space-x-4">
              <span className="flex items-center">
                <span className="w-2 h-2 bg-yellow-400 rounded-full mr-2" />
                AI Service: Iniciando...
              </span>
              <span className="flex items-center">
                <span className="w-2 h-2 bg-yellow-400 rounded-full mr-2" />
                Bridge: Iniciando...
              </span>
            </div>
            <div>
              <span>v0.1.0</span>
            </div>
          </div>
        </footer>
      </div>
    </HashRouter>
  );
}

export default App;
