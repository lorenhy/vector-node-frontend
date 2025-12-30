'use client';

import { useState, useEffect, ReactNode } from 'react';

interface HydrationFixProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export default function HydrationFix({ children, fallback }: HydrationFixProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return <>{children}</>;
}
