import React, { useEffect } from 'react';
import { View, Text, Linking, Alert } from 'react-native';
import { useLocalSearchParams, router, useFocusEffect } from 'expo-router';
import * as ScreenCapture from 'expo-screen-capture';
import Header from '../components/Header';

import WebView from 'react-native-webview';

export default function PDFViewer() {
  const { url, title } = useLocalSearchParams<{ url: string; title: string }>();

  // Check if URL is a YouTube link
  const isYouTubeUrl = (url: string) => {
    return url.includes('youtube.com') || url.includes('youtu.be');
  };

  // Check if URL is a Google Drive link or doesn't end with .pdf
  const isGoogleDriveUrl = (url: string) => {
    return !url.endsWith('.pdf') || url.includes('drive.google.com') || url.includes('docs.google.com');
  };

  // Convert URL to appropriate viewer format
  const getViewerUrl = (url: string) => {
    // Handle YouTube URLs
    if (isYouTubeUrl(url)) {
      // Convert to embed format for better WebView compatibility
      if (url.includes('youtube.com/watch?v=')) {
        const videoId = url.match(/v=([^&]+)/)?.[1];
        return `https://www.youtube.com/embed/${videoId}?autoplay=1&controls=1&fs=1&modestbranding=1`;
      } else if (url.includes('youtu.be/')) {
        const videoId = url.split('youtu.be/')[1]?.split('?')[0];
        return `https://www.youtube.com/embed/${videoId}?autoplay=1&controls=1&fs=1&modestbranding=1`;
      }
      return url;
    }
    
    if (isGoogleDriveUrl(url)) {
      // If it's already a drive link, extract file ID and use viewer
      if (url.includes('drive.google.com') || url.includes('docs.google.com')) {
        const fileIdMatch = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
        if (fileIdMatch) {
          return `https://drive.google.com/file/d/${fileIdMatch[1]}/preview`;
        }
        // If already in preview format, use as is
        if (url.includes('/preview')) {
          return url;
        }
        return `${url}/preview`;
      } else {
        // Assume it's a file ID for Google Drive
        return `https://drive.google.com/file/d/${url}/preview`;
      }
    } else {
      // Regular PDF URL - use PDF.js viewer
      return `https://mozilla.github.io/pdf.js/web/viewer.html?file=${encodeURIComponent(url)}`;
    }
  };

  const viewerUrl = getViewerUrl(url || '');
  const isYouTubeViewer = isYouTubeUrl(url || '');
  const isDriveViewer = isGoogleDriveUrl(url || '') && !isYouTubeViewer;

  // Handle navigation requests (like "Open in app")
  const handleShouldStartLoadWithRequest = (request: any) => {
    const { url: requestUrl } = request;
    
    // Allow the initial load
    if (requestUrl === viewerUrl) {
      return true;
    }
    
    // Handle YouTube app opening
    if (isYouTubeViewer && (
      requestUrl.includes('youtube://') || 
      requestUrl.includes('vnd.youtube') ||
      requestUrl.includes('youtube.com/redirect') ||
      (requestUrl.includes('youtube.com') && requestUrl !== viewerUrl)
    )) {
      // Try to open in YouTube app
      Linking.canOpenURL(requestUrl)
        .then((supported) => {
          if (supported) {
            Linking.openURL(requestUrl);
          } else {
            // Fallback to original URL if YouTube app not available
            const originalUrl = url || '';
            Linking.openURL(originalUrl).catch(() => {
              Alert.alert(
                'Error',
                'YouTube એપ્લિકેશન ખોલી શકાયું નથી',
                [{ text: 'OK' }]
              );
            });
          }
        })
        .catch(() => {
          // Final fallback
          const originalUrl = url || '';
          Linking.openURL(originalUrl).catch(() => {
            Alert.alert(
              'Error', 
              'YouTube એપ્લિકેશન ખોલી શકાયું નથી',
              [{ text: 'OK' }]
            );
          });
        });
      
      return false; // Prevent WebView from loading the URL
    }
    
    // Allow other URLs to load normally
    return true;
  };

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
        source={{ uri: viewerUrl }}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        allowsFullscreenVideo={true}
        mediaPlaybackRequiresUserAction={false}
        allowsInlineMediaPlayback={true}
        onShouldStartLoadWithRequest={handleShouldStartLoadWithRequest}
        injectedJavaScript={
          isYouTubeViewer 
            ? `
              // For YouTube videos - enable full screen and optimal viewing
              setTimeout(() => {
                // Ensure video can go full screen
                const videos = document.querySelectorAll('video');
                videos.forEach(video => {
                  video.setAttribute('webkit-playsinline', 'false');
                  video.setAttribute('playsinline', 'false');
                  
                  // Enable full screen controls
                  video.addEventListener('loadedmetadata', () => {
                    video.controls = true;
                  });
                });
                
                // Try to make the video player responsive
                const iframe = document.querySelector('iframe');
                if (iframe) {
                  iframe.style.width = '100%';
                  iframe.style.height = '100%';
                  iframe.setAttribute('allowfullscreen', 'true');
                  iframe.setAttribute('webkitallowfullscreen', 'true');
                  iframe.setAttribute('mozallowfullscreen', 'true');
                }
                
                console.log('YouTube video configured for full screen');
              }, 1000);
              true;
            `
            : isDriveViewer 
            ? `
              // For Google Drive viewer - hide download and sharing options
              setTimeout(() => {
                const toolbar = document.querySelector('[role="toolbar"]');
                if (toolbar) {
                  const buttons = toolbar.querySelectorAll('div[role="button"]');
                  buttons.forEach(button => {
                    const ariaLabel = button.getAttribute('aria-label');
                    if (ariaLabel && (
                      ariaLabel.includes('Download') || 
                      ariaLabel.includes('Print') || 
                      ariaLabel.includes('Share') ||
                      ariaLabel.includes('ડાઉનલોડ') ||
                      ariaLabel.includes('પ્રિન્ટ') ||
                      ariaLabel.includes('શેર')
                    )) {
                      button.style.display = 'none';
                    }
                  });
                }
                
                // Hide additional controls
                const controls = document.querySelectorAll('[data-tooltip*="Download"], [data-tooltip*="Print"], [aria-label*="Download"], [aria-label*="Print"]');
                controls.forEach(control => {
                  control.style.display = 'none';
                });
              }, 2000);
              true;
            `
            : `
              // For PDF.js viewer - hide download button and other controls
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
            `
        }
        renderLoading={() => (
          <View className="flex-1 justify-center items-center">
            <Text className="text-gray-600">
              {isYouTubeViewer ? 'YouTube વિડિયો લોડ થઈ રહ્યો છે...' : 
               isDriveViewer ? 'Google Drive દસ્તાવેજ લોડ થઈ રહ્યો છે...' : 
               'PDF લોડ થઈ રહ્યું છે...'}
            </Text>
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
