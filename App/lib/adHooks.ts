/**
 * React Hooks for easy ad integration
 * Production-ready hooks with proper state management
 */

import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import { AdManager } from './AdManager';

// Hook for Interstitial Ads
export function useInterstitialAd() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);

  // Update state from AdManager
  const updateState = useCallback(() => {
    const status = AdManager.getAdStatus();
    setIsLoaded(status.interstitial.loaded);
    setIsLoading(status.interstitial.loading);
    setIsBlocked(status.interstitial.blocked);
  }, []);

  // Show interstitial ad with callback
  const showInterstitialAd = useCallback((onAdClosed?: () => void) => {
    const wasShown = AdManager.showInterstitialAd(() => {
      updateState();
      onAdClosed?.();
    });
    
    if (!wasShown) {
      // Ad wasn't shown, proceed immediately
      onAdClosed?.();
    }
    
    return wasShown;
  }, [updateState]);

  // Force reload ad
  const reloadAd = useCallback(() => {
    AdManager.loadAd('interstitial');
    setTimeout(updateState, 100); // Update state after a short delay
  }, [updateState]);

  // Update state periodically
  useEffect(() => {
    updateState();
    const interval = setInterval(updateState, 2000); // Check every 2 seconds
    return () => clearInterval(interval);
  }, [updateState]);

  return {
    isLoaded,
    isLoading,
    isBlocked,
    showInterstitialAd,
    reloadAd,
  };
}

// Hook for Rewarded Ads
export function useRewardedAd() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);

  // Update state from AdManager
  const updateState = useCallback(() => {
    const status = AdManager.getAdStatus();
    setIsLoaded(status.rewarded.loaded);
    setIsLoading(status.rewarded.loading);
    setIsBlocked(status.rewarded.blocked);
  }, []);

  // Show rewarded ad with user-friendly fallback
  const showRewardedAd = useCallback((
    onReward: () => void,
    options?: {
      fallbackMessage?: string;
      allowFallback?: boolean;
    }
  ) => {
    const { fallbackMessage, allowFallback = true } = options || {};

    const wasShown = AdManager.showRewardedAd(
      () => {
        // Reward earned
        updateState();
        onReward();
      },
      () => {
        // Error or no reward - silent fallback if allowed
        updateState();
        
        if (allowFallback) {
          // Silent fallback - no annoying popup
          onReward();
        }
      },
      () => {
        // Ad closed
        updateState();
      }
    );

    if (!wasShown && allowFallback) {
      // Ad couldn't be shown - silent fallback, no popup
      onReward();
      return true; // Indicate success (user got access)
    }

    return wasShown;
  }, [updateState]);

  // Force reload ad
  const reloadAd = useCallback(() => {
    AdManager.loadAd('rewarded');
    setTimeout(updateState, 100);
  }, [updateState]);

  // Update state periodically
  useEffect(() => {
    updateState();
    const interval = setInterval(updateState, 2000);
    return () => clearInterval(interval);
  }, [updateState]);

  return {
    isLoaded,
    isLoading,
    isBlocked,
    showRewardedAd,
    reloadAd,
  };
}

// Hook for Ad Frequency Management (follows AdMob guidelines)
export function useAdFrequency() {
  const [lastInterstitialTime, setLastInterstitialTime] = useState<number>(0);
  const [sessionAdCount, setSessionAdCount] = useState<number>(0);

  const shouldShowInterstitialAd = useCallback(() => {
    const now = Date.now();
    const timeSinceLastAd = now - lastInterstitialTime;
    
    // Minimum 2 minutes between interstitial ads (AdMob guideline)
    const minInterval = 120000; // 2 minutes
    
    // Check time interval
    if (timeSinceLastAd < minInterval) {
      const remainingTime = Math.round((minInterval - timeSinceLastAd) / 1000);
      console.log(`⏱️ Too soon for interstitial - ${remainingTime}s remaining`);
      return false;
    }

    // Session limit (max 8 per session to avoid policy violations)
    if (sessionAdCount >= 8) {
      console.log('📊 Session interstitial limit reached');
      return false;
    }

    // Only 20% chance to show (conservative approach)
    const shouldShow = Math.random() < 0.20;
    console.log(`🎲 Interstitial chance: ${shouldShow ? 'SHOW' : 'SKIP'} (20% probability)`);
    
    return shouldShow;
  }, [lastInterstitialTime, sessionAdCount]);

  const recordInterstitialShown = useCallback(() => {
    const now = Date.now();
    setLastInterstitialTime(now);
    setSessionAdCount(prev => {
      const newCount = prev + 1;
      console.log(`📈 Interstitial shown - session count: ${newCount}/8`);
      return newCount;
    });
  }, []);

  const getAdStats = useCallback(() => {
    const now = Date.now();
    const timeSinceLastAd = now - lastInterstitialTime;
    
    return {
      lastAdTime: lastInterstitialTime,
      timeSinceLastAd,
      sessionAdCount,
      maxSessionAds: 8,
      canShowNow: shouldShowInterstitialAd(),
      nextAdAvailableIn: Math.max(0, 120000 - timeSinceLastAd),
    };
  }, [lastInterstitialTime, sessionAdCount, shouldShowInterstitialAd]);

  const resetSessionCount = useCallback(() => {
    setSessionAdCount(0);
    console.log('🔄 Session ad count reset');
  }, []);

  return {
    shouldShowInterstitialAd,
    recordInterstitialShown,
    getAdStats,
    resetSessionCount,
    sessionAdCount,
    maxSessionAds: 8,
  };
}

// Hook for Banner Ad Unit ID
export function useBannerAd() {
  const getBannerAdUnitId = useCallback(() => {
    return AdManager.getBannerAdUnitId();
  }, []);

  return {
    adUnitId: getBannerAdUnitId(),
  };
}