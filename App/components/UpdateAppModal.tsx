import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, Linking, Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface UpdateAppModalProps {
  visible: boolean;
  currentVersion: string;
  onClose?: () => void; // Optional since force update won't use it
}

const UpdateAppModal: React.FC<UpdateAppModalProps> = ({ visible, currentVersion, onClose }) => {
  const handleUpdate = () => {
    const storeUrl = Platform.select({
      ios: 'https://apps.apple.com/app/your-app-id', // Replace with your actual App Store URL
      android: 'https://play.google.com/store/apps/details?id=com.x100xTechs.shalashikshak',
    });

    if (storeUrl) {
      Linking.openURL(storeUrl);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={() => {}} // Prevent closing on Android back button
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Icon */}
          <View style={styles.iconContainer}>
            <MaterialIcons name="warning" size={48} color="#F59E0B" />
          </View>

          {/* Title */}
          <Text style={styles.title}>અપડેટ ઉપલબ્ધ છે</Text>

          {/* Message */}
          <Text style={styles.message}>
            તમારું એપ્લિકેશન જૂનું છે. કૃપા કરીને નવું વર્ઝન ડાઉનલોડ કરો. એપ્લિકેશન ચાલુ રાખવા માટે અપડેટ કરવું જરૂરી છે.
          </Text>

          {/* Current Version */}
          <View style={styles.versionContainer}>
            <Text style={styles.versionLabel}>વર્તમાન વર્ઝન:</Text>
            <Text style={styles.versionText}>{currentVersion}</Text>
          </View>

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.updateButton}
              onPress={handleUpdate}
              activeOpacity={0.8}
            >
              <Text style={styles.updateButtonText}>હમણાં અપડેટ કરો</Text>
            </TouchableOpacity>
          </View>

          {/* Warning */}
          <Text style={styles.warning}>
            આ એપ્લિકેશનનું જૂનું વર્ઝન બંધ કરવામાં આવ્યું છે
          </Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 24,
  },
  versionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 24,
  },
  versionLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginRight: 8,
  },
  versionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
  },
  updateButton: {
    backgroundColor: '#8B5CF6',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#8B5CF6',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  updateButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  warning: {
    fontSize: 12,
    color: '#EF4444',
    textAlign: 'center',
    marginTop: 16,
    fontWeight: '500',
  },
});

export default UpdateAppModal;
