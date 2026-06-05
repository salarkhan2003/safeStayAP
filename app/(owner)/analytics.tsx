import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useQuery } from '@tanstack/react-query';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '../../src/store/authStore';
import { useThemeStore } from '../../src/store/themeStore';
import { propertiesApi, analyticsApi } from '../../src/services/mockApi';
import { Header } from '../../src/components/ui/Header';
import { Card } from '../../src/components/ui/Card';
import { BORDER_RADIUS, FONT_SIZE, SPACING } from '../../src/constants/theme';

// Simple bar chart component
const BarChart: React.FC<{ data: { label: string; value: number; max: number }[]; color: string }> = ({ data, color }) => {
  const { theme } = useThemeStore();
  const c = theme.colors;
  const maxVal = Math.max(...data.map(d => d.value));

  return (
    <View style={barStyles.container}>
      {data.map((item, i) => (
        <View key={i} style={barStyles.barGroup}>
          <View style={[barStyles.barTrack, { backgroundColor: c.border }]}>
            <View
              style={[
                barStyles.bar,
                {
                  height: `${(item.value / maxVal) * 100}%` as any,
                  backgroundColor: color,
                },
              ]}
            />
          </View>
          <Text style={[barStyles.label, { color: c.textMuted }]}>{item.label}</Text>
          <Text style={[barStyles.value, { color: c.text }]}>{item.value}</Text>
        </View>
      ))}
    </View>
  );
};

const barStyles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'flex-end', gap: SPACING.xs, height: 120 },
  barGroup: { flex: 1, alignItems: 'center', height: '100%', justifyContent: 'flex-end' },
  barTrack: { width: '100%', flex: 1, borderRadius: 4, justifyContent: 'flex-end', overflow: 'hidden' },
  bar: { width: '100%', borderRadius: 4 },
  label: { fontSize: 9, marginTop: 4, textAlign: 'center' },
  value: { fontSize: 9, fontWeight: '700', textAlign: 'center' },
});

export default function OwnerAnalyticsScreen() {
  const { user } = useAuthStore();
  const { theme } = useThemeStore();
  const c = theme.colors;
  const insets = useSafeAreaInsets();
  const [selectedPropIndex, setSelectedPropIndex] = useState(0);

  const { data: properties } = useQuery({
    queryKey: ['owner-properties', user?.id],
    queryFn: () => propertiesApi.getByOwner(user?.id || ''),
    enabled: !!user?.id,
  });

  const selectedProp = properties?.[selectedPropIndex];

  const { data: occupancy } = useQuery({
    queryKey: ['occupancy', selectedProp?.id],
    queryFn: () => analyticsApi.getOccupancy(selectedProp?.id || ''),
    enabled: !!selectedProp?.id,
  });

  const { data: revenue } = useQuery({
    queryKey: ['revenue', selectedProp?.id],
    queryFn: () => analyticsApi.getRevenue(selectedProp?.id || ''),
    enabled: !!selectedProp?.id,
  });

  const kpiCards = [
    {
      label: 'Occupancy Rate',
      value: `${occupancy?.occupancyRate || 0}%`,
      icon: 'bed',
      color: '#2E7D32',
      subtitle: `${occupancy?.occupiedRooms || 0}/${occupancy?.totalRooms || 0} rooms`,
    },
    {
      label: 'Monthly Revenue',
      value: `₹${((revenue?.thisMonth || 0) / 1000).toFixed(0)}K`,
      icon: 'cash',
      color: '#1565C0',
      subtitle: `+${revenue?.growth || 0}% from last month`,
    },
    {
      label: 'Total Bookings',
      value: revenue?.monthlyTrend?.reduce((sum, m) => sum + m.bookings, 0) || 0,
      icon: 'calendar',
      color: '#6A1B9A',
      subtitle: 'Last 6 months',
    },
    {
      label: 'Avg Rating',
      value: selectedProp?.rating || 0,
      icon: 'star',
      color: '#E65100',
      subtitle: `${selectedProp?.reviewCount || 0} reviews`,
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <Header title="Analytics" showBack />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Property Selector */}
        <View style={[styles.propSelector, { backgroundColor: c.surface, borderBottomColor: c.border }]}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.propTabs}>
            {(properties || []).map((prop, i) => (
              <TouchableOpacity
                key={prop.id}
                style={[
                  styles.propTab,
                  {
                    backgroundColor: selectedPropIndex === i ? c.primary : c.background,
                    borderColor: selectedPropIndex === i ? c.primary : c.border,
                  },
                ]}
                onPress={() => setSelectedPropIndex(i)}
              >
                <Text style={[styles.propTabText, { color: selectedPropIndex === i ? '#fff' : c.textSecondary }]}>
                  {prop.name.split(' ').slice(0, 2).join(' ')}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.content}>
          {/* KPI Cards */}
          <View style={styles.kpiGrid}>
            {kpiCards.map(kpi => (
              <Card key={kpi.label} style={styles.kpiCard}>
                <View style={[styles.kpiIcon, { backgroundColor: kpi.color + '15' }]}>
                  <Ionicons name={kpi.icon as any} size={24} color={kpi.color} />
                </View>
                <Text style={[styles.kpiValue, { color: c.text }]}>{kpi.value}</Text>
                <Text style={[styles.kpiLabel, { color: c.textSecondary }]}>{kpi.label}</Text>
                <Text style={[styles.kpiSubtitle, { color: c.textMuted }]}>{kpi.subtitle}</Text>
              </Card>
            ))}
          </View>

          {/* Occupancy Trend */}
          <Card style={styles.chartCard}>
            <Text style={[styles.chartTitle, { color: c.text }]}>Weekly Occupancy Trend</Text>
            {occupancy?.trend && (
              <BarChart
                data={occupancy.trend.map(d => ({
                  label: d.date.split('/').slice(0, 2).join('/'),
                  value: Math.round(d.rate),
                  max: 100,
                }))}
                color={c.primary}
              />
            )}
          </Card>

          {/* Revenue Trend */}
          <Card style={styles.chartCard}>
            <Text style={[styles.chartTitle, { color: c.text }]}>Monthly Revenue (₹K)</Text>
            {revenue?.monthlyTrend && (
              <BarChart
                data={revenue.monthlyTrend.map(m => ({
                  label: m.month,
                  value: Math.round(m.revenue / 1000),
                  max: Math.max(...revenue.monthlyTrend.map(x => x.revenue / 1000)),
                }))}
                color="#00897B"
              />
            )}
          </Card>

          {/* Summary Table */}
          <Card>
            <Text style={[styles.chartTitle, { color: c.text }]}>Monthly Summary</Text>
            <View style={styles.tableHeader}>
              {['Month', 'Revenue', 'Bookings', 'Occupancy'].map(h => (
                <Text key={h} style={[styles.tableHeaderText, { color: c.textMuted }]}>{h}</Text>
              ))}
            </View>
            {revenue?.monthlyTrend?.map((m, i) => (
              <View key={i} style={[styles.tableRow, { borderBottomColor: c.border }]}>
                <Text style={[styles.tableCell, { color: c.text }]}>{m.month}</Text>
                <Text style={[styles.tableCell, { color: c.primary }]}>₹{(m.revenue / 1000).toFixed(0)}K</Text>
                <Text style={[styles.tableCell, { color: c.text }]}>{m.bookings}</Text>
                <Text style={[styles.tableCell, { color: c.success }]}>
                  {Math.round(75 + i * 2)}%
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
  propSelector: { padding: SPACING.sm, borderBottomWidth: 1 },
  propTabs: { paddingHorizontal: SPACING.sm, gap: SPACING.sm },
  propTab: { paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs, borderRadius: BORDER_RADIUS.full, borderWidth: 1 },
  propTabText: { fontSize: FONT_SIZE.sm, fontWeight: '600' },
  content: { padding: SPACING.md },
  kpiGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm, marginBottom: SPACING.md },
  kpiCard: { width: '47%', flex: 1, alignItems: 'center', minWidth: '47%' },
  kpiIcon: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.sm },
  kpiValue: { fontSize: FONT_SIZE.xxl, fontWeight: '800', marginBottom: 2 },
  kpiLabel: { fontSize: FONT_SIZE.sm, fontWeight: '600', marginBottom: 2 },
  kpiSubtitle: { fontSize: FONT_SIZE.xs, textAlign: 'center' },
  chartCard: { marginBottom: SPACING.md },
  chartTitle: { fontSize: FONT_SIZE.lg, fontWeight: '700', marginBottom: SPACING.md },
  tableHeader: { flexDirection: 'row', paddingVertical: SPACING.xs, borderBottomWidth: 2, borderBottomColor: '#e0e0e0' },
  tableHeaderText: { flex: 1, fontSize: FONT_SIZE.xs, fontWeight: '700', textTransform: 'uppercase' },
  tableRow: { flexDirection: 'row', paddingVertical: SPACING.sm, borderBottomWidth: 1 },
  tableCell: { flex: 1, fontSize: FONT_SIZE.sm },
});
