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
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useForm, Controller } from 'react-hook-form';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { CarFormData } from '../types/Car';
import { RootStackParamList } from '../types/navigation';
import { CarService } from '../services/carService';
import ImagePickerComponent from '../components/ImagePickerComponent';
import { BrazilianPlateValidator } from '../utils/plateUtils';

type Props = NativeStackScreenProps<RootStackParamList, 'CarForm'>;

interface FormData extends CarFormData {}

const CURRENT_YEAR = new Date().getFullYear();
const MIN_YEAR = 1900;

export default function CarFormScreen({ navigation, route }: Props) {
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const isEditing = !!route.params?.car;
  const car = route.params?.car;

  const {
    control,
    handleSubmit,
    setValue,
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

  useEffect(() => {
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
    }
  }, [car, reset]);

  const validatePlaca = (value: string) => {
    const result = BrazilianPlateValidator.validate(value);
    return result.isValid || result.errorMessage || 'Formato de placa inválido';
  };

  const validateAno = (value: number) => {
    const year = Number(value);
    if (isNaN(year) || year < MIN_YEAR || year > CURRENT_YEAR + 1) {
      return `Ano deve estar entre ${MIN_YEAR} e ${CURRENT_YEAR + 1}`;
    }
    return true;
  };

  const onSubmit = async (data: FormData) => {
    try {
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
      }
      
      // Navigate back to CarList with refresh signal
      navigation.navigate('CarList', { shouldRefresh: true });
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

  return (
    <LinearGradient 
      colors={['#0f0f23', '#1a1a2e', '#16213e']} 
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
          <Text style={styles.title}>
            {isEditing ? 'Editar Carro' : 'Novo Carro'}
          </Text>

          <ImagePickerComponent
            imageUri={selectedImage}
            onImageSelected={handleImageSelected}
          />

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Placa *</Text>
            <Controller
              control={control}
              name="placa"
              rules={{
                required: 'Placa é obrigatória',
                validate: validatePlaca,
              }}
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={[styles.input, errors.placa && styles.inputError]}
                  placeholder="ABC-1234 ou BRA2E19"
                  placeholderTextColor="#7070a0"
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
            {errors.placa && (
              <Text style={styles.errorText}>{errors.placa.message}</Text>
            )}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Marca *</Text>
            <Controller
              control={control}
              name="marca"
              rules={{
                required: 'Marca é obrigatória',
                minLength: {
                  value: 2,
                  message: 'Marca deve ter pelo menos 2 caracteres',
                },
              }}
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={[styles.input, errors.marca && styles.inputError]}
                  placeholder="Toyota, Honda, Ford..."
                  placeholderTextColor="#7070a0"
                  value={value}
                  onChangeText={onChange}
                  autoCapitalize="words"
                />
              )}
            />
            {errors.marca && (
              <Text style={styles.errorText}>{errors.marca.message}</Text>
            )}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Modelo *</Text>
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
                  style={[styles.input, errors.modelo && styles.inputError]}
                  placeholder="Corolla, Civic, Focus..."
                  placeholderTextColor="#7070a0"
                  value={value}
                  onChangeText={onChange}
                  autoCapitalize="words"
                />
              )}
            />
            {errors.modelo && (
              <Text style={styles.errorText}>{errors.modelo.message}</Text>
            )}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Ano *</Text>
            <Controller
              control={control}
              name="ano"
              rules={{
                required: 'Ano é obrigatório',
                validate: validateAno,
              }}
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={[styles.input, errors.ano && styles.inputError]}
                  placeholder={CURRENT_YEAR.toString()}
                  placeholderTextColor="#7070a0"
                  value={value?.toString()}
                  onChangeText={(text) => onChange(parseInt(text) || 0)}
                  keyboardType="numeric"
                  maxLength={4}
                />
              )}
            />
            {errors.ano && (
              <Text style={styles.errorText}>{errors.ano.message}</Text>
            )}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Cor *</Text>
            <Controller
              control={control}
              name="cor"
              rules={{
                required: 'Cor é obrigatória',
                minLength: {
                  value: 3,
                  message: 'Cor deve ter pelo menos 3 caracteres',
                },
              }}
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={[styles.input, errors.cor && styles.inputError]}
                  placeholder="Branco, Preto, Azul..."
                  placeholderTextColor="#7070a0"
                  value={value}
                  onChangeText={onChange}
                  autoCapitalize="words"
                />
              )}
            />
            {errors.cor && (
              <Text style={styles.errorText}>{errors.cor.message}</Text>
            )}
          </View>

          <TouchableOpacity
            style={[
              styles.submitButton,
              (!isValid || loading) && styles.submitButtonDisabled,
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
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: '#ffffff',
    marginBottom: 40,
    textAlign: 'center',
    letterSpacing: 1,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
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
  input: {
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 20,
    paddingHorizontal: 24,
    paddingVertical: 18,
    fontSize: 16,
    backgroundColor: 'rgba(26, 26, 46, 0.6)',
    color: '#ffffff',
    fontWeight: '500',
    backdropFilter: 'blur(20px)',
  },
  inputError: {
    borderColor: '#ff6b6b',
  },
  errorText: {
    color: '#ff6b6b',
    fontSize: 12,
    marginTop: 8,
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#6c63ff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    borderRadius: 16,
    marginTop: 32,
    elevation: 8,
    shadowColor: '#6c63ff',
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
});