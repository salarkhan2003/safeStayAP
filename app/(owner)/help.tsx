import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore } from '../../src/store/themeStore';
import { Header } from '../../src/components/ui/Header';
import { Card } from '../../src/components/ui/Card';
import { BORDER_RADIUS, FONT_SIZE, SPACING } from '../../src/constants/theme';

export default function HelpScreen() {
  const { theme } = useThemeStore();
  const c = theme.colors;
  const [search, setSearch] = useState('');

  const faqs = [
    { q: 'How do I add a new PG or property?', a: 'Navigate to "Properties" tab and click the Floating Action Button (FAB) at the bottom-right. Fill in the details and submit.' },
    { q: 'What business documents are required?', a: 'You will need a trade license, GST registration document (if applicable), and Owner PAN card for verification.' },
    { q: 'Why is my property verification status pending?', a: 'Every listed property is reviewed by local administrative divisions to verify compliance. This typically takes 2 to 3 business days.' },
    { q: 'How do I add staff/managers to my properties?', a: 'Go to Settings -> Staff Management -> Click the FAB at the bottom right to register manager/security/housekeeping staff.' }
  ];

  const filteredFaqs = faqs.filter(faq => faq.q.toLowerCase().includes(search.toLowerCase()));

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <Header title="Help Center" showBack onBack={() => router.replace('/(owner)/settings')} />
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
          <Text style={styles.supportText}>Our administrative and technical support teams are available 24/7.</Text>
          <TouchableOpacity style={styles.supportBtn} onPress={() => router.push('/(owner)/support')}>
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
