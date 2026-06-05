import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { useThemeStore } from '../../store/themeStore';
import { BORDER_RADIUS, FONT_SIZE, SPACING } from '../../constants/theme';

type BadgeVariant = 'success' | 'error' | 'warning' | 'info' | 'primary' | 'secondary';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  style?: ViewStyle;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'primary',
  size = 'md',
  style,
}) => {
  const { theme } = useThemeStore();
  const c = theme.colors;

  const colorMap: Record<BadgeVariant, { bg: string; text: string }> = {
    success: { bg: c.success + '20', text: c.success },
    error: { bg: c.error + '20', text: c.error },
    warning: { bg: c.warning + '20', text: c.warning },
    info: { bg: c.info + '20', text: c.info },
    primary: { bg: c.primary + '20', text: c.primary },
    secondary: { bg: c.secondary + '20', text: c.secondary },
  };

  const colors = colorMap[variant];

  return (
    <View
      style={[
        styles.base,
        {
          backgroundColor: colors.bg,
          borderRadius: BORDER_RADIUS.full,
          paddingHorizontal: size === 'sm' ? SPACING.sm : SPACING.md,
          paddingVertical: size === 'sm' ? 2 : SPACING.xs,
        },
        style,
      ]}
    >
      <Text
        style={[
          styles.text,
          {
            color: colors.text,
            fontSize: size === 'sm' ? FONT_SIZE.xs : FONT_SIZE.sm,
          },
        ]}
      >
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    alignSelf: 'flex-start',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: '600',
  },
});
