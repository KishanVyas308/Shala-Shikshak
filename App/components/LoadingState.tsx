import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFontSize } from '../contexts/FontSizeContext';
import SimpleLoadingBar from './SimpleLoadingBar';

interface LoadingStateProps {
  message?: string;
  size?: 'small' | 'large';
}

export default function LoadingState({ 
  message = 'લોડ થઈ રહ્યું છે...', 
  size = 'large' 
}: LoadingStateProps) {
  const { getFontSizeClasses } = useFontSize();
  const fontClasses = getFontSizeClasses();
  
  return (
    <View className="flex-1 justify-center items-center p-8">
      
       
        {/* Animated Loading Icon */}
        <View className="relative mb-6">
          <ActivityIndicator 
            size={size === 'large' ? 'large' : 'small'} 
            color="#16a34a" 
          />
        </View>
        
        {/* Loading Text */}
        <Text className={`font-gujarati text-secondary-700 font-semibold text-center ${fontClasses.textLg}`}>
          {message}
        </Text>
        <Text className={`font-gujarati text-secondary-500 text-center mt-4 ${fontClasses.text}`}>
          કૃપા કરીને થોડી રાહ જુઓ...
        </Text>
        
    </View>
  );
}
