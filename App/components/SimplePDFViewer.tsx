import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, Linking } from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';

interface SimplePDFViewerProps {
  url: string;
  title?: string;
  onClose?: () => void;
}

export default function SimplePDFViewer({ url, title, onClose }: SimplePDFViewerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [currentMethod, setCurrentMethod] = useState(0);

  // Different methods to try loading PDF
  const loadMethods = [
    {
      name: 'Direct PDF',
      getUrl: () => url,
      description: 'સીધું PDF લોડ કરી રહ્યા છીએ'
    },
    {
      name: 'Google Drive',
      getUrl: () => `https://drive.google.com/viewerng/viewer?embedded=true&url=${encodeURIComponent(url)}`,
      description: 'Google Drive Viewer વાપરી રહ્યા છીએ'
    },
    {
      name: 'PDF.js',
      getUrl: () => `https://mozilla.github.io/pdf.js/web/viewer.html?file=${encodeURIComponent(url)}`,
      description: 'PDF.js Viewer વાપરી રહ્યા છીએ'
    }
  ];

  const handleLoadStart = () => {
    setIsLoading(true);
    setHasError(false);
  };

  const handleLoadEnd = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setIsLoading(false);
    
    // Try next method
    if (currentMethod < loadMethods.length - 1) {
      setCurrentMethod(currentMethod + 1);
      setIsLoading(true);
    } else {
      setHasError(true);
    }
  };

  const handleOpenExternal = async () => {
    try {
      Alert.alert(
        'બાહ્ય એપમાં ખોલો',
        'આ PDF તમારા ફોનના ડિફૉલ્ટ PDF વ્યુઅરમાં ખોલશે',
        [
          { text: 'રદ કરો', style: 'cancel' },
          { 
            text: 'ખોલો', 
            onPress: async () => {
              const supported = await Linking.canOpenURL(url);
              if (supported) {
                await Linking.openURL(url);
              } else {
                Alert.alert('ભૂલ', 'PDF ખોલી શકાતું નથી');
              }
            }
          }
        ]
      );
    } catch (error) {
      Alert.alert('ભૂલ', 'PDF ખોલવામાં સમસ્યા આવી');
    }
  };

  const handleRetry = () => {
    setCurrentMethod(0);
    setHasError(false);
    setIsLoading(true);
  };

  const currentUrl = loadMethods[currentMethod].getUrl();

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white border-b border-gray-200 px-4 py-3">
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="font-gujarati text-gray-900 text-lg font-semibold" numberOfLines={1}>
              {title || 'PDF વ્યુઅર'}
            </Text>
            <Text className="font-gujarati text-gray-500 text-sm">
              {loadMethods[currentMethod].name}
            </Text>
          </View>
          
          {onClose && (
            <TouchableOpacity 
              onPress={onClose}
              className="bg-gray-100 rounded-full p-2 ml-3"
            >
              <Ionicons name="close" size={20} color="#6b7280" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* PDF Content */}
      <View className="flex-1 relative">
        {!hasError && (
          <WebView
            key={currentMethod}
            source={{ uri: currentUrl }}
            style={{ flex: 1, backgroundColor: '#ffffff' }}
            onLoadStart={handleLoadStart}
            onLoadEnd={handleLoadEnd}
            onError={handleError}
            onHttpError={handleError}
            javaScriptEnabled={true}
            domStorageEnabled={false}
            allowsBackForwardNavigationGestures={false}
            allowsLinkPreview={false}
            scrollEnabled={true}
            bounces={false}
            scalesPageToFit={true}
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={false}
            incognito={true}
            cacheEnabled={false}
            userAgent="Mozilla/5.0 (Linux; Android 10; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Mobile Safari/537.36"
            allowsFullscreenVideo={false}
            mediaPlaybackRequiresUserAction={true}
            startInLoadingState={true}
          />
        )}
        
        {/* Loading State */}
        {isLoading && (
          <View className="absolute inset-0 bg-gray-50 items-center justify-center">
            <View className="bg-white rounded-2xl p-8 items-center shadow-sm max-w-xs">
              <View className="bg-purple-100 rounded-full p-4 mb-4">
                <Ionicons name="document-text" size={32} color="#7c3aed" />
              </View>
              <Text className="font-gujarati text-gray-700 text-lg font-medium mb-2">
                PDF લોડ થઈ રહ્યું છે...
              </Text>
              <Text className="font-gujarati text-gray-500 text-sm text-center">
                {loadMethods[currentMethod].description}
              </Text>
              <View className="flex-row items-center mt-3">
                <View className="w-2 h-2 bg-purple-600 rounded-full mr-1 animate-pulse" />
                <View className="w-2 h-2 bg-purple-400 rounded-full mr-1 animate-pulse" style={{ animationDelay: '0.2s' }} />
                <View className="w-2 h-2 bg-purple-300 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
              </View>
            </View>
          </View>
        )}
        
        {/* Error State */}
        {hasError && (
          <View className="absolute inset-0 bg-gray-50 items-center justify-center p-4">
            <View className="bg-white rounded-2xl p-8 items-center shadow-sm max-w-sm">
              <View className="bg-red-100 rounded-full p-4 mb-4">
                <Ionicons name="alert-circle" size={32} color="#ef4444" />
              </View>
              <Text className="font-gujarati text-gray-700 text-lg font-medium mb-2">
                PDF લોડ થઈ શક્યું નથી
              </Text>
              <Text className="font-gujarati text-gray-500 text-sm text-center mb-6">
                અમે બધા પદ્ધતિઓ અજમાવી છે. કદાચ PDF ફાઇલ ઉપલબ્ધ નથી અથવા નેટવર્ક સમસ્યા છે.
              </Text>
              
              <View className="flex-col gap-3 w-full">
                <TouchableOpacity 
                  onPress={handleRetry}
                  className="bg-purple-600 rounded-full px-6 py-3"
                >
                  <Text className="font-gujarati text-white text-sm font-medium text-center">
                    ફરીથી પ્રયાસ કરો
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  onPress={handleOpenExternal}
                  className="bg-gray-600 rounded-full px-6 py-3"
                >
                  <Text className="font-gujarati text-white text-sm font-medium text-center">
                    બાહ્ય એપમાં ખોલો
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </View>
      
      {/* Security Notice */}
      <View className="bg-purple-50 border-t border-purple-200 px-4 py-2">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center flex-1">
            <Ionicons name="shield-checkmark" size={16} color="#7c3aed" />
            <Text className="font-gujarati text-purple-700 text-xs ml-2">
              સુરક્ષિત વ્યુઅર - ડાઉનલોડ પ્રતિબંધિત
            </Text>
          </View>
          
          <Text className="font-gujarati text-purple-600 text-xs">
            પદ્ધતિ {currentMethod + 1}/{loadMethods.length}
          </Text>
        </View>
      </View>
    </View>
  );
}
