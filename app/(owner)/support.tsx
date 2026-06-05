import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { router } from 'expo-router';
import { useThemeStore } from '../../src/store/themeStore';
import { Header } from '../../src/components/ui/Header';
import { Input } from '../../src/components/ui/Input';
import { Button } from '../../src/components/ui/Button';
import { Card } from '../../src/components/ui/Card';
import { BORDER_RADIUS, FONT_SIZE, SPACING } from '../../src/constants/theme';

export default function SupportScreen() {
  const { theme } = useThemeStore();
  const c = theme.colors;
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = () => {
    if (!msg.trim()) {
      Alert.alert('Error', 'Message cannot be empty.');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setMsg('');
      Alert.alert('Success', 'Support ticket created successfully. Our representative will contact you shortly.', [
        { text: 'OK', onPress: () => router.replace('/(owner)/settings') }
      ]);
    }, 1000);
  };

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <Header title="Contact Support" showBack onBack={() => router.replace('/(owner)/settings')} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        <Card style={styles.card}>
          <Text style={[styles.title, { color: c.text }]}>Direct Helpdesk</Text>
          <Text style={[styles.body, { color: c.textSecondary }]}>
            Email: support@safestay.ap.gov.in
            {'\n'}Phone: +91 866 XXX XXXX (Administrative Support)
            {'\n'}Hours: 10:00 AM - 6:00 PM (IST)
          </Text>
        </Card>

        <Card style={styles.card}>
          <Text style={[styles.title, { color: c.text }]}>Create a Support Ticket</Text>
          <Input
            label="Explain your issue/request"
            placeholder="Type support query details here..."
            value={msg}
            onChangeText={setMsg}
            multiline
            style={{ minHeight: 100, textAlignVertical: 'top' }}
          />
          <Button title="Submit Ticket" onPress={handleSend} loading={loading} style={{ marginTop: SPACING.sm }} />
        </Card>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: SPACING.md, gap: SPACING.md },
  card: { gap: SPACING.sm },
  title: { fontSize: FONT_SIZE.base, fontWeight: '700' },
  body: { fontSize: FONT_SIZE.sm, lineHeight: 20 },
});
