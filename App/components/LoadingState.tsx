import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface LoadingStateProps {
  message?: string;
  size?: 'small' | 'large';
}

export default function LoadingState({ 
  message = 'લોડ થઈ રહ્યું છે...', 
  size = 'large' 
}: LoadingStateProps) {
  return (
    <View className="flex-1 justify-center items-center p-8">
      
        {/* Animated Loading Icon */}
        <View className="relative mb-6">
          <View className="absolute -inset-2">
            <ActivityIndicator 
              size={size === 'large' ? 'large' : 'small'} 
              color="#7c3aed" 
            />
          </View>
        </View>
        
        {/* Loading Text */}
        <Text className="font-gujarati text-secondary-700 text-lg font-semibold text-center">
          {message}
        </Text>
        <Text className="font-gujarati text-secondary-500 text-sm text-center mt-4">
          કૃપા કરીને થોડી રાહ જુઓ...
        </Text>
        
    </View>
  );
}
