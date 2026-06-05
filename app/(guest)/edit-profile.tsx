import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import { router } from 'expo-router';
import { useAuthStore } from '../../src/store/authStore';
import { useThemeStore } from '../../src/store/themeStore';
import { Header } from '../../src/components/ui/Header';
import { Input } from '../../src/components/ui/Input';
import { Button } from '../../src/components/ui/Button';
import { SPACING } from '../../src/constants/theme';

export default function GuestEditProfileScreen() {
  const { user, setUser } = useAuthStore();
  const { theme } = useThemeStore();
  const c = theme.colors;

  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });

  const [loading, setLoading] = useState(false);

  const handleSave = () => {
    if (!form.name || !form.phone) {
      Alert.alert('Error', 'Name and Phone are required.');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setUser({ ...user!, name: form.name, email: form.email, phone: form.phone });
      Alert.alert('Success', 'Profile updated successfully!', [
        { text: 'OK', onPress: () => router.replace('/(guest)/profile') }
      ]);
    }, 1000);
  };

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <Header title="Edit Profile" showBack onBack={() => router.replace('/(guest)/profile')} />
      <ScrollView contentContainerStyle={styles.content}>
        <Input
          label="Full Name *"
          value={form.name}
          onChangeText={(t) => setForm({ ...form, name: t })}
          placeholder="Enter your name"
        />
        <Input
          label="Email Address"
          value={form.email}
          onChangeText={(t) => setForm({ ...form, email: t })}
          placeholder="enteremail@domain.com"
          keyboardType="email-address"
        />
        <Input
          label="Phone Number *"
          value={form.phone}
          onChangeText={(t) => setForm({ ...form, phone: t })}
          placeholder="Enter phone number"
          keyboardType="phone-pad"
        />
        <Button title="Save Profile" onPress={handleSave} loading={loading} style={{ marginTop: SPACING.md }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: SPACING.md, gap: SPACING.sm },
});
