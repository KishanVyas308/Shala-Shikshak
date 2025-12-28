import { Stack } from "expo-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { FontSizeProvider } from '../contexts/FontSizeContext';
import { useEffect, useState } from 'react';
import "./global.css";
import mobileAds, { InterstitialAd, AdEventType, BannerAd, BannerAdSize, TestIds, MaxAdContentRating } from "react-native-google-mobile-ads";
import { RewardedAd, RewardedAdEventType } from "react-native-google-mobile-ads";
import { AnalyticsService } from '../services/analytics';
import { NotificationProvider } from "@/contexts/NotificationContext";
import * as Notifications from "expo-notifications";
import { checkAppVersion } from '../services/versionCheck';
import UpdateAppModal from '../components/UpdateAppModal';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});


const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
    },
  },
});

// Child-directed ad options for COPPA & Families Policy compliance
const childDirectedAdOptions = {
  requestNonPersonalizedAdsOnly: true, // Required for children's apps
  keywords: ['education', 'school', 'learning', 'students', 'study'], // Education keywords only
  contentUrl: 'https://shalashikshak.in'
};

const rewardedAd = RewardedAd.createForAdRequest(
  __DEV__ ? TestIds.REWARDED : "ca-app-pub-3848233898449658/4582716526", // replace with your actual ID
  childDirectedAdOptions
);

const interstitial = InterstitialAd.createForAdRequest(
  __DEV__ ? TestIds.INTERSTITIAL : "ca-app-pub-3848233898449658/6247151989",
  childDirectedAdOptions
);

export default function RootLayout() {
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [currentVersion, setCurrentVersion] = useState('5.1.0');

  

  useEffect(() => {
    // Check app version
    const checkVersion = async () => {
      const versionCheck = await checkAppVersion();
      if (versionCheck.needsUpdate) {
        setCurrentVersion(versionCheck.currentVersion);
        setShowUpdateModal(true);
      }
    };

    checkVersion();

    // Track app open
    AnalyticsService.trackAppOpen();

    // Initialize SDK with child-directed and family-safe settings
    mobileAds()
      .setRequestConfiguration({
        // Maximum ad content rating - suitable for general audiences & children
        maxAdContentRating: MaxAdContentRating.G,
        // Tag for child-directed treatment (required for COPPA compliance)
        tagForChildDirectedTreatment: true,
        // Tag for under age of consent (required for GDPR compliance with children)
        tagForUnderAgeOfConsent: true,
      })
      .then(() => {
       
        return mobileAds().initialize();
      });

    // Preload first ad
    interstitial.load();

    // Reload on close
    const listener = interstitial.addAdEventListener(AdEventType.CLOSED, () => {
      interstitial.load(); // Prepare next ad
    });

    return () => listener();
  }, []);

  useEffect(() => {
  rewardedAd.load();

  const rewardListener = rewardedAd.addAdEventListener(RewardedAdEventType.EARNED_REWARD, reward => {
   
    rewardedAd.load();
  });

  return () => rewardListener();
}, []);


  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <FontSizeProvider>
          <NotificationProvider>
            <StatusBar style="dark" backgroundColor="#16a34a" />
            <SafeAreaView style={{ flex: 1 }} edges={['bottom']}>
              <Stack
                screenOptions={{
                  headerShown: false,
                  contentStyle: { backgroundColor: '#f8fafc' },
                  animation: 'ios_from_right',
                }}
              >
                <Stack.Screen
                  name="index"
                  options={{
                    title: 'શાળા શિક્ષક',
                    gestureEnabled: false,
                    headerTintColor: '#16a34a',
                  }}
                />
                <Stack.Screen
                  name="select-standards"
                  options={{
                    title: 'ધોરણ પસંદ કરો',
                    gestureEnabled: true,
                    headerTintColor: '#16a34a',
                  }}
                />
                <Stack.Screen
                  name="bookmarks"
                  options={{
                    title: 'બુકમાર્ક્સ',
                    gestureEnabled: true,
                    headerTintColor: '#16a34a',
                  }}
                />
                <Stack.Screen
                  name="recent"
                  options={{
                    title: 'તાજેતરના પ્રકરણો',
                    gestureEnabled: true,
                    headerTintColor: '#16a34a',
                  }}
                />
                <Stack.Screen
                  name="standard/[id]"
                  options={{
                    title: 'વિષયો',
                    gestureEnabled: true,
                    headerTintColor: '#16a34a',
                  }}
                />
                <Stack.Screen
                  name="subject/[id]"
                  options={{
                    title: 'પ્રકરણો',
                    gestureEnabled: true,
                    headerTintColor: '#16a34a',
                  }}
                />
                <Stack.Screen
                  name="chapter/[id]"
                  options={{
                    title: 'પ્રકરણ સંસાધનો',
                    gestureEnabled: true,
                    headerTintColor: '#16a34a',
                  }}
                />
                <Stack.Screen
                  name="pdf-viewer"
                  options={{
                    title: 'PDF વ્યૂઅર',
                    gestureEnabled: true,
                    headerTintColor: '#16a34a',
                  }}
                />
              </Stack>
              {/* <BannerAd
                unitId={__DEV__ ? TestIds.BANNER : "ca-app-pub-3848233898449658/3756720012"}
                size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
                requestOptions={{
                  requestNonPersonalizedAdsOnly: true,
                  networkExtras: {
                    collapsible: "bottom",
                  }
                }}
              /> */}
            </SafeAreaView>

            {/* Update App Modal */}
            <UpdateAppModal
              visible={showUpdateModal}
              currentVersion={currentVersion}
              onClose={() => setShowUpdateModal(false)}
            />
          </NotificationProvider>
        </FontSizeProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}