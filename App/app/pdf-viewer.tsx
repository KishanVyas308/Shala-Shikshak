import React, { useState } from 'react';
import { View, Text, Alert, AppState, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Header from '../components/Header';
import SecurePDFViewer from '../components/SecurePDFViewer';
import ReliablePDFViewer from '../components/ReliablePDFViewer';
import { useFocusEffect } from '@react-navigation/native';

export default function PDFViewer() {
  const { url, title } = useLocalSearchParams<{ url: string; title: string }>();
  const [useReliableViewer, setUseReliableViewer] = useState(false);

  // Prevent screenshot by going back when app goes to background
  useFocusEffect(
    React.useCallback(() => {
      const handleAppStateChange = (nextAppState: string) => {
        if (nextAppState === 'background') {
          router.back();
        }
      };

      const subscription = AppState.addEventListener('change', handleAppStateChange);
      return () => subscription?.remove();
    }, [])
  );

  if (!url) {
    return (
      <View className="flex-1 bg-gray-50">
        <Header 
          title="PDF વ્યુઅર"
          showBack
          onBackPress={() => router.back()}
        />
        <View className="flex-1 items-center justify-center">
          <View className="bg-white rounded-2xl p-8 items-center shadow-sm">
            <View className="bg-red-100 rounded-full p-4 mb-4">
              <Ionicons name="alert-circle" size={32} color="#ef4444" />
            </View>
            <Text className="font-gujarati text-gray-700 text-lg font-medium">
              PDF URL મળ્યું નથી
            </Text>
            <Text className="font-gujarati text-gray-500 text-sm mt-2 text-center">
              કૃપા કરીને ફરીથી પ્રયાસ કરો
            </Text>
          </View>
        </View>
      </View>
    );
  }

  
  return (
    <View className="flex-1 bg-gray-50">
      <Header 
        title={title || 'PDF વ્યુઅર'}
        showBack
        onBackPress={() => router.back()}
        rightAction={{
          icon: 'settings',
          onPress: () => {}
        }}
      />
      
      <SecurePDFViewer 
        url={url} 
        title={title || 'PDF વ્યુઅર'}
        onClose={() => router.back()}
      />
    </View>
  );
}
