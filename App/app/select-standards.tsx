import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { standardsAPI } from '../services/standards';
import { storageService } from '../services/storage';
import Header from '../components/Header';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';

export default function SelectStandards() {
    const [selectedStandards, setSelectedStandards] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isInitializing, setIsInitializing] = useState(true);

    const { data: standards = [], isLoading: isLoadingStandards, error, refetch } = useQuery({
        queryKey: ['standards'],
        queryFn: standardsAPI.getAll,
    });

    // Load existing user standards on component mount
    React.useEffect(() => {
        const loadExistingStandards = async () => {
            try {
                const existingStandards = await storageService.getUserStandards();
                setSelectedStandards(existingStandards);
            } catch (error) {
                console.error('Error loading existing standards:', error);
            } finally {
                setIsInitializing(false);
            }
        };

        loadExistingStandards();
    }, []);

    // Check if user is coming from home page (has existing standards)
    const [hasExistingStandards, setHasExistingStandards] = useState(false);
    React.useEffect(() => {
        const checkExisting = async () => {
            const hasStandards = await storageService.hasSelectedStandards();
            setHasExistingStandards(hasStandards);
        };
        checkExisting();
    }, []);

    const toggleStandard = (standardId: string) => {
        try {
            setSelectedStandards(prev => {
                if (prev.includes(standardId)) {
                    return prev.filter(id => id !== standardId);
                } else {
                    return [...prev, standardId];
                }
            });
        } catch (error) {
            console.error('Error toggling standard:', error);
        }
    };

    const handleContinue = async () => {
        if (selectedStandards.length === 0) {
            Alert.alert(
                'ધોરણ પસંદ કરો',
                'કૃપા કરીને ઓછામાં ઓછું એક ધોરણ પસંદ કરો.',
                [{ text: 'સમજાઈ ગયું', style: 'default' }]
            );
            return;
        }

        try {
            setIsLoading(true);
            await storageService.setUserStandards(selectedStandards);
            try {
                router.replace('/');
            } catch (navError) {
                console.error('Navigation error:', navError);
                // Fallback navigation
                router.push('/');
            }
        } catch (error) {
            console.error('Error saving standards:', error);
            Alert.alert(
                'ભૂલ',
                'ધોરણો સેવ કરવામાં સમસ્યા આવી. કૃપા કરીને ફરીથી પ્રયાસ કરો.',
                [{ text: 'ઠીક છે', style: 'default' }]
            );
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoadingStandards || isInitializing) {
        return (
            <SafeAreaView style={{ flex: 1 }} edges={['bottom']}>
                <View className="flex-1 bg-secondary-50">
                    <Header
                        title="ધોરણ પસંદ કરો"
                        subtitle="તમારા અભ્યાસ માટે યોગ્ય ધોરણ પસંદ કરો"
                        showBack={hasExistingStandards}
                        onBackPress={() => {
                            try {
                                router.back();
                            } catch (error) {
                                console.error('Navigation error:', error);
                                router.replace('/');
                            }
                        }}
                    />
                    <LoadingState />
                </View>
            </SafeAreaView>
        );
    }

    if (error) {
        return (
            <SafeAreaView style={{ flex: 1 }} edges={['bottom']}>
                <View className="flex-1 bg-secondary-50">
                    <Header
                        title="ધોરણ પસંદ કરો"
                        subtitle="તમારા અભ્યાસ માટે યોગ્ય ધોરણ પસંદ કરો"
                        showBack={hasExistingStandards}
                        onBackPress={() => {
                            try {
                                router.back();
                            } catch (error) {
                                console.error('Navigation error:', error);
                                router.replace('/');
                            }
                        }}
                    />
                    <ErrorState onRetry={() => refetch()} />
                </View>
            </SafeAreaView>
        );
    }

    const sortedStandards = [...standards].sort((a, b) => a.order - b.order);

    return (
        <SafeAreaView style={{ flex: 1 }} edges={['bottom']}>
            <View className="flex-1 bg-secondary-50">
            <Header
                title="ધોરણ પસંદ કરો"
                subtitle="તમારા અભ્યાસ માટે યોગ્ય ધોરણ પસંદ કરો"
                showBack={hasExistingStandards}
                onBackPress={() => {
                    try {
                        router.back();
                    } catch (error) {
                        console.error('Navigation error:', error);
                        router.replace('/');
                    }
                }}
            />

            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                {/* Instructions */}
                <View className="mx-4 my-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
                    <View className="flex-row items-center mb-2">
                        <Ionicons name="information-circle" size={20} color="#3B82F6" />
                        <Text className="font-gujarati text-blue-800 text-base font-semibold ml-2">
                            સૂચનાઓ
                        </Text>
                    </View>
                    <Text className="font-gujarati text-blue-700 text-sm leading-5">
                        • તમે એક અથવા વધુ ધોરણો પસંદ કરી શકો છો{'\n'}
                        • પસંદ કરેલા ધોરણો તમારા હોમ પેજ પર દેખાશે{'\n'}
                        • તમે બાદમાં સેટિંગ્સમાંથી આ બદલી શકશો
                    </Text>
                </View>

                {/* Selection Counter */}
                <View className="mx-4 mb-4">
                    <Text className="font-gujarati text-secondary-800 text-lg font-bold">
                        પસંદ કરેલા ધોરણો: {selectedStandards.length.toString()}
                    </Text>
                </View>

                {/* Standards Grid */}
                <View className="mx-4 mb-6">
                    <View className="flex-row flex-wrap gap-[2%] justify-start">
                        {sortedStandards.map((standard) => {
                            const isSelected = selectedStandards.includes(standard.id);
                            return (
                                <View key={standard.id} className="w-[32%] mb-4">
                                    <TouchableOpacity
                                        onPress={() => {
                                            try {
                                                toggleStandard(standard.id);
                                            } catch (error) {
                                                console.error('Error in onPress:', error);
                                            }
                                        }}
                                        className={`p-4 rounded-lg border-2 min-h-[140px] shadow-sm ${isSelected
                                                ? 'bg-primary-50 border-primary-500 shadow-primary-200'
                                                : 'bg-white border-gray-200 shadow-gray-100'
                                            }`}
                                        activeOpacity={0.7}
                                        style={{
                                            shadowOffset: { width: 0, height: 2 },
                                            shadowOpacity: 0.1,
                                            shadowRadius: 4,
                                            elevation: 3,
                                        }}
                                    >
                                        {/* Header with Name and Selection */}
                                        <View className="flex-row items-center justify-between mb-3">
                                            {/* Standard Name */}
                                            <Text className={`font-gujarati text-lg font-bold  ${isSelected ? 'text-primary-800' : 'text-secondary-800'
                                                }`} numberOfLines={2}>
                                                {standard.name}
                                            </Text>

                                            {/* Selection */}
                                            <View className={`w-5 h-5 rounded-full border-2 items-center justify-center ${isSelected
                                                    ? 'bg-primary-500 border-primary-500'
                                                    : 'border-gray-300'
                                                }`}>
                                                {isSelected && (
                                                    <Ionicons name="checkmark" size={14} color="white" />
                                                )}
                                            </View>



                                        </View>


                                        {/* Description */}
                                        {standard.description && (
                                            <Text numberOfLines={2} className={`font-gujarati text-xs mb-3 ${isSelected ? 'text-primary-600' : 'text-secondary-600'
                                                }`}>
                                                {standard.description}
                                            </Text>
                                        )}

                                        {/* Footer with Subject Count */}
                                        <View className="mt-auto">
                                            <View className={`px-3 py-1.5 rounded-full self-start ${isSelected ? 'bg-primary-100' : 'bg-secondary-100'
                                                }`}>
                                                <Text className={`font-gujarati text-xs font-medium ${isSelected ? 'text-primary-700' : 'text-secondary-600'
                                                    }`}>
                                                    {(standard._count?.subjects || 0).toString()} વિષયો
                                                </Text>
                                            </View>
                                        </View>
                                    </TouchableOpacity>
                                </View>
                            );
                        })}
                    </View>
                </View>

                {/* Bottom Spacing */}
                <View className="h-32" />
            </ScrollView>

            {/* Continue Button */}
            <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
                <TouchableOpacity
                    onPress={handleContinue}
                    disabled={isLoading || selectedStandards.length === 0}
                    className={`py-4 rounded-xl items-center ${selectedStandards.length > 0 && !isLoading
                            ? 'bg-primary-600'
                            : 'bg-gray-300'
                        }`}
                    activeOpacity={0.8}
                >
                    {isLoading ? (
                        <View className="flex-row items-center">
                            <View className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2" />
                            <Text className="font-gujarati text-white text-lg font-semibold">
                                સેવ કરી રહ્યું છે...
                            </Text>
                        </View>
                    ) : (
                        <Text className={`font-gujarati text-lg font-semibold ${selectedStandards.length > 0 ? 'text-white' : 'text-gray-500'
                            }`}>
                            આગળ વધો ({selectedStandards.length.toString()} પસંદ કર્યા)
                        </Text>
                    )}
                </TouchableOpacity>
            </View>
        </View>
        </SafeAreaView>
    );
}
