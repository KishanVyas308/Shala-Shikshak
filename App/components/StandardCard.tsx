import React from 'react';
import { View, Text, TouchableOpacity, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface StandardCardProps {
  id: string;
  name: string;
  description?: string;
  subjectCount: number;
  onPress: () => void;
  order: number;
}

export default function StandardCard({ 
  name, 
  description, 
  subjectCount, 
  onPress, 
  order 
}: StandardCardProps) {
  const { width } = useWindowDimensions();
  const isSmallScreen = width < 380;
  const isMediumScreen = width >= 380 && width < 500;
  

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      className={`mx-3 mb-3 ${isSmallScreen ? 'mx-2 mb-2' : ''}`}
    >
      <View className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        {/* Purple accent bar */}
        <View className="h-1 bg-purple-600" />
        
        <View className={`${isSmallScreen ? 'p-4' : isMediumScreen ? 'p-5' : 'p-6'} relative overflow-hidden`}>
          {/* Background Pattern */}
          <View className="absolute -top-4 -right-4 opacity-10">
            <View className={`${isSmallScreen ? 'w-16 h-16' : 'w-20 h-20'} rounded-full border-2 border-purple-600`} />
          </View>
          <View className="absolute -bottom-6 -left-6 opacity-5">
            <View className={`${isSmallScreen ? 'w-24 h-24' : 'w-32 h-32'} rounded-full border-2 border-purple-600`} />
          </View>
        
        {/* Content */}
        <View className={`${isSmallScreen ? 'flex-col' : 'flex-row'} items-center justify-between`}>
          <View className={`flex-1 ${isSmallScreen ? 'mb-4' : 'mr-4'}`}>
            {/* Standard Name */}
            <Text className={`font-gujarati text-gray-900 ${isSmallScreen ? 'text-xl' : isMediumScreen ? 'text-xl' : 'text-2xl'} font-bold mb-3 leading-tight`}>
              {name}
            </Text>
            
            {/* Description */}
            {description && (
              <Text className={`font-gujarati text-gray-600 ${isSmallScreen ? 'text-xs' : 'text-sm'} mb-4 leading-5`}>
                {description}
              </Text>
            )}
            
            {/* Subject Count */}
            <View className="flex-row items-center">
              <View className={`bg-purple-50 rounded-full ${isSmallScreen ? 'px-3 py-1.5' : 'px-4 py-2'} flex-row items-center border border-purple-100`}>
                <Ionicons name="book-outline" size={isSmallScreen ? 16 : 18} color="#7c3aed" />
                <Text className={`font-gujarati text-purple-700 ${isSmallScreen ? 'text-xs' : 'text-sm'} font-semibold ml-2`}>
                  {subjectCount} વિષયો
                </Text>
              </View>
            </View>
          </View>
          
          {/* Arrow Icon */}
          <View className={`bg-purple-600 rounded-full ${isSmallScreen ? 'p-3' : 'p-4'} shadow-sm ${isSmallScreen ? 'self-end' : ''}`}>
            <Ionicons name="chevron-forward" size={isSmallScreen ? 18 : 20} color="white" />
          </View>
        </View>
        
        {/* Decorative Elements */}
        <View className="absolute top-3 right-3 opacity-15">
          <Ionicons name="school-outline" size={isSmallScreen ? 24 : 28} color="#7c3aed" />
        </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}
