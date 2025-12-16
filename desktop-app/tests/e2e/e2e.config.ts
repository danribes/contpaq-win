/**
 * E2E Test Configuration
 *
 * Configuration for end-to-end tests of the Electron desktop application.
 * These tests run against the full application stack.
 */

export interface E2EConfig {
  /** Test timeout in milliseconds */
  timeout: number;
  /** Retry count for flaky tests */
  retries: number;
  /** Whether to run tests in headless mode */
  headless: boolean;
  /** Slow down test execution for debugging (ms) */
  slowMo: number;
  /** Screenshot directory for failures */
  screenshotDir: string;
  /** Video recording directory */
  videoDir: string;
}

/**
 * Default E2E test configuration for Electron application
 */
export const e2eConfig: E2EConfig = {
  // Test timeout: 30 seconds for E2E tests
  timeout: 30000,

  // Retry failed tests once
  retries: 1,

  // Run in headed mode by default for Electron
  headless: false,

  // No slow down by default
  slowMo: 0,

  // Screenshot and video directories
  screenshotDir: './tests/e2e/screenshots',
  videoDir: './tests/e2e/videos',
};

/**
 * Electron-specific configuration
 */
export const electronConfig = {
  // Path to the Electron main process
  mainProcess: './dist/main/index.js',

  // Electron launch arguments
  args: [
    '--no-sandbox',
    '--disable-gpu',
  ],

  // Environment variables for test mode
  env: {
    NODE_ENV: 'test',
    E2E_TEST: 'true',
  },
};

/**
 * Wait timeouts for different operations
 */
export const timeouts = {
  /** Short timeout for UI interactions */
  short: 5000,
  /** Medium timeout for API calls */
  medium: 15000,
  /** Long timeout for file processing */
  long: 30000,
  /** Extra long timeout for AI extraction */
  extraction: 60000,
};

/**
 * Test selectors using data-testid attributes
 */
export const selectors = {
  // Navigation
  navHome: '[data-testid="nav-home"]',
  navProcessing: '[data-testid="nav-processing"]',
  navSettings: '[data-testid="nav-settings"]',

  // Status bar
  statusBar: '[data-testid="status-bar"]',
  aiServiceStatus: '[data-testid="ai-service-status"]',
  bridgeServiceStatus: '[data-testid="bridge-service-status"]',

  // Processing page
  dropzone: '[data-testid="dropzone"]',
  processButton: '[data-testid="process-button"]',
  validateButton: '[data-testid="validate-button"]',
  postButton: '[data-testid="post-button"]',

  // Invoice form
  invoiceForm: '[data-testid="invoice-form"]',
  rfcInput: '[data-testid="rfc-input"]',
  totalInput: '[data-testid="total-input"]',
};

export default e2eConfig;
