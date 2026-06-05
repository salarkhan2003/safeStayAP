import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, SafeAreaView
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore } from '../../src/store/themeStore';
import { useAuthStore } from '../../src/store/authStore';
import { BORDER_RADIUS, FONT_SIZE, SPACING } from '../../src/constants/theme';

export default function RoleSelectScreen() {
  const { theme } = useThemeStore();
  const { setRole } = useAuthStore();

  const handleSelectRole = (role: 'guest' | 'owner') => {
    setRole(role);
    router.push({ pathname: '/(auth)/role-entry', params: { role } });
  };

  return (
    <LinearGradient colors={['#1a237e', '#0d47a1', '#1565c0']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <View style={styles.logoRing}>
              <Image 
                source={require('../../assets/logo.jpeg')} 
                style={styles.logoImage} 
                resizeMode="cover" 
              />
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
                  <Ionicons name="person" size={28} color="#ffffff" />
                </View>
                <View style={styles.cardTextContainer}>
                  <Text style={styles.cardTitle}>Guest / Tenant</Text>
                  <Text style={styles.cardDesc}>
                    Look for PG, hostel, or hotel accommodations. Save passes & use SOS safety features.
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.9)" />
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
                  <Ionicons name="business" size={28} color="#ffffff" />
                </View>
                <View style={styles.cardTextContainer}>
                  <Text style={styles.cardTitle}>PG / Hotel Owner</Text>
                  <Text style={styles.cardDesc}>
                    Manage your properties, tenants, and local police verification compliance.
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.9)" />
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
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.lg,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    paddingTop: 30,
    paddingBottom: SPACING.md,
  },
  logoRing: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
    overflow: 'hidden',
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  title: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: FONT_SIZE.sm,
    color: 'rgba(255,255,255,0.75)',
    textAlign: 'center',
    paddingHorizontal: SPACING.md,
  },
  cards: {
    flex: 1,
    gap: SPACING.md,
    justifyContent: 'center',
    marginVertical: SPACING.md,
  },
  roleCard: {
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  cardGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
  },
  cardIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  cardTextContainer: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  cardTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 2,
  },
  cardDesc: {
    fontSize: FONT_SIZE.xs,
    color: 'rgba(255,255,255,0.7)',
    lineHeight: 15,
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
