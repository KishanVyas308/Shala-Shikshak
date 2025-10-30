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
