import React from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, RefreshControl, Image,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../../src/store/authStore';
import { useThemeStore } from '../../src/store/themeStore';
import { propertiesApi, bookingsApi, notificationsApi } from '../../src/services/mockApi';
import { PropertyCard } from '../../src/components/property/PropertyCard';
import { PropertyCardSkeleton } from '../../src/components/ui/SkeletonLoader';
import { Badge } from '../../src/components/ui/Badge';
import { BORDER_RADIUS, FONT_SIZE, SPACING, SHADOW } from '../../src/constants/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function GuestHomeScreen() {
  const { user } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const c = theme.colors;
  const insets = useSafeAreaInsets();

  const { data: properties, isLoading: propertiesLoading, refetch } = useQuery({
    queryKey: ['properties'],
    queryFn: () => propertiesApi.getAll(),
  });

  const { data: bookings } = useQuery({
    queryKey: ['bookings', user?.id],
    queryFn: () => bookingsApi.getByGuest(user?.id || ''),
    enabled: !!user?.id,
  });

  const { data: notifications } = useQuery({
    queryKey: ['notifications', user?.id],
    queryFn: () => notificationsApi.getByUser(user?.id || ''),
    enabled: !!user?.id,
  });

  const activeBooking = bookings?.find(b => b.status === 'checked_in' || b.status === 'confirmed');
  const unreadCount = notifications?.filter(n => !n.isRead).length || 0;

  const quickActions = [
    { icon: 'search-outline', label: 'Find Stay', color: c.primary, onPress: () => router.push('/(guest)/search') },
    { icon: 'qr-code-outline', label: 'QR Check-in', color: '#00897B', onPress: () => router.push('/(guest)/guest-pass') },
    { icon: 'alert-circle-outline', label: 'SOS', color: '#D32F2F', onPress: () => router.push('/(guest)/sos') },
    { icon: 'document-text-outline', label: 'KYC', color: '#F57C00', onPress: () => router.push('/(guest)/kyc') },
    { icon: 'people-outline', label: 'Contacts', color: '#7B1FA2', onPress: () => router.push('/(guest)/emergency-contacts') },
    { icon: 'warning-outline', label: 'Incidents', color: '#E65100', onPress: () => router.push('/(guest)/incidents') },
  ];

  const kycStatusBadge = {
    pending: { label: 'KYC Pending', variant: 'warning' as const },
    submitted: { label: 'KYC Under Review', variant: 'info' as const },
    verified: { label: 'KYC Verified', variant: 'success' as const },
    rejected: { label: 'KYC Rejected', variant: 'error' as const },
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: c.background }]}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={false} onRefresh={refetch} />}
    >
      {/* Header */}
      <LinearGradient
        colors={['#1a237e', '#3949ab', '#1565c0']}
        style={[styles.headerGradient, { paddingTop: insets.top + SPACING.md }]}
      >
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.greeting}>
              {new Date().getHours() < 12 ? 'Good Morning' : new Date().getHours() < 17 ? 'Good Afternoon' : 'Good Evening'} 👋
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={styles.userName}>{user?.name || 'Guest'}</Text>
              {user?.isVerified && (
                <Ionicons name="checkmark-circle" size={18} color="#2196F3" />
              )}
            </View>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.iconBtn}
              onPress={toggleTheme}
              accessibilityLabel="Toggle theme"
            >
              <Ionicons name={theme.isDark ? 'sunny' : 'moon'} size={22} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.iconBtn}
              onPress={() => router.push('/(guest)/notifications')}
              accessibilityLabel="Notifications"
            >
              <Ionicons name="notifications" size={22} color="#fff" />
              {unreadCount > 0 && (
                <View style={styles.notifBadge}>
                  <Text style={styles.notifCount}>{unreadCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* KYC Status */}
        {user?.kycStatus && (
          <View style={styles.kycRow}>
            <Badge
              label={kycStatusBadge[user.kycStatus]?.label || 'KYC Pending'}
              variant={kycStatusBadge[user.kycStatus]?.variant || 'warning'}
              size="sm"
            />
          </View>
        )}

        {/* Active Booking Banner */}
        {activeBooking && (
          <TouchableOpacity
            style={styles.activeBanner}
            onPress={() => router.push('/(guest)/stay')}
          >
            <View style={styles.activeBannerContent}>
              <Ionicons name="bed" size={20} color="#ffffff" />
              <View style={{ flex: 1 }}>
                <Text style={styles.activeBannerTitle}>{activeBooking.propertyName}</Text>
                <Text style={styles.activeBannerSub}>Room {activeBooking.roomNumber} · Active Stay</Text>
              </View>
              <Ionicons name="arrow-forward" size={18} color="rgba(255,255,255,0.8)" />
            </View>
          </TouchableOpacity>
        )}
      </LinearGradient>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: c.text }]}>Quick Actions</Text>
        <View style={styles.quickGrid}>
          {quickActions.map(action => (
            <TouchableOpacity
              key={action.label}
              style={[styles.quickAction, { backgroundColor: c.card, ...SHADOW.sm }]}
              onPress={action.onPress}
              accessibilityRole="button"
              accessibilityLabel={action.label}
            >
              <View style={[styles.quickIcon, { backgroundColor: action.color + '20' }]}>
                <Ionicons name={action.icon as any} size={24} color={action.color} />
              </View>
              <Text style={[styles.quickLabel, { color: c.textSecondary }]}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Featured Properties */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: c.text }]}>Verified Properties</Text>
          <TouchableOpacity onPress={() => router.push('/(guest)/search')}>
            <Text style={[styles.seeAll, { color: c.primary }]}>See All</Text>
          </TouchableOpacity>
        </View>

        {propertiesLoading ? (
          <>
            <PropertyCardSkeleton />
            <PropertyCardSkeleton />
          </>
        ) : (
          properties?.slice(0, 5).map(property => (
            <PropertyCard key={property.id} property={property} />
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerGradient: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  greeting: {
    fontSize: FONT_SIZE.sm,
    color: 'rgba(255,255,255,0.8)',
  },
  userName: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: '700',
    color: '#ffffff',
  },
  headerActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#f44336',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifCount: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  kycRow: {
    marginBottom: SPACING.sm,
  },
  activeBanner: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    marginTop: SPACING.sm,
  },
  activeBannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  activeBannerTitle: {
    fontSize: FONT_SIZE.base,
    fontWeight: '600',
    color: '#ffffff',
  },
  activeBannerSub: {
    fontSize: FONT_SIZE.xs,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 2,
  },
  section: {
    padding: SPACING.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    marginBottom: SPACING.md,
  },
  seeAll: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
  },
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  quickAction: {
    width: '30%',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    flex: 1,
    minWidth: '30%',
  },
  quickIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xs,
  },
  quickLabel: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '600',
    textAlign: 'center',
  },
});
