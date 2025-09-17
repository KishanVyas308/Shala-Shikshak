import { useEffect, useCallback, useState } from 'react';
import { Button, Platform, View, Alert, Text } from 'react-native';
import { 
  BannerAd, 
  BannerAdSize, 
  RewardedAd, 
  RewardedAdEventType, 
  TestIds, 
  AdEventType,
  InterstitialAd 
} from 'react-native-google-mobile-ads';

// Production Ad Unit IDs - With fallback to test IDs for development
const bannerAdUnitId = Platform.select({
  ios: __DEV__ ? TestIds.BANNER : 'ca-app-pub-3397220667540126/8068445014',
  android: __DEV__ ? TestIds.BANNER : 'ca-app-pub-3397220667540126/8068445014',
});

const interstitialAdUnitId = Platform.select({
  ios: __DEV__ ? TestIds.INTERSTITIAL : 'ca-app-pub-3397220667540126/4759755392',
  android: __DEV__ ? TestIds.INTERSTITIAL : 'ca-app-pub-3397220667540126/4759755392',
});

const rewardedAdUnitId = Platform.select({
  ios: __DEV__ ? TestIds.REWARDED : 'ca-app-pub-3397220667540126/1383655159',
  android: __DEV__ ? TestIds.REWARDED : 'ca-app-pub-3397220667540126/1383655159',
});

// Universal Banner Ad Component
export function UniversalBanner({ 
  size = BannerAdSize.BANNER,
  style,
}: {
  size?: BannerAdSize;
  style?: any;
}) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  return (
    <View style={[{ alignItems: 'center', backgroundColor: '#f5f5f5' }, style]}>
      <BannerAd
        unitId={bannerAdUnitId || ''}
        size={size}
        requestOptions={{
          requestNonPersonalizedAdsOnly: false,
          keywords: ['education', 'learning', 'study'],
        }}
        onAdLoaded={() => {
          console.log('✅ Banner ad loaded successfully');
          setIsLoaded(true);
          setIsLoading(false);
        }}
        onAdFailedToLoad={(error) => {
          console.error('❌ Banner ad failed to load:', error);
          setIsLoaded(false);
          setIsLoading(false);
        }}
        onAdOpened={() => console.log('📺 Banner ad opened')}
        onAdClosed={() => console.log('❌ Banner ad closed')}
      />
      {isLoading && (
        <View style={{ height: 50, width: '100%', backgroundColor: '#e5e5e5', alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: '#666', fontSize: 12 }}>જાહેરાત લોડ થઈ રહી છે...</Text>
        </View>
      )}
    </View>
  );
}

// Smart Banner - adapts to screen size
export function SmartBanner({ style }: { style?: any }) {
  return (
    <UniversalBanner 
      size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
      style={style}
    />
  );
}

// Full Banner for bottom placement
export function BottomBanner({ style }: { style?: any }) {
  return (
    <UniversalBanner 
      size={BannerAdSize.FULL_BANNER}
      style={style}
    />
  );
}

// Interstitial Ad Hook
export function useInterstitialAd() {
  const [interstitial, setInterstitial] = useState<InterstitialAd | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const loadInterstitialAd = useCallback(() => {
    if (loading) return;
    
    console.log('Loading interstitial ad... (attempt', retryCount + 1, ')');
    setLoading(true);
    
    // Clean up existing ad if any
    if (interstitial) {
      setInterstitial(null);
      setLoaded(false);
    }
    
    const interstitialAd = InterstitialAd.createForAdRequest(interstitialAdUnitId || '', {
      requestNonPersonalizedAdsOnly: false,
      keywords: ['education', 'learning', 'study'],
    });

    const unsubscribeLoaded = interstitialAd.addAdEventListener(AdEventType.LOADED, () => {
      console.log('✅ Interstitial ad loaded successfully');
      setLoaded(true);
      setLoading(false);
      setRetryCount(0); // Reset retry count on success
    });

    const unsubscribeClosed = interstitialAd.addAdEventListener(AdEventType.CLOSED, () => {
      console.log('Interstitial ad closed - preloading next ad');
      setLoaded(false);
      setInterstitial(null);
      // Preload next ad immediately for better UX
      setTimeout(() => {
        setLoading(false);
        loadInterstitialAd();
      }, 1000);
    });

    const unsubscribeError = interstitialAd.addAdEventListener(AdEventType.ERROR, (error) => {
      console.error('❌ Interstitial ad error:', error);
      setLoaded(false);
      setLoading(false);
      setInterstitial(null);
      
      // Retry with exponential backoff, max 3 retries
      if (retryCount < 3) {
        const delay = Math.pow(2, retryCount) * 2000; // 2s, 4s, 8s
        console.log(`Retrying interstitial ad in ${delay}ms (attempt ${retryCount + 2})`);
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
          loadInterstitialAd();
        }, delay);
      } else {
        console.log('Max retries reached for interstitial ad');
      }
    });

    interstitialAd.load();
    setInterstitial(interstitialAd);

    return () => {
      unsubscribeLoaded();
      unsubscribeClosed();
      unsubscribeError();
    };
  }, [retryCount]);

  const showInterstitialAd = useCallback((onAdClosed?: () => void, forceShow: boolean = false) => {
    console.log('showInterstitialAd called - loaded:', loaded, 'forceShow:', forceShow);
    
    if (!interstitial || !loaded) {
      console.log('❌ Interstitial ad not ready - proceeding without ad');
      onAdClosed?.();
      return false; // Return false to indicate no ad was shown
    }

    // Random chance check (35% by default)
    if (!forceShow && Math.random() > 0.35) {
      console.log('⚡ Random chance - skipping interstitial ad');
      onAdClosed?.();
      return false;
    }

    console.log('📺 Showing interstitial ad');
    const unsubscribeClosed = interstitial.addAdEventListener(AdEventType.CLOSED, () => {
      console.log('Interstitial closed by user');
      onAdClosed?.();
      unsubscribeClosed();
    });

    interstitial.show();
    return true; // Return true to indicate ad was shown
  }, [interstitial, loaded]);

  // Force reload function for manual retry
  const reloadAd = useCallback(() => {
    setRetryCount(0);
    setLoaded(false);
    setLoading(false);
    setInterstitial(null);
    loadInterstitialAd();
  }, []);

  useEffect(() => {
    const cleanup = loadInterstitialAd();
    
    // Preload ads more aggressively in background
    const preloadInterval = setInterval(() => {
      if (!loaded && !loading) {
        console.log('🔄 Background preload attempt');
        loadInterstitialAd();
      }
    }, 30000); // Try every 30 seconds

    return () => {
      cleanup?.();
      clearInterval(preloadInterval);
    };
  }, []);

  return {
    loaded,
    loading,
    showInterstitialAd,
    loadInterstitialAd,
    reloadAd,
  };
}

// Rewarded Ad Hook
export function useRewardedAd() {
  const [rewarded, setRewarded] = useState<RewardedAd | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);

  // Create and load rewarded ad
  const loadRewardedAd = useCallback(() => {
    if (loading) {
      console.log('⏳ Rewarded ad already loading...');
      return;
    }
    
    console.log('🔄 Loading rewarded ad...');
    setLoading(true);
    
    // Clean up existing ad
    if (rewarded) {
      setRewarded(null);
      setLoaded(false);
    }
    
    const rewardedAd = RewardedAd.createForAdRequest(rewardedAdUnitId || '', {
      requestNonPersonalizedAdsOnly: false,
      keywords: ['education', 'learning', 'study', 'reward'],
    });

    // Add event listeners
    const unsubscribeLoaded = rewardedAd.addAdEventListener(RewardedAdEventType.LOADED, () => {
      console.log('✅ Rewarded ad loaded successfully');
      setLoaded(true);
      setLoading(false);
    });

    const unsubscribeEarned = rewardedAd.addAdEventListener(
      RewardedAdEventType.EARNED_REWARD,
      (reward) => {
        console.log('🎉 User earned reward:', reward);
      },
    );

    const unsubscribeClosed = rewardedAd.addAdEventListener(AdEventType.CLOSED, () => {
      console.log('❌ Rewarded ad closed - preloading next ad');
      setLoaded(false);
      setRewarded(null);
      // Preload next ad after a short delay
      setTimeout(() => {
        setLoading(false);
        loadRewardedAd();
      }, 2000);
    });

    const unsubscribeError = rewardedAd.addAdEventListener(AdEventType.ERROR, (error) => {
      console.error('❌ Rewarded ad error:', error);
      setLoaded(false);
      setLoading(false);
      setRewarded(null);
      
      // Retry loading after 5 seconds
      setTimeout(() => {
        console.log('🔄 Retrying rewarded ad after error...');
        loadRewardedAd();
      }, 5000);
    });

    // Load the ad
    rewardedAd.load();
    setRewarded(rewardedAd);

    // Return cleanup function
    return () => {
      unsubscribeLoaded();
      unsubscribeEarned();
      unsubscribeClosed();
      unsubscribeError();
    };
  }, [loading]);

  // Show rewarded ad with callback
  const showRewardedAd = useCallback((onReward: () => void, onError?: () => void) => {
    console.log('📺 showRewardedAd called - loaded:', loaded, 'loading:', loading);
    
    if (!rewarded || !loaded) {
      console.log('❌ Rewarded ad not ready');
      
      // Try to reload the ad first
      if (!loading) {
        loadRewardedAd();
      }
      
      Alert.alert(
        'જાહેરાત તૈયાર નથી',
        'જાહેરાત લોડ થઈ રહી છે. તમે આગળ વધી શકો છો.',
        [
          { 
            text: 'આગળ વધો', 
            onPress: () => {
              console.log('User chose to proceed without rewarded ad');
              onReward();
            }
          },
          { 
            text: '2 સેકન્ડ રાહ જુઓ', 
            onPress: () => {
              // Give it a moment to load and try again
              setTimeout(() => {
                if (loaded && rewarded) {
                  console.log('🔄 Trying to show rewarded ad again after wait');
                  rewarded.show();
                } else {
                  console.log('Still not ready - proceeding without ad');
                  onReward();
                }
              }, 2000);
            }
          }
        ]
      );
      return;
    }

    console.log('📺 Showing rewarded ad');
    let rewardEarned = false;
    
    // Set up reward listener
    const unsubscribeEarned = rewarded.addAdEventListener(
      RewardedAdEventType.EARNED_REWARD,
      () => {
        console.log('🎉 Reward earned - calling onReward');
        rewardEarned = true;
        onReward();
        unsubscribeEarned();
      },
    );

    const unsubscribeError = rewarded.addAdEventListener(AdEventType.ERROR, (error) => {
      console.error('❌ Error showing rewarded ad:', error);
      if (!rewardEarned) {
        onError?.();
      }
      unsubscribeError();
    });

    const unsubscribeClosed = rewarded.addAdEventListener(AdEventType.CLOSED, () => {
      console.log('❌ Rewarded ad closed');
      // If user closes ad without earning reward, still give access
      if (!rewardEarned) {
        console.log('Ad closed without reward - still giving access');
        onReward();
      }
      unsubscribeClosed();
    });

    // Show the ad
    try {
      rewarded.show();
    } catch (error) {
      console.error('Error showing rewarded ad:', error);
      onReward(); // Fallback to allow access
    }
  }, [rewarded, loaded, loading]);

  // Initialize ad on mount
  useEffect(() => {
    console.log('🚀 Initializing rewarded ad system');
    const cleanup = loadRewardedAd();
    
    return cleanup;
  }, []);

  return {
    loaded,
    loading,
    showRewardedAd,
    loadRewardedAd,
  };
}

// Rewarded Ad Component for testing
export function RewardedAdExample() {
  const { loaded, loading, showRewardedAd } = useRewardedAd();

  const handleShowAd = () => {
    console.log('🎯 Testing rewarded ad - loaded:', loaded, 'loading:', loading);
    showRewardedAd(
      () => {
        Alert.alert('પુરસ્કાર મળ્યો!', 'તમે સફળતાપૂર્વક જાહેરાત જોઈ અને પુરસ્કાર મેળવ્યો!');
      },
      () => {
        Alert.alert('ભૂલ', 'જાહેરાત બતાવવામાં સમસ્યા આવી');
      }
    );
  };

  return (
    <View style={{ padding: 10 }}>
      <Button
        title={
          loading 
            ? "લોડ થઈ રહ્યું છે..." 
            : loaded 
              ? "પુરસ્કાર જાહેરાત જુઓ" 
              : "જાહેરાત તૈયાર નથી (ટેસ્ટ માટે)"
        }
        onPress={handleShowAd}
        disabled={false} // Allow testing even when not loaded
      />
      <Text style={{ fontSize: 12, color: '#666', textAlign: 'center', marginTop: 5 }}>
        Status: {loading ? 'લોડિંગ' : loaded ? 'તૈયાર' : 'તૈયાર નથી'}
      </Text>
    </View>
  );
}

// Ad Frequency Manager Hook - Simplified and improved
export function useAdFrequency() {
  const [lastInterstitialTime, setLastInterstitialTime] = useState<number>(0);
  const [interstitialCount, setInterstitialCount] = useState<number>(0);

  const shouldShowInterstitialAd = useCallback(() => {
    const now = Date.now();
    const timeSinceLastAd = now - lastInterstitialTime;
    const minInterval = 45000; // 45 seconds between interstitials (reduced from 1 minute)
    
    // Always check time interval first
    if (timeSinceLastAd < minInterval) {
      console.log(`⏱️ Too soon - ${Math.round((minInterval - timeSinceLastAd) / 1000)}s remaining`);
      return false;
    }

    // Check daily limit (more generous)
    const maxAdsPerDay = 20; // 20 interstitials per day
    const oneDayMs = 24 * 60 * 60 * 1000;
    
    if (interstitialCount >= maxAdsPerDay) {
      // Reset count after a day
      if (timeSinceLastAd > oneDayMs) {
        setInterstitialCount(0);
        return true;
      }
      console.log('📊 Daily limit reached');
      return false;
    }

    // 40% chance to show ad
    const shouldShow = Math.random() < 0.40;
    console.log(`🎲 Random check: ${shouldShow ? 'SHOW' : 'SKIP'} ad (40% chance)`);
    
    return shouldShow;
  }, [lastInterstitialTime, interstitialCount]);

  const recordInterstitialShown = useCallback(() => {
    const now = Date.now();
    setLastInterstitialTime(now);
    setInterstitialCount(prev => {
      const newCount = prev + 1;
      console.log(`📈 Interstitial shown - count: ${newCount}`);
      return newCount;
    });
  }, []);

  const getAdStats = useCallback(() => {
    const now = Date.now();
    const timeSinceLastAd = now - lastInterstitialTime;
    return {
      lastAdTime: lastInterstitialTime,
      timeSinceLastAd,
      adCount: interstitialCount,
      canShowNow: shouldShowInterstitialAd(),
    };
  }, [lastInterstitialTime, interstitialCount, shouldShowInterstitialAd]);

  return {
    shouldShowInterstitialAd,
    recordInterstitialShown,
    getAdStats,
    // Legacy support
    canShowInterstitial: shouldShowInterstitialAd,
  };
}

// Export for backward compatibility
export const BannerExample = BottomBanner;

// Debug Ad Status Component (only shows in development)
export function AdDebugStatus() {
  const { loaded: interstitialLoaded, loading: interstitialLoading } = useInterstitialAd();
  const { loaded: rewardedLoaded, loading: rewardedLoading } = useRewardedAd();
  const { getAdStats } = useAdFrequency();
  
  if (!__DEV__) return null;
  
  const stats = getAdStats();
  
  return (
    <View style={{ 
      position: 'absolute', 
      top: 100, 
      right: 10, 
      backgroundColor: 'rgba(0,0,0,0.8)', 
      padding: 8, 
      borderRadius: 4,
      zIndex: 1000,
    }}>
      <Text style={{ color: 'white', fontSize: 10 }}>
        📊 Ad Status (DEV):
      </Text>
      <Text style={{ color: interstitialLoaded ? 'green' : 'red', fontSize: 10 }}>
        Interstitial: {interstitialLoaded ? '✅' : interstitialLoading ? '⏳' : '❌'}
      </Text>
      <Text style={{ color: rewardedLoaded ? 'green' : 'red', fontSize: 10 }}>
        Rewarded: {rewardedLoaded ? '✅' : rewardedLoading ? '⏳' : '❌'}
      </Text>
      <Text style={{ color: 'yellow', fontSize: 10 }}>
        Count: {stats.adCount} | Next: {stats.canShowNow ? '✅' : '❌'}
      </Text>
    </View>
  );
}