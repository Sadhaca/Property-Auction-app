import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { format, parseISO } from 'date-fns';
import { useRouter } from 'expo-router';
import { colors } from '../theme/colors';
import { fontSizes, fontWeights } from '../theme/typography';
import { spacing, borderRadius, shadows } from '../theme/spacing';
import { Badge } from './Badge';
import { PriceDisplay } from './PriceDisplay';
import type { AuctionProperty } from '../types';

interface PropertyListItemProps {
  property: AuctionProperty;
  isFavorite?: boolean;
  onToggleFavorite?: (id: string) => void;
}

export const PropertyListItem: React.FC<PropertyListItemProps> = ({
  property,
  isFavorite = false,
  onToggleFavorite,
}) => {
  const router = useRouter();

  const handlePress = () => {
    router.push(`/property/${property.id}`);
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handlePress}
      activeOpacity={0.85}
    >
      {/* Thumbnail */}
      <View style={styles.thumbnail}>
        {property.images && property.images.length > 0 ? (
          <Image source={{ uri: property.images[0] }} style={styles.image} />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Ionicons name="home-outline" size={24} color={colors.text.tertiary} />
          </View>
        )}
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.topRow}>
          <Badge
            label={property.property_type.replace('_', ' ')}
            size="sm"
            color={colors.propertyType[property.property_type] || colors.text.secondary}
            backgroundColor={
              (colors.propertyType[property.property_type] || colors.text.secondary) + '15'
            }
          />
          <TouchableOpacity
            onPress={() => onToggleFavorite?.(property.id)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons
              name={isFavorite ? 'heart' : 'heart-outline'}
              size={18}
              color={isFavorite ? colors.error : colors.text.tertiary}
            />
          </TouchableOpacity>
        </View>

        <Text style={styles.title} numberOfLines={1}>
          {property.title}
        </Text>

        <View style={styles.locationRow}>
          <Ionicons name="location-outline" size={12} color={colors.text.tertiary} />
          <Text style={styles.location} numberOfLines={1}>
            {property.city}, {property.state}
          </Text>
        </View>

        <View style={styles.bottomRow}>
          <PriceDisplay amount={property.reserve_price} size="md" />
          {property.auction_date && (
            <Text style={styles.date}>
              {format(parseISO(property.auction_date), 'dd MMM')}
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.surface.primary,
    borderRadius: borderRadius.xl,
    padding: spacing[3],
    marginBottom: spacing[3],
    ...shadows.sm,
  },
  thumbnail: {
    width: 88,
    height: 88,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.background.tertiary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    marginLeft: spacing[3],
    justifyContent: 'space-between',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.semibold as any,
    color: colors.text.primary,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  location: {
    fontSize: fontSizes.sm,
    color: colors.text.secondary,
    marginLeft: 4,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  date: {
    fontSize: fontSizes.sm,
    color: colors.text.tertiary,
    fontWeight: fontWeights.medium as any,
  },
});
