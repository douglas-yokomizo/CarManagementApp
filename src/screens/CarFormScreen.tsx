import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useForm, Controller } from 'react-hook-form';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../contexts/ThemeContext';

import { CarFormData } from '../types/Car';
import { RootStackParamList } from '../types/navigation';
import { CarService } from '../services/carService';
import ImagePickerComponent from '../components/ImagePickerComponent';
import { BrazilianPlateValidator } from '../utils/plateUtils';

type Props = NativeStackScreenProps<RootStackParamList, 'CarForm'>;

interface FormData extends CarFormData {}

const CURRENT_YEAR = new Date().getFullYear();
const MIN_YEAR = 1900;

const POPULAR_BRANDS = [
  'Toyota', 'Honda', 'Ford', 'Chevrolet', 'Volkswagen', 'Fiat', 
  'Hyundai', 'Nissan', 'Renault', 'Peugeot', 'BMW', 'Mercedes-Benz'
];

const POPULAR_COLORS = [
  'Branco', 'Preto', 'Prata', 'Cinza', 'Azul', 'Vermelho', 
  'Bege', 'Dourado', 'Verde', 'Marrom'
];

export default function CarFormScreen({ navigation, route }: Props) {
  const { colors } = useTheme();
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [fieldValidations, setFieldValidations] = useState<Record<string, boolean>>({});
  const [brandSuggestions, setBrandSuggestions] = useState<string[]>([]);
  const [colorSuggestions, setColorSuggestions] = useState<string[]>([]);
  const [showBrandSuggestions, setShowBrandSuggestions] = useState(false);
  const [showColorSuggestions, setShowColorSuggestions] = useState(false);
  const isEditing = !!route.params?.car;
  const car = route.params?.car;

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isValid },
    reset,
  } = useForm<FormData>({
    mode: 'onChange',
    defaultValues: {
      placa: '',
      marca: '',
      modelo: '',
      ano: CURRENT_YEAR,
      cor: '',
      imagem: '',
    },
  });

  const watchedValues = watch();

  useEffect(() => {
    // Set the navigation title based on editing mode
    navigation.setOptions({
      title: isEditing ? 'Editar Carro' : 'Novo Carro'
    });

    if (car) {
      reset({
        placa: car.placa,
        marca: car.marca,
        modelo: car.modelo,
        ano: car.ano,
        cor: car.cor,
        imagem: car.imagem,
      });
      setSelectedImage(car.imagem);
    } else {
      // Load auto-saved data for new cars
      loadAutoSavedData();
    }
  }, [car, reset, navigation, isEditing]);

  // Auto-save form data
  useEffect(() => {
    if (!isEditing && watchedValues) {
      const saveData = async () => {
        try {
          await AsyncStorage.setItem('carFormDraft', JSON.stringify({
            ...watchedValues,
            selectedImage
          }));
        } catch (error) {
          console.log('Auto-save error:', error);
        }
      };
      
      const timer = setTimeout(saveData, 1000); // Debounce 1 second
      return () => clearTimeout(timer);
    }
  }, [watchedValues, selectedImage, isEditing]);

  const loadAutoSavedData = async () => {
    try {
      const savedData = await AsyncStorage.getItem('carFormDraft');
      if (savedData) {
        const parsed = JSON.parse(savedData);
        reset(parsed);
        setSelectedImage(parsed.selectedImage || '');
      }
    } catch (error) {
      console.log('Load auto-save error:', error);
    }
  };

  const clearAutoSavedData = async () => {
    try {
      await AsyncStorage.removeItem('carFormDraft');
    } catch (error) {
      console.log('Clear auto-save error:', error);
    }
  };

  const validatePlaca = (value: string) => {
    const result = BrazilianPlateValidator.validate(value);
    const isValid = result.isValid;
    setFieldValidations(prev => ({ ...prev, placa: isValid }));
    return isValid || result.errorMessage || 'Formato de placa inválido';
  };

  const validateAno = (value: number) => {
    const year = Number(value);
    const isValid = !isNaN(year) && year >= MIN_YEAR && year <= CURRENT_YEAR + 1;
    setFieldValidations(prev => ({ ...prev, ano: isValid }));
    if (!isValid) {
      return `Ano deve estar entre ${MIN_YEAR} e ${CURRENT_YEAR + 1}`;
    }
    return true;
  };

  const validateText = (fieldName: string, value: string, minLength: number = 2) => {
    const isValid = value.length >= minLength;
    setFieldValidations(prev => ({ ...prev, [fieldName]: isValid }));
    return isValid;
  };

  const onSubmit = async (data: FormData) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setLoading(true);
      
      const formData = {
        ...data,
        placa: data.placa.toUpperCase(),
        imagem: selectedImage || 'https://via.placeholder.com/400x300?text=Sem+Imagem',
      };

      if (isEditing && car) {
        await CarService.updateCar(car.id, formData);
        Alert.alert('Sucesso', 'Carro atualizado com sucesso!');
      } else {
        await CarService.createCar(formData);
        Alert.alert('Sucesso', 'Carro cadastrado com sucesso!');
        // Clear auto-saved data after successful creation
        await clearAutoSavedData();
      }
      
      // Navigate back to CarList with refresh signal
      navigation.getParent()?.navigate('Home', { 
        screen: 'CarList', 
        params: { shouldRefresh: true } 
      });
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível salvar o carro');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageSelected = (imageUri: string) => {
    setSelectedImage(imageUri);
    setValue('imagem', imageUri);
  };

  const filterSuggestions = (query: string, list: string[]) => {
    if (!query) return [];
    return list.filter(item => 
      item.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 5);
  };

  const handleBrandChange = (value: string) => {
    const suggestions = filterSuggestions(value, POPULAR_BRANDS);
    setBrandSuggestions(suggestions);
    setShowBrandSuggestions(suggestions.length > 0 && value.length > 0);
  };

  const handleColorChange = (value: string) => {
    const suggestions = filterSuggestions(value, POPULAR_COLORS);
    setColorSuggestions(suggestions);
    setShowColorSuggestions(suggestions.length > 0 && value.length > 0);
  };

  const selectSuggestion = (suggestion: string, field: 'marca' | 'cor') => {
    setValue(field, suggestion);
    if (field === 'marca') {
      setShowBrandSuggestions(false);
    } else {
      setShowColorSuggestions(false);
    }
  };

  return (
    <LinearGradient 
      colors={[colors.background, colors.backgroundSecondary, colors.backgroundTertiary]} 
      style={styles.container}
      locations={[0, 0.5, 1]}
    >
    <KeyboardAvoidingView
      style={styles.keyboardView}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.form}>
          <ImagePickerComponent
            imageUri={selectedImage}
            onImageSelected={handleImageSelected}
          />

          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: colors.text }]}>Placa *</Text>
            <View style={styles.inputWrapper}>
              <Controller
                control={control}
                name="placa"
                rules={{
                  required: 'Placa é obrigatória',
                  validate: validatePlaca,
                }}
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    style={[
                      styles.input, 
                      { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text },
                      errors.placa && { borderColor: colors.error },
                      fieldValidations.placa && { borderColor: colors.success }
                    ]}
                    placeholder="ABC-1234 ou BRA2E19"
                    placeholderTextColor={colors.textMuted}
                    value={value}
                    onChangeText={(text) => {
                      const formatted = BrazilianPlateValidator.formatPlateInput(value, text);
                      onChange(formatted);
                    }}
                    autoCapitalize="characters"
                    maxLength={8}
                  />
                )}
              />
              {fieldValidations.placa && !errors.placa && (
                <View style={styles.validationIcon}>
                  <Ionicons name="checkmark-circle" size={20} color={colors.success} />
                </View>
              )}
            </View>
            {errors.placa && (
              <Text style={[styles.errorText, { color: colors.error }]}>{errors.placa.message}</Text>
            )}
          </View>

          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: colors.text }]}>Marca *</Text>
            <View style={styles.inputWrapper}>
              <Controller
                control={control}
                name="marca"
                rules={{
                  required: 'Marca é obrigatória',
                  minLength: {
                    value: 2,
                    message: 'Marca deve ter pelo menos 2 caracteres',
                  },
                  validate: (value) => validateText('marca', value, 2)
                }}
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    style={[
                      styles.input, 
                      { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text },
                      errors.marca && { borderColor: colors.error },
                      fieldValidations.marca && { borderColor: colors.success }
                    ]}
                    placeholder="Toyota, Honda, Ford..."
                    placeholderTextColor={colors.textMuted}
                    value={value}
                    onChangeText={(text) => {
                      onChange(text);
                      handleBrandChange(text);
                    }}
                    onBlur={() => setShowBrandSuggestions(false)}
                    autoCapitalize="words"
                  />
                )}
              />
              {fieldValidations.marca && !errors.marca && (
                <View style={styles.validationIcon}>
                  <Ionicons name="checkmark-circle" size={20} color={colors.success} />
                </View>
              )}
            </View>
            {showBrandSuggestions && (
              <View style={[styles.suggestionsContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                {brandSuggestions.map((suggestion, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[styles.suggestionItem, { borderBottomColor: colors.borderSecondary }]}
                    onPress={() => selectSuggestion(suggestion, 'marca')}
                  >
                    <Text style={[styles.suggestionText, { color: colors.text }]}>{suggestion}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
            {errors.marca && (
              <Text style={[styles.errorText, { color: colors.error }]}>{errors.marca.message}</Text>
            )}
          </View>

          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: colors.text }]}>Modelo *</Text>
            <Controller
              control={control}
              name="modelo"
              rules={{
                required: 'Modelo é obrigatório',
                minLength: {
                  value: 2,
                  message: 'Modelo deve ter pelo menos 2 caracteres',
                },
              }}
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={[
                    styles.input, 
                    { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text },
                    errors.modelo && { borderColor: colors.error }
                  ]}
                  placeholder="Corolla, Civic, Focus..."
                  placeholderTextColor={colors.textMuted}
                  value={value}
                  onChangeText={onChange}
                  autoCapitalize="words"
                />
              )}
            />
            {errors.modelo && (
              <Text style={[styles.errorText, { color: colors.error }]}>{errors.modelo.message}</Text>
            )}
          </View>

          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: colors.text }]}>Ano *</Text>
            <View style={styles.inputWrapper}>
              <Controller
                control={control}
                name="ano"
                rules={{
                  required: 'Ano é obrigatório',
                  validate: validateAno,
                }}
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    style={[
                      styles.input, 
                      { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text },
                      errors.ano && { borderColor: colors.error },
                      fieldValidations.ano && { borderColor: colors.success }
                    ]}
                    placeholder={CURRENT_YEAR.toString()}
                    placeholderTextColor={colors.textMuted}
                    value={value?.toString()}
                    onChangeText={(text) => onChange(parseInt(text) || 0)}
                    keyboardType="numeric"
                    maxLength={4}
                  />
                )}
              />
              {fieldValidations.ano && !errors.ano && (
                <View style={styles.validationIcon}>
                  <Ionicons name="checkmark-circle" size={20} color={colors.success} />
                </View>
              )}
            </View>
            {errors.ano && (
              <Text style={[styles.errorText, { color: colors.error }]}>{errors.ano.message}</Text>
            )}
          </View>

          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: colors.text }]}>Cor *</Text>
            <View style={styles.inputWrapper}>
              <Controller
                control={control}
                name="cor"
                rules={{
                  required: 'Cor é obrigatória',
                  minLength: {
                    value: 3,
                    message: 'Cor deve ter pelo menos 3 caracteres',
                  },
                  validate: (value) => validateText('cor', value, 3)
                }}
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    style={[
                      styles.input, 
                      { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text },
                      errors.cor && { borderColor: colors.error },
                      fieldValidations.cor && { borderColor: colors.success }
                    ]}
                    placeholder="Branco, Preto, Azul..."
                    placeholderTextColor={colors.textMuted}
                    value={value}
                    onChangeText={(text) => {
                      onChange(text);
                      handleColorChange(text);
                    }}
                    onBlur={() => setShowColorSuggestions(false)}
                    autoCapitalize="words"
                  />
                )}
              />
              {fieldValidations.cor && !errors.cor && (
                <View style={styles.validationIcon}>
                  <Ionicons name="checkmark-circle" size={20} color={colors.success} />
                </View>
              )}
            </View>
            {showColorSuggestions && (
              <View style={[styles.suggestionsContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                {colorSuggestions.map((suggestion, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[styles.suggestionItem, { borderBottomColor: colors.borderSecondary }]}
                    onPress={() => selectSuggestion(suggestion, 'cor')}
                  >
                    <Text style={[styles.suggestionText, { color: colors.text }]}>{suggestion}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
            {errors.cor && (
              <Text style={[styles.errorText, { color: colors.error }]}>{errors.cor.message}</Text>
            )}
          </View>

          <TouchableOpacity
            style={[
              styles.submitButton,
              { 
                backgroundColor: colors.primary,
                shadowColor: colors.primary
              },
              (!isValid || loading) && { 
                backgroundColor: colors.textMuted,
                shadowColor: colors.textMuted
              },
            ]}
            onPress={handleSubmit(onSubmit)}
            disabled={!isValid || loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons
                  name={isEditing ? 'checkmark' : 'add'}
                  size={20}
                  color="#fff"
                  style={styles.buttonIcon}
                />
                <Text style={styles.submitButtonText}>
                  {isEditing ? 'Atualizar' : 'Cadastrar'}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  form: {
    padding: 24,
    paddingTop: 32,
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputWrapper: {
    position: 'relative',
  },
  input: {
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 20,
    paddingHorizontal: 24,
    paddingVertical: 18,
    paddingRight: 56,
    fontSize: 16,
    backgroundColor: 'rgba(26, 26, 46, 0.6)',
    color: '#ffffff',
    fontWeight: '500',
  },
  inputError: {
    borderColor: '#ff6b6b',
  },
  inputSuccess: {
    borderColor: '#4ecdc4',
  },
  validationIcon: {
    position: 'absolute',
    right: 20,
    top: '50%',
    transform: [{ translateY: -10 }],
  },
  errorText: {
    color: '#ff6b6b',
    fontSize: 12,
    marginTop: 8,
    fontWeight: '600',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    borderRadius: 16,
    marginTop: 32,
    elevation: 8,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  submitButtonDisabled: {
    backgroundColor: '#4a4a6a',
    elevation: 0,
    shadowOpacity: 0,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  buttonIcon: {
    marginRight: 10,
  },
  suggestionsContainer: {
    backgroundColor: 'rgba(26, 26, 46, 0.95)',
    borderRadius: 12,
    marginTop: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  suggestionItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  suggestionText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
  },
});