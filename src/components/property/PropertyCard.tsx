import React from 'react';
import {
  View, Text, Image, TouchableOpacity, StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeStore } from '../../store/themeStore';
import { Badge } from '../ui/Badge';
import { BORDER_RADIUS, FONT_SIZE, SHADOW, SPACING } from '../../constants/theme';
import type { Property } from '../../types';

interface PropertyCardProps {
  property: Property;
  onPress?: () => void;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({ property, onPress }) => {
  const { theme } = useThemeStore();
  const c = theme.colors;

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.push(`/(guest)/property/${property.id}` as any);
    }
  };

  const typeColors: Record<string, 'primary' | 'secondary' | 'info' | 'success'> = {
    pg: 'primary',
    hotel: 'secondary',
    hostel: 'info',
    guesthouse: 'success',
  };

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: c.card, ...SHADOW.md }]}
      onPress={handlePress}
      activeOpacity={0.9}
      accessibilityRole="button"
      accessibilityLabel={`View details for ${property.name}`}
    >
      {/* Image */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: property.images[0] || 'https://picsum.photos/400/300' }}
          style={styles.image}
          resizeMode="cover"
        />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.6)']}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.imageOverlay}>
          <Badge
            label={property.type.toUpperCase()}
            variant={typeColors[property.type] || 'primary'}
            size="sm"
          />
          {property.verificationStatus === 'verified' && (
            <View style={styles.verifiedBadge}>
              <Ionicons name="shield-checkmark" size={14} color="#4CAF50" />
              <Text style={styles.verifiedText}>Verified</Text>
            </View>
          )}
        </View>
        <View style={styles.priceTag}>
          <Text style={styles.priceText}>
            ₹{property.priceRange.min.toLocaleString()}/mo
          </Text>
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={[styles.name, { color: c.text }]} numberOfLines={1}>
          {property.name}
        </Text>
        <View style={styles.locationRow}>
          <Ionicons name="location-outline" size={14} color={c.textMuted} />
          <Text style={[styles.location, { color: c.textMuted }]} numberOfLines={1}>
            {property.address}, {property.city}
          </Text>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Ionicons name="star" size={14} color="#FFC107" />
            <Text style={[styles.statText, { color: c.text }]}>
              {property.rating} ({property.reviewCount})
            </Text>
          </View>
          <View style={styles.stat}>
            <Ionicons name="bed-outline" size={14} color={c.primary} />
            <Text style={[styles.statText, { color: c.textSecondary }]}>
              {property.availableRooms} available
            </Text>
          </View>
          <View style={styles.stat}>
            <Ionicons name="people-outline" size={14} color={c.primary} />
            <Text style={[styles.statText, { color: c.textSecondary }]}>
              {property.totalRooms} rooms
            </Text>
          </View>
        </View>

        {/* Amenities */}
        <View style={styles.amenities}>
          {property.amenities.slice(0, 4).map(amenity => (
            <View key={amenity} style={[styles.amenityChip, { backgroundColor: c.primary + '15' }]}>
              <Text style={[styles.amenityText, { color: c.primary }]}>{amenity}</Text>
            </View>
          ))}
          {property.amenities.length > 4 && (
            <View style={[styles.amenityChip, { backgroundColor: c.border }]}>
              <Text style={[styles.amenityText, { color: c.textMuted }]}>
                +{property.amenities.length - 4}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.md,
    overflow: 'hidden',
  },
  imageContainer: {
    height: 180,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    top: SPACING.sm,
    left: SPACING.sm,
    right: SPACING.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: BORDER_RADIUS.full,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    gap: 4,
  },
  verifiedText: {
    color: '#4CAF50',
    fontSize: FONT_SIZE.xs,
    fontWeight: '600',
  },
  priceTag: {
    position: 'absolute',
    bottom: SPACING.sm,
    right: SPACING.sm,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: BORDER_RADIUS.sm,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
  },
  priceText: {
    color: '#ffffff',
    fontSize: FONT_SIZE.sm,
    fontWeight: '700',
  },
  content: {
    padding: SPACING.md,
  },
  name: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: SPACING.sm,
  },
  location: {
    fontSize: FONT_SIZE.sm,
    flex: 1,
  },
  statsRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.sm,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '500',
  },
  amenities: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  amenityChip: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderRadius: BORDER_RADIUS.full,
  },
  amenityText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '500',
  },
});
