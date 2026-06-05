import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useAuthStore } from '../../src/store/authStore';
import { useThemeStore } from '../../src/store/themeStore';
import { Header } from '../../src/components/ui/Header';
import { Input } from '../../src/components/ui/Input';
import { Button } from '../../src/components/ui/Button';
import { Badge } from '../../src/components/ui/Badge';
import { Card } from '../../src/components/ui/Card';
import { BORDER_RADIUS, FONT_SIZE, SPACING, SHADOW } from '../../src/constants/theme';

export default function OwnerKYCScreen() {
  const { user, setUser } = useAuthStore();
  const { theme } = useThemeStore();
  const c = theme.colors;
  const [loading, setLoading] = useState(false);

  // Initial form values populated from user object if they exist
  const [form, setForm] = useState({
    businessName: (user as any)?.businessName || '',
    gstNumber: (user as any)?.gstNumber || '',
    panNumber: (user as any)?.panNumber || '',
    tradeLicense: 'trade_license.pdf',
  });

  const [step, setStep] = useState<'details' | 'upload'>('details');

  const statusConfig = {
    pending: { label: 'Not Submitted', variant: 'warning' as const, icon: 'time-outline' },
    submitted: { label: 'Under Review', variant: 'info' as const, icon: 'hourglass-outline' },
    verified: { label: 'Business Verified', variant: 'success' as const, icon: 'shield-checkmark' },
    rejected: { label: 'Rejected', variant: 'error' as const, icon: 'close-circle' },
  };

  const currentStatus = statusConfig[user?.kycStatus || 'pending'];

  const handleSubmit = async () => {
    if (!form.businessName || !form.gstNumber || !form.panNumber) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setUser({
        ...user!,
        kycStatus: 'submitted',
        isVerified: false,
        businessName: form.businessName,
        gstNumber: form.gstNumber,
        panNumber: form.panNumber,
      } as any);
      Alert.alert('Success', 'KYC details submitted for police verification!');
    }, 1000);
  };

  const handleResetKyc = () => {
    setUser({
      ...user!,
      kycStatus: 'pending',
      isVerified: false,
      businessName: '',
      gstNumber: '',
      panNumber: '',
    } as any);
    setForm({
      businessName: '',
      gstNumber: '',
      panNumber: '',
      tradeLicense: '',
    });
    setStep('details');
  };

  const goBackAction = () => {
    router.replace('/(owner)/settings');
  };

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <Header title="Business KYC" showBack onBack={goBackAction} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* Status Card */}
        <Card style={styles.statusCard}>
          <View style={styles.statusRow}>
            <Ionicons name={currentStatus.icon as any} size={32} color={user?.kycStatus === 'verified' ? '#2E7D32' : user?.kycStatus === 'rejected' ? '#D32F2F' : '#0D47A1'} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.statusTitle, { color: c.text }]}>Verification Status</Text>
              <Text style={[styles.statusDesc, { color: c.textMuted }]}>
                {user?.kycStatus === 'verified' && 'Your properties are active & verified.'}
                {user?.kycStatus === 'submitted' && 'Audit in progress by NTR Police Commissionerate.'}
                {user?.kycStatus === 'rejected' && 'KYC Documents rejected. Please re-submit.'}
                {(!user?.kycStatus || user?.kycStatus === 'pending') && 'Please enter business details & submit for review.'}
              </Text>
            </View>
            <Badge label={currentStatus.label} variant={currentStatus.variant} size="sm" />
          </View>
        </Card>

        {/* KYC Form (Visible when status is pending or rejected) */}
        {(user?.kycStatus === 'pending' || user?.kycStatus === 'rejected' || !user?.kycStatus) ? (
          <View style={styles.formSection}>
            {step === 'details' ? (
              <View style={styles.form}>
                <Text style={[styles.sectionTitle, { color: c.text }]}>Step 1: Enter Business Details</Text>
                <Input
                  label="Business/PG Name *"
                  value={form.businessName}
                  onChangeText={(t) => setForm({ ...form, businessName: t })}
                  placeholder="e.g. Sri Balaji PG Accommodations"
                  leftIcon="business-outline"
                />
                <Input
                  label="GSTIN Number *"
                  value={form.gstNumber}
                  onChangeText={(t) => setForm({ ...form, gstNumber: t })}
                  placeholder="e.g. 37AAAAA0000A1Z5"
                  autoCapitalize="characters"
                  leftIcon="receipt-outline"
                />
                <Input
                  label="Owner PAN Number *"
                  value={form.panNumber}
                  onChangeText={(t) => setForm({ ...form, panNumber: t })}
                  placeholder="e.g. ABCDE1234F"
                  autoCapitalize="characters"
                  leftIcon="card-outline"
                />
                <Button title="Continue to Uploads" onPress={() => {
                  if (!form.businessName || !form.gstNumber || !form.panNumber) {
                    Alert.alert('Error', 'Please fill all required fields');
                    return;
                  }
                  setStep('upload');
                }} style={{ marginTop: SPACING.md }} />
              </View>
            ) : (
              <View style={styles.form}>
                <Text style={[styles.sectionTitle, { color: c.text }]}>Step 2: Upload Documents</Text>
                <TouchableOpacity
                  style={[styles.uploadBox, { borderColor: c.border, backgroundColor: c.card }]}
                  onPress={() => {
                    setForm({ ...form, tradeLicense: 'trade_license.pdf' });
                    Alert.alert('Success', 'Trade license selected.');
                  }}
                >
                  <Ionicons name="cloud-upload-outline" size={36} color={c.primary} />
                  <Text style={[styles.uploadTitle, { color: c.text }]}>Business Registration / Trade License *</Text>
                  <Text style={[styles.uploadDesc, { color: c.textMuted }]}>
                    {form.tradeLicense ? '✓ trade_license.pdf attached' : 'Upload PDF or Image'}
                  </Text>
                  <Badge label="Required" variant="warning" size="sm" />
                </TouchableOpacity>

                <View style={styles.btnRow}>
                  <Button title="Back" variant="outline" onPress={() => setStep('details')} style={{ flex: 1 }} />
                  <Button title="Submit KYC for Review" onPress={handleSubmit} loading={loading} style={{ flex: 2 }} />
                </View>
              </View>
            )}
          </View>
        ) : (
          /* Submitted Details View */
          <View style={styles.detailsSection}>
            <Card style={styles.detailsCard}>
              <Text style={[styles.detailsHeader, { color: c.text }]}>Submitted KYC Details</Text>
              
              <View style={[styles.detailRow, { borderBottomColor: c.border }]}>
                <Text style={[styles.detailLabel, { color: c.textMuted }]}>Business Name</Text>
                <Text style={[styles.detailVal, { color: c.text }]}>{(user as any)?.businessName || 'Sri Balaji PG'}</Text>
              </View>
              
              <View style={[styles.detailRow, { borderBottomColor: c.border }]}>
                <Text style={[styles.detailLabel, { color: c.textMuted }]}>GSTIN Number</Text>
                <Text style={[styles.detailVal, { color: c.text }]}>{(user as any)?.gstNumber || '37AAAAA0000A1Z5'}</Text>
              </View>

              <View style={[styles.detailRow, { borderBottomColor: c.border }]}>
                <Text style={[styles.detailLabel, { color: c.textMuted }]}>PAN Number</Text>
                <Text style={[styles.detailVal, { color: c.text }]}>{(user as any)?.panNumber || 'ABCDE1234F'}</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: c.textMuted }]}>Trade License Doc</Text>
                <Text style={[styles.detailVal, { color: c.primary, fontWeight: '700' }]}>trade_license.pdf</Text>
              </View>
            </Card>

            {/* Sim Review / Action buttons */}
            {user?.kycStatus === 'submitted' && (
              <Card style={styles.simCard}>
                <Text style={styles.simHeader}>AP Police Review Simulator</Text>
                <Text style={styles.simDesc}>
                  As NTR District Police Auditing authority, you can approve this physical check compliance request.
                </Text>
                <View style={styles.simBtnRow}>
                  <TouchableOpacity
                    style={[styles.simBtn, { backgroundColor: '#2E7D32' }]}
                    onPress={() => {
                      setUser({ ...user, kycStatus: 'verified', isVerified: true } as any);
                      Alert.alert('Approved', 'Business KYC and PG details approved successfully!');
                    }}
                  >
                    <Text style={styles.simBtnText}>Approve Badge</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.simBtn, { backgroundColor: '#D32F2F' }]}
                    onPress={() => {
                      setUser({ ...user, kycStatus: 'rejected', isVerified: false } as any);
                      Alert.alert('Rejected', 'Business KYC rejected. Requiring owner re-submission.');
                    }}
                  >
                    <Text style={styles.simBtnText}>Reject</Text>
                  </TouchableOpacity>
                </View>
              </Card>
            )}

            <Button title="Re-submit KYC / Reset Form" variant="outline" onPress={handleResetKyc} style={{ marginTop: SPACING.md }} />
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: SPACING.md, gap: SPACING.md },
  statusCard: { padding: SPACING.md },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  statusTitle: { fontSize: FONT_SIZE.base, fontWeight: '700' },
  statusDesc: { fontSize: FONT_SIZE.xs, marginTop: 4, lineHeight: 18 },
  formSection: { gap: SPACING.md },
  form: { gap: SPACING.sm },
  sectionTitle: { fontSize: FONT_SIZE.md, fontWeight: '700', marginBottom: SPACING.xs },
  uploadBox: { alignItems: 'center', padding: SPACING.xl, borderRadius: BORDER_RADIUS.lg, borderWidth: 2, borderStyle: 'dashed', gap: SPACING.sm, marginBottom: SPACING.lg },
  uploadTitle: { fontSize: FONT_SIZE.base, fontWeight: '700', textAlign: 'center' },
  uploadDesc: { fontSize: FONT_SIZE.sm },
  btnRow: { flexDirection: 'row', gap: SPACING.md },
  detailsSection: { gap: SPACING.md },
  detailsCard: { padding: SPACING.md },
  detailsHeader: { fontSize: FONT_SIZE.md, fontWeight: '700', marginBottom: SPACING.md },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: SPACING.sm, borderBottomWidth: 1 },
  detailLabel: { fontSize: FONT_SIZE.sm },
  detailVal: { fontSize: FONT_SIZE.sm, fontWeight: '600' },
  simCard: { padding: SPACING.md, borderStyle: 'solid', borderWidth: 1, borderColor: '#1976d2', marginTop: SPACING.sm },
  simHeader: { fontSize: 13, fontWeight: '800', color: '#1565C0', textTransform: 'uppercase', marginBottom: 4 },
  simDesc: { fontSize: 12, color: '#37474F', lineHeight: 18, marginBottom: SPACING.md },
  simBtnRow: { flexDirection: 'row', gap: SPACING.sm },
  simBtn: { flex: 1, paddingVertical: 10, borderRadius: BORDER_RADIUS.md, alignItems: 'center' },
  simBtnText: { color: '#ffffff', fontWeight: '800', fontSize: 12 },
});
