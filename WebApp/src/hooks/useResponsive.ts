import { useState, useEffect } from 'react';

// Breakpoints (matching Tailwind CSS defaults)
const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

type Breakpoint = keyof typeof breakpoints;

// Hook to get current screen size
export const useScreenSize = () => {
  const [screenSize, setScreenSize] = useState<{
    width: number;
    height: number;
    isMobile: boolean;
    isTablet: boolean;
    isDesktop: boolean;
    currentBreakpoint: Breakpoint | 'xs';
  }>({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
    isMobile: typeof window !== 'undefined' ? window.innerWidth < breakpoints.sm : false,
    isTablet: typeof window !== 'undefined' ? window.innerWidth >= breakpoints.sm && window.innerWidth < breakpoints.lg : false,
    isDesktop: typeof window !== 'undefined' ? window.innerWidth >= breakpoints.lg : false,
    currentBreakpoint: 'xs',
  });

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      let currentBreakpoint: Breakpoint | 'xs' = 'xs';
      
      if (width >= breakpoints['2xl']) {
        currentBreakpoint = '2xl';
      } else if (width >= breakpoints.xl) {
        currentBreakpoint = 'xl';
      } else if (width >= breakpoints.lg) {
        currentBreakpoint = 'lg';
      } else if (width >= breakpoints.md) {
        currentBreakpoint = 'md';
      } else if (width >= breakpoints.sm) {
        currentBreakpoint = 'sm';
      }

      setScreenSize({
        width,
        height,
        isMobile: width < breakpoints.sm,
        isTablet: width >= breakpoints.sm && width < breakpoints.lg,
        isDesktop: width >= breakpoints.lg,
        currentBreakpoint,
      });
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Set initial size

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return screenSize;
};

// Hook to check if current screen matches breakpoint
export const useBreakpoint = (breakpoint: Breakpoint) => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const checkBreakpoint = () => {
      const width = window.innerWidth;
      setMatches(width >= breakpoints[breakpoint]);
    };

    window.addEventListener('resize', checkBreakpoint);
    checkBreakpoint(); // Set initial state

    return () => window.removeEventListener('resize', checkBreakpoint);
  }, [breakpoint]);

  return matches;
};

// Hook for mobile-first responsive behavior
export const useResponsive = () => {
  const screenSize = useScreenSize();
  
  const isAtLeast = (breakpoint: Breakpoint) => {
    return screenSize.width >= breakpoints[breakpoint];
  };

  const isBelow = (breakpoint: Breakpoint) => {
    return screenSize.width < breakpoints[breakpoint];
  };

  const isBetween = (min: Breakpoint, max: Breakpoint) => {
    return screenSize.width >= breakpoints[min] && screenSize.width < breakpoints[max];
  };

  return {
    ...screenSize,
    isAtLeast,
    isBelow,
    isBetween,
    breakpoints,
  };
};

// Hook for touch device detection
export const useTouch = () => {
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    const checkTouch = () => {
      setIsTouch(
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        // @ts-ignore
        navigator.msMaxTouchPoints > 0
      );
    };

    checkTouch();
    
    // Check again on resize in case device orientation changes
    window.addEventListener('resize', checkTouch);
    
    return () => window.removeEventListener('resize', checkTouch);
  }, []);

  return isTouch;
};

// Hook for mobile navigation state
export const useMobileNavigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isMobile } = useScreenSize();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);
  const openMenu = () => setIsMenuOpen(true);

  // Close menu when switching to desktop
  useEffect(() => {
    if (!isMobile) {
      setIsMenuOpen(false);
    }
  }, [isMobile]);

  // Close menu on route change (add this to your router if needed)
  useEffect(() => {
    const handleRouteChange = () => {
      if (isMobile) {
        setIsMenuOpen(false);
      }
    };

    // If using React Router, you might want to listen to location changes
    // This is a basic implementation
    window.addEventListener('popstate', handleRouteChange);
    
    return () => window.removeEventListener('popstate', handleRouteChange);
  }, [isMobile]);

  return {
    isMenuOpen,
    toggleMenu,
    closeMenu,
    openMenu,
    isMobile,
  };
};

// Hook for responsive values
export const useResponsiveValue = <T>(values: {
  xs?: T;
  sm?: T;
  md?: T;
  lg?: T;
  xl?: T;
  '2xl'?: T;
}) => {
  const { currentBreakpoint } = useScreenSize();
  
  // Get the value for current breakpoint, falling back to smaller breakpoints
  const getValue = (): T | undefined => {
    if (values[currentBreakpoint]) {
      return values[currentBreakpoint];
    }
    
    // Fallback logic
    const fallbackOrder: (keyof typeof values)[] = ['2xl', 'xl', 'lg', 'md', 'sm', 'xs'];
    const currentIndex = fallbackOrder.indexOf(currentBreakpoint);
    
    // Look for value in smaller breakpoints
    for (let i = currentIndex + 1; i < fallbackOrder.length; i++) {
      const breakpoint = fallbackOrder[i];
      if (values[breakpoint]) {
        return values[breakpoint];
      }
    }
    
    return undefined;
  };

  return getValue();
};

// Hook for scroll direction detection
export const useScrollDirection = () => {
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down' | null>(null);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    let lastScrollY = window.pageYOffset;

    const updateScrollDirection = () => {
      const currentScrollY = window.pageYOffset;
      
      if (currentScrollY > lastScrollY) {
        setScrollDirection('down');
      } else if (currentScrollY < lastScrollY) {
        setScrollDirection('up');
      }
      
      setScrollY(currentScrollY);
      lastScrollY = currentScrollY > 0 ? currentScrollY : 0;
    };

    window.addEventListener('scroll', updateScrollDirection);
    
    return () => window.removeEventListener('scroll', updateScrollDirection);
  }, []);

  return {
    scrollDirection,
    scrollY,
    isScrollingDown: scrollDirection === 'down',
    isScrollingUp: scrollDirection === 'up',
    isAtTop: scrollY === 0,
  };
};

// Hook for device orientation
export const useOrientation = () => {
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');

  useEffect(() => {
    const handleOrientationChange = () => {
      setOrientation(window.innerHeight > window.innerWidth ? 'portrait' : 'landscape');
    };

    window.addEventListener('resize', handleOrientationChange);
    handleOrientationChange(); // Set initial orientation

    return () => window.removeEventListener('resize', handleOrientationChange);
  }, []);

  return {
    orientation,
    isPortrait: orientation === 'portrait',
    isLandscape: orientation === 'landscape',
  };
};

// Hook for safe area (for mobile devices with notches)
export const useSafeArea = () => {
  const [safeArea, setSafeArea] = useState({
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  });

  useEffect(() => {
    const updateSafeArea = () => {
      const computedStyle = getComputedStyle(document.documentElement);
      
      setSafeArea({
        top: parseInt(computedStyle.getPropertyValue('--safe-area-inset-top') || '0'),
        right: parseInt(computedStyle.getPropertyValue('--safe-area-inset-right') || '0'),
        bottom: parseInt(computedStyle.getPropertyValue('--safe-area-inset-bottom') || '0'),
        left: parseInt(computedStyle.getPropertyValue('--safe-area-inset-left') || '0'),
      });
    };

    updateSafeArea();
    window.addEventListener('resize', updateSafeArea);
    
    return () => window.removeEventListener('resize', updateSafeArea);
  }, []);

  return safeArea;
};
