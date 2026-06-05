import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore } from '../../src/store/themeStore';
import { useAuthStore } from '../../src/store/authStore';
import { BORDER_RADIUS, FONT_SIZE, SPACING } from '../../src/constants/theme';

export default function RoleEntryScreen() {
  const { role } = useLocalSearchParams<{ role: 'guest' | 'owner' }>();
  const { theme } = useThemeStore();
  
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
        kycStatus: isGuest ? 'verified' : 'submitted',
        isVerified: isGuest,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
      }
    });

    if (isGuest) {
      useThemeStore.getState().setTheme(false);
      router.replace('/(guest)/home');
    } else {
      useThemeStore.getState().setTheme(true);
      router.replace('/(owner)/dashboard');
    }
  };

  return (
    <LinearGradient colors={['#1a237e', '#0d47a1', '#1565c0']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} accessibilityLabel="Back">
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <View style={styles.iconRing}>
              <Ionicons name={isGuest ? 'person-outline' : 'business-outline'} size={36} color="#ffffff" />
            </View>
            <Text style={styles.title}>{isGuest ? 'Guest Portal' : 'Owner Portal'}</Text>
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
                <View style={styles.cardIconBg}>
                  <Ionicons name="person-add" size={20} color="#fff" />
                </View>
                <View style={styles.cardTextContainer}>
                  <Text style={styles.cardTitle}>Register New Account</Text>
                  <Text style={styles.cardDesc}>
                    {isGuest 
                      ? 'Create profile, complete e-KYC, and search rentals.' 
                      : 'Add business info and register properties for audits.'}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.8)" />
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.actionCard, { backgroundColor: 'rgba(255,255,255,0.08)' }]}
              onPress={() => router.push({ pathname: '/(auth)/login', params: { role } })}
            >
              <View style={styles.cardHeader}>
                <View style={styles.cardIconBg}>
                  <Ionicons name="log-in" size={20} color="#fff" />
                </View>
                <View style={styles.cardTextContainer}>
                  <Text style={styles.cardTitle}>Login to Existing Account</Text>
                  <Text style={styles.cardDesc}>
                    Log in securely using your mobile number and OTP verification.
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.8)" />
              </View>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.skipBtn} onPress={handleSkip}>
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
  topBar: {
    paddingHorizontal: SPACING.md,
    paddingTop: 10,
    zIndex: 10,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.lg,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    paddingBottom: SPACING.md,
  },
  iconRing: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  title: {
    fontSize: FONT_SIZE.xl,
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
  content: {
    flex: 1,
    justifyContent: 'center',
    gap: SPACING.md,
    marginVertical: SPACING.md,
  },
  actionCard: {
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
  },
  cardIconBg: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  cardTextContainer: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  cardTitle: {
    fontSize: FONT_SIZE.base,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 2,
  },
  cardDesc: {
    fontSize: FONT_SIZE.xs,
    color: 'rgba(255,255,255,0.7)',
    lineHeight: 16,
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
