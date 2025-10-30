import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Linking, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { whatsappAPI, WhatsAppLink } from '../services/whatsappAPI';
import { useFontSize } from '../contexts/FontSizeContext';

// Global state for WhatsApp link (similar to web version)
let globalWhatsAppLink: WhatsAppLink | null = null;
let isLinkFetched = false;
const linkSubscribers: Set<(link: WhatsAppLink | null) => void> = new Set();

const notifySubscribers = (link: WhatsAppLink | null) => {
  linkSubscribers.forEach(callback => callback(link));
};

const fetchActiveLink = async () => {
  if (isLinkFetched) return globalWhatsAppLink;
  
  try {
    console.log('Fetching WhatsApp link from API...');
    const link = await whatsappAPI.getActiveLink();
    console.log('API Response:', link);
    
    if (link && !link.url) {
      console.warn('WhatsApp link received but URL is missing:', link);
    }
    
    globalWhatsAppLink = link;
    isLinkFetched = true;
    notifySubscribers(link);
    return link;
  } catch (error) {
    console.error('Error fetching active WhatsApp link:', error);
    isLinkFetched = true;
    notifySubscribers(null);
    return null;
  }
};

interface WhatsAppJoinCardProps {
  className?: string;
}

const WhatsAppJoinCard: React.FC<WhatsAppJoinCardProps> = ({ className = '' }) => {
  const [activeLink, setActiveLink] = useState<WhatsAppLink | null>(globalWhatsAppLink);
  const [loading, setLoading] = useState(!isLinkFetched);
  const { getFontSizeClasses } = useFontSize();

  useEffect(() => {
    linkSubscribers.add(setActiveLink);
    
    if (!isLinkFetched) {
      fetchActiveLink().then(() => setLoading(false));
    } else {
      setLoading(false);
    }

    return () => {
      linkSubscribers.delete(setActiveLink);
    };
  }, []);

  const handleJoinPress = async () => {
    if (!activeLink) {
      console.log('No active link available');
      Alert.alert(
        'ત્રુટિ',
        'WhatsApp લિંક ઉપલબ્ધ નથી. કૃપા કરીને પછીથી પ્રયાસ કરો.',
        [{ text: 'ઓકે', style: 'default' }]
      );
      return;
    }

    if (!activeLink.url || typeof activeLink.url !== 'string') {
      console.log('Active link URL is invalid:', activeLink);
      Alert.alert(
        'ત્રુટિ',
        'WhatsApp લિંક માન્ય નથી. કૃપા કરીને પછીથી પ્રયાસ કરો.',
        [{ text: 'ઓકે', style: 'default' }]
      );
      return;
    }

    let finalUrl = activeLink.url.trim();
    if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
      finalUrl = 'https://' + finalUrl;
    }

    console.log('Opening WhatsApp URL:', finalUrl);

    try {
      const canOpen = await Linking.canOpenURL(finalUrl);
      console.log('Can open URL:', canOpen);
      
      if (canOpen) {
        await Linking.openURL(finalUrl);
        console.log('Successfully opened WhatsApp URL');
      } else {
        console.log('Cannot open URL, checking alternatives...');
        
        if (finalUrl.includes('chat.whatsapp.com')) {
          const whatsappScheme = finalUrl.replace('https://chat.whatsapp.com/', 'whatsapp://chat?code=');
          const canOpenScheme = await Linking.canOpenURL(whatsappScheme);
          console.log('Trying WhatsApp scheme:', whatsappScheme, 'Can open:', canOpenScheme);
          
          if (canOpenScheme) {
            await Linking.openURL(whatsappScheme);
            return;
          }
        }
        
        Alert.alert(
          'WhatsApp ઉપલબ્ધ નથી',
          'કૃપા કરીને WhatsApp ઇન્સ્ટોલ કરો અને ફરીથી પ્રયાસ કરો.',
          [
            { text: 'રદ કરો', style: 'cancel' },
            { 
              text: 'WhatsApp ડાઉનલોડ કરો', 
              onPress: () => {
                const storeUrl = Platform.OS === 'ios' 
                  ? 'https://apps.apple.com/app/whatsapp-messenger/id310633997'
                  : 'https://play.google.com/store/apps/details?id=com.whatsapp';
                Linking.openURL(storeUrl);
              }
            }
          ]
        );
      }
    } catch (error) {
      console.error('Error opening WhatsApp link:', error);
      Alert.alert(
        'ત્રુટિ',
        'WhatsApp ગ્રુપ ખોલવામાં સમસ્યા આવી છે. કૃપા કરીને ફરીથી પ્રયાસ કરો.',
        [
          { text: 'રદ કરો', style: 'cancel' },
          { 
            text: 'ફરી પ્રયાસ કરો', 
            onPress: () => handleJoinPress()
          }
        ]
      );
    }
  };

  if (loading || !activeLink) {
    return null;
  }

  return (
    <View className={`mx-4 mb-6 ${className}`}>
      <TouchableOpacity
        onPress={handleJoinPress}
        className="p-4 bg-white rounded-xl shadow-sm border border-gray-100"
        activeOpacity={0.7}
      >
        <View className="flex-row items-center">
          {/* WhatsApp Icon */}
          <View className="w-12 h-12 rounded-full bg-green-50 items-center justify-center mr-4">
            <Ionicons name="logo-whatsapp" size={26} color="#16a34a" />
          </View>

          {/* Content */}
          <View className="flex-1">
            <Text className={`font-gujarati text-gray-900 font-bold ${getFontSizeClasses().textLg}`}>
              WhatsApp ગ્રુપમાં જોડાઓ
            </Text>
            <Text className={`font-gujarati text-gray-600 mt-0.5 ${getFontSizeClasses().text}`}>
              {activeLink.description || 'અમારા શૈક્ષણિક સમુદાયનો ભાગ બનો'}
            </Text>
          </View>
          
          <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
        </View>
      </TouchableOpacity>
    </View>
  );
};

export { fetchActiveLink };
export default WhatsAppJoinCard;