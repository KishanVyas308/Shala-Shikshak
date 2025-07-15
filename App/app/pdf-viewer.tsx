import React from 'react';
import { View, Text } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';
import * as ScreenCapture from 'expo-screen-capture';
import Header from '../components/Header';

export default function PDFViewer() {
  const { url, title } = useLocalSearchParams<{ url: string; title: string }>();

  return (
    <View className="flex-1 bg-gray-50">
      <Header 
        title={title || 'PDF વ્યુઅર'}
        showBack
        onBackPress={() => router.back()}
      />
      
      <View className="flex-1 items-center justify-center">
        <View className="bg-white rounded-2xl p-8 items-center shadow-sm">
          <View className="bg-blue-100 rounded-full p-4 mb-4">
            <Ionicons name="document-text" size={32} color="#3b82f6" />
          </View>
          <Text className="font-gujarati text-gray-700 text-lg font-medium">
            PDF વ્યુઅર અનુપલબ્ધ
          </Text>
          <Text className="font-gujarati text-gray-500 text-sm mt-2 text-center">
            PDF દર્શક હાલમાં ઉપલબ્ધ નથી
          </Text>
        </View>
      </View>
    </View>
  );
}
