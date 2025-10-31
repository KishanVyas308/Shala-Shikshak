// utils/showInterstitialAd.ts
import { InterstitialAd, AdEventType, TestIds } from "react-native-google-mobile-ads";

const interstitial = InterstitialAd.createForAdRequest(
    __DEV__ ? TestIds.INTERSTITIAL : "ca-app-pub-3397220667540126/4759755392",
    { requestNonPersonalizedAdsOnly: true }
);

let isAdLoaded = false;

interstitial.addAdEventListener(AdEventType.LOADED, () => {
    isAdLoaded = true;
});
interstitial.addAdEventListener(AdEventType.CLOSED, () => {
    interstitial.load(); // reload for next use
});

interstitial.load();

let lastAdShown = 0;
export const showInterstitialAd = () => {
    const now = Date.now();
    if (now - lastAdShown < 60000) return; // 60 seconds cooldown

    if (isAdLoaded) {
        interstitial.show();
        lastAdShown = now;
        isAdLoaded = false;
    } else {
        console.log("Interstitial not ready yet");
    }
};
