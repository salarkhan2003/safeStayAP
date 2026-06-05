import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore } from '../../src/store/themeStore';
import { Header } from '../../src/components/ui/Header';
import { Card } from '../../src/components/ui/Card';
import { BORDER_RADIUS, FONT_SIZE, SPACING } from '../../src/constants/theme';

export default function GuestHelpScreen() {
  const { theme } = useThemeStore();
  const c = theme.colors;
  const [search, setSearch] = useState('');

  const faqs = [
    { q: 'How do I search and book a PG?', a: 'Go to the Search tab, enter the location (e.g. Vijayawada), select the preferred PG, choose a room and click Book Stay.' },
    { q: 'What is the AP Police KYC verification?', a: 'To comply with local safety rules, all tenants must verify their government ID. This prevents unauthorized residents and keeps everyone secure.' },
    { q: 'How do I trigger an SOS safety alert?', a: 'Navigate to Profile -> SOS & Safety -> Trigger Panic Alarm. This alerts nearby police patrol units and your emergency contacts.' },
    { q: 'What should I do if my booking is cancelled?', a: 'If a booking is cancelled, check refund details or select another verified PG list in the home page.' }
  ];

  const filteredFaqs = faqs.filter(faq => faq.q.toLowerCase().includes(search.toLowerCase()));

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <Header title="Help & Support" showBack onBack={() => router.replace('/(guest)/profile')} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* Search */}
        <View style={[styles.searchBox, { borderColor: c.border, backgroundColor: c.card }]}>
          <Ionicons name="search" size={20} color={c.textMuted} />
          <TextInput
            placeholder="Search help articles..."
            placeholderTextColor={c.textMuted}
            style={[styles.searchInput, { color: c.text }]}
            value={search}
            onChangeText={setSearch}
          />
        </View>

        <Text style={[styles.sectionTitle, { color: c.text }]}>Frequently Asked Questions</Text>

        {filteredFaqs.map((faq, index) => (
          <Card key={index} style={styles.faqCard}>
            <Text style={[styles.question, { color: c.text }]}>{faq.q}</Text>
            <Text style={[styles.answer, { color: c.textSecondary }]}>{faq.a}</Text>
          </Card>
        ))}

        {filteredFaqs.length === 0 && (
          <Text style={[styles.noResult, { color: c.textMuted }]}>No matching questions found.</Text>
        )}

        {/* Contact Support CTA */}
        <Card style={[styles.supportCard, { backgroundColor: c.primary }]}>
          <Text style={styles.supportTitle}>Still need help?</Text>
          <Text style={styles.supportText}>Our emergency and citizen desks are available 24/7.</Text>
          <TouchableOpacity style={styles.supportBtn} onPress={() => Alert.alert('Citizen Support', 'Support number: 1800-XXX-XXXX (Toll-Free)')}>
            <Text style={{ color: c.primary, fontWeight: '700' }}>Contact Support</Text>
          </TouchableOpacity>
        </Card>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: SPACING.md, gap: SPACING.md },
  searchBox: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: SPACING.md, height: 48, borderRadius: BORDER_RADIUS.md, borderWidth: 1, gap: SPACING.xs },
  searchInput: { flex: 1, fontSize: FONT_SIZE.base },
  sectionTitle: { fontSize: FONT_SIZE.md, fontWeight: '700', marginTop: SPACING.sm },
  faqCard: { gap: SPACING.xs },
  question: { fontSize: FONT_SIZE.base, fontWeight: '700' },
  answer: { fontSize: FONT_SIZE.sm, lineHeight: 18 },
  noResult: { textAlign: 'center', marginVertical: SPACING.xl },
  supportCard: { padding: SPACING.lg, borderRadius: BORDER_RADIUS.lg, gap: SPACING.sm, alignItems: 'center' },
  supportTitle: { fontSize: FONT_SIZE.lg, fontWeight: '800', color: '#fff' },
  supportText: { fontSize: FONT_SIZE.sm, color: 'rgba(255,255,255,0.8)', textAlign: 'center', lineHeight: 20 },
  supportBtn: { backgroundColor: '#fff', paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm, borderRadius: BORDER_RADIUS.md, marginTop: SPACING.xs },
});
