import React from 'react';
import {
  View, Text, Image, TouchableOpacity, StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useThemeStore } from '../../store/themeStore';
import { Badge } from '../ui/Badge';
import { BORDER_RADIUS, FONT_SIZE, SPACING } from '../../constants/theme';
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
      style={[styles.card, { backgroundColor: c.card, borderColor: c.border }]}
      onPress={handlePress}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityLabel={`View details for ${property.name}`}
    >
      {/* Image Container */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: property.images[0] || 'https://picsum.photos/400/300' }}
          style={styles.image}
          resizeMode="cover"
        />
        <View style={styles.imageOverlay}>
          <Badge
            label={property.type.toUpperCase()}
            variant={typeColors[property.type] || 'primary'}
            size="sm"
          />
          {property.verificationStatus === 'verified' && (
            <View style={[styles.verifiedBadge, { backgroundColor: c.success + '15', borderColor: c.success }]}>
              <Ionicons name="shield-checkmark" size={12} color={c.success} />
              <Text style={[styles.verifiedText, { color: c.success }]}>Verified</Text>
            </View>
          )}
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
          <Text style={[styles.name, { color: c.text }]} numberOfLines={1}>
            {property.name}
          </Text>
          <Text style={[styles.priceText, { color: c.text }]}>
            ₹{property.priceRange.min.toLocaleString()}/mo
          </Text>
        </View>

        <View style={styles.locationRow}>
          <Ionicons name="location-outline" size={13} color={c.textSecondary} />
          <Text style={[styles.location, { color: c.textSecondary }]} numberOfLines={1}>
            {property.address}, {property.city}
          </Text>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Ionicons name="star" size={13} color="#FFC107" />
            <Text style={[styles.statText, { color: c.text }]}>
              {property.rating} ({property.reviewCount})
            </Text>
          </View>
          <View style={styles.stat}>
            <Ionicons name="bed-outline" size={13} color={c.textSecondary} />
            <Text style={[styles.statText, { color: c.textSecondary }]}>
              {property.availableRooms} left
            </Text>
          </View>
        </View>

        {/* Amenities */}
        <View style={styles.amenities}>
          {property.amenities.slice(0, 3).map(amenity => (
            <View key={amenity} style={[styles.amenityChip, { backgroundColor: c.primaryLight }]}>
              <Text style={[styles.amenityText, { color: c.textSecondary }]}>{amenity}</Text>
            </View>
          ))}
          {property.amenities.length > 3 && (
            <View style={[styles.amenityChip, { backgroundColor: c.primaryLight }]}>
              <Text style={[styles.amenityText, { color: c.textMuted }]}>
                +{property.amenities.length - 3}
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
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    overflow: 'hidden',
  },
  imageContainer: {
    height: 150,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BORDER_RADIUS.sm,
    paddingHorizontal: 8,
    paddingVertical: 3,
    gap: 4,
    borderWidth: 0.5,
  },
  verifiedText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  priceText: {
    fontSize: FONT_SIZE.base,
    fontWeight: '800',
  },
  content: {
    padding: 16,
  },
  name: {
    fontSize: FONT_SIZE.base,
    fontWeight: '800',
    flex: 1,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
    marginBottom: 12,
  },
  location: {
    fontSize: FONT_SIZE.xs,
    flex: 1,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '600',
  },
  amenities: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  amenityChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.sm,
  },
  amenityText: {
    fontSize: FONT_SIZE.xs - 1,
    fontWeight: '600',
  },
});
