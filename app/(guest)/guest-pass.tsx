import React from 'react';
import {
  View, Text, StyleSheet, ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../../src/store/authStore';
import { useThemeStore } from '../../src/store/themeStore';
import { bookingsApi } from '../../src/services/mockApi';
import { Header } from '../../src/components/ui/Header';
import { Badge } from '../../src/components/ui/Badge';
import { BORDER_RADIUS, FONT_SIZE, SPACING } from '../../src/constants/theme';

// Simulated QR code visual
const QRDisplay: React.FC<{ code: string }> = ({ code }) => {
  const size = 200;
  // Generate a deterministic grid from the code
  const cells = Array.from({ length: 21 }, (_, row) =>
    Array.from({ length: 21 }, (_, col) => {
      const charCode = code.charCodeAt((row * 21 + col) % code.length);
      return (charCode + row + col) % 3 !== 0;
    })
  );

  return (
    <View style={[styles.qrContainer, { width: size, height: size }]}>
      {cells.map((row, r) => (
        <View key={r} style={{ flexDirection: 'row' }}>
          {row.map((filled, c) => (
            <View
              key={c}
              style={{
                width: size / 21,
                height: size / 21,
                backgroundColor: filled ? '#1a237e' : '#ffffff',
              }}
            />
          ))}
        </View>
      ))}
    </View>
  );
};

export default function GuestPassScreen() {
  const { user } = useAuthStore();
  const { theme } = useThemeStore();
  const c = theme.colors;

  const { data: bookings } = useQuery({
    queryKey: ['bookings', user?.id],
    queryFn: () => bookingsApi.getByGuest(user?.id || ''),
    enabled: !!user?.id,
  });

  const activeBooking = bookings?.find(
    b => b.status === 'confirmed' || b.status === 'checked_in'
  );

  if (!activeBooking) {
    return (
      <View style={[styles.container, { backgroundColor: c.background }]}>
        <Header title="Digital Guest Pass" showBack />
        <View style={styles.noPass}>
          <Ionicons name="qr-code-outline" size={80} color={c.textMuted} />
          <Text style={[styles.noPassTitle, { color: c.text }]}>No Active Booking</Text>
          <Text style={[styles.noPassDesc, { color: c.textMuted }]}>
            You need an active or confirmed booking to get your digital guest pass.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <Header title="Digital Guest Pass" showBack />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Pass Card */}
        <LinearGradient
          colors={['#1a237e', '#283593', '#3949ab']}
          style={styles.passCard}
        >
          {/* Header */}
          <View style={styles.passHeader}>
            <View style={styles.passLogo}>
              <Ionicons name="shield-checkmark" size={24} color="#ffffff" />
            </View>
            <View>
              <Text style={styles.passAppName}>SafeStay AP</Text>
              <Text style={styles.passSubtitle}>Digital Guest Pass</Text>
            </View>
            <Badge
              label={activeBooking.status === 'checked_in' ? 'ACTIVE' : 'CONFIRMED'}
              variant={activeBooking.status === 'checked_in' ? 'success' : 'info'}
            />
          </View>

          {/* Divider */}
          <View style={styles.dashedLine} />

          {/* Guest Info */}
          <View style={styles.guestInfo}>
            <View style={styles.guestAvatar}>
              <Ionicons name="person" size={32} color="#ffffff" />
            </View>
            <View>
              <Text style={styles.guestName}>{user?.name}</Text>
              <Text style={styles.guestPhone}>{user?.phone}</Text>
            </View>
          </View>

          {/* Stay Details */}
          <View style={styles.stayDetails}>
            <View style={styles.stayItem}>
              <Text style={styles.stayLabel}>Property</Text>
              <Text style={styles.stayValue}>{activeBooking.propertyName}</Text>
            </View>
            <View style={styles.stayItem}>
              <Text style={styles.stayLabel}>Room</Text>
              <Text style={styles.stayValue}>{activeBooking.roomNumber}</Text>
            </View>
            <View style={styles.stayItem}>
              <Text style={styles.stayLabel}>Check-in</Text>
              <Text style={styles.stayValue}>
                {new Date(activeBooking.checkIn).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
              </Text>
            </View>
            <View style={styles.stayItem}>
              <Text style={styles.stayLabel}>Check-out</Text>
              <Text style={styles.stayValue}>
                {new Date(activeBooking.checkOut).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
              </Text>
            </View>
          </View>

          {/* Divider */}
          <View style={styles.dashedLine} />

          {/* QR Code */}
          <View style={styles.qrSection}>
            <View style={styles.qrWrapper}>
              <QRDisplay code={activeBooking.qrCode} />
            </View>
            <Text style={styles.qrCode}>{activeBooking.qrCode}</Text>
            <Text style={styles.qrHint}>
              Show this QR code at the property for check-in
            </Text>
          </View>

          {/* Verified Badge */}
          <View style={styles.verifiedRow}>
            <Ionicons name="shield-checkmark" size={16} color="#4CAF50" />
            <Text style={styles.verifiedText}>Verified by SafeStay AP · Police Compliant</Text>
          </View>
        </LinearGradient>

        {/* Booking ID */}
        <View style={[styles.bookingId, { backgroundColor: c.card }]}>
          <Text style={[styles.bookingIdLabel, { color: c.textMuted }]}>Booking ID</Text>
          <Text style={[styles.bookingIdValue, { color: c.text }]}>{activeBooking.id}</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    padding: SPACING.md,
    alignItems: 'center',
  },
  noPass: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
    gap: SPACING.md,
  },
  noPassTitle: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '700',
  },
  noPassDesc: {
    fontSize: FONT_SIZE.md,
    textAlign: 'center',
    lineHeight: 22,
  },
  passCard: {
    width: '100%',
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    marginBottom: SPACING.md,
  },
  passHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  passLogo: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  passAppName: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: '#ffffff',
  },
  passSubtitle: {
    fontSize: FONT_SIZE.xs,
    color: 'rgba(255,255,255,0.7)',
  },
  dashedLine: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
    borderStyle: 'dashed',
    marginVertical: SPACING.md,
  },
  guestInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  guestAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  guestName: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '700',
    color: '#ffffff',
  },
  guestPhone: {
    fontSize: FONT_SIZE.sm,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 2,
  },
  stayDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  stayItem: {
    flex: 1,
    minWidth: '40%',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: BORDER_RADIUS.sm,
    padding: SPACING.sm,
  },
  stayLabel: {
    fontSize: FONT_SIZE.xs,
    color: 'rgba(255,255,255,0.6)',
    marginBottom: 4,
  },
  stayValue: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '700',
    color: '#ffffff',
  },
  qrSection: {
    alignItems: 'center',
    gap: SPACING.sm,
  },
  qrWrapper: {
    backgroundColor: '#ffffff',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
  },
  qrContainer: {
    overflow: 'hidden',
  },
  qrCode: {
    fontSize: FONT_SIZE.xs,
    color: 'rgba(255,255,255,0.6)',
    letterSpacing: 1,
    fontFamily: 'monospace',
  },
  qrHint: {
    fontSize: FONT_SIZE.sm,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
  },
  verifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    justifyContent: 'center',
    marginTop: SPACING.md,
  },
  verifiedText: {
    fontSize: FONT_SIZE.xs,
    color: '#4CAF50',
  },
  bookingId: {
    width: '100%',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bookingIdLabel: {
    fontSize: FONT_SIZE.sm,
  },
  bookingIdValue: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
    fontFamily: 'monospace',
  },
});
