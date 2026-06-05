import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Header } from './Header';
import { useThemeStore } from '../../store/themeStore';
import { FONT_SIZE } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';

export const ComingSoon: React.FC<{ title: string }> = ({ title }) => {
  const { theme } = useThemeStore();
  const c = theme.colors;

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <Header title={title} showBack />
      <View style={styles.content}>
        <Ionicons name="construct-outline" size={64} color={c.textMuted} />
        <Text style={[styles.title, { color: c.text }]}>Coming Soon</Text>
        <Text style={[styles.subtitle, { color: c.textMuted }]}>
          We are working hard to bring this feature to you!
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: FONT_SIZE.md,
    textAlign: 'center',
  },
});
