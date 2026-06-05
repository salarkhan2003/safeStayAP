import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore } from '../../src/store/themeStore';
import { Header } from '../../src/components/ui/Header';
import { Card } from '../../src/components/ui/Card';
import { Badge } from '../../src/components/ui/Badge';
import { Button } from '../../src/components/ui/Button';
import { EmptyState } from '../../src/components/ui/EmptyState';
import { BORDER_RADIUS, FONT_SIZE, SPACING } from '../../src/constants/theme';
import type { Staff } from '../../src/types';

const MOCK_STAFF: Staff[] = [
  { id: 'staff_001', propertyId: 'prop_001', name: 'Kumar Rao', role: 'manager', phone: '+91 9000110001', email: 'kumar@example.com', isActive: true, joinedAt: '2023-01-15T10:00:00Z' },
  { id: 'staff_002', propertyId: 'prop_001', name: 'Ravi Kumar', role: 'security', phone: '+91 9000110002', isActive: true, joinedAt: '2023-02-01T10:00:00Z' },
  { id: 'staff_003', propertyId: 'prop_001', name: 'Anitha Reddy', role: 'housekeeping', phone: '+91 9000110003', isActive: true, joinedAt: '2023-03-15T10:00:00Z' },
  { id: 'staff_004', propertyId: 'prop_002', name: 'Suresh Babu', role: 'receptionist', phone: '+91 9000110004', isActive: false, joinedAt: '2022-12-01T10:00:00Z' },
];

const roleConfig: Record<string, { icon: string; color: string }> = {
  manager: { icon: 'person-circle', color: '#1565C0' },
  security: { icon: 'shield', color: '#C62828' },
  housekeeping: { icon: 'sparkles', color: '#2E7D32' },
  receptionist: { icon: 'headset', color: '#6A1B9A' },
};

export default function StaffScreen() {
  const { theme } = useThemeStore();
  const c = theme.colors;
  const [staff, setStaff] = useState<Staff[]>(MOCK_STAFF);

  const handleToggleActive = (id: string) => {
    setStaff(prev => prev.map(s => s.id === id ? { ...s, isActive: !s.isActive } : s));
  };

  const handleRemove = (id: string) => {
    Alert.alert('Remove Staff', 'Are you sure you want to remove this staff member?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => setStaff(prev => prev.filter(s => s.id !== id)) },
    ]);
  };

  const renderStaff = ({ item }: { item: Staff }) => {
    const config = roleConfig[item.role] || { icon: 'person', color: c.primary };
    return (
      <Card style={styles.staffCard}>
        <View style={styles.staffHeader}>
          <View style={[styles.staffAvatar, { backgroundColor: config.color + '20' }]}>
            <Ionicons name={config.icon as any} size={28} color={config.color} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.staffName, { color: c.text }]}>{item.name}</Text>
            <Text style={[styles.staffRole, { color: c.textMuted }]}>
              {item.role.charAt(0).toUpperCase() + item.role.slice(1)}
            </Text>
            <Text style={[styles.staffPhone, { color: c.primary }]}>{item.phone}</Text>
          </View>
          <Badge
            label={item.isActive ? 'Active' : 'Inactive'}
            variant={item.isActive ? 'success' : 'secondary'}
            size="sm"
          />
        </View>
        <View style={styles.staffActions}>
          <TouchableOpacity
            style={[styles.actionBtn, { borderColor: item.isActive ? c.error : c.success }]}
            onPress={() => handleToggleActive(item.id)}
          >
            <Text style={[styles.actionText, { color: item.isActive ? c.error : c.success }]}>
              {item.isActive ? 'Deactivate' : 'Activate'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, { borderColor: c.error }]}
            onPress={() => handleRemove(item.id)}
          >
            <Text style={[styles.actionText, { color: c.error }]}>Remove</Text>
          </TouchableOpacity>
        </View>
      </Card>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <Header
        title="Staff Management"
        showBack
        rightAction={
          <Button title="Add Staff" size="sm" onPress={() => Alert.alert('Add Staff', 'Staff onboarding form coming soon')} />
        }
      />
      <FlatList
        data={staff}
        keyExtractor={item => item.id}
        renderItem={renderStaff}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState icon="people-outline" title="No Staff Added" description="Add your property staff to manage them here." />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { padding: SPACING.md },
  staffCard: { marginBottom: SPACING.md },
  staffHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.md, marginBottom: SPACING.md },
  staffAvatar: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
  staffName: { fontSize: FONT_SIZE.base, fontWeight: '700', marginBottom: 4 },
  staffRole: { fontSize: FONT_SIZE.sm, marginBottom: 4 },
  staffPhone: { fontSize: FONT_SIZE.sm, fontWeight: '600' },
  staffActions: { flexDirection: 'row', gap: SPACING.sm, justifyContent: 'flex-end' },
  actionBtn: { paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs, borderRadius: BORDER_RADIUS.full, borderWidth: 1 },
  actionText: { fontSize: FONT_SIZE.sm, fontWeight: '600' },
});
