/**
 * Custom Render Utilities
 *
 * Provides custom render functions that wrap components
 * with necessary providers for testing.
 */

import React, { ReactElement, ReactNode } from 'react';
import { render, RenderOptions, RenderResult } from '@testing-library/react';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import { I18nProvider } from '@renderer/i18n';

/**
 * Options for custom render
 */
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  /** Initial route for router */
  route?: string;
  /** Use memory router instead of browser router */
  useMemoryRouter?: boolean;
  /** Additional wrapper components */
  additionalWrappers?: React.ComponentType<{ children: ReactNode }>[];
}

/**
 * All providers wrapper component
 */
interface AllProvidersProps {
  children: ReactNode;
  route?: string;
  useMemoryRouter?: boolean;
}

function AllProviders({
  children,
  route = '/',
  useMemoryRouter = true,
}: AllProvidersProps): ReactElement {
  const Router = useMemoryRouter ? MemoryRouter : BrowserRouter;

  return (
    <I18nProvider>
      <Router initialEntries={useMemoryRouter ? [route] : undefined}>
        {children}
      </Router>
    </I18nProvider>
  );
}

/**
 * Custom render function with all providers
 *
 * @example
 * ```tsx
 * import { customRender, screen } from '@tests/utils/render';
 *
 * test('renders component', () => {
 *   customRender(<MyComponent />);
 *   expect(screen.getByText('Hello')).toBeInTheDocument();
 * });
 * ```
 */
export function customRender(
  ui: ReactElement,
  options: CustomRenderOptions = {}
): RenderResult {
  const {
    route = '/',
    useMemoryRouter = true,
    additionalWrappers = [],
    ...renderOptions
  } = options;

  // Build wrapper with all providers
  const Wrapper = ({ children }: { children: ReactNode }): ReactElement => {
    let wrappedChildren = (
      <AllProviders route={route} useMemoryRouter={useMemoryRouter}>
        {children}
      </AllProviders>
    );

    // Apply additional wrappers
    for (const AdditionalWrapper of additionalWrappers) {
      wrappedChildren = (
        <AdditionalWrapper>{wrappedChildren}</AdditionalWrapper>
      );
    }

    return wrappedChildren;
  };

  return render(ui, { wrapper: Wrapper, ...renderOptions });
}

/**
 * Render without router (for testing non-routing components)
 */
export function renderWithI18n(
  ui: ReactElement,
  options: Omit<RenderOptions, 'wrapper'> = {}
): RenderResult {
  return render(ui, {
    wrapper: ({ children }) => <I18nProvider>{children}</I18nProvider>,
    ...options,
  });
}

/**
 * Render with custom initial route
 */
export function renderWithRoute(
  ui: ReactElement,
  route: string,
  options: Omit<CustomRenderOptions, 'route'> = {}
): RenderResult {
  return customRender(ui, { ...options, route });
}

// Re-export everything from testing-library
export * from '@testing-library/react';

// Override render with customRender as default
export { customRender as render };
