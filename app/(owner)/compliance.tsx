import React from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeStore } from '../../src/store/themeStore';
import { Header } from '../../src/components/ui/Header';
import { Card } from '../../src/components/ui/Card';
import { Badge } from '../../src/components/ui/Badge';
import { BORDER_RADIUS, FONT_SIZE, SPACING } from '../../src/constants/theme';

const COMPLIANCE_ITEMS = [
  { id: 1, label: 'Police Registration', status: 'verified', icon: 'shield-checkmark', expiryDate: '2025-12-31', issuer: 'Hyderabad Police' },
  { id: 2, label: 'Fire Safety Certificate', status: 'verified', icon: 'flame', expiryDate: '2024-06-30', issuer: 'Fire Dept.' },
  { id: 3, label: 'GST Registration', status: 'verified', icon: 'document-text', expiryDate: null, issuer: 'GST Dept.' },
  { id: 4, label: 'Health & Sanitation', status: 'pending', icon: 'medical', expiryDate: null, issuer: 'Municipal Corp.' },
  { id: 5, label: 'Building Occupancy Cert.', status: 'verified', icon: 'business', expiryDate: '2026-03-31', issuer: 'GHMC' },
  { id: 6, label: 'Electrical Safety Audit', status: 'expired', icon: 'flash', expiryDate: '2023-12-31', issuer: 'APCPDCL' },
];

const AUDIT_HISTORY = [
  { date: '2024-01-15', type: 'Police Verification', result: 'Pass', officer: 'SI Ramesh Kumar' },
  { date: '2023-12-10', type: 'Fire Safety', result: 'Pass', officer: 'Fire Inspector Rao' },
  { date: '2023-10-05', type: 'Health Inspection', result: 'Pending', officer: '-' },
];

export default function ComplianceScreen() {
  const { theme } = useThemeStore();
  const c = theme.colors;

  const compliantCount = COMPLIANCE_ITEMS.filter(i => i.status === 'verified').length;
  const pendingCount = COMPLIANCE_ITEMS.filter(i => i.status === 'pending').length;
  const expiredCount = COMPLIANCE_ITEMS.filter(i => i.status === 'expired').length;

  const statusConfig = {
    verified: { variant: 'success' as const, color: '#2E7D32', icon: 'checkmark-circle' },
    pending: { variant: 'warning' as const, color: '#F57C00', icon: 'time' },
    expired: { variant: 'error' as const, color: '#C62828', icon: 'close-circle' },
  };

  const overallScore = Math.round((compliantCount / COMPLIANCE_ITEMS.length) * 100);

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <Header title="Compliance Status" showBack />
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Score Card */}
        <LinearGradient
          colors={overallScore >= 80 ? ['#1B5E20', '#2E7D32'] : overallScore >= 60 ? ['#E65100', '#F57C00'] : ['#B71C1C', '#C62828']}
          style={styles.scoreCard}
        >
          <Text style={styles.scoreTitle}>Compliance Score</Text>
          <Text style={styles.score}>{overallScore}%</Text>
          <Text style={styles.scoreSubtitle}>
            {compliantCount}/{COMPLIANCE_ITEMS.length} documents compliant
          </Text>
          <View style={styles.scoreStats}>
            <View style={styles.scoreStat}>
              <Text style={styles.scoreStatVal}>{compliantCount}</Text>
              <Text style={styles.scoreStatLabel}>Verified</Text>
            </View>
            <View style={styles.scoreStat}>
              <Text style={styles.scoreStatVal}>{pendingCount}</Text>
              <Text style={styles.scoreStatLabel}>Pending</Text>
            </View>
            <View style={styles.scoreStat}>
              <Text style={styles.scoreStatVal}>{expiredCount}</Text>
              <Text style={styles.scoreStatLabel}>Expired</Text>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.content}>
          {/* Compliance Items */}
          <Text style={[styles.sectionTitle, { color: c.text }]}>Compliance Documents</Text>
          {COMPLIANCE_ITEMS.map(item => {
            const config = statusConfig[item.status as keyof typeof statusConfig];
            const isExpiringSoon = item.expiryDate &&
              new Date(item.expiryDate).getTime() - Date.now() < 30 * 86400000;
            return (
              <Card key={item.id} style={styles.complianceCard}>
                <View style={styles.complianceRow}>
                  <View style={[styles.complianceIcon, { backgroundColor: config.color + '15' }]}>
                    <Ionicons name={item.icon as any} size={24} color={config.color} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.complianceLabel, { color: c.text }]}>{item.label}</Text>
                    <Text style={[styles.complianceIssuer, { color: c.textMuted }]}>{item.issuer}</Text>
                    {item.expiryDate && (
                      <Text style={[styles.expiryDate, { color: isExpiringSoon ? c.error : c.textMuted }]}>
                        {isExpiringSoon ? '⚠️ ' : ''}Expires: {new Date(item.expiryDate).toLocaleDateString('en-IN')}
                      </Text>
                    )}
                  </View>
                  <View style={styles.complianceActions}>
                    <Badge label={item.status} variant={config.variant} size="sm" />
                    {item.status !== 'verified' && (
                      <TouchableOpacity style={styles.uploadBtn}>
                        <Ionicons name="cloud-upload-outline" size={16} color={c.primary} />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </Card>
            );
          })}

          {/* Audit History */}
          <Text style={[styles.sectionTitle, { color: c.text, marginTop: SPACING.md }]}>
            Audit History
          </Text>
          <Card>
            <View style={styles.auditHeader}>
              {['Date', 'Type', 'Result', 'Officer'].map(h => (
                <Text key={h} style={[styles.auditHeaderText, { color: c.textMuted }]}>{h}</Text>
              ))}
            </View>
            {AUDIT_HISTORY.map((audit, i) => (
              <View key={i} style={[styles.auditRow, { borderBottomColor: c.border }]}>
                <Text style={[styles.auditCell, { color: c.textSecondary }]}>
                  {new Date(audit.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                </Text>
                <Text style={[styles.auditCell, { color: c.text }]}>{audit.type}</Text>
                <Text style={[styles.auditCell, { color: audit.result === 'Pass' ? c.success : c.warning }]}>
                  {audit.result}
                </Text>
                <Text style={[styles.auditCell, { color: c.textSecondary }]} numberOfLines={1}>
                  {audit.officer}
                </Text>
              </View>
            ))}
          </Card>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scoreCard: { padding: SPACING.xl, alignItems: 'center', paddingBottom: SPACING.xxl },
  scoreTitle: { fontSize: FONT_SIZE.base, color: 'rgba(255,255,255,0.8)', marginBottom: SPACING.sm },
  score: { fontSize: 64, fontWeight: '900', color: '#ffffff', lineHeight: 72 },
  scoreSubtitle: { fontSize: FONT_SIZE.md, color: 'rgba(255,255,255,0.8)', marginBottom: SPACING.lg },
  scoreStats: { flexDirection: 'row', gap: SPACING.xl },
  scoreStat: { alignItems: 'center' },
  scoreStatVal: { fontSize: FONT_SIZE.xxl, fontWeight: '800', color: '#ffffff' },
  scoreStatLabel: { fontSize: FONT_SIZE.xs, color: 'rgba(255,255,255,0.7)' },
  content: { padding: SPACING.md },
  sectionTitle: { fontSize: FONT_SIZE.lg, fontWeight: '700', marginBottom: SPACING.md },
  complianceCard: { marginBottom: SPACING.sm },
  complianceRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  complianceIcon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  complianceLabel: { fontSize: FONT_SIZE.base, fontWeight: '600', marginBottom: 2 },
  complianceIssuer: { fontSize: FONT_SIZE.xs, marginBottom: 2 },
  expiryDate: { fontSize: FONT_SIZE.xs },
  complianceActions: { alignItems: 'flex-end', gap: SPACING.xs },
  uploadBtn: { padding: SPACING.xs },
  auditHeader: { flexDirection: 'row', paddingBottom: SPACING.sm, borderBottomWidth: 1, borderBottomColor: '#e0e0e0', marginBottom: SPACING.xs },
  auditHeaderText: { flex: 1, fontSize: FONT_SIZE.xs, fontWeight: '700', textTransform: 'uppercase' },
  auditRow: { flexDirection: 'row', paddingVertical: SPACING.sm, borderBottomWidth: 1 },
  auditCell: { flex: 1, fontSize: FONT_SIZE.xs },
});
