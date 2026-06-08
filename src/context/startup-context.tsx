import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

type StartupContextValue = {
  /** True once the initial route (auth / onboarding / tabs) has been fully resolved. */
  isRouteResolved: boolean;
  /** Called by the deepest startup route gate once it knows the first real screen to show. */
  markRouteResolved: () => void;
};

const StartupContext = createContext<StartupContextValue | undefined>(undefined);

export function StartupProvider({ children }: { children: ReactNode }) {
  const [isRouteResolved, setIsRouteResolved] = useState(false);
  const markRouteResolved = useCallback(() => setIsRouteResolved(true), []);

  const value = useMemo(
    () => ({ isRouteResolved, markRouteResolved }),
    [isRouteResolved, markRouteResolved]
  );

  return <StartupContext.Provider value={value}>{children}</StartupContext.Provider>;
}

export function useStartup(): StartupContextValue {
  const ctx = useContext(StartupContext);
  if (!ctx) {
    throw new Error('useStartup must be used within a StartupProvider');
  }
  return ctx;
}
