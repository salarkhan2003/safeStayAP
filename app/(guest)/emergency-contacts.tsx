import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '../../src/store/authStore';
import { useThemeStore } from '../../src/store/themeStore';
import { Header } from '../../src/components/ui/Header';
import { Card } from '../../src/components/ui/Card';
import { Input } from '../../src/components/ui/Input';
import { Button } from '../../src/components/ui/Button';
import { BORDER_RADIUS, FONT_SIZE, SPACING } from '../../src/constants/theme';
import type { EmergencyContact } from '../../src/types';

const schema = z.object({
  name: z.string().min(2),
  relationship: z.string().min(2),
  phone: z.string().min(10),
});
type FormData = z.infer<typeof schema>;

const MOCK_CONTACTS: EmergencyContact[] = [
  { id: 'ec_1', name: 'Sundar Reddy', relationship: 'Father', phone: '+91 9000001111', isPrimary: true },
  { id: 'ec_2', name: 'Lakshmi Reddy', relationship: 'Mother', phone: '+91 9000002222', isPrimary: false },
];

export default function EmergencyContactsScreen() {
  const { user } = useAuthStore();
  const { theme } = useThemeStore();
  const c = theme.colors;
  const [contacts, setContacts] = useState<EmergencyContact[]>(MOCK_CONTACTS);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  const { control, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 600));
    const newContact: EmergencyContact = {
      id: `ec_${Date.now()}`,
      name: data.name,
      relationship: data.relationship,
      phone: data.phone,
      isPrimary: contacts.length === 0,
    };
    setContacts(prev => [...prev, newContact]);
    reset();
    setShowForm(false);
    setLoading(false);
  };

  const handleDelete = (id: string) => {
    Alert.alert('Remove Contact', 'Remove this emergency contact?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => setContacts(prev => prev.filter(c => c.id !== id)) },
    ]);
  };

  const handleSetPrimary = (id: string) => {
    setContacts(prev => prev.map(c => ({ ...c, isPrimary: c.id === id })));
  };

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <Header
        title="Emergency Contacts"
        showBack
        rightAction={
          !showForm && (
            <TouchableOpacity onPress={() => setShowForm(true)} style={styles.addBtn}>
              <Ionicons name="add" size={24} color={c.primary} />
            </TouchableOpacity>
          )
        }
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Info Banner */}
        <View style={[styles.infoBanner, { backgroundColor: c.primary + '15' }]}>
          <Ionicons name="information-circle" size={20} color={c.primary} />
          <Text style={[styles.infoText, { color: c.primary }]}>
            These contacts will be alerted when you trigger SOS or Silent SOS
          </Text>
        </View>

        {/* Contacts List */}
        {contacts.map(contact => (
          <Card key={contact.id} style={styles.contactCard}>
            <View style={styles.contactHeader}>
              <View style={[styles.contactAvatar, { backgroundColor: c.primary + '20' }]}>
                <Ionicons name="person" size={24} color={c.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <View style={styles.nameRow}>
                  <Text style={[styles.contactName, { color: c.text }]}>{contact.name}</Text>
                  {contact.isPrimary && (
                    <View style={[styles.primaryBadge, { backgroundColor: c.success + '20' }]}>
                      <Text style={[styles.primaryText, { color: c.success }]}>Primary</Text>
                    </View>
                  )}
                </View>
                <Text style={[styles.relationship, { color: c.textMuted }]}>{contact.relationship}</Text>
                <Text style={[styles.phone, { color: c.primary }]}>{contact.phone}</Text>
              </View>
            </View>
            <View style={styles.contactActions}>
              {!contact.isPrimary && (
                <TouchableOpacity
                  style={[styles.actionBtn, { borderColor: c.success }]}
                  onPress={() => handleSetPrimary(contact.id)}
                >
                  <Text style={[styles.actionBtnText, { color: c.success }]}>Set Primary</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={[styles.actionBtn, { borderColor: c.error }]}
                onPress={() => handleDelete(contact.id)}
              >
                <Text style={[styles.actionBtnText, { color: c.error }]}>Remove</Text>
              </TouchableOpacity>
            </View>
          </Card>
        ))}

        {/* Add Contact Form */}
        {showForm && (
          <Card style={styles.form}>
            <Text style={[styles.formTitle, { color: c.text }]}>Add Emergency Contact</Text>
            <Controller
              control={control}
              name="name"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Full Name"
                  value={value}
                  onChangeText={onChange}
                  leftIcon="person-outline"
                  error={errors.name?.message}
                />
              )}
            />
            <Controller
              control={control}
              name="relationship"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Relationship"
                  placeholder="e.g. Father, Mother, Spouse"
                  value={value}
                  onChangeText={onChange}
                  leftIcon="people-outline"
                  error={errors.relationship?.message}
                />
              )}
            />
            <Controller
              control={control}
              name="phone"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Phone Number"
                  keyboardType="phone-pad"
                  value={value}
                  onChangeText={onChange}
                  leftIcon="call-outline"
                  error={errors.phone?.message}
                />
              )}
            />
            <View style={styles.formBtns}>
              <Button title="Cancel" variant="outline" onPress={() => setShowForm(false)} style={{ flex: 1 }} />
              <Button title="Add Contact" onPress={handleSubmit(onSubmit)} loading={loading} style={{ flex: 2 }} />
            </View>
          </Card>
        )}

        {contacts.length === 0 && !showForm && (
          <View style={styles.empty}>
            <Ionicons name="people-outline" size={60} color={c.textMuted} />
            <Text style={[styles.emptyTitle, { color: c.text }]}>No Emergency Contacts</Text>
            <Text style={[styles.emptyDesc, { color: c.textMuted }]}>
              Add contacts who will be alerted in case of emergency
            </Text>
            <Button title="Add Contact" onPress={() => setShowForm(true)} style={{ marginTop: SPACING.md }} />
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: SPACING.md, gap: SPACING.md },
  addBtn: { padding: SPACING.xs },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
  },
  infoText: { flex: 1, fontSize: FONT_SIZE.sm, lineHeight: 18 },
  contactCard: { marginBottom: 0 },
  contactHeader: { flexDirection: 'row', gap: SPACING.md, marginBottom: SPACING.md },
  contactAvatar: {
    width: 48, height: 48, borderRadius: 24,
    alignItems: 'center', justifyContent: 'center',
  },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs, marginBottom: 4 },
  contactName: { fontSize: FONT_SIZE.base, fontWeight: '700' },
  primaryBadge: {
    paddingHorizontal: SPACING.xs, paddingVertical: 2,
    borderRadius: BORDER_RADIUS.full,
  },
  primaryText: { fontSize: FONT_SIZE.xs, fontWeight: '600' },
  relationship: { fontSize: FONT_SIZE.sm, marginBottom: 2 },
  phone: { fontSize: FONT_SIZE.sm, fontWeight: '600' },
  contactActions: { flexDirection: 'row', gap: SPACING.sm, justifyContent: 'flex-end' },
  actionBtn: {
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full, borderWidth: 1,
  },
  actionBtnText: { fontSize: FONT_SIZE.sm, fontWeight: '600' },
  form: {},
  formTitle: { fontSize: FONT_SIZE.lg, fontWeight: '700', marginBottom: SPACING.md },
  formBtns: { flexDirection: 'row', gap: SPACING.md },
  empty: { alignItems: 'center', paddingVertical: SPACING.xxl, gap: SPACING.sm },
  emptyTitle: { fontSize: FONT_SIZE.xl, fontWeight: '700' },
  emptyDesc: { fontSize: FONT_SIZE.md, textAlign: 'center' },
});
