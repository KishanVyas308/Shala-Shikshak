import React, { useEffect } from 'react';
import { View, Text, Alert, Dimensions, Linking } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';
import * as ScreenCapture from 'expo-screen-capture';
import Header from '../components/Header';
import { getGoogleDocsViewerUrl, isGoogleDriveUrl } from '../utils/googleDrive';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function PDFViewer() {
  const { url, title } = useLocalSearchParams<{ url: string; title: string }>();
  
  // Prevent screenshot on Android
  useEffect(() => {
    const enableScreenCapture = async () => {
      try {
        await ScreenCapture.preventScreenCaptureAsync();
      } catch (error) {
        console.log('Screen capture prevention not available');
      }
    };

    const disableScreenCapture = async () => {
      try {
        await ScreenCapture.allowScreenCaptureAsync();
      } catch (error) {
        console.log('Screen capture allowance not available');
      }
    };

    enableScreenCapture();

    return () => {
      disableScreenCapture();
    };
  }, []);

  if (!url) {
    return (
      <View className="flex-1 bg-gray-50">
        <Header 
          title={title || 'PDF વ્યુઅર'}
          showBack
          onBackPress={() => router.back()}
        />
        
        <View className="flex-1 items-center justify-center">
          <View className="bg-white rounded-2xl p-8 items-center shadow-sm">
            <View className="bg-red-100 rounded-full p-4 mb-4">
              <Ionicons name="alert-circle" size={32} color="#ef4444" />
            </View>
            <Text className="font-gujarati text-gray-700 text-lg font-medium">
              PDF ઉપલબ્ધ નથી
            </Text>
            <Text className="font-gujarati text-gray-500 text-sm mt-2 text-center">
              આ PDF ફાઇલ મળી નથી
            </Text>
          </View>
        </View>
      </View>
    );
  }

  // Create a secure PDF viewer URL without download options
  // Handle Google Drive URLs and ngrok URLs
  let pdfUrl;
  
  if (url.startsWith('http')) {
    // If it's already a full URL, check if it's a Google Drive URL and convert it
    if (isGoogleDriveUrl(url)) {
      pdfUrl = getGoogleDocsViewerUrl(url);
    } else {
      pdfUrl = url;
    }
  } else {
    // For relative URLs (legacy support)
    const baseUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000';
    const cleanUrl = url.startsWith('/') ? url : `/${url}`;
    pdfUrl = `${baseUrl}${cleanUrl}`;
  }
  
  console.log('PDF URL:', pdfUrl); // Debug log to check the constructed URL
  console.log('Original URL:', url);
  console.log('Is Google Drive URL:', isGoogleDriveUrl(url));
  console.log('Base URL:', process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000');
  
  // Create HTML content to display PDF inline without download
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
      <title>PDF Viewer</title>
      <style>
        body {
          margin: 0;
          padding: 0;
          background: #f5f5f5;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
          overflow: hidden;
        }
        #pdfContainer {
          width: 100%;
          height: 100vh;
          background: white;
          display: flex;
          flex-direction: column;
        }
        iframe {
          width: 100%;
          height: 100%;
          border: none;
        }
        .loading {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          font-size: 16px;
          color: #666;
        }
        .error {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          height: 100vh;
          padding: 20px;
          text-align: center;
        }
        .error-icon {
          font-size: 48px;
          color: #ef4444;
          margin-bottom: 16px;
        }
        /* Prevent text selection and context menu */
        * {
          -webkit-touch-callout: none;
          -webkit-user-select: none;
          -khtml-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          user-select: none;
        }
      </style>
    </head>
    <body>
      <div id="pdfContainer">
        <div class="loading" id="loading">
          લોડ થઈ રહ્યું છે...
        </div>
        <iframe 
          id="pdfFrame"
          src="https://docs.google.com/gview?url=${encodeURIComponent(pdfUrl)}&embedded=true"
          style="display: none;"
          onload="showPDF()"
          onerror="showError()"
        ></iframe>
      </div>
      
      <script>
        console.log('Loading PDF from URL:', '${pdfUrl}');
        console.log('Google Docs Viewer URL:', 'https://docs.google.com/gview?url=${encodeURIComponent(pdfUrl)}&embedded=true');
        
        function showPDF() {
          console.log('PDF iframe loaded successfully');
          document.getElementById('loading').style.display = 'none';
          document.getElementById('pdfFrame').style.display = 'block';
        }
        
        function showError() {
          console.log('PDF loading error');
          document.getElementById('loading').innerHTML = 
            '<div class="error">' +
            '<div class="error-icon">⚠️</div>' +
            '<div>PDF લોડ થઈ શક્યું નથી</div>' +
            '<div style="font-size: 14px; color: #999; margin-top: 8px;">કૃપા કરીને ફરી પ્રયાસ કરો</div>' +
            '<div style="font-size: 12px; color: #ccc; margin-top: 8px; word-break: break-all;">URL: ${pdfUrl}</div>' +
            '</div>';
        }
        
        // Start loading process - no need to test URL since Google Docs will handle it
        setTimeout(showPDF, 2000);
        
        // Fallback timeout
        setTimeout(function() {
          if (document.getElementById('loading').style.display !== 'none') {
            console.log('Force showing PDF after timeout');
            showPDF();
          }
        }, 5000);
        
        // Prevent context menu
        document.addEventListener('contextmenu', function(e) {
          e.preventDefault();
          return false;
        });
        
        // Prevent text selection
        document.addEventListener('selectstart', function(e) {
          e.preventDefault();
          return false;
        });
        
        // Prevent drag
        document.addEventListener('dragstart', function(e) {
          e.preventDefault();
          return false;
        });
        
        // Prevent keyboard shortcuts for saving/printing
        document.addEventListener('keydown', function(e) {
          // Prevent Ctrl+S (Save), Ctrl+P (Print), Ctrl+A (Select All), etc.
          if (e.ctrlKey && (e.keyCode === 83 || e.keyCode === 80 || e.keyCode === 65)) {
            e.preventDefault();
            return false;
          }
          // Prevent F12 (Developer Tools)
          if (e.keyCode === 123) {
            e.preventDefault();
            return false;
          }
        });
      </script>
    </body>
    </html>
  `;

  return (
    <View className="flex-1 bg-gray-50">
      <Header 
        title={title || 'PDF વ્યુઅર'}
        showBack
        onBackPress={() => router.back()}
      />
      
      <View className="flex-1">
        <WebView
          source={{ html: htmlContent }}
          style={{ flex: 1 }}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          allowsInlineMediaPlayback={true}
          mediaPlaybackRequiresUserAction={false}
          allowsFullscreenVideo={false}
          allowsBackForwardNavigationGestures={false}
          onError={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent;
            console.warn('WebView error: ', nativeEvent);
            Alert.alert('ભૂલ', `WebView Error: ${nativeEvent.description}`);
          }}
          onHttpError={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent;
            console.warn('HTTP error: ', nativeEvent);
            Alert.alert('ભૂલ', `HTTP Error: ${nativeEvent.statusCode}`);
          }}
          onLoadStart={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent;
            console.log('WebView load start:', nativeEvent.url);
          }}
          onLoadEnd={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent;
            console.log('WebView load end:', nativeEvent.url);
          }}
          onMessage={(event) => {
            console.log('WebView message:', event.nativeEvent.data);
          }}
          // Allow all necessary permissions for ngrok
          allowFileAccess={true}
          allowFileAccessFromFileURLs={true}
          allowUniversalAccessFromFileURLs={true}
          mixedContentMode="compatibility"
          // Enable zoom for better PDF viewing
          scalesPageToFit={true}
          showsHorizontalScrollIndicator={true}
          showsVerticalScrollIndicator={true}
          // Allow PDF navigation
          allowsLinkPreview={false}
          textInteractionEnabled={true}
          // More permissive navigation for ngrok URLs
          onNavigationStateChange={(navState) => {
            console.log('Navigation state change:', navState);
            return true; // Allow all navigation for now
          }}
          onShouldStartLoadWithRequest={(request) => {
            console.log('Should start load with request:', request);
            return true; // Allow all requests for now
          }}
        />
      </View>
    </View>
  );
}
