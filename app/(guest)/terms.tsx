import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { useThemeStore } from '../../src/store/themeStore';
import { Header } from '../../src/components/ui/Header';
import { Card } from '../../src/components/ui/Card';
import { BORDER_RADIUS, FONT_SIZE, SPACING } from '../../src/constants/theme';

export default function GuestTermsScreen() {
  const { theme } = useThemeStore();
  const c = theme.colors;

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <Header title="Terms & Privacy Policy" showBack onBack={() => router.replace('/(guest)/profile')} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        <Card style={styles.card}>
          <Text style={[styles.title, { color: c.text }]}>1. Terms of Use</Text>
          <Text style={[styles.body, { color: c.textSecondary }]}>
            By booking a stay on SafeStay AP, you agree to comply with property guidelines, maintain decorum, and provide correct verification info.
          </Text>
        </Card>

        <Card style={styles.card}>
          <Text style={[styles.title, { color: c.text }]}>2. KYC Verification</Text>
          <Text style={[styles.body, { color: c.textSecondary }]}>
            Every tenant is required to submit a government-issued ID. Providing forged documents is a punishable offense under state regulations.
          </Text>
        </Card>

        <Card style={styles.card}>
          <Text style={[styles.title, { color: c.text }]}>3. Data Privacy</Text>
          <Text style={[styles.body, { color: c.textSecondary }]}>
            Your ID numbers and image uploads are securely encrypted and only accessible to verified owners and policing departments during safety audits.
          </Text>
        </Card>

        <Card style={styles.card}>
          <Text style={[styles.title, { color: c.text }]}>4. SOS Panic Alerts</Text>
          <Text style={[styles.body, { color: c.textSecondary }]}>
            Abusing the SOS feature for false alerts may lead to warning notices or suspension of your guest account.
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
