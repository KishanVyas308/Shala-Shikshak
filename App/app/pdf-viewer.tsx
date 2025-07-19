import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import { useLocalSearchParams, router, useFocusEffect } from 'expo-router';
import * as ScreenCapture from 'expo-screen-capture';
import Header from '../components/Header';

import WebView from 'react-native-webview';

export default function PDFViewer() {
  const { url, title } = useLocalSearchParams<{ url: string; title: string }>();

  // Prevent screenshots and screen recording when component mounts
  useEffect(() => {
    const preventScreenCapture = async () => {
      try {
        // Prevent screenshots and screen recording
        await ScreenCapture.preventScreenCaptureAsync();
      } catch (error) {
        console.warn('Error setting up screen capture protection:', error);
      }
    };

    preventScreenCapture();

    // Cleanup function to allow screen capture when component unmounts
    return () => {
      ScreenCapture.allowScreenCaptureAsync().catch((error) => {
        console.warn('Error removing screen capture protection:', error);
      });
    };
  }, []);

  // Re-enable screen capture protection when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      const enableProtection = async () => {
        try {
          await ScreenCapture.preventScreenCaptureAsync();
        } catch (error) {
          console.warn('Error enabling screen capture protection on focus:', error);
        }
      };

      enableProtection();

      // Cleanup when screen loses focus
      return () => {
        ScreenCapture.allowScreenCaptureAsync().catch((error) => {
          console.warn('Error disabling screen capture protection on blur:', error);
        });
      };
    }, [])
  );

  return (
    <View className="flex-1 bg-gray-50">
      <Header
        title={title || 'PDF વ્યુઅર'}
        showBack
        onBackPress={() => router.back()}
      />

      <WebView
        source={{
          uri: `https://mozilla.github.io/pdf.js/web/viewer.html?file=${encodeURIComponent(url || '')}`
        }}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        injectedJavaScript={`
          // Hide download button and other controls
          setTimeout(() => {
            const toolbar = document.querySelector('#toolbarViewerRight');
            if (toolbar) toolbar.style.display = 'none';
            
            const downloadButton = document.querySelector('#download');
            if (downloadButton) downloadButton.style.display = 'none';
            
            const printButton = document.querySelector('#print');
            if (printButton) printButton.style.display = 'none';
            
            const openFile = document.querySelector('#openFile');
            if (openFile) openFile.style.display = 'none';
          }, 1000);
          true;
        `}
        renderLoading={() => (
          <View className="flex-1 justify-center items-center">
            <Text className="text-gray-600">PDF લોડ થઈ રહ્યું છે...</Text>
          </View>
        )}
        onError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.warn('WebView error: ', nativeEvent);
        }}
      />
    </View>
  );
}
