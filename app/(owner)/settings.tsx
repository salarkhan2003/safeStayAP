import React from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Alert,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '../../src/store/authStore';
import { useThemeStore } from '../../src/store/themeStore';
import { useLangStore } from '../../src/store/langStore';
import { Card } from '../../src/components/ui/Card';
import { Badge } from '../../src/components/ui/Badge';
import { BORDER_RADIUS, FONT_SIZE, SPACING } from '../../src/constants/theme';

interface MenuItemProps {
  icon: string;
  label: string;
  subtitle?: string;
  onPress: () => void;
  iconColor?: string;
  danger?: boolean;
  rightElement?: React.ReactNode;
}

const MenuItem: React.FC<MenuItemProps> = ({ icon, label, subtitle, onPress, iconColor, danger, rightElement }) => {
  const { theme } = useThemeStore();
  const c = theme.colors;
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress} accessibilityRole="button">
      <View style={[styles.menuIcon, { backgroundColor: (iconColor || c.primary) + '15' }]}>
        <Ionicons name={icon as any} size={22} color={danger ? c.error : (iconColor || c.primary)} />
      </View>
      <View style={styles.menuContent}>
        <Text style={[styles.menuLabel, { color: danger ? c.error : c.text }]}>{label}</Text>
        {subtitle && <Text style={[styles.menuSubtitle, { color: c.textMuted }]}>{subtitle}</Text>}
      </View>
      {rightElement || <Ionicons name="chevron-forward" size={18} color={c.textMuted} />}
    </TouchableOpacity>
  );
};

export default function OwnerSettingsScreen() {
  const { user, logout, resetAll } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const { language, t } = useLangStore();
  const c = theme.colors;
  const insets = useSafeAreaInsets();

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  const handleResetApp = () => {
    Alert.alert(
      'Reset Entire App',
      'This will delete all saved data, log you out, and reset the application to its initial state. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset App',
          style: 'destructive',
          onPress: async () => {
            await resetAll();
            router.replace('/onboarding');
          },
        },
      ]
    );
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: c.background }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Profile Header */}
      <LinearGradient
        colors={['#0d47a1', '#1565c0']}
        style={[styles.header, { paddingTop: insets.top + SPACING.md }]}
      >
        <View style={styles.profileSection}>
          <View style={styles.avatar}>
            <Ionicons name="business" size={40} color="#ffffff" />
          </View>
          <Text style={styles.name}>{user?.name}</Text>
          <Text style={styles.phone}>{user?.phone}</Text>
          <View style={styles.badgeRow}>
            <Badge label={t('owner')} variant="info" size="sm" />
            {user?.isVerified && (
              <Badge label="Verified" variant="success" size="sm" />
            )}
          </View>
        </View>
      </LinearGradient>

      {/* Stats Row */}
      <View style={[styles.statsRow, { backgroundColor: c.surface }]}>
        {[
          { label: t('properties'), value: '4', icon: 'business' },
          { label: t('guest'), value: '12', icon: 'people' },
          { label: 'Reviews', value: '4.3⭐', icon: 'star' },
        ].map(stat => (
          <View key={stat.label} style={styles.statItem}>
            <Text style={[styles.statValue, { color: c.text }]}>{stat.value}</Text>
            <Text style={[styles.statLabel, { color: c.textMuted }]}>{stat.label}</Text>
          </View>
        ))}
      </View>

      <View style={{ padding: SPACING.md }}>
        <Card style={styles.section}>
          <Text style={[styles.sectionTitle, { color: c.textMuted }]}>Account</Text>
          <MenuItem icon="person-outline" label="Edit Profile" onPress={() => router.push('/(owner)/edit-profile')} />
          <MenuItem
            icon="shield-outline"
            label="KYC Verification"
            subtitle={`Status: ${user?.kycStatus}`}
            onPress={() => router.push('/(owner)/kyc')}
          />
          <MenuItem icon="document-text-outline" label="Business Documents" onPress={() => router.push('/(owner)/documents')} />
          <MenuItem icon="card-outline" label="Bank Account" subtitle="For payments" onPress={() => router.push('/(owner)/bank')} />
        </Card>

        <Card style={styles.section}>
          <Text style={[styles.sectionTitle, { color: c.textMuted }]}>Property Management</Text>
          <MenuItem icon="analytics-outline" label="Analytics" onPress={() => router.push('/(owner)/analytics')} />
          <MenuItem icon="people-outline" label="Staff Management" onPress={() => router.push('/(owner)/staff')} />
          <MenuItem icon="document-text-outline" label="Compliance Status" onPress={() => router.push('/(owner)/compliance')} />
          <MenuItem icon="notifications-outline" label="Alert Settings" onPress={() => router.push('/(owner)/alert-settings')} />
        </Card>

        <Card style={styles.section}>
          <Text style={[styles.sectionTitle, { color: c.textMuted }]}>Preferences</Text>
          <MenuItem
            icon={theme.isDark ? 'sunny-outline' : 'moon-outline'}
            label={theme.isDark ? 'Light Mode' : 'Dark Mode'}
            onPress={toggleTheme}
          />
          <MenuItem icon="language-outline" label={t('language')} subtitle={language === 'en' ? 'English' : language === 'te' ? 'తెలుగు' : 'हिन्दी'} onPress={() => router.push('/(owner)/language')} />
          <MenuItem icon="notifications-outline" label="Push Notifications" onPress={() => router.push('/(owner)/alert-settings')} />
        </Card>

        <Card style={styles.section}>
          <Text style={[styles.sectionTitle, { color: c.textMuted }]}>Support</Text>
          <MenuItem icon="help-circle-outline" label="Help Center" onPress={() => router.push('/(owner)/help')} />
          <MenuItem icon="chatbubble-outline" label="Contact Support" onPress={() => router.push('/(owner)/support')} />
          <MenuItem icon="document-text-outline" label="Terms & Privacy" onPress={() => router.push('/(owner)/terms')} />
          <MenuItem icon="information-circle-outline" label="About" subtitle="SafeStay AP v1.0.0" onPress={() => router.push('/(owner)/about')} />
        </Card>

        <Card style={{ marginBottom: SPACING.md }}>
          <MenuItem icon="log-out-outline" label={t('logout')} onPress={handleLogout} danger />
        </Card>

        <Card>
          <MenuItem icon="refresh-outline" label="Reset Entire App" onPress={handleResetApp} danger />
        </Card>

        <Text style={[styles.version, { color: c.textMuted }]}>
          SafeStay AP © 2024 · v1.0.0 · Property Owner Edition
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: SPACING.md, paddingBottom: SPACING.xl },
  profileSection: { alignItems: 'center', paddingVertical: SPACING.lg },
  avatar: {
    width: 88, height: 88, borderRadius: 44,
    backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center',
    borderWidth: 3, borderColor: 'rgba(255,255,255,0.4)', marginBottom: SPACING.md,
  },
  name: { fontSize: FONT_SIZE.xxl, fontWeight: '700', color: '#ffffff', marginBottom: 4 },
  phone: { fontSize: FONT_SIZE.md, color: 'rgba(255,255,255,0.8)', marginBottom: SPACING.md },
  badgeRow: { flexDirection: 'row', gap: SPACING.sm },
  statsRow: {
    flexDirection: 'row', padding: SPACING.md, marginTop: -SPACING.md, borderBottomWidth: 1, borderBottomColor: '#e0e0e0',
  },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: FONT_SIZE.xl, fontWeight: '700' },
  statLabel: { fontSize: FONT_SIZE.xs, marginTop: 2 },
  section: { marginBottom: SPACING.md },
  sectionTitle: {
    fontSize: FONT_SIZE.xs, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: SPACING.sm,
  },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: SPACING.md, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  menuIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginRight: SPACING.md },
  menuContent: { flex: 1 },
  menuLabel: { fontSize: FONT_SIZE.base, fontWeight: '500' },
  menuSubtitle: { fontSize: FONT_SIZE.xs, marginTop: 2 },
  version: { textAlign: 'center', fontSize: FONT_SIZE.xs, marginTop: SPACING.md, marginBottom: SPACING.xxl },
});
