import { Stack } from "expo-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { FontSizeProvider } from '../contexts/FontSizeContext';
import { useEffect } from 'react';
import "./global.css";
import MobileAds from "react-native-google-mobile-ads";
import { AdManager } from '../lib/AdManager';


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

export default function RootLayout() {
  useEffect(() => {
    // App initialization
    console.log('App initialized successfully');
  }, []);

  useEffect(() => {
    // Initialize AdMob
    MobileAds()
      .initialize()
      .then(adapterStatuses => {
        console.log('✅ AdMob initialized', adapterStatuses);
        // Initialize our ad system after AdMob is ready
        AdManager.initialize();
      });
  }, []);


  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <FontSizeProvider>
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
          </SafeAreaView>
        </FontSizeProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}