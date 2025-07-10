import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, Linking } from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';

interface ReliablePDFViewerProps {
  url: string;
  title?: string;
  onClose?: () => void;
}

export default function ReliablePDFViewer({ url, title, onClose }: ReliablePDFViewerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [currentStrategy, setCurrentStrategy] = useState(0);

  // Different PDF viewing strategies
  const strategies = [
    {
      name: 'Google Drive Viewer',
      url: `https://drive.google.com/viewerng/viewer?embedded=true&url=${encodeURIComponent(url)}`,
      description: 'Google Drive PDF Viewer'
    },
    {
      name: 'Mozilla PDF.js',
      url: `https://mozilla.github.io/pdf.js/web/viewer.html?file=${encodeURIComponent(url)}`,
      description: 'Mozilla PDF.js Viewer'
    },
    {
      name: 'Office Online',
      url: `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(url)}`,
      description: 'Microsoft Office Online'
    },
    {
      name: 'Direct PDF',
      url: url,
      description: 'Direct PDF Loading'
    }
  ];

  const currentViewer = strategies[currentStrategy];

  const handleLoadStart = () => {
    setIsLoading(true);
    setHasError(false);
  };

  const handleLoadEnd = () => {
    setIsLoading(false);
  };

  const handleError = (error: any) => {
    console.log(`PDF Load Error with ${currentViewer.name}:`, error);
    setIsLoading(false);
    
    // Try next strategy
    if (currentStrategy < strategies.length - 1) {
      setTimeout(() => {
        setCurrentStrategy(currentStrategy + 1);
        setIsLoading(true);
        setHasError(false);
      }, 1500);
    } else {
      setHasError(true);
    }
  };

  const handleRetry = () => {
    setCurrentStrategy(0);
    setHasError(false);
    setIsLoading(true);
  };

  const handleOpenExternal = async () => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('ભૂલ', 'PDF ખોલી શકાતું નથી');
      }
    } catch (error) {
      Alert.alert('ભૂલ', 'PDF ખોલવામાં સમસ્યા આવી');
    }
  };

  const handleTryNext = () => {
    if (currentStrategy < strategies.length - 1) {
      setCurrentStrategy(currentStrategy + 1);
      setIsLoading(true);
      setHasError(false);
    }
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white border-b border-gray-200 px-4 py-3 flex-row items-center justify-between">
        <View className="flex-1">
          <Text className="font-gujarati text-gray-900 text-lg font-semibold" numberOfLines={1}>
            {title || 'PDF વ્યુઅર'}
          </Text>
          <Text className="font-gujarati text-gray-500 text-sm">
            {currentViewer.description}
          </Text>
        </View>
        
        <View className="flex-row items-center">
          <Text className="font-gujarati text-purple-600 text-xs mr-3">
            {currentStrategy + 1}/{strategies.length}
          </Text>
          
          {onClose && (
            <TouchableOpacity 
              onPress={onClose}
              className="bg-gray-100 rounded-full p-2"
            >
              <Ionicons name="close" size={20} color="#6b7280" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* PDF Viewer */}
      <View className="flex-1 relative">
        <WebView
          key={`${currentStrategy}-${currentViewer.url}`}
          source={{ uri: currentViewer.url }}
          style={{ flex: 1, backgroundColor: '#f5f5f5' }}
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
          userAgent="Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1"
          allowsFullscreenVideo={false}
          mediaPlaybackRequiresUserAction={true}
          startInLoadingState={true}
        />
        
        {/* Loading Overlay */}
        {isLoading && (
          <View className="absolute inset-0 bg-gray-50 items-center justify-center">
            <View className="bg-white rounded-2xl p-8 items-center shadow-sm">
              <View className="bg-purple-100 rounded-full p-4 mb-4">
                <Ionicons name="document-text" size={32} color="#7c3aed" />
              </View>
              <Text className="font-gujarati text-gray-700 text-lg font-medium">
                PDF લોડ થઈ રહ્યું છે...
              </Text>
              <Text className="font-gujarati text-gray-500 text-sm mt-2 text-center">
                {currentViewer.name} વાપરી રહ્યા છીએ
              </Text>
            </View>
          </View>
        )}
        
        {/* Error State */}
        {hasError && (
          <View className="absolute inset-0 bg-gray-50 items-center justify-center">
            <View className="bg-white rounded-2xl p-6 items-center shadow-sm mx-4">
              <View className="bg-red-100 rounded-full p-4 mb-4">
                <Ionicons name="alert-circle" size={32} color="#ef4444" />
              </View>
              <Text className="font-gujarati text-gray-700 text-lg font-medium mb-2">
                PDF લોડ થઈ શક્યું નથી
              </Text>
              <Text className="font-gujarati text-gray-500 text-sm text-center mb-4">
                બધા વ્યુઅર પ્રયાસ કર્યા પરંતુ PDF લોડ થયું નથી
              </Text>
              
              <View className="w-full gap-3">
                <TouchableOpacity 
                  onPress={handleRetry}
                  className="bg-purple-600 rounded-full px-6 py-3 w-full"
                >
                  <Text className="font-gujarati text-white text-sm font-medium text-center">
                    શરૂઆતથી ફરીથી પ્રયાસ કરો
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  onPress={handleOpenExternal}
                  className="bg-gray-600 rounded-full px-6 py-3 w-full"
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
      
      {/* Bottom Controls */}
      <View className="bg-white border-t border-gray-200 px-4 py-3">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <Ionicons name="shield-checkmark" size={16} color="#7c3aed" />
            <Text className="font-gujarati text-purple-700 text-xs ml-2">
              સુરક્ષિત દસ્તાવેજ
            </Text>
          </View>
          
          {currentStrategy < strategies.length - 1 && (
            <TouchableOpacity 
              onPress={handleTryNext}
              className="bg-purple-100 rounded-full px-4 py-2"
            >
              <Text className="font-gujarati text-purple-700 text-xs">
                અગલું વ્યુઅર
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}
