import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  Image, TouchableOpacity, Alert,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../../../src/store/authStore';
import { useThemeStore } from '../../../src/store/themeStore';
import { propertiesApi, bookingsApi } from '../../../src/services/mockApi';
import { Header } from '../../../src/components/ui/Header';
import { Badge } from '../../../src/components/ui/Badge';
import { Button } from '../../../src/components/ui/Button';
import { Card } from '../../../src/components/ui/Card';
import { Skeleton } from '../../../src/components/ui/SkeletonLoader';
import { BORDER_RADIUS, FONT_SIZE, SPACING } from '../../../src/constants/theme';

export default function PropertyDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuthStore();
  const { theme } = useThemeStore();
  const c = theme.colors;
  const queryClient = useQueryClient();
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [bookingLoading, setBookingLoading] = useState(false);

  const { data: property, isLoading } = useQuery({
    queryKey: ['property', id],
    queryFn: () => propertiesApi.getById(id!),
    enabled: !!id,
  });

  const { data: rooms } = useQuery({
    queryKey: ['rooms', id],
    queryFn: () => propertiesApi.getRooms(id!),
    enabled: !!id,
  });

  const handleBook = async () => {
    if (!selectedRoom || !property) return;
    const room = rooms?.find(r => r.id === selectedRoom);
    if (!room) return;

    Alert.alert(
      'Confirm Booking',
      `Book Room ${room.roomNumber} at ${property.name} for ₹${room.pricePerMonth.toLocaleString()}/month?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Book Now',
          onPress: async () => {
            setBookingLoading(true);
            try {
              const checkIn = new Date();
              const checkOut = new Date();
              checkOut.setMonth(checkOut.getMonth() + 1);
              await bookingsApi.create({
                guestId: user?.id,
                propertyId: property.id,
                roomId: room.id,
                propertyName: property.name,
                roomNumber: room.roomNumber,
                checkIn: checkIn.toISOString(),
                checkOut: checkOut.toISOString(),
                totalAmount: room.pricePerMonth,
                guestCount: 1,
              });
              queryClient.invalidateQueries({ queryKey: ['bookings'] });
              Alert.alert(
                'Booking Requested!',
                'Your booking request has been sent. The owner will confirm shortly.',
                [{ text: 'View Bookings', onPress: () => router.push('/(guest)/bookings') }]
              );
            } catch {
              Alert.alert('Error', 'Failed to submit booking request.');
            } finally {
              setBookingLoading(false);
            }
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: c.background }]}>
        <Header title="Property Details" showBack />
        <ScrollView style={{ padding: SPACING.md }}>
          <Skeleton height={240} borderRadius={16} style={{ marginBottom: SPACING.md }} />
          <Skeleton height={32} width="70%" style={{ marginBottom: SPACING.sm }} />
          <Skeleton height={20} width="50%" style={{ marginBottom: SPACING.md }} />
          <Skeleton height={100} style={{ marginBottom: SPACING.md }} />
        </ScrollView>
      </View>
    );
  }

  if (!property) {
    return (
      <View style={[styles.container, { backgroundColor: c.background }]}>
        <Header title="Not Found" showBack />
        <Text style={{ textAlign: 'center', marginTop: 40, color: c.textMuted }}>Property not found</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <Header title={property.name} showBack />
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero Image */}
        <View style={styles.heroImage}>
          <Image source={{ uri: property.images[0] }} style={styles.image} resizeMode="cover" />
          <LinearGradient colors={['transparent', 'rgba(0,0,0,0.5)']} style={StyleSheet.absoluteFill} />
          <View style={styles.imageOverlay}>
            <Badge label={property.type.toUpperCase()} variant="primary" />
            {property.verificationStatus === 'verified' && (
              <View style={styles.verified}>
                <Ionicons name="shield-checkmark" size={14} color="#4CAF50" />
                <Text style={styles.verifiedText}>Verified</Text>
              </View>
            )}
          </View>
          <View style={styles.priceOverlay}>
            <Text style={styles.priceText}>₹{property.priceRange.min.toLocaleString()} - ₹{property.priceRange.max.toLocaleString()}/mo</Text>
          </View>
        </View>

        <View style={styles.content}>
          {/* Title */}
          <Text style={[styles.propName, { color: c.text }]}>{property.name}</Text>
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={16} color="#FFC107" />
            <Text style={[styles.rating, { color: c.text }]}>{property.rating}</Text>
            <Text style={[styles.reviews, { color: c.textMuted }]}>({property.reviewCount} reviews)</Text>
            <View style={styles.dot} />
            <Ionicons name="location-outline" size={14} color={c.textMuted} />
            <Text style={[styles.city, { color: c.textMuted }]}>{property.city}</Text>
          </View>
          <Text style={[styles.address, { color: c.textMuted }]}>{property.address}</Text>

          {/* Description */}
          <Card style={styles.section}>
            <Text style={[styles.sectionTitle, { color: c.text }]}>About</Text>
            <Text style={[styles.description, { color: c.textSecondary }]}>{property.description}</Text>
          </Card>

          {/* Amenities */}
          <Card style={styles.section}>
            <Text style={[styles.sectionTitle, { color: c.text }]}>Amenities</Text>
            <View style={styles.amenitiesGrid}>
              {property.amenities.map(a => (
                <View key={a} style={[styles.amenityItem, { backgroundColor: c.primary + '10' }]}>
                  <Ionicons name="checkmark-circle" size={16} color={c.primary} />
                  <Text style={[styles.amenityText, { color: c.text }]}>{a}</Text>
                </View>
              ))}
            </View>
          </Card>

          {/* Rules */}
          <Card style={styles.section}>
            <Text style={[styles.sectionTitle, { color: c.text }]}>House Rules</Text>
            {property.rules.map((rule, i) => (
              <View key={i} style={styles.ruleRow}>
                <Ionicons name="information-circle-outline" size={16} color={c.warning} />
                <Text style={[styles.ruleText, { color: c.textSecondary }]}>{rule}</Text>
              </View>
            ))}
          </Card>

          {/* Available Rooms */}
          <Card style={styles.section}>
            <Text style={[styles.sectionTitle, { color: c.text }]}>Available Rooms</Text>
            {rooms?.filter(r => r.status === 'available').slice(0, 5).map(room => (
              <TouchableOpacity
                key={room.id}
                style={[
                  styles.roomCard,
                  {
                    backgroundColor: selectedRoom === room.id ? c.primary + '15' : c.background,
                    borderColor: selectedRoom === room.id ? c.primary : c.border,
                  },
                ]}
                onPress={() => setSelectedRoom(room.id)}
              >
                <View style={{ flex: 1 }}>
                  <Text style={[styles.roomNumber, { color: c.text }]}>Room {room.roomNumber}</Text>
                  <Text style={[styles.roomType, { color: c.textMuted }]}>
                    {room.type.charAt(0).toUpperCase() + room.type.slice(1)} · Floor {room.floor} · {room.capacity} persons
                  </Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={[styles.roomPrice, { color: c.primary }]}>₹{room.pricePerMonth.toLocaleString()}/mo</Text>
                  {selectedRoom === room.id && (
                    <Ionicons name="checkmark-circle" size={20} color={c.primary} />
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </Card>

          {/* Contact */}
          <Card style={styles.section}>
            <Text style={[styles.sectionTitle, { color: c.text }]}>Contact</Text>
            <View style={styles.contactRow}>
              <Ionicons name="call-outline" size={20} color={c.primary} />
              <Text style={[styles.contactPhone, { color: c.primary }]}>{property.contactPhone}</Text>
            </View>
          </Card>
        </View>
      </ScrollView>

      {/* Book Button */}
      <View style={[styles.footer, { backgroundColor: c.surface, borderTopColor: c.border }]}>
        <Button
          title={selectedRoom ? 'Book Selected Room' : 'Select a Room to Book'}
          onPress={handleBook}
          disabled={!selectedRoom}
          loading={bookingLoading}
          fullWidth
          size="lg"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  heroImage: { height: 260, position: 'relative' },
  image: { width: '100%', height: '100%' },
  imageOverlay: {
    position: 'absolute', top: SPACING.md, left: SPACING.md, right: SPACING.md,
    flexDirection: 'row', justifyContent: 'space-between',
  },
  verified: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: BORDER_RADIUS.full,
    paddingHorizontal: SPACING.sm, paddingVertical: 4,
  },
  verifiedText: { color: '#4CAF50', fontSize: FONT_SIZE.xs, fontWeight: '600' },
  priceOverlay: {
    position: 'absolute', bottom: SPACING.sm, right: SPACING.sm,
    backgroundColor: 'rgba(0,0,0,0.7)', borderRadius: BORDER_RADIUS.sm,
    paddingHorizontal: SPACING.sm, paddingVertical: 4,
  },
  priceText: { color: '#fff', fontSize: FONT_SIZE.sm, fontWeight: '700' },
  content: { padding: SPACING.md },
  propName: { fontSize: FONT_SIZE.xxl, fontWeight: '800', marginBottom: SPACING.xs },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs, marginBottom: 4 },
  rating: { fontSize: FONT_SIZE.base, fontWeight: '700' },
  reviews: { fontSize: FONT_SIZE.sm },
  dot: { width: 4, height: 4, borderRadius: 2, backgroundColor: '#ccc' },
  city: { fontSize: FONT_SIZE.sm },
  address: { fontSize: FONT_SIZE.sm, marginBottom: SPACING.md },
  section: { marginBottom: SPACING.md },
  sectionTitle: { fontSize: FONT_SIZE.lg, fontWeight: '700', marginBottom: SPACING.md },
  description: { fontSize: FONT_SIZE.md, lineHeight: 22 },
  amenitiesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  amenityItem: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs, paddingHorizontal: SPACING.sm, paddingVertical: SPACING.xs, borderRadius: BORDER_RADIUS.full },
  amenityText: { fontSize: FONT_SIZE.sm },
  ruleRow: { flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.sm, paddingVertical: SPACING.xs },
  ruleText: { flex: 1, fontSize: FONT_SIZE.sm, lineHeight: 18 },
  roomCard: {
    flexDirection: 'row', alignItems: 'center',
    padding: SPACING.md, borderRadius: BORDER_RADIUS.md, borderWidth: 1.5,
    marginBottom: SPACING.sm,
  },
  roomNumber: { fontSize: FONT_SIZE.base, fontWeight: '700', marginBottom: 4 },
  roomType: { fontSize: FONT_SIZE.sm },
  roomPrice: { fontSize: FONT_SIZE.base, fontWeight: '700' },
  contactRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  contactPhone: { fontSize: FONT_SIZE.base, fontWeight: '600' },
  footer: {
    padding: SPACING.md,
    borderTopWidth: 1,
  },
});
