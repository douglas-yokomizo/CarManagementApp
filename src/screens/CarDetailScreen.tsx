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

import { Car } from '../types/Car';
import { RootStackParamList } from '../types/navigation';
import { CarService } from '../services/carService';

type Props = NativeStackScreenProps<RootStackParamList, 'CarDetail'>;

const { width } = Dimensions.get('window');

export default function CarDetailScreen({ navigation, route }: Props) {
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
      navigation.navigate('CarForm', { car });
    }
  };

  const handleDelete = () => {
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
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#6c63ff" />
        <Text style={styles.loadingText}>Carregando dados...</Text>
      </View>
    );
  }

  if (!car) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="alert-circle-outline" size={64} color="#ff6b6b" />
        <Text style={styles.errorText}>Carro não encontrado</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.imageContainer}>
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
          <Text style={styles.carTitle}>
            {car.marca} {car.modelo}
          </Text>
          <Text style={styles.carYear}>{car.ano}</Text>
        </View>

        <View style={styles.detailsContainer}>
          <DetailItem
            icon="car-outline"
            label="Placa"
            value={car.placa}
          />
          <DetailItem
            icon="business-outline"
            label="Marca"
            value={car.marca}
          />
          <DetailItem
            icon="car-sport-outline"
            label="Modelo"
            value={car.modelo}
          />
          <DetailItem
            icon="calendar-outline"
            label="Ano"
            value={car.ano.toString()}
          />
          <DetailItem
            icon="color-palette-outline"
            label="Cor"
            value={car.cor}
          />
        </View>

        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[styles.actionButton, styles.editButton]}
            onPress={handleEdit}
          >
            <Ionicons name="pencil" size={20} color="#fff" />
            <Text style={styles.actionButtonText}>Editar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
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
  );
}

interface DetailItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}

function DetailItem({ icon, label, value }: DetailItemProps) {
  return (
    <View style={styles.detailItem}>
      <View style={styles.detailIconContainer}>
        <Ionicons name={icon} size={24} color="#6c63ff" />
      </View>
      <View style={styles.detailTextContainer}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={styles.detailValue}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f23',
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
    backgroundColor: '#1a1a2e',
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
    backgroundColor: '#1a1a2e',
    borderRadius: 20,
    padding: 24,
    marginBottom: 32,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    borderWidth: 1,
    borderColor: '#2a2a40',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a40',
  },
  detailIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#16213e',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
    borderWidth: 2,
    borderColor: '#2a2a40',
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