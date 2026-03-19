import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { format, parseISO } from 'date-fns';
import { useRouter } from 'expo-router';
import { colors } from '../theme/colors';
import { fontSizes, fontWeights } from '../theme/typography';
import { spacing, borderRadius, shadows } from '../theme/spacing';
import { Badge } from './Badge';
import { PriceDisplay, formatINR } from './PriceDisplay';
import { CountdownTimer } from './CountdownTimer';
import type { AuctionProperty, PropertyStatus, PropertyType } from '../types';

interface PropertyCardProps {
  property: AuctionProperty;
  isFavorite?: boolean;
  onToggleFavorite?: (id: string) => void;
  compact?: boolean;
}

function getStatusColor(status: PropertyStatus): { color: string; bg: string } {
  const map: Record<PropertyStatus, { color: string; bg: string }> = {
    upcoming: { color: colors.status.upcoming, bg: colors.status.upcomingBg },
    live: { color: colors.status.live, bg: colors.status.liveBg },
    completed: { color: colors.status.completed, bg: colors.status.completedBg },
    cancelled: { color: colors.status.cancelled, bg: colors.status.cancelledBg },
    postponed: { color: colors.status.postponed, bg: colors.status.postponedBg },
  };
  return map[status] || map.upcoming;
}

function getTypeColor(type: PropertyType): string {
  return colors.propertyType[type] || colors.propertyType.other;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
  isFavorite = false,
  onToggleFavorite,
  compact = false,
}) => {
  const router = useRouter();
  const statusColor = getStatusColor(property.status);
  const typeColor = getTypeColor(property.property_type);

  const handlePress = () => {
    router.push(`/property/${property.id}`);
  };

  return (
    <TouchableOpacity
      style={[styles.container, compact && styles.compactContainer]}
      onPress={handlePress}
      activeOpacity={0.85}
    >
      {/* Image Section */}
      <View style={[styles.imageContainer, compact && styles.compactImage]}>
        {property.images && property.images.length > 0 ? (
          <Image source={{ uri: property.images[0] }} style={styles.image} />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Ionicons name="home-outline" size={compact ? 24 : 40} color={colors.text.tertiary} />
          </View>
        )}

        {/* Status Badge */}
        <View style={styles.statusBadge}>
          <Badge
            label={property.status.toUpperCase()}
            color={statusColor.color}
            backgroundColor={statusColor.bg}
            size="sm"
          />
        </View>

        {/* Favorite Button */}
        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={() => onToggleFavorite?.(property.id)}
        >
          <Ionicons
            name={isFavorite ? 'heart' : 'heart-outline'}
            size={22}
            color={isFavorite ? colors.error : colors.white}
          />
        </TouchableOpacity>
      </View>

      {/* Content Section */}
      <View style={styles.content}>
        {/* Type Badge */}
        <View style={styles.badgeRow}>
          <Badge
            label={property.property_type.replace('_', ' ')}
            color={typeColor}
            backgroundColor={typeColor + '15'}
            size="sm"
          />
          {property.bank_name && (
            <Text style={styles.bankName} numberOfLines={1}>
              {property.bank_name}
            </Text>
          )}
        </View>

        {/* Title */}
        <Text style={styles.title} numberOfLines={2}>
          {property.title}
        </Text>

        {/* Location */}
        <View style={styles.locationRow}>
          <Ionicons name="location-outline" size={14} color={colors.text.tertiary} />
          <Text style={styles.location} numberOfLines={1}>
            {property.city}, {property.state}
          </Text>
        </View>

        {/* Price & Auction Info */}
        <View style={styles.priceRow}>
          <View>
            <Text style={styles.priceLabel}>Reserve Price</Text>
            <PriceDisplay amount={property.reserve_price} size="lg" />
          </View>
          {property.auction_date && (
            <View style={styles.auctionInfo}>
              <CountdownTimer targetDate={property.auction_date} compact />
              <Text style={styles.auctionDate}>
                {format(parseISO(property.auction_date), 'dd MMM yyyy')}
              </Text>
            </View>
          )}
        </View>

        {/* Area Info */}
        {property.area_sqft && (
          <View style={styles.areaRow}>
            <Ionicons name="resize-outline" size={14} color={colors.text.tertiary} />
            <Text style={styles.areaText}>
              {property.area_sqft.toLocaleString('en-IN')} sq.ft
            </Text>
            {property.reserve_price && property.area_sqft > 0 && (
              <Text style={styles.pricePerSqft}>
                {formatINR(Math.round(property.reserve_price / property.area_sqft))}/sq.ft
              </Text>
            )}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface.primary,
    borderRadius: borderRadius.xl,
    marginBottom: spacing[4],
    overflow: 'hidden',
    ...shadows.lg,
  },
  compactContainer: {
    width: 280,
    marginRight: spacing[4],
    marginBottom: 0,
  },
  imageContainer: {
    height: 180,
    position: 'relative',
  },
  compactImage: {
    height: 140,
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
  statusBadge: {
    position: 'absolute',
    top: spacing[3],
    left: spacing[3],
  },
  favoriteButton: {
    position: 'absolute',
    top: spacing[3],
    right: spacing[3],
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: spacing[4],
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing[2],
  },
  bankName: {
    fontSize: fontSizes.sm,
    color: colors.text.secondary,
    fontWeight: fontWeights.medium as any,
    flex: 1,
    textAlign: 'right',
    marginLeft: spacing[2],
  },
  title: {
    fontSize: fontSizes.base,
    fontWeight: fontWeights.semibold as any,
    color: colors.text.primary,
    marginBottom: spacing[1],
    lineHeight: 22,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[3],
  },
  location: {
    fontSize: fontSizes.sm,
    color: colors.text.secondary,
    marginLeft: spacing[1],
    flex: 1,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: spacing[2],
  },
  priceLabel: {
    fontSize: fontSizes.xs,
    color: colors.text.tertiary,
    marginBottom: spacing[0.5],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  auctionInfo: {
    alignItems: 'flex-end',
  },
  auctionDate: {
    fontSize: fontSizes.xs,
    color: colors.text.tertiary,
    marginTop: spacing[1],
  },
  areaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: spacing[2],
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  areaText: {
    fontSize: fontSizes.sm,
    color: colors.text.secondary,
    marginLeft: spacing[1],
  },
  pricePerSqft: {
    fontSize: fontSizes.sm,
    color: colors.text.tertiary,
    marginLeft: 'auto',
  },
});
