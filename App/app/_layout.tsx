import { Stack } from "expo-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from 'react-native-safe-area-context';
import "./global.css";

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
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <StatusBar style="dark" backgroundColor="#7c3aed" />
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
              headerTintColor: '#7c3aed',
            }} 
          />
          <Stack.Screen 
            name="select-standards" 
            options={{
              title: 'ધોરણ પસંદ કરો',
              gestureEnabled: true,
              headerTintColor: '#7c3aed',
            }} 
          />
          <Stack.Screen 
            name="bookmarks" 
            options={{
              title: 'બુકમાર્ક્સ',
              gestureEnabled: true,
              headerTintColor: '#7c3aed',
            }} 
          />
          <Stack.Screen 
            name="standard/[id]" 
            options={{
              title: 'વિષયો',
              gestureEnabled: true,
              headerTintColor: '#7c3aed',
            }} 
          />
          <Stack.Screen 
            name="subject/[id]" 
            options={{
              title: 'પ્રકરણો',
              gestureEnabled: true,
              headerTintColor: '#7c3aed',
            }} 
          />
          <Stack.Screen 
            name="pdf-viewer" 
            options={{
              title: 'PDF વ્યૂઅર',
              gestureEnabled: true,
              headerTintColor: '#7c3aed',
            }} 
          />
        </Stack>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
