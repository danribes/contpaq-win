/**
 * ContPAQ Win - Internationalization (i18n) Provider
 *
 * Provides translation functionality for the application using React Context.
 * Supports nested key access (e.g., 'buttons.save') and fallback handling.
 */

import React, { createContext, useContext, ReactNode, useMemo } from 'react';

import esTranslations from './es.json';

// =============================================================================
// Types
// =============================================================================

/**
 * Type for the translations object (nested JSON structure).
 */
type TranslationsType = typeof esTranslations;

/**
 * Type for interpolation values.
 */
type InterpolationValues = Record<string, string | number>;

/**
 * Context value type containing the translate function.
 */
interface I18nContextValue {
  /**
   * Translate a key to the current language.
   * Supports nested keys like 'buttons.save'.
   *
   * @param key - The translation key (e.g., 'buttons.save')
   * @param values - Optional interpolation values
   * @returns The translated string, or the key if not found
   */
  t: (key: string, values?: InterpolationValues) => string;

  /**
   * The current language code.
   */
  language: string;

  /**
   * All translations for direct access.
   */
  translations: TranslationsType;
}

/**
 * Props for the I18nProvider component.
 */
interface I18nProviderProps {
  children: ReactNode;
}

// =============================================================================
// Context
// =============================================================================

/**
 * React context for internationalization.
 */
const I18nContext = createContext<I18nContextValue | undefined>(undefined);

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Get a nested value from an object using dot notation.
 *
 * @param obj - The object to traverse
 * @param path - The dot-separated path (e.g., 'buttons.save')
 * @returns The value at the path, or undefined if not found
 */
function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  const keys = path.split('.');
  let current: unknown = obj;

  for (const key of keys) {
    if (current === null || current === undefined) {
      return undefined;
    }
    if (typeof current !== 'object') {
      return undefined;
    }
    current = (current as Record<string, unknown>)[key];
  }

  return current;
}

/**
 * Interpolate values into a string template.
 * Replaces {{key}} with the corresponding value.
 *
 * @param template - The string template
 * @param values - The values to interpolate
 * @returns The interpolated string
 */
function interpolate(template: string, values?: InterpolationValues): string {
  if (!values) {
    return template;
  }

  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    const value = values[key];
    return value !== undefined ? String(value) : match;
  });
}

// =============================================================================
// Provider Component
// =============================================================================

/**
 * I18nProvider component that provides translation functionality to the app.
 *
 * Usage:
 * ```tsx
 * <I18nProvider>
 *   <App />
 * </I18nProvider>
 * ```
 */
export function I18nProvider({ children }: I18nProviderProps): JSX.Element {
  const contextValue = useMemo<I18nContextValue>(() => {
    /**
     * Translate a key to the current language.
     */
    const t = (key: string, values?: InterpolationValues): string => {
      const value = getNestedValue(
        esTranslations as Record<string, unknown>,
        key
      );

      if (typeof value === 'string') {
        return interpolate(value, values);
      }

      // Fallback: return the key itself if translation not found
      console.warn(`Translation not found for key: ${key}`);
      return key;
    };

    return {
      t,
      language: 'es',
      translations: esTranslations,
    };
  }, []);

  return (
    <I18nContext.Provider value={contextValue}>
      {children}
    </I18nContext.Provider>
  );
}

// =============================================================================
// Hook
// =============================================================================

/**
 * Hook to access translation functionality.
 *
 * Usage:
 * ```tsx
 * function MyComponent() {
 *   const { t } = useTranslation();
 *   return <button>{t('buttons.save')}</button>;
 * }
 * ```
 *
 * With interpolation:
 * ```tsx
 * t('greeting', { name: 'Juan' }) // "Hola, Juan"
 * ```
 *
 * @returns The i18n context value with translate function
 * @throws Error if used outside of I18nProvider
 */
export function useTranslation(): I18nContextValue {
  const context = useContext(I18nContext);

  if (context === undefined) {
    throw new Error('useTranslation must be used within an I18nProvider');
  }

  return context;
}

// =============================================================================
// Standalone translate function (for use outside React)
// =============================================================================

/**
 * Standalone translate function for use outside React components.
 * Useful for utility functions or services.
 *
 * @param key - The translation key
 * @param values - Optional interpolation values
 * @returns The translated string, or the key if not found
 */
export function t(key: string, values?: InterpolationValues): string {
  const value = getNestedValue(
    esTranslations as Record<string, unknown>,
    key
  );

  if (typeof value === 'string') {
    return interpolate(value, values);
  }

  return key;
}

// =============================================================================
// Exports
// =============================================================================

export { esTranslations };
export type { I18nContextValue, InterpolationValues };
