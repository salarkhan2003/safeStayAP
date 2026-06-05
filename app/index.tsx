import { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '../src/store/authStore';

export default function Index() {
  const { isAuthenticated, isLoading, role, hasCompletedOnboarding } = useAuthStore();

  useEffect(() => {
    if (isLoading) return;

    const timer = setTimeout(() => {
      if (!hasCompletedOnboarding) {
        router.replace('/onboarding');
      } else if (!isAuthenticated) {
        router.replace('/(auth)/login');
      } else if (role === 'guest') {
        router.replace('/(guest)/home');
      } else if (role === 'owner') {
        router.replace('/(owner)/dashboard');
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [isLoading, isAuthenticated, role, hasCompletedOnboarding]);

  return (
    <LinearGradient
      colors={['#1a237e', '#3949ab', '#1565c0']}
      style={styles.container}
    >
      <ActivityIndicator size="large" color="#ffffff" />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
