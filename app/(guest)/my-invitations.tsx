import React from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Alert, RefreshControl
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../../src/store/authStore';
import { useThemeStore } from '../../src/store/themeStore';
import { coGuestsApi, bookingsApi } from '../../src/services/mockApi';
import { Header } from '../../src/components/ui/Header';
import { Card } from '../../src/components/ui/Card';
import { Badge } from '../../src/components/ui/Badge';
import { BORDER_RADIUS, FONT_SIZE, SPACING, SHADOW } from '../../src/constants/theme';

export default function MyInvitationsScreen() {
  const { user } = useAuthStore();
  const { theme } = useThemeStore();
  const c = theme.colors;
  const queryClient = useQueryClient();

  // Fetch invitations
  const { data: invitations, isLoading, refetch } = useQuery({
    queryKey: ['myInvitations', user?.phone],
    queryFn: () => coGuestsApi.getInvitationsByUser(user?.phone || ''),
    enabled: !!user?.phone,
  });

  const responseMutation = useMutation({
    mutationFn: ({ coGuestId, accept }: { coGuestId: string; accept: boolean }) =>
      coGuestsApi.respondToInvitation(coGuestId, accept),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['myInvitations'] });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      Alert.alert(
        'Success',
        variables.accept ? 'Invitation accepted! Booking is now linked to your profile.' : 'Invitation declined.'
      );
    },
    onError: () => {
      Alert.alert('Error', 'Failed to submit response. Please try again.');
    }
  });

  const handleResponse = (coGuestId: string, accept: boolean, name: string) => {
    Alert.alert(
      accept ? 'Accept Stay Invitation' : 'Decline Stay Invitation',
      `Would you like to ${accept ? 'accept' : 'decline'} the booking invitation as a co-guest for ${name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: accept ? 'Accept' : 'Decline',
          style: accept ? 'default' : 'destructive',
          onPress: () => responseMutation.mutate({ coGuestId, accept })
        }
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <Header title="My Invitations" showBack onBack={() => router.replace('/(guest)/profile')} />
      
      <ScrollView 
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={c.primary} />}
      >
        <Text style={[styles.introText, { color: c.textSecondary }]}>
          Review invitations to join stays as an occupant. Accepting an invitation links the police clearance certificate to your profile.
        </Text>

        {isLoading ? (
          <Text style={[styles.statusText, { color: c.textMuted }]}>Loading active invitations...</Text>
        ) : invitations && invitations.length > 0 ? (
          invitations.map((invite) => {
            const isPending = invite.status === 'invited' || invite.status === 'pending';
            const isAccepted = invite.status === 'accepted';
            const isDeclined = invite.status === 'declined';
            const isExpired = invite.status === 'expired';

            // Get badge color
            const badgeVariant = isAccepted 
              ? 'success' 
              : isDeclined 
                ? 'error' 
                : isExpired 
                  ? 'muted' as any 
                  : 'warning';

            return (
              <Card key={invite.id} style={styles.inviteCard}>
                <View style={styles.cardHeader}>
                  <View style={styles.hostRow}>
                    <View style={[styles.avatarCircle, { backgroundColor: c.primary + '15' }]}>
                      <Ionicons name="mail" size={20} color={c.primary} />
                    </View>
                    <View>
                      <Text style={[styles.inviterLabel, { color: c.textMuted }]}>INVITATION FROM</Text>
                      <Text style={[styles.inviterName, { color: c.text }]}>Primary Guest (Host)</Text>
                    </View>
                  </View>
                  <Badge label={invite.status.toUpperCase()} variant={badgeVariant} />
                </View>

                <View style={[styles.bookingDetails, { backgroundColor: c.background }]}>
                  <View style={styles.detailRow}>
                    <Ionicons name="business-outline" size={16} color={c.textMuted} />
                    <Text style={[styles.detailText, { color: c.text }]}>SafeStay PG / Hotel Stay</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Ionicons name="people-outline" size={16} color={c.textMuted} />
                    <Text style={[styles.detailText, { color: c.textSecondary }]}>
                      Registered as: {invite.name} ({invite.relationship})
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Ionicons name="time-outline" size={16} color={c.textMuted} />
                    <Text style={[styles.detailText, { color: c.textSecondary }]}>
                      Invited on: {new Date(invite.invitedAt).toLocaleDateString('en-IN')}
                    </Text>
                  </View>
                  {isPending && (
                    <View style={styles.expiryBox}>
                      <Ionicons name="hourglass-outline" size={14} color={c.error} />
                      <Text style={[styles.expiryText, { color: c.error }]}>
                        Expires: {new Date(invite.invitationExpiry).toLocaleString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                      </Text>
                    </View>
                  )}
                </View>

                {isPending && (
                  <View style={styles.btnRow}>
                    <TouchableOpacity
                      style={[styles.actionBtn, styles.declineBtn, { borderColor: c.error }]}
                      onPress={() => handleResponse(invite.id, false, invite.name)}
                      disabled={responseMutation.isPending}
                    >
                      <Ionicons name="close-circle" size={16} color={c.error} />
                      <Text style={[styles.btnText, { color: c.error }]}>Decline</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.actionBtn, styles.acceptBtn, { backgroundColor: c.primary }]}
                      onPress={() => handleResponse(invite.id, true, invite.name)}
                      disabled={responseMutation.isPending}
                    >
                      <Ionicons name="checkmark-circle" size={16} color="#ffffff" />
                      <Text style={[styles.btnText, { color: '#ffffff' }]}>Accept</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {isAccepted && (
                  <View style={[styles.statusBox, { backgroundColor: '#e6f4ea' }]}>
                    <Ionicons name="checkmark-done" size={16} color="#137333" />
                    <Text style={[styles.statusBoxText, { color: '#137333' }]}>
                      Linked & Cleared by Police watchgrid
                    </Text>
                  </View>
                )}
              </Card>
            );
          })
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="mail-open-outline" size={48} color={c.textMuted} />
            <Text style={[styles.emptyText, { color: c.textMuted }]}>No stay invitations found.</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: SPACING.md, gap: SPACING.md },
  introText: { fontSize: 13, lineHeight: 18, marginBottom: 4 },
  statusText: { textAlign: 'center', marginVertical: SPACING.lg },
  inviteCard: { padding: SPACING.md },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: SPACING.md },
  hostRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inviterLabel: { fontSize: 9, fontWeight: '700', letterSpacing: 0.5 },
  inviterName: { fontSize: FONT_SIZE.md, fontWeight: '700' },
  bookingDetails: {
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    gap: 8,
    marginBottom: SPACING.md,
  },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  detailText: { fontSize: 13, fontWeight: '500' },
  expiryBox: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  expiryText: { fontSize: 11, fontWeight: '700' },
  btnRow: { flexDirection: 'row', gap: SPACING.md },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    height: 40,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  declineBtn: { borderWidth: 1.5 },
  acceptBtn: {},
  btnText: { fontSize: 13, fontWeight: '700' },
  statusBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: BORDER_RADIUS.md,
    gap: 6,
  },
  statusBoxText: { fontSize: 12, fontWeight: '700' },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 48, gap: SPACING.sm },
  emptyText: { fontSize: FONT_SIZE.md },
});
