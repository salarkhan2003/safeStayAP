import React from 'react';
import {
  View, Text, StyleSheet, ScrollView,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useThemeStore } from '../../../src/store/themeStore';
import { propertiesApi, bookingsApi, analyticsApi } from '../../../src/services/mockApi';
import { Header } from '../../../src/components/ui/Header';
import { Card } from '../../../src/components/ui/Card';
import { Badge } from '../../../src/components/ui/Badge';
import { BORDER_RADIUS, FONT_SIZE, SPACING } from '../../../src/constants/theme';

export default function OwnerPropertyDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { theme } = useThemeStore();
  const c = theme.colors;

  const { data: property } = useQuery({
    queryKey: ['property', id],
    queryFn: () => propertiesApi.getById(id!),
    enabled: !!id,
  });

  const { data: bookings } = useQuery({
    queryKey: ['bookings-property', id],
    queryFn: () => bookingsApi.getByProperty(id!),
    enabled: !!id,
  });

  const { data: rooms } = useQuery({
    queryKey: ['rooms', id],
    queryFn: () => propertiesApi.getRooms(id!),
    enabled: !!id,
  });

  const { data: analytics } = useQuery({
    queryKey: ['analytics', id],
    queryFn: () => analyticsApi.getOccupancy(id!),
    enabled: !!id,
  });

  const activeGuests = bookings?.filter(b => b.status === 'checked_in').length || 0;
  const pendingBookings = bookings?.filter(b => b.status === 'pending').length || 0;

  if (!property) {
    return (
      <View style={[styles.container, { backgroundColor: c.background }]}>
        <Header title="Property Details" showBack />
        <Text style={{ textAlign: 'center', marginTop: 40, color: c.textMuted }}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <Header title={property.name} showBack subtitle={property.city} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Status */}
        <Card style={styles.section}>
          <View style={styles.statusRow}>
            <Badge label={property.verificationStatus} variant={property.verificationStatus === 'verified' ? 'success' : 'warning'} />
            <Badge label={property.status} variant={property.status === 'active' ? 'success' : 'secondary'} />
          </View>
        </Card>

        {/* Key Metrics */}
        <View style={styles.metricsGrid}>
          {[
            { label: 'Total Rooms', value: property.totalRooms, icon: 'bed', color: c.primary },
            { label: 'Available', value: property.availableRooms, icon: 'checkmark-circle', color: c.success },
            { label: 'Active Guests', value: activeGuests, icon: 'people', color: '#6A1B9A' },
            { label: 'Pending', value: pendingBookings, icon: 'time', color: c.warning },
            { label: 'Occupancy', value: `${analytics?.occupancyRate || 0}%`, icon: 'analytics', color: '#00897B' },
            { label: 'Rating', value: property.rating, icon: 'star', color: '#F57C00' },
          ].map(m => (
            <Card key={m.label} style={styles.metricCard}>
              <View style={[styles.metricIcon, { backgroundColor: m.color + '15' }]}>
                <Ionicons name={m.icon as any} size={20} color={m.color} />
              </View>
              <Text style={[styles.metricValue, { color: c.text }]}>{m.value}</Text>
              <Text style={[styles.metricLabel, { color: c.textMuted }]}>{m.label}</Text>
            </Card>
          ))}
        </View>

        {/* Room Status */}
        <Card style={styles.section}>
          <Text style={[styles.sectionTitle, { color: c.text }]}>Room Status</Text>
          <View style={styles.roomsGrid}>
            {rooms?.slice(0, 12).map(room => (
              <View
                key={room.id}
                style={[
                  styles.roomChip,
                  {
                    backgroundColor: room.status === 'occupied' ? c.error + '20' :
                      room.status === 'maintenance' ? c.warning + '20' :
                        room.status === 'reserved' ? c.info + '20' : c.success + '20',
                    borderColor: room.status === 'occupied' ? c.error :
                      room.status === 'maintenance' ? c.warning :
                        room.status === 'reserved' ? c.info : c.success,
                  },
                ]}
              >
                <Text style={[styles.roomChipText, {
                  color: room.status === 'occupied' ? c.error :
                    room.status === 'maintenance' ? c.warning :
                      room.status === 'reserved' ? c.info : c.success,
                }]}>
                  {room.roomNumber}
                </Text>
              </View>
            ))}
          </View>
          <View style={styles.legendRow}>
            {[
              { status: 'Available', color: c.success },
              { status: 'Occupied', color: c.error },
              { status: 'Maintenance', color: c.warning },
              { status: 'Reserved', color: c.info },
            ].map(l => (
              <View key={l.status} style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: l.color }]} />
                <Text style={[styles.legendText, { color: c.textMuted }]}>{l.status}</Text>
              </View>
            ))}
          </View>
        </Card>

        {/* Recent Bookings */}
        <Card>
          <Text style={[styles.sectionTitle, { color: c.text }]}>Recent Bookings</Text>
          {bookings?.slice(0, 5).map(booking => (
            <View key={booking.id} style={styles.bookingRow}>
              <View style={[styles.bookingDot, {
                backgroundColor: booking.status === 'checked_in' ? c.success :
                  booking.status === 'pending' ? c.warning : c.textMuted,
              }]} />
              <Text style={[styles.bookingId, { color: c.textSecondary }]}>
                {booking.guestId} · Room {booking.roomNumber}
              </Text>
              <Text style={[styles.bookingStatus, { color: c.textMuted }]}>
                {booking.status.replace('_', ' ')}
              </Text>
            </View>
          ))}
          {!bookings?.length && (
            <Text style={[styles.noBookings, { color: c.textMuted }]}>No bookings yet</Text>
          )}
        </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: SPACING.md },
  section: { marginBottom: SPACING.md },
  statusRow: { flexDirection: 'row', gap: SPACING.sm },
  metricsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm, marginBottom: SPACING.md },
  metricCard: { width: '30%', flex: 1, alignItems: 'center', minWidth: '30%', padding: SPACING.md },
  metricIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.xs },
  metricValue: { fontSize: FONT_SIZE.xl, fontWeight: '800', marginBottom: 2 },
  metricLabel: { fontSize: FONT_SIZE.xs, textAlign: 'center' },
  sectionTitle: { fontSize: FONT_SIZE.lg, fontWeight: '700', marginBottom: SPACING.md },
  roomsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.xs, marginBottom: SPACING.sm },
  roomChip: { width: 44, height: 32, borderRadius: BORDER_RADIUS.sm, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  roomChipText: { fontSize: FONT_SIZE.xs, fontWeight: '700' },
  legendRow: { flexDirection: 'row', gap: SPACING.md, flexWrap: 'wrap' },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: FONT_SIZE.xs },
  bookingRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, paddingVertical: SPACING.xs },
  bookingDot: { width: 8, height: 8, borderRadius: 4 },
  bookingId: { flex: 1, fontSize: FONT_SIZE.sm },
  bookingStatus: { fontSize: FONT_SIZE.xs, textTransform: 'capitalize' },
  noBookings: { fontSize: FONT_SIZE.sm, textAlign: 'center', paddingVertical: SPACING.md },
});
