import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

// Mock providers - these would be real providers in the actual app
const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <>{children}</>;
};

const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <div data-theme="light">{children}</div>;
};

const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <>{children}</>;
};

interface AllProvidersProps {
  children: React.ReactNode;
  initialRoute?: string;
}

export function AllProviders({ children, initialRoute = '/' }: AllProvidersProps) {
  return (
    <MemoryRouter initialEntries={[initialRoute]}>
      <I18nProvider>
        <ThemeProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ThemeProvider>
      </I18nProvider>
    </MemoryRouter>
  );
}

export function customRender(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'> & { initialRoute?: string }
) {
  const { initialRoute, ...renderOptions } = options || {};
  return render(ui, {
    wrapper: ({ children }) => (
      <AllProviders initialRoute={initialRoute}>{children}</AllProviders>
    ),
    ...renderOptions,
  });
}

// Re-export everything from testing-library
export * from '@testing-library/react';
export { customRender as render };
