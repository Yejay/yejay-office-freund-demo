'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

// Type declaration for Preline's HSStaticMethods
interface HSStaticMethods {
  autoInit: () => void;
}

declare global {
  interface Window {
    HSStaticMethods?: HSStaticMethods;
  }
}

/**
 * Preline Initialization Component
 *
 * Loads Preline's JavaScript plugins (HSOverlay, etc.) on route changes.
 * Must be included in the root layout to enable Preline components.
 */
export function PrelineInit() {
  const pathname = usePathname();

  useEffect(() => {
    const loadPreline = async () => {
      // Dynamically import Preline
      await import('preline/preline');

      // Initialize or reinitialize on route change
      if (typeof window !== 'undefined' && window.HSStaticMethods) {
        window.HSStaticMethods.autoInit();
      }
    };

    loadPreline();
  }, [pathname]);

  return null;
}
