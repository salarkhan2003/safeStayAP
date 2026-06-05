import React from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../../src/store/authStore';
import { useThemeStore } from '../../src/store/themeStore';
import { propertiesApi, bookingsApi, notificationsApi } from '../../src/services/mockApi';
import { PropertyCard } from '../../src/components/property/PropertyCard';
import { PropertyCardSkeleton } from '../../src/components/ui/SkeletonLoader';
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

  // Modern minimalist, oversized touch targets for Quick Actions
  const quickActions = [
    { icon: 'search-sharp', label: 'Find Room', color: c.primary, onPress: () => router.push('/(guest)/search') },
    { icon: 'qr-code-sharp', label: 'Digital Pass', color: c.primary, onPress: () => router.push('/(guest)/guest-pass') },
    { icon: 'shield-sharp', label: 'SOS Alert', color: c.error, onPress: () => router.push('/(guest)/sos') },
    { icon: 'card-sharp', label: 'ID KYC', color: c.primary, onPress: () => router.push('/(guest)/kyc') },
    { icon: 'call-sharp', label: 'Contacts', color: c.primary, onPress: () => router.push('/(guest)/emergency-contacts') },
    { icon: 'alert-sharp', label: 'Incidents', color: c.primary, onPress: () => router.push('/(guest)/incidents') },
  ];

  return (
    <View style={[styles.container, { backgroundColor: c.background, paddingTop: insets.top }]}>
      {/* Top Header Row (Minimal, high-contrast) */}
      <View style={[styles.navbar, { borderBottomColor: c.border }]}>
        <View>
          <Text style={[styles.navSubtitle, { color: c.textSecondary }]}>SafeStay AP</Text>
          <Text style={[styles.navTitle, { color: c.text }]}>{user?.name || 'Guest User'}</Text>
        </View>
        <View style={styles.navActions}>
          <TouchableOpacity style={[styles.circleBtn, { backgroundColor: c.primaryLight }]} onPress={toggleTheme}>
            <Ionicons name={theme.isDark ? 'sunny-sharp' : 'moon-sharp'} size={20} color={c.text} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.circleBtn, { backgroundColor: c.primaryLight }]} onPress={() => router.push('/(guest)/notifications')}>
            <Ionicons name="notifications-sharp" size={20} color={c.text} />
            {unreadCount > 0 && (
              <View style={[styles.badgeDot, { backgroundColor: c.error }]} />
            )}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
        refreshControl={<RefreshControl refreshing={false} onRefresh={refetch} tintColor={c.text} />}
      >
        {/* Dynamic Contextual Main Hero Module (Intent-Driven) */}
        {user?.kycStatus !== 'verified' ? (
          /* State 1: KYC Pending / Incomplete - High-contrast Action Card */
          <View style={[styles.heroCard, { backgroundColor: c.primary, borderColor: c.primary }]}>
            <View style={{ flex: 1, paddingRight: 8 }}>
              <Text style={{ fontSize: 12, fontWeight: '800', color: c.white, opacity: 0.8, letterSpacing: 1, textTransform: 'uppercase' }}>Attention Required</Text>
              <Text style={{ fontSize: 20, fontWeight: '900', color: c.white, marginTop: 4, lineHeight: 26 }}>Complete Identity Verification</Text>
              <Text style={{ fontSize: 13, color: c.white, opacity: 0.9, marginTop: 8, lineHeight: 18 }}>
                AP State guidelines mandate verification before booking or occupying any room.
              </Text>
              
              <TouchableOpacity 
                style={[styles.primaryActionBtn, { backgroundColor: c.white, marginTop: 18 }]} 
                onPress={() => router.push('/(guest)/kyc')}
              >
                <Text style={{ color: c.black, fontWeight: '800', fontSize: 13 }}>Start Verification</Text>
                <Ionicons name="arrow-forward-sharp" size={16} color={c.black} />
              </TouchableOpacity>
            </View>
          </View>
        ) : activeBooking ? (
          /* State 2: Verified Guest with Active Booking */
          <View style={[styles.heroCard, { backgroundColor: c.surface, borderColor: c.border, borderWidth: 1 }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <View style={{ flex: 1, paddingRight: 16 }}>
                <Text style={{ fontSize: 11, fontWeight: '800', color: c.accent, letterSpacing: 1, textTransform: 'uppercase' }}>Active Stay</Text>
                <Text style={{ fontSize: 18, fontWeight: '900', color: c.text, marginTop: 4 }}>{activeBooking.propertyName}</Text>
                <Text style={{ fontSize: 13, color: c.textSecondary, marginTop: 4 }}>Room {activeBooking.roomNumber} • Active Stay</Text>
              </View>
              <View style={{ backgroundColor: c.success + '15', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 }}>
                <Text style={{ color: c.success, fontSize: 11, fontWeight: '800' }}>CHECKED IN</Text>
              </View>
            </View>
            
            <View style={{ height: 1, backgroundColor: c.border, marginVertical: 16 }} />
            
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity 
                style={[styles.actionBtnOutline, { flex: 1, borderColor: c.border, backgroundColor: c.primaryLight }]}
                onPress={() => router.push('/(guest)/guest-pass')}
              >
                <Ionicons name="qr-code-sharp" size={16} color={c.text} />
                <Text style={{ color: c.text, fontWeight: '700', fontSize: 13 }}>Digital Pass</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.actionBtnOutline, { flex: 1, borderColor: c.error, backgroundColor: c.error + '10' }]}
                onPress={() => router.push('/(guest)/sos')}
              >
                <Ionicons name="shield-sharp" size={16} color={c.error} />
                <Text style={{ color: c.error, fontWeight: '700', fontSize: 13 }}>SOS Alert</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          /* State 3: Verified Guest ready to Book */
          <View style={[styles.heroCard, { backgroundColor: c.surface, borderColor: c.border, borderWidth: 1 }]}>
            <Text style={{ fontSize: 11, fontWeight: '800', color: c.secondary, letterSpacing: 1, textTransform: 'uppercase' }}>Ready to Book</Text>
            <Text style={{ fontSize: 20, fontWeight: '900', color: c.text, marginTop: 4, lineHeight: 26 }}>Find your next verified PG or Hotel</Text>
            <Text style={{ fontSize: 13, color: c.textSecondary, marginTop: 6, lineHeight: 18 }}>
              Search through thousands of government-verified, high-safety lodgings in Andhra Pradesh.
            </Text>
            
            <TouchableOpacity 
              style={[styles.primaryActionBtn, { backgroundColor: c.primary, marginTop: 18 }]} 
              onPress={() => router.push('/(guest)/search')}
            >
              <Text style={{ color: c.white, fontWeight: '800', fontSize: 13 }}>Search Accommodations</Text>
              <Ionicons name="search-sharp" size={16} color={c.white} />
            </TouchableOpacity>
          </View>
        )}

        {/* Quick Actions (Minimalist grid, oversized touch boundaries) */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: c.text }]}>Actions</Text>
          <View style={styles.quickGrid}>
            {quickActions.map(action => (
              <TouchableOpacity
                key={action.label}
                style={[styles.quickAction, { backgroundColor: c.surface, borderColor: c.border, borderWidth: 1 }]}
                onPress={action.onPress}
                accessibilityRole="button"
                accessibilityLabel={action.label}
              >
                <View style={[styles.quickIcon, { backgroundColor: action.color === c.error ? c.error + '10' : c.primaryLight }]}>
                  <Ionicons name={action.icon as any} size={22} color={action.color} />
                </View>
                <Text style={[styles.quickLabel, { color: c.text }]}>{action.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Verified Properties Feed */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: c.text, marginBottom: 0 }]}>Nearby Verified Stays</Text>
            <TouchableOpacity onPress={() => router.push('/(guest)/search')}>
              <Text style={{ fontSize: 13, fontWeight: '700', color: c.secondary }}>See All</Text>
            </TouchableOpacity>
          </View>

          {propertiesLoading ? (
            <View style={{ gap: 16 }}>
              <PropertyCardSkeleton />
              <PropertyCardSkeleton />
            </View>
          ) : (
            <View style={{ gap: 16 }}>
              {properties?.slice(0, 3).map(property => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  navbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  navSubtitle: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  navTitle: {
    fontSize: 20,
    fontWeight: '900',
    marginTop: 2,
  },
  navActions: {
    flexDirection: 'row',
    gap: 10,
  },
  circleBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  badgeDot: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  heroCard: {
    margin: 20,
    padding: 24,
    borderRadius: 24,
  },
  primaryActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 52,
    borderRadius: 16,
    paddingHorizontal: 20,
    alignSelf: 'flex-start',
  },
  actionBtnOutline: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 16,
  },
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickAction: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 18,
    gap: 12,
  },
  quickIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickLabel: {
    fontSize: 13,
    fontWeight: '700',
  },
});
