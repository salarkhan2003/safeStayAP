import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="otp" />
      <Stack.Screen name="role-select" />
      <Stack.Screen name="role-entry" />
      <Stack.Screen name="guest-register" />
      <Stack.Screen name="owner-register" />
      <Stack.Screen name="register" />
    </Stack>
  );
}
