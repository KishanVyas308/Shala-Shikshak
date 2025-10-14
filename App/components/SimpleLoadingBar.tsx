import React, { useEffect, useRef } from 'react';
import { View, Animated, Dimensions } from 'react-native';

interface SimpleLoadingBarProps {
  height?: number;
  color?: string;
  backgroundColor?: string;
  duration?: number;
}

export default function SimpleLoadingBar({
  height = 4,
  color = '#16a34a',
  backgroundColor = '#e5e7eb',
  duration = 2000
}: SimpleLoadingBarProps) {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const screenWidth = Dimensions.get('window').width;

  useEffect(() => {
    const animate = () => {
      animatedValue.setValue(0);
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: duration,
        useNativeDriver: false,
      }).start(() => {
        // Restart animation
        animate();
      });
    };

    animate();

    return () => {
      animatedValue.stopAnimation();
    };
  }, [duration]);

  const translateX = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [-screenWidth, screenWidth],
  });

  return (
    <View
      style={{
        height: height,
        backgroundColor: backgroundColor,
        overflow: 'hidden',
        width: '100%',
      }}
    >
      <Animated.View
        style={{
          height: '100%',
          width: screenWidth * 0.3, // 30% of screen width
          backgroundColor: color,
          transform: [{ translateX }],
        }}
      />
    </View>
  );
}