import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore } from '../../src/store/themeStore';
import { Header } from '../../src/components/ui/Header';
import { Card } from '../../src/components/ui/Card';
import { BORDER_RADIUS, FONT_SIZE, SPACING } from '../../src/constants/theme';

export default function GuestAboutScreen() {
  const { theme } = useThemeStore();
  const c = theme.colors;

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <Header title="About SafeStay AP" showBack onBack={() => router.replace('/(guest)/profile')} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.headerSection}>
          <View style={[styles.logoContainer, { backgroundColor: c.primary }]}>
            <Ionicons name="shield-checkmark" size={60} color="#fff" />
          </View>
          <Text style={[styles.appName, { color: c.text }]}>SafeStay AP</Text>
          <Text style={[styles.appVersion, { color: c.textMuted }]}>Version 1.0.0 (Production)</Text>
        </View>

        <Card style={styles.card}>
          <Text style={[styles.title, { color: c.text }]}>Our Mission</Text>
          <Text style={[styles.body, { color: c.textSecondary }]}>
            SafeStay AP is a unified initiative in collaboration with the Andhra Pradesh Police Department to secure paying guest (PG) accommodations, hostels, and rental stays. Our goal is to ensure a safe, crime-free environment for students, working professionals, and property owners alike.
          </Text>
        </Card>

        <Card style={styles.card}>
          <Text style={[styles.title, { color: c.text }]}>Key Highlights</Text>
          <View style={styles.bulletRow}>
            <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
            <Text style={[styles.bulletText, { color: c.textSecondary }]}>Instant AP Police KYC check validation</Text>
          </View>
          <View style={styles.bulletRow}>
            <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
            <Text style={[styles.bulletText, { color: c.textSecondary }]}>Direct SOS panic reporting to nearby stations</Text>
          </View>
          <View style={styles.bulletRow}>
            <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
            <Text style={[styles.bulletText, { color: c.textSecondary }]}>Real-time compliance monitoring</Text>
          </View>
        </Card>

        <Text style={[styles.footerText, { color: c.textMuted }]}>
          Developed under the guidance of Smt. K.G.V. Saritha, IPS (DCP Administration, Vijayawada).
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: SPACING.md, gap: SPACING.md, alignItems: 'center' },
  headerSection: { alignItems: 'center', marginVertical: SPACING.lg },
  logoContainer: { width: 100, height: 100, borderRadius: 50, justifyContent: 'center', alignItems: 'center', elevation: 4 },
  appName: { fontSize: FONT_SIZE.xxl, fontWeight: '800', marginTop: SPACING.sm },
  appVersion: { fontSize: FONT_SIZE.sm },
  card: { width: '100%', gap: SPACING.sm },
  title: { fontSize: FONT_SIZE.lg, fontWeight: '700' },
  body: { fontSize: FONT_SIZE.base, lineHeight: 22 },
  bulletRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  bulletText: { fontSize: FONT_SIZE.base },
  footerText: { fontSize: FONT_SIZE.xs, textAlign: 'center', marginTop: SPACING.lg, lineHeight: 18 },
});
