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
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Carregando dados...</Text>
      </View>
    );
  }

  if (!car) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="alert-circle-outline" size={64} color="#f44336" />
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
        <Ionicons name={icon} size={24} color="#2196F3" />
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
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    marginTop: 16,
    fontSize: 18,
    color: '#f44336',
    textAlign: 'center',
  },
  imageContainer: {
    width: '100%',
    height: 250,
    backgroundColor: '#fff',
  },
  carImage: {
    width: '100%',
    height: '100%',
  },
  content: {
    padding: 20,
  },
  header: {
    marginBottom: 24,
  },
  carTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  carYear: {
    fontSize: 18,
    color: '#666',
    fontWeight: '500',
  },
  detailsContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  detailIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e3f2fd',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  detailTextContainer: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 8,
    gap: 8,
  },
  editButton: {
    backgroundColor: '#4CAF50',
  },
  deleteButton: {
    backgroundColor: '#f44336',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});