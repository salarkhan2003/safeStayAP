import React from 'react';
import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity, RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '../../src/store/authStore';
import { useThemeStore } from '../../src/store/themeStore';
import { propertiesApi } from '../../src/services/mockApi';
import { Card } from '../../src/components/ui/Card';
import { Badge } from '../../src/components/ui/Badge';
import { Button } from '../../src/components/ui/Button';
import { EmptyState } from '../../src/components/ui/EmptyState';
import { BORDER_RADIUS, FONT_SIZE, SPACING, SHADOW } from '../../src/constants/theme';
import type { Property } from '../../src/types';

export default function OwnerPropertiesScreen() {
  const { user } = useAuthStore();
  const { theme } = useThemeStore();
  const c = theme.colors;
  const insets = useSafeAreaInsets();

  const { data: properties, isLoading, refetch } = useQuery({
    queryKey: ['owner-properties', user?.id],
    queryFn: () => propertiesApi.getByOwner(user?.id || ''),
    enabled: !!user?.id,
  });

  const renderProperty = ({ item: prop }: { item: Property }) => {
    const occupancyRate = Math.round(((prop.totalRooms - prop.availableRooms) / prop.totalRooms) * 100);
    return (
      <TouchableOpacity
        onPress={() => router.push(`/(owner)/property/${prop.id}` as any)}
        activeOpacity={0.85}
      >
        <Card style={styles.propCard} variant="elevated">
          {/* Header */}
          <View style={styles.cardHeader}>
            <View style={[styles.propTypeIcon, { backgroundColor: c.primary + '15' }]}>
              <Ionicons name="business-outline" size={28} color={c.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.propName, { color: c.text }]} numberOfLines={1}>{prop.name}</Text>
              <Text style={[styles.propType, { color: c.textMuted }]}>
                {prop.type.toUpperCase()} · {prop.city}
              </Text>
            </View>
            <Badge
              label={prop.verificationStatus === 'verified' ? 'Verified' : 'Pending'}
              variant={prop.verificationStatus === 'verified' ? 'success' : 'warning'}
              size="sm"
            />
          </View>

          {/* Stats Row */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={[styles.statVal, { color: c.text }]}>{prop.totalRooms}</Text>
              <Text style={[styles.statLbl, { color: c.textMuted }]}>Total Rooms</Text>
            </View>
            <View style={[styles.divider, { backgroundColor: c.border }]} />
            <View style={styles.statItem}>
              <Text style={[styles.statVal, { color: c.success }]}>{prop.availableRooms}</Text>
              <Text style={[styles.statLbl, { color: c.textMuted }]}>Available</Text>
            </View>
            <View style={[styles.divider, { backgroundColor: c.border }]} />
            <View style={styles.statItem}>
              <Text style={[styles.statVal, { color: c.primary }]}>{occupancyRate}%</Text>
              <Text style={[styles.statLbl, { color: c.textMuted }]}>Occupancy</Text>
            </View>
            <View style={[styles.divider, { backgroundColor: c.border }]} />
            <View style={styles.statItem}>
              <Text style={[styles.statVal, { color: c.warning }]}>₹{(prop.priceRange.min / 1000).toFixed(0)}k</Text>
              <Text style={[styles.statLbl, { color: c.textMuted }]}>From/mo</Text>
            </View>
          </View>

          {/* Occupancy Bar */}
          <View style={styles.occupancyBar}>
            <View style={[styles.occupancyTrack, { backgroundColor: c.border }]}>
              <View
                style={[styles.occupancyFill, {
                  width: `${occupancyRate}%` as any,
                  backgroundColor: occupancyRate > 80 ? c.success : occupancyRate > 50 ? c.warning : c.error,
                }]}
              />
            </View>
            <Text style={[styles.occupancyLabel, { color: c.textMuted }]}>{occupancyRate}% occupied</Text>
          </View>

          <View style={styles.cardFooter}>
            <Text style={[styles.ratingText, { color: c.textMuted }]}>
              ⭐ {prop.rating} · {prop.reviewCount} reviews
            </Text>
            <Ionicons name="chevron-forward" size={18} color={c.textMuted} />
          </View>
        </Card>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: c.background, paddingTop: insets.top }]}>
      <View style={[styles.header, { backgroundColor: c.surface, borderBottomColor: c.border }]}>
        <Text style={[styles.title, { color: c.text, flexShrink: 1, marginRight: SPACING.sm }]} numberOfLines={1}>My Properties</Text>
      </View>

      {isLoading ? (
        <View style={styles.loading}>
          <Text style={[{ color: c.textMuted }]}>Loading properties...</Text>
        </View>
      ) : (
        <FlatList
          data={properties}
          keyExtractor={item => item.id}
          renderItem={renderProperty}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={false} onRefresh={refetch} />}
          ListEmptyComponent={
            <EmptyState
              icon="business-outline"
              title="No Properties Yet"
              description="Add your first property to start managing bookings and guests."
              actionLabel="Add Property"
              onAction={() => {}}
            />
          }
        />
      )}

      <TouchableOpacity
        style={[styles.fab, { backgroundColor: c.primary, shadowColor: '#000' }]}
        onPress={() => router.push('/(owner)/add-property')}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: SPACING.md, borderBottomWidth: 1,
  },
  title: { fontSize: FONT_SIZE.xl, fontWeight: '700' },
  list: { padding: SPACING.md },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  propCard: { marginBottom: SPACING.md },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.md, marginBottom: SPACING.md },
  propTypeIcon: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
  propName: { fontSize: FONT_SIZE.lg, fontWeight: '700', marginBottom: 4 },
  propType: { fontSize: FONT_SIZE.sm },
  statsRow: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.md },
  statItem: { flex: 1, alignItems: 'center' },
  statVal: { fontSize: FONT_SIZE.xl, fontWeight: '700', marginBottom: 2 },
  statLbl: { fontSize: FONT_SIZE.xs },
  divider: { width: 1, height: 36, marginHorizontal: SPACING.sm },
  occupancyBar: { marginBottom: SPACING.sm, gap: 4 },
  occupancyTrack: { height: 6, borderRadius: 3, overflow: 'hidden' },
  occupancyFill: { height: '100%', borderRadius: 3 },
  occupancyLabel: { fontSize: FONT_SIZE.xs },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  ratingText: { fontSize: FONT_SIZE.sm },
  fab: {
    position: 'absolute',
    bottom: SPACING.xl,
    right: SPACING.xl,
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
});
