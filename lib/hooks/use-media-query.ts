import { useState, useEffect } from "react";

/**
 * Custom hook for responsive media queries
 * Detects if a media query matches and updates on window resize
 *
 * @param query - CSS media query string (e.g., "(min-width: 768px)")
 * @returns Boolean indicating if the media query matches
 *
 * @example
 * ```tsx
 * const isMobile = useMediaQuery("(max-width: 768px)");
 * const isDesktop = useMediaQuery("(min-width: 1024px)");
 * const prefersDark = useMediaQuery("(prefers-color-scheme: dark)");
 *
 * return (
 *   <div>
 *     {isMobile ? <MobileNav /> : <DesktopNav />}
 *   </div>
 * );
 * ```
 */
export function useMediaQuery(query: string): boolean {
  // Initialize with false to avoid hydration mismatch
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    // Create media query list
    const mediaQuery = window.matchMedia(query);

    // Set initial value
    setMatches(mediaQuery.matches);

    // Create event listener
    const handler = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    // Add listener (use deprecated addListener for older browsers)
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handler);
    } else {
      // Fallback for older browsers
      mediaQuery.addListener(handler);
    }

    // Cleanup
    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener("change", handler);
      } else {
        // Fallback for older browsers
        mediaQuery.removeListener(handler);
      }
    };
  }, [query]);

  return matches;
}

/**
 * Predefined breakpoint hooks for common screen sizes
 * Based on Tailwind CSS default breakpoints
 */

export function useIsMobile() {
  return useMediaQuery("(max-width: 640px)");
}

export function useIsTablet() {
  return useMediaQuery("(min-width: 641px) and (max-width: 1024px)");
}

export function useIsDesktop() {
  return useMediaQuery("(min-width: 1025px)");
}

export function useIsSmallScreen() {
  return useMediaQuery("(max-width: 768px)");
}

export function useIsMediumScreen() {
  return useMediaQuery("(min-width: 769px) and (max-width: 1279px)");
}

export function useIsLargeScreen() {
  return useMediaQuery("(min-width: 1280px)");
}
