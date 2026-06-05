import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Alert,
  Vibration, ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '../../src/store/authStore';
import { useThemeStore } from '../../src/store/themeStore';
import { alertsApi } from '../../src/services/mockApi';
import { Header } from '../../src/components/ui/Header';
import { Card } from '../../src/components/ui/Card';
import { BORDER_RADIUS, FONT_SIZE, SPACING, SHADOW } from '../../src/constants/theme';

export default function SOSScreen() {
  const { user } = useAuthStore();
  const { theme } = useThemeStore();
  const c = theme.colors;
  const insets = useSafeAreaInsets();
  const [sosSent, setSosSent] = useState(false);
  const [silentSent, setSilentSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSOS = async () => {
    Alert.alert(
      '🚨 EMERGENCY SOS',
      'This will immediately alert property owner, security, and emergency contacts. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'SEND SOS',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              Vibration.vibrate([0, 500, 200, 500, 200, 500]);
              await alertsApi.triggerSOS(user?.id || '', 'prop_001', false);
              setSosSent(true);
              Alert.alert(
                '✅ SOS Sent',
                'Emergency alert has been sent. Help is on the way!\n\nProperty security and your emergency contacts have been notified.',
                [{ text: 'OK' }]
              );
            } catch {
              Alert.alert('Error', 'Failed to send SOS. Call 100 directly.');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleSilentSOS = async () => {
    setLoading(true);
    try {
      Vibration.vibrate(200);
      await alertsApi.triggerSOS(user?.id || '', 'prop_001', true);
      setSilentSent(true);
      Alert.alert(
        'Silent SOS Sent',
        'Discreet alert sent to property security. No visible notification shown.',
        [{ text: 'OK' }]
      );
    } catch {
      Alert.alert('Error', 'Failed to send silent SOS.');
    } finally {
      setLoading(false);
    }
  };

  const emergencyNumbers = [
    { label: 'Police', number: '100', icon: 'shield', color: '#1565C0' },
    { label: 'Ambulance', number: '108', icon: 'medical', color: '#C62828' },
    { label: 'Women Helpline', number: '181', icon: 'person', color: '#6A1B9A' },
    { label: 'Fire', number: '101', icon: 'flame', color: '#E64A19' },
    { label: 'Child Helpline', number: '1098', icon: 'happy', color: '#00695C' },
    { label: 'Cyber Crime', number: '1930', icon: 'laptop', color: '#37474F' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <Header title="SOS & Safety" showBack />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* SOS Button */}
        <LinearGradient
          colors={['#b71c1c', '#d32f2f', '#f44336']}
          style={styles.sosSection}
        >
          <Text style={styles.sosTitle}>EMERGENCY SOS</Text>
          <Text style={styles.sosSubtitle}>
            Immediately alerts property security and your emergency contacts
          </Text>

          <TouchableOpacity
            style={[styles.sosButton, sosSent && styles.sosSent]}
            onPress={handleSOS}
            disabled={loading}
            accessibilityRole="button"
            accessibilityLabel="Send emergency SOS"
          >
            <View style={styles.sosInner}>
              <Ionicons name="alert-circle" size={60} color={sosSent ? '#4CAF50' : '#ffffff'} />
              <Text style={styles.sosButtonText}>{sosSent ? 'SOS SENT ✓' : 'HOLD FOR SOS'}</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.silentBtn}
            onPress={handleSilentSOS}
            disabled={loading}
            accessibilityLabel="Send silent SOS"
          >
            <Ionicons name="eye-off-outline" size={20} color="rgba(255,255,255,0.9)" />
            <Text style={styles.silentText}>
              {silentSent ? 'Silent SOS Sent ✓' : 'Send Silent SOS'}
            </Text>
          </TouchableOpacity>

          <Text style={styles.silentDesc}>
            Silent SOS alerts security without showing any visible notification on your device
          </Text>
        </LinearGradient>

        {/* Emergency Numbers */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: c.text }]}>Emergency Numbers</Text>
          <View style={styles.numbersGrid}>
            {emergencyNumbers.map(item => (
              <Card key={item.label} style={styles.numberCard} variant="flat">
                <View style={[styles.numberIcon, { backgroundColor: item.color + '20' }]}>
                  <Ionicons name={item.icon as any} size={24} color={item.color} />
                </View>
                <Text style={[styles.numberValue, { color: item.color }]}>{item.number}</Text>
                <Text style={[styles.numberLabel, { color: c.textMuted }]}>{item.label}</Text>
              </Card>
            ))}
          </View>
        </View>

        {/* Safety Tips */}
        <View style={[styles.section, { paddingTop: 0 }]}>
          <Card>
            <Text style={[styles.sectionTitle, { color: c.text }]}>Safety Tips</Text>
            {[
              'Always keep your room locked from inside',
              'Share your location with emergency contacts',
              'Know the nearest police station',
              'Keep your phone charged at night',
              'Report suspicious activities immediately',
            ].map((tip, i) => (
              <View key={i} style={styles.tipRow}>
                <View style={[styles.tipDot, { backgroundColor: c.primary }]} />
                <Text style={[styles.tipText, { color: c.textSecondary }]}>{tip}</Text>
              </View>
            ))}
          </Card>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  sosSection: {
    padding: SPACING.xl,
    alignItems: 'center',
  },
  sosTitle: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 3,
    marginBottom: SPACING.xs,
  },
  sosSubtitle: {
    fontSize: FONT_SIZE.sm,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  sosButton: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.6)',
    marginBottom: SPACING.lg,
    ...SHADOW.lg,
  },
  sosSent: {
    borderColor: '#4CAF50',
    backgroundColor: 'rgba(76,175,80,0.2)',
  },
  sosInner: {
    alignItems: 'center',
  },
  sosButtonText: {
    fontSize: FONT_SIZE.base,
    fontWeight: '800',
    color: '#ffffff',
    marginTop: SPACING.sm,
    letterSpacing: 1,
  },
  silentBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.full,
    marginBottom: SPACING.sm,
  },
  silentText: {
    color: '#ffffff',
    fontSize: FONT_SIZE.base,
    fontWeight: '600',
  },
  silentDesc: {
    fontSize: FONT_SIZE.xs,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
    paddingHorizontal: SPACING.lg,
  },
  section: {
    padding: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    marginBottom: SPACING.md,
  },
  numbersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  numberCard: {
    width: '30%',
    flex: 1,
    alignItems: 'center',
    padding: SPACING.md,
    minWidth: '30%',
  },
  numberIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xs,
  },
  numberValue: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '800',
  },
  numberLabel: {
    fontSize: FONT_SIZE.xs,
    textAlign: 'center',
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  tipDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 6,
  },
  tipText: {
    fontSize: FONT_SIZE.sm,
    flex: 1,
    lineHeight: 20,
  },
});
