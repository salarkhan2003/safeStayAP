import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, Alert,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useThemeStore } from '../../../src/store/themeStore';
import { bookingsApi } from '../../../src/services/mockApi';
import { Header } from '../../../src/components/ui/Header';
import { Card } from '../../../src/components/ui/Card';
import { Badge } from '../../../src/components/ui/Badge';
import { Button } from '../../../src/components/ui/Button';
import { FONT_SIZE, SPACING } from '../../../src/constants/theme';

export default function BookingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { theme } = useThemeStore();
  const c = theme.colors;
  const queryClient = useQueryClient();

  const { data: booking, isLoading } = useQuery({
    queryKey: ['booking', id],
    queryFn: () => bookingsApi.getById(id!),
    enabled: !!id,
  });

  const cancelMutation = useMutation({
    mutationFn: bookingsApi.cancel,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      Alert.alert('Cancelled', 'Booking has been cancelled.', [{ text: 'OK', onPress: () => router.back() }]);
    },
  });

  const handleCancel = () => {
    Alert.alert('Cancel Booking', 'Are you sure you want to cancel this booking?', [
      { text: 'No', style: 'cancel' },
      { text: 'Yes, Cancel', style: 'destructive', onPress: () => cancelMutation.mutate(id!) },
    ]);
  };

  if (isLoading || !booking) {
    return (
      <View style={[styles.container, { backgroundColor: c.background }]}>
        <Header title="Booking Details" showBack />
        <Text style={{ textAlign: 'center', marginTop: 40, color: c.textMuted }}>Loading...</Text>
      </View>
    );
  }

  const statusVariants: Record<string, 'warning' | 'info' | 'success' | 'secondary' | 'error'> = {
    pending: 'warning', confirmed: 'info', checked_in: 'success', checked_out: 'secondary', cancelled: 'error',
  };

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <Header title="Booking Details" showBack />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <Card style={styles.section}>
          <View style={styles.headerRow}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.propName, { color: c.text }]}>{booking.propertyName}</Text>
              <Text style={[styles.roomInfo, { color: c.textMuted }]}>Room {booking.roomNumber}</Text>
            </View>
            <Badge label={booking.status.replace('_', ' ')} variant={statusVariants[booking.status]} />
          </View>
        </Card>

        <Card style={styles.section}>
          <Text style={[styles.sectionTitle, { color: c.text }]}>Stay Details</Text>
          {[
            { label: 'Booking ID', value: booking.id },
            { label: 'Check-in', value: new Date(booking.checkIn).toLocaleDateString('en-IN', { dateStyle: 'full' }) },
            { label: 'Check-out', value: new Date(booking.checkOut).toLocaleDateString('en-IN', { dateStyle: 'full' }) },
            { label: 'Guests', value: String(booking.guestCount) },
            { label: 'Total Amount', value: `₹${booking.totalAmount.toLocaleString()}` },
            { label: 'Paid Amount', value: `₹${booking.paidAmount.toLocaleString()}` },
            { label: 'QR Code', value: booking.qrCode },
          ].map(item => (
            <View key={item.label} style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: c.textMuted }]}>{item.label}</Text>
              <Text style={[styles.detailValue, { color: c.text }]} numberOfLines={1}>{item.value}</Text>
            </View>
          ))}
        </Card>

        {booking.specialRequests && (
          <Card style={styles.section}>
            <Text style={[styles.sectionTitle, { color: c.text }]}>Special Requests</Text>
            <Text style={[styles.specialRequests, { color: c.textSecondary }]}>{booking.specialRequests}</Text>
          </Card>
        )}

        {['pending', 'confirmed'].includes(booking.status) && (
          <Button
            title="Cancel Booking"
            variant="danger"
            onPress={handleCancel}
            loading={cancelMutation.isPending}
            fullWidth
          />
        )}

        {booking.status === 'confirmed' && (
          <Button
            title="View Digital Guest Pass"
            onPress={() => router.push('/(guest)/guest-pass')}
            fullWidth
            style={{ marginTop: SPACING.sm }}
          />
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: SPACING.md },
  section: { marginBottom: SPACING.md },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  propName: { fontSize: FONT_SIZE.xl, fontWeight: '700', marginBottom: 4 },
  roomInfo: { fontSize: FONT_SIZE.md },
  sectionTitle: { fontSize: FONT_SIZE.lg, fontWeight: '700', marginBottom: SPACING.md },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: SPACING.sm, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  detailLabel: { fontSize: FONT_SIZE.sm },
  detailValue: { fontSize: FONT_SIZE.sm, fontWeight: '600', maxWidth: '60%', textAlign: 'right' },
  specialRequests: { fontSize: FONT_SIZE.md, lineHeight: 22 },
});
