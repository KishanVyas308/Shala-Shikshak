import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
  retryText?: string;
}

export default function ErrorState({ 
  message = 'કંઈક ખોટું થયું છે', 
  onRetry, 
  retryText = 'ફરી પ્રયાસ કરો' 
}: ErrorStateProps) {
  return (
    <View className="flex-1 justify-center items-center p-8">
      <View 
        className="bg-white rounded-3xl p-8 items-center"
        style={{
          shadowColor: '#ef4444',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.15,
          shadowRadius: 12,
          elevation: 8,
        }}
      >
        {/* Error Icon */}
        <View className="bg-danger-100 rounded-full p-4 mb-6">
          <Ionicons name="alert-circle" size={48} color="#ef4444" />
        </View>
        
        {/* Error Message */}
        <Text className="font-gujarati text-secondary-800 text-xl font-bold text-center mb-2">
          ઓહ! કંઈક ખોટું થયું
        </Text>
        <Text className="font-gujarati text-secondary-600 text-base text-center mb-6 leading-6">
          {message}
        </Text>
        
        {/* Retry Button */}
        {onRetry && (
          <TouchableOpacity
            onPress={onRetry}
            activeOpacity={0.8}
            className="w-full"
          >
            <LinearGradient
              colors={['#7c3aed', '#a855f7']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              className="rounded-xl py-4 px-6 flex-row items-center justify-center"
            >
              <Ionicons name="refresh" size={20} color="white" className="mr-2" />
              <Text className="font-gujarati text-white text-lg font-semibold ml-2">
                {retryText}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        )}
        
        {/* Help Text */}
        <Text className="font-gujarati text-secondary-400 text-sm text-center mt-4">
          જો સમસ્યા ચાલુ રહે તો કૃપા કરીને સંપર્ક કરો
        </Text>
      </View>
    </View>
  );
}
