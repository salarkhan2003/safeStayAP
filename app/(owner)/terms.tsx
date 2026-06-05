import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { useThemeStore } from '../../src/store/themeStore';
import { Header } from '../../src/components/ui/Header';
import { Card } from '../../src/components/ui/Card';
import { BORDER_RADIUS, FONT_SIZE, SPACING } from '../../src/constants/theme';

export default function TermsScreen() {
  const { theme } = useThemeStore();
  const c = theme.colors;

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <Header title="Terms & Privacy Policy" showBack onBack={() => router.replace('/(owner)/settings')} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        <Card style={styles.card}>
          <Text style={[styles.title, { color: c.text }]}>1. Introduction</Text>
          <Text style={[styles.body, { color: c.textSecondary }]}>
            Welcome to SafeStay AP. This platform is designed to register and monitor paying guest (PG) accommodations, hostels, and similar stays under the safety directives of the Andhra Pradesh Police.
          </Text>
        </Card>

        <Card style={styles.card}>
          <Text style={[styles.title, { color: c.text }]}>2. Owner Responsibilities</Text>
          <Text style={[styles.body, { color: c.textSecondary }]}>
            As a registered property owner, you are legally obligated to:
            {'\n'}• Verify the identity (KYC) of all active tenants.
            {'\n'}• Report any safety incidents or compliance violations.
            {'\n'}• Maintain accurate staff registrations and room occupancy status.
          </Text>
        </Card>

        <Card style={styles.card}>
          <Text style={[styles.title, { color: c.text }]}>3. Data Privacy</Text>
          <Text style={[styles.body, { color: c.textSecondary }]}>
            All tenant and property owner information is securely stored. Data will only be shared with law enforcement agencies in compliance with safety audits or investigation procedures.
          </Text>
        </Card>

        <Card style={styles.card}>
          <Text style={[styles.title, { color: c.text }]}>4. Compliance & Termination</Text>
          <Text style={[styles.body, { color: c.textSecondary }]}>
            Failure to verify guests or reporting false details may result in removal from the SafeStay directory and further legal liabilities.
          </Text>
        </Card>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: SPACING.md, gap: SPACING.md },
  card: { gap: SPACING.xs },
  title: { fontSize: FONT_SIZE.base, fontWeight: '700' },
  body: { fontSize: FONT_SIZE.sm, lineHeight: 20 },
});
