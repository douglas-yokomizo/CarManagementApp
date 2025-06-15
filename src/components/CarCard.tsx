import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Dimensions,
  Animated,
  Alert,
} from 'react-native';
import { PanGestureHandler, State, GestureHandlerRootView } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';

import { Car } from '../types/Car';

interface CarCardProps {
  car: Car;
  onPress: () => void;
  onEdit?: (car: Car) => void;
  onDelete?: (car: Car) => void;
}

const { width } = Dimensions.get('window');
const cardWidth = width - 32;

export default function CarCard({ car, onPress, onEdit, onDelete }: CarCardProps) {
  const translateX = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;
  const scale = useRef(new Animated.Value(1)).current;
  const [swipeState, setSwipeState] = useState<'none' | 'left' | 'right'>('none');

  const REVEAL_THRESHOLD = 80; // Show action buttons
  const CONFIRM_THRESHOLD = 160; // Auto-confirm action

  const handleGestureEvent = Animated.event(
    [{ nativeEvent: { translationX: translateX } }],
    { 
      useNativeDriver: false,
      listener: (event: any) => {
        const { translationX } = event.nativeEvent;
        
        // Update swipe state for visual feedback
        if (translationX < -REVEAL_THRESHOLD) {
          setSwipeState('left');
        } else if (translationX > REVEAL_THRESHOLD) {
          setSwipeState('right');
        } else {
          setSwipeState('none');
        }
      }
    }
  );

  const handleStateChange = (event: any) => {
    if (event.nativeEvent.state === State.END) {
      const { translationX } = event.nativeEvent;
      
      if (translationX < -CONFIRM_THRESHOLD) {
        // Long swipe left - Auto-confirm edit
        handleEdit();
      } else if (translationX > CONFIRM_THRESHOLD) {
        // Long swipe right - Auto-confirm delete
        handleDelete();
      } else if (translationX < -REVEAL_THRESHOLD) {
        // Short swipe left - Show edit button
        showLeftAction();
      } else if (translationX > REVEAL_THRESHOLD) {
        // Short swipe right - Show delete button
        showRightAction();
      } else {
        // Small swipe - reset
        resetPosition();
      }
    }
  };

  const showLeftAction = () => {
    Animated.spring(translateX, {
      toValue: -REVEAL_THRESHOLD,
      useNativeDriver: false,
      tension: 100,
      friction: 8,
    }).start();
    setSwipeState('left');
  };

  const showRightAction = () => {
    Animated.spring(translateX, {
      toValue: REVEAL_THRESHOLD,
      useNativeDriver: false,
      tension: 100,
      friction: 8,
    }).start();
    setSwipeState('right');
  };

  const resetPosition = () => {
    Animated.spring(translateX, {
      toValue: 0,
      useNativeDriver: false,
      tension: 100,
      friction: 8,
    }).start();
    setSwipeState('none');
  };

  const handleEdit = () => {
    if (onEdit) {
      resetPosition();
      setTimeout(() => onEdit(car), 200);
    }
  };

  const handleEditButtonPress = () => {
    handleEdit();
  };

  const handleDeleteButtonPress = () => {
    handleDelete();
  };

  const handleDelete = () => {
    Alert.alert(
      'Confirmar Exclusão',
      `Tem certeza que deseja excluir o ${car.marca} ${car.modelo}?`,
      [
        { text: 'Cancelar', style: 'cancel', onPress: resetPosition },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => {
            if (onDelete) {
              // Animate out before deletion
              Animated.parallel([
                Animated.timing(opacity, {
                  toValue: 0,
                  duration: 300,
                  useNativeDriver: false,
                }),
                Animated.timing(scale, {
                  toValue: 0.8,
                  duration: 300,
                  useNativeDriver: false,
                }),
                Animated.timing(translateX, {
                  toValue: cardWidth,
                  duration: 300,
                  useNativeDriver: false,
                }),
              ]).start(() => {
                onDelete(car);
              });
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.cardWrapper}>
      {/* Left action button (Edit) */}
      <View 
        style={[
          styles.leftActionContainer, 
          { 
            opacity: swipeState === 'left' ? 1 : 0,
            pointerEvents: swipeState === 'left' ? 'auto' : 'none'
          }
        ]}
      >
        <TouchableOpacity 
          style={styles.editActionButton} 
          onPress={handleEditButtonPress}
          activeOpacity={0.8}
        >
          <Ionicons name="pencil" size={24} color="#fff" />
          <Text style={styles.actionButtonText}>Editar</Text>
        </TouchableOpacity>
      </View>

      {/* Right action button (Delete) */}
      <View 
        style={[
          styles.rightActionContainer, 
          { 
            opacity: swipeState === 'right' ? 1 : 0,
            pointerEvents: swipeState === 'right' ? 'auto' : 'none'
          }
        ]}
      >
        <TouchableOpacity 
          style={styles.deleteActionButton} 
          onPress={handleDeleteButtonPress}
          activeOpacity={0.8}
        >
          <Ionicons name="trash" size={24} color="#fff" />
          <Text style={styles.actionButtonText}>Excluir</Text>
        </TouchableOpacity>
      </View>

      {/* Main card */}
      <PanGestureHandler
        onGestureEvent={handleGestureEvent}
        onHandlerStateChange={handleStateChange}
        activeOffsetX={[-10, 10]}
      >
        <Animated.View
          style={[
            styles.container,
            {
              transform: [
                { translateX },
                { scale },
              ],
              opacity,
            },
          ]}
        >
          <TouchableOpacity 
            style={styles.cardContent} 
            onPress={swipeState === 'none' ? onPress : resetPosition} 
            activeOpacity={0.8}
          >
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
                  <Ionicons name="car-outline" size={16} color="#7070a0" />
                  <Text style={styles.detailText}>{car.placa}</Text>
                </View>
                <View style={styles.detailItem}>
                  <Ionicons name="color-palette-outline" size={16} color="#7070a0" />
                  <Text style={styles.detailText}>{car.cor}</Text>
                </View>
              </View>
            </View>
            
            <View style={styles.arrow}>
              <Ionicons name="chevron-forward" size={20} color="#6c63ff" />
            </View>
          </TouchableOpacity>
        </Animated.View>
      </PanGestureHandler>
    </View>
  );
}

const styles = StyleSheet.create({
  cardWrapper: {
    marginBottom: 20,
    width: cardWidth,
    height: 132,
    position: 'relative',
  },
  leftActionContainer: {
    position: 'absolute',
    left: 8,
    top: 0,
    bottom: 0,
    width: 80,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 5,
  },
  rightActionContainer: {
    position: 'absolute',
    right: 8,
    top: 0,
    bottom: 0,
    width: 80,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 5,
  },
  editActionButton: {
    backgroundColor: '#4ecdc4',
    width: 70,
    height: 70,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#4ecdc4',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  deleteActionButton: {
    backgroundColor: '#ff6b6b',
    width: 70,
    height: 70,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#ff6b6b',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
  },
  container: {
    backgroundColor: '#1a1a2e',
    borderRadius: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    width: cardWidth,
    borderWidth: 1,
    borderColor: '#2a2a40',
    zIndex: 4,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  imageContainer: {
    width: 92,
    height: 92,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#16213e',
    borderWidth: 2,
    borderColor: '#2a2a40',
  },
  carImage: {
    width: '100%',
    height: '100%',
  },
  content: {
    flex: 1,
    marginLeft: 16,
    marginRight: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 19,
    fontWeight: '700',
    color: '#ffffff',
    flex: 1,
    letterSpacing: 0.3,
  },
  year: {
    fontSize: 16,
    color: '#6c63ff',
    fontWeight: '700',
    backgroundColor: '#16213e',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    overflow: 'hidden',
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
    color: '#a0a0b5',
    marginLeft: 6,
    fontWeight: '500',
  },
  arrow: {
    paddingLeft: 12,
    backgroundColor: '#16213e',
    borderRadius: 12,
    padding: 8,
  },
});