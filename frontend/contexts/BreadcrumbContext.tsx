import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

export interface BreadcrumbSegment {
  label: string;
  /** When set, segment is pressable and navigates here (Expo Router path). */
  href?: string;
}

interface BreadcrumbContextValue {
  segments: BreadcrumbSegment[];
  setBreadcrumbs: (segments: BreadcrumbSegment[]) => void;
}

const BreadcrumbContext = createContext<BreadcrumbContextValue | null>(null);

export function BreadcrumbProvider({ children }: { children: ReactNode }) {
  const [segments, setSegments] = useState<BreadcrumbSegment[]>([]);

  const setBreadcrumbs = useCallback((next: BreadcrumbSegment[]) => {
    setSegments(next);
  }, []);

  const value = useMemo(
    () => ({
      segments,
      setBreadcrumbs,
    }),
    [segments, setBreadcrumbs],
  );

  return <BreadcrumbContext.Provider value={value}>{children}</BreadcrumbContext.Provider>;
}

export function useBreadcrumbs() {
  const ctx = useContext(BreadcrumbContext);
  if (!ctx) {
    throw new Error('useBreadcrumbs must be used within BreadcrumbProvider');
  }
  return ctx;
}
