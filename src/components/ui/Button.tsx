import React from 'react';
import {
  TouchableOpacity, Text, ActivityIndicator, StyleSheet,
  ViewStyle, TextStyle, TouchableOpacityProps,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeStore } from '../../store/themeStore';
import { BORDER_RADIUS, FONT_SIZE, SPACING } from '../../constants/theme';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  variant = 'primary',
  size = 'md',
  loading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  style,
  textStyle,
  disabled,
  ...rest
}) => {
  const { theme } = useThemeStore();
  const c = theme.colors;

  const sizeStyles = {
    sm: { paddingVertical: SPACING.xs, paddingHorizontal: SPACING.md, borderRadius: BORDER_RADIUS.sm },
    md: { paddingVertical: SPACING.sm + 4, paddingHorizontal: SPACING.lg, borderRadius: BORDER_RADIUS.md },
    lg: { paddingVertical: SPACING.md, paddingHorizontal: SPACING.xl, borderRadius: BORDER_RADIUS.lg },
  };

  const textSizes = {
    sm: FONT_SIZE.sm,
    md: FONT_SIZE.md,
    lg: FONT_SIZE.lg,
  };

  const isDisabled = disabled || loading;

  if (variant === 'primary') {
    return (
      <LinearGradient
        colors={[c.primary, c.primaryLight]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[
          styles.base,
          sizeStyles[size],
          fullWidth && styles.fullWidth,
          isDisabled && styles.disabled,
          style as ViewStyle,
        ]}
      >
        <TouchableOpacity
          style={styles.inner}
          disabled={isDisabled}
          accessibilityRole="button"
          accessibilityLabel={title}
          {...rest}
        >
          {loading ? (
            <ActivityIndicator color={c.white} size="small" />
          ) : (
            <>
              {leftIcon}
              <Text style={[styles.text, { color: c.white, fontSize: textSizes[size] }, textStyle]}>
                {title}
              </Text>
              {rightIcon}
            </>
          )}
        </TouchableOpacity>
      </LinearGradient>
    );
  }

  const variantStyles: Record<string, ViewStyle> = {
    secondary: { backgroundColor: c.secondary },
    outline: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: c.primary },
    ghost: { backgroundColor: 'transparent' },
    danger: { backgroundColor: c.error },
  };

  const variantTextColors: Record<string, string> = {
    secondary: c.white,
    outline: c.primary,
    ghost: c.primary,
    danger: c.white,
  };

  return (
    <TouchableOpacity
      style={[
        styles.base,
        sizeStyles[size],
        variantStyles[variant],
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
        style,
      ]}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel={title}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={variantTextColors[variant]} size="small" />
      ) : (
        <>
          {leftIcon}
          <Text
            style={[
              styles.text,
              { color: variantTextColors[variant], fontSize: textSizes[size] },
              textStyle,
            ]}
          >
            {title}
          </Text>
          {rightIcon}
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    gap: SPACING.xs,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    width: '100%',
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
});
