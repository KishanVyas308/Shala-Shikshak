/**
 * AdManager - Singleton for managing all ad operations
 * Prevents spamming, handles retries, and manages ad lifecycle
 */

import { 
  InterstitialAd, 
  RewardedAd, 
  AdEventType, 
  RewardedAdEventType,
  TestIds 
} from 'react-native-google-mobile-ads';
import { Platform } from 'react-native';

// Production Ad Unit IDs - Replace with your actual IDs
const AD_UNIT_IDS = {
  banner: Platform.select({
    ios: __DEV__ ? TestIds.BANNER : 'ca-app-pub-3397220667540126/8068445014',
    android: __DEV__ ? TestIds.BANNER : 'ca-app-pub-3397220667540126/8068445014',
  }),
  interstitial: Platform.select({
    ios: __DEV__ ? TestIds.INTERSTITIAL : 'ca-app-pub-3397220667540126/4759755392',
    android: __DEV__ ? TestIds.INTERSTITIAL : 'ca-app-pub-3397220667540126/4759755392',
  }),
  rewarded: Platform.select({
    ios: __DEV__ ? TestIds.REWARDED : 'ca-app-pub-3397220667540126/1383655159',
    android: __DEV__ ? TestIds.REWARDED : 'ca-app-pub-3397220667540126/1383655159',
  }),
};

type AdType = 'interstitial' | 'rewarded';

interface AdState {
  ad: InterstitialAd | RewardedAd | null;
  isLoaded: boolean;
  isLoading: boolean;
  lastLoadAttempt: number;
  retryCount: number;
  isBlocked: boolean;
}

class AdManagerSingleton {
  private static instance: AdManagerSingleton;
  
  // Ad states
  private interstitialState: AdState = this.createInitialState();
  private rewardedState: AdState = this.createInitialState();
  
  // Configuration
  private readonly MIN_RETRY_DELAY = 5000; // 5 seconds
  private readonly MAX_RETRY_DELAY = 30000; // 30 seconds
  private readonly MAX_RETRIES = 3;
  private readonly RATE_LIMIT_DELAY = 60000; // 1 minute for rate limiting
  private readonly MIN_LOAD_INTERVAL = 10000; // 10 seconds between loads
  private readonly MAX_CONSECUTIVE_NO_FILLS = 5; // Switch to test ads after this many no-fills
  
  // No-fill tracking
  private consecutiveNoFills = { interstitial: 0, rewarded: 0 };
  private isDevelopment = __DEV__;
  private lastLogTime = { interstitial: 0, rewarded: 0 };
  private readonly LOG_THROTTLE_DELAY = 30000; // Only log every 30 seconds

  private constructor() {
    this.log('AdManager initialized');
  }

  public static getInstance(): AdManagerSingleton {
    if (!AdManagerSingleton.instance) {
      AdManagerSingleton.instance = new AdManagerSingleton();
    }
    return AdManagerSingleton.instance;
  }

  private createInitialState(): AdState {
    return {
      ad: null,
      isLoaded: false,
      isLoading: false,
      lastLoadAttempt: 0,
      retryCount: 0,
      isBlocked: false,
    };
  }

  private log(message: string, type: 'info' | 'error' | 'warn' = 'info', throttleKey?: AdType) {
    // Throttle repetitive logs to prevent spam
    if (throttleKey && (type === 'warn' || type === 'info')) {
      const now = Date.now();
      if (now - this.lastLogTime[throttleKey] < this.LOG_THROTTLE_DELAY) {
        return; // Skip this log
      }
      this.lastLogTime[throttleKey] = now;
    }

    const prefix = `[AdManager]`;
    switch (type) {
      case 'error':
        console.error(`${prefix} ❌ ${message}`);
        break;
      case 'warn':
        console.warn(`${prefix} ⚠️ ${message}`);
        break;
      default:
        console.log(`${prefix} ℹ️ ${message}`);
    }
  }

  private getState(adType: AdType): AdState {
    return adType === 'interstitial' ? this.interstitialState : this.rewardedState;
  }

  private shouldUseTestAds(adType: AdType): boolean {
    return this.isDevelopment || this.consecutiveNoFills[adType] > this.MAX_CONSECUTIVE_NO_FILLS;
  }

  private getAdUnitId(adType: AdType): string {
    if (this.shouldUseTestAds(adType)) {
      const testId = adType === 'interstitial' ? TestIds.INTERSTITIAL : TestIds.REWARDED;
      // Throttle this log message to prevent spam
      this.log(`Using test ad unit for ${adType} due to consecutive no-fills: ${this.consecutiveNoFills[adType]}`, 'info', adType);
      return testId;
    }
    return adType === 'interstitial' ? AD_UNIT_IDS.interstitial! : AD_UNIT_IDS.rewarded!;
  }

  private canLoadAd(adType: AdType): boolean {
    const state = this.getState(adType);
    const now = Date.now();
    
    if (state.isLoading) {
      this.log(`${adType} ad already loading`);
      return false;
    }
    
    if (state.isLoaded) {
      this.log(`${adType} ad already loaded`);
      return false;
    }
    
    if (state.isBlocked) {
      this.log(`${adType} ad requests are blocked due to rate limiting`);
      return false;
    }
    
    if (now - state.lastLoadAttempt < this.MIN_LOAD_INTERVAL) {
      const remainingTime = this.MIN_LOAD_INTERVAL - (now - state.lastLoadAttempt);
      this.log(`${adType} ad rate limited, ${Math.round(remainingTime / 1000)}s remaining`);
      return false;
    }
    
    return true;
  }

  private calculateRetryDelay(retryCount: number): number {
    return Math.min(
      this.MIN_RETRY_DELAY * Math.pow(2, retryCount),
      this.MAX_RETRY_DELAY
    );
  }

  private handleAdError(adType: AdType, error: any): void {
    const state = this.getState(adType);
    const errorMessage = error?.message || error?.toString() || 'Unknown error';
    
    this.log(`${adType} ad error: ${errorMessage}`, 'error');
    
    state.isLoading = false;
    state.isLoaded = false;
    state.ad = null;
    
    // Handle specific error types
    if (errorMessage.includes('Too many recently failed requests') || 
        errorMessage.includes('invalid-request')) {
      this.log(`${adType} ad rate limited - blocking requests temporarily`, 'warn');
      state.isBlocked = true;
      state.retryCount = 0;
      
      // Unblock after delay
      setTimeout(() => {
        state.isBlocked = false;
        this.log(`${adType} ad unblocked, ready for new requests`);
      }, this.RATE_LIMIT_DELAY);
      
      return;
    }
    
    // Handle no-fill errors (common in development)
    if (errorMessage.includes('no-fill')) {
      this.consecutiveNoFills[adType]++;
      
      // Throttle no-fill logs to prevent spam
      this.log(`${adType} ad no-fill #${this.consecutiveNoFills[adType]} - this is normal`, 'warn', adType);
      
      // If too many consecutive no-fills, consider using test ads
      if (this.consecutiveNoFills[adType] > this.MAX_CONSECUTIVE_NO_FILLS) {
        this.log(`${adType} switching to test ads due to consistent no-fills`, 'warn', adType);
      }
      
      // Stop aggressive retrying after many no-fills - wait much longer
      const noFillDelay = Math.min(
        this.MIN_RETRY_DELAY * Math.pow(2, Math.min(this.consecutiveNoFills[adType], 6)), // Exponential backoff
        300000 // Max 5 minutes
      );
      
      // Don't retry if we have too many consecutive no-fills
      if (this.consecutiveNoFills[adType] <= 15) {
        setTimeout(() => {
          if (!state.isBlocked) {
            this.loadAd(adType);
          }
        }, noFillDelay);
      } else {
        // Stop retrying completely after 15 consecutive no-fills
        this.log(`${adType} ad stopped retrying due to too many no-fills`, 'warn');
        state.isBlocked = true;
      }
      return;
    }
    
    // Handle other errors with exponential backoff
    if (state.retryCount < this.MAX_RETRIES) {
      const delay = this.calculateRetryDelay(state.retryCount);
      state.retryCount++;
      
      this.log(`${adType} ad retrying in ${delay}ms (attempt ${state.retryCount}/${this.MAX_RETRIES})`);
      
      setTimeout(() => {
        if (!state.isBlocked) {
          this.loadAd(adType);
        }
      }, delay);
    } else {
      this.log(`${adType} ad max retries exceeded, stopping attempts`, 'warn');
      state.retryCount = 0;
    }
  }

  public async loadAd(adType: AdType): Promise<void> {
    if (!this.canLoadAd(adType)) {
      return;
    }
    
    const state = this.getState(adType);
    const adUnitId = this.getAdUnitId(adType);
    
    this.log(`Loading ${adType} ad...`);
    
    state.isLoading = true;
    state.lastLoadAttempt = Date.now();
    
    try {
      if (adType === 'interstitial') {
        const interstitialAd = InterstitialAd.createForAdRequest(adUnitId, {
          requestNonPersonalizedAdsOnly: false,
          keywords: ['education', 'learning', 'study'],
        });

        // Setup event listeners for interstitial
        const unsubscribeLoaded = interstitialAd.addAdEventListener(AdEventType.LOADED, () => {
          this.log(`${adType} ad loaded successfully ✅`);
          state.isLoaded = true;
          state.isLoading = false;
          state.retryCount = 0;
          state.isBlocked = false;
          // Reset no-fill count on successful load
          this.consecutiveNoFills[adType] = 0;
        });

        const unsubscribeClosed = interstitialAd.addAdEventListener(AdEventType.CLOSED, () => {
          this.log(`${adType} ad closed`);
          state.isLoaded = false;
          state.ad = null;
          
          // Cleanup listeners
          unsubscribeLoaded();
          unsubscribeClosed();
          unsubscribeError();
          
          // Preload next ad after delay
          setTimeout(() => {
            if (!state.isBlocked) {
              this.loadAd(adType);
            }
          }, this.MIN_RETRY_DELAY);
        });

        const unsubscribeError = interstitialAd.addAdEventListener(AdEventType.ERROR, (error: any) => {
          unsubscribeLoaded();
          unsubscribeClosed();
          unsubscribeError();
          this.handleAdError(adType, error);
        });

        // Store ad instance and load
        state.ad = interstitialAd;
        interstitialAd.load();
        
      } else {
        const rewardedAd = RewardedAd.createForAdRequest(adUnitId, {
          requestNonPersonalizedAdsOnly: false,
          keywords: ['education', 'learning', 'study', 'reward'],
        });

        // Setup event listeners for rewarded
        const unsubscribeLoaded = rewardedAd.addAdEventListener(RewardedAdEventType.LOADED, () => {
          this.log(`${adType} ad loaded successfully ✅`);
          state.isLoaded = true;
          state.isLoading = false;
          state.retryCount = 0;
          state.isBlocked = false;
          // Reset no-fill count on successful load
          this.consecutiveNoFills[adType] = 0;
        });

        const unsubscribeClosed = rewardedAd.addAdEventListener(AdEventType.CLOSED, () => {
          this.log(`${adType} ad closed`);
          state.isLoaded = false;
          state.ad = null;
          
          // Cleanup listeners
          unsubscribeLoaded();
          unsubscribeClosed();
          unsubscribeError();
          
          // Preload next ad after delay
          setTimeout(() => {
            if (!state.isBlocked) {
              this.loadAd(adType);
            }
          }, this.MIN_RETRY_DELAY);
        });

        const unsubscribeError = rewardedAd.addAdEventListener(AdEventType.ERROR, (error: any) => {
          unsubscribeLoaded();
          unsubscribeClosed();
          unsubscribeError();
          this.handleAdError(adType, error);
        });

        // Store ad instance and load
        state.ad = rewardedAd;
        rewardedAd.load();
      }
      
    } catch (error) {
      this.handleAdError(adType, error);
    }
  }

  public isAdLoaded(adType: AdType): boolean {
    return this.getState(adType).isLoaded;
  }

  public isAdLoading(adType: AdType): boolean {
    return this.getState(adType).isLoading;
  }

  public isAdBlocked(adType: AdType): boolean {
    return this.getState(adType).isBlocked;
  }

  public showInterstitialAd(onAdClosed?: () => void): boolean {
    const state = this.interstitialState;
    
    if (!state.ad || !state.isLoaded) {
      this.log('Interstitial ad not ready', 'warn');
      onAdClosed?.();
      return false;
    }

    try {
      this.log('Showing interstitial ad 📺');
      
      // Add closed listener for this specific show
      const interstitialAd = state.ad as InterstitialAd;
      const unsubscribeClosed = interstitialAd.addAdEventListener(AdEventType.CLOSED, () => {
        onAdClosed?.();
        unsubscribeClosed();
      });

      interstitialAd.show();
      return true;
    } catch (error) {
      this.log(`Error showing interstitial ad: ${error}`, 'error');
      onAdClosed?.();
      return false;
    }
  }

  public showRewardedAd(
    onReward: () => void,
    onError?: () => void,
    onClosed?: () => void
  ): boolean {
    const state = this.rewardedState;
    
    if (!state.ad || !state.isLoaded) {
      this.log('Rewarded ad not ready', 'warn');
      onError?.();
      return false;
    }

    try {
      this.log('Showing rewarded ad 🎁');
      
      let rewardEarned = false;
      const rewardedAd = state.ad as RewardedAd;
      
      // Add reward listener
      const unsubscribeEarned = rewardedAd.addAdEventListener(
        RewardedAdEventType.EARNED_REWARD,
        () => {
          this.log('Reward earned! 🎉');
          rewardEarned = true;
          onReward();
          unsubscribeEarned();
        }
      );

      // Add closed listener
      const unsubscribeClosed = rewardedAd.addAdEventListener(AdEventType.CLOSED, () => {
        if (!rewardEarned) {
          this.log('Rewarded ad closed without earning reward');
          onError?.();
        }
        onClosed?.();
        unsubscribeClosed();
      });

      // Add error listener
      const unsubscribeError = rewardedAd.addAdEventListener(AdEventType.ERROR, (error: any) => {
        this.log(`Error showing rewarded ad: ${error}`, 'error');
        if (!rewardEarned) {
          onError?.();
        }
        unsubscribeError();
      });

      rewardedAd.show();
      return true;
    } catch (error) {
      this.log(`Error showing rewarded ad: ${error}`, 'error');
      onError?.();
      return false;
    }
  }

  // Initialize ads (call this once on app start)
  public initialize(): void {
    this.log('Initializing ads...');
    
    // Load initial ads with delay to avoid spam
    setTimeout(() => {
      this.loadAd('interstitial');
    }, 2000);
    
    setTimeout(() => {
      this.loadAd('rewarded');
    }, 4000);
  }

  // Get banner ad unit ID
  public getBannerAdUnitId(): string {
    return AD_UNIT_IDS.banner!;
  }

  // Get ad status for debugging
  public getAdStatus() {
    return {
      interstitial: {
        loaded: this.interstitialState.isLoaded,
        loading: this.interstitialState.isLoading,
        blocked: this.interstitialState.isBlocked,
        retryCount: this.interstitialState.retryCount,
      },
      rewarded: {
        loaded: this.rewardedState.isLoaded,
        loading: this.rewardedState.isLoading,
        blocked: this.rewardedState.isBlocked,
        retryCount: this.rewardedState.retryCount,
      },
    };
  }
}

// Export singleton instance
export const AdManager = AdManagerSingleton.getInstance();