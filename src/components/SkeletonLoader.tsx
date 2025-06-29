import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../contexts/ThemeContext';

const { width } = Dimensions.get('window');

interface SkeletonLoaderProps {
  width?: number;
  height?: number;
  borderRadius?: number;
  style?: any;
}

function SkeletonItem({ width: itemWidth = 100, height = 20, borderRadius = 8, style }: SkeletonLoaderProps) {
  const { colors } = useTheme();
  const shimmerAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const shimmer = () => {
      shimmerAnimation.setValue(0);
      Animated.timing(shimmerAnimation, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: false,
      }).start(() => shimmer());
    };
    
    shimmer();
  }, []);

  const translateX = shimmerAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [-itemWidth, itemWidth],
  });

  return (
    <View style={[{ width: itemWidth, height, borderRadius, overflow: 'hidden' }, style]}>
      <LinearGradient
        colors={[colors.surfaceSecondary, colors.surface, colors.surfaceSecondary]}
        style={StyleSheet.absoluteFillObject}
        locations={[0, 0.5, 1]}
      />
      <Animated.View
        style={[
          StyleSheet.absoluteFillObject,
          {
            transform: [{ translateX }],
          },
        ]}
      >
        <LinearGradient
          colors={['transparent', `${colors.border}40`, 'transparent']}
          style={StyleSheet.absoluteFillObject}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        />
      </Animated.View>
    </View>
  );
}

export function CarCardSkeleton() {
  const { colors } = useTheme();
  
  return (
    <View style={styles.cardContainer}>
      <LinearGradient
        colors={[colors.cardBackground, colors.surfaceSecondary, colors.cardBackground]}
        style={[styles.container, { borderColor: colors.border }]}
        locations={[0, 0.5, 1]}
      >
        <View style={styles.cardContent}>
          {/* Image skeleton */}
          <SkeletonItem 
            width={96} 
            height={96} 
            borderRadius={20} 
            style={[styles.imageSkeleton, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}
          />
          
          {/* Content skeleton */}
          <View style={styles.contentSkeleton}>
            <View style={styles.headerSkeleton}>
              <SkeletonItem width={140} height={24} borderRadius={12} />
              <SkeletonItem width={60} height={20} borderRadius={10} />
            </View>
            
            <View style={styles.detailsSkeleton}>
              <SkeletonItem width={80} height={16} borderRadius={8} />
              <SkeletonItem width={70} height={16} borderRadius={8} />
            </View>
          </View>
          
          {/* Arrow skeleton */}
          <SkeletonItem width={32} height={32} borderRadius={16} />
        </View>
      </LinearGradient>
    </View>
  );
}

export function CarListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <CarCardSkeleton key={index} />
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    marginBottom: 20,
    width: width - 32,
  },
  container: {
    borderRadius: 24,
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    borderWidth: 1,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  imageSkeleton: {
    borderWidth: 1,
  },
  contentSkeleton: {
    flex: 1,
    marginLeft: 16,
    marginRight: 12,
  },
  headerSkeleton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  detailsSkeleton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});