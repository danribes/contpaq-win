/**
 * ContPAQ Win - React Entry Point
 *
 * This is the main entry point for the React renderer process.
 * It bootstraps the React application and mounts it to the DOM.
 */

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import App from './App';
import './styles/index.css';

// Get the root element from the DOM
const rootElement = document.getElementById('root');

// Ensure root element exists before mounting
if (!rootElement) {
  throw new Error(
    'Error crítico: No se encontró el elemento root. ' +
    'Verifique que index.html contiene <div id="root"></div>'
  );
}

// Create React 18 root and render app
const root = createRoot(rootElement);

root.render(
  <StrictMode>
    <App />
  </StrictMode>
);
