import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../src/store/authStore';
import { useThemeStore } from '../../src/store/themeStore';
import { Button } from '../../src/components/ui/Button';
import { BORDER_RADIUS, FONT_SIZE, SPACING } from '../../src/constants/theme';

export default function OTPScreen() {
  const { phone } = useLocalSearchParams<{ phone: string }>();
  const { verifyOtp, sendOtp, role } = useAuthStore();
  const { theme } = useThemeStore();
  const c = theme.colors;

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);
  const inputs = useRef<TextInput[]>([]);

  useEffect(() => {
    if (resendTimer > 0) {
      const t = setTimeout(() => setResendTimer(v => v - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [resendTimer]);

  const handleOtpChange = (text: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);
    if (text && index < 5) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !otp[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const otpValue = otp.join('');
    if (otpValue.length !== 6) {
      Alert.alert('Error', 'Please enter 6-digit OTP');
      return;
    }
    setLoading(true);
    try {
      const result = await verifyOtp(phone!, otpValue);
      if (result.isNewUser) {
        router.replace('/(auth)/role-select');
      } else {
        const currentRole = useAuthStore.getState().role;
        if (currentRole === 'guest') {
          router.replace('/(guest)/home');
        } else {
          router.replace('/(owner)/dashboard');
        }
      }
    } catch (err: any) {
      Alert.alert('Invalid OTP', err.message || 'Please enter correct OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResendTimer(30);
    await sendOtp(phone!);
    Alert.alert('OTP Sent', 'New OTP has been sent to ' + phone);
  };

  const maskedPhone = phone
    ? phone.replace(/(\d{2})\d{6}(\d{2})/, '$1xxxxxx$2')
    : '';

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: c.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <LinearGradient colors={['#1a237e', '#3949ab']} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <View style={styles.iconRing}>
            <Ionicons name="phone-portrait-outline" size={36} color="#ffffff" />
          </View>
          <Text style={styles.headerTitle}>Verify OTP</Text>
          <Text style={styles.headerSubtitle}>
            Enter 6-digit OTP sent to{'\n'}{maskedPhone}
          </Text>
        </View>
      </LinearGradient>

      {/* OTP Input */}
      <View style={[styles.formContainer, { backgroundColor: c.surface }]}>
        <View style={styles.otpRow}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={ref => { if (ref) inputs.current[index] = ref; }}
              style={[
                styles.otpInput,
                {
                  backgroundColor: c.background,
                  borderColor: digit ? c.primary : c.border,
                  color: c.text,
                },
              ]}
              maxLength={1}
              keyboardType="number-pad"
              value={digit}
              onChangeText={text => handleOtpChange(text, index)}
              onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
              accessibilityLabel={`OTP digit ${index + 1}`}
            />
          ))}
        </View>

        {/* Demo hint */}
        <View style={[styles.hint, { backgroundColor: c.primary + '10' }]}>
          <Ionicons name="information-circle-outline" size={16} color={c.primary} />
          <Text style={[styles.hintText, { color: c.primary }]}>
            Demo OTP: 123456
          </Text>
        </View>

        <Button
          title="Verify OTP"
          onPress={handleVerify}
          loading={loading}
          fullWidth
          size="lg"
          style={{ marginTop: SPACING.xl }}
        />

        <View style={styles.resendRow}>
          <Text style={[styles.resendText, { color: c.textMuted }]}>
            Didn't receive OTP?{' '}
          </Text>
          {resendTimer > 0 ? (
            <Text style={[styles.timerText, { color: c.textMuted }]}>
              Resend in {resendTimer}s
            </Text>
          ) : (
            <TouchableOpacity onPress={handleResend}>
              <Text style={[styles.resendLink, { color: c.primary }]}>Resend</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingTop: 60,
    paddingBottom: 50,
    paddingHorizontal: SPACING.xl,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  headerContent: {
    alignItems: 'center',
  },
  iconRing: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  headerTitle: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: SPACING.xs,
  },
  headerSubtitle: {
    fontSize: FONT_SIZE.md,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    lineHeight: 22,
  },
  formContainer: {
    flex: 1,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -24,
    padding: SPACING.xl,
    paddingTop: SPACING.xxl,
  },
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  otpInput: {
    width: 48,
    height: 56,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 2,
    textAlign: 'center',
    fontSize: FONT_SIZE.xl,
    fontWeight: '700',
  },
  hint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
  },
  hintText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '500',
  },
  resendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.xl,
  },
  resendText: {
    fontSize: FONT_SIZE.md,
  },
  timerText: {
    fontSize: FONT_SIZE.md,
  },
  resendLink: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
  },
});
