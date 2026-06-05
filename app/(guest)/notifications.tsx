import React from 'react';
import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity, RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../../src/store/authStore';
import { useThemeStore } from '../../src/store/themeStore';
import { notificationsApi } from '../../src/services/mockApi';
import { Header } from '../../src/components/ui/Header';
import { EmptyState } from '../../src/components/ui/EmptyState';
import { BORDER_RADIUS, FONT_SIZE, SPACING } from '../../src/constants/theme';
import type { Notification } from '../../src/types';

const iconMap: Record<string, { icon: string; color: string }> = {
  booking: { icon: 'calendar', color: '#1565C0' },
  alert: { icon: 'warning', color: '#E65100' },
  kyc: { icon: 'shield-checkmark', color: '#2E7D32' },
  payment: { icon: 'card', color: '#6A1B9A' },
  system: { icon: 'settings', color: '#37474F' },
  sos: { icon: 'alert-circle', color: '#C62828' },
};

export default function NotificationsScreen() {
  const { user } = useAuthStore();
  const { theme } = useThemeStore();
  const c = theme.colors;
  const queryClient = useQueryClient();

  const { data: notifications, isLoading, refetch } = useQuery({
    queryKey: ['notifications', user?.id],
    queryFn: () => notificationsApi.getByUser(user?.id || ''),
    enabled: !!user?.id,
  });

  const markReadMutation = useMutation({
    mutationFn: notificationsApi.markRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => notificationsApi.markAllRead(user?.id || ''),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const unreadCount = notifications?.filter(n => !n.isRead).length || 0;

  const renderItem = ({ item }: { item: Notification }) => {
    const config = iconMap[item.type] || iconMap.system;
    const timeAgo = getTimeAgo(item.createdAt);

    return (
      <TouchableOpacity
        style={[
          styles.notifItem,
          {
            backgroundColor: item.isRead ? c.surface : c.primary + '08',
            borderLeftColor: item.isRead ? 'transparent' : c.primary,
            borderLeftWidth: 3,
          },
        ]}
        onPress={() => !item.isRead && markReadMutation.mutate(item.id)}
      >
        <View style={[styles.notifIcon, { backgroundColor: config.color + '15' }]}>
          <Ionicons name={config.icon as any} size={22} color={config.color} />
        </View>
        <View style={styles.notifContent}>
          <View style={styles.notifHeader}>
            <Text style={[styles.notifTitle, { color: c.text, fontWeight: item.isRead ? '500' : '700' }]}>
              {item.title}
            </Text>
            {!item.isRead && (
              <View style={[styles.unreadDot, { backgroundColor: c.primary }]} />
            )}
          </View>
          <Text style={[styles.notifBody, { color: c.textSecondary }]} numberOfLines={2}>
            {item.body}
          </Text>
          <Text style={[styles.notifTime, { color: c.textMuted }]}>{timeAgo}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <Header
        title="Notifications"
        showBack
        subtitle={unreadCount > 0 ? `${unreadCount} unread` : undefined}
        rightAction={
          unreadCount > 0 ? (
            <TouchableOpacity
              onPress={() => markAllReadMutation.mutate()}
              style={styles.markAllBtn}
            >
              <Text style={[styles.markAllText, { color: c.primary }]}>Mark all read</Text>
            </TouchableOpacity>
          ) : null
        }
      />

      {isLoading ? (
        <View style={styles.loading}>
          <Text style={{ color: c.textMuted }}>Loading notifications...</Text>
        </View>
      ) : !notifications?.length ? (
        <EmptyState
          icon="notifications-outline"
          title="No Notifications"
          description="You're all caught up! Notifications will appear here."
        />
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={false} onRefresh={refetch} />}
        />
      )}
    </View>
  );
}

function getTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  notifItem: {
    flexDirection: 'row',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    gap: SPACING.md,
  },
  notifIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  notifContent: {
    flex: 1,
  },
  notifHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  notifTitle: {
    fontSize: FONT_SIZE.base,
    flex: 1,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  notifBody: {
    fontSize: FONT_SIZE.sm,
    marginTop: 4,
    lineHeight: 18,
  },
  notifTime: {
    fontSize: FONT_SIZE.xs,
    marginTop: 4,
  },
  markAllBtn: {
    padding: SPACING.xs,
  },
  markAllText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
