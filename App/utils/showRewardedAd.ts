// utils/showRewardedAd.ts
import { RewardedAd, RewardedAdEventType, TestIds } from "react-native-google-mobile-ads";

const adUnitId = __DEV__
  ? TestIds.REWARDED
  : "ca-app-pub-3397220667540126/1383655159";

let rewardedAd = RewardedAd.createForAdRequest(adUnitId, {
  requestNonPersonalizedAdsOnly: true,
  keywords: ['education', 'school', 'learning', 'students', 'study'],
  contentUrl: 'https://shalashikshak.in'
});

let isRewardedLoaded = false;

rewardedAd.addAdEventListener(RewardedAdEventType.LOADED, () => {
  isRewardedLoaded = true;
});

rewardedAd.addAdEventListener(RewardedAdEventType.EARNED_REWARD, (reward) => {
  console.log("User earned reward:", reward);
});

rewardedAd.load();

export const showRewardedAd = async (onReward: () => void) => {
  if (!isRewardedLoaded) {
    console.log("Rewarded ad not ready yet");
    onReward();
    return;
  }

  try {
    console.log("Showing rewarded ad...");
    await rewardedAd.show(); // waits until closed
    onReward(); // after ad is closed
  } catch (error) {
    console.warn("Error showing rewarded ad:", error);
    onReward(); // fallback: still open content
  } finally {
    isRewardedLoaded = false;
    rewardedAd.load(); // reload for next use
  }
};
