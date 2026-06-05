import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Alert, TextInput, Modal
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../../src/store/authStore';
import { useThemeStore } from '../../src/store/themeStore';
import { travelersApi } from '../../src/services/mockApi';
import { Header } from '../../src/components/ui/Header';
import { Button } from '../../src/components/ui/Button';
import { Card } from '../../src/components/ui/Card';
import { BORDER_RADIUS, FONT_SIZE, SPACING, SHADOW } from '../../src/constants/theme';

export default function MyTravelersScreen() {
  const { user } = useAuthStore();
  const { theme } = useThemeStore();
  const c = theme.colors;
  const queryClient = useQueryClient();

  // Dialog Form State
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [relationship, setRelationship] = useState('Friend');
  const [customRelationship, setCustomRelationship] = useState('');
  const [idType, setIdType] = useState<'aadhaar' | 'pan' | 'passport' | 'voter_id' | 'driving_license'>('aadhaar');
  const [idNumber, setIdNumber] = useState('');
  const [docCopy, setDocCopy] = useState('');
  const [uploadingDoc, setUploadingDoc] = useState(false);

  // Fetch travelers
  const { data: travelers, isLoading } = useQuery({
    queryKey: ['savedTravelers', user?.id],
    queryFn: () => travelersApi.getByUser(user?.id || ''),
    enabled: !!user?.id,
  });

  const saveMutation = useMutation({
    mutationFn: (data: any) => travelersApi.save(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savedTravelers'] });
      setModalVisible(false);
      resetForm();
    },
    onError: () => {
      Alert.alert('Error', 'Failed to save traveler. Please check fields.');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => travelersApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savedTravelers'] });
    }
  });

  const resetForm = () => {
    setEditingId(null);
    setName('');
    setPhone('');
    setRelationship('Friend');
    setCustomRelationship('');
    setIdType('aadhaar');
    setIdNumber('');
    setDocCopy('');
    setUploadingDoc(false);
  };

  const handleEdit = (traveler: any) => {
    setEditingId(traveler.id);
    setName(traveler.name);
    setPhone(traveler.phone);
    const standardRelations = ['Spouse', 'Parent', 'Brother', 'Sister', 'Friend', 'Child'];
    if (standardRelations.includes(traveler.relationship)) {
      setRelationship(traveler.relationship);
      setCustomRelationship('');
    } else {
      setRelationship('Other');
      setCustomRelationship(traveler.relationship);
    }
    setIdType(traveler.idType);
    setIdNumber(traveler.idNumber);
    setDocCopy(traveler.photoUrl || '');
    setModalVisible(true);
  };

  const handleSave = () => {
    if (!name.trim() || !phone.trim() || !idNumber.trim()) {
      Alert.alert('Fields Required', 'Please fill name, phone, and identity document number.');
      return;
    }
    if (!docCopy) {
      Alert.alert(
        'Document Upload Required',
        `Please upload a scanned image or PDF copy of the traveler's ${idType.toUpperCase()} document for SafeStay clearance.`
      );
      return;
    }
    if (relationship === 'Other' && !customRelationship.trim()) {
      Alert.alert('Required Fields', 'Please specify the relationship.');
      return;
    }
    const finalRelationship = relationship === 'Other' ? customRelationship.trim() : relationship;
    
    saveMutation.mutate({
      id: editingId || undefined,
      userId: user?.id || '',
      name,
      phone,
      relationship: finalRelationship,
      idType,
      idNumber,
      photoUrl: docCopy,
    });
  };

  const handleDelete = (id: string, travelerName: string) => {
    Alert.alert('Delete Traveler', `Are you sure you want to remove ${travelerName}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteMutation.mutate(id) }
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <Header title="My Saved Travelers" showBack onBack={() => router.replace('/(guest)/profile')} />
      
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.introText, { color: c.textSecondary }]}>
          Save details of family, friends, and co-workers to quickly add them as co-guests when booking accommodations.
        </Text>

        <TouchableOpacity 
          style={[styles.addCard, { borderColor: c.primary, backgroundColor: c.primary + '08' }]}
          onPress={() => { resetForm(); setModalVisible(true); }}
        >
          <Ionicons name="add-circle" size={24} color={c.primary} />
          <Text style={[styles.addCardText, { color: c.primary }]}>Add New Traveler Profile</Text>
        </TouchableOpacity>

        {isLoading ? (
          <Text style={[styles.statusText, { color: c.textMuted }]}>Loading saved profiles...</Text>
        ) : travelers && travelers.length > 0 ? (
          travelers.map((t) => (
            <Card key={t.id} style={styles.travelerCard}>
              <View style={styles.travelerHeader}>
                <View style={styles.travelerAvatar}>
                  <Ionicons name="person" size={22} color={c.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.travelerName, { color: c.text }]}>{t.name}</Text>
                  <Text style={[styles.travelerPhone, { color: c.textSecondary }]}>
                    {t.relationship} · {t.phone}
                  </Text>
                </View>
                <View style={styles.actionRow}>
                  <TouchableOpacity onPress={() => handleEdit(t)} style={styles.actionBtn}>
                    <Ionicons name="pencil" size={16} color={c.primary} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDelete(t.id, t.name)} style={styles.actionBtn}>
                    <Ionicons name="trash" size={16} color={c.error} />
                  </TouchableOpacity>
                </View>
              </View>
              
              <View style={[styles.identityRow, { backgroundColor: c.background }]}>
                <Ionicons name="card-outline" size={16} color={c.textMuted} />
                <Text style={[styles.identityText, { color: c.textSecondary }]}>
                  {t.idType.toUpperCase()}: {t.idNumber.replace(/.(?=.{4})/g, '•')}
                </Text>
                <View style={{ flexDirection: 'row', gap: 4 }}>
                  {t.photoUrl ? (
                    <View style={[styles.verifiedBadge, { backgroundColor: c.primary + '15' }]}>
                      <Ionicons name="document-attach" size={10} color={c.primary} />
                      <Text style={[styles.verifiedText, { color: c.primary }]}>Doc Copy</Text>
                    </View>
                  ) : null}
                  <View style={styles.verifiedBadge}>
                    <Ionicons name="shield-checkmark" size={10} color="#059669" />
                    <Text style={styles.verifiedText}>Ready</Text>
                  </View>
                </View>
              </View>
            </Card>
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="people" size={48} color={c.textMuted} />
            <Text style={[styles.emptyText, { color: c.textMuted }]}>No saved travelers found.</Text>
          </View>
        )}
      </ScrollView>

      {/* Add / Edit Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: c.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: c.text }]}>
                {editingId ? 'Edit Traveler Details' : 'Add Saved Traveler'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={c.text} />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.formContainer}>
              <Text style={[styles.label, { color: c.textSecondary }]}>Full Name (As in ID document)</Text>
              <TextInput 
                style={[styles.input, { borderColor: c.border, color: c.text }]}
                value={name}
                onChangeText={setName}
                placeholder="Enter traveler's full name"
                placeholderTextColor={c.textMuted}
              />

              <Text style={[styles.label, { color: c.textSecondary }]}>Mobile Number</Text>
              <TextInput 
                style={[styles.input, { borderColor: c.border, color: c.text }]}
                value={phone}
                onChangeText={setPhone}
                placeholder="+91 9XXXX XXXXX"
                placeholderTextColor={c.textMuted}
                keyboardType="phone-pad"
              />

              <Text style={[styles.label, { color: c.textSecondary }]}>Relationship</Text>
              <View style={styles.relationsRow}>
                {['Spouse', 'Parent', 'Brother', 'Sister', 'Friend', 'Child', 'Other'].map((r) => (
                  <TouchableOpacity
                    key={r}
                    style={[
                      styles.relationChip,
                      {
                        borderColor: relationship === r ? c.primary : c.border,
                        backgroundColor: relationship === r ? c.primary + '12' : 'transparent',
                      }
                    ]}
                    onPress={() => setRelationship(r)}
                  >
                    <Text style={{ color: relationship === r ? c.primary : c.textSecondary, fontWeight: '600', fontSize: 13 }}>{r}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              {relationship === 'Other' && (
                <TextInput 
                  style={[styles.input, { borderColor: c.border, color: c.text, marginTop: 4, marginBottom: 8 }]}
                  value={customRelationship}
                  onChangeText={setCustomRelationship}
                  placeholder="Please specify relationship"
                  placeholderTextColor={c.textMuted}
                />
              )}

              <Text style={[styles.label, { color: c.textSecondary }]}>ID Document Type</Text>
              <View style={styles.relationsRow}>
                {['aadhaar', 'pan', 'passport', 'voter_id', 'driving_license'].map((t) => (
                  <TouchableOpacity
                    key={t}
                    style={[
                      styles.relationChip,
                      {
                        borderColor: idType === t ? c.primary : c.border,
                        backgroundColor: idType === t ? c.primary + '12' : 'transparent',
                      }
                    ]}
                    onPress={() => setIdType(t as any)}
                  >
                    <Text style={{ color: idType === t ? c.primary : c.textSecondary, fontWeight: '600', fontSize: 12 }}>
                      {t === 'voter_id' ? 'Voter ID' : t === 'driving_license' ? 'License' : t.toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={[styles.label, { color: c.textSecondary }]}>Document ID Number</Text>
              <TextInput 
                style={[styles.input, { borderColor: c.border, color: c.text }]}
                value={idNumber}
                onChangeText={setIdNumber}
                placeholder="Enter verified ID number"
                placeholderTextColor={c.textMuted}
                autoCapitalize="characters"
              />

              <Text style={[styles.label, { color: c.textSecondary, marginTop: 10 }]}>Document copy (Image/PDF) *</Text>
              {docCopy ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderColor: '#059669', borderRadius: BORDER_RADIUS.md, padding: 10, backgroundColor: '#ecfdf5', marginTop: 4 }}>
                  <Ionicons name="document-attach" size={20} color="#059669" />
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 13, fontWeight: '700', color: '#059669' }}>
                      {idType.toUpperCase()}_COPY_{idNumber || 'DOC'}.jpg
                    </Text>
                    <Text style={{ fontSize: 10, color: '#059669' }}>2.4 MB · Uploaded & Encrypted</Text>
                  </View>
                  <TouchableOpacity onPress={() => setDocCopy('')}>
                    <Ionicons name="trash" size={18} color={c.error} />
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  style={{
                    height: 72, borderWidth: 1.5, borderStyle: 'dashed', borderColor: c.border, borderRadius: BORDER_RADIUS.md,
                    alignItems: 'center', justifyContent: 'center', backgroundColor: c.background, marginTop: 4, gap: 4
                  }}
                  onPress={async () => {
                    setUploadingDoc(true);
                    await new Promise(r => setTimeout(r, 1200));
                    setUploadingDoc(false);
                    setDocCopy(`mock_upload_copy_${idType}_${Date.now()}.jpg`);
                    Alert.alert('Upload Complete', `Your ${idType.toUpperCase()} document has been scanned and OCR verified.`);
                  }}
                  disabled={uploadingDoc}
                >
                  {uploadingDoc ? (
                    <Text style={{ fontSize: 13, color: c.textSecondary, fontWeight: '600' }}>Uploading document copy...</Text>
                  ) : (
                    <>
                      <Ionicons name="cloud-upload-outline" size={22} color={c.primary} />
                      <Text style={{ fontSize: 12, color: c.primary, fontWeight: '700' }}>
                        Upload Document Image / PDF
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              )}

              <Button 
                title={editingId ? 'Update Profile' : 'Save Traveler'} 
                onPress={handleSave} 
                loading={saveMutation.isPending}
                style={{ marginTop: SPACING.md }}
              />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: SPACING.md, gap: SPACING.md },
  introText: { fontSize: 13, lineHeight: 18, marginBottom: 4 },
  addCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    gap: SPACING.sm,
  },
  addCardText: { fontWeight: '700', fontSize: FONT_SIZE.md },
  statusText: { textAlign: 'center', marginVertical: SPACING.lg },
  travelerCard: { padding: SPACING.md },
  travelerHeader: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  travelerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(57,73,171,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  travelerName: { fontSize: FONT_SIZE.md, fontWeight: '700' },
  travelerPhone: { fontSize: FONT_SIZE.sm, marginTop: 2 },
  actionRow: { flexDirection: 'row', gap: 6 },
  actionBtn: { padding: 8, borderRadius: BORDER_RADIUS.sm, backgroundColor: 'rgba(0,0,0,0.03)' },
  identityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 8,
    borderRadius: BORDER_RADIUS.sm,
    marginTop: SPACING.sm,
    gap: 6,
  },
  identityText: { fontSize: 12, fontWeight: '600', flex: 1 },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(5,150,105,0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
  },
  verifiedText: { color: '#059669', fontSize: 10, fontWeight: '700' },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 48, gap: SPACING.sm },
  emptyText: { fontSize: FONT_SIZE.md },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.06)',
  },
  modalTitle: { fontSize: FONT_SIZE.lg, fontWeight: '700' },
  formContainer: { padding: SPACING.md, gap: SPACING.sm },
  label: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    fontSize: FONT_SIZE.md,
  },
  relationsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 4 },
  relationChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
  },
});
