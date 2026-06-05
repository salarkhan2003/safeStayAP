import React, { useEffect, useRef } from 'react';
import { Animated, View, StyleSheet, ViewStyle } from 'react-native';
import { useThemeStore } from '../../store/themeStore';
import { BORDER_RADIUS } from '../../constants/theme';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 20,
  borderRadius = BORDER_RADIUS.sm,
  style,
}) => {
  const { theme } = useThemeStore();
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.8, duration: 800, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 800, useNativeDriver: true }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        {
          width: width as any,
          height,
          borderRadius,
          backgroundColor: theme.isDark ? '#2a2a4a' : '#e0e0e0',
          opacity,
        },
        style,
      ]}
    />
  );
};

export const PropertyCardSkeleton: React.FC = () => {
  const { theme } = useThemeStore();
  return (
    <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
      <Skeleton height={180} borderRadius={12} style={{ marginBottom: 12 }} />
      <Skeleton height={20} width="70%" style={{ marginBottom: 8 }} />
      <Skeleton height={14} width="50%" style={{ marginBottom: 8 }} />
      <View style={styles.row}>
        <Skeleton height={14} width="30%" />
        <Skeleton height={14} width="25%" />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 12,
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
});
