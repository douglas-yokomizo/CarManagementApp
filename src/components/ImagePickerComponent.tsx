import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  Platform,
  Modal,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '../contexts/ThemeContext';

interface ImagePickerComponentProps {
  imageUri: string;
  onImageSelected: (uri: string) => void;
}

const { width } = Dimensions.get('window');

export default function ImagePickerComponent({
  imageUri,
  onImageSelected,
}: ImagePickerComponentProps) {
  const { colors } = useTheme();
  const [showOptions, setShowOptions] = useState(false);
  const requestPermissions = async () => {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permissão negada',
          'Precisamos de acesso à galeria para selecionar imagens'
        );
        return false;
      }
    }
    return true;
  };

  const pickImage = async (cropAspect?: [number, number]) => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: cropAspect || [4, 3],
        quality: 0.9,
        allowsMultipleSelection: false,
        selectionLimit: 1,
      });

      if (!result.canceled && result.assets[0]) {
        onImageSelected(result.assets[0].uri);
        setShowOptions(false);
      }
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível selecionar a imagem');
    }
  };

  const takePhoto = async (cropAspect?: [number, number]) => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permissão negada',
          'Precisamos de acesso à câmera para tirar fotos'
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: cropAspect || [4, 3],
        quality: 0.9,
        cameraType: ImagePicker.CameraType.back,
      });

      if (!result.canceled && result.assets[0]) {
        onImageSelected(result.assets[0].uri);
        setShowOptions(false);
      }
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível tirar a foto');
    }
  };

  const showImageOptions = () => {
    setShowOptions(true);
  };

  const removeImage = () => {
    onImageSelected('');
    setShowOptions(false);
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: colors.text }]}>Foto do Carro</Text>
      
      <TouchableOpacity style={[styles.imageContainer, { backgroundColor: colors.surface, borderColor: colors.border }]} onPress={showImageOptions}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.image} />
        ) : (
          <View style={[styles.placeholder, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}>
            <Ionicons name="camera" size={52} color={colors.textMuted} />
            <Text style={[styles.placeholderText, { color: colors.textMuted }]}>Toque para adicionar foto</Text>
          </View>
        )}
        <View style={[styles.overlay, { backgroundColor: `${colors.primary}E6` }]}>
          <Ionicons name="camera" size={26} color="#fff" />
        </View>
      </TouchableOpacity>
      
      {imageUri && (
        <TouchableOpacity
          style={[styles.changeButton, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}
          onPress={showImageOptions}
        >
          <Ionicons name="refresh" size={16} color={colors.primary} />
          <Text style={[styles.changeButtonText, { color: colors.primary }]}>Alterar foto</Text>
        </TouchableOpacity>
      )}

      {/* Enhanced Options Modal */}
      <Modal
        visible={showOptions}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowOptions(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Selecionar Foto</Text>
            <Text style={[styles.modalSubtitle, { color: colors.textMuted }]}>Escolha como adicionar a foto do carro</Text>
            
            <View style={styles.optionsGrid}>
              <TouchableOpacity 
                style={[styles.optionCard, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}
                onPress={() => takePhoto([4, 3])}
              >
                <View style={[styles.optionIcon, { backgroundColor: `${colors.primary}26`, borderColor: `${colors.primary}4D` }]}>
                  <Ionicons name="camera" size={28} color={colors.primary} />
                </View>
                <Text style={[styles.optionTitle, { color: colors.text }]}>Câmera</Text>
                <Text style={[styles.optionSubtitle, { color: colors.textMuted }]}>Tirar nova foto</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.optionCard, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}
                onPress={() => pickImage([4, 3])}
              >
                <View style={[styles.optionIcon, { backgroundColor: `${colors.primary}26`, borderColor: `${colors.primary}4D` }]}>
                  <Ionicons name="images" size={28} color={colors.primary} />
                </View>
                <Text style={[styles.optionTitle, { color: colors.text }]}>Galeria</Text>
                <Text style={[styles.optionSubtitle, { color: colors.textMuted }]}>Escolher da galeria</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.optionCard, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}
                onPress={() => pickImage([16, 9])}
              >
                <View style={[styles.optionIcon, { backgroundColor: `${colors.primary}26`, borderColor: `${colors.primary}4D` }]}>
                  <Ionicons name="crop" size={28} color={colors.primary} />
                </View>
                <Text style={[styles.optionTitle, { color: colors.text }]}>Panorâmica</Text>
                <Text style={[styles.optionSubtitle, { color: colors.textMuted }]}>Formato 16:9</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.optionCard, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}
                onPress={() => pickImage([1, 1])}
              >
                <View style={[styles.optionIcon, { backgroundColor: `${colors.primary}26`, borderColor: `${colors.primary}4D` }]}>
                  <Ionicons name="square" size={28} color={colors.primary} />
                </View>
                <Text style={[styles.optionTitle, { color: colors.text }]}>Quadrada</Text>
                <Text style={[styles.optionSubtitle, { color: colors.textMuted }]}>Formato 1:1</Text>
              </TouchableOpacity>
            </View>

            {imageUri && (
              <TouchableOpacity 
                style={[styles.removeButton, { backgroundColor: `${colors.error}1A`, borderColor: `${colors.error}4D` }]}
                onPress={removeImage}
              >
                <Ionicons name="trash-outline" size={20} color={colors.error} />
                <Text style={[styles.removeButtonText, { color: colors.error }]}>Remover foto</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity 
              style={[styles.cancelButton, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}
              onPress={() => setShowOptions(false)}
            >
              <Text style={[styles.cancelButtonText, { color: colors.text }]}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 32,
    alignItems: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 16,
    alignSelf: 'flex-start',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  imageContainer: {
    width: 240,
    height: 180,
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 2,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderStyle: 'dashed',
  },
  placeholderText: {
    marginTop: 12,
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '600',
  },
  overlay: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(108, 99, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#6c63ff',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  changeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  changeButtonText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#1a1a2e',
    borderRadius: 20,
    padding: 24,
    width: width - 40,
    maxWidth: 400,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#b0b0c5',
    textAlign: 'center',
    marginBottom: 24,
    fontWeight: '500',
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  optionCard: {
    width: '48%',
    backgroundColor: 'rgba(22, 33, 62, 0.6)',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  optionIcon: {
    width: 56,
    height: 56,
    backgroundColor: 'rgba(108, 99, 255, 0.15)',
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(108, 99, 255, 0.3)',
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
    textAlign: 'center',
  },
  optionSubtitle: {
    fontSize: 12,
    color: '#8a8aa6',
    textAlign: 'center',
    fontWeight: '500',
  },
  removeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 107, 0.3)',
  },
  removeButtonText: {
    color: '#ff6b6b',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  cancelButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  cancelButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});