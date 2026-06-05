import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity, RefreshControl,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeStore } from '../../src/store/themeStore';
import { propertiesApi } from '../../src/services/mockApi';
import { PropertyCard } from '../../src/components/property/PropertyCard';
import { Input } from '../../src/components/ui/Input';
import { PropertyCardSkeleton } from '../../src/components/ui/SkeletonLoader';
import { EmptyState } from '../../src/components/ui/EmptyState';
import { BORDER_RADIUS, FONT_SIZE, SPACING } from '../../src/constants/theme';
import type { Property } from '../../src/types';

const CITIES = ['All', 'Hyderabad', 'Visakhapatnam', 'Vijayawada', 'Warangal', 'Tirupati', 'Karimnagar'];
const TYPES = ['All', 'pg', 'hotel', 'hostel', 'guesthouse'];

export default function SearchScreen() {
  const { theme } = useThemeStore();
  const c = theme.colors;
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState('');
  const [selectedCity, setSelectedCity] = useState('All');
  const [selectedType, setSelectedType] = useState('All');

  const { data: allProperties, isLoading, refetch } = useQuery({
    queryKey: ['properties', 'search'],
    queryFn: () => propertiesApi.getAll(),
  });

  const filtered = (allProperties || []).filter(p => {
    const matchesSearch = !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.city.toLowerCase().includes(search.toLowerCase()) ||
      p.address.toLowerCase().includes(search.toLowerCase());
    const matchesCity = selectedCity === 'All' || p.city === selectedCity;
    const matchesType = selectedType === 'All' || p.type === selectedType;
    return matchesSearch && matchesCity && matchesType;
  });

  return (
    <View style={[styles.container, { backgroundColor: c.background, paddingTop: insets.top }]}>
      {/* Search Bar */}
      <View style={[styles.searchContainer, { backgroundColor: c.surface, borderBottomColor: c.border }]}>
        <Text style={[styles.title, { color: c.text }]}>Find Your Stay</Text>
        <Input
          placeholder="Search by name, city, location..."
          value={search}
          onChangeText={setSearch}
          leftIcon="search-outline"
          rightIcon={search ? 'close-outline' : undefined}
          onRightIconPress={() => setSearch('')}
          containerStyle={{ marginBottom: 0 }}
        />
      </View>

      {/* City Filters */}
      <View style={[styles.filtersSection, { backgroundColor: c.surface }]}>
        <FlatList
          data={CITIES}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={item => item}
          contentContainerStyle={styles.filterList}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.filterChip,
                {
                  backgroundColor: selectedCity === item ? c.primary : c.background,
                  borderColor: selectedCity === item ? c.primary : c.border,
                },
              ]}
              onPress={() => setSelectedCity(item)}
            >
              <Text style={[
                styles.filterText,
                { color: selectedCity === item ? '#fff' : c.textSecondary },
              ]}>
                {item}
              </Text>
            </TouchableOpacity>
          )}
        />

        {/* Type Filters */}
        <FlatList
          data={TYPES}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={item => item}
          contentContainerStyle={styles.filterList}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.filterChip,
                {
                  backgroundColor: selectedType === item ? c.secondary : c.background,
                  borderColor: selectedType === item ? c.secondary : c.border,
                },
              ]}
              onPress={() => setSelectedType(item)}
            >
              <Text style={[
                styles.filterText,
                { color: selectedType === item ? '#fff' : c.textSecondary },
              ]}>
                {item === 'All' ? 'All Types' : item.charAt(0).toUpperCase() + item.slice(1)}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Results Count */}
      <View style={[styles.resultsHeader, { borderBottomColor: c.border }]}>
        <Text style={[styles.resultsCount, { color: c.textSecondary }]}>
          {isLoading ? 'Searching...' : `${filtered.length} properties found`}
        </Text>
      </View>

      {/* Results */}
      {isLoading ? (
        <View style={styles.list}>
          {[1, 2, 3].map(i => <PropertyCardSkeleton key={i} />)}
        </View>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon="search-outline"
          title="No Properties Found"
          description="Try adjusting your search or filters"
          actionLabel="Clear Filters"
          onAction={() => {
            setSearch('');
            setSelectedCity('All');
            setSelectedType('All');
          }}
        />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={false} onRefresh={refetch} />}
          renderItem={({ item }) => <PropertyCard property={item} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  searchContainer: {
    padding: SPACING.md,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '700',
    marginBottom: SPACING.md,
  },
  filtersSection: {
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  filterList: {
    paddingHorizontal: SPACING.md,
    gap: SPACING.xs,
    paddingBottom: SPACING.xs,
  },
  filterChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
  },
  filterText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '500',
  },
  resultsHeader: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
  },
  resultsCount: {
    fontSize: FONT_SIZE.sm,
  },
  list: {
    padding: SPACING.md,
  },
});
