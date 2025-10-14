/**
 * Banner Ad Components - Production Ready
 * Optimized for performance and policy compliance
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads';
import { useBannerAd } from '../lib/adHooks';

interface BannerAdProps {
  size?: BannerAdSize;
  style?: any;
  showLoadingIndicator?: boolean;
}

// Main Banner Component
export function OptimizedBannerAd({ 
  size = BannerAdSize.BANNER,
  style,
  showLoadingIndicator = true,
}: BannerAdProps) {
  const { adUnitId } = useBannerAd();
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleAdLoaded = () => {
    console.log('✅ Banner ad loaded successfully');
    setIsLoaded(true);
    setIsLoading(false);
    setHasError(false);
  };

  const handleAdFailedToLoad = (error: any) => {
    console.error('❌ Banner ad failed to load:', error);
    setIsLoaded(false);
    setIsLoading(false);
    setHasError(true);
  };

  const handleAdOpened = () => {
    console.log('📺 Banner ad opened');
  };

  const handleAdClosed = () => {
    console.log('❌ Banner ad closed');
  };

  return (
    <View style={[styles.bannerContainer, style]}>
      <BannerAd
        unitId={adUnitId}
        size={size}
        requestOptions={{
          requestNonPersonalizedAdsOnly: false,
          keywords: ['education', 'learning', 'study', 'gujarati'],
        }}
        onAdLoaded={handleAdLoaded}
        onAdFailedToLoad={handleAdFailedToLoad}
        onAdOpened={handleAdOpened}
        onAdClosed={handleAdClosed}
      />
      
      {/* Loading Indicator */}
      {showLoadingIndicator && isLoading && (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>જાહેરાત લોડ થઈ રહી છે...</Text>
        </View>
      )}
      
      {/* Error Fallback */}
      {hasError && !isLoaded && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>શાળા શિક્ષક - શિક્ષણ માટેનું એપ્લિકેશન</Text>
        </View>
      )}
    </View>
  );
}

// Smart Banner - Adapts to screen size
export function SmartBannerAd({ style }: { style?: any }) {
  return (
    <OptimizedBannerAd 
      size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
      style={style}
    />
  );
}

// Full Banner for bottom placement
export function BottomBannerAd({ style }: { style?: any }) {
  return (
    <OptimizedBannerAd 
      size={BannerAdSize.FULL_BANNER}
      style={style}
    />
  );
}

// Large Banner for prominent placement
export function LargeBannerAd({ style }: { style?: any }) {
  return (
    <OptimizedBannerAd 
      size={BannerAdSize.LARGE_BANNER}
      style={style}
    />
  );
}

// Medium Rectangle Banner (good for content gaps)
export function MediumRectangleBannerAd({ style }: { style?: any }) {
  return (
    <OptimizedBannerAd 
      size={BannerAdSize.MEDIUM_RECTANGLE}
      style={style}
    />
  );
}

const styles = StyleSheet.create({
  bannerContainer: {
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    overflow: 'hidden',
    marginVertical: 4,
  },
  loadingContainer: {
    height: 50,
    width: '100%',
    backgroundColor: '#e9ecef',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
  },
  loadingText: {
    color: '#6c757d',
    fontSize: 12,
    fontFamily: 'System',
  },
  errorContainer: {
    height: 50,
    width: '100%',
    backgroundColor: '#e7f3ff',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#b8daff',
  },
  errorText: {
    color: '#004085',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
});

// Export main component as default for backward compatibility
export default OptimizedBannerAd;