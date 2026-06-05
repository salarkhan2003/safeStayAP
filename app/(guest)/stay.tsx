import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '../../src/store/authStore';
import { useThemeStore } from '../../src/store/themeStore';
import { bookingsApi, propertiesApi } from '../../src/services/mockApi';
import { Card } from '../../src/components/ui/Card';
import { Badge } from '../../src/components/ui/Badge';
import { EmptyState } from '../../src/components/ui/EmptyState';
import { BORDER_RADIUS, FONT_SIZE, SPACING, SHADOW } from '../../src/constants/theme';

export default function CurrentStayScreen() {
  const { user } = useAuthStore();
  const { theme } = useThemeStore();
  const c = theme.colors;
  const insets = useSafeAreaInsets();

  const { data: bookings } = useQuery({
    queryKey: ['bookings', user?.id],
    queryFn: () => bookingsApi.getByGuest(user?.id || ''),
    enabled: !!user?.id,
  });

  const activeBooking = bookings?.find(
    b => b.status === 'checked_in' || b.status === 'confirmed'
  );

  const { data: property } = useQuery({
    queryKey: ['property', activeBooking?.propertyId],
    queryFn: () => propertiesApi.getById(activeBooking?.propertyId || ''),
    enabled: !!activeBooking?.propertyId,
  });

  const stayActions = [
    { icon: 'qr-code', label: 'Digital Pass', color: '#1a237e', onPress: () => router.push('/(guest)/guest-pass') },
    { icon: 'alert-circle', label: 'SOS Alert', color: '#D32F2F', onPress: () => router.push('/(guest)/sos') },
    { icon: 'warning', label: 'Report Incident', color: '#E65100', onPress: () => router.push('/(guest)/incidents') },
    { icon: 'call', label: 'Call Owner', color: '#00897B', onPress: () => {} },
  ];

  if (!activeBooking) {
    return (
      <View style={[styles.container, { backgroundColor: c.background, paddingTop: insets.top }]}>
        <View style={[styles.header, { backgroundColor: c.surface, borderBottomColor: c.border }]}>
          <Text style={[styles.title, { color: c.text }]}>My Stay</Text>
        </View>
        <EmptyState
          icon="bed-outline"
          title="No Active Stay"
          description="You don't have any active booking right now. Find a property and book your stay."
          actionLabel="Find Stay"
          onAction={() => router.push('/(guest)/search')}
        />
      </View>
    );
  }

  const checkInDate = new Date(activeBooking.checkIn);
  const checkOutDate = new Date(activeBooking.checkOut);
  const daysLeft = Math.ceil((checkOutDate.getTime() - Date.now()) / 86400000);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: c.background }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Hero */}
      <LinearGradient
        colors={['#1a237e', '#3949ab']}
        style={[styles.hero, { paddingTop: insets.top + SPACING.md }]}
      >
        <View style={styles.heroContent}>
          <Badge
            label={activeBooking.status === 'checked_in' ? 'Currently Staying' : 'Confirmed'}
            variant={activeBooking.status === 'checked_in' ? 'success' : 'info'}
          />
          <Text style={styles.heroPropertyName}>{activeBooking.propertyName}</Text>
          <Text style={styles.heroRoom}>Room {activeBooking.roomNumber}</Text>

          <View style={styles.daysLeft}>
            <Text style={styles.daysNumber}>{daysLeft}</Text>
            <Text style={styles.daysLabel}>days remaining</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Quick Actions */}
      <View style={styles.actionsGrid}>
        {stayActions.map(action => (
          <TouchableOpacity
            key={action.label}
            style={[styles.actionCard, { backgroundColor: c.card, ...SHADOW.sm }]}
            onPress={action.onPress}
          >
            <View style={[styles.actionIcon, { backgroundColor: action.color + '20' }]}>
              <Ionicons name={action.icon as any} size={28} color={action.color} />
            </View>
            <Text style={[styles.actionLabel, { color: c.text }]}>{action.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Stay Details */}
      <View style={{ padding: SPACING.md }}>
        <Card style={styles.detailsCard}>
          <Text style={[styles.cardTitle, { color: c.text }]}>Stay Details</Text>
          {[
            { label: 'Check-in', value: checkInDate.toLocaleDateString('en-IN', { dateStyle: 'full' }) },
            { label: 'Check-out', value: checkOutDate.toLocaleDateString('en-IN', { dateStyle: 'full' }) },
            { label: 'Booking ID', value: activeBooking.id },
            { label: 'Amount Paid', value: `₹${activeBooking.paidAmount.toLocaleString()}` },
            { label: 'Guests', value: String(activeBooking.guestCount) },
          ].map(item => (
            <View key={item.label} style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: c.textMuted }]}>{item.label}</Text>
              <Text style={[styles.detailValue, { color: c.text }]}>{item.value}</Text>
            </View>
          ))}
        </Card>

        {/* Property Info */}
        {property && (
          <Card style={styles.detailsCard}>
            <Text style={[styles.cardTitle, { color: c.text }]}>Property Info</Text>
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: c.textMuted }]}>Address</Text>
              <Text style={[styles.detailValue, { color: c.text, flex: 1, textAlign: 'right' }]}>
                {property.address}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: c.textMuted }]}>Contact</Text>
              <Text style={[styles.detailValue, { color: c.primary }]}>{property.contactPhone}</Text>
            </View>
            <View style={styles.amenitiesRow}>
              {property.amenities.slice(0, 6).map(a => (
                <View key={a} style={[styles.amenityChip, { backgroundColor: c.primary + '15' }]}>
                  <Text style={[styles.amenityText, { color: c.primary }]}>{a}</Text>
                </View>
              ))}
            </View>
          </Card>
        )}
      </View>
    </ScrollView>
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
  hero: {
    paddingBottom: SPACING.xl,
    paddingHorizontal: SPACING.md,
  },
  heroContent: {
    alignItems: 'center',
    paddingTop: SPACING.md,
  },
  heroPropertyName: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: '800',
    color: '#fff',
    textAlign: 'center',
    marginTop: SPACING.sm,
  },
  heroRoom: {
    fontSize: FONT_SIZE.md,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  daysLeft: {
    alignItems: 'center',
    marginTop: SPACING.lg,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    paddingHorizontal: SPACING.xl,
  },
  daysNumber: {
    fontSize: 48,
    fontWeight: '800',
    color: '#ffffff',
  },
  daysLabel: {
    fontSize: FONT_SIZE.sm,
    color: 'rgba(255,255,255,0.8)',
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: SPACING.md,
    gap: SPACING.md,
  },
  actionCard: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  actionLabel: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
    textAlign: 'center',
  },
  detailsCard: {
    marginBottom: SPACING.md,
  },
  cardTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    marginBottom: SPACING.md,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SPACING.xs,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  detailLabel: {
    fontSize: FONT_SIZE.sm,
  },
  detailValue: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
  },
  amenitiesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
    marginTop: SPACING.sm,
  },
  amenityChip: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.full,
  },
  amenityText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '500',
  },
});
