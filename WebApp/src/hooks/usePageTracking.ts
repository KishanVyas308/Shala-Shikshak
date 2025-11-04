/**
 * DEPRECATED: This hook is no longer used.
 * We now only track app/website opens, not individual page views.
 * See AnalyticsService.trackWebsiteOpen() in App.tsx
 */
export const usePageTracking = (_userId?: string) => {
  // No-op - kept for backward compatibility
  return null;
};
