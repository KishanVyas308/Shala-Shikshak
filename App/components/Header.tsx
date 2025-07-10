import React from 'react';
import { View, Text, TouchableOpacity, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

interface HeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  onBackPress?: () => void;
  rightAction?: {
    icon: keyof typeof Ionicons.glyphMap;
    onPress: () => void;
  };
}

export default function Header({ 
  title, 
  subtitle, 
  showBack = false, 
  onBackPress,
  rightAction 
}: HeaderProps) {
  const insets = useSafeAreaInsets();
  
  return (
    <View className="relative bg-purple-700" style={{ paddingTop: insets.top }}>
      <View className="absolute inset-0 opacity-10">
        <View className="flex-row justify-between items-center px-4 py-2">
          {[...Array(6)].map((_, i) => (
            <View key={i} className="w-2 h-2 bg-white rounded-full opacity-30" />
          ))}
        </View>
      </View>
      
      <View className="flex-row items-center justify-between px-6 py-4">
        {/* Left Side */}
        <View className="flex-row items-center flex-1">
          {showBack && (
            <TouchableOpacity
              onPress={onBackPress}
              className="mr-4 p-2 rounded-full bg-white/20"
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
          )}
          
          <View className="flex-1">
            <Text className="font-gujarati text-white text-2xl font-bold text-shadow">
              {title}
            </Text>
            {subtitle && (
              <Text className="font-gujarati text-white/80 text-sm mt-1">
                {subtitle}
              </Text>
            )}
          </View>
        </View>
        
        {/* Right Action */}
        {rightAction && (
          <TouchableOpacity
            onPress={rightAction.onPress}
            className="p-2 rounded-full bg-white/20"
            activeOpacity={0.7}
          >
            <Ionicons name={rightAction.icon} size={24} color="white" />
          </TouchableOpacity>
        )}
      </View>

    </View>
  );
}
