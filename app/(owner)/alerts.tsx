import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '../../src/store/authStore';
import { useThemeStore } from '../../src/store/themeStore';
import { propertiesApi, alertsApi } from '../../src/services/mockApi';
import { Card } from '../../src/components/ui/Card';
import { Badge } from '../../src/components/ui/Badge';
import { EmptyState } from '../../src/components/ui/EmptyState';
import { BORDER_RADIUS, FONT_SIZE, SPACING } from '../../src/constants/theme';
import type { Alert as AlertType } from '../../src/types';

export default function OwnerAlertsScreen() {
  const { user } = useAuthStore();
  const { theme } = useThemeStore();
  const c = theme.colors;
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const [showResolved, setShowResolved] = useState(false);

  const { data: alerts, isLoading, refetch } = useQuery({
    queryKey: ['alerts-owner', user?.id],
    queryFn: async () => {
      const props = await propertiesApi.getByOwner(user?.id || '');
      const arrays = await Promise.all(props.map(p => alertsApi.getByProperty(p.id)));
      return arrays.flat().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    },
    enabled: !!user?.id,
    refetchInterval: 30000,
  });

  const resolveMutation = useMutation({
    mutationFn: alertsApi.resolve,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts-owner'] });
      Alert.alert('Resolved', 'Alert has been marked as resolved.');
    },
  });

  const filtered = (alerts || []).filter(a => showResolved ? true : !a.isResolved);

  const severityConfig = {
    sos: { label: 'SOS', variant: 'error' as const, icon: 'alert-circle', color: '#C62828', bg: '#FFEBEE' },
    critical: { label: 'Critical', variant: 'error' as const, icon: 'warning', color: '#E65100', bg: '#FFF3E0' },
    warning: { label: 'Warning', variant: 'warning' as const, icon: 'warning-outline', color: '#F57C00', bg: '#FFF8E1' },
    info: { label: 'Info', variant: 'info' as const, icon: 'information-circle', color: '#1565C0', bg: '#E3F2FD' },
  };

  const renderAlert = ({ item: alert }: { item: AlertType }) => {
    const config = severityConfig[alert.severity] || severityConfig.info;
    return (
      <Card
        style={alert.severity === 'sos'
          ? { ...styles.alertCard, borderLeftWidth: 4, borderLeftColor: '#C62828' }
          : styles.alertCard}
        variant={alert.severity === 'sos' ? 'flat' : 'default'}
      >
        {alert.severity === 'sos' && !alert.isResolved && (
          <View style={styles.sosBanner}>
            <Ionicons name="alert-circle" size={16} color="#C62828" />
            <Text style={styles.sosBannerText}>🚨 EMERGENCY - Immediate Response Required</Text>
          </View>
        )}

        <View style={styles.alertHeader}>
          <View style={[styles.alertIcon, { backgroundColor: config.bg }]}>
            <Ionicons name={config.icon as any} size={24} color={config.color} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.alertTitle, { color: c.text }]}>{alert.title}</Text>
            {alert.location && (
              <View style={styles.locationRow}>
                <Ionicons name="location-outline" size={12} color={c.textMuted} />
                <Text style={[styles.locationText, { color: c.textMuted }]}>{alert.location}</Text>
              </View>
            )}
          </View>
          <Badge label={config.label} variant={config.variant} size="sm" />
        </View>

        <Text style={[styles.alertDesc, { color: c.textSecondary }]}>{alert.description}</Text>

        <View style={styles.alertFooter}>
          <Text style={[styles.alertTime, { color: c.textMuted }]}>
            {new Date(alert.createdAt).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}
          </Text>
          {!alert.isResolved && (
            <TouchableOpacity
              style={[styles.resolveBtn, { backgroundColor: c.success + '15', borderColor: c.success }]}
              onPress={() => resolveMutation.mutate(alert.id)}
            >
              <Ionicons name="checkmark-circle-outline" size={16} color={c.success} />
              <Text style={[styles.resolveBtnText, { color: c.success }]}>Mark Resolved</Text>
            </TouchableOpacity>
          )}
          {alert.isResolved && (
            <View style={styles.resolvedTag}>
              <Ionicons name="checkmark-circle" size={14} color={c.success} />
              <Text style={[styles.resolvedText, { color: c.success }]}>Resolved</Text>
            </View>
          )}
        </View>
      </Card>
    );
  };

  const activeCount = alerts?.filter(a => !a.isResolved).length || 0;

  return (
    <View style={[styles.container, { backgroundColor: c.background, paddingTop: insets.top }]}>
      <View style={[styles.header, { backgroundColor: c.surface, borderBottomColor: c.border }]}>
        <View>
          <Text style={[styles.title, { color: c.text }]}>Alerts Center</Text>
          {activeCount > 0 && (
            <Text style={[styles.activeCount, { color: c.error }]}>
              {activeCount} active alert{activeCount > 1 ? 's' : ''}
            </Text>
          )}
        </View>
        <TouchableOpacity
          style={[styles.filterBtn, { backgroundColor: showResolved ? c.primary + '15' : c.border }]}
          onPress={() => setShowResolved(v => !v)}
        >
          <Text style={[styles.filterText, { color: showResolved ? c.primary : c.textMuted }]}>
            {showResolved ? 'Showing All' : 'Active Only'}
          </Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.loading}>
          <Text style={{ color: c.textMuted }}>Loading alerts...</Text>
        </View>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon="shield-checkmark-outline"
          title="All Clear!"
          description="No active alerts. All is well at your properties."
        />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => item.id}
          renderItem={renderAlert}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: SPACING.md, borderBottomWidth: 1 },
  title: { fontSize: FONT_SIZE.xl, fontWeight: '700' },
  activeCount: { fontSize: FONT_SIZE.sm, fontWeight: '500', marginTop: 2 },
  filterBtn: { paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderRadius: BORDER_RADIUS.full },
  filterText: { fontSize: FONT_SIZE.sm, fontWeight: '600' },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  list: { padding: SPACING.md },
  alertCard: { marginBottom: SPACING.md },
  sosBanner: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.xs,
    backgroundColor: '#FFEBEE', padding: SPACING.sm, borderRadius: BORDER_RADIUS.sm, marginBottom: SPACING.sm,
  },
  sosBannerText: { color: '#C62828', fontSize: FONT_SIZE.sm, fontWeight: '700', flex: 1 },
  alertHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.sm, marginBottom: SPACING.sm },
  alertIcon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  alertTitle: { fontSize: FONT_SIZE.base, fontWeight: '700', marginBottom: 4 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  locationText: { fontSize: FONT_SIZE.xs },
  alertDesc: { fontSize: FONT_SIZE.sm, lineHeight: 18, marginBottom: SPACING.sm },
  alertFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  alertTime: { fontSize: FONT_SIZE.xs },
  resolveBtn: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.xs,
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full, borderWidth: 1,
  },
  resolveBtnText: { fontSize: FONT_SIZE.sm, fontWeight: '600' },
  resolvedTag: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  resolvedText: { fontSize: FONT_SIZE.sm, fontWeight: '600' },
});
