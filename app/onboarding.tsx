import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, FlatList, Dimensions,
  TouchableOpacity, Image
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../src/store/authStore';
import { useLangStore } from '../src/store/langStore';
import { Button } from '../src/components/ui/Button';
import { FONT_SIZE, SPACING, BORDER_RADIUS } from '../src/constants/theme';

const { width, height } = Dimensions.get('window');

const slides = [
  {
    id: '1',
    titleKey: 'welcome',
    subtitleKey: 'subtitle',
    icon: 'shield-checkmark',
    accent: '#38bdf8', // Cyber Cyan
  },
  {
    id: '2',
    titleKey: 'slide2Title',
    subtitleKey: 'slide2Subtitle',
    icon: 'home-outline',
    accent: '#10b981', // Neon Emerald
  },
  {
    id: '3',
    titleKey: 'slide3Title',
    subtitleKey: 'slide3Subtitle',
    icon: 'qr-code-outline',
    accent: '#6366f1', // Indigo
  },
  {
    id: '4',
    titleKey: 'slide4Title',
    subtitleKey: 'slide4Subtitle',
    icon: 'alert-circle-outline',
    accent: '#ef4444', // Security Red
  },
];

export default function OnboardingScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const { setOnboardingComplete } = useAuthStore();
  const { language, setLanguage, t } = useLangStore();

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
      setCurrentIndex(currentIndex + 1);
    } else {
      handleGetStarted();
    }
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      flatListRef.current?.scrollToIndex({ index: currentIndex - 1 });
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleGetStarted = () => {
    setOnboardingComplete();
    router.replace('/(auth)/role-select');
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Background decoration */}
      <LinearGradient colors={['#070a13', '#0f172a']} style={StyleSheet.absoluteFillObject} />
      <View style={styles.backgroundGrid} />

      {/* Top Banner (Government Authority indicator) */}
      <View style={styles.govBanner}>
        <Text style={styles.govTitle}>GOVERNMENT OF ANDHRA PRADESH</Text>
        <Text style={styles.govSub}>AP STATE POLICE SAFETY INITIATIVE</Text>
      </View>

      {/* Language Selector (Top-right) */}
      <View style={styles.langSelector}>
        {['en', 'te', 'hi'].map((lang) => (
          <TouchableOpacity
            key={lang}
            style={[styles.langBtn, language === lang && styles.langBtnActive]}
            onPress={() => setLanguage(lang as any)}
          >
            <Text style={[styles.langText, language === lang && styles.langTextActive]}>
              {lang === 'en' ? 'EN' : lang === 'te' ? 'తె' : 'हि'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Main slider */}
      <FlatList
        ref={flatListRef}
        data={slides}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEnabled={false}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.slide}>
            
            {/* Styled Graphic Display */}
            <View style={styles.illustrationWrapper}>
              <View style={[styles.glowBackground, { backgroundColor: item.accent + '20' }]} />
              <View style={[styles.iconContainer, { borderColor: item.accent + '50' }]}>
                {item.id === '1' ? (
                  <View style={styles.logoWrapper}>
                    <Image 
                      source={require('../assets/logo.jpeg')} 
                      style={styles.logoImage} 
                      resizeMode="cover" 
                    />
                  </View>
                ) : (
                  <View style={[styles.iconInner, { backgroundColor: item.accent + '15' }]}>
                    <Ionicons name={item.icon as any} size={76} color={item.accent} />
                  </View>
                )}
                {/* Micro safety shield badge on graphics */}
                <View style={[styles.microShield, { backgroundColor: item.accent }]}>
                  <Ionicons name="shield-checkmark" size={14} color="#ffffff" />
                </View>
              </View>
            </View>

            {/* Translated Typography */}
            <View style={styles.textContainer}>
              <Text style={styles.title}>{t(item.titleKey)}</Text>
              <Text style={styles.subtitle}>{t(item.subtitleKey)}</Text>
            </View>

          </View>
        )}
      />

      {/* Bottom control bar */}
      <View style={styles.footerContainer}>
        {/* Progress indicator dots */}
        <View style={styles.dots}>
          {slides.map((slide, idx) => (
            <View
              key={idx}
              style={[
                styles.dot, 
                idx === currentIndex && [styles.activeDot, { backgroundColor: slide.accent }]
              ]}
            />
          ))}
        </View>

        {/* Localized navigation actions with back button support */}
        <View style={styles.buttons}>
          {currentIndex > 0 ? (
            <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={18} color="rgba(255,255,255,0.7)" />
              <Text style={styles.backText}>{t('back')}</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={handleGetStarted} style={styles.skipBtn}>
              <Text style={styles.skipText}>{t('skip')}</Text>
            </TouchableOpacity>
          )}

          {currentIndex < slides.length - 1 ? (
            <Button
              title={t('next')}
              onPress={handleNext}
              style={styles.nextBtn}
              rightIcon={<Ionicons name="arrow-forward" size={18} color="#fff" />}
            />
          ) : (
            <Button
              title={t('getStarted')}
              onPress={handleGetStarted}
              style={styles.nextBtn}
              rightIcon={<Ionicons name="checkmark-circle" size={18} color="#fff" />}
            />
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#070a13' },
  backgroundGrid: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.04,
    borderWidth: 1,
    borderColor: '#ffffff',
    // Mock grid overlay via absolute border ticks in React Native
  },
  govBanner: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
  },
  govTitle: {
    color: '#94a3b8',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  govSub: {
    color: '#e2e8f0',
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
    letterSpacing: 0.5,
  },
  langSelector: {
    position: 'absolute',
    top: 48,
    right: 20,
    flexDirection: 'row',
    zIndex: 10,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 20,
    padding: 3,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  langBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 17,
  },
  langBtnActive: {
    backgroundColor: '#38bdf8', // Cyan active highlight
  },
  langText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 10,
    fontWeight: '800',
  },
  langTextActive: {
    color: '#070a13',
  },
  slide: {
    width,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.xl,
  },
  illustrationWrapper: {
    width: 220,
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xl,
    position: 'relative',
  },
  glowBackground: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    transform: [{ scale: 1.2 }],
  },
  iconContainer: {
    width: 170,
    height: 170,
    borderRadius: 85,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    backgroundColor: 'rgba(15,23,42,0.6)',
  },
  iconInner: {
    width: 154,
    height: 154,
    borderRadius: 77,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoWrapper: {
    width: 154,
    height: 154,
    borderRadius: 77,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  microShield: {
    position: 'absolute',
    bottom: 4,
    right: 18,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#0f172a',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 4,
  },
  textContainer: {
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    marginTop: SPACING.sm,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: SPACING.sm,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 22,
  },
  footerContainer: {
    paddingHorizontal: SPACING.xl,
    paddingBottom: 48,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: SPACING.xl,
    gap: 8,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  activeDot: {
    width: 18,
  },
  buttons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  skipBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  skipText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
    fontWeight: '700',
  },
  backBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 4,
  },
  backText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
    fontWeight: '700',
  },
  nextBtn: {
    flex: 2,
  },
});
