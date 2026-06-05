import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useThemeStore } from '../../src/store/themeStore';
import { useAuthStore } from '../../src/store/authStore';
import { Button } from '../../src/components/ui/Button';
import { Input } from '../../src/components/ui/Input';
import { FONT_SIZE, SPACING } from '../../src/constants/theme';
import { mockGuests, mockOwners } from '../../src/data/mockUsers';
import { secureStorage } from '../../src/services/storage';
import { appStorage } from '../../src/services/storage';

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Enter a valid email').optional().or(z.literal('')),
});
type FormData = z.infer<typeof schema>;

export default function RegisterScreen() {
  const { theme } = useThemeStore();
  const { role, setUser } = useAuthStore();
  const c = theme.colors;
  const [loading, setLoading] = useState(false);

  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      // Create mock user
      await new Promise(r => setTimeout(r, 800));
      const newUserId = `${role}_${Date.now()}`;
      const token = `mock_token_${newUserId}`;
      const newUser = {
        id: newUserId,
        name: data.name,
        phone: '+91 9999999999',
        email: data.email || undefined,
        role: role || 'guest',
        kycStatus: 'pending' as const,
        isVerified: false,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
      };

      // Add to mock store
      if (role === 'guest') {
        (mockGuests as any[]).push({
          ...newUser,
          emergencyContacts: [],
          bookingHistory: [],
        });
      } else {
        (mockOwners as any[]).push({
          ...newUser,
          properties: [],
          verificationStatus: 'unverified',
        });
      }

      await secureStorage.setToken(token);
      await appStorage.setUserId(newUserId);
      await appStorage.setUserRole(role!);
      setUser(newUser as any);

      if (role === 'guest') {
        router.replace('/(guest)/home');
      } else {
        router.replace('/(owner)/dashboard');
      }
    } catch {
      Alert.alert('Error', 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={[styles.container, { backgroundColor: c.background }]}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <LinearGradient colors={['#1a237e', '#3949ab']} style={styles.header}>
          <Ionicons name="person-add" size={48} color="#ffffff" style={{ marginBottom: SPACING.md }} />
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>
            {role === 'owner' ? 'Register as Property Owner' : 'Register as Guest'}
          </Text>
        </LinearGradient>

        <View style={[styles.form, { backgroundColor: c.surface }]}>
          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, value } }) => (
              <Input
                label="Full Name"
                placeholder="Enter your full name"
                value={value}
                onChangeText={onChange}
                leftIcon="person-outline"
                error={errors.name?.message}
              />
            )}
          />
          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, value } }) => (
              <Input
                label="Email (Optional)"
                placeholder="your@email.com"
                keyboardType="email-address"
                autoCapitalize="none"
                value={value}
                onChangeText={onChange}
                leftIcon="mail-outline"
                error={errors.email?.message}
              />
            )}
          />

          <Button
            title="Create Account"
            onPress={handleSubmit(onSubmit)}
            loading={loading}
            fullWidth
            size="lg"
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flexGrow: 1 },
  header: {
    paddingTop: 80,
    paddingBottom: 50,
    paddingHorizontal: SPACING.xl,
    alignItems: 'center',
  },
  title: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: FONT_SIZE.md,
    color: 'rgba(255,255,255,0.8)',
  },
  form: {
    flex: 1,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -24,
    padding: SPACING.xl,
    paddingTop: SPACING.xxl,
  },
});
