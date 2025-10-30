import React, { useEffect, useState } from 'react';
import { View, Text, Linking, Alert } from 'react-native';
import { useLocalSearchParams, router, useFocusEffect } from 'expo-router';
import * as ScreenCapture from 'expo-screen-capture';
import { AnalyticsService } from '../services/analytics';
import { useFontSize } from '../contexts/FontSizeContext';
import Header from '../components/Header';
import LoadingState from '../components/LoadingState';

import WebView from 'react-native-webview';

export default function PDFViewer() {
  const { url, title } = useLocalSearchParams<{ url: string; title: string }>();
  const { getFontSizeClasses } = useFontSize();
  const [isContentReady, setIsContentReady] = useState(true); // Direct access without ads
  const [webViewError, setWebViewError] = useState(false);

  // Track PDF viewer usage
  useEffect(() => {
    if (url) {
      AnalyticsService.trackScreen('pdf-viewer');
    }
  }, [url]);

  // Check if URL is a YouTube link
  const isYouTubeUrl = (url: string) => {
    return url.includes('youtube.com') || url.includes('youtu.be');
  };

  const openInYouTubeApp = async (url: string) => {
    try {
      let videoId = '';
      
      if (url.includes('youtu.be/')) {
        videoId = url.split('youtu.be/')[1].split('?')[0];
      } else if (url.includes('youtube.com/watch?v=')) {
        videoId = url.split('v=')[1].split('&')[0];
      } else if (url.includes('youtube.com/embed/')) {
        videoId = url.split('/embed/')[1].split('?')[0];
      }
      
      if (videoId) {
        const youtubeUrl = `https://www.youtube.com/watch?v=${videoId}`;
        const canOpen = await Linking.canOpenURL(youtubeUrl);
        if (canOpen) {
          await Linking.openURL(youtubeUrl);
        } else {
          Alert.alert(
            'વીડિઓ ખોલી શકાયો નહીં',
            'YouTube app ઇન્સ્ટોલ કરો અથવા browser માં જુઓ',
            [
              { text: 'રદ કરો', style: 'cancel' },
              { text: 'Browser માં ખોલો', onPress: () => Linking.openURL(youtubeUrl) }
            ]
          );
        }
      }
    } catch (error) {
      console.log('Error opening YouTube:', error);
      Alert.alert('ભૂલ', 'વીડિઓ ખોલવામાં સમસ્યા');
    }
  };

  const handleWebViewError = () => {
    setWebViewError(true);
  };

  // Check if URL is a Google Drive link or doesn't end with .pdf
  const isGoogleDriveUrl = (url: string) => {
    return !url.endsWith('.pdf') || url.includes('drive.google.com') || url.includes('docs.google.com');
  };

  // Convert URL to appropriate viewer format
  const getViewerUrl = (url: string) => {
    console.log('Original URL:', url);
    
    // Handle YouTube URLs
    if (isYouTubeUrl(url)) {
      let videoId = '';
      
      // Extract video ID from different YouTube URL formats
      if (url.includes('youtube.com/watch?v=')) {
        videoId = url.match(/v=([^&]+)/)?.[1] || '';
      } else if (url.includes('youtu.be/')) {
        videoId = url.split('youtu.be/')[1]?.split('?')[0] || '';
      } else if (url.includes('youtube.com/embed/')) {
        videoId = url.split('embed/')[1]?.split('?')[0] || '';
      }
      
      if (videoId) {
        // Try different embed approaches for better compatibility
        const embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=0&controls=1&fs=1&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3&cc_load_policy=0&disablekb=1&origin=https://shalashikshak.in`;
        console.log('YouTube embed URL (privacy-enhanced):', embedUrl);
        return embedUrl;
      }
      
      console.log('Fallback to original YouTube URL:', url);
      return url;
    }
    
    if (isGoogleDriveUrl(url)) {
      // If it's already a drive link, extract file ID and use viewer
      if (url.includes('drive.google.com') || url.includes('docs.google.com')) {
        const fileIdMatch = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
        if (fileIdMatch) {
          const driveUrl = `https://drive.google.com/file/d/${fileIdMatch[1]}/preview`;
          console.log('Google Drive preview URL:', driveUrl);
          return driveUrl;
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
      const pdfUrl = `https://mozilla.github.io/pdf.js/web/viewer.html?file=${encodeURIComponent(url)}`;
      console.log('PDF.js viewer URL:', pdfUrl);
      return pdfUrl;
    }
  };

  const viewerUrl = getViewerUrl(url || '');
  const isYouTubeViewer = isYouTubeUrl(url || '');
  const isDriveViewer = isGoogleDriveUrl(url || '') && !isYouTubeViewer;

  // Show loading screen while content is not ready
  if (!isContentReady) {
    return (
      <View className="flex-1 bg-gray-50">
        <Header
          title={title || 'લોડ થઈ રહ્યું છે...'}
          showBack
          onBackPress={() => router.back()}
        />
        <LoadingState />
        <View className="items-center mb-4">
          <Text className={`text-gray-600 text-center px-4 ${getFontSizeClasses().text}`}>
            {isYouTubeViewer 
                ? 'વિડિયો તૈયાર થઈ રહ્યો છે...'
                : 'PDF તૈયાર થઈ રહ્યું છે...'
            }
          </Text>
        </View>
      </View>
    );
  }

  // Handle navigation requests (like "Open in app")
  const handleShouldStartLoadWithRequest = (request: any) => {
    const { url: requestUrl } = request;
    console.log('Navigation request to:', requestUrl);
    
    // Allow the initial load
    if (requestUrl === viewerUrl) {
      return true;
    }
    
    // Handle YouTube app opening or external links
    if (isYouTubeViewer && (
      requestUrl.includes('youtube://') || 
      requestUrl.includes('vnd.youtube') ||
      requestUrl.includes('youtube.com/redirect') ||
      requestUrl.includes('m.youtube.com') ||
      requestUrl.includes('youtube.com/watch') ||
      (requestUrl.includes('youtube.com') && !requestUrl.includes('embed'))
    )) {
      console.log('YouTube external link detected:', requestUrl);
      
      // Show options to user
      Alert.alert(
        'YouTube વિડિયો',
        'આ વિડિયો YouTube એપ્લિકેશનમાં ખોલવું છે?',
        [
          {
            text: 'રદ કરો',
            style: 'cancel',
          },
          {
            text: 'YouTube માં ખોલો',
            onPress: () => {
              const originalUrl = url || requestUrl;
              Linking.canOpenURL(originalUrl)
                .then((supported) => {
                  if (supported) {
                    Linking.openURL(originalUrl);
                  } else {
                    // Try browser fallback
                    Linking.openURL(requestUrl).catch(() => {
                      Alert.alert(
                        'Error',
                        'YouTube ખોલી શકાયું નથી',
                        [{ text: 'OK' }]
                      );
                    });
                  }
                })
                .catch(() => {
                  Alert.alert(
                    'Error', 
                    'YouTube એપ્લિકેશન ખોલી શકાયું નથી',
                    [{ text: 'OK' }]
                  );
                });
            }
          }
        ]
      );
      
      return false; // Prevent WebView from loading the URL
    }
    
    // Allow other navigation
    console.log('Allowing navigation to:', requestUrl);
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
        allowsInlineMediaPlayback={true}
        mediaPlaybackRequiresUserAction={false}
        mixedContentMode="compatibility"
        originWhitelist={['*']}
        userAgent="Mozilla/5.0 (Linux; Android 10; SM-G973F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36"
        onShouldStartLoadWithRequest={handleShouldStartLoadWithRequest}
        onError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.error('WebView error:', nativeEvent);
          
          if (isYouTubeViewer) {
            Alert.alert(
              'YouTube વિડિયો એરર', 
              'આ વિડિયો WebView માં ચલાવી શકાતો નથી. YouTube એપ્લિકેશનમાં ખોલવું છે?',
              [
                { text: 'પાછા જાઓ', onPress: () => router.back() },
                { 
                  text: 'YouTube માં ખોલો', 
                  onPress: () => {
                    const originalUrl = url || '';
                    Linking.openURL(originalUrl).catch(() => {
                      Alert.alert('Error', 'YouTube ખોલી શકાયું નથી');
                    });
                  }
                }
              ]
            );
          } else {
            Alert.alert(
              'લોડિંગ એરર', 
              'સામગ્રી લોડ કરવામાં સમસ્યા આવી છે. કૃપા કરીને ફરીથી પ્રયાસ કરો.',
              [
                { text: 'પાછા જાઓ', onPress: () => router.back() },
                { text: 'ફરી પ્રયાસ કરો', onPress: () => setIsContentReady(false) }
              ]
            );
          }
        }}
        onHttpError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.error('WebView HTTP error:', nativeEvent);
          
          if (isYouTubeViewer && (nativeEvent.statusCode === 403 || nativeEvent.statusCode === 404)) {
            Alert.alert(
              'YouTube વિડિયો અનુપલબ્ધ', 
              'આ વિડિયો embed કરવા માટે પ્રતિબંધિત છે. YouTube એપ્લિકેશનમાં ખોલવું છે?',
              [
                { text: 'પાછા જાઓ', onPress: () => router.back() },
                { 
                  text: 'YouTube માં ખોલો', 
                  onPress: () => {
                    const originalUrl = url || '';
                    Linking.openURL(originalUrl);
                  }
                }
              ]
            );
          }
        }}
        onLoadStart={() => console.log('WebView started loading')}
        onLoadEnd={() => console.log('WebView finished loading')}
        injectedJavaScript={
          isYouTubeViewer 
            ? `
              // For YouTube videos - improve compatibility and controls
              (function() {
                console.log('YouTube video player setup');
                
                // Wait for YouTube player to load
                setTimeout(() => {
                  // Remove any overlay that might block interaction
                  const overlays = document.querySelectorAll('[class*="ytp-"]');
                  overlays.forEach(overlay => {
                    if (overlay.style) {
                      overlay.style.pointerEvents = 'auto';
                    }
                  });
                  
                  // Ensure video controls are available
                  const videos = document.querySelectorAll('video');
                  videos.forEach(video => {
                    video.controls = true;
                    video.setAttribute('webkit-playsinline', 'false');
                    video.setAttribute('playsinline', 'false');
                    
                    // Add click handler for play/pause
                    video.addEventListener('click', function() {
                      if (this.paused) {
                        this.play();
                      } else {
                        this.pause();
                      }
                    });
                  });
                  
                  // Make iframe responsive
                  const iframes = document.querySelectorAll('iframe');
                  iframes.forEach(iframe => {
                    iframe.style.width = '100%';
                    iframe.style.height = '100%';
                    iframe.setAttribute('allowfullscreen', 'true');
                  });
                  
                  console.log('YouTube setup complete');
                }, 2000);
                
                // Handle touch events better
                document.addEventListener('touchstart', function(e) {
                  console.log('Touch detected on YouTube player');
                }, true);
              })();
              true;
            `
            : isDriveViewer 
            ? `
              // For Google Drive viewer - hide download and sharing options
              setTimeout(() => {
                console.log('Setting up Google Drive viewer');
                
                // Hide toolbar buttons
                const toolbar = document.querySelector('[role="toolbar"]');
                if (toolbar) {
                  const buttons = toolbar.querySelectorAll('div[role="button"]');
                  buttons.forEach(button => {
                    const ariaLabel = button.getAttribute('aria-label') || '';
                    if (ariaLabel.includes('Download') || 
                        ariaLabel.includes('Print') || 
                        ariaLabel.includes('Share') ||
                        ariaLabel.includes('ડાઉનલોડ') ||
                        ariaLabel.includes('પ્રિન્ટ') ||
                        ariaLabel.includes('શેર')) {
                      button.style.display = 'none';
                    }
                  });
                }
                
                // Hide additional download controls
                const downloadControls = document.querySelectorAll(
                  '[data-tooltip*="Download"], [data-tooltip*="Print"], ' +
                  '[aria-label*="Download"], [aria-label*="Print"], ' +
                  '[title*="Download"], [title*="Print"]'
                );
                downloadControls.forEach(control => {
                  control.style.display = 'none';
                });
                
                console.log('Google Drive setup complete');
              }, 3000);
              true;
            `
            : `
              // For PDF.js viewer - hide download and print buttons
              setTimeout(() => {
                console.log('Setting up PDF.js viewer');
                
                const elementsToHide = [
                  '#toolbarViewerRight',
                  '#download',
                  '#print',
                  '#openFile',
                  '#secondaryDownload',
                  '#secondaryPrint'
                ];
                
                elementsToHide.forEach(selector => {
                  const element = document.querySelector(selector);
                  if (element) {
                    element.style.display = 'none';
                  }
                });
                
                console.log('PDF.js setup complete');
              }, 2000);
              true;
            `
        }
        renderLoading={() => (
          <View className="flex-1 justify-center items-center">
            <Text className={`text-gray-600 ${getFontSizeClasses().text}`}>
              {isYouTubeViewer ? 'YouTube વિડિયો લોડ થઈ રહ્યો છે...' : 
               isDriveViewer ? 'Google Drive દસ્તાવેજ લોડ થઈ રહ્યો છે...' : 
               'PDF લોડ થઈ રહ્યું છે...'}
            </Text>
          </View>
        )}
      />
      
    </View>
  );
}
