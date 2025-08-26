'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

interface LoadingContextType {
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  activePage: string | null;
  setActivePage: (page: string | null) => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export function useLoading() {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
}

export function LoadingProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);
  const [activePage, setActivePage] = useState<string | null>(null);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Update active page when route changes
  useEffect(() => {
    setActivePage(pathname);
    setIsLoading(false);
  }, [pathname, searchParams]);

  return (
    <LoadingContext.Provider value={{ isLoading, setIsLoading, activePage, setActivePage }}>
      {children}
    </LoadingContext.Provider>
  );
} 