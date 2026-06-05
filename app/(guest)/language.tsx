import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useLangStore } from '../../src/store/langStore';
import { useThemeStore } from '../../src/store/themeStore';
import { Header } from '../../src/components/ui/Header';
import { Button } from '../../src/components/ui/Button';
import { BORDER_RADIUS, FONT_SIZE, SPACING } from '../../src/constants/theme';

export default function GuestLanguageScreen() {
  const { language, setLanguage, t } = useLangStore();
  const { theme } = useThemeStore();
  const c = theme.colors;

  const [selected, setSelected] = useState(language);

  const languages = [
    { code: 'en' as const, label: 'English', sub: 'English' },
    { code: 'te' as const, label: 'తెలుగు', sub: 'Telugu' },
    { code: 'hi' as const, label: 'हिन्दी', sub: 'Hindi' },
  ];

  const handleSave = () => {
    setLanguage(selected);
    Alert.alert(
      selected === 'en' ? 'Success' : selected === 'te' ? 'విజయం' : 'सफलता',
      selected === 'en' ? 'Language updated successfully!' : selected === 'te' ? 'భాష విజయవంతంగా నవీకరించబడింది!' : 'भाषा सफलतापूर्वक अपडेट की गई!'
    );
    router.replace('/(guest)/profile');
  };

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <Header title={t('language')} showBack onBack={() => router.replace('/(guest)/profile')} />
      <View style={styles.content}>
        {languages.map((lang) => {
          const isSelected = selected === lang.code;
          return (
            <TouchableOpacity
              key={lang.code}
              style={[
                styles.option,
                {
                  backgroundColor: isSelected ? c.primary + '15' : c.card,
                  borderColor: isSelected ? c.primary : c.border,
                },
              ]}
              onPress={() => setSelected(lang.code)}
            >
              <View>
                <Text style={[styles.label, { color: c.text }]}>{lang.label}</Text>
                <Text style={[styles.sub, { color: c.textMuted }]}>{lang.sub}</Text>
              </View>
              {isSelected && <Ionicons name="checkmark-circle" size={24} color={c.primary} />}
            </TouchableOpacity>
          );
        })}

        <Button title={selected === 'en' ? 'Save Language' : selected === 'te' ? 'భాషను సేవ్ చేయండి' : 'भाषा सहेजें'} onPress={handleSave} style={styles.saveBtn} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: SPACING.md, gap: SPACING.sm, flex: 1 },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1.5,
    justifyContent: 'space-between',
  },
  label: { fontSize: FONT_SIZE.md, fontWeight: '700' },
  sub: { fontSize: FONT_SIZE.sm, marginTop: 2 },
  saveBtn: { marginTop: SPACING.lg },
});
