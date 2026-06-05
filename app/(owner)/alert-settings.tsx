import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch } from 'react-native';
import { router } from 'expo-router';
import { useThemeStore } from '../../src/store/themeStore';
import { Header } from '../../src/components/ui/Header';
import { Card } from '../../src/components/ui/Card';
import { BORDER_RADIUS, FONT_SIZE, SPACING } from '../../src/constants/theme';

export default function AlertSettingsScreen() {
  const { theme } = useThemeStore();
  const c = theme.colors;

  const [settings, setSettings] = useState({
    bookingAlerts: true,
    sosAlerts: true,
    complianceAlerts: true,
    emailReports: false,
    pushNotification: true,
  });

  const toggle = (key: keyof typeof settings) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <Header title="Alert & Notifications" showBack onBack={() => router.replace('/(owner)/settings')} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        <Card style={styles.section}>
          <Text style={[styles.sectionTitle, { color: c.textMuted }]}>Incident & SOS Alerts</Text>
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.label, { color: c.text }]}>Emergency SOS Alerts</Text>
              <Text style={[styles.sub, { color: c.textMuted }]}>Receive loud notifications for tenant SOS alarms</Text>
            </View>
            <Switch value={settings.sosAlerts} onValueChange={() => toggle('sosAlerts')} trackColor={{ true: c.primary }} />
          </View>

          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.label, { color: c.text }]}>Compliance Alerts</Text>
              <Text style={[styles.sub, { color: c.textMuted }]}>Get notified about pending document checks or renewals</Text>
            </View>
            <Switch value={settings.complianceAlerts} onValueChange={() => toggle('complianceAlerts')} trackColor={{ true: c.primary }} />
          </View>
        </Card>

        <Card style={styles.section}>
          <Text style={[styles.sectionTitle, { color: c.textMuted }]}>Booking & Operations</Text>
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.label, { color: c.text }]}>New Booking Requests</Text>
              <Text style={[styles.sub, { color: c.textMuted }]}>Notify when guests request check-in or booking cancel</Text>
            </View>
            <Switch value={settings.bookingAlerts} onValueChange={() => toggle('bookingAlerts')} trackColor={{ true: c.primary }} />
          </View>
        </Card>

        <Card style={styles.section}>
          <Text style={[styles.sectionTitle, { color: c.textMuted }]}>Channels</Text>
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.label, { color: c.text }]}>Push Notifications</Text>
              <Text style={[styles.sub, { color: c.textMuted }]}>Show notification banners on your phone</Text>
            </View>
            <Switch value={settings.pushNotification} onValueChange={() => toggle('pushNotification')} trackColor={{ true: c.primary }} />
          </View>

          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.label, { color: c.text }]}>Email Reports</Text>
              <Text style={[styles.sub, { color: c.textMuted }]}>Receive monthly compliance and booking audit PDFs</Text>
            </View>
            <Switch value={settings.emailReports} onValueChange={() => toggle('emailReports')} trackColor={{ true: c.primary }} />
          </View>
        </Card>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: SPACING.md, gap: SPACING.md },
  section: { gap: SPACING.md },
  sectionTitle: { fontSize: FONT_SIZE.xs, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: '#f0f0f0', paddingBottom: SPACING.sm },
  label: { fontSize: FONT_SIZE.base, fontWeight: '600' },
  sub: { fontSize: FONT_SIZE.xs, marginTop: 2, paddingRight: SPACING.lg },
});
