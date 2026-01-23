import { createContext, useContext, ReactNode } from 'react';

interface DemoModeContextType {
  isDemoMode: boolean;
  isPreviewEnvironment: boolean;
}

const DemoModeContext = createContext<DemoModeContextType>({
  isDemoMode: false,
  isPreviewEnvironment: false,
});

export const useDemoMode = () => useContext(DemoModeContext);

// Check if we're in a preview/development environment
const checkIsPreviewEnvironment = (): boolean => {
  const hostname = window.location.hostname;
  return (
    hostname === 'localhost' ||
    hostname.includes('127.0.0.1') ||
    hostname.includes('preview') ||
    hostname.includes('lovable.app') ||
    import.meta.env.DEV
  );
};

interface DemoModeProviderProps {
  children: ReactNode;
  isAuthenticated: boolean;
}

export const DemoModeProvider = ({ children, isAuthenticated }: DemoModeProviderProps) => {
  const isPreviewEnvironment = checkIsPreviewEnvironment();
  // Demo mode: in preview environment AND not authenticated
  const isDemoMode = isPreviewEnvironment && !isAuthenticated;

  return (
    <DemoModeContext.Provider value={{ isDemoMode, isPreviewEnvironment }}>
      {children}
    </DemoModeContext.Provider>
  );
};
