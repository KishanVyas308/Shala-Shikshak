import React, { useEffect, useRef } from 'react';
import { View, Animated } from 'react-native';

interface MinimalLoadingBarProps {
  isVisible?: boolean;
}

export default function MinimalLoadingBar({ isVisible = true }: MinimalLoadingBarProps) {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!isVisible) return;

    const animate = () => {
      animatedValue.setValue(0);
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: false,
      }).start(() => {
        if (isVisible) {
          animate();
        }
      });
    };

    animate();

    return () => {
      animatedValue.stopAnimation();
    };
  }, [isVisible]);

  if (!isVisible) return null;

  const width = animatedValue.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ['0%', '70%', '100%'],
  });

  const opacity = animatedValue.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.3, 1, 0.3],
  });

  return (
    <View className="h-1 bg-gray-200 overflow-hidden">
      <Animated.View
        className="h-full bg-primary-600"
        style={{
          width,
          opacity,
        }}
      />
    </View>
  );
}