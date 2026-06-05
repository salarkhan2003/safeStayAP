import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { router } from 'expo-router';
import { useThemeStore } from '../../src/store/themeStore';
import { Header } from '../../src/components/ui/Header';
import { Input } from '../../src/components/ui/Input';
import { Button } from '../../src/components/ui/Button';
import { Card } from '../../src/components/ui/Card';
import { SPACING } from '../../src/constants/theme';

export default function BankScreen() {
  const { theme } = useThemeStore();
  const c = theme.colors;
  
  const [form, setForm] = useState({
    holderName: '',
    accountNumber: '',
    ifscCode: '',
    bankName: '',
  });

  const [loading, setLoading] = useState(false);

  const handleSave = () => {
    if (!form.holderName || !form.accountNumber || !form.ifscCode || !form.bankName) {
      Alert.alert('Error', 'Please fill all bank details.');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      Alert.alert('Success', 'Bank details updated successfully!', [
        { text: 'OK', onPress: () => router.replace('/(owner)/settings') }
      ]);
    }, 1000);
  };

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <Header title="Bank Account Details" showBack onBack={() => router.replace('/(owner)/settings')} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Card style={styles.formCard}>
          <Input
            label="Account Holder Name *"
            value={form.holderName}
            onChangeText={(t) => setForm({ ...form, holderName: t })}
            placeholder="Name as in passbook"
          />
          <Input
            label="Bank Name *"
            value={form.bankName}
            onChangeText={(t) => setForm({ ...form, bankName: t })}
            placeholder="e.g. State Bank of India"
          />
          <Input
            label="Account Number *"
            value={form.accountNumber}
            onChangeText={(t) => setForm({ ...form, accountNumber: t })}
            placeholder="Account number"
            keyboardType="number-pad"
          />
          <Input
            label="IFSC Code *"
            value={form.ifscCode}
            onChangeText={(t) => setForm({ ...form, ifscCode: t })}
            placeholder="e.g. SBIN0001234"
            autoCapitalize="characters"
          />
          <Button title="Save Bank Details" onPress={handleSave} loading={loading} style={{ marginTop: SPACING.md }} />
        </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: SPACING.md },
  formCard: { gap: SPACING.sm },
});
