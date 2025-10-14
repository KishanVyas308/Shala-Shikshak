/**
 * AdStatusDebug - Shows current ad status for debugging
 * Use this component during development to see why ads might not be showing
 */

import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AdManager } from '../lib/AdManager';

export const AdStatusDebug: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [status, setStatus] = useState<any>(null);

  useEffect(() => {
    if (isVisible) {
      const updateStatus = () => {
        setStatus(AdManager.getAdStatus());
      };
      
      updateStatus();
      const interval = setInterval(updateStatus, 2000); // Update every 2 seconds
      
      return () => clearInterval(interval);
    }
  }, [isVisible]);

  if (!__DEV__) {
    return null; // Only show in development
  }

  return (
    <View className="absolute bottom-4 right-4 z-50">
      {isVisible && status && (
        <View className="bg-black bg-opacity-90 rounded-lg p-3 mb-2 min-w-[280px]">
          <Text className="text-white font-bold text-sm mb-2">🔍 Ad Debug Status</Text>
          
          {/* Interstitial Status */}
          <View className="mb-2">
            <Text className="text-blue-300 font-semibold text-xs">Interstitial:</Text>
            <Text className="text-white text-xs">
              • Loaded: {status.interstitial.loaded ? '✅' : '❌'}
            </Text>
            <Text className="text-white text-xs">
              • Loading: {status.interstitial.loading ? '🔄' : '❌'}
            </Text>
            <Text className="text-white text-xs">
              • Blocked: {status.interstitial.blocked ? '🚫' : '❌'}
            </Text>
          </View>

          {/* Rewarded Status */}
          <View className="mb-2">
            <Text className="text-green-300 font-semibold text-xs">Rewarded:</Text>
            <Text className="text-white text-xs">
              • Loaded: {status.rewarded.loaded ? '✅' : '❌'}
            </Text>
            <Text className="text-white text-xs">
              • Loading: {status.rewarded.loading ? '🔄' : '❌'}
            </Text>
            <Text className="text-white text-xs">
              • Blocked: {status.rewarded.blocked ? '🚫' : '❌'}
            </Text>
          </View>

          {/* Environment Info */}
          <View>
            <Text className="text-yellow-300 font-semibold text-xs">Environment:</Text>
            <Text className="text-white text-xs">
              • Dev Mode: {__DEV__ ? '✅' : '❌'}
            </Text>
            <Text className="text-white text-xs">
              • No-Fill Expected: {__DEV__ ? '✅ Normal' : 'Should be rare'}
            </Text>
          </View>
        </View>
      )}

      <TouchableOpacity
        onPress={() => setIsVisible(!isVisible)}
        className="bg-blue-600 rounded-full p-3"
      >
        <Ionicons 
          name={isVisible ? "close" : "bug"} 
          size={20} 
          color="white" 
        />
      </TouchableOpacity>
    </View>
  );
};

export default AdStatusDebug;