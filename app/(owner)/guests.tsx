import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity, Alert, Modal, TextInput, ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '../../src/store/authStore';
import { useThemeStore } from '../../src/store/themeStore';
import { propertiesApi, bookingsApi, guestsApi, coGuestsApi } from '../../src/services/mockApi';
import { Card } from '../../src/components/ui/Card';
import { Badge } from '../../src/components/ui/Badge';
import { Input } from '../../src/components/ui/Input';
import { Button } from '../../src/components/ui/Button';
import { EmptyState } from '../../src/components/ui/EmptyState';
import { BORDER_RADIUS, FONT_SIZE, SPACING } from '../../src/constants/theme';
import type { Booking } from '../../src/types';

type TabType = 'pending' | 'active' | 'all';

function BookingCoGuestsList({ bookingId, themeColors }: { bookingId: string; themeColors: any }) {
  const c = themeColors;
  const queryClient = useQueryClient();
  const [modalVisible, setModalVisible] = useState(false);
  
  // States for manual registration form
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [relation, setRelation] = useState('Friend');
  const [idType, setIdType] = useState('aadhaar');
  const [idNumber, setIdNumber] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { data: coGuests } = useQuery({
    queryKey: ['ownerBookingCoGuests', bookingId],
    queryFn: () => coGuestsApi.getByBooking(bookingId),
    enabled: !!bookingId,
  });

  const handleAddManual = async () => {
    if (!name.trim() || !phone.trim() || !idNumber.trim()) {
      Alert.alert('Required Fields', 'Please fill name, phone, and ID number.');
      return;
    }
    setSubmitting(true);
    try {
      await coGuestsApi.addManualCoGuest(bookingId, {
        name,
        phone,
        relationship: relation,
        idType: idType as any,
        idNumber,
      });
      queryClient.invalidateQueries({ queryKey: ['ownerBookingCoGuests', bookingId] });
      setModalVisible(false);
      setName('');
      setPhone('');
      setRelation('Friend');
      setIdType('aadhaar');
      setIdNumber('');
      Alert.alert('Success', 'Co-guest occupant registered and verification logged.');
    } catch (e) {
      Alert.alert('Error', 'Failed to register co-guest.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={{ marginTop: 10, borderTopWidth: 1, borderTopColor: c.border, paddingTop: 10 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <Text style={{ fontSize: 11, fontWeight: '700', color: c.textMuted }}>CO-OCCUPANTS ({coGuests?.length || 0})</Text>
        <TouchableOpacity 
          style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}
          onPress={() => setModalVisible(true)}
        >
          <Ionicons name="add-circle" size={14} color={c.primary} />
          <Text style={{ fontSize: 11, fontWeight: '700', color: c.primary }}>Register Co-Guest</Text>
        </TouchableOpacity>
      </View>

      {coGuests && coGuests.map((cg) => {
        const isFlagged = cg.watchlistStatus === 'flagged';
        const isAccepted = cg.status === 'accepted';
        return (
          <View key={cg.id} style={{ paddingVertical: 4, paddingHorizontal: 6, borderRadius: BORDER_RADIUS.sm, backgroundColor: c.border + '20', marginBottom: 4 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ fontSize: 12, fontWeight: '600', color: c.text }}>
                {cg.name} ({cg.relationship})
              </Text>
              <Badge 
                label={isFlagged ? 'FLAGGED' : isAccepted || cg.isManualUpload ? 'CLEARED' : 'PENDING'} 
                variant={isFlagged ? 'error' : (isAccepted || cg.isManualUpload) ? 'success' : 'warning'} 
                size="sm"
              />
            </View>
            {isFlagged && (
              <Text style={{ fontSize: 10, fontWeight: '700', color: c.error, marginTop: 2 }}>
                ⚠️ SECURITY REVIEW ALERT: {cg.watchlistMatchNotes || 'Verification review needed!'}
              </Text>
            )}
          </View>
        );
      })}

      {/* Modal for Manual Registration */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: c.surface, borderTopLeftRadius: BORDER_RADIUS.lg, borderTopRightRadius: BORDER_RADIUS.lg, padding: SPACING.md, maxHeight: '80%' }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.md }}>
              <Text style={{ fontSize: 16, fontWeight: '700', color: c.text }}>Manual Co-Guest Setup</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={c.text} />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={{ paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
              <Text style={{ fontSize: 11, color: c.textMuted, marginBottom: 12 }}>
                Verify identity documents physically and register occupants below.
              </Text>

              <Text style={styles.formLabel}>Full Name</Text>
              <TextInput
                style={[styles.formInput, { borderColor: c.border, color: c.text }]}
                value={name}
                onChangeText={setName}
                placeholder="Enter guest full name"
                placeholderTextColor={c.textMuted}
              />

              <Text style={styles.formLabel}>Mobile Number</Text>
              <TextInput
                style={[styles.formInput, { borderColor: c.border, color: c.text }]}
                value={phone}
                onChangeText={setPhone}
                placeholder="+91 9XXXX XXXXX"
                placeholderTextColor={c.textMuted}
                keyboardType="phone-pad"
              />

              <Text style={styles.formLabel}>Relationship</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginVertical: 6 }}>
                {['Spouse', 'Parent', 'Brother', 'Sister', 'Friend', 'Child'].map(r => (
                  <TouchableOpacity
                    key={r}
                    style={[styles.relationChip, { borderColor: relation === r ? c.primary : c.border, backgroundColor: relation === r ? c.primary + '10' : 'transparent' }]}
                    onPress={() => setRelation(r)}
                  >
                    <Text style={{ fontSize: 12, color: relation === r ? c.primary : c.textSecondary }}>{r}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.formLabel}>ID Document Type</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginVertical: 6 }}>
                {['aadhaar', 'pan', 'passport'].map(t => (
                  <TouchableOpacity
                    key={t}
                    style={[styles.relationChip, { borderColor: idType === t ? c.primary : c.border, backgroundColor: idType === t ? c.primary + '10' : 'transparent' }]}
                    onPress={() => setIdType(t)}
                  >
                    <Text style={{ fontSize: 12, color: idType === t ? c.primary : c.textSecondary }}>{t.toUpperCase()}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.formLabel}>ID Number</Text>
              <TextInput
                style={[styles.formInput, { borderColor: c.border, color: c.text }]}
                value={idNumber}
                onChangeText={setIdNumber}
                placeholder="Enter ID document number"
                placeholderTextColor={c.textMuted}
                autoCapitalize="characters"
              />

              <Button
                title={submitting ? 'Running Security Check...' : 'Register Guest & Verify Security Status'}
                onPress={handleAddManual}
                disabled={submitting}
                style={{ marginTop: 16 }}
              />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

export default function OwnerGuestsScreen() {
  const { user } = useAuthStore();
  const { theme } = useThemeStore();
  const c = theme.colors;
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<TabType>('pending');
  const [search, setSearch] = useState('');

  const { data: allBookings, isLoading, refetch } = useQuery({
    queryKey: ['all-bookings-owner', user?.id],
    queryFn: async () => {
      const props = await propertiesApi.getByOwner(user?.id || '');
      const arrays = await Promise.all(props.map(p => bookingsApi.getByProperty(p.id)));
      return arrays.flat();
    },
    enabled: !!user?.id,
  });

  const approveMutation = useMutation({
    mutationFn: bookingsApi.approve,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-bookings-owner'] });
      Alert.alert('Approved', 'Booking has been approved. Guest will be notified.');
    },
  });

  const cancelMutation = useMutation({
    mutationFn: bookingsApi.cancel,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-bookings-owner'] });
      Alert.alert('Declined', 'Booking request has been declined.');
    },
  });

  const checkInMutation = useMutation({
    mutationFn: bookingsApi.checkIn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-bookings-owner'] });
      Alert.alert('Checked In', 'Guest has been checked in successfully.');
    },
  });

  const checkOutMutation = useMutation({
    mutationFn: bookingsApi.checkOut,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-bookings-owner'] });
      Alert.alert('Checked Out', 'Guest has been checked out.');
    },
  });

  const filtered = (allBookings || []).filter(b => {
    const matchTab =
      activeTab === 'all' ? true :
      activeTab === 'pending' ? b.status === 'pending' :
      activeTab === 'active' ? b.status === 'checked_in' || b.status === 'confirmed' : true;
    const matchSearch = !search || b.propertyName.toLowerCase().includes(search.toLowerCase()) ||
      b.roomNumber.includes(search) || b.guestId.includes(search);
    return matchTab && matchSearch;
  });

  const renderBooking = ({ item: booking }: { item: Booking }) => {
    const statusColors: Record<string, 'warning' | 'info' | 'success' | 'secondary' | 'error'> = {
      pending: 'warning',
      confirmed: 'info',
      checked_in: 'success',
      checked_out: 'secondary',
      cancelled: 'error',
    };
    return (
      <Card style={styles.bookingCard}>
        <View style={styles.bookingHeader}>
          <View style={[styles.guestAvatar, { backgroundColor: c.primary + '20' }]}>
            <Ionicons name="person" size={20} color={c.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.guestId, { color: c.text }]}>Guest ID: {booking.guestId}</Text>
            <Text style={[styles.bookingInfo, { color: c.textMuted }]}>
              {booking.propertyName} · Room {booking.roomNumber}
            </Text>
          </View>
          <Badge label={booking.status.replace('_', ' ')} variant={statusColors[booking.status]} size="sm" />
        </View>

        <View style={styles.datesRow}>
          <Text style={[styles.dateText, { color: c.textSecondary }]}>
            {new Date(booking.checkIn).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })} →{' '}
            {new Date(booking.checkOut).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
          </Text>
          <Text style={[styles.amountText, { color: c.primary }]}>
            ₹{booking.totalAmount.toLocaleString()}
          </Text>
        </View>

        <BookingCoGuestsList bookingId={booking.id} themeColors={c} />

        {/* Action Buttons */}
        <View style={styles.actionRow}>
          {booking.status === 'pending' && (
            <>
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: c.success + '15', borderColor: c.success }]}
                onPress={() => approveMutation.mutate(booking.id)}
              >
                <Ionicons name="checkmark" size={16} color={c.success} />
                <Text style={[styles.actionText, { color: c.success }]}>Approve</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: c.error + '15', borderColor: c.error }]}
                onPress={() => cancelMutation.mutate(booking.id)}
              >
                <Ionicons name="close" size={16} color={c.error} />
                <Text style={[styles.actionText, { color: c.error }]}>Decline</Text>
              </TouchableOpacity>
            </>
          )}
          {booking.status === 'confirmed' && (
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: c.primary + '15', borderColor: c.primary }]}
              onPress={() => checkInMutation.mutate(booking.id)}
            >
              <Ionicons name="enter-outline" size={16} color={c.primary} />
              <Text style={[styles.actionText, { color: c.primary }]}>Check In</Text>
            </TouchableOpacity>
          )}
          {booking.status === 'checked_in' && (
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: c.warning + '15', borderColor: c.warning }]}
              onPress={() => checkOutMutation.mutate(booking.id)}
            >
              <Ionicons name="exit-outline" size={16} color={c.warning} />
              <Text style={[styles.actionText, { color: c.warning }]}>Check Out</Text>
            </TouchableOpacity>
          )}
        </View>
      </Card>
    );
  };

  const tabs: { key: TabType; label: string; count: number }[] = [
    { key: 'pending', label: 'Pending', count: allBookings?.filter(b => b.status === 'pending').length || 0 },
    { key: 'active', label: 'Active', count: allBookings?.filter(b => ['confirmed', 'checked_in'].includes(b.status)).length || 0 },
    { key: 'all', label: 'All', count: allBookings?.length || 0 },
  ];

  return (
    <View style={[styles.container, { backgroundColor: c.background, paddingTop: insets.top }]}>
      <View style={[styles.header, { backgroundColor: c.surface, borderBottomColor: c.border }]}>
        <Text style={[styles.title, { color: c.text }]}>Guests & Bookings</Text>
      </View>

      <View style={[styles.searchSection, { backgroundColor: c.surface }]}>
        <Input
          placeholder="Search by guest ID, property, room..."
          value={search}
          onChangeText={setSearch}
          leftIcon="search-outline"
          containerStyle={{ marginBottom: 0 }}
        />
      </View>

      {/* Tabs */}
      <View style={[styles.tabs, { backgroundColor: c.surface, borderBottomColor: c.border }]}>
        {tabs.map(tab => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && { borderBottomColor: c.primary, borderBottomWidth: 2 }]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Text style={[styles.tabText, { color: activeTab === tab.key ? c.primary : c.textMuted }]}>
              {tab.label}
            </Text>
            {tab.count > 0 && (
              <View style={[styles.tabBadge, { backgroundColor: activeTab === tab.key ? c.primary : c.border }]}>
                <Text style={[styles.tabBadgeText, { color: activeTab === tab.key ? '#fff' : c.textMuted }]}>
                  {tab.count}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        renderItem={renderBooking}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState
            icon="people-outline"
            title={activeTab === 'pending' ? 'No Pending Bookings' : 'No Guests'}
            description={activeTab === 'pending' ? 'New booking requests will appear here.' : 'Guest records will appear here.'}
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: SPACING.md, borderBottomWidth: 1 },
  title: { fontSize: FONT_SIZE.xl, fontWeight: '700' },
  searchSection: { padding: SPACING.md, paddingBottom: SPACING.sm },
  tabs: { flexDirection: 'row', borderBottomWidth: 1 },
  tab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.xs, paddingVertical: SPACING.md },
  tabText: { fontSize: FONT_SIZE.sm, fontWeight: '600' },
  tabBadge: { paddingHorizontal: SPACING.xs, paddingVertical: 2, borderRadius: BORDER_RADIUS.full },
  tabBadgeText: { fontSize: 10, fontWeight: '700' },
  list: { padding: SPACING.md },
  bookingCard: { marginBottom: SPACING.md },
  bookingHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.md, marginBottom: SPACING.sm },
  guestAvatar: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  guestId: { fontSize: FONT_SIZE.base, fontWeight: '600', marginBottom: 4 },
  bookingInfo: { fontSize: FONT_SIZE.sm },
  datesRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.sm },
  dateText: { fontSize: FONT_SIZE.sm },
  amountText: { fontSize: FONT_SIZE.base, fontWeight: '700' },
  actionRow: { flexDirection: 'row', gap: SPACING.sm },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderRadius: BORDER_RADIUS.full, borderWidth: 1 },
  actionText: { fontSize: FONT_SIZE.sm, fontWeight: '600' },
  formLabel: { fontSize: 11, fontWeight: '700', marginTop: 8, color: '#334155' },
  formInput: { borderWidth: 1, borderRadius: BORDER_RADIUS.md, height: 40, paddingHorizontal: 12, fontSize: 13, marginTop: 4 },
  relationChip: { borderWidth: 1, borderRadius: BORDER_RADIUS.full, paddingHorizontal: 12, paddingVertical: 6 },
});
