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
    <KeyboardAvoidingView
      style={styles.container}
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  form: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 24,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    color: '#333',
  },
  inputError: {
    borderColor: '#f44336',
  },
  errorText: {
    color: '#f44336',
    fontSize: 12,
    marginTop: 4,
  },
  submitButton: {
    backgroundColor: '#2196F3',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 8,
    marginTop: 20,
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  buttonIcon: {
    marginRight: 8,
  },
});