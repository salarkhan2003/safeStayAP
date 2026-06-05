import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { useThemeStore } from '../../store/themeStore';
import { BORDER_RADIUS, SHADOW, SPACING } from '../../constants/theme';

interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  variant?: 'default' | 'elevated' | 'glass' | 'flat';
  padding?: number;
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  variant = 'default',
  padding = SPACING.md,
}) => {
  const { theme } = useThemeStore();
  const c = theme.colors;

  const variantStyles: Record<string, ViewStyle> = {
    default: {
      backgroundColor: c.card,
      ...SHADOW.sm,
    },
    elevated: {
      backgroundColor: c.card,
      ...SHADOW.md,
    },
    glass: {
      backgroundColor: theme.isDark
        ? 'rgba(255,255,255,0.05)'
        : 'rgba(255,255,255,0.85)',
      borderWidth: 1,
      borderColor: theme.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.6)',
      ...SHADOW.sm,
    },
    flat: {
      backgroundColor: c.surface,
      borderWidth: 1,
      borderColor: c.border,
    },
  };

  return (
    <View
      style={[
        styles.base,
        { padding, borderRadius: BORDER_RADIUS.lg },
        variantStyles[variant],
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    overflow: 'hidden',
  },
});
