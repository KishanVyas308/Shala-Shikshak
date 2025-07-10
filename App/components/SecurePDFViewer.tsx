import React, { useState, useEffect } from 'react';
import { View, Text, Alert, Dimensions, TouchableOpacity, Linking } from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { API_BASE_URL } from '@/lib/api';
import Pdf from 'react-native-pdf';

interface SecurePDFViewerProps {
  url: string;
  title?: string;
  onClose?: () => void;
}

export default function SecurePDFViewer({ url, title, onClose }: SecurePDFViewerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const { height, width } = Dimensions.get('window');

  const pdfFullUrl = API_BASE_URL + url;

  const PdfResource = { uri: pdfFullUrl, cache: true };


  const handleLoadStart = () => {
    setIsLoading(true);
    setHasError(false);
  };

  const handleLoadEnd = () => {
    setIsLoading(false);
  };

  const handleError = (error: any) => {
    console.log('PDF Load Error:', error, 'Current viewer:');
    setIsLoading(false);

    // Try next viewer option

    setHasError(true);

  };

  const handleRetry = () => {
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


  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white border-b border-gray-200 px-4 py-3 flex-row items-center justify-between">
        <View className="flex-1">
          <Text className="font-gujarati text-gray-900 text-lg font-semibold" numberOfLines={1}>
            {title || 'PDF વ્યુઅર'}
          </Text>
          <Text className="font-gujarati text-gray-500 text-sm">
            {'લોડ થઈ રહ્યું છે'}
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

      {/* PDF Viewer */}
      <View className="flex-1 relative">

        {/* View for PDF */}

        <Pdf
          trustAllCerts={false}
          source={PdfResource}
          style={{ flex: 1, width, height }}
          
        />


        {/* Loading State */}
        {isLoading && (
          <View className="absolute inset-0 bg-gray-50 items-center justify-center">
            <View className="bg-white rounded-2xl p-8 items-center shadow-sm">
              <View className="bg-purple-100 rounded-full p-4 mb-4">
                <Ionicons name="document-text" size={32} color="#7c3aed" />
              </View>
              <Text className="font-gujarati text-gray-700 text-lg font-medium">
                PDF લોડ થઈ રહ્યું છે...
              </Text>

            </View>
          </View>
        )}

        {/* Error State */}
        {hasError && (
          <View className="absolute inset-0 bg-gray-50 items-center justify-center">
            <View className="bg-white rounded-2xl p-8 items-center shadow-sm mx-4">
              <View className="bg-red-100 rounded-full p-4 mb-4">
                <Ionicons name="alert-circle" size={32} color="#ef4444" />
              </View>
              <Text className="font-gujarati text-gray-700 text-lg font-medium mb-2">
                PDF લોડ થઈ શક્યું નથી
              </Text>
              <Text className="font-gujarati text-gray-500 text-sm text-center mb-2">
                કદાચ PDF ફાઇલ ઉપલબ્ધ નથી અથવા નેટવર્ક સમસ્યા છે
              </Text>


              <View className="flex-row gap-3 w-full">
                <TouchableOpacity
                  onPress={handleRetry}
                  className="bg-purple-600 rounded-full px-4 py-3 flex-1"
                >
                  <Text className="font-gujarati text-white text-sm font-medium text-center">
                    ફરીથી પ્રયાસ કરો
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleOpenExternal}
                  className="bg-gray-600 rounded-full px-4 py-3 flex-1"
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
              સુરક્ષિત દસ્તાવેજ - ડાઉનલોડ પ્રતિબંધિત
            </Text>
          </View>


        </View>
      </View>
    </View>
  );
}
