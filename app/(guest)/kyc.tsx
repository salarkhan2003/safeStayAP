import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '../../src/store/authStore';
import { useThemeStore } from '../../src/store/themeStore';
import { guestsApi } from '../../src/services/mockApi';
import { Header } from '../../src/components/ui/Header';
import { Input } from '../../src/components/ui/Input';
import { Button } from '../../src/components/ui/Button';
import { Badge } from '../../src/components/ui/Badge';
import { Card } from '../../src/components/ui/Card';
import { BORDER_RADIUS, FONT_SIZE, SPACING } from '../../src/constants/theme';

const schema = z.object({
  documentNumber: z.string().min(4, 'Enter valid document number'),
});
type FormData = z.infer<typeof schema>;

const DOC_TYPES = [
  { label: 'Aadhaar Card', value: 'aadhaar', icon: 'card' },
  { label: 'PAN Card', value: 'pan', icon: 'document' },
  { label: 'Passport', value: 'passport', icon: 'newspaper' },
  { label: 'Voter ID', value: 'voter_id', icon: 'people' },
  { label: 'Driving License', value: 'driving_license', icon: 'car' },
];

export default function KYCScreen() {
  const { user, setUser } = useAuthStore();
  const { theme } = useThemeStore();
  const c = theme.colors;
  const [loading, setLoading] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState('');
  const [selectedLang, setSelectedLang] = useState('en');
  const [step, setStep] = useState<'select' | 'details' | 'review' | 'submitted'>('select');

  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const statusConfig = {
    pending: { label: 'Not Submitted', variant: 'warning' as const, icon: 'time-outline' },
    submitted: { label: 'Under Review', variant: 'info' as const, icon: 'hourglass-outline' },
    verified: { label: 'KYC Verified', variant: 'success' as const, icon: 'shield-checkmark' },
    rejected: { label: 'Rejected', variant: 'error' as const, icon: 'close-circle' },
  };

  const currentStatus = statusConfig[user?.kycStatus || 'pending'];

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      await guestsApi.submitKYC(user?.id || '', {
        type: selectedDoc as any,
        documentNumber: data.documentNumber,
        frontImage: 'mock_front_image',
      });
      setUser({ ...user!, kycStatus: 'submitted' });
      setStep('submitted');
    } catch {
      Alert.alert('Error', 'Failed to submit KYC. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (user?.kycStatus === 'verified') {
    return (
      <View style={[styles.container, { backgroundColor: c.background }]}>
        <Header title="KYC Verification" showBack />
        <View style={styles.verified}>
          <LinearGradient colors={['#1B5E20', '#2E7D32']} style={styles.verifiedCard}>
            <Ionicons name="shield-checkmark" size={80} color="#ffffff" />
            <Text style={styles.verifiedTitle}>KYC Verified!</Text>
            <Text style={styles.verifiedSubtitle}>
              Your identity has been verified successfully. You can now access all features.
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 12, backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 }}>
              <Ionicons name="checkmark-circle" size={16} color="#ffffff" />
              <Text style={{ color: '#ffffff', fontSize: 12, fontWeight: '700', marginLeft: 6 }}>Approved by AP Police Department</Text>
            </View>
          </LinearGradient>
        </View>
      </View>
    );
  }

  if (step === 'submitted' || user?.kycStatus === 'submitted') {
    return (
      <View style={[styles.container, { backgroundColor: c.background }]}>
        <Header title="KYC Verification" showBack />
        <View style={styles.verified}>
          <LinearGradient colors={['#0D47A1', '#1565C0']} style={styles.verifiedCard}>
            <Ionicons name="hourglass" size={80} color="#ffffff" />
            <Text style={styles.verifiedTitle}>Under Review</Text>
            <Text style={styles.verifiedSubtitle}>
              Your KYC documents are being reviewed. This usually takes 24-48 hours.
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 12, backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 }}>
              <Ionicons name="shield-half" size={16} color="#ffffff" />
              <Text style={{ color: '#ffffff', fontSize: 12, fontWeight: '700', marginLeft: 6 }}>Pending AP Police Department Approval</Text>
            </View>
          </LinearGradient>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <Header title="KYC Verification" showBack />
      <ScrollView showsVerticalScrollIndicator={false}>
        
        {/* Language Selector */}
        <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 12, paddingVertical: SPACING.sm }}>
          <TouchableOpacity onPress={() => setSelectedLang('en')} style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, backgroundColor: selectedLang === 'en' ? c.primary : 'transparent', borderWidth: 1, borderColor: selectedLang === 'en' ? c.primary : c.border }}>
            <Text style={{ color: selectedLang === 'en' ? '#fff' : c.text, fontSize: 12, fontWeight: '600' }}>English</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setSelectedLang('te')} style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, backgroundColor: selectedLang === 'te' ? c.primary : 'transparent', borderWidth: 1, borderColor: selectedLang === 'te' ? c.primary : c.border }}>
            <Text style={{ color: selectedLang === 'te' ? '#fff' : c.text, fontSize: 12, fontWeight: '600' }}>తెలుగు</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setSelectedLang('hi')} style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, backgroundColor: selectedLang === 'hi' ? c.primary : 'transparent', borderWidth: 1, borderColor: selectedLang === 'hi' ? c.primary : c.border }}>
            <Text style={{ color: selectedLang === 'hi' ? '#fff' : c.text, fontSize: 12, fontWeight: '600' }}>हिन्दी</Text>
          </TouchableOpacity>
        </View>

        {/* Status */}
        <Card style={styles.statusCard}>
          <View style={styles.statusRow}>
            <Ionicons name={currentStatus.icon as any} size={24} color={c.warning} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.statusTitle, { color: c.text }]}>Identity Verification</Text>
              <Text style={[styles.statusDesc, { color: c.textMuted }]}>
                Submit your government ID to unlock all features
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6, gap: 4 }}>
                 <Ionicons name="shield-checkmark" size={14} color="#4CAF50" />
                 <Text style={{ fontSize: 11, color: '#4CAF50', fontWeight: 'bold' }}>Approved by AP Police Department</Text>
              </View>
            </View>
            <Badge label={currentStatus.label} variant={currentStatus.variant} size="sm" />
          </View>
        </Card>

        {/* Steps indicator */}
        <View style={styles.steps}>
          {['Select ID', 'Enter Details', 'Submit'].map((s, i) => {
            const stepNum = ['select', 'details', 'review'].indexOf(step);
            const isActive = i <= stepNum;
            return (
              <React.Fragment key={s}>
                <View style={styles.step}>
                  <View style={[styles.stepDot, { backgroundColor: isActive ? c.primary : c.border }]}>
                    <Text style={styles.stepNum}>{i + 1}</Text>
                  </View>
                  <Text style={[styles.stepLabel, { color: isActive ? c.primary : c.textMuted }]}>{s}</Text>
                </View>
                {i < 2 && <View style={[styles.stepLine, { backgroundColor: i < stepNum ? c.primary : c.border }]} />}
              </React.Fragment>
            );
          })}
        </View>

        <View style={styles.form}>
          {/* Step 1: Select Document Type */}
          {step === 'select' && (
            <>
              <Text style={[styles.formTitle, { color: c.text }]}>Select Document Type</Text>
              {DOC_TYPES.map(doc => (
                <TouchableOpacity
                  key={doc.value}
                  style={[
                    styles.docOption,
                    {
                      backgroundColor: selectedDoc === doc.value ? c.primary + '15' : c.card,
                      borderColor: selectedDoc === doc.value ? c.primary : c.border,
                    },
                  ]}
                  onPress={() => setSelectedDoc(doc.value)}
                >
                  <Ionicons name={doc.icon as any} size={24} color={selectedDoc === doc.value ? c.primary : c.textMuted} />
                  <Text style={[styles.docLabel, { color: c.text }]}>{doc.label}</Text>
                  {selectedDoc === doc.value && (
                    <Ionicons name="checkmark-circle" size={22} color={c.primary} style={{ marginLeft: 'auto' }} />
                  )}
                </TouchableOpacity>
              ))}
              <Button
                title="Continue"
                onPress={() => selectedDoc && setStep('details')}
                disabled={!selectedDoc}
                fullWidth
                style={{ marginTop: SPACING.lg }}
              />
            </>
          )}

          {/* Step 2: Enter Details */}
          {step === 'details' && (
            <>
              <Text style={[styles.formTitle, { color: c.text }]}>Enter Document Details</Text>
              <Controller
                control={control}
                name="documentNumber"
                render={({ field: { onChange, value } }) => (
                  <Input
                    label={`${DOC_TYPES.find(d => d.value === selectedDoc)?.label} Number`}
                    placeholder="Enter document number"
                    value={value}
                    onChangeText={onChange}
                    leftIcon="document-text-outline"
                    error={errors.documentNumber?.message}
                    autoCapitalize="characters"
                  />
                )}
              />

              {/* Mock Upload */}
              <View style={[styles.uploadBox, { borderColor: c.border, backgroundColor: c.card }]}>
                <Ionicons name="camera-outline" size={32} color={c.primary} />
                <Text style={[styles.uploadTitle, { color: c.text }]}>Front of Document</Text>
                <Text style={[styles.uploadDesc, { color: c.textMuted }]}>Tap to capture or upload</Text>
                <Badge label="Mock Upload" variant="info" size="sm" />
              </View>

              <View style={styles.btnRow}>
                <Button title="Back" variant="outline" onPress={() => setStep('select')} style={{ flex: 1 }} />
                <Button
                  title="Review & Submit"
                  onPress={handleSubmit(onSubmit)}
                  loading={loading}
                  style={{ flex: 2 }}
                />
              </View>
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  verified: {
    flex: 1,
    padding: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifiedCard: {
    width: '100%',
    padding: SPACING.xxl,
    borderRadius: BORDER_RADIUS.xl,
    alignItems: 'center',
    gap: SPACING.md,
  },
  verifiedTitle: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: '800',
    color: '#ffffff',
  },
  verifiedSubtitle: {
    fontSize: FONT_SIZE.md,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    lineHeight: 22,
  },
  statusCard: {
    margin: SPACING.md,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  statusTitle: {
    fontSize: FONT_SIZE.base,
    fontWeight: '600',
  },
  statusDesc: {
    fontSize: FONT_SIZE.sm,
    marginTop: 2,
  },
  steps: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    marginBottom: SPACING.lg,
  },
  step: {
    alignItems: 'center',
    gap: SPACING.xs,
  },
  stepDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNum: {
    color: '#fff',
    fontSize: FONT_SIZE.sm,
    fontWeight: '700',
  },
  stepLabel: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '500',
  },
  stepLine: {
    flex: 1,
    height: 2,
    marginHorizontal: SPACING.xs,
    marginBottom: 20,
  },
  form: {
    padding: SPACING.md,
  },
  formTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    marginBottom: SPACING.md,
  },
  docOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1.5,
    marginBottom: SPACING.sm,
  },
  docLabel: {
    fontSize: FONT_SIZE.base,
    fontWeight: '500',
  },
  uploadBox: {
    alignItems: 'center',
    padding: SPACING.xl,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 2,
    borderStyle: 'dashed',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  uploadTitle: {
    fontSize: FONT_SIZE.base,
    fontWeight: '600',
  },
  uploadDesc: {
    fontSize: FONT_SIZE.sm,
  },
  btnRow: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
});
