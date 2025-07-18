import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, Platform } from 'react-native';
import { useWindowDimensions } from 'react-native';
import Pdf from 'react-native-pdf';
import { Ionicons } from '@expo/vector-icons';
import { API_BASE_URL } from '@/lib/api';
import * as ScreenCapture from 'expo-screen-capture';

interface SecurePDFViewerProps {
  url: string;
  title?: string;
  onClose?: () => void;
}

export default function SecurePDFViewer({ url, title, onClose }: SecurePDFViewerProps) {
  const { width, height } = useWindowDimensions();
  const pdfUrl = url;

  useEffect(() => {
    // 🚫 Block screenshot on Android
    const enableSecure = async () => {
      if (Platform.OS === 'android') {
        await ScreenCapture.preventScreenCaptureAsync();
      }
    };
    enableSecure();

    return () => {
      if (Platform.OS === 'android') {
        ScreenCapture.allowScreenCaptureAsync(); // cleanup
      }
    };
  }, []);

  const handleOpenExternal = () => {
    Alert.alert('સાવચેત', 'આ દસ્તાવેજ ડાઉનલોડ માટે ઉપલબ્ધ નથી.');
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white border-b border-gray-200 px-4 py-3 flex-row items-center justify-between">
        <View className="flex-1">
          <Text className="font-gujarati text-gray-900 text-lg font-semibold" numberOfLines={1}>
            {title || 'PDF દસ્તાવેજ'}
          </Text>
          <Text className="font-gujarati text-gray-500 text-sm">સુરક્ષિત PDF વ્યુઅર</Text>
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
      <Pdf
        trustAllCerts={true}
        source={{ uri: pdfUrl, cache: true }}
        style={{ flex: 1, width, height }}
        onError={(error) => {
          console.log('PDF Load error:', error);
          Alert.alert('ભૂલ', 'PDF લોડ થઈ શક્યો નહીં.');
        }}
        enablePaging={false}
        horizontal={false}
        enableAnnotationRendering={false}
        enableAntialiasing={true}
        enableRTL={false}
        spacing={4}
        fitPolicy={2}
      />

      {/* Security Notice */}
      <View className="bg-purple-50 border-t border-purple-200 px-4 py-2">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center flex-1">
            <Ionicons name="shield-checkmark" size={16} color="#7c3aed" />
            <Text className="font-gujarati text-purple-700 text-xs ml-2">
              સુરક્ષા સક્રિય - સ્ક્રીનશોટ અટકાવવામાં આવ્યો છે
            </Text>
          </View>

          <TouchableOpacity onPress={handleOpenExternal}>
            <Text className="font-gujarati text-purple-600 text-xs underline">
              ડાઉનલોડ વિકલ્પ નથી
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
