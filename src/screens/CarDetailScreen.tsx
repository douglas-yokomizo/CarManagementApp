import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
  Dimensions,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../contexts/ThemeContext';

import { Car } from '../types/Car';
import { RootStackParamList } from '../types/navigation';
import { CarService } from '../services/carService';

type Props = NativeStackScreenProps<RootStackParamList, 'CarDetail'>;

const { width } = Dimensions.get('window');

export default function CarDetailScreen({ navigation, route }: Props) {
  const { colors } = useTheme();
  const [car, setCar] = useState<Car | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  const { carId } = route.params;

  useEffect(() => {
    loadCar();
  }, [carId]);

  const loadCar = async () => {
    try {
      setLoading(true);
      const carData = await CarService.getCarById(carId);
      setCar(carData);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível carregar os dados do carro');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    if (car) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      navigation.navigate('CarForm', { car });
    }
  };

  const handleDelete = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      'Confirmar Exclusão',
      'Tem certeza que deseja excluir este carro? Esta ação não pode ser desfeita.',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: confirmDelete,
        },
      ]
    );
  };

  const confirmDelete = async () => {
    if (!car) return;

    try {
      setDeleting(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      await CarService.deleteCar(car.id);
      Alert.alert('Sucesso', 'Carro excluído com sucesso!');
      navigation.navigate('CarList', { shouldRefresh: true });
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível excluir o carro');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Carregando dados...</Text>
      </View>
    );
  }

  if (!car) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
        <Ionicons name="alert-circle-outline" size={64} color={colors.error} />
        <Text style={[styles.errorText, { color: colors.error }]}>Carro não encontrado</Text>
      </View>
    );
  }

  return (
    <LinearGradient 
      colors={[colors.background, colors.backgroundSecondary, colors.backgroundTertiary]} 
      style={styles.container}
      locations={[0, 0.4, 1]}
    >
    <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
      <View style={[styles.imageContainer, { backgroundColor: colors.surfaceSecondary }]}>
        <Image
          source={{ uri: car.imagem }}
          style={styles.carImage}
          resizeMode="cover"
          onError={() => {
            setCar(prev => prev ? {
              ...prev,
              imagem: 'https://via.placeholder.com/400x300?text=Imagem+Indisponível'
            } : null);
          }}
        />
      </View>

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.carTitle, { color: colors.text }]}>
            {car.marca} {car.modelo}
          </Text>
          <Text style={[styles.carYear, { color: colors.primary, backgroundColor: colors.surface }]}>{car.ano}</Text>
        </View>

        <LinearGradient
          colors={[colors.cardBackground, colors.surfaceSecondary]}
          style={[styles.detailsContainer, { borderColor: colors.border }]}
        >
          <DetailItem
            icon="car-outline"
            label="Placa"
            value={car.placa}
            colors={colors}
          />
          <DetailItem
            icon="business-outline"
            label="Marca"
            value={car.marca}
            colors={colors}
          />
          <DetailItem
            icon="car-sport-outline"
            label="Modelo"
            value={car.modelo}
            colors={colors}
          />
          <DetailItem
            icon="calendar-outline"
            label="Ano"
            value={car.ano.toString()}
            colors={colors}
          />
          <DetailItem
            icon="color-palette-outline"
            label="Cor"
            value={car.cor}
            colors={colors}
          />
        </LinearGradient>

        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.secondary }]}
            onPress={handleEdit}
          >
            <Ionicons name="pencil" size={20} color="#fff" />
            <Text style={styles.actionButtonText}>Editar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.error }]}
            onPress={handleDelete}
            disabled={deleting}
          >
            {deleting ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Ionicons name="trash" size={20} color="#fff" />
                <Text style={styles.actionButtonText}>Excluir</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
    </LinearGradient>
  );
}

interface DetailItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  colors: any;
}

function DetailItem({ icon, label, value, colors }: DetailItemProps) {
  return (
    <View style={[styles.detailItem, { borderBottomColor: colors.border }]}>
      <View style={[styles.detailIconContainer, { backgroundColor: `${colors.primary}20`, borderColor: `${colors.primary}40` }]}>
        <Ionicons name={icon} size={24} color={colors.primary} />
      </View>
      <View style={styles.detailTextContainer}>
        <Text style={[styles.detailLabel, { color: colors.textMuted }]}>{label}</Text>
        <Text style={[styles.detailValue, { color: colors.text }]}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0f0f23',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#a0a0b5',
    fontWeight: '500',
  },
  errorText: {
    marginTop: 16,
    fontSize: 18,
    color: '#ff6b6b',
    textAlign: 'center',
    fontWeight: '700',
  },
  imageContainer: {
    width: '100%',
    height: 280,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    overflow: 'hidden',
  },
  carImage: {
    width: '100%',
    height: '100%',
  },
  content: {
    padding: 24,
  },
  header: {
    marginBottom: 32,
  },
  carTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  carYear: {
    fontSize: 20,
    color: '#6c63ff',
    fontWeight: '700',
    backgroundColor: '#16213e',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  detailsContainer: {
    borderRadius: 24,
    padding: 28,
    marginBottom: 32,
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(20px)',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a40',
  },
  detailIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(108, 99, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 24,
    borderWidth: 1,
    borderColor: 'rgba(108, 99, 255, 0.3)',
  },
  detailTextContainer: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 14,
    color: '#7070a0',
    marginBottom: 4,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  detailValue: {
    fontSize: 18,
    color: '#ffffff',
    fontWeight: '700',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 20,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 16,
    gap: 10,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  editButton: {
    backgroundColor: '#4ecdc4',
  },
  deleteButton: {
    backgroundColor: '#ff6b6b',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});