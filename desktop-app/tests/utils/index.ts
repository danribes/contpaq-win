/**
 * Test Utility Functions
 *
 * Common helper functions for testing the desktop application.
 */

export * from './render';

/**
 * Wait for a specified number of milliseconds
 */
export function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Wait for next tick (microtask)
 */
export function waitForNextTick(): Promise<void> {
  return new Promise((resolve) => process.nextTick(resolve));
}

/**
 * Wait for all pending promises to resolve
 */
export async function flushPromises(): Promise<void> {
  await waitForNextTick();
  await wait(0);
}

/**
 * Create a mock file for testing file uploads
 */
export function createMockFile(
  name: string,
  type: string = 'application/pdf',
  size: number = 1024
): File {
  const content = new Array(size).fill('x').join('');
  const blob = new Blob([content], { type });
  return new File([blob], name, { type });
}

/**
 * Create a mock PDF file
 */
export function createMockPdfFile(name: string = 'test.pdf'): File {
  return createMockFile(name, 'application/pdf', 2048);
}

/**
 * Create a mock data transfer for drag and drop testing
 */
export function createMockDataTransfer(files: File[]): DataTransfer {
  return {
    files: files as unknown as FileList,
    items: files.map((file) => ({
      kind: 'file',
      type: file.type,
      getAsFile: () => file,
    })) as unknown as DataTransferItemList,
    types: ['Files'],
    getData: () => '',
    setData: () => {},
    clearData: () => {},
    setDragImage: () => {},
    dropEffect: 'none',
    effectAllowed: 'all',
  } as DataTransfer;
}

/**
 * Format currency for testing assertions (Mexican Peso)
 */
export function formatTestCurrency(amount: number): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
  }).format(amount);
}

/**
 * Generate a valid Mexican RFC for testing
 */
export function generateTestRfc(type: 'persona_fisica' | 'persona_moral' = 'persona_moral'): string {
  if (type === 'persona_fisica') {
    // 13 characters: 4 letters + 6 digits + 3 alphanumeric
    return 'XAXX010101000';
  }
  // 12 characters: 3 letters + 6 digits + 3 alphanumeric
  return 'XXX010101000';
}

/**
 * Generate a test invoice ID
 */
export function generateTestInvoiceId(): string {
  return `INV-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Assert element is visible (helper for accessibility testing)
 */
export function assertVisible(element: HTMLElement | null): asserts element is HTMLElement {
  if (!element) {
    throw new Error('Element is null');
  }
  if (element.hidden || getComputedStyle(element).display === 'none') {
    throw new Error('Element is not visible');
  }
}

/**
 * Get all text content from an element (useful for testing)
 */
export function getAllTextContent(element: Element): string {
  return element.textContent?.trim() || '';
}

/**
 * Check if element has specific CSS class
 */
export function hasClass(element: Element, className: string): boolean {
  return element.classList.contains(className);
}

/**
 * Suppress console errors for expected error testing
 */
export function suppressConsoleErrors(): () => void {
  const originalError = console.error;
  console.error = jest.fn();
  return () => {
    console.error = originalError;
  };
}
