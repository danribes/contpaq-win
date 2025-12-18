/**
 * T028.2 - Tesseract OCR Path Configuration
 *
 * Provides the correct Tesseract executable path based on whether
 * the application is running in development or packaged mode.
 */

import * as path from 'path';
import * as fs from 'fs';
import { app } from 'electron';

/**
 * Check if the app is running in development mode.
 */
export function isDevelopment(): boolean {
  return (
    process.env.NODE_ENV === 'development' ||
    !app.isPackaged
  );
}

/**
 * Get the path to the Tesseract executable.
 *
 * In development: Uses system-installed Tesseract
 * In packaged app: Uses bundled Tesseract from resources
 *
 * @returns The absolute path to tesseract.exe
 */
export function getTesseractPath(): string {
  if (isDevelopment()) {
    // Development: Use system Tesseract or environment variable
    const envPath = process.env.TESSERACT_PATH;
    if (envPath && fs.existsSync(envPath)) {
      return envPath;
    }

    // Default Windows installation path
    const defaultPath = 'C:\\Program Files\\Tesseract-OCR\\tesseract.exe';
    if (fs.existsSync(defaultPath)) {
      return defaultPath;
    }

    // Fallback for dev without Tesseract installed
    console.warn('Tesseract not found. OCR features may not work.');
    return defaultPath;
  }

  // Packaged app: Use bundled Tesseract from resources
  const resourcesPath = process.resourcesPath;
  const bundledPath = path.join(resourcesPath, 'tesseract', 'tesseract.exe');

  if (fs.existsSync(bundledPath)) {
    return bundledPath;
  }

  // Fallback to system path if bundled version not found
  console.warn('Bundled Tesseract not found, falling back to system path');
  return 'C:\\Program Files\\Tesseract-OCR\\tesseract.exe';
}

/**
 * Get the path to the Tesseract tessdata directory.
 *
 * @returns The absolute path to the tessdata directory
 */
export function getTessdataPath(): string {
  if (isDevelopment()) {
    const envPath = process.env.TESSDATA_PREFIX;
    if (envPath && fs.existsSync(envPath)) {
      return envPath;
    }

    // Default Windows installation tessdata path
    return 'C:\\Program Files\\Tesseract-OCR\\tessdata';
  }

  // Packaged app: Use bundled tessdata from resources
  const resourcesPath = process.resourcesPath;
  return path.join(resourcesPath, 'tesseract', 'tessdata');
}

/**
 * Get Tesseract configuration for use with OCR libraries.
 *
 * @returns Configuration object with paths
 */
export function getTesseractConfig(): {
  binary: string;
  tessdata: string;
  lang: string;
} {
  return {
    binary: getTesseractPath(),
    tessdata: getTessdataPath(),
    lang: 'spa+eng', // Spanish primary, English fallback
  };
}

/**
 * Check if Tesseract is available and properly configured.
 *
 * @returns True if Tesseract is ready to use
 */
export function isTesseractAvailable(): boolean {
  try {
    const tesseractPath = getTesseractPath();
    const tessdataPath = getTessdataPath();

    // Check if executable exists
    if (!fs.existsSync(tesseractPath)) {
      return false;
    }

    // Check if tessdata directory exists
    if (!fs.existsSync(tessdataPath)) {
      return false;
    }

    // Check for Spanish language data
    const spaPath = path.join(tessdataPath, 'spa.traineddata');
    if (!fs.existsSync(spaPath)) {
      console.warn('Spanish language data not found');
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error checking Tesseract availability:', error);
    return false;
  }
}

export default {
  getTesseractPath,
  getTessdataPath,
  getTesseractConfig,
  isTesseractAvailable,
  isDevelopment,
};
