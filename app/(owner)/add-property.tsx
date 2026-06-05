import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import { router } from 'expo-router';
import { Header } from '../../src/components/ui/Header';
import { Input } from '../../src/components/ui/Input';
import { Button } from '../../src/components/ui/Button';
import { useThemeStore } from '../../src/store/themeStore';
import { useAuthStore } from '../../src/store/authStore';
import { propertiesApi } from '../../src/services/mockApi';
import { SPACING } from '../../src/constants/theme';

export default function AddPropertyScreen() {
  const { theme } = useThemeStore();
  const { user } = useAuthStore();
  const c = theme.colors;

  const [form, setForm] = useState({
    name: '',
    type: 'pg',
    address: '',
    city: '',
    pincode: '',
    totalRooms: '',
    priceMin: '',
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!form.name || !form.city || !form.totalRooms) {
      Alert.alert('Error', 'Please fill required fields (Name, City, Total Rooms)');
      return;
    }
    setLoading(true);
    try {
      await propertiesApi.create({
        ownerId: user?.id || 'owner_001',
        name: form.name,
        type: form.type as 'pg' | 'hostel' | 'hotel',
        address: form.address,
        city: form.city,
        pincode: form.pincode,
        totalRooms: parseInt(form.totalRooms, 10),
        priceRange: { min: parseInt(form.priceMin, 10) || 5000, max: (parseInt(form.priceMin, 10) || 5000) + 5000 },
      });
      Alert.alert('Success', 'Property added successfully!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (e) {
      Alert.alert('Error', 'Failed to add property');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <Header title="Add New Property" showBack />
      <ScrollView contentContainerStyle={styles.content}>
        <Input label="Property Name *" value={form.name} onChangeText={(t) => setForm({ ...form, name: t })} placeholder="e.g. Balaji PG" />
        <Input label="Type (pg, hostel, hotel)" value={form.type} onChangeText={(t) => setForm({ ...form, type: t })} />
        <Input label="City *" value={form.city} onChangeText={(t) => setForm({ ...form, city: t })} placeholder="e.g. Vijayawada" />
        <Input label="Address" value={form.address} onChangeText={(t) => setForm({ ...form, address: t })} multiline />
        <Input label="Pincode" value={form.pincode} onChangeText={(t) => setForm({ ...form, pincode: t })} keyboardType="number-pad" />
        <Input label="Total Rooms *" value={form.totalRooms} onChangeText={(t) => setForm({ ...form, totalRooms: t })} keyboardType="number-pad" />
        <Input label="Starting Price (/mo)" value={form.priceMin} onChangeText={(t) => setForm({ ...form, priceMin: t })} keyboardType="number-pad" />

        <Button title="Save Property" onPress={handleSubmit} loading={loading} style={{ marginTop: SPACING.lg }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: SPACING.md, gap: SPACING.sm, paddingBottom: SPACING.xxl },
});
