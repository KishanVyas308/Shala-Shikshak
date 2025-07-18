import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Linking, Alert, RefreshControl } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { chaptersAPI } from '../../services/chapters';
import Header from '../../components/Header';
import LoadingState from '../../components/LoadingState';
import ErrorState from '../../components/ErrorState';
import { LinearGradient } from 'expo-linear-gradient';
import { API_BASE_URL } from '../../lib/api';
import { isGoogleDriveUrl } from '../../utils/googleDrive';

export default function ChapterView() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const { data: chapter, isLoading, error, refetch } = useQuery({
    queryKey: ['chapters', id],
    queryFn: () => chaptersAPI.getById(id!),
    enabled: !!id,
  });

  const handleOpenUrl = async (url: string, type: string) => {
    try {
      // Navigate to internal PDF viewer instead of external link
      if (type.includes('PDF')) {
        // Use the URL directly if it's a Google Drive URL, otherwise append API_BASE_URL
        const pdfUrl = isGoogleDriveUrl(url) ? url : API_BASE_URL + url;
        router.push({
          pathname: '/pdf-viewer' as any,
          params: { url: pdfUrl, title: `${chapter?.name} - ${type}` }
        });
      } else {
        // For video, still open externally
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

  if (isLoading) {
    return (
      <View className="flex-1 bg-secondary-50">
        <Header 
          title="પ્રકરણ"
          subtitle="લોડ થઈ રહ્યું છે..."
          showBack
          onBackPress={() => router.back()}
        />
        <LoadingState message="પ્રકરણ લોડ થઈ રહ્યું છે..." />
      </View>
    );
  }

  if (error || !chapter) {
    return (
      <View className="flex-1 bg-secondary-50">
        <Header 
          title="પ્રકરણ"
          subtitle="ભૂલ"
          showBack
          onBackPress={() => router.back()}
        />
        <ErrorState 
          message="પ્રકરણ લોડ કરવામાં સમસ્યા આવી છે"
          onRetry={() => refetch()} 
        />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <Header 
        title={chapter.name}
        subtitle={`પ્રકરણ ${chapter.order}`}
        showBack
        onBackPress={() => router.back()}
        rightAction={{
          icon: 'bookmark-outline',
          onPress: () => {}
        }}
      />
      
      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={() => refetch()} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Professional Stats Cards */}
        <View className="flex-row mx-4 my-6 gap-3">
          <View className="flex-1 bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <View className="items-center">
              <View className={`w-12 h-12 rounded-full items-center justify-center mb-2 ${chapter.videoUrl ? 'bg-purple-100' : 'bg-gray-100'}`}>
                <Ionicons name="play" size={20} color={chapter.videoUrl ? "#7c3aed" : "#9ca3af"} />
              </View>
              <Text className="font-gujarati text-gray-700 text-sm font-medium">
                વિડિયો લેકચર
              </Text>
              <Text className={`font-gujarati text-xs mt-1 ${chapter.videoUrl ? 'text-purple-600' : 'text-gray-400'}`}>
                {chapter.videoUrl ? 'ઉપલબ્ધ' : 'ઉપલબ્ધ નથી'}
              </Text>
            </View>
          </View>
          
          <View className="flex-1 bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <View className="items-center">
              <View className={`w-12 h-12 rounded-full items-center justify-center mb-2 ${chapter.textbookPdfUrl ? 'bg-purple-100' : 'bg-gray-100'}`}>
                <Ionicons name="book" size={20} color={chapter.textbookPdfUrl ? "#7c3aed" : "#9ca3af"} />
              </View>
              <Text className="font-gujarati text-gray-700 text-sm font-medium">
                પાઠ્યપુસ્તક
              </Text>
              <Text className={`font-gujarati text-xs mt-1 ${chapter.textbookPdfUrl ? 'text-purple-600' : 'text-gray-400'}`}>
                {chapter.textbookPdfUrl ? 'ઉપલબ્ધ' : 'ઉપલબ્ધ નથી'}
              </Text>
            </View>
          </View>
          
          <View className="flex-1 bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <View className="items-center">
              <View className={`w-12 h-12 rounded-full items-center justify-center mb-2 ${chapter.solutionPdfUrl ? 'bg-purple-100' : 'bg-gray-100'}`}>
                <Ionicons name="checkmark-circle" size={20} color={chapter.solutionPdfUrl ? "#7c3aed" : "#9ca3af"} />
              </View>
              <Text className="font-gujarati text-gray-700 text-sm font-medium">
                ઉકેલ
              </Text>
              <Text className={`font-gujarati text-xs mt-1 ${chapter.solutionPdfUrl ? 'text-purple-600' : 'text-gray-400'}`}>
                {chapter.solutionPdfUrl ? 'ઉપલબ્ધ' : 'ઉપલબ્ધ નથી'}
              </Text>
            </View>
          </View>
        </View>
        
        {/* Professional Resources Section */}
        <View className="mx-4 mb-6">
          <Text className="font-gujarati text-gray-900 text-xl font-bold mb-4">
            અભ્યાસ સામગ્રી
          </Text>
          
          {/* Video Section */}
          {chapter.videoUrl && (
            <TouchableOpacity
              onPress={() => handleOpenUrl(chapter.videoUrl!, 'વિડિયો')}
              activeOpacity={0.8}
              className="mb-4"
            >
              <View className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <View className="flex-row items-center">
                  <View className="bg-purple-100 rounded-2xl p-4 mr-4">
                    <Ionicons name="play" size={28} color="#7c3aed" />
                  </View>
                  <View className="flex-1">
                    <Text className="font-gujarati text-gray-900 text-lg font-bold mb-1">
                      વિડિયો લેકચર
                    </Text>
                    <Text className="font-gujarati text-gray-600 text-sm">
                      વિગતવાર સમજૂતી સાથે અભ્યાસ કરો
                    </Text>
                  </View>
                  <View className="bg-purple-600 rounded-full p-3">
                    <Ionicons name="chevron-forward" size={20} color="white" />
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          )}
          
          {/* Textbook PDF Section */}
          {chapter.textbookPdfUrl && (
            <TouchableOpacity
              onPress={() => handleOpenUrl(chapter.textbookPdfUrl!, 'પુસ્તક PDF')}
              activeOpacity={0.8}
              className="mb-4"
            >
              <View className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <View className="flex-row items-center">
                  <View className="bg-purple-100 rounded-2xl p-4 mr-4">
                    <Ionicons name="book" size={28} color="#7c3aed" />
                  </View>
                  <View className="flex-1">
                    <Text className="font-gujarati text-gray-900 text-lg font-bold mb-1">
                      પાઠ્યપુસ્તક PDF
                    </Text>
                    <Text className="font-gujarati text-gray-600 text-sm">
                      સુરક્ષિત PDF વ્યુઅરમાં વાંચો
                    </Text>
                  </View>
                  <View className="bg-purple-600 rounded-full p-3">
                    <Ionicons name="chevron-forward" size={20} color="white" />
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          )}
          
          {/* Solution PDF Section */}
          {chapter.solutionPdfUrl && (
            <TouchableOpacity
              onPress={() => handleOpenUrl(chapter.solutionPdfUrl!, 'ઉકેલ PDF')}
              activeOpacity={0.8}
              className="mb-4"
            >
              <View className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <View className="flex-row items-center">
                  <View className="bg-purple-100 rounded-2xl p-4 mr-4">
                    <Ionicons name="checkmark-circle" size={28} color="#7c3aed" />
                  </View>
                  <View className="flex-1">
                    <Text className="font-gujarati text-gray-900 text-lg font-bold mb-1">
                      ઉકેલ PDF
                    </Text>
                    <Text className="font-gujarati text-gray-600 text-sm">
                      પ્રશ્નોના વિગતવાર ઉત્તરો
                    </Text>
                  </View>
                  <View className="bg-purple-600 rounded-full p-3">
                    <Ionicons name="chevron-forward" size={20} color="white" />
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          )}
          
          {/* No Resources Available */}
          {!chapter.videoUrl && !chapter.textbookPdfUrl && !chapter.solutionPdfUrl && (
            <View className="bg-white rounded-2xl p-8 items-center border border-gray-100">
              <View className="bg-gray-100 rounded-full p-6 mb-4">
                <Ionicons name="folder-open-outline" size={48} color="#6b7280" />
              </View>
              <Text className="font-gujarati text-gray-900 text-lg font-bold text-center mb-2">
                અભ્યાસ સામગ્રી ઉપલબ્ધ નથી
              </Text>
              <Text className="font-gujarati text-gray-600 text-sm text-center">
                આ પ્રકરણ માટે હજુ સુધી કોઈ અભ્યાસ સામગ્રી ઉમેરવામાં આવી નથી
              </Text>
            </View>
          )}
        </View>
        
        {/* Professional Study Tips */}
        <View className="mx-4 mb-6">
          <View className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <View className="flex-row items-center mb-4">
              <View className="bg-purple-600 rounded-full p-3 mr-4">
                <Ionicons name="bulb" size={20} color="white" />
              </View>
              <Text className="font-gujarati text-gray-900 text-lg font-bold">
                અભ્યાસ માર્ગદર્શન
              </Text>
            </View>
            
            <View className="space-y-3">
              <View className="flex-row items-start">
                <View className="bg-purple-100 rounded-full p-1 mr-3 mt-1">
                  <Ionicons name="checkmark" size={12} color="#7c3aed" />
                </View>
                <Text className="font-gujarati text-gray-700 text-sm leading-5 flex-1">
                  સૌપ્રથમ વિડિયો લેકચર જુઓ અને મુખ્ય મુદ્દાઓ સમજો
                </Text>
              </View>
              
              <View className="flex-row items-start">
                <View className="bg-purple-100 rounded-full p-1 mr-3 mt-1">
                  <Ionicons name="checkmark" size={12} color="#7c3aed" />
                </View>
                <Text className="font-gujarati text-gray-700 text-sm leading-5 flex-1">
                  પાઠ્યપુસ્તક વાંચો અને મહત્વના પોઈન્ટ્સ નોંધો
                </Text>
              </View>
              
              <View className="flex-row items-start">
                <View className="bg-purple-100 rounded-full p-1 mr-3 mt-1">
                  <Ionicons name="checkmark" size={12} color="#7c3aed" />
                </View>
                <Text className="font-gujarati text-gray-700 text-sm leading-5 flex-1">
                  પ્રશ્નો હલ કરવાનો પ્રયાસ કરો, પછી ઉકેલ જુઓ
                </Text>
              </View>
              
              <View className="flex-row items-start">
                <View className="bg-purple-100 rounded-full p-1 mr-3 mt-1">
                  <Ionicons name="checkmark" size={12} color="#7c3aed" />
                </View>
                <Text className="font-gujarati text-gray-700 text-sm leading-5 flex-1">
                  શંકા રહે તો અભ્યાસ સામગ્રી ફરીથી જુઓ
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}