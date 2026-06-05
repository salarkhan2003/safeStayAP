import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity, RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '../../src/store/authStore';
import { useThemeStore } from '../../src/store/themeStore';
import { bookingsApi } from '../../src/services/mockApi';
import { Card } from '../../src/components/ui/Card';
import { Badge } from '../../src/components/ui/Badge';
import { EmptyState } from '../../src/components/ui/EmptyState';
import { BORDER_RADIUS, FONT_SIZE, SPACING } from '../../src/constants/theme';
import type { Booking, BookingStatus } from '../../src/types';

const STATUS_TABS: BookingStatus[] = ['pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled'];

const statusConfig = {
  pending: { label: 'Pending', variant: 'warning' as const, icon: 'time-outline' },
  confirmed: { label: 'Confirmed', variant: 'info' as const, icon: 'checkmark-circle-outline' },
  checked_in: { label: 'Active', variant: 'success' as const, icon: 'bed-outline' },
  checked_out: { label: 'Completed', variant: 'secondary' as const, icon: 'checkmark-done-outline' },
  cancelled: { label: 'Cancelled', variant: 'error' as const, icon: 'close-circle-outline' },
};

export default function BookingsScreen() {
  const { user } = useAuthStore();
  const { theme } = useThemeStore();
  const c = theme.colors;
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<'all' | BookingStatus>('all');

  const { data: bookings, isLoading, refetch } = useQuery({
    queryKey: ['bookings', user?.id],
    queryFn: () => bookingsApi.getByGuest(user?.id || ''),
    enabled: !!user?.id,
  });

  const filtered = activeTab === 'all'
    ? bookings || []
    : (bookings || []).filter(b => b.status === activeTab);

  const renderBookingCard = ({ item: booking }: { item: Booking }) => {
    const config = statusConfig[booking.status];
    return (
      <TouchableOpacity
        onPress={() => router.push(`/(guest)/booking/${booking.id}` as any)}
        activeOpacity={0.85}
      >
        <Card style={styles.bookingCard}>
          <View style={styles.cardHeader}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.propName, { color: c.text }]} numberOfLines={1}>
                {booking.propertyName}
              </Text>
              <Text style={[styles.roomInfo, { color: c.textMuted }]}>
                Room {booking.roomNumber}
              </Text>
            </View>
            <Badge label={config.label} variant={config.variant} size="sm" />
          </View>

          <View style={[styles.divider, { backgroundColor: c.border }]} />

          <View style={styles.dateRow}>
            <View style={styles.dateItem}>
              <Text style={[styles.dateLabel, { color: c.textMuted }]}>Check-in</Text>
              <Text style={[styles.dateValue, { color: c.text }]}>
                {new Date(booking.checkIn).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
              </Text>
            </View>
            <View style={[styles.dateDivider, { backgroundColor: c.border }]} />
            <View style={styles.dateItem}>
              <Text style={[styles.dateLabel, { color: c.textMuted }]}>Check-out</Text>
              <Text style={[styles.dateValue, { color: c.text }]}>
                {new Date(booking.checkOut).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
              </Text>
            </View>
            <View style={[styles.dateDivider, { backgroundColor: c.border }]} />
            <View style={styles.dateItem}>
              <Text style={[styles.dateLabel, { color: c.textMuted }]}>Amount</Text>
              <Text style={[styles.dateValue, { color: c.primary, fontWeight: '700' }]}>
                ₹{booking.totalAmount.toLocaleString()}
              </Text>
            </View>
          </View>

          {booking.status === 'confirmed' && (
            <TouchableOpacity
              style={[styles.checkInBtn, { backgroundColor: c.primary }]}
              onPress={() => router.push('/(guest)/guest-pass')}
            >
              <Ionicons name="qr-code-outline" size={16} color="#fff" />
              <Text style={styles.checkInBtnText}>View QR Pass</Text>
            </TouchableOpacity>
          )}
        </Card>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: c.background, paddingTop: insets.top }]}>
      <View style={[styles.header, { backgroundColor: c.surface, borderBottomColor: c.border }]}>
        <Text style={[styles.title, { color: c.text }]}>My Bookings</Text>
      </View>

      {/* Status Tabs */}
      <View style={[styles.tabs, { backgroundColor: c.surface, borderBottomColor: c.border }]}>
        <FlatList
          data={['all', ...STATUS_TABS]}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={item => item}
          contentContainerStyle={styles.tabList}
          renderItem={({ item }) => {
            const isActive = activeTab === item;
            const label = item === 'all' ? 'All' : statusConfig[item as BookingStatus]?.label || item;
            return (
              <TouchableOpacity
                style={[styles.tab, isActive && { borderBottomColor: c.primary, borderBottomWidth: 2 }]}
                onPress={() => setActiveTab(item as any)}
              >
                <Text style={[styles.tabText, { color: isActive ? c.primary : c.textMuted }]}>
                  {label}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {isLoading ? (
        <View style={styles.loading}>
          <Text style={[styles.loadingText, { color: c.textMuted }]}>Loading bookings...</Text>
        </View>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon="calendar-outline"
          title="No Bookings Yet"
          description="Start by searching for a property and making a booking."
          actionLabel="Search Properties"
          onAction={() => router.push('/(guest)/search')}
        />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => item.id}
          renderItem={renderBookingCard}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={false} onRefresh={refetch} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    padding: SPACING.md,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '700',
  },
  tabs: {
    borderBottomWidth: 1,
  },
  tabList: {
    paddingHorizontal: SPACING.md,
  },
  tab: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
  },
  tabText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
  },
  list: {
    padding: SPACING.md,
  },
  bookingCard: {
    marginBottom: SPACING.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  propName: {
    fontSize: FONT_SIZE.base,
    fontWeight: '700',
    marginBottom: 4,
  },
  roomInfo: {
    fontSize: FONT_SIZE.sm,
  },
  divider: {
    height: 1,
    marginVertical: SPACING.sm,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateItem: {
    flex: 1,
    alignItems: 'center',
  },
  dateDivider: {
    width: 1,
    height: 32,
    marginHorizontal: SPACING.sm,
  },
  dateLabel: {
    fontSize: FONT_SIZE.xs,
    marginBottom: 4,
  },
  dateValue: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
  },
  checkInBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    marginTop: SPACING.md,
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
  },
  checkInBtnText: {
    color: '#fff',
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: FONT_SIZE.md,
  },
});
