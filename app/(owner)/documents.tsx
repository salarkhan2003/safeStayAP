import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore } from '../../src/store/themeStore';
import { Header } from '../../src/components/ui/Header';
import { Card } from '../../src/components/ui/Card';
import { Badge } from '../../src/components/ui/Badge';
import { BORDER_RADIUS, FONT_SIZE, SPACING } from '../../src/constants/theme';

export default function DocumentsScreen() {
  const { theme } = useThemeStore();
  const c = theme.colors;

  const [docs, setDocs] = useState([
    { id: '1', name: 'Trade License', status: 'verified', file: 'trade_license_2024.pdf' },
    { id: '2', name: 'GSTIN Certificate', status: 'verified', file: 'gst_cert.pdf' },
    { id: '3', name: 'Fire Safety NOC', status: 'pending', file: 'fire_noc_draft.pdf' },
  ]);

  const handleUpload = (docName: string) => {
    Alert.alert('Upload Document', `Simulating file upload for ${docName}. File selected successfully!`);
  };

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <Header title="Business Documents" showBack onBack={() => router.replace('/(owner)/settings')} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={[styles.sectionTitle, { color: c.text }]}>Submitted Documents</Text>

        {docs.map((doc) => (
          <Card key={doc.id} style={styles.docCard}>
            <View style={styles.docHeader}>
              <Ionicons name="document-text-outline" size={24} color={c.primary} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.docName, { color: c.text }]}>{doc.name}</Text>
                <Text style={[styles.docFile, { color: c.textMuted }]}>{doc.file}</Text>
              </View>
              <Badge
                label={doc.status === 'verified' ? 'Verified' : 'Pending Review'}
                variant={doc.status === 'verified' ? 'success' : 'warning'}
                size="sm"
              />
            </View>
          </Card>
        ))}

        <Text style={[styles.sectionTitle, { color: c.text, marginTop: SPACING.md }]}>Add New Documents</Text>
        <Card style={styles.uploadCard}>
          <TouchableOpacity style={[styles.uploadBox, { borderColor: c.border }]} onPress={() => handleUpload('Property Tax Receipt')}>
            <Ionicons name="cloud-upload-outline" size={32} color={c.primary} />
            <Text style={[styles.uploadText, { color: c.text }]}>Property Tax Receipt</Text>
            <Text style={[styles.uploadSub, { color: c.textMuted }]}>Upload recent municipal tax receipt</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.uploadBox, { borderColor: c.border }]} onPress={() => handleUpload('Building Plan Approval')}>
            <Ionicons name="cloud-upload-outline" size={32} color={c.primary} />
            <Text style={[styles.uploadText, { color: c.text }]}>Building Plan Approval</Text>
            <Text style={[styles.uploadSub, { color: c.textMuted }]}>Approved architectural layout blueprint</Text>
          </TouchableOpacity>
        </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: SPACING.md, gap: SPACING.md },
  sectionTitle: { fontSize: FONT_SIZE.md, fontWeight: '700' },
  docCard: { padding: SPACING.md },
  docHeader: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  docName: { fontSize: FONT_SIZE.base, fontWeight: '700' },
  docFile: { fontSize: FONT_SIZE.xs, marginTop: 2 },
  uploadCard: { gap: SPACING.md },
  uploadBox: { borderStyle: 'dashed', borderWidth: 2, borderRadius: BORDER_RADIUS.md, padding: SPACING.md, alignItems: 'center', gap: 4 },
  uploadText: { fontSize: FONT_SIZE.base, fontWeight: '600', marginTop: 4 },
  uploadSub: { fontSize: FONT_SIZE.xs },
});
