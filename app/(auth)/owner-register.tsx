import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore } from '../../src/store/themeStore';
import { useAuthStore } from '../../src/store/authStore';
import { Button } from '../../src/components/ui/Button';
import { Input } from '../../src/components/ui/Input';
import { Card } from '../../src/components/ui/Card';
import { Header } from '../../src/components/ui/Header';
import { BORDER_RADIUS, FONT_SIZE, SPACING } from '../../src/constants/theme';
import { mockOwners } from '../../src/data/mockUsers';
import { secureStorage, appStorage } from '../../src/services/storage';

export default function OwnerRegisterScreen() {
  const { theme } = useThemeStore();
  const { setUser } = useAuthStore();
  const c = theme.colors;

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form State
  const [form, setForm] = useState({
    // Step 1: Owner Details
    ownerName: '',
    phone: '',
    otp: '',
    email: '',
    aadhaarPan: '',
    ownerPhoto: '',
    // Step 2: Property Details
    propertyName: '',
    propertyType: 'PG',
    address: '',
    district: '',
    gpsLocation: '',
    // Step 3: Property Info
    totalRooms: '',
    totalCapacity: '',
    category: 'Co-Living',
    amenities: [] as string[],
    // Step 4: Documents
    tradeLicense: '',
    buildingPermission: '',
    fireNoc: '',
    gst: '',
    propertyPhotos: '',
  });

  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);

  const amenitiesList = ['Wifi', 'Food / Mess', 'AC', 'CCTV Security', 'Parking', '24/7 Security', 'Power Backup'];

  const sendOtp = () => {
    if (!form.phone || form.phone.length < 10) {
      Alert.alert('Error', 'Please enter a valid mobile number');
      return;
    }
    setOtpSent(true);
    Alert.alert('OTP Sent', 'Demo OTP is 123456');
  };

  const verifyOtp = () => {
    if (form.otp === '123456') {
      setOtpVerified(true);
      Alert.alert('Success', 'OTP verified successfully!');
    } else {
      Alert.alert('Error', 'Invalid OTP. Please enter 123456');
    }
  };

  const toggleAmenity = (item: string) => {
    setForm(prev => {
      const active = prev.amenities.includes(item)
        ? prev.amenities.filter(a => a !== item)
        : [...prev.amenities, item];
      return { ...prev, amenities: active };
    });
  };

  const nextStep = () => {
    if (step === 1) {
      if (!form.ownerName || !form.phone || !form.email || !form.aadhaarPan) {
        Alert.alert('Error', 'Please fill all owner details');
        return;
      }
      if (!otpVerified) {
        Alert.alert('Verification Required', 'Please verify your phone number using the demo OTP (123456) before continuing.');
        return;
      }
    }
    if (step === 2) {
      if (!form.propertyName || !form.address || !form.district) {
        Alert.alert('Error', 'Please fill in all Property details');
        return;
      }
    }
    if (step === 3) {
      if (!form.totalRooms || !form.totalCapacity) {
        Alert.alert('Error', 'Please enter Total Rooms and Total Capacity');
        return;
      }
    }
    if (step === 4) {
      if (!form.tradeLicense || !form.buildingPermission) {
        Alert.alert('Error', 'Please upload Trade License and Building Permission docs');
        return;
      }
    }

    setStep(s => s + 1);
  };

  const prevStep = () => {
    setStep(s => s - 1);
  };

  const fetchGps = () => {
    const coords = `16.${Math.floor(Math.random() * 9000 + 1000)}, 80.${Math.floor(Math.random() * 9000 + 1000)}`;
    setForm({ ...form, gpsLocation: coords });
    Alert.alert('GPS Fetched', `Location registered: ${coords}`);
  };

  const handleRegister = async () => {
    setLoading(true);
    try {
      await new Promise(r => setTimeout(r, 1200));
      const newUserId = `owner_${Date.now()}`;
      const token = `mock_token_${newUserId}`;
      const newUser = {
        id: newUserId,
        name: form.ownerName,
        phone: form.phone,
        email: form.email,
        role: 'owner' as const,
        kycStatus: 'submitted' as const, // Owner is submitted (Pending Verification)
        isVerified: false, // Starts as not verified until physical check
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
      };

      // Add to mock store
      (mockOwners as any[]).push({
        ...newUser,
        properties: [
          {
            id: `prop_${Date.now()}`,
            name: form.propertyName,
            ownerId: newUserId,
            address: form.address,
            city: form.district,
            totalRooms: parseInt(form.totalRooms) || 10,
            availableRooms: parseInt(form.totalRooms) || 10,
            rules: ['No loud music', 'Gate closes at 10 PM'],
            description: `SafeStay verified ${form.propertyType} managed by ${form.ownerName}`,
            status: 'pending',
            latitude: 16.506,
            longitude: 80.648,
            contactPhone: form.phone,
          }
        ],
        verificationStatus: 'submitted',
      });

      await secureStorage.setToken(token);
      await appStorage.setUserId(newUserId);
      await appStorage.setUserRole('owner');
      setUser(newUser as any);

      Alert.alert('Registered Successfully', 'Registration submitted for AP Police review. Our officers will contact you for physical audit.', [
        { text: 'Go to Dashboard', onPress: () => router.replace('/(owner)/dashboard') }
      ]);
    } catch {
      Alert.alert('Error', 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <Header title="PG/Hotel Owner Register" showBack onBack={() => router.replace('/(auth)/role-entry?role=owner')} />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {/* Step Indicator */}
        <View style={styles.stepsRow}>
          {[1, 2, 3, 4, 5].map((s) => (
            <View key={s} style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={[styles.stepDot, { backgroundColor: s <= step ? c.primary : c.border }]}>
                <Text style={styles.stepNum}>{s}</Text>
              </View>
              {s < 5 && <View style={[styles.stepLine, { backgroundColor: s < step ? c.primary : c.border }]} />}
            </View>
          ))}
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: SPACING.sm, paddingHorizontal: 4 }}>
          <Text style={[styles.stepTitle, { color: c.text, textAlign: 'left', flex: 1 }]}>
            {step === 1 && 'Step 1: Owner Details'}
            {step === 2 && 'Step 2: Property Details'}
            {step === 3 && 'Step 3: Property Information'}
            {step === 4 && 'Step 4: Documents Upload'}
            {step === 5 && 'Step 5: Submission'}
          </Text>
          <TouchableOpacity
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: c.primary + '15',
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 20,
              borderWidth: 1,
              borderColor: c.primary + '30',
            }}
            onPress={() => {
              setForm({
                ownerName: 'Venkata Ramana',
                phone: '9988776655',
                otp: '123456',
                email: 'ramana.properties@gmail.com',
                aadhaarPan: 'BCDPV1234M',
                ownerPhoto: 'owner_portrait.jpg',
                propertyName: 'Sri Lakshmi Co-Living Mansion',
                propertyType: 'PG',
                address: 'Sector 4, Near IT Park, Mangalagiri',
                district: 'Vijayawada',
                gpsLocation: '16.4820, 80.5901',
                totalRooms: '24',
                totalCapacity: '48',
                category: 'Co-Living',
                amenities: ['Wifi', 'Food / Mess', 'CCTV Security', 'Parking', '24/7 Security'],
                tradeLicense: 'trade_license.pdf',
                buildingPermission: 'building_permission.pdf',
                fireNoc: 'fire_noc.pdf',
                gst: '37AAAAA0000A1Z5',
                propertyPhotos: 'building_outside.jpg',
              });
              setOtpSent(true);
              setOtpVerified(true);
              Alert.alert('⚡ Autofill Active', 'Mock details filled! Proceed by tapping Continue.');
            }}
          >
            <Ionicons name="flash" size={14} color={c.primary} style={{ marginRight: 4 }} />
            <Text style={{ fontSize: 12, fontWeight: '700', color: c.primary }}>Auto Fill</Text>
          </TouchableOpacity>
        </View>

        <Card style={styles.card}>
          {step === 1 && (
            <View style={styles.form}>
              <Input
                label="Owner Name *"
                value={form.ownerName}
                onChangeText={(t) => setForm({ ...form, ownerName: t })}
                placeholder="Enter full name"
                leftIcon="person-outline"
              />
              <View style={styles.phoneVerification}>
                <View style={{ flex: 1 }}>
                  <Input
                    label="Mobile Number *"
                    value={form.phone}
                    onChangeText={(t) => setForm({ ...form, phone: t })}
                    placeholder="10-digit number"
                    keyboardType="phone-pad"
                    leftIcon="call-outline"
                    editable={!otpVerified}
                  />
                </View>
                {!otpVerified && (
                  <TouchableOpacity style={[styles.verifyButton, { backgroundColor: c.primary }]} onPress={sendOtp}>
                    <Text style={styles.verifyBtnText}>{otpSent ? 'Resend' : 'Get OTP'}</Text>
                  </TouchableOpacity>
                )}
              </View>

              {otpSent && !otpVerified && (
                <View style={styles.phoneVerification}>
                  <View style={{ flex: 1 }}>
                    <Input
                      label="Enter OTP *"
                      value={form.otp}
                      onChangeText={(t) => setForm({ ...form, otp: t })}
                      placeholder="Enter 123456"
                      keyboardType="number-pad"
                      leftIcon="shield-checkmark-outline"
                    />
                  </View>
                  <TouchableOpacity style={[styles.verifyButton, { backgroundColor: '#4CAF50' }]} onPress={verifyOtp}>
                    <Text style={styles.verifyBtnText}>Verify</Text>
                  </TouchableOpacity>
                </View>
              )}

              {otpVerified && (
                <View style={styles.verifiedBadge}>
                  <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                  <Text style={{ color: '#4CAF50', fontWeight: 'bold' }}>Phone Verified</Text>
                </View>
              )}

              <Input
                label="Email Address *"
                value={form.email}
                onChangeText={(t) => setForm({ ...form, email: t })}
                placeholder="your@email.com"
                keyboardType="email-address"
                leftIcon="mail-outline"
              />
              <Input
                label="Aadhaar / PAN Number *"
                value={form.aadhaarPan}
                onChangeText={(t) => setForm({ ...form, aadhaarPan: t })}
                placeholder="Aadhaar or PAN ID"
                autoCapitalize="characters"
                leftIcon="card-outline"
              />

              <TouchableOpacity
                style={[styles.uploadBox, { borderColor: c.border, backgroundColor: c.card }]}
                onPress={() => {
                  setForm({ ...form, ownerPhoto: 'owner_portrait.jpg' });
                  Alert.alert('Success', 'Photo selected successfully (Mock).');
                }}
              >
                <Ionicons name="camera-outline" size={32} color={c.primary} />
                <Text style={[styles.uploadTitle, { color: c.text }]}>Owner Photo *</Text>
                <Text style={[styles.uploadDesc, { color: c.textMuted }]}>
                  {form.ownerPhoto ? 'owner_portrait.jpg' : 'Tap to snap a selfie photo'}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {step === 2 && (
            <View style={styles.form}>
              <Input
                label="Property Name *"
                value={form.propertyName}
                onChangeText={(t) => setForm({ ...form, propertyName: t })}
                placeholder="e.g. Venus Men PG Hostel"
                leftIcon="business-outline"
              />
              <Text style={[styles.inputLabel, { color: c.text }]}>Property Type *</Text>
              <View style={styles.genderRow}>
                {['PG', 'Hotel', 'Homestay'].map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[styles.genderBtn, { borderColor: form.propertyType === type ? c.primary : c.border, backgroundColor: form.propertyType === type ? c.primary + '10' : 'transparent' }]}
                    onPress={() => setForm({ ...form, propertyType: type })}
                  >
                    <Text style={{ color: form.propertyType === type ? c.primary : c.textSecondary, fontWeight: '700' }}>{type}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Input
                label="Address *"
                value={form.address}
                onChangeText={(t) => setForm({ ...form, address: t })}
                placeholder="Street name & Landmark"
                leftIcon="map-outline"
              />
              <Input
                label="District / City *"
                value={form.district}
                onChangeText={(t) => setForm({ ...form, district: t })}
                placeholder="e.g. Vijayawada, Guntur"
                leftIcon="navigate-outline"
              />
              
              <View style={{ gap: SPACING.xs }}>
                <Text style={[styles.inputLabel, { color: c.text }]}>GPS Coordinates *</Text>
                <View style={{ flexDirection: 'row', gap: SPACING.sm, alignItems: 'center' }}>
                  <View style={{ flex: 1 }}>
                    <Input
                      value={form.gpsLocation}
                      onChangeText={(t) => setForm({ ...form, gpsLocation: t })}
                      placeholder="Coordinates (latitude, longitude)"
                      leftIcon="location-outline"
                      editable={false}
                    />
                  </View>
                  <TouchableOpacity style={[styles.verifyButton, { backgroundColor: c.primary }]} onPress={fetchGps}>
                    <Text style={styles.verifyBtnText}>Get GPS</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}

          {step === 3 && (
            <View style={styles.form}>
              <Input
                label="Total Rooms *"
                value={form.totalRooms}
                onChangeText={(t) => setForm({ ...form, totalRooms: t })}
                placeholder="Total number of rooms"
                keyboardType="numeric"
                leftIcon="bed-outline"
              />
              <Input
                label="Total Capacity *"
                value={form.totalCapacity}
                onChangeText={(t) => setForm({ ...form, totalCapacity: t })}
                placeholder="Total beds / guests capacity"
                keyboardType="numeric"
                leftIcon="people-outline"
              />
              <Text style={[styles.inputLabel, { color: c.text }]}>Hostel Category *</Text>
              <View style={styles.genderRow}>
                {['Men', 'Women', 'Co-Living'].map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[styles.genderBtn, { borderColor: form.category === cat ? c.primary : c.border, backgroundColor: form.category === cat ? c.primary + '10' : 'transparent' }]}
                    onPress={() => setForm({ ...form, category: cat })}
                  >
                    <Text style={{ color: form.category === cat ? c.primary : c.textSecondary, fontWeight: '700', fontSize: 12 }}>{cat}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={[styles.inputLabel, { color: c.text, marginTop: SPACING.xs }]}>Select Amenities</Text>
              <View style={styles.amenitiesGrid}>
                {amenitiesList.map((item) => {
                  const selected = form.amenities.includes(item);
                  return (
                    <TouchableOpacity
                      key={item}
                      style={[styles.amenityChip, { borderColor: selected ? c.primary : c.border, backgroundColor: selected ? c.primary + '10' : 'transparent' }]}
                      onPress={() => toggleAmenity(item)}
                    >
                      <Ionicons name={selected ? "checkbox" : "square-outline"} size={16} color={selected ? c.primary : c.textMuted} />
                      <Text style={{ color: selected ? c.primary : c.textSecondary, fontSize: 12 }}>{item}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}

          {step === 4 && (
            <View style={styles.form}>
              <Text style={[styles.inputLabel, { color: c.text, marginBottom: SPACING.xs }]}>Required Security Clearances *</Text>
              
              <TouchableOpacity
                style={[styles.uploadBox, { borderColor: c.border, backgroundColor: c.card, paddingVertical: SPACING.md }]}
                onPress={() => {
                  setForm({ ...form, tradeLicense: 'trade_license.pdf' });
                  Alert.alert('Uploaded', 'Trade License uploaded.');
                }}
              >
                <Ionicons name="document-text-outline" size={24} color={c.primary} />
                <Text style={[styles.docUploadLabel, { color: c.text }]}>
                  {form.tradeLicense ? '✓ Trade License Attached' : 'Upload Trade License *'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.uploadBox, { borderColor: c.border, backgroundColor: c.card, paddingVertical: SPACING.md }]}
                onPress={() => {
                  setForm({ ...form, buildingPermission: 'building_permission.pdf' });
                  Alert.alert('Uploaded', 'Building permission uploaded.');
                }}
              >
                <Ionicons name="business-outline" size={24} color={c.primary} />
                <Text style={[styles.docUploadLabel, { color: c.text }]}>
                  {form.buildingPermission ? '✓ Building Plan Permission Attached' : 'Upload Building Plan Approval *'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.uploadBox, { borderColor: c.border, backgroundColor: c.card, paddingVertical: SPACING.md }]}
                onPress={() => {
                  setForm({ ...form, fireNoc: 'fire_noc.pdf' });
                  Alert.alert('Uploaded', 'Fire Safety NOC uploaded.');
                }}
              >
                <Ionicons name="flame-outline" size={24} color={c.primary} />
                <Text style={[styles.docUploadLabel, { color: c.text }]}>
                  {form.fireNoc ? '✓ Fire Safety NOC Attached' : 'Upload Fire NOC (if applicable)'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.uploadBox, { borderColor: c.border, backgroundColor: c.card, paddingVertical: SPACING.md }]}
                onPress={() => {
                  setForm({ ...form, gst: 'gst_certificate.pdf' });
                  Alert.alert('Uploaded', 'GSTIN certificate uploaded.');
                }}
              >
                <Ionicons name="receipt-outline" size={24} color={c.primary} />
                <Text style={[styles.docUploadLabel, { color: c.text }]}>
                  {form.gst ? '✓ GST certificate Attached' : 'Upload GST (Optional)'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.uploadBox, { borderColor: c.border, backgroundColor: c.card, paddingVertical: SPACING.md }]}
                onPress={() => {
                  setForm({ ...form, propertyPhotos: 'building_outside.jpg' });
                  Alert.alert('Uploaded', 'Property photo selected.');
                }}
              >
                <Ionicons name="images-outline" size={24} color={c.primary} />
                <Text style={[styles.docUploadLabel, { color: c.text }]}>
                  {form.propertyPhotos ? '✓ Property Photos Attached' : 'Upload Property Photos'}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {step === 5 && (
            <View style={styles.confirmPage}>
              <Ionicons name="shield-outline" size={60} color={c.primary} />
              <Text style={[styles.confirmTitle, { color: c.text }]}>Police Verification Audit</Text>
              <Text style={[styles.confirmDesc, { color: c.textSecondary }]}>
                Your application details and submitted documents will be routed to the local policing authority for background verification.
                {'\n\n'}
                Once reviewed, an officer will conduct physical safety checks of the property before granting the Blue Verified Badge.
              </Text>
            </View>
          )}
        </Card>

        {/* Wizard Navigation */}
        <View style={styles.btnRow}>
          {step > 1 && (
            <Button title="Back" variant="outline" onPress={prevStep} style={{ flex: 1 }} />
          )}
          {step < 5 ? (
            <Button title="Continue" onPress={nextStep} style={{ flex: 2 }} />
          ) : (
            <Button title="Submit for Verification" onPress={handleRegister} loading={loading} style={{ flex: 2 }} />
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  content: { padding: SPACING.md, gap: SPACING.md },
  stepsRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginVertical: SPACING.sm },
  stepDot: { width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  stepNum: { color: '#fff', fontSize: 12, fontWeight: '700' },
  stepLine: { width: 30, height: 2, marginHorizontal: 2 },
  stepTitle: { fontSize: FONT_SIZE.lg, fontWeight: '800', textAlign: 'center' },
  card: { padding: SPACING.md },
  form: { gap: SPACING.sm },
  phoneVerification: { flexDirection: 'row', alignItems: 'flex-end', gap: SPACING.sm },
  verifyButton: { height: 48, paddingHorizontal: SPACING.md, justifyContent: 'center', borderRadius: BORDER_RADIUS.md, marginBottom: 4 },
  verifyBtnText: { color: '#fff', fontWeight: '700', fontSize: 12 },
  verifiedBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: -4, marginBottom: 4 },
  inputLabel: { fontSize: 14, fontWeight: '600', marginBottom: 2 },
  genderRow: { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.xs },
  genderBtn: { flex: 1, height: 40, borderWidth: 1.5, borderRadius: BORDER_RADIUS.md, justifyContent: 'center', alignItems: 'center' },
  amenitiesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: SPACING.xs },
  amenityChip: { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1.5, borderRadius: BORDER_RADIUS.md, paddingHorizontal: 12, paddingVertical: 8 },
  uploadBox: { borderStyle: 'dashed', borderWidth: 2, borderRadius: BORDER_RADIUS.lg, padding: SPACING.xl, alignItems: 'center', gap: 4, marginTop: SPACING.sm },
  uploadTitle: { fontSize: FONT_SIZE.base, fontWeight: '600' },
  uploadDesc: { fontSize: FONT_SIZE.xs },
  docUploadLabel: { fontSize: FONT_SIZE.sm, fontWeight: '700' },
  confirmPage: { alignItems: 'center', padding: SPACING.lg, gap: SPACING.md },
  confirmTitle: { fontSize: FONT_SIZE.xl, fontWeight: '800' },
  confirmDesc: { fontSize: FONT_SIZE.sm, textAlign: 'center', lineHeight: 22 },
  btnRow: { flexDirection: 'row', gap: SPACING.md, marginTop: SPACING.md },
});
