import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  StatusBar, Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useThemeStore } from '../../store/themeStore';
import { FONT_SIZE, SPACING } from '../../constants/theme';

interface HeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  rightAction?: React.ReactNode;
  transparent?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  showBack = false,
  onBack,
  rightAction,
  transparent = false,
}) => {
  const { theme } = useThemeStore();
  const c = theme.colors;
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top + SPACING.sm,
          backgroundColor: transparent ? 'transparent' : c.surface,
          borderBottomColor: transparent ? 'transparent' : c.border,
          borderBottomWidth: transparent ? 0 : 1,
        },
      ]}
    >
      <StatusBar
        barStyle={theme.isDark ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />
      <View style={styles.content}>
        {showBack && (
          <TouchableOpacity
            onPress={onBack || (() => router.back())}
            style={styles.backButton}
            accessibilityLabel="Go back"
            accessibilityRole="button"
          >
            <Ionicons name="arrow-back" size={24} color={c.text} />
          </TouchableOpacity>
        )}
        <View style={styles.titleContainer}>
          <Text style={[styles.title, { color: c.text }]} numberOfLines={1}>
            {title}
          </Text>
          {subtitle && (
            <Text style={[styles.subtitle, { color: c.textMuted }]} numberOfLines={1}>
              {subtitle}
            </Text>
          )}
        </View>
        {rightAction && <View style={styles.rightAction}>{rightAction}</View>}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: SPACING.sm,
    paddingHorizontal: SPACING.md,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 44,
  },
  backButton: {
    padding: SPACING.xs,
    marginRight: SPACING.sm,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: FONT_SIZE.sm,
    marginTop: 2,
  },
  rightAction: {
    marginLeft: SPACING.sm,
  },
});
