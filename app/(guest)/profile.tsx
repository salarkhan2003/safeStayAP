import React from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Alert, Image,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '../../src/store/authStore';
import { useThemeStore } from '../../src/store/themeStore';
import { useLangStore } from '../../src/store/langStore';
import { Badge } from '../../src/components/ui/Badge';
import { Card } from '../../src/components/ui/Card';
import { BORDER_RADIUS, FONT_SIZE, SPACING } from '../../src/constants/theme';

interface MenuItemProps {
  icon: string;
  label: string;
  subtitle?: string;
  onPress: () => void;
  iconColor?: string;
  badge?: string;
  danger?: boolean;
}

const MenuItem: React.FC<MenuItemProps> = ({ icon, label, subtitle, onPress, iconColor, badge, danger }) => {
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
      {badge && <Badge label={badge} variant="warning" size="sm" style={{ marginRight: SPACING.sm }} />}
      <Ionicons name="chevron-forward" size={18} color={c.textMuted} />
    </TouchableOpacity>
  );
};

export default function GuestProfileScreen() {
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

  const kycBadgeConfig = {
    pending: { label: 'Pending', variant: 'warning' as const },
    submitted: { label: 'Submitted', variant: 'info' as const },
    verified: { label: 'Verified', variant: 'success' as const },
    rejected: { label: 'Rejected', variant: 'error' as const },
  };
  const kycBadge = kycBadgeConfig[user?.kycStatus || 'pending'];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: c.background }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Profile Header */}
      <LinearGradient
        colors={['#1a237e', '#3949ab']}
        style={[styles.header, { paddingTop: insets.top + SPACING.md }]}
      >
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={40} color="#ffffff" />
            </View>
            <View style={[styles.editBadge, { backgroundColor: c.accent }]}>
              <Ionicons name="pencil" size={12} color="#fff" />
            </View>
          </View>
          <Text style={styles.userName}>{user?.name}</Text>
          <Text style={styles.userPhone}>{user?.phone}</Text>
          <View style={styles.badgeRow}>
            <Badge label={kycBadge.label} variant={kycBadge.variant} size="sm" />
            {user?.isVerified && (
              <View style={styles.verifiedTag}>
                <Ionicons name="shield-checkmark" size={12} color="#4CAF50" />
                <Text style={styles.verifiedText}>Verified Guest</Text>
              </View>
            )}
          </View>
        </View>
      </LinearGradient>

      {/* Stats */}
      <View style={styles.statsRow}>
        {[
          { label: 'Bookings', value: '3', icon: 'calendar' },
          { label: 'Stays', value: '1', icon: 'bed' },
          { label: 'Incidents', value: '0', icon: 'warning' },
        ].map(stat => (
          <View key={stat.label} style={[styles.statCard, { backgroundColor: c.card }]}>
            <Ionicons name={stat.icon as any} size={24} color={c.primary} />
            <Text style={[styles.statValue, { color: c.text }]}>{stat.value}</Text>
            <Text style={[styles.statLabel, { color: c.textMuted }]}>{stat.label}</Text>
          </View>
        ))}
      </View>

      {/* Menu */}
      <View style={{ padding: SPACING.md }}>
        <Card style={styles.menuSection}>
          <Text style={[styles.sectionTitle, { color: c.textMuted }]}>Account</Text>
          <MenuItem icon="person-outline" label="Edit Profile" onPress={() => router.push('/(guest)/edit-profile')} />
          <MenuItem
            icon="shield-outline"
            label="KYC Verification"
            subtitle={`Status: ${user?.kycStatus}`}
            badge={user?.kycStatus === 'pending' ? 'Action Needed' : undefined}
            onPress={() => router.push('/(guest)/kyc')}
          />
          <MenuItem icon="people-outline" label="Emergency Contacts" onPress={() => router.push('/(guest)/emergency-contacts')} />
          <MenuItem icon="people-circle-outline" label="My Travelers" subtitle="Saved co-guests profiles" onPress={() => router.push('/(guest)/my-travelers')} />
          <MenuItem icon="mail-unread-outline" label="My Invitations" subtitle="Co-guest stay invites" onPress={() => router.push('/(guest)/my-invitations')} />
        </Card>

        <Card style={styles.menuSection}>
          <Text style={[styles.sectionTitle, { color: c.textMuted }]}>Safety</Text>
          <MenuItem icon="alert-circle-outline" label="SOS & Safety" iconColor="#D32F2F" onPress={() => router.push('/(guest)/sos')} />
          <MenuItem icon="warning-outline" label="Incident Reports" iconColor="#E65100" onPress={() => router.push('/(guest)/incidents')} />
        </Card>

        <Card style={styles.menuSection}>
          <Text style={[styles.sectionTitle, { color: c.textMuted }]}>Preferences</Text>
          <MenuItem
            icon={theme.isDark ? 'sunny-outline' : 'moon-outline'}
            label={theme.isDark ? 'Light Mode' : 'Dark Mode'}
            onPress={toggleTheme}
          />
          <MenuItem icon="notifications-outline" label="Notifications" onPress={() => router.push('/(guest)/notifications')} />
          <MenuItem icon="language-outline" label={t('language')} subtitle={language === 'en' ? 'English' : language === 'te' ? 'తెలుగు' : 'हिन्दी'} onPress={() => router.push('/(guest)/language')} />
        </Card>

        <Card style={styles.menuSection}>
          <Text style={[styles.sectionTitle, { color: c.textMuted }]}>App</Text>
          <MenuItem icon="help-circle-outline" label="Help & Support" onPress={() => router.push('/(guest)/help')} />
          <MenuItem icon="document-text-outline" label="Terms & Privacy" onPress={() => router.push('/(guest)/terms')} />
          <MenuItem icon="information-circle-outline" label="About" subtitle="SafeStay AP v1.0.0" onPress={() => router.push('/(guest)/about')} />
        </Card>

        <Card style={{ marginBottom: SPACING.md }}>
          <MenuItem
            icon="log-out-outline"
            label={t('logout')}
            onPress={handleLogout}
            danger
          />
        </Card>

        <Card>
          <MenuItem
            icon="refresh-outline"
            label="Reset Entire App"
            onPress={handleResetApp}
            danger
          />
        </Card>

        <Text style={[styles.version, { color: c.textMuted }]}>
          SafeStay AP © 2024 · v1.0.0
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: SPACING.lg,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: SPACING.md,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  userName: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  userPhone: {
    fontSize: FONT_SIZE.md,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: SPACING.md,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    alignItems: 'center',
  },
  verifiedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(76,175,80,0.2)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderRadius: BORDER_RADIUS.full,
  },
  verifiedText: {
    color: '#4CAF50',
    fontSize: FONT_SIZE.xs,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    padding: SPACING.md,
    gap: SPACING.sm,
    marginTop: -SPACING.lg,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    gap: 4,
  },
  statValue: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: FONT_SIZE.xs,
  },
  menuSection: {
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: SPACING.sm,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  menuContent: {
    flex: 1,
  },
  menuLabel: {
    fontSize: FONT_SIZE.base,
    fontWeight: '500',
  },
  menuSubtitle: {
    fontSize: FONT_SIZE.xs,
    marginTop: 2,
  },
  version: {
    textAlign: 'center',
    fontSize: FONT_SIZE.xs,
    marginTop: SPACING.md,
    marginBottom: SPACING.xxl,
  },
});
