"use client"

import { usePathname } from 'next/navigation';
import { useEffect, useLayoutEffect } from 'react';

export default function ScrollToTop() {
  const pathname = usePathname();
  // Disable automatic scroll restoration
  useEffect(() => {
    if (typeof window !== 'undefined' && 'scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
  }, []);
  // Scroll to top on pathname change
  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
