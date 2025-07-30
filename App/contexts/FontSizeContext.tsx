import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type FontSizeLevel = 'small' | 'medium' | 'large' | 'extra-large';

interface FontSizeContextType {
  fontSize: FontSizeLevel;
  increaseFontSize: () => void;
  decreaseFontSize: () => void;
  resetFontSize: () => void;
  getFontSizeClasses: () => {
    text: string;
    textLg: string;
    textXl: string;
    text2xl: string;
    text3xl: string;
    title: string;
    subtitle: string;
  };
}

const FontSizeContext = createContext<FontSizeContextType | undefined>(undefined);

const FONT_SIZE_KEY = '@font_size_level';

const fontSizeLevels: FontSizeLevel[] = ['small', 'medium', 'large', 'extra-large'];

const fontSizeClasses = {
  small: {
    text: 'text-xs',
    textLg: 'text-sm', 
    textXl: 'text-base',
    text2xl: 'text-lg',
    text3xl: 'text-xl',
    title: 'text-lg',
    subtitle: 'text-sm',
  },
  medium: {
    text: 'text-sm',
    textLg: 'text-base',
    textXl: 'text-lg', 
    text2xl: 'text-xl',
    text3xl: 'text-2xl',
    title: 'text-xl',
    subtitle: 'text-base',
  },
  large: {
    text: 'text-base',
    textLg: 'text-lg',
    textXl: 'text-xl',
    text2xl: 'text-2xl', 
    text3xl: 'text-3xl',
    title: 'text-xl',
    subtitle: 'text-lg',
  },
  'extra-large': {
    text: 'text-lg',
    textLg: 'text-xl',
    textXl: 'text-2xl',
    text2xl: 'text-3xl',
    text3xl: 'text-4xl', 
    title: 'text-xl',
    subtitle: 'text-xl',
  },
};

interface FontSizeProviderProps {
  children: ReactNode;
}

export const FontSizeProvider: React.FC<FontSizeProviderProps> = ({ children }) => {
  const [fontSize, setFontSize] = useState<FontSizeLevel>('medium');

  // Load font size from storage on app start
  useEffect(() => {
    const loadFontSize = async () => {
      try {
        const savedFontSize = await AsyncStorage.getItem(FONT_SIZE_KEY);
        if (savedFontSize && fontSizeLevels.includes(savedFontSize as FontSizeLevel)) {
          setFontSize(savedFontSize as FontSizeLevel);
        } else {
          // Set default to medium if no saved preference
          setFontSize('medium');
        }
      } catch (error) {
        console.warn('Error loading font size:', error);
        setFontSize('medium'); // Fallback to medium
      }
    };
    loadFontSize();
  }, []);

  // Save font size to storage whenever it changes
  const saveFontSize = async (newFontSize: FontSizeLevel) => {
    try {
      await AsyncStorage.setItem(FONT_SIZE_KEY, newFontSize);
      setFontSize(newFontSize);
    } catch (error) {
      console.warn('Error saving font size:', error);
    }
  };

  const increaseFontSize = () => {
    const currentIndex = fontSizeLevels.indexOf(fontSize);
    if (currentIndex < fontSizeLevels.length - 1) {
      const newFontSize = fontSizeLevels[currentIndex + 1];
      saveFontSize(newFontSize);
    }
  };

  const decreaseFontSize = () => {
    const currentIndex = fontSizeLevels.indexOf(fontSize);
    if (currentIndex > 0) {
      const newFontSize = fontSizeLevels[currentIndex - 1];
      saveFontSize(newFontSize);
    }
  };

  const resetFontSize = () => {
    saveFontSize('medium');
  };

  const getFontSizeClasses = () => {
    return fontSizeClasses[fontSize];
  };

  const value: FontSizeContextType = {
    fontSize,
    increaseFontSize,
    decreaseFontSize,
    resetFontSize,
    getFontSizeClasses,
  };

  return (
    <FontSizeContext.Provider value={value}>
      {children}
    </FontSizeContext.Provider>
  );
};

export const useFontSize = (): FontSizeContextType => {
  const context = useContext(FontSizeContext);
  if (!context) {
    throw new Error('useFontSize must be used within a FontSizeProvider');
  }
  return context;
};
