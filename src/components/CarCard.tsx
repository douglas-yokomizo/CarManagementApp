import React, { useRef, useState, useEffect } from 'react';
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
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

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
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.9)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;
  const [swipeState, setSwipeState] = useState<'none' | 'left' | 'right'>('none');
  const [hasTriggeredThreshold, setHasTriggeredThreshold] = useState<'none' | 'reveal' | 'confirm'>('none');

  useEffect(() => {
    // Entrance animation
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: false,
      }),
      Animated.spring(scale, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: false,
      }),
    ]).start();
  }, []);

  const REVEAL_THRESHOLD = 80; // Show action buttons
  const CONFIRM_THRESHOLD = 160; // Auto-confirm action

  const handleGestureEvent = Animated.event(
    [{ nativeEvent: { translationX: translateX } }],
    { 
      useNativeDriver: false,
      listener: (event: any) => {
        const { translationX } = event.nativeEvent;
        const absTranslation = Math.abs(translationX);
        
        // Haptic feedback on thresholds
        if (absTranslation >= REVEAL_THRESHOLD && hasTriggeredThreshold === 'none') {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          setHasTriggeredThreshold('reveal');
        } else if (absTranslation >= CONFIRM_THRESHOLD && hasTriggeredThreshold === 'reveal') {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          setHasTriggeredThreshold('confirm');
        } else if (absTranslation < REVEAL_THRESHOLD && hasTriggeredThreshold !== 'none') {
          setHasTriggeredThreshold('none');
        }
        
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
      
      // Reset threshold state
      setHasTriggeredThreshold('none');
      
      if (translationX < -CONFIRM_THRESHOLD) {
        // Long swipe left - Auto-confirm edit
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        handleEdit();
      } else if (translationX > CONFIRM_THRESHOLD) {
        // Long swipe right - Auto-confirm delete
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
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
    // Bounce animation + haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Animated.sequence([
      Animated.spring(buttonScale, {
        toValue: 0.9,
        useNativeDriver: false,
        tension: 300,
        friction: 10,
      }),
      Animated.spring(buttonScale, {
        toValue: 1,
        useNativeDriver: false,
        tension: 300,
        friction: 10,
      }),
    ]).start();
    handleEdit();
  };

  const handleDeleteButtonPress = () => {
    // Bounce animation + haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Animated.sequence([
      Animated.spring(buttonScale, {
        toValue: 0.9,
        useNativeDriver: false,
        tension: 300,
        friction: 10,
      }),
      Animated.spring(buttonScale, {
        toValue: 1,
        useNativeDriver: false,
        tension: 300,
        friction: 10,
      }),
    ]).start();
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
        <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
          <TouchableOpacity 
            style={styles.editActionButton} 
            onPress={handleEditButtonPress}
            activeOpacity={0.8}
          >
            <Ionicons name="pencil" size={24} color="#fff" />
            <Text style={styles.actionButtonText}>Editar</Text>
          </TouchableOpacity>
        </Animated.View>
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
        <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
          <TouchableOpacity 
            style={styles.deleteActionButton} 
            onPress={handleDeleteButtonPress}
            activeOpacity={0.8}
          >
            <Ionicons name="trash" size={24} color="#fff" />
            <Text style={styles.actionButtonText}>Excluir</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>

      {/* Main card */}
      <PanGestureHandler
        onGestureEvent={handleGestureEvent}
        onHandlerStateChange={handleStateChange}
        activeOffsetX={[-10, 10]}
      >
        <Animated.View
          style={[
            {
              transform: [
                { translateX },
                { scale },
              ],
              opacity,
            },
          ]}
        >
          <LinearGradient
            colors={['rgba(26, 26, 46, 0.95)', 'rgba(22, 33, 62, 0.8)', 'rgba(26, 26, 46, 0.9)']}
            style={styles.container}
            locations={[0, 0.5, 1]}
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
              <View style={styles.mainInfo}>
                <Text style={styles.brand}>{car.marca}</Text>
                <Text style={styles.model} numberOfLines={1}>
                  {car.modelo}
                </Text>
                <Text style={styles.year}>{car.ano}</Text>
              </View>
              
              <View style={styles.detailsGrid}>
                <View style={styles.detailItem}>
                  <View style={styles.iconContainer}>
                    <Ionicons name="car-sport" size={14} color="#6c63ff" />
                  </View>
                  <View style={styles.detailContent}>
                    <Text style={styles.detailLabel}>Placa</Text>
                    <Text style={styles.detailValue}>{car.placa}</Text>
                  </View>
                </View>
              </View>
            </View>
            
            <View style={styles.arrow}>
              <Ionicons name="chevron-forward" size={20} color="#6c63ff" />
            </View>
          </TouchableOpacity>
          </LinearGradient>
        </Animated.View>
      </PanGestureHandler>
    </View>
  );
}

const styles = StyleSheet.create({
  cardWrapper: {
    marginBottom: 20,
    width: cardWidth,
    height: 140,
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
    borderRadius: 24,
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    width: cardWidth,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    zIndex: 4,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  imageContainer: {
    width: 96,
    height: 96,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: 'rgba(22, 33, 62, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  carImage: {
    width: '100%',
    height: '100%',
  },
  content: {
    flex: 1,
    marginLeft: 16,
    marginRight: 8,
    justifyContent: 'space-between',
  },
  mainInfo: {
    marginBottom: 12,
  },
  brand: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8a8aa6',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 2,
  },
  model: {
    fontSize: 18,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 0.3,
    marginBottom: 4,
  },
  year: {
    fontSize: 13,
    color: '#6c63ff',
    fontWeight: '700',
    backgroundColor: 'rgba(108, 99, 255, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    alignSelf: 'flex-start',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(108, 99, 255, 0.25)',
  },
  detailsGrid: {
    flex: 1,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 24,
    height: 24,
    backgroundColor: 'rgba(108, 99, 255, 0.1)',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'rgba(108, 99, 255, 0.2)',
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#7a7a94',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 1,
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 0.2,
  },
  arrow: {
    paddingLeft: 12,
    backgroundColor: 'rgba(108, 99, 255, 0.1)',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(108, 99, 255, 0.2)',
  },
});