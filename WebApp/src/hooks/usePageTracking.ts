import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { trackPageView } from '../services/analytics';

/**
 * Hook to automatically track page views
 */
export const usePageTracking = (userId?: string) => {
  const location = useLocation();

  useEffect(() => {
    // Track page view when location changes
    const handlePageView = async () => {
      try {
        await trackPageView(location.pathname, userId);
      } catch (error) {
        // Silently fail - analytics shouldn't break the app
        console.debug('Page tracking failed:', error);
      }
    };

    // Add a small delay to ensure the page has loaded
    const timeoutId = setTimeout(handlePageView, 100);

    return () => clearTimeout(timeoutId);
  }, [location.pathname, userId]);

  return null;
};
