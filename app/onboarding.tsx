import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, FlatList, Dimensions,
  TouchableOpacity, Image,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../src/store/authStore';
import { Button } from '../src/components/ui/Button';
import { FONT_SIZE, SPACING } from '../src/constants/theme';

const { width } = Dimensions.get('window');

const slides = [
  {
    id: '1',
    title: 'Welcome to SafeStay AP',
    subtitle: 'Your trusted platform for safe, verified accommodations across Andhra Pradesh & Telangana.',
    icon: 'shield-checkmark',
    gradient: ['#1a237e', '#3949ab'],
  },
  {
    id: '2',
    title: 'Verified Properties',
    subtitle: 'Every PG, hostel, and hotel is police-verified and KYC-compliant for your safety.',
    icon: 'home-outline',
    gradient: ['#0d47a1', '#1565c0'],
  },
  {
    id: '3',
    title: 'Smart Booking',
    subtitle: 'Book your stay with digital check-in, QR passes, and real-time notifications.',
    icon: 'qr-code-outline',
    gradient: ['#1a237e', '#283593'],
  },
  {
    id: '4',
    title: 'Emergency SOS',
    subtitle: 'One-tap SOS and silent alert system to keep you protected around the clock.',
    icon: 'alert-circle-outline',
    gradient: ['#880e4f', '#c2185b'],
  },
];

export default function OnboardingScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const { setOnboardingComplete } = useAuthStore();

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
      setCurrentIndex(currentIndex + 1);
    } else {
      handleGetStarted();
    }
  };

  const handleGetStarted = () => {
    setOnboardingComplete();
    router.replace('/(auth)/login');
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <FlatList
        ref={flatListRef}
        data={slides}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEnabled={false}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <LinearGradient
            colors={item.gradient as [string, string]}
            style={styles.slide}
          >
            <View style={styles.iconContainer}>
              <Ionicons name={item.icon as any} size={100} color="rgba(255,255,255,0.9)" />
            </View>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.subtitle}>{item.subtitle}</Text>
          </LinearGradient>
        )}
      />

      {/* Dots */}
      <View style={styles.footer}>
        <LinearGradient colors={['#1a237e', '#3949ab']} style={styles.footerGradient}>
          <View style={styles.dots}>
            {slides.map((_, idx) => (
              <View
                key={idx}
                style={[styles.dot, idx === currentIndex && styles.activeDot]}
              />
            ))}
          </View>

          <View style={styles.buttons}>
            {currentIndex < slides.length - 1 ? (
              <>
                <TouchableOpacity onPress={handleGetStarted} style={styles.skipBtn}>
                  <Text style={styles.skipText}>Skip</Text>
                </TouchableOpacity>
                <Button
                  title="Next"
                  onPress={handleNext}
                  style={styles.nextBtn}
                  rightIcon={<Ionicons name="arrow-forward" size={18} color="#fff" />}
                />
              </>
            ) : (
              <Button
                title="Get Started"
                onPress={handleGetStarted}
                fullWidth
                size="lg"
                rightIcon={<Ionicons name="arrow-forward" size={20} color="#fff" />}
              />
            )}
          </View>
        </LinearGradient>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  slide: {
    width,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xxl,
  },
  iconContainer: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xxl,
  },
  title: {
    fontSize: FONT_SIZE.xxxl,
    fontWeight: '800',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  subtitle: {
    fontSize: FONT_SIZE.lg,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    lineHeight: 26,
  },
  footer: {
    paddingBottom: 0,
  },
  footerGradient: {
    padding: SPACING.xl,
    paddingBottom: SPACING.xxl,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: SPACING.xl,
    gap: SPACING.xs,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  activeDot: {
    width: 24,
    backgroundColor: '#ffffff',
  },
  buttons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  skipBtn: {
    flex: 1,
    padding: SPACING.md,
    alignItems: 'center',
  },
  skipText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: FONT_SIZE.base,
    fontWeight: '500',
  },
  nextBtn: {
    flex: 2,
  },
});
