import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '../../src/store/authStore';
import { useThemeStore } from '../../src/store/themeStore';
import { incidentsApi } from '../../src/services/mockApi';
import { Header } from '../../src/components/ui/Header';
import { Card } from '../../src/components/ui/Card';
import { Input } from '../../src/components/ui/Input';
import { Button } from '../../src/components/ui/Button';
import { Badge } from '../../src/components/ui/Badge';
import { EmptyState } from '../../src/components/ui/EmptyState';
import { BORDER_RADIUS, FONT_SIZE, SPACING } from '../../src/constants/theme';
import type { Incident } from '../../src/types';

const schema = z.object({
  title: z.string().min(5, 'Enter incident title'),
  description: z.string().min(20, 'Please describe the incident in detail'),
  category: z.string(),
});
type FormData = z.infer<typeof schema>;

const CATEGORIES = [
  { value: 'safety', label: 'Safety Concern', icon: 'shield-outline', color: '#C62828' },
  { value: 'theft', label: 'Theft', icon: 'wallet-outline', color: '#37474F' },
  { value: 'noise', label: 'Noise Complaint', icon: 'volume-high-outline', color: '#E65100' },
  { value: 'maintenance', label: 'Maintenance Issue', icon: 'hammer-outline', color: '#1565C0' },
  { value: 'other', label: 'Other', icon: 'ellipsis-horizontal-outline', color: '#6A1B9A' },
];

const statusConfig = {
  open: { label: 'Open', variant: 'warning' as const },
  investigating: { label: 'Investigating', variant: 'info' as const },
  resolved: { label: 'Resolved', variant: 'success' as const },
};

export default function IncidentsScreen() {
  const { user } = useAuthStore();
  const { theme } = useThemeStore();
  const c = theme.colors;
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('safety');

  const { data: incidents, isLoading, refetch } = useQuery({
    queryKey: ['incidents', user?.id],
    queryFn: () => incidentsApi.getByGuest(user?.id || ''),
    enabled: !!user?.id,
  });

  const reportMutation = useMutation({
    mutationFn: incidentsApi.report,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incidents'] });
      setShowForm(false);
      reset();
      Alert.alert('Report Submitted', 'Your incident report has been submitted. We\'ll investigate and respond shortly.');
    },
  });

  const { control, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { category: 'safety' },
  });

  const onSubmit = (data: FormData) => {
    reportMutation.mutate({
      reportedBy: user?.id || '',
      propertyId: 'prop_001',
      title: data.title,
      description: data.description,
      category: selectedCategory as any,
    });
  };

  const renderIncident = ({ item }: { item: Incident }) => {
    const catConfig = CATEGORIES.find(c => c.value === item.category) || CATEGORIES[4];
    const statusC = statusConfig[item.status];
    return (
      <Card style={styles.incidentCard}>
        <View style={styles.incidentHeader}>
          <View style={[styles.incidentIcon, { backgroundColor: catConfig.color + '20' }]}>
            <Ionicons name={catConfig.icon as any} size={22} color={catConfig.color} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.incidentTitle, { color: c.text }]}>{item.title}</Text>
            <Text style={[styles.incidentDate, { color: c.textMuted }]}>
              {new Date(item.createdAt).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
            </Text>
          </View>
          <Badge label={statusC.label} variant={statusC.variant} size="sm" />
        </View>
        <Text style={[styles.incidentDesc, { color: c.textSecondary }]} numberOfLines={2}>
          {item.description}
        </Text>
      </Card>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <Header
        title="Incident Reports"
        showBack
        rightAction={
          !showForm && (
            <TouchableOpacity onPress={() => setShowForm(true)} style={styles.addBtn}>
              <Ionicons name="add" size={24} color={c.primary} />
            </TouchableOpacity>
          )
        }
      />

      {showForm ? (
        <FlatList
          data={[]}
          renderItem={() => null}
          ListHeaderComponent={
            <View style={styles.formContainer}>
              <Text style={[styles.formTitle, { color: c.text }]}>Report an Incident</Text>

              {/* Category Selection */}
              <Text style={[styles.label, { color: c.textSecondary }]}>Category</Text>
              <View style={styles.categoryGrid}>
                {CATEGORIES.map(cat => (
                  <TouchableOpacity
                    key={cat.value}
                    style={[
                      styles.categoryChip,
                      {
                        backgroundColor: selectedCategory === cat.value ? cat.color + '20' : c.card,
                        borderColor: selectedCategory === cat.value ? cat.color : c.border,
                      },
                    ]}
                    onPress={() => setSelectedCategory(cat.value)}
                  >
                    <Ionicons name={cat.icon as any} size={16} color={selectedCategory === cat.value ? cat.color : c.textMuted} />
                    <Text style={[styles.categoryLabel, { color: selectedCategory === cat.value ? cat.color : c.textSecondary }]}>
                      {cat.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Controller
                control={control}
                name="title"
                render={({ field: { onChange, value } }) => (
                  <Input
                    label="Incident Title"
                    placeholder="Brief title of the incident"
                    value={value}
                    onChangeText={onChange}
                    error={errors.title?.message}
                  />
                )}
              />
              <Controller
                control={control}
                name="description"
                render={({ field: { onChange, value } }) => (
                  <Input
                    label="Description"
                    placeholder="Describe the incident in detail..."
                    value={value}
                    onChangeText={onChange}
                    multiline
                    numberOfLines={4}
                    style={{ height: 100, textAlignVertical: 'top' }}
                    error={errors.description?.message}
                  />
                )}
              />
              <View style={styles.formBtns}>
                <Button title="Cancel" variant="outline" onPress={() => setShowForm(false)} style={{ flex: 1 }} />
                <Button
                  title="Submit Report"
                  onPress={handleSubmit(onSubmit)}
                  loading={reportMutation.isPending}
                  style={{ flex: 2 }}
                />
              </View>
            </View>
          }
        />
      ) : (
        <FlatList
          data={incidents}
          keyExtractor={item => item.id}
          renderItem={renderIncident}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            isLoading ? null : (
              <EmptyState
                icon="warning-outline"
                title="No Incidents Reported"
                description="Report any safety or maintenance issues you encounter during your stay."
                actionLabel="Report Incident"
                onAction={() => setShowForm(true)}
              />
            )
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  addBtn: { padding: SPACING.xs },
  list: { padding: SPACING.md, gap: SPACING.sm },
  incidentCard: { marginBottom: 0 },
  incidentHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.sm, marginBottom: SPACING.sm },
  incidentIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  incidentTitle: { fontSize: FONT_SIZE.base, fontWeight: '600', marginBottom: 2 },
  incidentDate: { fontSize: FONT_SIZE.xs },
  incidentDesc: { fontSize: FONT_SIZE.sm, lineHeight: 18 },
  formContainer: { padding: SPACING.md },
  formTitle: { fontSize: FONT_SIZE.xl, fontWeight: '700', marginBottom: SPACING.lg },
  label: { fontSize: FONT_SIZE.sm, fontWeight: '500', marginBottom: SPACING.sm },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm, marginBottom: SPACING.md },
  categoryChip: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.xs,
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full, borderWidth: 1.5,
  },
  categoryLabel: { fontSize: FONT_SIZE.sm, fontWeight: '500' },
  formBtns: { flexDirection: 'row', gap: SPACING.md, marginTop: SPACING.sm },
});
