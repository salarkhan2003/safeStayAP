import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  Image, TouchableOpacity, Alert, Modal, FlatList, TextInput,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../../../src/store/authStore';
import { useThemeStore } from '../../../src/store/themeStore';
import { propertiesApi, bookingsApi, guestsApi, travelersApi, coGuestsApi, mockSavedTravelers } from '../../../src/services/mockApi';
import { Header } from '../../../src/components/ui/Header';
import { Badge } from '../../../src/components/ui/Badge';
import { Button } from '../../../src/components/ui/Button';
import { Card } from '../../../src/components/ui/Card';
import { Skeleton } from '../../../src/components/ui/SkeletonLoader';
import { BORDER_RADIUS, FONT_SIZE, SPACING, SHADOW } from '../../../src/constants/theme';

export default function PropertyDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuthStore();
  const { theme } = useThemeStore();
  const c = theme.colors;
  const queryClient = useQueryClient();

  const [bookingLoading, setBookingLoading] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [roomDropdownVisible, setRoomDropdownVisible] = useState(false);
  const [guestCount, setGuestCount] = useState(1);

  // Co-guest verification states
  const [coGuests, setCoGuests] = useState<Array<{ name: string; phone: string; email?: string; relationship: string; idType: string; idNumber: string; isManual: boolean; photo?: string; idDoc?: string; isConfirmed: boolean }>>([]);
  const [activeSetupSlotIdx, setActiveSetupSlotIdx] = useState<number | null>(null);
  const [setupMethod, setSetupMethod] = useState<'saved' | 'invite' | 'manual' | null>(null);
  const [scanLoading, setScanLoading] = useState(false);
  const [scanSuccess, setScanSuccess] = useState(false);

  // Setup form fields
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [sendQuickLink, setSendQuickLink] = useState(true);
  const [formRelationship, setFormRelationship] = useState('Friend');
  const [formCustomRelationship, setFormCustomRelationship] = useState('');
  const [formIdType, setFormIdType] = useState('aadhaar');
  const [formIdNumber, setFormIdNumber] = useState('');
  const [formPhoto, setFormPhoto] = useState('');
  const [formIdDoc, setFormIdDoc] = useState('');

  // Sync coGuests list count with guestCount - 1
  useEffect(() => {
    const needed = Math.max(0, guestCount - 1);
    setCoGuests(prev => {
      if (prev.length === needed) return prev;
      if (prev.length < needed) {
        const added = Array.from({ length: needed - prev.length }, () => ({
          name: '',
          phone: '',
          relationship: 'Friend',
          idType: 'aadhaar',
          idNumber: '',
          isManual: false,
          isConfirmed: false,
        }));
        return [...prev, ...added];
      } else {
        return prev.slice(0, needed);
      }
    });
  }, [guestCount]);

  // Date Pickers State
  const [checkInDate, setCheckInDate] = useState<Date>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1); // Tomorrow
    return d;
  });
  const [checkOutDate, setCheckOutDate] = useState<Date>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 31); // 30 Days stay
    return d;
  });
  
  const [checkInTime, setCheckInTime] = useState('10:00 AM');
  const [checkOutTime, setCheckOutTime] = useState('12:00 PM');
  
  const [activePicker, setActivePicker] = useState<'inDate' | 'outDate' | 'inTime' | 'outTime' | null>(null);

  // Query property & rooms
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

  // Query Guest Profile for Emergency Contact Preview
  const { data: guestProfile } = useQuery({
    queryKey: ['guestProfile', user?.id],
    queryFn: () => guestsApi.getById(user?.id || ''),
    enabled: !!user?.id,
  });

  // Default selected room when rooms are loaded
  useEffect(() => {
    if (rooms && rooms.length > 0 && !selectedRoomId) {
      const firstAvailable = rooms.find(r => r.status === 'available');
      if (firstAvailable) {
        setSelectedRoomId(firstAvailable.id);
      } else {
        setSelectedRoomId(rooms[0].id);
      }
    }
  }, [rooms]);

  const selectedRoom = rooms?.find(r => r.id === selectedRoomId);

  // Calculate stay duration
  const stayDurationDays = Math.max(
    1,
    Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24))
  );

  // Emergency contact preview fallback
  const emergencyContact = guestProfile?.emergencyContacts?.[0] || {
    name: 'Ramesh Prasad',
    relationship: 'Father',
    phone: '+91 9012345678',
  };

  // SafeStay police verification fee
  const policeVerificationFee = 99;
  const maintenanceFee = 450;
  
  // Rent computation
  const baseRent = selectedRoom
    ? Math.round((selectedRoom.pricePerMonth / 30) * stayDurationDays)
    : 0;
  const totalPayable = baseRent + maintenanceFee;
  const handleIncrement = () => {
    const maxCapacity = selectedRoom?.capacity || 3;
    if (guestCount >= maxCapacity) {
      Alert.alert(
        'Occupancy Limit Reached',
        `This Room (${selectedRoom?.roomNumber ? 'Room ' + selectedRoom.roomNumber : 'Selected Room'}) has a maximum capacity of ${maxCapacity} guest${maxCapacity > 1 ? 's' : ''}.\n\nIf you want to add more guests, please select a Double, Triple or Dormitory room type from the "Select Room Type" list above first.`
      );
      return;
    }
    setGuestCount(prev => prev + 1);
  };

  const handleDecrement = () => {
    setGuestCount(prev => Math.max(1, prev - 1));
  };

  const handleBook = async () => {
    if (!selectedRoom || !property) {
      Alert.alert('Error', 'Please select a room to book.');
      return;
    }

    // Validate that if guestCount > 1, all co-guests slots are set up
    const unconfirmedCount = coGuests.filter(cg => !cg.isConfirmed).length;
    if (guestCount > 1 && unconfirmedCount > 0) {
      Alert.alert(
        'Setup Co-Guests',
        `Please complete the profile setup or invitation for all ${guestCount - 1} co-guests before booking.`
      );
      return;
    }

    setBookingLoading(true);
    try {
      const newBooking = await bookingsApi.create({
        guestId: user?.id,
        propertyId: property.id,
        roomId: selectedRoom.id,
        propertyName: property.name,
        roomNumber: selectedRoom.roomNumber,
        checkIn: `${checkInDate.toISOString().split('T')[0]}T${checkInTime === '10:00 AM' ? '10:00:00' : '12:00:00'}Z`,
        checkOut: `${checkOutDate.toISOString().split('T')[0]}T${checkOutTime === '12:00 PM' ? '12:00:00' : '11:00:00'}Z`,
        totalAmount: totalPayable,
        guestCount: guestCount,
        specialRequests: `Shared with emergency contact: ${emergencyContact.name} (${emergencyContact.relationship})`,
      });

      // Submit co-guests to the mock database
      for (const cg of coGuests) {
        if (cg.isConfirmed) {
          if (cg.isManual) {
            await coGuestsApi.addManualCoGuest(newBooking.id, {
              name: cg.name,
              phone: cg.phone,
              relationship: cg.relationship,
              idType: cg.idType as any,
              idNumber: cg.idNumber,
              photoUrl: cg.photo,
              idDocUrl: cg.idDoc,
            });
          } else {
            await coGuestsApi.inviteCoGuest(newBooking.id, {
              name: cg.name,
              phone: cg.phone,
              relationship: cg.relationship,
              idType: cg.idType as any,
              idNumber: cg.idNumber,
              primaryGuestName: user?.name || 'Primary Guest',
            });
          }
        }
      }

      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      
      // Navigate to Booking Successful Screen
      router.replace(`/(guest)/booking/${newBooking.id}`);
    } catch (e) {
      Alert.alert('Error', 'Failed to complete booking. Please try again.');
    } finally {
      setBookingLoading(false);
    }
  };

  // Custom date selection logic
  const handleDateSelect = (date: Date) => {
    if (activePicker === 'inDate') {
      setCheckInDate(date);
      // Ensure checkout is after checkin
      if (checkOutDate <= date) {
        const nextDay = new Date(date);
        nextDay.setDate(nextDay.getDate() + 30);
        setCheckOutDate(nextDay);
      }
    } else if (activePicker === 'outDate') {
      if (date <= checkInDate) {
        Alert.alert('Invalid Date', 'Check-out date must be after check-in date.');
        return;
      }
      setCheckOutDate(date);
    }
    setActivePicker(null);
  };

  const handleSelectSaved = (saved: any) => {
    setCoGuests(prev => {
      const copy = [...prev];
      copy[activeSetupSlotIdx!] = {
        name: saved.name,
        phone: saved.phone,
        relationship: saved.relationship,
        idType: saved.idType,
        idNumber: saved.idNumber,
        isManual: true, // Mark verified
        isConfirmed: true,
      };
      return copy;
    });
    setSetupMethod(null);
    setActiveSetupSlotIdx(null);
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: c.background }]}>
        <Header title="SafeStay Booking Details" showBack />
        <ScrollView style={{ padding: SPACING.md }}>
          <Skeleton height={240} borderRadius={16} style={{ marginBottom: SPACING.md }} />
          <Skeleton height={32} width="75%" style={{ marginBottom: SPACING.sm }} />
          <Skeleton height={20} width="50%" style={{ marginBottom: SPACING.md }} />
          <Skeleton height={150} style={{ marginBottom: SPACING.md }} />
          <Skeleton height={80} style={{ marginBottom: SPACING.md }} />
        </ScrollView>
      </View>
    );
  }

  if (!property) {
    return (
      <View style={[styles.container, { backgroundColor: c.background }]}>
        <Header title="Property Not Found" showBack />
        <Text style={{ textAlign: 'center', marginTop: 40, color: c.textMuted }}>Accommodation details could not be loaded.</Text>
      </View>
    );
  }

  // Pre-generate lists for selectors
  const timeOptions = ['08:00 AM', '10:00 AM', '12:00 PM', '02:00 PM', '04:00 PM', '06:00 PM', '08:00 PM'];
  
  const dateOptions: Date[] = [];
  const startDay = activePicker === 'outDate' ? checkInDate : new Date();
  for (let i = 1; i <= 30; i++) {
    const next = new Date(startDay);
    next.setDate(startDay.getDate() + i);
    dateOptions.push(next);
  }

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <Header title="SafeStay Booking Details" showBack />
      
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Photos Carousels */}
        <View style={styles.imageSection}>
          <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false}>
            {property.images.map((img, idx) => (
              <View key={idx} style={styles.imageWrapper}>
                <Image source={{ uri: img }} style={styles.image} resizeMode="cover" />
              </View>
            ))}
          </ScrollView>
          <LinearGradient colors={['transparent', 'rgba(0,0,0,0.65)']} style={styles.imageOverlay} />
          
          <View style={styles.topBadgeRow}>
            {property.verificationStatus === 'verified' && (
              <View style={styles.policeBadge}>
                <Ionicons name="shield-checkmark" size={16} color="#ffffff" />
                <Text style={styles.policeBadgeText}>AP Police Verified</Text>
              </View>
            )}
            <Badge label={property.type.toUpperCase()} variant="success" />
          </View>

          <View style={styles.ratingFloating}>
            <Ionicons name="star" size={14} color="#FFC107" />
            <Text style={styles.ratingText}>{property.rating} ({property.reviewCount} audits)</Text>
          </View>
        </View>

        {/* Core Info */}
        <View style={styles.infoBlock}>
          <Text style={[styles.title, { color: c.text }]}>{property.name}</Text>
          <View style={styles.locationRow}>
            <Ionicons name="location" size={16} color={c.primary} />
            <Text style={[styles.locationText, { color: c.textSecondary }]}>
              {property.address}, {property.city}, {property.state}
            </Text>
          </View>
        </View>

        {/* Date & Time Selectors */}
        <Card style={styles.sectionCard}>
          <Text style={[styles.sectionHeading, { color: c.text }]}>
            <Ionicons name="calendar-outline" size={18} color={c.primary} /> Stay Duration & Dates
          </Text>
          
          <View style={styles.dateTimeGrid}>
            {/* Check-In */}
            <View style={styles.dateTimeField}>
              <Text style={[styles.fieldLabel, { color: c.textMuted }]}>CHECK-IN DATE</Text>
              <TouchableOpacity 
                style={[styles.pickerBtn, { borderColor: c.border }]} 
                onPress={() => setActivePicker('inDate')}
              >
                <Ionicons name="calendar" size={16} color={c.primary} />
                <Text style={[styles.pickerBtnText, { color: c.text }]}>
                  {checkInDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.pickerBtn, { borderColor: c.border, marginTop: 6 }]} 
                onPress={() => setActivePicker('inTime')}
              >
                <Ionicons name="time" size={16} color={c.primary} />
                <Text style={[styles.pickerBtnText, { color: c.text }]}>{checkInTime}</Text>
              </TouchableOpacity>
            </View>

            {/* Check-Out */}
            <View style={styles.dateTimeField}>
              <Text style={[styles.fieldLabel, { color: c.textMuted }]}>CHECK-OUT DATE</Text>
              <TouchableOpacity 
                style={[styles.pickerBtn, { borderColor: c.border }]} 
                onPress={() => setActivePicker('outDate')}
              >
                <Ionicons name="calendar" size={16} color={c.primary} />
                <Text style={[styles.pickerBtnText, { color: c.text }]}>
                  {checkOutDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.pickerBtn, { borderColor: c.border, marginTop: 6 }]} 
                onPress={() => setActivePicker('outTime')}
              >
                <Ionicons name="time" size={16} color={c.primary} />
                <Text style={[styles.pickerBtnText, { color: c.text }]}>{checkOutTime}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Stay Duration Pill */}
          <View style={styles.durationRow}>
            <View style={[styles.durationBadge, { backgroundColor: c.primaryLight }]}>
              <Text style={[styles.durationBadgeText, { color: c.primary }]}>
                Stay Duration: {stayDurationDays} {stayDurationDays === 1 ? 'Day' : 'Days'}
              </Text>
            </View>
          </View>
        </Card>

        {/* Room Selection & Availability */}
        <Card style={styles.sectionCard}>
          <Text style={[styles.sectionHeading, { color: c.text }]}>
            <Ionicons name="bed-outline" size={18} color={c.primary} /> Select Room Type
          </Text>
          <Text style={[styles.sectionSub, { color: c.textMuted }]}>Real-time occupant metrics synced with AP SafeStay grid</Text>
          
          {(() => {
            const sRoom = rooms?.find(r => r.id === selectedRoomId);
            return (
              <TouchableOpacity 
                style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: c.border, borderRadius: BORDER_RADIUS.md, padding: 14, marginTop: 12 }}
                onPress={() => setRoomDropdownVisible(true)}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <View style={{ backgroundColor: c.primary + '15', padding: 8, borderRadius: 8 }}>
                    <Ionicons name="bed" size={18} color={c.primary} />
                  </View>
                  <View>
                    <Text style={{ fontSize: 15, fontWeight: '700', color: c.text }}>
                      {sRoom ? `Room ${sRoom.roomNumber} (${sRoom.type})` : 'Select a Room'}
                    </Text>
                    {sRoom && (
                      <Text style={{ fontSize: 12, color: c.textMuted, marginTop: 2 }}>
                        ₹{sRoom.pricePerMonth.toLocaleString()} • {sRoom.capacity - sRoom.currentOccupancy} Vacant
                      </Text>
                    )}
                  </View>
                </View>
                <Ionicons name="chevron-down" size={20} color={c.textSecondary} />
              </TouchableOpacity>
            );
          })()}
        </Card>

        {/* Number of Guests */}
        <View style={{ marginHorizontal: 16, marginTop: 16, backgroundColor: c.surface, borderRadius: 20, padding: 16, borderWidth: 1, borderColor: c.border, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={{ flex: 1, paddingRight: 16 }}>
              <Text style={{ fontSize: 16, fontWeight: '800', color: c.text, marginBottom: 4 }}>
                <Ionicons name="people" size={16} color={c.primary} /> Number of Guests
              </Text>
              <Text style={{ fontSize: 12, color: c.textSecondary, lineHeight: 16 }}>Max occupancy depends on room selection</Text>
            </View>
            
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#f1f5f9', borderRadius: 24, padding: 4, borderWidth: 1, borderColor: c.border }}>
              <TouchableOpacity 
                style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#ffffff', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 1 }} 
                onPress={handleDecrement}
              >
                <Ionicons name="remove" size={20} color={c.text} />
              </TouchableOpacity>
              
              <Text style={{ fontSize: 16, fontWeight: '800', color: c.text, minWidth: 20, textAlign: 'center' }}>
                {guestCount}
              </Text>
              
              <TouchableOpacity 
                style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: c.primary, alignItems: 'center', justifyContent: 'center', shadowColor: c.primary, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 3, elevation: 2 }} 
                onPress={handleIncrement}
              >
                <Ionicons name="add" size={20} color="#ffffff" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Co-Guest Registration Card */}
        {guestCount > 1 && (
          <Card style={[styles.sectionCard, { borderColor: c.primary + '30', borderWidth: 1 }]}>
            <Text style={[styles.sectionHeading, { color: c.text, marginBottom: 2 }]}>
              <Ionicons name="people" size={18} color={c.primary} /> Co-Occupant Details ({guestCount - 1} Required)
            </Text>
            <Text style={[styles.sectionSub, { color: c.textMuted, marginBottom: SPACING.md }]}>
              Setup profiles or send invitations to verify all co-guests.
            </Text>

            {coGuests.map((cg, idx) => (
              <View 
                key={idx} 
                style={[
                  styles.coGuestSlot, 
                  { 
                    backgroundColor: c.background, 
                    borderColor: cg.isConfirmed ? '#05966930' : c.border,
                    borderWidth: 1,
                    borderRadius: BORDER_RADIUS.md,
                    padding: SPACING.md,
                    marginBottom: SPACING.sm
                  }
                ]}
              >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: cg.isConfirmed ? 8 : 0 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <View style={[styles.slotIndexBadge, { backgroundColor: cg.isConfirmed ? '#059669' : c.primary }]}>
                      <Text style={{ color: '#ffffff', fontSize: 11, fontWeight: '700' }}>{idx + 2}</Text>
                    </View>
                    <Text style={{ fontSize: 14, fontWeight: '700', color: c.text }}>
                      Occupant #{idx + 2} {cg.isConfirmed ? `(${cg.name})` : ''}
                    </Text>
                  </View>
                  {cg.isConfirmed && (
                    <TouchableOpacity 
                      onPress={() => {
                        setCoGuests(prev => {
                          const copy = [...prev];
                          copy[idx] = { name: '', phone: '', relationship: 'Friend', idType: 'aadhaar', idNumber: '', isManual: false, isConfirmed: false };
                          return copy;
                        });
                      }}
                    >
                      <Text style={{ color: c.error, fontSize: 12, fontWeight: '600' }}>Remove</Text>
                    </TouchableOpacity>
                  )}
                </View>

                {cg.isConfirmed ? (
                  <View style={{ gap: 4 }}>
                    <Text style={{ fontSize: 12, color: c.textSecondary }}>Relation: <Text style={{ fontWeight: '600' }}>{cg.relationship}</Text></Text>
                    <Text style={{ fontSize: 12, color: c.textSecondary }}>Mobile: <Text style={{ fontWeight: '600' }}>{cg.phone}</Text></Text>
                    <Text style={{ fontSize: 12, color: c.textSecondary }}>
                      {cg.idType.toUpperCase()}: <Text style={{ fontWeight: '600' }}>{cg.idNumber.replace(/.(?=.{4})/g, '•')}</Text>
                    </Text>
                    
                    <View style={{ flexDirection: 'row', gap: 6, marginTop: 6 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: cg.isManual ? '#e0f2fe' : '#fef3c7', paddingHorizontal: 8, paddingVertical: 3, borderRadius: BORDER_RADIUS.sm }}>
                        <Ionicons name={cg.isManual ? "document-text" : "paper-plane"} size={12} color={cg.isManual ? '#0369a1' : '#b45309'} />
                        <Text style={{ fontSize: 10, fontWeight: '700', color: cg.isManual ? '#0369a1' : '#b45309' }}>
                          {cg.isManual ? 'MANUAL OCR VERIFIED' : 'INVITATION PENDING'}
                        </Text>
                      </View>
                      {cg.isManual && (
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#d1fae5', paddingHorizontal: 8, paddingVertical: 3, borderRadius: BORDER_RADIUS.sm }}>
                          <Ionicons name="shield-checkmark" size={12} color="#065f46" />
                          <Text style={{ fontSize: 10, fontWeight: '700', color: '#065f46' }}>VERIFIED</Text>
                        </View>
                      )}
                    </View>
                  </View>
                ) : (
                  <View style={{ gap: SPACING.sm, marginTop: SPACING.xs }}>
                    <Text style={{ fontSize: 12, color: c.textMuted }}>Select a method below to add details for this occupant slot:</Text>
                    <View style={{ gap: 8, marginTop: 10 }}>
                      <TouchableOpacity 
                        style={[styles.occupantMethodBtn, { borderColor: c.primary, backgroundColor: c.primary + '08' }]}
                        onPress={() => {
                          setActiveSetupSlotIdx(idx);
                          setSetupMethod('saved');
                        }}
                      >
                        <Ionicons name="people" size={18} color={c.primary} />
                        <Text style={[styles.methodBtnText, { color: c.primary, fontSize: 13 }]}>Select from Saved Travelers</Text>
                      </TouchableOpacity>

                      <TouchableOpacity 
                        style={[styles.occupantMethodBtn, { borderColor: c.secondary, backgroundColor: c.secondary + '08' }]}
                        onPress={() => {
                          setActiveSetupSlotIdx(idx);
                          setSetupMethod('invite');
                          setFormName('');
                          setFormPhone('');
                          setFormEmail('');
                          setSendQuickLink(true);
                          setFormRelationship('Friend');
                          setFormIdType('aadhaar');
                          setFormIdNumber('');
                        }}
                      >
                        <Ionicons name="mail" size={18} color={c.secondary} />
                        <Text style={[styles.methodBtnText, { color: c.secondary, fontSize: 13 }]}>Send App Invitation Link</Text>
                      </TouchableOpacity>

                      <TouchableOpacity 
                        style={[styles.occupantMethodBtn, { borderColor: c.textSecondary, backgroundColor: c.border + '30' }]}
                        onPress={() => {
                          setActiveSetupSlotIdx(idx);
                          setSetupMethod('manual');
                          setFormName('');
                          setFormPhone('');
                          setFormRelationship('Friend');
                          setFormIdType('aadhaar');
                          setFormIdNumber('');
                          setFormPhoto('');
                          setFormIdDoc('');
                          setScanSuccess(false);
                        }}
                      >
                        <Ionicons name="cloud-upload" size={18} color={c.textSecondary} />
                        <Text style={[styles.methodBtnText, { color: c.textSecondary, fontSize: 13 }]}>Manual Verification</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </View>
            ))}
          </Card>
        )}

        {/* Amenities Grid */}
        <Card style={styles.sectionCard}>
          <Text style={[styles.sectionHeading, { color: c.text }]}>
            <Ionicons name="shield-outline" size={18} color={c.primary} /> Verified Safety & Amenities
          </Text>
          <View style={styles.amenitiesGrid}>
            {property.amenities.map((amenity) => (
              <View key={amenity} style={[styles.amenityChip, { backgroundColor: c.background }]}>
                <Ionicons name="checkmark-circle" size={14} color={c.secondary} />
                <Text style={[styles.amenityLabel, { color: c.textSecondary }]}>{amenity}</Text>
              </View>
            ))}
          </View>
        </Card>

        {/* Emergency Contact Preview */}
        <Card style={[styles.sectionCard, { borderColor: c.primary + '40', borderWidth: 1 }]}>
          <View style={styles.emergencyTitleRow}>
            <Ionicons name="heart-half-outline" size={20} color={c.error} />
            <Text style={[styles.sectionHeading, { color: c.text, marginBottom: 0, marginLeft: 6 }]}>
              Emergency Contact Preview
            </Text>
          </View>
          <Text style={[styles.sectionSub, { color: c.textMuted, marginBottom: 12 }]}>
            This contact receives automated check-in notifications and SOS tracking.
          </Text>

          <View style={[styles.emergencyDetailCard, { backgroundColor: c.background }]}>
            <View style={styles.emergencyIconRing}>
              <Ionicons name="person" size={20} color={c.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.emergencyNameText, { color: c.text }]}>{emergencyContact.name}</Text>
              <Text style={[styles.emergencyRelationText, { color: c.textSecondary }]}>
                {emergencyContact.relationship} · {emergencyContact.phone}
              </Text>
            </View>
            <View style={styles.policeLinkedBadge}>
              <Ionicons name="shield" size={12} color="#059669" />
              <Text style={styles.policeLinkedText}>Linked</Text>
            </View>
          </View>
        </Card>

        {/* Location & Mini Map Preview */}
        <Card style={styles.sectionCard}>
          <Text style={[styles.sectionHeading, { color: c.text }]}>
            <Ionicons name="map-outline" size={18} color={c.primary} /> Location Details
          </Text>
          <View style={styles.mapContainer}>
            <Image 
              source={{ uri: 'https://picsum.photos/seed/map/400/150' }} 
              style={styles.mapMock} 
              resizeMode="cover" 
            />
            <View style={styles.mapMarker}>
              <View style={styles.markerInner}>
                <Ionicons name="business" size={18} color="#ffffff" />
              </View>
              <View style={styles.markerShadow} />
            </View>
            <View style={styles.gpsCoordinates}>
              <Text style={styles.gpsText}>GPS: {property.latitude.toFixed(4)}, {property.longitude.toFixed(4)}</Text>
            </View>
          </View>
          <Text style={[styles.addressText, { color: c.textSecondary, marginTop: 8 }]}>
            {property.address}, {property.city}, Pin: {property.pincode}
          </Text>
        </Card>

        {/* Premium Booking Summary */}
        <View style={{ marginHorizontal: 16, marginTop: 24, backgroundColor: c.surface, borderRadius: 24, padding: 20, borderWidth: 1, borderColor: c.border, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 3 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20, gap: 10 }}>
            <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: c.primary + '15', alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name="receipt" size={18} color={c.primary} />
            </View>
            <Text style={{ fontSize: 18, fontWeight: '800', color: c.text }}>Payment Summary</Text>
          </View>
          
          <View style={{ gap: 14 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ fontSize: 13, color: c.textSecondary, flex: 1 }}>Base Rent ({selectedRoom ? selectedRoom.type : 'Selected Room'} × {stayDurationDays} days)</Text>
              <Text style={{ fontSize: 15, fontWeight: '600', color: c.text }}>₹{baseRent.toLocaleString()}</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ fontSize: 13, color: c.textSecondary, flex: 1 }}>Maintenance & High-Speed WiFi</Text>
              <Text style={{ fontSize: 15, fontWeight: '600', color: c.text }}>₹{maintenanceFee.toLocaleString()}</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, gap: 8 }}>
                <Text style={{ fontSize: 13, color: c.textSecondary }}>AP SafeStay Verification Fee</Text>
                <View style={{ backgroundColor: '#05966915', paddingHorizontal: 6, paddingVertical: 3, borderRadius: 6 }}>
                  <Text style={{ color: '#059669', fontSize: 9, fontWeight: '800', letterSpacing: 0.5 }}>WAIVED</Text>
                </View>
              </View>
              <Text style={{ fontSize: 15, fontWeight: '600', color: c.textMuted, textDecorationLine: 'line-through' }}>₹{policeVerificationFee}</Text>
            </View>
          </View>

          <View style={{ overflow: 'hidden', marginVertical: 20 }}>
            <View style={{ height: 2, borderStyle: 'dashed', borderWidth: 1, borderColor: c.border, borderRadius: 1 }} />
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <Text style={{ fontSize: 18, fontWeight: '800', color: c.text }}>Total Payable</Text>
            <Text style={{ fontSize: 24, fontWeight: '900', color: c.primary, letterSpacing: -0.5 }}>₹{totalPayable.toLocaleString()}</Text>
          </View>
          
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginTop: 16, backgroundColor: c.primary + '08', padding: 12, borderRadius: 12 }}>
            <Ionicons name="shield-checkmark" size={16} color={c.primary} style={{ marginTop: 2 }} />
            <Text style={{ fontSize: 11, color: c.textSecondary, flex: 1, lineHeight: 16 }}>
              Includes real-time check-in clearance. Your secure digital pass will be issued immediately upon owner confirmation.
            </Text>
          </View>
        </View>

      </ScrollView>

      {/* Footer Book Button */}
      <View style={[styles.footer, { backgroundColor: c.surface, borderTopColor: c.border }]}>
        <View style={styles.footerInfo}>
          <Text style={[styles.footerPriceLabel, { color: c.textMuted }]}>TOTAL PAYABLE</Text>
          <Text style={[styles.footerPriceValue, { color: c.text }]}>₹{totalPayable.toLocaleString()}</Text>
        </View>
        <TouchableOpacity 
          style={[styles.bookBtn, { backgroundColor: c.primary }]} 
          onPress={handleBook}
          disabled={bookingLoading}
        >
          <Text style={styles.bookBtnText}>
            {bookingLoading ? 'Processing...' : 'Book SafeStay Now'}
          </Text>
          <Ionicons name="arrow-forward" size={16} color="#ffffff" style={{ marginLeft: 4 }} />
        </TouchableOpacity>
      </View>

      {/* Custom Picker Modals */}
      <Modal visible={activePicker !== null} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: c.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: c.text }]}>
                {activePicker === 'inDate' && 'Select Check-in Date'}
                {activePicker === 'outDate' && 'Select Check-out Date'}
                {activePicker === 'inTime' && 'Select Check-in Time'}
                {activePicker === 'outTime' && 'Select Check-out Time'}
              </Text>
              <TouchableOpacity onPress={() => setActivePicker(null)}>
                <Ionicons name="close" size={24} color={c.text} />
              </TouchableOpacity>
            </View>

            {(activePicker === 'inDate' || activePicker === 'outDate') && (
              <FlatList
                data={dateOptions}
                keyExtractor={(item) => item.toISOString()}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[styles.modalOption, { borderBottomColor: c.border }]}
                    onPress={() => handleDateSelect(item)}
                  >
                    <Ionicons name="calendar-outline" size={18} color={c.primary} style={{ marginRight: 10 }} />
                    <Text style={[styles.modalOptionText, { color: c.text }]}>
                      {item.toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })}
                    </Text>
                  </TouchableOpacity>
                )}
              />
            )}

            {(activePicker === 'inTime' || activePicker === 'outTime') && (
              <FlatList
                data={timeOptions}
                keyExtractor={(item) => item}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[styles.modalOption, { borderBottomColor: c.border }]}
                    onPress={() => {
                      if (activePicker === 'inTime') setCheckInTime(item);
                      else setCheckOutTime(item);
                      setActivePicker(null);
                    }}
                  >
                    <Ionicons name="time-outline" size={18} color={c.primary} style={{ marginRight: 10 }} />
                    <Text style={[styles.modalOptionText, { color: c.text }]}>{item}</Text>
                  </TouchableOpacity>
                )}
              />
            )}
          </View>
        </View>
      </Modal>

      {/* Co-Guest Setup Modal */}
      <Modal visible={activeSetupSlotIdx !== null} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: c.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: c.text }]}>
                Setup Occupant #{activeSetupSlotIdx !== null ? activeSetupSlotIdx + 2 : 0}
              </Text>
              <TouchableOpacity onPress={() => { setActiveSetupSlotIdx(null); setSetupMethod(null); }}>
                <Ionicons name="close" size={24} color={c.text} />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.formContainer} keyboardShouldPersistTaps="handled">
              {setupMethod === 'saved' && (
                <View style={{ gap: SPACING.sm }}>
                  <Text style={{ fontSize: 13, color: c.textMuted, marginBottom: 4 }}>
                    Select from your pre-verified traveler profiles:
                  </Text>
                  {mockSavedTravelers.map((st) => (
                    <TouchableOpacity
                      key={st.id}
                      style={[styles.savedTravelerRow, { borderColor: c.border, backgroundColor: c.background }]}
                      onPress={() => handleSelectSaved(st)}
                    >
                      <Ionicons name="person-circle" size={32} color={c.primary} />
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontWeight: '700', color: c.text }}>{st.name}</Text>
                        <Text style={{ fontSize: 12, color: c.textSecondary }}>{st.relationship} · {st.phone}</Text>
                      </View>
                      <Ionicons name="chevron-forward" size={16} color={c.textMuted} />
                    </TouchableOpacity>
                  ))}
                  {mockSavedTravelers.length === 0 && (
                    <Text style={{ textAlign: 'center', paddingVertical: 24, color: c.textMuted }}>
                      No saved travelers. Use Invite or Manual upload.
                    </Text>
                  )}
                </View>
              )}

              {setupMethod === 'invite' && (
                <View style={{ gap: SPACING.sm }}>
                  <Text style={{ fontSize: 13, color: c.textMuted, marginBottom: 4 }}>
                    Send an invitation link so the co-guest can complete their profile registration and verification on their own device.
                  </Text>

                  {/* Quick Check-in Link checkbox */}
                  <TouchableOpacity 
                    style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 8, marginVertical: 4 }}
                    onPress={() => setSendQuickLink(prev => !prev)}
                  >
                    <View style={{ width: 20, height: 20, borderWidth: 2, borderColor: c.primary, borderRadius: 4, alignItems: 'center', justifyContent: 'center', backgroundColor: sendQuickLink ? c.primary : 'transparent' }}>
                      {sendQuickLink && <Ionicons name="checkmark" size={14} color="#ffffff" />}
                    </View>
                    <Text style={{ fontWeight: '700', fontSize: 13, color: c.text }}>Send Quick Check-in Link</Text>
                  </TouchableOpacity>

                  {!sendQuickLink && (
                    <>
                      <Text style={styles.formLabel}>Full Name</Text>
                      <TextInput
                        style={[styles.formInput, { borderColor: c.border, color: c.text }]}
                        value={formName}
                        onChangeText={setFormName}
                        placeholder="Enter name"
                        placeholderTextColor={c.textMuted}
                      />
                    </>
                  )}

                  <Text style={styles.formLabel}>Mobile Number</Text>
                  <TextInput
                    style={[styles.formInput, { borderColor: c.border, color: c.text }]}
                    value={formPhone}
                    onChangeText={setFormPhone}
                    placeholder="+91 9XXXX XXXXX"
                    placeholderTextColor={c.textMuted}
                    keyboardType="phone-pad"
                  />

                  {sendQuickLink && (
                    <>
                      <Text style={styles.formLabel}>Email Address</Text>
                      <TextInput
                        style={[styles.formInput, { borderColor: c.border, color: c.text }]}
                        value={formEmail}
                        onChangeText={setFormEmail}
                        placeholder="co-guest@example.com"
                        placeholderTextColor={c.textMuted}
                        keyboardType="email-address"
                        autoCapitalize="none"
                      />
                    </>
                  )}

                  <Text style={styles.formLabel}>Relationship</Text>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                    {['Spouse', 'Parent', 'Brother', 'Sister', 'Friend', 'Child', 'Other'].map(r => (
                      <TouchableOpacity
                        key={r}
                        style={[styles.relationChip, { borderColor: formRelationship === r ? c.primary : c.border, backgroundColor: formRelationship === r ? c.primary + '10' : 'transparent' }]}
                        onPress={() => setFormRelationship(r)}
                      >
                        <Text style={{ fontSize: 12, color: formRelationship === r ? c.primary : c.textSecondary }}>{r}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  {formRelationship === 'Other' && (
                    <TextInput
                      style={[styles.formInput, { borderColor: c.border, color: c.text, marginTop: 8 }]}
                      value={formCustomRelationship}
                      onChangeText={setFormCustomRelationship}
                      placeholder="Please specify relationship"
                      placeholderTextColor={c.textMuted}
                    />
                  )}

                  {!sendQuickLink && (
                    <>
                      <Text style={styles.formLabel}>ID Document Type</Text>
                      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                        {['aadhaar', 'pan', 'passport'].map(t => (
                          <TouchableOpacity
                            key={t}
                            style={[styles.relationChip, { borderColor: formIdType === t ? c.primary : c.border, backgroundColor: formIdType === t ? c.primary + '10' : 'transparent' }]}
                            onPress={() => setFormIdType(t)}
                          >
                            <Text style={{ fontSize: 12, color: formIdType === t ? c.primary : c.textSecondary }}>{t.toUpperCase()}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>

                      <Text style={styles.formLabel}>ID Number</Text>
                      <TextInput
                        style={[styles.formInput, { borderColor: c.border, color: c.text }]}
                        value={formIdNumber}
                        onChangeText={setFormIdNumber}
                        placeholder="Enter ID number"
                        placeholderTextColor={c.textMuted}
                        autoCapitalize="characters"
                      />
                    </>
                  )}

                  <Button
                    title="Send Verification Invitation"
                    onPress={() => {
                      if (sendQuickLink) {
                        if (!formPhone.trim() && !formEmail.trim()) {
                          Alert.alert('Required Fields', 'Please enter a Mobile Number, an Email address, or both to send the check-in invitation link.');
                          return;
                        }
                      } else {
                        if (!formName.trim() || !formPhone.trim() || !formIdNumber.trim()) {
                          Alert.alert('Required Fields', 'Please fill all details.');
                          return;
                        }
                      }
                      if (formRelationship === 'Other' && !formCustomRelationship.trim()) {
                        Alert.alert('Required Fields', 'Please specify the relationship.');
                        return;
                      }
                      const finalRelationship = formRelationship === 'Other' ? formCustomRelationship.trim() : formRelationship;
                      setCoGuests(prev => {
                        const copy = [...prev];
                        copy[activeSetupSlotIdx!] = {
                          name: sendQuickLink ? (formPhone || formEmail || 'Invited Guest') : formName,
                          phone: formPhone,
                          email: formEmail,
                          relationship: finalRelationship,
                          idType: sendQuickLink ? 'Pending Upload' : formIdType,
                          idNumber: sendQuickLink ? 'Pending Upload' : formIdNumber,
                          isManual: false,
                          isConfirmed: true,
                        };
                        return copy;
                      });
                      setActiveSetupSlotIdx(null);
                      setSetupMethod(null);
                      const destination = formPhone ? formPhone : formEmail;
                      Alert.alert('Invite Sent', `An invitation link has been successfully dispatched to ${destination}.`);
                    }}
                    style={{ marginTop: 12 }}
                  />
                </View>
              )}

              {setupMethod === 'manual' && (
                <View style={{ gap: SPACING.sm }}>
                  <Text style={{ fontSize: 13, color: c.textMuted, marginBottom: 4 }}>
                    Fallback for guests without smartphones. Upload documents to automatically parse via SafeStay OCR.
                  </Text>

                  {/* Document selector buttons */}
                  <View style={{ flexDirection: 'row', gap: 8, marginBottom: 6 }}>
                    <TouchableOpacity
                      style={[styles.uploadBox, { flex: 1, borderColor: formPhoto ? '#059669' : c.border, backgroundColor: formPhoto ? '#e6f4ea' : 'transparent' }]}
                      onPress={() => {
                        setFormPhoto('https://picsum.photos/seed/face1/300/300');
                        Alert.alert('Face Photo Attached', 'Mock image captured successfully.');
                      }}
                    >
                      <Ionicons name={formPhoto ? "checkmark-circle" : "camera"} size={22} color={formPhoto ? '#059669' : c.textMuted} />
                      <Text style={{ fontSize: 11, color: formPhoto ? '#059669' : c.textSecondary, marginTop: 4 }}>
                        {formPhoto ? 'Face Captured' : 'Attach Photo'}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.uploadBox, { flex: 1, borderColor: formIdDoc ? '#059669' : c.border, backgroundColor: formIdDoc ? '#e6f4ea' : 'transparent' }]}
                      onPress={async () => {
                        setFormIdDoc('https://picsum.photos/seed/doc1/400/250');
                        setScanLoading(true);
                        try {
                          const result = await travelersApi.mockOcr('https://picsum.photos/seed/doc1/400/250');
                          setFormName(result.name);
                          setFormIdNumber(result.idNumber);
                          setFormIdType(result.idType);
                          setScanSuccess(true);
                        } catch (e) {
                          Alert.alert('Scan Error', 'Could not scan document copy.');
                        } finally {
                          setScanLoading(false);
                        }
                      }}
                      disabled={scanLoading}
                    >
                      <Ionicons name={scanLoading ? "sync" : formIdDoc ? "checkmark-circle" : "card"} size={22} color={formIdDoc ? '#059669' : c.textMuted} />
                      <Text style={{ fontSize: 11, color: formIdDoc ? '#059669' : c.textSecondary, marginTop: 4 }}>
                        {scanLoading ? 'Scanning...' : formIdDoc ? 'Doc Attached' : 'Attach ID Card'}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {scanSuccess && (
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#e6f4ea', padding: 8, borderRadius: BORDER_RADIUS.md }}>
                      <Ionicons name="checkmark-circle" size={16} color="#137333" />
                      <Text style={{ fontSize: 11, color: '#137333', fontWeight: '600' }}>
                        Document parsed successfully in background.
                      </Text>
                    </View>
                  )}

                  <Text style={styles.formLabel}>Full Name</Text>
                  <TextInput
                    style={[styles.formInput, { borderColor: c.border, color: c.text }]}
                    value={formName}
                    onChangeText={setFormName}
                    placeholder="Parsed / Enter name"
                    placeholderTextColor={c.textMuted}
                  />

                  <Text style={styles.formLabel}>Mobile Number</Text>
                  <TextInput
                    style={[styles.formInput, { borderColor: c.border, color: c.text }]}
                    value={formPhone}
                    onChangeText={setFormPhone}
                    placeholder="+91 9XXXX XXXXX"
                    placeholderTextColor={c.textMuted}
                    keyboardType="phone-pad"
                  />

                  <Text style={styles.formLabel}>Relationship</Text>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                    {['Spouse', 'Parent', 'Brother', 'Sister', 'Friend', 'Child', 'Other'].map(r => (
                      <TouchableOpacity
                        key={r}
                        style={[styles.relationChip, { borderColor: formRelationship === r ? c.primary : c.border, backgroundColor: formRelationship === r ? c.primary + '10' : 'transparent' }]}
                        onPress={() => setFormRelationship(r)}
                      >
                        <Text style={{ fontSize: 12, color: formRelationship === r ? c.primary : c.textSecondary }}>{r}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  {formRelationship === 'Other' && (
                    <TextInput
                      style={[styles.formInput, { borderColor: c.border, color: c.text, marginTop: 8 }]}
                      value={formCustomRelationship}
                      onChangeText={setFormCustomRelationship}
                      placeholder="Please specify relationship"
                      placeholderTextColor={c.textMuted}
                    />
                  )}

                  <Text style={styles.formLabel}>ID Document Type</Text>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                    {['aadhaar', 'pan', 'passport'].map(t => (
                      <TouchableOpacity
                        key={t}
                        style={[styles.relationChip, { borderColor: formIdType === t ? c.primary : c.border, backgroundColor: formIdType === t ? c.primary + '10' : 'transparent' }]}
                        onPress={() => setFormIdType(t)}
                      >
                        <Text style={{ fontSize: 12, color: formIdType === t ? c.primary : c.textSecondary }}>{t.toUpperCase()}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <Text style={styles.formLabel}>ID Number</Text>
                  <TextInput
                    style={[styles.formInput, { borderColor: c.border, color: c.text }]}
                    value={formIdNumber}
                    onChangeText={setFormIdNumber}
                    placeholder="Parsed / Enter ID number"
                    placeholderTextColor={c.textMuted}
                    autoCapitalize="characters"
                  />

                  <Button
                    title="Verify & Link Occupant Profile"
                    onPress={() => {
                      if (!formName.trim() || !formPhone.trim() || !formIdNumber.trim() || !formPhoto || !formIdDoc) {
                        Alert.alert('Required Details', 'Please fill name, phone, ID number, and attach BOTH photo and document.');
                        return;
                      }
                      if (formRelationship === 'Other' && !formCustomRelationship.trim()) {
                        Alert.alert('Required Details', 'Please specify the relationship.');
                        return;
                      }
                      const finalRelationship = formRelationship === 'Other' ? formCustomRelationship.trim() : formRelationship;
                      setCoGuests(prev => {
                        const copy = [...prev];
                        copy[activeSetupSlotIdx!] = {
                          name: formName,
                          phone: formPhone,
                          relationship: finalRelationship,
                          idType: formIdType,
                          idNumber: formIdNumber,
                          isManual: true,
                          photo: formPhoto,
                          idDoc: formIdDoc,
                          isConfirmed: true,
                        };
                        return copy;
                      });
                      setActiveSetupSlotIdx(null);
                      setSetupMethod(null);
                    }}
                    style={{ marginTop: 12 }}
                  />
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Room Selection Bottom Sheet Modal */}
      <Modal visible={roomDropdownVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: c.surface, maxHeight: '70%' }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: c.text }]}>Select a Room</Text>
              <TouchableOpacity onPress={() => setRoomDropdownVisible(false)}>
                <Ionicons name="close" size={24} color={c.text} />
              </TouchableOpacity>
            </View>
            <ScrollView>
              {rooms?.map((room) => {
                const isSelected = selectedRoomId === room.id;
                const isOccupied = room.currentOccupancy >= room.capacity;
                const isMaint = room.status === 'maintenance';
                return (
                  <TouchableOpacity
                    key={room.id}
                    disabled={isMaint}
                    style={{
                      flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
                      paddingVertical: 14, borderBottomWidth: 1, borderColor: c.border,
                      opacity: isMaint ? 0.5 : 1
                    }}
                    onPress={() => {
                      setSelectedRoomId(room.id);
                      if (guestCount > room.capacity) setGuestCount(1);
                      setRoomDropdownVisible(false);
                    }}
                  >
                    <View>
                      <Text style={{ fontSize: 16, fontWeight: '700', color: isSelected ? c.primary : c.text }}>
                        Room {room.roomNumber} <Text style={{ fontSize: 12, fontWeight: '500', color: c.textMuted }}>({room.type})</Text>
                      </Text>
                      <Text style={{ fontSize: 12, color: isOccupied ? c.error : c.textSecondary, marginTop: 2 }}>
                        {isMaint ? 'Maintenance' : isOccupied ? 'Fully Booked' : `${room.capacity - room.currentOccupancy} Vacant`} • ₹{room.pricePerMonth.toLocaleString()}
                      </Text>
                    </View>
                    {isSelected && <Ionicons name="checkmark-circle" size={22} color={c.primary} />}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingBottom: 100 },
  imageSection: { height: 220, position: 'relative' },
  imageWrapper: { width: 400, height: 220 }, // Fallplay width
  image: { width: '100%', height: '100%' },
  imageOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 100 },
  topBadgeRow: {
    position: 'absolute', top: SPACING.md, left: SPACING.md, right: SPACING.md,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'
  },
  policeBadge: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#1565c0',
    borderRadius: BORDER_RADIUS.full, paddingHorizontal: 10, paddingVertical: 4, gap: 4
  },
  policeBadgeText: { color: '#ffffff', fontSize: 11, fontWeight: '700' },
  ratingFloating: {
    position: 'absolute', bottom: SPACING.sm, right: SPACING.sm,
    backgroundColor: 'rgba(0,0,0,0.7)', borderRadius: BORDER_RADIUS.sm,
    paddingHorizontal: 8, paddingVertical: 4, flexDirection: 'row', alignItems: 'center', gap: 4
  },
  ratingText: { color: '#ffffff', fontSize: 12, fontWeight: '700' },
  infoBlock: { padding: SPACING.md, backgroundColor: '#ffffff', borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  title: { fontSize: 20, fontWeight: '800', marginBottom: 4 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  locationText: { fontSize: 13, flex: 1 },
  sectionCard: { marginHorizontal: SPACING.md, marginTop: SPACING.md, padding: SPACING.md },
  sectionHeading: { fontSize: FONT_SIZE.base, fontWeight: '700', marginBottom: 8, flexDirection: 'row', alignItems: 'center' },
  sectionSub: { fontSize: 11, marginTop: -6, marginBottom: 10 },
  dateTimeGrid: { flexDirection: 'row', gap: SPACING.md },
  dateTimeField: { flex: 1 },
  fieldLabel: { fontSize: 9, fontWeight: '800', marginBottom: 4, letterSpacing: 0.5 },
  pickerBtn: {
    flexDirection: 'row', alignItems: 'center', borderWidth: 1,
    borderRadius: BORDER_RADIUS.md, paddingHorizontal: SPACING.sm, paddingVertical: SPACING.xs + 2, gap: 6
  },
  pickerBtnText: { fontSize: 13, fontWeight: '600' },
  durationRow: { marginTop: SPACING.sm, alignItems: 'flex-start' },
  durationBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: BORDER_RADIUS.full },
  durationBadgeText: { fontSize: 11, fontWeight: '700' },
  roomsRow: { gap: SPACING.md, paddingVertical: 12, paddingHorizontal: 4 },
  roomCard: {
    width: 300, borderRadius: 20,
    padding: 18, marginRight: 12,
  },
  roomNo: { fontSize: 18, fontWeight: '800' },
  premiumStatusPill: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: 20, alignSelf: 'flex-start'
  },
  premiumStatusText: {
    fontSize: 10, fontWeight: '800', letterSpacing: 0.5
  },
  roomPrice: { fontSize: 16, fontWeight: '800' },
  guestCountRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  countSelector: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  countBtn: { width: 32, height: 32, borderWidth: 1, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  countValue: { fontSize: 15, fontWeight: '700' },
  amenitiesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  amenityChip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 6, borderRadius: BORDER_RADIUS.full, gap: 4 },
  amenityLabel: { fontSize: 12, fontWeight: '500' },
  emergencyTitleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  emergencyDetailCard: { flexDirection: 'row', alignItems: 'center', padding: SPACING.md, borderRadius: BORDER_RADIUS.md, gap: SPACING.md },
  emergencyIconRing: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#e3f2fd', alignItems: 'center', justifyContent: 'center' },
  emergencyNameText: { fontSize: 14, fontWeight: '700' },
  emergencyRelationText: { fontSize: 12 },
  policeLinkedBadge: { flexDirection: 'row', alignItems: 'center', gap: 2, backgroundColor: '#d1fae5', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  policeLinkedText: { fontSize: 9, fontWeight: '800', color: '#065f46' },
  mapContainer: { height: 120, borderRadius: BORDER_RADIUS.md, overflow: 'hidden', position: 'relative', marginTop: 4 },
  mapMock: { width: '100%', height: '100%' },
  mapMarker: { position: 'absolute', top: 35, left: '50%', marginLeft: -12, alignItems: 'center' },
  markerInner: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#e11d48', alignItems: 'center', justifyContent: 'center', elevation: 3 },
  markerShadow: { width: 8, height: 4, borderRadius: 2, backgroundColor: 'rgba(0,0,0,0.3)', marginTop: 2 },
  gpsCoordinates: { position: 'absolute', bottom: 4, left: 4, backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  gpsText: { color: '#ffffff', fontSize: 9, fontFamily: 'monospace' },
  addressText: { fontSize: 12 },
  invoiceRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  invoiceLabel: { fontSize: 13 },
  invoiceValue: { fontSize: 13, fontWeight: '600' },
  freeBadge: { backgroundColor: '#d1fae5', paddingHorizontal: 4, paddingVertical: 1, borderRadius: 3, marginLeft: 6 },
  freeBadgeText: { color: '#065f46', fontSize: 9, fontWeight: '800' },
  invoiceDivider: { height: 1, marginVertical: SPACING.sm },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 4 },
  totalLabel: { fontSize: FONT_SIZE.base, fontWeight: '700' },
  totalPrice: { fontSize: 18, fontWeight: '800' },
  summaryNote: { fontSize: 10, marginTop: 8, fontStyle: 'italic', lineHeight: 14 },
  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0, height: 70,
    flexDirection: 'row', paddingHorizontal: SPACING.md, alignItems: 'center',
    justifyContent: 'space-between', borderTopWidth: 1
  },
  footerInfo: { justifyContent: 'center' },
  footerPriceLabel: { fontSize: 9, fontWeight: '700', letterSpacing: 0.5 },
  footerPriceValue: { fontSize: 18, fontWeight: '800' },
  bookBtn: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: SPACING.lg,
    paddingVertical: 12, borderRadius: BORDER_RADIUS.md, gap: 4
  },
  bookBtnText: { color: '#ffffff', fontWeight: '800', fontSize: 14 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalCard: { borderTopLeftRadius: BORDER_RADIUS.lg, borderTopRightRadius: BORDER_RADIUS.lg, padding: SPACING.md, maxHeight: 350 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.md },
  modalTitle: { fontSize: 16, fontWeight: '700' },
  modalOption: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1 },
  modalOptionText: { fontSize: 14, fontWeight: '600' },
  coGuestSlot: { marginTop: 10 },
  slotIndexBadge: { width: 18, height: 18, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  occupantMethodBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', gap: 12, paddingVertical: 14, paddingHorizontal: 16, borderWidth: 1, borderRadius: BORDER_RADIUS.md },
  methodBtnText: { fontSize: 14, fontWeight: '700' },
  savedTravelerRow: { flexDirection: 'row', alignItems: 'center', padding: SPACING.sm, borderWidth: 1, borderRadius: BORDER_RADIUS.md, gap: 10, marginBottom: 8 },
  formLabel: { fontSize: 11, fontWeight: '700', marginTop: 6 },
  formInput: { borderWidth: 1, borderRadius: BORDER_RADIUS.md, height: 40, paddingHorizontal: 12, fontSize: 13 },
  relationChip: { borderWidth: 1, borderRadius: BORDER_RADIUS.full, paddingHorizontal: 10, paddingVertical: 5 },
  uploadBox: { height: 64, borderWidth: 1, borderStyle: 'dashed', borderRadius: BORDER_RADIUS.md, alignItems: 'center', justifyContent: 'center' },
  scanBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderRadius: BORDER_RADIUS.md, gap: 6, marginVertical: 4 },
  spin: {}, 
  modalContent: { borderTopLeftRadius: BORDER_RADIUS.lg, borderTopRightRadius: BORDER_RADIUS.lg, padding: SPACING.md, maxHeight: '80%' },
  formContainer: { paddingBottom: SPACING.xl },
});
