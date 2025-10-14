/**
 * Example Components showing how to use the new Ad System
 * Copy these patterns into your actual components
 */

import React from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useInterstitialAd, useRewardedAd, useAdFrequency } from '../lib/adHooks';
import { OptimizedBannerAd, BottomBannerAd } from './OptimizedBannerAd';

// Example: Navigation with Smart Interstitial Ads
export function NavigationWithAds() {
  const { showInterstitialAd, isLoaded: interstitialLoaded } = useInterstitialAd();
  const { shouldShowInterstitialAd, recordInterstitialShown } = useAdFrequency();

  const handleNavigation = (route: string) => {
    console.log(`🚀 Navigating to ${route}`);
    
    // Smart ad display following AdMob guidelines
    if (shouldShowInterstitialAd() && interstitialLoaded) {
      console.log('📺 Showing interstitial before navigation');
      
      const wasShown = showInterstitialAd(() => {
        recordInterstitialShown();
        router.push(route as any);
      });
      
      if (!wasShown) {
        // Ad not available, navigate immediately
        router.push(route as any);
      }
    } else {
      // Navigate directly (no spam, follows guidelines)
      router.push(route as any);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Navigation with Smart Ads</Text>
      
      {/* Banner Ad at top */}
      <OptimizedBannerAd style={styles.topBanner} />
      
      <TouchableOpacity 
        style={styles.button} 
        onPress={() => handleNavigation('/standard/1')}
      >
        <Text style={styles.buttonText}>Go to Standards</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.button} 
        onPress={() => handleNavigation('/bookmarks')}
      >
        <Text style={styles.buttonText}>View Bookmarks</Text>
      </TouchableOpacity>
      
      {/* Bottom Banner */}
      <BottomBannerAd style={styles.bottomBanner} />
    </View>
  );
}

// Example: Content Access with Rewarded Ads
export function ContentWithRewardedAds() {
  const { showRewardedAd, isLoaded: rewardedLoaded, isLoading } = useRewardedAd();

  const handlePremiumContent = () => {
    console.log('🎁 Requesting premium content access');
    
    if (!rewardedLoaded) {
      // Graceful fallback when ad not ready
      Alert.alert(
        'સામગ્રી એક્સેસ',
        'જાહેરાત તૈયાર નથી, પણ તમે સામગ્રી જોઈ શકો છો.',
        [
          {
            text: 'આગળ વધો',
            onPress: () => openPremiumContent(),
          },
        ]
      );
      return;
    }

    // Show rewarded ad
    showRewardedAd(
      () => {
        // Reward earned - grant access
        console.log('✅ Reward earned, granting access');
        openPremiumContent();
      },
      {
        fallbackMessage: 'જાહેરાત જોયા વિના પણ તમે આ સામગ્રી જોઈ શકો છો.',
        allowFallback: true,
      }
    );
  };

  const openPremiumContent = () => {
    Alert.alert('✅ Premium Content', 'તમને premium સામગ્રી મળી!');
    // Navigate to premium content
    router.push('/pdf-viewer' as any);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Premium Content Access</Text>
      
      <View style={styles.contentBox}>
        <Text style={styles.contentTitle}>Premium PDF</Text>
        <Text style={styles.contentDesc}>
          આ સામગ્રી જોવા માટે જાહેરાત જુઓ અથવા આગળ વધો
        </Text>
        
        <TouchableOpacity 
          style={[styles.premiumButton, isLoading && styles.buttonDisabled]} 
          onPress={handlePremiumContent}
          disabled={isLoading}
        >
          <Text style={styles.premiumButtonText}>
            {isLoading 
              ? 'લોડ થઈ રહ્યું છે...' 
              : rewardedLoaded 
                ? '📺 જાહેરાત જુઓ અને ખોલો'
                : '📂 સીધું ખોલો'
            }
          </Text>
        </TouchableOpacity>
      </View>
      
      {/* Banner ad for additional revenue */}
      <OptimizedBannerAd style={styles.contentBanner} />
    </View>
  );
}

// Example: Ad Status Debug Component (only in development)
export function AdStatusDebug() {
  const { isLoaded: interstitialLoaded, isLoading: interstitialLoading, isBlocked: interstitialBlocked } = useInterstitialAd();
  const { isLoaded: rewardedLoaded, isLoading: rewardedLoading, isBlocked: rewardedBlocked } = useRewardedAd();
  const { getAdStats } = useAdFrequency();
  
  if (!__DEV__) return null;
  
  const stats = getAdStats();
  
  return (
    <View style={styles.debugContainer}>
      <Text style={styles.debugTitle}>🔍 Ad Debug (DEV Only)</Text>
      
      <View style={styles.debugRow}>
        <Text style={styles.debugLabel}>Interstitial:</Text>
        <Text style={[
          styles.debugStatus,
          { color: interstitialBlocked ? '#dc3545' : interstitialLoaded ? '#28a745' : '#ffc107' }
        ]}>
          {interstitialBlocked ? '🚫 Blocked' : interstitialLoaded ? '✅ Ready' : interstitialLoading ? '⏳ Loading' : '❌ Not Ready'}
        </Text>
      </View>
      
      <View style={styles.debugRow}>
        <Text style={styles.debugLabel}>Rewarded:</Text>
        <Text style={[
          styles.debugStatus,
          { color: rewardedBlocked ? '#dc3545' : rewardedLoaded ? '#28a745' : '#ffc107' }
        ]}>
          {rewardedBlocked ? '🚫 Blocked' : rewardedLoaded ? '✅ Ready' : rewardedLoading ? '⏳ Loading' : '❌ Not Ready'}
        </Text>
      </View>
      
      <View style={styles.debugRow}>
        <Text style={styles.debugLabel}>Session Ads:</Text>
        <Text style={styles.debugValue}>{stats.sessionAdCount}/{stats.maxSessionAds}</Text>
      </View>
      
      <View style={styles.debugRow}>
        <Text style={styles.debugLabel}>Next Ad:</Text>
        <Text style={styles.debugValue}>
          {stats.canShowNow ? '✅ Available' : `${Math.round(stats.nextAdAvailableIn / 1000)}s`}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#ffffff',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
    color: '#333',
  },
  button: {
    backgroundColor: '#007bff',
    padding: 12,
    borderRadius: 8,
    marginVertical: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  premiumButton: {
    backgroundColor: '#28a745',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  premiumButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonDisabled: {
    backgroundColor: '#6c757d',
  },
  contentBox: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    marginVertical: 16,
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  contentTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  contentDesc: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  topBanner: {
    marginBottom: 16,
  },
  bottomBanner: {
    marginTop: 'auto',
    marginBottom: 16,
  },
  contentBanner: {
    marginTop: 16,
  },
  debugContainer: {
    position: 'absolute',
    top: 100,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.9)',
    padding: 12,
    borderRadius: 8,
    minWidth: 200,
    zIndex: 1000,
  },
  debugTitle: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  debugRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  debugLabel: {
    color: '#ffffff',
    fontSize: 10,
  },
  debugStatus: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  debugValue: {
    color: '#ffffff',
    fontSize: 10,
  },
});

// Export all examples
export default {
  NavigationWithAds,
  ContentWithRewardedAds,
  AdStatusDebug,
};