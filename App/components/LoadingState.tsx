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
      <LinearGradient
        colors={['#f3f0ff', '#e9e2ff', '#ddd6fe']}
        className="rounded-3xl p-8 items-center"
        style={{
          shadowColor: '#7c3aed',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.15,
          shadowRadius: 12,
          elevation: 8,
        }}
      >
        {/* Animated Loading Icon */}
        <View className="relative mb-6">
          <View className="bg-primary-500 rounded-full p-4">
            <Ionicons name="book" size={32} color="white" />
          </View>
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
        <Text className="font-gujarati text-secondary-500 text-sm text-center mt-2">
          કૃપા કરીને થોડી રાહ જુઓ...
        </Text>
        
        {/* Decorative dots */}
        <View className="flex-row mt-4 space-x-2">
          {[...Array(3)].map((_, i) => (
            <View 
              key={i} 
              className="w-2 h-2 bg-primary-400 rounded-full opacity-60"
              style={{
                animationDelay: `${i * 200}ms`
              }}
            />
          ))}
        </View>
      </LinearGradient>
    </View>
  );
}
