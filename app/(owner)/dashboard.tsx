import React from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '../../src/store/authStore';
import { useThemeStore } from '../../src/store/themeStore';
import {
  propertiesApi, bookingsApi, alertsApi,
  notificationsApi, analyticsApi,
} from '../../src/services/mockApi';
import { Card } from '../../src/components/ui/Card';
import { Badge } from '../../src/components/ui/Badge';
import { BORDER_RADIUS, FONT_SIZE, SPACING, SHADOW } from '../../src/constants/theme';

export default function OwnerDashboardScreen() {
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const c = theme.colors;
  const insets = useSafeAreaInsets();

  const ownerId = user?.id || '';

  const { data: properties, refetch } = useQuery({
    queryKey: ['owner-properties', ownerId],
    queryFn: () => propertiesApi.getByOwner(ownerId),
    enabled: !!ownerId,
  });

  const { data: allBookings } = useQuery({
    queryKey: ['all-bookings-owner', ownerId],
    queryFn: async () => {
      const allProps = await propertiesApi.getByOwner(ownerId);
      const bookingArrays = await Promise.all(allProps.map(p => bookingsApi.getByProperty(p.id)));
      return bookingArrays.flat();
    },
    enabled: !!ownerId,
  });

  const { data: alerts } = useQuery({
    queryKey: ['alerts-owner', ownerId],
    queryFn: async () => {
      const allProps = await propertiesApi.getByOwner(ownerId);
      const alertArrays = await Promise.all(allProps.map(p => alertsApi.getByProperty(p.id)));
      return alertArrays.flat();
    },
    enabled: !!ownerId,
  });

  const { data: notifications } = useQuery({
    queryKey: ['notifications', user?.id],
    queryFn: () => notificationsApi.getByUser(user?.id || ''),
    enabled: !!user?.id,
  });

  const totalRooms = properties?.reduce((sum, p) => sum + p.totalRooms, 0) || 0;
  const availableRooms = properties?.reduce((sum, p) => sum + p.availableRooms, 0) || 0;
  const occupancyRate = totalRooms > 0 ? Math.round(((totalRooms - availableRooms) / totalRooms) * 100) : 0;
  const pendingBookings = allBookings?.filter(b => b.status === 'pending').length || 0;
  const activeGuests = allBookings?.filter(b => b.status === 'checked_in').length || 0;
  const unreadAlerts = alerts?.filter(a => !a.isResolved).length || 0;
  const unreadNotifs = notifications?.filter(n => !n.isRead).length || 0;

  const statsCards = [
    { label: 'Properties', value: properties?.length || 0, icon: 'business', color: '#1565C0', onPress: () => router.push('/(owner)/properties') },
    { label: 'Occupancy', value: `${occupancyRate}%`, icon: 'bed', color: '#2E7D32', onPress: () => router.push('/(owner)/analytics') },
    { label: 'Active Guests', value: activeGuests, icon: 'people', color: '#6A1B9A', onPress: () => router.push('/(owner)/guests') },
    { label: 'Pending', value: pendingBookings, icon: 'time', color: '#E65100', onPress: () => router.push('/(owner)/guests') },
  ];

  const quickActions = [
    { icon: 'add-circle', label: 'Add Property', color: c.primary, onPress: () => {} },
    { icon: 'analytics', label: 'Analytics', color: '#00897B', onPress: () => router.push('/(owner)/analytics') },
    { icon: 'people-outline', label: 'Staff', color: '#7B1FA2', onPress: () => router.push('/(owner)/staff') },
    { icon: 'document-text-outline', label: 'Compliance', color: '#F57C00', onPress: () => router.push('/(owner)/compliance') },
  ];

  const recentAlerts = alerts?.filter(a => !a.isResolved).slice(0, 3) || [];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: c.background }]}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={false} onRefresh={refetch} />}
    >
      {/* Header */}
      <LinearGradient
        colors={['#0d47a1', '#1565c0', '#1976d2']}
        style={[styles.header, { paddingTop: insets.top + SPACING.md }]}
      >
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.greeting}>Property Dashboard</Text>
            <Text style={styles.ownerName}>{user?.name}</Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.iconBtn} onPress={toggleTheme}>
              <Ionicons name={theme.isDark ? 'sunny' : 'moon'} size={22} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.iconBtn}
              onPress={() => {/* notifications */}}
            >
              <Ionicons name="notifications" size={22} color="#fff" />
              {unreadNotifs > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{unreadNotifs}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Alert Banner */}
        {unreadAlerts > 0 && (
          <TouchableOpacity
            style={styles.alertBanner}
            onPress={() => router.push('/(owner)/alerts')}
          >
            <Ionicons name="warning" size={20} color="#FFD54F" />
            <Text style={styles.alertBannerText}>
              {unreadAlerts} active alert{unreadAlerts > 1 ? 's' : ''} require attention
            </Text>
            <Ionicons name="arrow-forward" size={16} color="rgba(255,255,255,0.8)" />
          </TouchableOpacity>
        )}
      </LinearGradient>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        {statsCards.map(stat => (
          <TouchableOpacity
            key={stat.label}
            style={[styles.statCard, { backgroundColor: c.card, ...SHADOW.sm }]}
            onPress={stat.onPress}
          >
            <View style={[styles.statIcon, { backgroundColor: stat.color + '20' }]}>
              <Ionicons name={stat.icon as any} size={24} color={stat.color} />
            </View>
            <Text style={[styles.statValue, { color: c.text }]}>{stat.value}</Text>
            <Text style={[styles.statLabel, { color: c.textMuted }]}>{stat.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: c.text }]}>Quick Actions</Text>
        <View style={styles.actionRow}>
          {quickActions.map(action => (
            <TouchableOpacity
              key={action.label}
              style={[styles.actionBtn, { backgroundColor: c.card, ...SHADOW.sm }]}
              onPress={action.onPress}
            >
              <View style={[styles.actionIcon, { backgroundColor: action.color + '15' }]}>
                <Ionicons name={action.icon as any} size={24} color={action.color} />
              </View>
              <Text style={[styles.actionLabel, { color: c.textSecondary }]}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Properties Summary */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: c.text }]}>My Properties</Text>
          <TouchableOpacity onPress={() => router.push('/(owner)/properties')}>
            <Text style={[styles.seeAll, { color: c.primary }]}>See All</Text>
          </TouchableOpacity>
        </View>
        {properties?.slice(0, 3).map(prop => (
          <TouchableOpacity
            key={prop.id}
            onPress={() => router.push(`/(owner)/property/${prop.id}` as any)}
          >
            <Card style={styles.propCard}>
              <View style={styles.propCardContent}>
                <View style={[styles.propIcon, { backgroundColor: c.primary + '15' }]}>
                  <Ionicons name="business-outline" size={24} color={c.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.propName, { color: c.text }]} numberOfLines={1}>{prop.name}</Text>
                  <Text style={[styles.propCity, { color: c.textMuted }]}>{prop.city}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={[styles.propOccupancy, { color: c.primary }]}>
                    {prop.totalRooms - prop.availableRooms}/{prop.totalRooms}
                  </Text>
                  <Text style={[styles.propOccLabel, { color: c.textMuted }]}>occupied</Text>
                </View>
              </View>
            </Card>
          </TouchableOpacity>
        ))}
      </View>

      {/* Active Alerts */}
      {recentAlerts.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: c.text }]}>Active Alerts</Text>
            <TouchableOpacity onPress={() => router.push('/(owner)/alerts')}>
              <Text style={[styles.seeAll, { color: c.primary }]}>See All</Text>
            </TouchableOpacity>
          </View>
          {recentAlerts.map(alert => (
            <Card key={alert.id} style={styles.alertCard} variant="flat">
              <View style={styles.alertRow}>
                <View style={[
                  styles.alertDot,
                  { backgroundColor: alert.severity === 'sos' ? '#D32F2F' : alert.severity === 'critical' ? '#E65100' : '#F57C00' }
                ]} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.alertTitle, { color: c.text }]}>{alert.title}</Text>
                  <Text style={[styles.alertTime, { color: c.textMuted }]}>
                    {new Date(alert.createdAt).toLocaleTimeString('en-IN', { timeStyle: 'short' })}
                  </Text>
                </View>
                <Badge
                  label={alert.severity.toUpperCase()}
                  variant={alert.severity === 'sos' ? 'error' : alert.severity === 'warning' ? 'warning' : 'info'}
                  size="sm"
                />
              </View>
            </Card>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  greeting: { fontSize: FONT_SIZE.sm, color: 'rgba(255,255,255,0.8)' },
  ownerName: { fontSize: FONT_SIZE.xxl, fontWeight: '700', color: '#ffffff' },
  headerActions: { flexDirection: 'row', gap: SPACING.sm },
  iconBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center',
  },
  badge: {
    position: 'absolute', top: -2, right: -2,
    width: 18, height: 18, borderRadius: 9,
    backgroundColor: '#f44336',
    alignItems: 'center', justifyContent: 'center',
  },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  alertBanner: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.sm,
    backgroundColor: 'rgba(255,0,0,0.2)', borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md, borderWidth: 1, borderColor: 'rgba(255,100,100,0.3)',
  },
  alertBannerText: { flex: 1, color: '#ffffff', fontSize: FONT_SIZE.sm, fontWeight: '600' },
  statsGrid: {
    flexDirection: 'row', flexWrap: 'wrap',
    padding: SPACING.md, gap: SPACING.sm, marginTop: -SPACING.lg,
  },
  statCard: {
    width: '47%', flex: 1, alignItems: 'center',
    padding: SPACING.lg, borderRadius: BORDER_RADIUS.lg,
    minWidth: '47%',
  },
  statIcon: {
    width: 52, height: 52, borderRadius: 26,
    alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.sm,
  },
  statValue: { fontSize: FONT_SIZE.xxl, fontWeight: '800', marginBottom: 4 },
  statLabel: { fontSize: FONT_SIZE.xs, fontWeight: '500' },
  section: { padding: SPACING.md, paddingTop: 0 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.md },
  sectionTitle: { fontSize: FONT_SIZE.lg, fontWeight: '700', marginBottom: SPACING.md },
  seeAll: { fontSize: FONT_SIZE.sm, fontWeight: '600' },
  actionRow: { flexDirection: 'row', gap: SPACING.sm },
  actionBtn: { flex: 1, alignItems: 'center', padding: SPACING.md, borderRadius: BORDER_RADIUS.lg },
  actionIcon: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.xs },
  actionLabel: { fontSize: FONT_SIZE.xs, fontWeight: '600', textAlign: 'center' },
  propCard: { marginBottom: SPACING.sm },
  propCardContent: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  propIcon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  propName: { fontSize: FONT_SIZE.base, fontWeight: '600', marginBottom: 4 },
  propCity: { fontSize: FONT_SIZE.sm },
  propOccupancy: { fontSize: FONT_SIZE.lg, fontWeight: '700' },
  propOccLabel: { fontSize: FONT_SIZE.xs },
  alertCard: { marginBottom: SPACING.sm },
  alertRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  alertDot: { width: 10, height: 10, borderRadius: 5, flexShrink: 0 },
  alertTitle: { fontSize: FONT_SIZE.sm, fontWeight: '600', marginBottom: 2 },
  alertTime: { fontSize: FONT_SIZE.xs },
});
