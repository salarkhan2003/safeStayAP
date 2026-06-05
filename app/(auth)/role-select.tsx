import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Image,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore } from '../../src/store/themeStore';
import { useAuthStore } from '../../src/store/authStore';
import { BORDER_RADIUS, FONT_SIZE, SHADOW, SPACING } from '../../src/constants/theme';

export default function RoleSelectScreen() {
  const { theme } = useThemeStore();
  const { setRole } = useAuthStore();
  const c = theme.colors;

  const handleSelectRole = (role: 'guest' | 'owner') => {
    setRole(role);
    router.push({ pathname: '/(auth)/role-entry', params: { role } });
  };

  return (
    <LinearGradient colors={['#1a237e', '#0d47a1', '#1565c0']} style={styles.container}>
      <View style={styles.header}>
        <View style={styles.logoRing}>
          <Image source={require('../../assets/logo.jpeg')} style={{ width: '100%', height: '100%', borderRadius: 44 }} resizeMode="cover" />
        </View>
        <Text style={styles.title}>Who are you?</Text>
        <Text style={styles.subtitle}>
          Choose your role to get the right experience
        </Text>
      </View>

      <View style={styles.cards}>
        <TouchableOpacity
          style={styles.roleCard}
          onPress={() => handleSelectRole('guest')}
          accessibilityRole="button"
          accessibilityLabel="Select Guest role"
        >
          <LinearGradient
            colors={['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.05)']}
            style={styles.cardGradient}
          >
            <View style={[styles.cardIcon, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
              <Ionicons name="person" size={40} color="#ffffff" />
            </View>
            <Text style={styles.cardTitle}>Guest / Tenant</Text>
            <Text style={styles.cardDesc}>
              Looking for PG, hostel, or hotel accommodation
            </Text>
            <View style={styles.cardFeatures}>
              {['Search properties', 'Book & check-in', 'SOS safety features', 'Digital guest pass'].map(f => (
                <View key={f} style={styles.feature}>
                  <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                  <Text style={styles.featureText}>{f}</Text>
                </View>
              ))}
            </View>
            <View style={styles.cardArrow}>
              <Ionicons name="arrow-forward-circle" size={32} color="rgba(255,255,255,0.9)" />
            </View>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.roleCard}
          onPress={() => handleSelectRole('owner')}
          accessibilityRole="button"
          accessibilityLabel="Select Owner role"
        >
          <LinearGradient
            colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.03)']}
            style={styles.cardGradient}
          >
            <View style={[styles.cardIcon, { backgroundColor: 'rgba(255,255,255,0.15)' }]}>
              <Ionicons name="business" size={40} color="#ffffff" />
            </View>
            <Text style={styles.cardTitle}>PG / Hotel Owner</Text>
            <Text style={styles.cardDesc}>
              Manage your property, guests, and compliance
            </Text>
            <View style={styles.cardFeatures}>
              {['Property management', 'Guest verification', 'Compliance tracking', 'Analytics & reports'].map(f => (
                <View key={f} style={styles.feature}>
                  <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                  <Text style={styles.featureText}>{f}</Text>
                </View>
              ))}
            </View>
            <View style={styles.cardArrow}>
              <Ionicons name="arrow-forward-circle" size={32} color="rgba(255,255,255,0.9)" />
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.skipBtn}
        onPress={() => {
          useAuthStore.setState({
            isAuthenticated: true,
            role: 'guest',
            user: {
              id: 'guest_explorer',
              name: 'Guest Explorer',
              phone: '+91 9999999999',
              role: 'guest',
              kycStatus: 'verified',
              isVerified: true,
              createdAt: new Date().toISOString(),
              lastLogin: new Date().toISOString(),
            }
          });
          router.replace('/(guest)/home');
        }}
      >
        <Text style={styles.skipBtnText}>Skip Registration & Explore App →</Text>
      </TouchableOpacity>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: SPACING.xl },
  header: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: SPACING.xl,
  },
  logoRing: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: FONT_SIZE.xxxl,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: FONT_SIZE.base,
    color: 'rgba(255,255,255,0.75)',
    textAlign: 'center',
  },
  cards: {
    flex: 1,
    gap: SPACING.lg,
    justifyContent: 'center',
  },
  roleCard: {
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  cardGradient: {
    padding: SPACING.xl,
  },
  cardIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  cardTitle: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: SPACING.xs,
  },
  cardDesc: {
    fontSize: FONT_SIZE.md,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: SPACING.md,
  },
  cardFeatures: {
    gap: SPACING.xs,
    marginBottom: SPACING.md,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  featureText: {
    fontSize: FONT_SIZE.sm,
    color: 'rgba(255,255,255,0.85)',
  },
  cardArrow: {
    alignItems: 'flex-end',
  },
  skipBtn: {
    alignItems: 'center',
    paddingVertical: SPACING.md,
    marginTop: SPACING.md,
  },
  skipBtnText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: FONT_SIZE.base,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
});
