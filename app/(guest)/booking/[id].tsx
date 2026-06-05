import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity, Image, Linking
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useThemeStore } from '../../../src/store/themeStore';
import { bookingsApi, propertiesApi, coGuestsApi } from '../../../src/services/mockApi';
import { Header } from '../../../src/components/ui/Header';
import { Card } from '../../../src/components/ui/Card';
import { Badge } from '../../../src/components/ui/Badge';
import { Button } from '../../../src/components/ui/Button';
import { BORDER_RADIUS, FONT_SIZE, SPACING, SHADOW } from '../../../src/constants/theme';

export default function BookingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { theme } = useThemeStore();
  const c = theme.colors;
  const queryClient = useQueryClient();

  // Fetch Booking Details
  const { data: booking, isLoading } = useQuery({
    queryKey: ['booking', id],
    queryFn: () => bookingsApi.getById(id!),
    enabled: !!id,
  });

  // Fetch Property Details for contact and address info
  const { data: property } = useQuery({
    queryKey: ['property', booking?.propertyId],
    queryFn: () => propertiesApi.getById(booking?.propertyId || ''),
    enabled: !!booking?.propertyId,
  });

  // Fetch Co-guests
  const { data: coGuests } = useQuery({
    queryKey: ['bookingCoGuests', id],
    queryFn: () => coGuestsApi.getByBooking(id!),
    enabled: !!id,
  });

  const cancelMutation = useMutation({
    mutationFn: bookingsApi.cancel,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['booking', id] });
      Alert.alert('Cancelled', 'Booking has been cancelled.', [{ text: 'OK', onPress: () => router.replace('/(guest)/bookings') }]);
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
        <Header title="SafeStay Booking Details" showBack />
        <View style={styles.center}>
          <Text style={{ color: c.textMuted, fontSize: FONT_SIZE.md }}>Loading booking info...</Text>
        </View>
      </View>
    );
  }

  // Format Dates
  const checkInDateFormatted = new Date(booking.checkIn).toLocaleDateString('en-IN', {
    weekday: 'short', day: '2-digit', month: 'short', year: 'numeric'
  });
  const checkOutDateFormatted = new Date(booking.checkOut).toLocaleDateString('en-IN', {
    weekday: 'short', day: '2-digit', month: 'short', year: 'numeric'
  });

  const handleCall = () => {
    const phone = property?.contactPhone || '9876543210';
    Linking.openURL(`tel:${phone}`).catch(() => Alert.alert('Error', 'Unable to make calls.'));
  };

  const handleWhatsApp = () => {
    const phone = property?.contactPhone || '9876543210';
    const text = encodeURIComponent(`Hi, I just booked Room ${booking.roomNumber} at ${booking.propertyName} via SafeStay AP. Booking ID: BKG-${booking.id.substring(8, 14)}`);
    Linking.openURL(`whatsapp://send?phone=${phone}&text=${text}`).catch(() => {
      // Fallback
      Alert.alert('WhatsApp Not Installed', `Please contact host at ${phone}`);
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <Header title="Booking Successful" showBack onBack={() => router.replace('/(guest)/bookings')} />
      
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Success Header Banner */}
        <LinearGradient colors={['#10b981', '#059669']} style={styles.successBanner}>
          <View style={styles.successRing}>
            <Ionicons name="checkmark-circle" size={42} color="#ffffff" />
          </View>
          <Text style={styles.successTitle}>Booking Successful!</Text>
          <Text style={styles.successSubtitle}>Your safe accommodation has been reserved.</Text>
          <View style={styles.policeVerifiedBadge}>
            <Ionicons name="shield-checkmark" size={14} color="#059669" />
            <Text style={styles.policeVerifiedText}>AP Police Pre-Cleared</Text>
          </View>
        </LinearGradient>

        {/* Confirmation Details Card */}
        <Card style={styles.detailsCard}>
          <Text style={[styles.sectionHeading, { color: c.text }]}>Confirmation Details</Text>
          
          <View style={styles.confirmRow}>
            <Text style={[styles.confirmLabel, { color: c.textMuted }]}>BOOKING ID</Text>
            <Text style={[styles.confirmValue, { color: c.text, fontWeight: '700' }]}>
              BKG-{booking.id.substring(8, 14).toUpperCase()}
            </Text>
          </View>

          <View style={styles.confirmRow}>
            <Text style={[styles.confirmLabel, { color: c.textMuted }]}>PROPERTY NAME</Text>
            <Text style={[styles.confirmValue, { color: c.text, fontWeight: '700' }]}>{booking.propertyName}</Text>
          </View>

          <View style={styles.confirmRow}>
            <Text style={[styles.confirmLabel, { color: c.textMuted }]}>ROOM ASSIGNED</Text>
            <Text style={[styles.confirmValue, { color: c.primary, fontWeight: '800' }]}>Room {booking.roomNumber}</Text>
          </View>

          <View style={styles.confirmRow}>
            <Text style={[styles.confirmLabel, { color: c.textMuted }]}>STAY DURATION</Text>
            <Text style={[styles.confirmValue, { color: c.text }]}>
              {checkInDateFormatted} - {checkOutDateFormatted}
            </Text>
          </View>

          <View style={styles.confirmRow}>
            <Text style={[styles.confirmLabel, { color: c.textMuted }]}>GUESTS REGISTERED</Text>
            <Text style={[styles.confirmValue, { color: c.text }]}>{booking.guestCount} Guest(s)</Text>
          </View>

          <View style={styles.confirmRow}>
            <Text style={[styles.confirmLabel, { color: c.textMuted }]}>TOTAL AMOUNT PAID</Text>
            <Text style={[styles.confirmValue, { color: c.secondary, fontWeight: '800' }]}>
              ₹{booking.totalAmount.toLocaleString()} (Paid via App)
            </Text>
          </View>
        </Card>

        {/* Occupants & Security Clearance */}
        {booking.guestCount > 1 && coGuests && coGuests.length > 0 && (
          <Card style={styles.detailsCard}>
            <Text style={[styles.sectionHeading, { color: c.text }]}>
              Occupants & Security Clearance
            </Text>
            <Text style={{ fontSize: 11, color: c.textMuted, marginTop: -6, marginBottom: 12 }}>
              Verification status of all co-guests sharing this stay.
            </Text>

            {/* Primary Guest */}
            <View style={[styles.coGuestItem, { borderBottomColor: c.border, borderBottomWidth: 1, paddingVertical: 8 }]}>
              <View style={styles.coGuestHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Ionicons name="person" size={16} color={c.primary} />
                  <Text style={[styles.coGuestName, { color: c.text }]}>Primary Guest (You)</Text>
                </View>
                <Badge label="CLEARED" variant="success" />
              </View>
              <View style={styles.watchlistBanner}>
                <Ionicons name="shield-checkmark" size={12} color="#059669" />
                <Text style={styles.watchlistText}>AP Police Watchlist Check: CLEARED</Text>
              </View>
            </View>

            {/* Co-Occupants */}
            {coGuests.map((cg) => {
              const isAccepted = cg.status === 'accepted';
              const isDeclined = cg.status === 'declined';
              const isPending = cg.status === 'invited' || cg.status === 'pending';
              const isFlagged = cg.watchlistStatus === 'flagged';

              let badgeLabel = 'PENDING';
              let badgeVariant: 'warning' | 'success' | 'error' | 'secondary' = 'warning';
              if (isAccepted) {
                badgeLabel = 'ACCEPTED';
                badgeVariant = 'success';
              } else if (isDeclined) {
                badgeLabel = 'DECLINED';
                badgeVariant = 'error';
              } else if (cg.status === 'expired') {
                badgeLabel = 'EXPIRED';
                badgeVariant = 'secondary';
              }

              return (
                <View key={cg.id} style={[styles.coGuestItem, { borderBottomColor: c.border, borderBottomWidth: 1, paddingVertical: 8 }]}>
                  <View style={styles.coGuestHeader}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Ionicons name="people" size={16} color={c.textSecondary} />
                      <Text style={[styles.coGuestName, { color: c.text }]}>
                        {cg.name} ({cg.relationship})
                      </Text>
                    </View>
                    <Badge label={badgeLabel} variant={badgeVariant} />
                  </View>
                  <Text style={{ fontSize: 11, color: c.textMuted, marginLeft: 22, marginTop: -2 }}>
                    Mobile: {cg.phone}
                  </Text>

                  {/* Verification Status */}
                  <View style={{ marginTop: 6, marginLeft: 22 }}>
                    {isFlagged ? (
                      <View style={[styles.watchlistBanner, { backgroundColor: '#fef2f2', borderColor: '#fca5a5', borderWidth: 1 }]}>
                        <Ionicons name="alert-circle" size={12} color={c.error} />
                        <Text style={[styles.watchlistText, { color: c.error }]}>
                          Verification Status: REVIEW REQUIRED ({cg.watchlistMatchNotes || 'Profile mismatch'})
                        </Text>
                      </View>
                    ) : isAccepted || cg.isManualUpload ? (
                      <View style={styles.watchlistBanner}>
                        <Ionicons name="shield-checkmark" size={12} color="#059669" />
                        <Text style={styles.watchlistText}>SafeStay Status: VERIFIED</Text>
                      </View>
                    ) : (
                      <View style={[styles.watchlistBanner, { backgroundColor: '#fef3c7', borderColor: '#fcd34d', borderWidth: 1 }]}>
                        <Ionicons name="hourglass-outline" size={12} color="#b45309" />
                        <Text style={[styles.watchlistText, { color: '#b45309' }]}>
                          SafeStay Status: Awaiting Co-Guest Verification
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              );
            })}
          </Card>
        )}

        {/* High-Tech Digital QR Pass */}
        <Card style={styles.qrPassCard}>
          <View style={[styles.qrHeader, { borderBottomColor: c.border }]}>
            <Ionicons name="shield-outline" size={18} color={c.primary} />
            <Text style={[styles.qrTitle, { color: c.text }]}>SafeStay AP Secure Digital Pass</Text>
          </View>
          
          <View style={styles.qrContainer}>
            {/* Styled QR Design */}
            <View style={styles.qrCodeBorder}>
              <Ionicons name="qr-code" size={130} color={c.black} />
              <View style={styles.qrInnerLogo}>
                <Ionicons name="shield-checkmark" size={24} color="#1565c0" />
              </View>
            </View>
            <Text style={[styles.qrStatus, { color: '#059669' }]}>● ACTIVE / PRE-CLEARED</Text>
            <Text style={[styles.qrDesc, { color: c.textMuted }]}>
              Present this QR to the property owner upon arrival. The check-in timestamp will log automatically with local security.
            </Text>
          </View>
        </Card>

        {/* Property Contact Info */}
        <Card style={styles.detailsCard}>
          <Text style={[styles.sectionHeading, { color: c.text }]}>Property & Host Contact</Text>
          <Text style={[styles.contactDesc, { color: c.textMuted }]}>
            Contact the property manager for keys, directions, or parking allocation.
          </Text>
          
          <View style={styles.contactBtnRow}>
            <TouchableOpacity style={[styles.contactBtn, { backgroundColor: c.primary }]} onPress={handleCall}>
              <Ionicons name="call" size={16} color="#ffffff" />
              <Text style={styles.contactBtnText}>Call Host</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.contactBtn, { backgroundColor: '#25D366' }]} onPress={handleWhatsApp}>
              <Ionicons name="logo-whatsapp" size={16} color="#ffffff" />
              <Text style={styles.contactBtnText}>WhatsApp Chat</Text>
            </TouchableOpacity>
          </View>
        </Card>

        {/* Arrival Instructions */}
        <Card style={styles.detailsCard}>
          <Text style={[styles.sectionHeading, { color: c.text }]}>Arrival Instructions</Text>
          
          {[
            { step: '1', title: 'Navigate to Location', text: property ? `${property.address}, ${property.city}` : 'Check map coordinates listed on property details.' },
            { step: '2', title: 'Verify QR Code', text: 'Tapping checking-in: Show your Active SafeStay QR code (above) to the host. Host scans it via the Owner dashboard.' },
            { step: '3', title: 'Precinct Logging Completed', text: 'Once scanned, check-in registration reports immediately to the AP Police network for active safety tracking. Guest pass is logged.' }
          ].map((inst) => (
            <View key={inst.step} style={styles.instructionStep}>
              <View style={[styles.stepNumIcon, { backgroundColor: c.primaryLight }]}>
                <Text style={[styles.stepNumText, { color: c.primary }]}>{inst.step}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.stepTitleText, { color: c.text }]}>{inst.title}</Text>
                <Text style={[styles.stepBodyText, { color: c.textSecondary }]}>{inst.text}</Text>
              </View>
            </View>
          ))}
        </Card>

        {/* Cancellation Option (subtle) */}
        {['pending', 'confirmed'].includes(booking.status) && (
          <View style={{ paddingHorizontal: SPACING.md, marginTop: SPACING.sm }}>
            <Button
              title="Cancel Booking"
              variant="outline"
              onPress={handleCancel}
              loading={cancelMutation.isPending}
              fullWidth
            />
          </View>
        )}

        {/* Suggested Sponsored Offers / Sponsored Ads (visually quiet, highlighted, placed at bottom) */}
        <View style={styles.sponsorDividerContainer}>
          <View style={[styles.sponsorDividerLine, { backgroundColor: c.border }]} />
          <Text style={[styles.sponsorLabelText, { color: c.primary, fontWeight: '800' }]}>EXCLUSIVES FOR SAFESTAY RESIDENTS</Text>
          <View style={[styles.sponsorDividerLine, { backgroundColor: c.border }]} />
        </View>

        <View style={styles.sponsorSection}>
          {/* Ad 1 */}
          <View style={[styles.adCard, { backgroundColor: c.surface, borderColor: c.primary + '30', borderWidth: 1.5, ...SHADOW.sm }]}>
            <View style={styles.adBadgeContainer}>
              <View style={[styles.adBadgeTag, { backgroundColor: c.textMuted, marginRight: 6 }]}>
                <Text style={styles.adBadgeTagText}>SPONSORED</Text>
              </View>
              <View style={[styles.adBadgeTag, { backgroundColor: c.primary }]}>
                <Text style={styles.adBadgeTagText}>POLICE VERIFIED TRANSIT</Text>
              </View>
            </View>
            <View style={styles.adContent}>
              <Image 
                source={{ uri: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b6?w=200' }} 
                style={styles.adImage} 
                resizeMode="cover" 
              />
              <View style={{ flex: 1 }}>
                <Text style={[styles.adTitle, { color: c.text }]}>SafeTransit AP Cabs</Text>
                <Text style={[styles.adDescText, { color: c.textSecondary }]}>
                  Pre-book verified, GPS-patrolled cabs directly to your new PG. Zero cancellation guarantee.
                </Text>
              </View>
            </View>
            <View style={styles.adFooterRow}>
              <Text style={[styles.adOfferInfo, { color: c.secondary }]}>✓ Priority pickup enabled</Text>
              <TouchableOpacity 
                style={[styles.adActionBtn, { backgroundColor: c.primary }]}
                onPress={() => Alert.alert('SafeTransit AP', 'SafeTransit API Integration would open verified cab booking app here.')}
              >
                <Text style={{ color: '#ffffff', fontSize: 11, fontWeight: '700' }}>Book Now</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Ad 2 */}
          <View style={[styles.adCard, { backgroundColor: c.surface, borderColor: '#d9770630', borderWidth: 1.5, ...SHADOW.sm }]}>
            <View style={styles.adBadgeContainer}>
              <View style={[styles.adBadgeTag, { backgroundColor: c.textMuted, marginRight: 6 }]}>
                <Text style={styles.adBadgeTagText}>SPONSORED</Text>
              </View>
              <View style={[styles.adBadgeTag, { backgroundColor: '#d97706' }]}>
                <Text style={styles.adBadgeTagText}>INSTANT CONTRACT</Text>
              </View>
            </View>
            <View style={styles.adContent}>
              <Image 
                source={{ uri: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=200' }} 
                style={styles.adImage} 
                resizeMode="cover" 
              />
              <View style={{ flex: 1 }}>
                <Text style={[styles.adTitle, { color: c.text }]}>Aadhaar E-Sign Agreement</Text>
                <Text style={[styles.adDescText, { color: c.textSecondary }]}>
                  Generate legally certified digital tenant agreements with biometric safety approval.
                </Text>
              </View>
            </View>
            <View style={styles.adFooterRow}>
              <Text style={[styles.adOfferInfo, { color: '#d97706' }]}>✓ 100% paperless e-stamp</Text>
              <TouchableOpacity 
                style={[styles.adActionBtn, { backgroundColor: '#d97706' }]}
                onPress={() => Alert.alert('E-Sign Agreement', 'Aadhaar e-Sign gateway integration would open here.')}
              >
                <Text style={{ color: '#ffffff', fontSize: 11, fontWeight: '700' }}>Generate</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Ad 3 */}
          <View style={[styles.adCard, { backgroundColor: c.surface, borderColor: '#05966930', borderWidth: 1.5, ...SHADOW.sm }]}>
            <View style={styles.adBadgeContainer}>
              <View style={[styles.adBadgeTag, { backgroundColor: c.textMuted, marginRight: 6 }]}>
                <Text style={styles.adBadgeTagText}>SPONSORED</Text>
              </View>
              <View style={[styles.adBadgeTag, { backgroundColor: '#059669' }]}>
                <Text style={styles.adBadgeTagText}>EXCLUSIVE DISCOUNT</Text>
              </View>
            </View>
            <View style={styles.adContent}>
              <Image 
                source={{ uri: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=200' }} 
                style={styles.adImage} 
                resizeMode="cover" 
              />
              <View style={{ flex: 1 }}>
                <Text style={[styles.adTitle, { color: c.text }]}>Rentomojo Appliances</Text>
                <Text style={[styles.adDescText, { color: c.textSecondary }]}>
                  Get study desks, smart TVs, and single beds at 15% discount using code SAFESTAY15.
                </Text>
              </View>
            </View>
            <View style={styles.adFooterRow}>
              <Text style={[styles.adOfferInfo, { color: '#059669' }]}>✓ Flat 15% OFF for SafeStay</Text>
              <TouchableOpacity 
                style={[styles.adActionBtn, { backgroundColor: '#059669' }]}
                onPress={() => Alert.alert('Rentomojo Partner Offer', 'Rentomojo affiliate link would open.')}
              >
                <Text style={{ color: '#ffffff', fontSize: 11, fontWeight: '700' }}>Claim Offer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', minHeight: 250 },
  scrollContent: { paddingBottom: 40 },
  successBanner: {
    paddingVertical: SPACING.xl, paddingHorizontal: SPACING.md, alignItems: 'center',
    borderBottomLeftRadius: BORDER_RADIUS.lg, borderBottomRightRadius: BORDER_RADIUS.lg
  },
  successRing: {
    width: 68, height: 68, borderRadius: 34, backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.sm
  },
  successTitle: { color: '#ffffff', fontSize: FONT_SIZE.xxl, fontWeight: '800', marginBottom: 4 },
  successSubtitle: { color: 'rgba(255,255,255,0.9)', fontSize: 13, textAlign: 'center', marginBottom: SPACING.sm },
  policeVerifiedBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#ffffff',
    borderRadius: BORDER_RADIUS.full, paddingHorizontal: 12, paddingVertical: 4
  },
  policeVerifiedText: { color: '#059669', fontSize: 10, fontWeight: '800' },
  detailsCard: { marginHorizontal: SPACING.md, marginTop: SPACING.md, padding: SPACING.md },
  sectionHeading: { fontSize: FONT_SIZE.base, fontWeight: '700', marginBottom: SPACING.sm },
  confirmRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  confirmLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
  confirmValue: { fontSize: 13, maxWidth: '60%', textAlign: 'right' },
  qrPassCard: { marginHorizontal: SPACING.md, marginTop: SPACING.md, padding: SPACING.md, alignItems: 'center' },
  qrHeader: { flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, paddingBottom: 8, width: '100%', gap: 6, marginBottom: SPACING.md },
  qrTitle: { fontSize: 13, fontWeight: '700' },
  qrContainer: { alignItems: 'center', width: '100%' },
  qrCodeBorder: {
    borderWidth: 2, borderColor: '#e2e8f0', borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md, backgroundColor: '#ffffff', position: 'relative', marginBottom: 8
  },
  qrInnerLogo: {
    position: 'absolute', top: '50%', left: '50%', marginTop: -18, marginLeft: -18,
    width: 36, height: 36, borderRadius: 18, backgroundColor: '#ffffff',
    alignItems: 'center', justifyContent: 'center', shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 3, elevation: 2
  },
  qrStatus: { fontSize: 11, fontWeight: '800', marginBottom: 8 },
  qrDesc: { fontSize: 11, textAlign: 'center', lineHeight: 16, paddingHorizontal: SPACING.sm },
  contactDesc: { fontSize: 12, marginBottom: SPACING.md },
  contactBtnRow: { flexDirection: 'row', gap: SPACING.md },
  contactBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: BORDER_RADIUS.md, gap: 6 },
  contactBtnText: { color: '#ffffff', fontWeight: '700', fontSize: 13 },
  instructionStep: { flexDirection: 'row', gap: SPACING.md, marginTop: SPACING.md, alignItems: 'flex-start' },
  stepNumIcon: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  stepNumText: { fontSize: 12, fontWeight: '700' },
  stepTitleText: { fontSize: 13, fontWeight: '700', marginBottom: 2 },
  stepBodyText: { fontSize: 12, lineHeight: 18 },
  sponsorDividerContainer: { flexDirection: 'row', alignItems: 'center', marginHorizontal: SPACING.md, marginTop: SPACING.xl, marginBottom: SPACING.sm },
  sponsorDividerLine: { flex: 1, height: 1 },
  sponsorLabelText: { fontSize: 10, fontWeight: '800', letterSpacing: 1.2, paddingHorizontal: 10 },
  sponsorSection: { paddingHorizontal: SPACING.md, gap: SPACING.md },
  adCard: { borderRadius: BORDER_RADIUS.md, padding: SPACING.md, overflow: 'hidden' },
  adBadgeContainer: { flexDirection: 'row', justifyContent: 'flex-start', marginBottom: SPACING.xs },
  adBadgeTag: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4 },
  adBadgeTagText: { color: '#ffffff', fontSize: 8, fontWeight: '800', letterSpacing: 0.5 },
  adContent: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  adImage: { width: 70, height: 70, borderRadius: BORDER_RADIUS.sm, marginRight: 4 },
  adTitle: { fontSize: 14, fontWeight: '800', marginBottom: 2 },
  adDescText: { fontSize: 11, lineHeight: 15, flex: 1 },
  adFooterRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: SPACING.sm, borderTopWidth: 1, borderTopColor: '#f1f5f9', paddingTop: SPACING.xs },
  adOfferInfo: { fontSize: 10, fontWeight: '700' },
  adActionBtn: { borderRadius: BORDER_RADIUS.sm, paddingHorizontal: 12, paddingVertical: 6 },
  coGuestItem: { paddingVertical: SPACING.xs },
  coGuestHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  coGuestName: { fontSize: 13, fontWeight: '700' },
  watchlistBanner: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#e6f4ea', paddingHorizontal: 8, paddingVertical: 4, borderRadius: BORDER_RADIUS.sm, marginTop: 4 },
  watchlistText: { fontSize: 10, fontWeight: '700', color: '#065f46' },
});
