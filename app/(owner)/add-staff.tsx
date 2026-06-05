import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import { router } from 'expo-router';
import { Header } from '../../src/components/ui/Header';
import { Input } from '../../src/components/ui/Input';
import { Button } from '../../src/components/ui/Button';
import { useThemeStore } from '../../src/store/themeStore';
import { SPACING } from '../../src/constants/theme';

export default function AddStaffScreen() {
  const { theme } = useThemeStore();
  const c = theme.colors;

  const [form, setForm] = useState({
    name: '',
    role: 'security',
    phone: '',
    email: '',
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!form.name || !form.phone) {
      Alert.alert('Error', 'Please fill required fields (Name, Phone)');
      return;
    }
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      Alert.alert('Success', 'Staff added successfully!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    }, 1000);
  };

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <Header title="Add New Staff" showBack />
      <ScrollView contentContainerStyle={styles.content}>
        <Input label="Full Name *" value={form.name} onChangeText={(t) => setForm({ ...form, name: t })} placeholder="e.g. Ravi Kumar" />
        <Input label="Role (manager, security, housekeeping, receptionist)" value={form.role} onChangeText={(t) => setForm({ ...form, role: t })} />
        <Input label="Phone Number *" value={form.phone} onChangeText={(t) => setForm({ ...form, phone: t })} keyboardType="phone-pad" />
        <Input label="Email" value={form.email} onChangeText={(t) => setForm({ ...form, email: t })} keyboardType="email-address" />

        <Button title="Save Staff" onPress={handleSubmit} loading={loading} style={{ marginTop: SPACING.lg }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: SPACING.md, gap: SPACING.sm, paddingBottom: SPACING.xxl },
});
