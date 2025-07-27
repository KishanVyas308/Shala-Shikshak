import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface SubjectCardProps {
  id: string;
  name: string;
  description?: string;
  chapterCount: number;
  onPress: () => void;
  standardName: string;
}

export default function SubjectCard({
  name,
  description,
  chapterCount,
  onPress,
  standardName,
  id
}: SubjectCardProps) {
  const { width } = useWindowDimensions();
  const isSmallScreen = width < 380;
  const isMediumScreen = width >= 380 && width < 500;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      className="mb-3 flex-1"
      style={{ minWidth: '30%', maxWidth: '33.33%' }}
    >
      <View className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden mx-1">
        {/* Purple accent bar */}
        <View className="h-1 bg-purple-600" />

        {/* Decoratives */}
        <View className="absolute -top-4 -right-4 opacity-10">
          <View className="w-20 h-20 rounded-full border-2 border-purple-600" />
        </View>
        <View className="absolute -bottom-6 -left-6 opacity-5">
          <View className="w-32 h-32 rounded-full border-2 border-purple-600" />
        </View>

        <View className={`${isSmallScreen ? 'p-3' : isMediumScreen ? 'p-4' : 'p-4'} relative min-h-[120px] flex`}>
          {/* Content */}
          <View className="flex flex-col space-y-2 flex-1">
            {/* Subject Name */}
            <Text className={`font-gujarati text-gray-900 mb-2 font-bold leading-tight ${isSmallScreen ? 'text-base' : 'text-lg'}`} numberOfLines={2}>
              {name}
            </Text>

            <View className="flex-1">
              {/* Description */}
              {description && (
                <Text className={`font-gujarati text-gray-600 leading-4 ${isSmallScreen ? 'text-xs' : 'text-sm'}`} numberOfLines={2}>
                  {description}
                </Text>
              )}
            </View>

            {/* Chapter Count */}
            <View className="flex-row items-center mt-auto">
              <Ionicons name="list-outline" size={isSmallScreen ? 14 : 16} color="#7c3aed" />
              <Text className={`font-gujarati text-purple-700 font-medium ml-1 ${isSmallScreen ? 'text-xs' : 'text-sm'}`}>
                {chapterCount} પ્રકરણો
              </Text>
            </View>
          </View>

          {/* Action Icons */}
          <View className="absolute top-3 right-3 flex-row items-center space-x-1">
            {/* Bookmark Icon
            <TouchableOpacity
              onPress={handleBookmarkPress}
              activeOpacity={0.8}
              className={`rounded-full p-1.5 shadow-md ${isBookmarked ? 'bg-amber-500' : 'bg-gray-400'}`}
            >
              <Ionicons 
                name={isBookmarked ? 'bookmark' : 'bookmark-outline'} 
                size={isSmallScreen ? 10 : 12} 
                color="white" 
              />
            </TouchableOpacity> */}
            
            {/* Arrow Icon */}
            <View className="bg-purple-600 rounded-full p-1.5 shadow-md">
              <Ionicons name="chevron-forward" size={isSmallScreen ? 10 : 12} color="white" />
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}
