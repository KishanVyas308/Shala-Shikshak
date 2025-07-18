import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface ChapterCardProps {
  id: string;
  name: string;
  description?: string;
  hasVideo: boolean;
  hasTextbook: boolean;
  hasSolution: boolean;
  onPress: () => void;
}

export default function ChapterCard({ 
  name, 
  description, 
  hasVideo, 
  hasTextbook, 
  hasSolution, 
  onPress
}: ChapterCardProps) {
  const resourceCount = [hasVideo, hasTextbook, hasSolution].filter(Boolean).length;
  
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      className="mx-4 mb-2"
    >
      <View className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Left accent bar */}
        <View className="flex-row">
          <View className="w-1 bg-primary-500" />
          <View className="flex-1 p-4">
            <View className="flex-row items-center justify-between">
              <View className="flex-1 mr-3">
                {/* Chapter header with number */}
                <View className="flex-row items-center mb-2">
                 
                  <Text className="font-gujarati text-gray-900 text-base  font-bold flex-1" numberOfLines={1}>
                    {name}
                  </Text>
                </View>
                
                {/* Description - only show if exists and keep it brief */}
                {description && (
                  <Text className="font-gujarati text-gray-600 text-sm mb-2 leading-4" numberOfLines={1}>
                    {description}
                  </Text>
                )}
                
                {/* Compact Resource Indicators */}
                <View className="flex-row items-center gap-1">
                  {hasVideo && (
                    <View className="bg-red-100 rounded-full px-2 py-1">
                      <Ionicons name="play" size={10} color="#dc2626" />
                    </View>
                  )}
                  {hasTextbook && (
                    <View className="bg-blue-100 rounded-full px-2 py-1">
                      <Ionicons name="book" size={10} color="#2563eb" />
                    </View>
                  )}
                  {hasSolution && (
                    <View className="bg-green-100 rounded-full px-2 py-1">
                      <Ionicons name="checkmark-circle" size={10} color="#16a34a" />
                    </View>
                  )}
                  <Text className="font-gujarati text-gray-500 text-xs ml-2">
                    {resourceCount}/3
                  </Text>
                </View>
              </View>
              
              {/* Simple arrow indicator */}
              <View className="bg-gray-100 rounded-full p-2">
                <Ionicons name="chevron-forward" size={16} color="#6b7280" />
              </View>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}
