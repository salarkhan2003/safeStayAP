import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore } from '../../src/store/themeStore';
import { useAuthStore } from '../../src/store/authStore';
import { Button } from '../../src/components/ui/Button';
import { BORDER_RADIUS, FONT_SIZE, SPACING } from '../../src/constants/theme';

export default function RoleEntryScreen() {
  const { role } = useLocalSearchParams<{ role: 'guest' | 'owner' }>();
  const { theme } = useThemeStore();
  const c = theme.colors;

  const isGuest = role === 'guest';

  const handleSkip = () => {
    useAuthStore.setState({
      isAuthenticated: true,
      role: role || 'guest',
      user: {
        id: `${role || 'guest'}_explorer`,
        name: isGuest ? 'Guest Explorer' : 'Owner Explorer',
        phone: '+91 9999999999',
        role: role || 'guest',
        kycStatus: isGuest ? 'verified' : 'submitted', // Guest is active immediately, owner is pending police review
        isVerified: isGuest,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
      }
    });

    if (isGuest) {
      router.replace('/(guest)/home');
    } else {
      router.replace('/(owner)/dashboard');
    }
  };

  return (
    <LinearGradient colors={['#1a237e', '#0d47a1', '#1565c0']} style={styles.container}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
        <Ionicons name="arrow-back" size={24} color="#fff" />
      </TouchableOpacity>

      <View style={styles.header}>
        <View style={styles.iconRing}>
          <Ionicons name={isGuest ? 'person-outline' : 'business-outline'} size={48} color="#ffffff" />
        </View>
        <Text style={styles.title}>{isGuest ? 'Guest Portal' : 'PG / Hotel Owner Portal'}</Text>
        <Text style={styles.subtitle}>
          {isGuest 
            ? 'Access safe, verified stays and emergency policing features.' 
            : 'Register your properties and coordinate tenant verifications.'}
        </Text>
      </View>

      <View style={styles.content}>
        <TouchableOpacity 
          style={[styles.actionCard, { backgroundColor: 'rgba(255,255,255,0.12)' }]}
          onPress={() => router.push(isGuest ? '/(auth)/guest-register' : '/(auth)/owner-register')}
        >
          <View style={styles.cardHeader}>
            <Ionicons name="person-add" size={26} color="#fff" />
            <Text style={styles.cardTitle}>Register New Account</Text>
          </View>
          <Text style={styles.cardDesc}>
            {isGuest 
              ? 'Create your digital profile, perform e-KYC, and search rentals.' 
              : 'Add your business details and list PG properties for compliance audits.'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.actionCard, { backgroundColor: 'rgba(255,255,255,0.08)' }]}
          onPress={() => router.push({ pathname: '/(auth)/login', params: { role } })}
        >
          <View style={styles.cardHeader}>
            <Ionicons name="log-in" size={26} color="#fff" />
            <Text style={styles.cardTitle}>Login to Existing Account</Text>
          </View>
          <Text style={styles.cardDesc}>
            Log in quickly using mobile number OTP verification.
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.skipBtn} onPress={handleSkip}>
        <Text style={styles.skipBtnText}>Skip Registration & Explore App →</Text>
      </TouchableOpacity>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: SPACING.xl },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
  },
  header: {
    alignItems: 'center',
    paddingVertical: SPACING.lg,
  },
  iconRing: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: FONT_SIZE.base,
    color: 'rgba(255,255,255,0.75)',
    textAlign: 'center',
    paddingHorizontal: SPACING.md,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    gap: SPACING.lg,
  },
  actionCard: {
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    marginBottom: SPACING.xs,
  },
  cardTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: '#ffffff',
  },
  cardDesc: {
    fontSize: FONT_SIZE.sm,
    color: 'rgba(255,255,255,0.7)',
    lineHeight: 18,
  },
  skipBtn: {
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  skipBtnText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: FONT_SIZE.base,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
});
