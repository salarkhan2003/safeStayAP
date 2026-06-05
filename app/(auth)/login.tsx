import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, KeyboardAvoidingView, Platform, Alert, Image,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '../../src/store/authStore';
import { useThemeStore } from '../../src/store/themeStore';
import { Button } from '../../src/components/ui/Button';
import { Input } from '../../src/components/ui/Input';
import { FONT_SIZE, SPACING, BORDER_RADIUS } from '../../src/constants/theme';

const schema = z.object({
  phone: z
    .string()
    .min(10, 'Enter a valid phone number')
    .regex(/^[+]?[0-9\s-]{10,14}$/, 'Enter a valid phone number'),
});
type FormData = z.infer<typeof schema>;

export default function LoginScreen() {
  const { sendOtp } = useAuthStore();
  const { theme } = useThemeStore();
  const c = theme.colors;
  const [loading, setLoading] = useState(false);

  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      await sendOtp(data.phone);
      router.push({ pathname: '/(auth)/otp', params: { phone: data.phone } });
    } catch (err) {
      Alert.alert('Error', 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (role: 'guest' | 'owner') => {
    const phones = { guest: '+91 9000000001', owner: '+91 9876501001' };
    // We set via controller - just navigate directly for demo
    router.push({
      pathname: '/(auth)/otp',
      params: { phone: phones[role] },
    });
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
        {/* Hero */}
        <LinearGradient
          colors={['#1a237e', '#3949ab', '#1565c0']}
          style={styles.hero}
        >
          <View style={styles.logoContainer}>
            <Image source={require('../../assets/logo.jpeg')} style={{ width: '100%', height: '100%', borderRadius: 48 }} resizeMode="cover" />
          </View>
          <Text style={styles.appName}>SafeStay AP</Text>
          <Text style={styles.tagline}>Safe. Verified. Connected.</Text>
        </LinearGradient>

        {/* Form */}
        <View style={[styles.formContainer, { backgroundColor: c.surface }]}>
          <Text style={[styles.formTitle, { color: c.text }]}>Sign In / Register</Text>
          <Text style={[styles.formSubtitle, { color: c.textMuted }]}>
            Enter your mobile number to continue
          </Text>

          <Controller
            control={control}
            name="phone"
            render={({ field: { onChange, value } }) => (
              <Input
                label="Mobile Number"
                placeholder="+91 9000000000"
                keyboardType="phone-pad"
                value={value}
                onChangeText={onChange}
                leftIcon="call-outline"
                error={errors.phone?.message}
              />
            )}
          />

          <Button
            title="Send OTP"
            onPress={handleSubmit(onSubmit)}
            loading={loading}
            fullWidth
            size="lg"
            style={{ marginTop: SPACING.sm }}
          />

          {/* Demo Shortcuts */}
          <View style={styles.demoSection}>
            <View style={[styles.divider, { backgroundColor: c.border }]} />
            <Text style={[styles.demoLabel, { color: c.textMuted }]}>Demo Login</Text>
            <View style={[styles.divider, { backgroundColor: c.border }]} />
          </View>

          <View style={styles.demoButtons}>
            <TouchableOpacity
              style={[styles.demoBtn, { backgroundColor: c.primary + '15', borderColor: c.primary }]}
              onPress={() => fillDemo('guest')}
            >
              <Ionicons name="person-outline" size={20} color={c.primary} />
              <Text style={[styles.demoBtnText, { color: c.primary }]}>Guest Demo</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.demoBtn, { backgroundColor: c.secondary + '15', borderColor: c.secondary }]}
              onPress={() => fillDemo('owner')}
            >
              <Ionicons name="business-outline" size={20} color={c.secondary} />
              <Text style={[styles.demoBtnText, { color: c.secondary }]}>Owner Demo</Text>
            </TouchableOpacity>
          </View>

          <Text style={[styles.hint, { color: c.textMuted }]}>
            OTP for demo: 123456
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flexGrow: 1 },
  hero: {
    paddingTop: 80,
    paddingBottom: 60,
    alignItems: 'center',
  },
  logoContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  appName: {
    fontSize: FONT_SIZE.xxxl,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 1,
  },
  tagline: {
    fontSize: FONT_SIZE.base,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
    letterSpacing: 2,
  },
  formContainer: {
    flex: 1,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -24,
    padding: SPACING.xl,
    paddingTop: SPACING.xxl,
  },
  formTitle: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: '700',
    marginBottom: 8,
  },
  formSubtitle: {
    fontSize: FONT_SIZE.md,
    marginBottom: SPACING.xl,
  },
  demoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SPACING.lg,
    gap: SPACING.sm,
  },
  divider: {
    flex: 1,
    height: 1,
  },
  demoLabel: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '500',
  },
  demoButtons: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  demoBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1.5,
  },
  demoBtnText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
  },
  hint: {
    fontSize: FONT_SIZE.xs,
    textAlign: 'center',
    marginTop: SPACING.sm,
  },
});
