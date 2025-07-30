import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { storageService } from '../services/storage';
import { useFontSize } from '../contexts/FontSizeContext';

interface ChapterCardProps {
  id: string;
  name: string;
  description?: string;
  hasVideo: boolean;
  hasTextbook: boolean;
  hasSolution: boolean;
  videoUrl?: string;
  textbookPdfUrl?: string;
  solutionPdfUrl?: string;
  onPress: () => void;
  handleRemoveChapterBookmark?: () => void;
}

export default function ChapterCard({
  id,
  name,
  description,
  hasVideo,
  hasTextbook,
  hasSolution,
  videoUrl,
  textbookPdfUrl,
  solutionPdfUrl,
  onPress,
  handleRemoveChapterBookmark
}: ChapterCardProps) {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const { getFontSizeClasses } = useFontSize();
  const fontClasses = getFontSizeClasses();
  const resourceCount = [hasVideo, hasTextbook, hasSolution].filter(Boolean).length;

  useEffect(() => {
    checkBookmarkStatus();
  }, [id]);

  const checkBookmarkStatus = async () => {
    try {
      const bookmarked = await storageService.isChapterBookmarked(id);
      setIsBookmarked(bookmarked);
    } catch (error) {
      console.error('Error checking bookmark status:', error);
    }
  };

  const handleBookmarkPress = async () => {
    try {
      const newBookmarkStatus = await storageService.toggleChapterBookmark(id);
      setIsBookmarked(newBookmarkStatus);
    } catch (error) {
      Alert.alert('ભૂલ', 'બુકમાર્ક અપડેટ કરવામાં સમસ્યા આવી');
    }
  };

  const handleResourcePress = async (url: string, type: string) => {
    try {
      // Navigate to internal PDF viewer for PDFs, external for videos
      if (type.includes('PDF')) {
        router.push({
          pathname: '/pdf-viewer' as any,
          params: { url: url, title: `${name} - ${type}` }
        });
      } else {
        // For video, open externally
        const supported = await Linking.canOpenURL(url);
        if (supported) {
          await Linking.openURL(url);
        } else {
          Alert.alert('ત્રુટિ', `${type} ખોલી શકાતું નથી`);
        }
      }
    } catch (error) {
      Alert.alert('ત્રુટિ', `${type} ખોલવામાં સમસ્યા આવી`);
    }
  };

  return (

    <TouchableOpacity onPress={onPress} >

  
      <View className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mx-4 mb-3">
        {/* Bookmark indicator */}
        <TouchableOpacity
          onPress={handleBookmarkPress}
          className={`absolute top-3 right-3 rounded-full p-2 ${isBookmarked ? 'bg-primary-100' : 'bg-gray-100'}`}
          activeOpacity={0.7}
        >
          <Ionicons 
            name={isBookmarked ? "bookmark" : "bookmark-outline"} 
            size={18} 
            color={isBookmarked ? "#6C63FF" : "#6b7280"} 
          />
        </TouchableOpacity>

        {/* Left accent bar */}
        <View className="flex-row">
          <View className="w-1 bg-primary-500" />

          <View className="flex-1 p-4">
            <View className="flex-row items-center justify-between mb-3">


              <View className="flex-1 mr-3">
                {/* Chapter Name */}
                <Text className={`font-gujarati text-gray-900 font-bold mb-1 ${fontClasses.textLg}`} numberOfLines={2}>
                  {name}
                </Text>

                {/* Description */}
                {description && (
                  <Text className={`font-gujarati text-gray-600 mb-2 leading-4 ${fontClasses.text}`} numberOfLines={1}>
                    {description}
                  </Text>
                )}
              </View>


            </View>

            {/* Resource Buttons */}
            <View className="flex-row gap-2">
              {hasVideo && videoUrl && (
                <TouchableOpacity
                  onPress={() => handleResourcePress(videoUrl, 'વિડિયો')}
                  className="flex-1 bg-red-50 border border-red-200 rounded-lg px-3 py-2 flex-row items-center justify-center"
                  activeOpacity={0.7}
                >
                  <Ionicons name="play" size={14} color="#dc2626" />
                  <Text className="font-gujarati text-red-700 text-xs font-medium ml-1">
                    વિડિયો
                  </Text>
                </TouchableOpacity>
              )}

              {hasTextbook && textbookPdfUrl && (
                <TouchableOpacity
                  onPress={() => handleResourcePress(textbookPdfUrl, 'પુસ્તક PDF')}
                  className="flex-1 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 flex-row items-center justify-center"
                  activeOpacity={0.7}
                >
                  <Ionicons name="book" size={14} color="#2563eb" />
                  <Text className="font-gujarati text-blue-700 text-xs font-medium ml-1">
                    પાઠ્યપુસ્તક
                  </Text>
                </TouchableOpacity>
              )}

              {hasSolution && solutionPdfUrl && (
                <TouchableOpacity
                  onPress={() => handleResourcePress(solutionPdfUrl, 'ઉકેલ PDF')}
                  className="flex-1 bg-green-50 border border-green-200 rounded-lg px-3 py-2 flex-row items-center justify-center"
                  activeOpacity={0.7}
                >
                  <Ionicons name="checkmark-circle" size={14} color="#16a34a" />
                  <Text className="font-gujarati text-green-700 text-xs font-medium ml-1">
                    ઉકેલ
                  </Text>
                </TouchableOpacity>
              )}
            </View>

       
          </View>
        </View>
      </View>
    </TouchableOpacity>

  );
}
