import React from 'react';
import { View, Text, TouchableOpacity, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useFontSize } from '../contexts/FontSizeContext';

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
  const { getFontSizeClasses } = useFontSize();
  const fontClasses = getFontSizeClasses();
  const isSmallScreen = width < 380;
  const isMediumScreen = width >= 380 && width < 500;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.9}
      className="mb-3 flex-1"
      style={{ minWidth: '30%', maxWidth: '33.33%' }}
    >
      <View className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden mx-1">
        {/* Accent Bar */}
        <View className="h-1 bg-primary-600" />


        {/* Decoratives */}
        <View className="absolute -top-4 -right-4 opacity-10">
          <View className="w-20 h-20 rounded-full border-2 border-primary-600" />
        </View>
        <View className="absolute -bottom-6 -left-6 opacity-5">
          <View className="w-32 h-32 rounded-full border-2 border-primary-600" />
        </View>

        <View className={`${isSmallScreen ? 'p-3' : isMediumScreen ? 'p-4' : 'p-4'} relative flex min-h-[120px] `}>
          {/* Content */}
          <View className="flex flex-col space-y-2 flex-1 ">
            {/* Standard Name */}
            <View className='flex-1 justify-evenly items-center'>

              <Text className={`font-gujarati font-bold text-gray-900 leading-tight ${fontClasses.textXl}`} numberOfLines={2}>
                {name.split(' ')[0]}
              </Text>
              <Text className={`font-gujarati font-bold text-gray-900 leading-tight ${fontClasses.text}`} numberOfLines={2}>
                {name.split(' ')[1]}
              </Text>
            </View>

            {/* <View className="flex-1 "> */}
            {/* Description */}
            {/* {description && (
                <Text className={`font-gujarati text-gray-600 leading-8 ${fontClasses.text}`} numberOfLines={2}>
                  {description}
                </Text>
              )} */}
            {/* </View> */}

            {/* Subject Count */}
            {/* <View className="flex-row items-center mt-auto">
              <Ionicons name="book-outline" size={isSmallScreen ? 14 : 16} color="#16a34a" />
              <Text className={`font-gujarati text-primary-700 font-medium ml-1 ${fontClasses.text}`}>
                {subjectCount} વિષયો
              </Text>
            </View> */}
          </View>

          {/* Arrow Icon */}
          <View className="absolute top-3 right-3 bg-primary-600 rounded-full p-1.5 shadow-md">
            <Ionicons name="chevron-forward" size={isSmallScreen ? 10 : 12} color="white" />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}


export function AddStandardCard() {
  const { getFontSizeClasses } = useFontSize();
  const fontClasses = getFontSizeClasses();

  return (
    <TouchableOpacity
      onPress={() => router.replace("/select-standards" as any)}
      activeOpacity={0.9}
      className="mb-3 flex-1"
      style={{ minWidth: '30%', maxWidth: '33.33%' }}
    >
      <View className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden mx-1">
        <View className="h-1 bg-primary-600" />
        {/* Decoratives */}
        <View className="absolute -top-4 -right-4 opacity-10">
          <View className="w-20 h-20 rounded-full border-2 border-primary-600" />
        </View>
        <View className="absolute -bottom-6 -left-6 opacity-5">
          <View className="w-32 h-32 rounded-full border-2 border-primary-600" />
        </View>

        <View className="p-4 flex items-center justify-center min-h-[120px]">
          <Ionicons name="add-circle-outline" size={40} color="#16a34a" />
          <Text className={`font-gujarati text-primary-700 font-medium mt-2 ${fontClasses.text}`}>ધોરણ ઉમેરો</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}