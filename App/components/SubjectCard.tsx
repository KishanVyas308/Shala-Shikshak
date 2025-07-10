import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

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


  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      className="mx-4 mb-4"
    >
      <View className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        {/* Purple accent bar */}
        <View className="h-1 bg-purple-600" />
        
        <View className="p-6 relative overflow-hidden">
          {/* Background Pattern */}
          <View className="absolute -top-4 -right-4 opacity-10">
            <View className="w-20 h-20 rounded-full border-2 border-purple-600" />
          </View>
          <View className="absolute -bottom-6 -left-6 opacity-5">
            <View className="w-32 h-32 rounded-full border-2 border-purple-600" />
          </View>
        
        {/* Content */}
        <View className="flex-row items-center justify-between">
          <View className="flex-1 mr-4">
           
            
            {/* Subject Name */}
            <Text className="font-gujarati text-gray-900 text-xl font-bold mb-3 leading-tight">
              {name}
            </Text>
            
            {/* Description */}
            {description && (
              <Text className="font-gujarati text-gray-600 text-sm mb-4 leading-5">
                {description}
              </Text>
            )}
            
            {/* Chapter Count */}
            <View className="flex-row items-center">
              <View className="bg-purple-50 rounded-full px-4 py-2 flex-row items-center border border-purple-100">
                <Ionicons name="list-outline" size={16} color="#7c3aed" />
                <Text className="font-gujarati text-purple-700 text-sm font-semibold ml-2">
                  {chapterCount} પ્રકરણો
                </Text>
              </View>
            </View>
          </View>
          
          {/* Arrow Icon */}
          <View className="bg-purple-600 rounded-full p-4 shadow-sm">
            <Ionicons name="chevron-forward" size={20} color="white" />
          </View>
        </View>
        
        {/* Decorative Elements */}
        <View className="absolute top-3 right-3 opacity-15">
          <Ionicons name="book-outline" size={28} color="#7c3aed" />
        </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}
