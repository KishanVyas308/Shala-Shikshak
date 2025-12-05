// utils/showRewardedAd.ts
import { RewardedAd, RewardedAdEventType, TestIds } from "react-native-google-mobile-ads";

const adUnitId = __DEV__
  ? TestIds.REWARDED
  : "ca-app-pub-8871302345306784/4621951459";

let rewardedAd = RewardedAd.createForAdRequest(adUnitId, {
  requestNonPersonalizedAdsOnly: true,
  keywords: ['education', 'school', 'learning', 'students', 'study'],
  contentUrl: 'https://shalashikshak.in'
});

let isRewardedLoaded = false;
let rewardEarnedCallback: (() => void) | null = null;

rewardedAd.addAdEventListener(RewardedAdEventType.LOADED, () => {
  isRewardedLoaded = true;
  console.log("Rewarded ad loaded");
});

rewardedAd.addAdEventListener(RewardedAdEventType.EARNED_REWARD, (reward) => {
  console.log("User earned reward:", reward);
  // Call the callback when reward is earned
  if (rewardEarnedCallback) {
    rewardEarnedCallback();
    rewardEarnedCallback = null;
  }
  // Immediately load next ad after reward earned
  setTimeout(() => {
    rewardedAd.load();
  }, 500);
});

rewardedAd.load();

export const showRewardedAd = async (onReward: () => void, onAdNotAvailable: () => void): Promise<boolean> => {
  // If ad not loaded, call fallback
  if (!isRewardedLoaded) {
    console.log("Rewarded ad not ready, using fallback");
    onAdNotAvailable();
    return false;
  }

  try {
    console.log("Showing rewarded ad...");
    rewardEarnedCallback = onReward;
    isRewardedLoaded = false; // Mark as not loaded immediately
    
    await rewardedAd.show();
    
    // Wait a bit for the reward event to fire (reward event comes slightly after show() completes)
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // If we reach here and callback wasn't called, user closed without completing
    if (rewardEarnedCallback !== null) {
      console.log("User closed ad without completing");
      rewardEarnedCallback = null;
      // Load next ad
      rewardedAd.load();
      // Don't open content
      return false;
    }
    
    console.log("Reward ad completed successfully");
    // Callback was called (reward earned) - ad will reload in the event listener
    return true;
  } catch (error) {
    console.warn("Error showing rewarded ad:", error);
    rewardEarnedCallback = null;
    // On error, use fallback ad and reload
    rewardedAd.load();
    onAdNotAvailable();
    return false;
  }
};

export const isRewardedAdAvailable = (): boolean => {
  return isRewardedLoaded;
};
