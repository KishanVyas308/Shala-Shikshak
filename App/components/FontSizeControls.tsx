import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useFontSize } from '../contexts/FontSizeContext';

interface FontSizeControlsProps {
  className?: string;
}

export const FontSizeControls: React.FC<FontSizeControlsProps> = ({ className = '' }) => {
  const { fontSize, increaseFontSize, decreaseFontSize, resetFontSize, getFontSizeClasses } = useFontSize();
  const fontClasses = getFontSizeClasses();

  const getFontSizeLabel = () => {
    switch (fontSize) {
      case 'small': return 'નાનું';
      case 'medium': return 'મધ્યમ';
      case 'large': return 'મોટું';
      case 'extra-large': return 'વધુ મોટું';
      default: return 'મધ્યમ';
    }
  };

  const canDecrease = fontSize !== 'small';
  const canIncrease = fontSize !== 'extra-large';

  return (
    <View className={`flex-row items-center justify-center bg-white rounded-xl p-3 shadow-sm ${className}`}>
      <Text className={`font-gujarati text-gray-600 mr-3 ${fontClasses.text}`}>
        ફોન્ટ સાઈઝ:
      </Text>
      
      <View className="flex-row items-center bg-gray-50 rounded-lg">
        <TouchableOpacity
          onPress={decreaseFontSize}
          disabled={!canDecrease}
          className={`w-10 h-10 rounded-l-lg items-center justify-center ${
            canDecrease ? 'bg-primary-500' : 'bg-gray-300'
          }`}
        >
          <Text className={`text-white font-bold ${fontClasses.textLg}`}>A-</Text>
        </TouchableOpacity>
        
        <View className="px-4 py-2 bg-white">
          <Text className={`font-gujarati text-gray-700 ${fontClasses.text}`}>
            {getFontSizeLabel()}
          </Text>
        </View>
        
        <TouchableOpacity
          onPress={increaseFontSize}
          disabled={!canIncrease}
          className={`w-10 h-10 rounded-r-lg items-center justify-center ${
            canIncrease ? 'bg-primary-500' : 'bg-gray-300'
          }`}
        >
          <Text className={`text-white font-bold ${fontClasses.textLg}`}>A+</Text>
        </TouchableOpacity>
      </View>
      
      <TouchableOpacity 
        onPress={resetFontSize}
        className="ml-3 px-3 py-2 bg-gray-100 rounded-lg"
      >
        <Text className={`font-gujarati text-gray-600 ${fontClasses.text}`}>
          રીસેટ
        </Text>
      </TouchableOpacity>
    </View>
  );
};
