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
import { mockGuests } from '../../src/data/mockUsers';
import { secureStorage, appStorage } from '../../src/services/storage';

export default function GuestRegisterScreen() {
  const { theme } = useThemeStore();
  const { setUser } = useAuthStore();
  const c = theme.colors;

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form State
  const [form, setForm] = useState({
    // Step 1: Basic
    name: '',
    phone: '',
    otp: '',
    email: '',
    dob: '',
    gender: 'Male',
    // Step 2: Identity
    idType: 'Aadhaar',
    idNumber: '',
    idPhoto: '',
    // Step 3: Safety
    emergencyName: '',
    emergencyPhone: '',
    emergencyRelation: '',
    // Step 4: Address
    address: '',
    city: '',
    state: '',
  });

  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);

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

  const nextStep = () => {
    if (step === 1) {
      if (!form.name || !form.phone || !form.dob) {
        Alert.alert('Error', 'Please fill in Name, Phone and Date of Birth');
        return;
      }
      if (!otpVerified) {
        Alert.alert('Verification Required', 'Please verify your phone number using the demo OTP (123456) before continuing.');
        return;
      }
    }
    if (step === 2) {
      if (!form.idNumber) {
        Alert.alert('Error', 'Please enter your ID document number');
        return;
      }
    }
    if (step === 3) {
      if (!form.emergencyName || !form.emergencyPhone || !form.emergencyRelation) {
        Alert.alert('Error', 'Please fill all Emergency Contact details');
        return;
      }
    }
    if (step === 4) {
      if (!form.address || !form.city || !form.state) {
        Alert.alert('Error', 'Please fill all Permanent Address details');
        return;
      }
    }

    setStep(s => s + 1);
  };

  const prevStep = () => {
    setStep(s => s - 1);
  };

  const handleCreateAccount = async () => {
    setLoading(true);
    try {
      await new Promise(r => setTimeout(r, 1000));
      const newUserId = `guest_${Date.now()}`;
      const token = `mock_token_${newUserId}`;
      const newUser = {
        id: newUserId,
        name: form.name,
        phone: form.phone,
        email: form.email || undefined,
        role: 'guest' as const,
        kycStatus: 'verified' as const, // Guest is active immediately!
        isVerified: true,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
      };

      // Add to mock store
      (mockGuests as any[]).push({
        ...newUser,
        emergencyContacts: [
          {
            id: 'e1',
            name: form.emergencyName,
            phone: form.emergencyPhone,
            relationship: form.emergencyRelation,
          }
        ],
        bookingHistory: [],
      });

      await secureStorage.setToken(token);
      await appStorage.setUserId(newUserId);
      await appStorage.setUserRole('guest');
      setUser(newUser as any);

      Alert.alert('Welcome to SafeStay AP', 'Your guest account is active instantly! Explore stays safely.', [
        { text: 'Start Exploring', onPress: () => router.replace('/(guest)/home') }
      ]);
    } catch {
      Alert.alert('Error', 'Account creation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <Header title="Guest Registration" showBack onBack={() => router.replace('/(auth)/role-entry?role=guest')} />
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
            {step === 1 && 'Step 1: Basic Details'}
            {step === 2 && 'Step 2: Identity Verification'}
            {step === 3 && 'Step 3: Emergency Safety details'}
            {step === 4 && 'Step 4: Permanent Address'}
            {step === 5 && 'Step 5: Account Activation'}
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
                name: 'Aditya Prasad',
                phone: '9876543210',
                otp: '123456',
                email: 'aditya.prasad@gmail.com',
                dob: '15/08/1998',
                gender: 'Male',
                idType: 'Aadhaar',
                idNumber: '5489 1200 4567',
                idPhoto: 'selected_photo.jpg',
                emergencyName: 'Ramesh Prasad',
                emergencyPhone: '9012345678',
                emergencyRelation: 'Father',
                address: 'Plot No 45, Beside AP Police HQ, Mangalagiri',
                city: 'Guntur',
                state: 'Andhra Pradesh',
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
                label="Full Name *"
                value={form.name}
                onChangeText={(t) => setForm({ ...form, name: t })}
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
                label="Email (Optional)"
                value={form.email}
                onChangeText={(t) => setForm({ ...form, email: t })}
                placeholder="your@email.com"
                keyboardType="email-address"
                leftIcon="mail-outline"
              />
              <Input
                label="Date of Birth *"
                value={form.dob}
                onChangeText={(t) => setForm({ ...form, dob: t })}
                placeholder="DD/MM/YYYY"
                leftIcon="calendar-outline"
              />
              <Text style={[styles.inputLabel, { color: c.text }]}>Gender *</Text>
              <View style={styles.genderRow}>
                {['Male', 'Female', 'Other'].map((g) => (
                  <TouchableOpacity
                    key={g}
                    style={[styles.genderBtn, { borderColor: form.gender === g ? c.primary : c.border, backgroundColor: form.gender === g ? c.primary + '10' : 'transparent' }]}
                    onPress={() => setForm({ ...form, gender: g })}
                  >
                    <Text style={{ color: form.gender === g ? c.primary : c.textSecondary, fontWeight: '700' }}>{g}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {step === 2 && (
            <View style={styles.form}>
              <Text style={[styles.inputLabel, { color: c.text}]}>Select ID Proof Type *</Text>
              <View style={styles.genderRow}>
                {['Aadhaar', 'Passport', 'Driving License'].map((id) => (
                  <TouchableOpacity
                    key={id}
                    style={[styles.genderBtn, { borderColor: form.idType === id ? c.primary : c.border, backgroundColor: form.idType === id ? c.primary + '10' : 'transparent' }]}
                    onPress={() => setForm({ ...form, idType: id })}
                  >
                    <Text style={{ color: form.idType === id ? c.primary : c.textSecondary, fontWeight: '700', fontSize: 12 }}>{id}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Input
                label="ID Document Number *"
                value={form.idNumber}
                onChangeText={(t) => setForm({ ...form, idNumber: t })}
                placeholder="Enter document number"
                autoCapitalize="characters"
                leftIcon="card-outline"
              />
              <TouchableOpacity
                style={[styles.uploadBox, { borderColor: c.border, backgroundColor: c.card }]}
                onPress={() => {
                  setForm({ ...form, idPhoto: 'selected_photo.jpg' });
                  Alert.alert('Success', 'ID photo uploaded successfully (Mock).');
                }}
              >
                <Ionicons name="camera-outline" size={32} color={c.primary} />
                <Text style={[styles.uploadTitle, { color: c.text }]}>Upload ID Photo *</Text>
                <Text style={[styles.uploadDesc, { color: c.textMuted }]}>
                  {form.idPhoto ? 'selected_photo.jpg' : 'Tap to snap or select front side'}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {step === 3 && (
            <View style={styles.form}>
              <Input
                label="Emergency Contact Name *"
                value={form.emergencyName}
                onChangeText={(t) => setForm({ ...form, emergencyName: t })}
                placeholder="Contact person name"
                leftIcon="person-outline"
              />
              <Input
                label="Emergency Contact Number *"
                value={form.emergencyPhone}
                onChangeText={(t) => setForm({ ...form, emergencyPhone: t })}
                placeholder="10-digit number"
                keyboardType="phone-pad"
                leftIcon="call-outline"
              />
              <Input
                label="Relationship *"
                value={form.emergencyRelation}
                onChangeText={(t) => setForm({ ...form, emergencyRelation: t })}
                placeholder="e.g. Parent / Spouse / Brother"
                leftIcon="people-outline"
              />
            </View>
          )}

          {step === 4 && (
            <View style={styles.form}>
              <Input
                label="Permanent Address *"
                value={form.address}
                onChangeText={(t) => setForm({ ...form, address: t })}
                placeholder="Flat / Street / Area"
                leftIcon="home-outline"
              />
              <Input
                label="City *"
                value={form.city}
                onChangeText={(t) => setForm({ ...form, city: t })}
                placeholder="City"
                leftIcon="navigate-outline"
              />
              <Input
                label="State *"
                value={form.state}
                onChangeText={(t) => setForm({ ...form, state: t })}
                placeholder="State"
                leftIcon="map-outline"
              />
            </View>
          )}

          {step === 5 && (
            <View style={styles.confirmPage}>
              <Ionicons name="shield-checkmark" size={60} color="#4CAF50" />
              <Text style={[styles.confirmTitle, { color: c.text }]}>Verify & Activate</Text>
              <Text style={[styles.confirmDesc, { color: c.textSecondary }]}>
                By clicking activate, your details will be logged into the SafeStay AP verified database. Your account will become instantly active with a Verified badge.
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
            <Button title="Create Account" onPress={handleCreateAccount} loading={loading} style={{ flex: 2 }} />
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
  uploadBox: { borderStyle: 'dashed', borderWidth: 2, borderRadius: BORDER_RADIUS.lg, padding: SPACING.xl, alignItems: 'center', gap: 4, marginTop: SPACING.sm },
  uploadTitle: { fontSize: FONT_SIZE.base, fontWeight: '600' },
  uploadDesc: { fontSize: FONT_SIZE.xs },
  confirmPage: { alignItems: 'center', padding: SPACING.lg, gap: SPACING.md },
  confirmTitle: { fontSize: FONT_SIZE.xl, fontWeight: '800' },
  confirmDesc: { fontSize: FONT_SIZE.sm, textAlign: 'center', lineHeight: 22 },
  btnRow: { flexDirection: 'row', gap: SPACING.md, marginTop: SPACING.md },
});
