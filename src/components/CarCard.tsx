import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Car } from '../types/Car';

interface CarCardProps {
  car: Car;
  onPress: () => void;
}

const { width } = Dimensions.get('window');
const cardWidth = width - 32;

export default function CarCard({ car, onPress }: CarCardProps) {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: car.imagem }}
          style={styles.carImage}
          resizeMode="cover"
          onError={(error) => {
            console.log('Image load error:', error);
          }}
        />
      </View>
      
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title} numberOfLines={1}>
            {car.marca} {car.modelo}
          </Text>
          <Text style={styles.year}>{car.ano}</Text>
        </View>
        
        <View style={styles.details}>
          <View style={styles.detailItem}>
            <Ionicons name="car-outline" size={16} color="#666" />
            <Text style={styles.detailText}>{car.placa}</Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="color-palette-outline" size={16} color="#666" />
            <Text style={styles.detailText}>{car.cor}</Text>
          </View>
        </View>
      </View>
      
      <View style={styles.arrow}>
        <Ionicons name="chevron-forward" size={20} color="#ccc" />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    width: cardWidth,
  },
  imageContainer: {
    width: 80,
    height: 80,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
  },
  carImage: {
    width: '100%',
    height: '100%',
  },
  content: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  year: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  details: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  arrow: {
    paddingLeft: 8,
  },
});