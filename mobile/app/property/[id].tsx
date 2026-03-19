import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Share,
  Linking,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { format, parseISO } from 'date-fns';
import { colors } from '../../src/theme/colors';
import { fontSizes, fontWeights } from '../../src/theme/typography';
import { spacing, borderRadius, shadows } from '../../src/theme/spacing';
import { Badge } from '../../src/components/Badge';
import { PriceDisplay, formatINR } from '../../src/components/PriceDisplay';
import { CountdownTimer } from '../../src/components/CountdownTimer';
import { useFavorites } from '../../src/hooks/useFavorites';
import { api } from '../../src/lib/api';
import type { AuctionProperty } from '../../src/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function PropertyDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { isFavorite, toggleFavorite } = useFavorites();

  const [property, setProperty] = useState<AuctionProperty | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProperty();
  }, [id]);

  const fetchProperty = async () => {
    setIsLoading(true);
    try {
      const response = await api.get<AuctionProperty>(`/properties/${id}`);
      setProperty(response.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load property');
    } finally {
      setIsLoading(false);
    }
  };

  const handleShare = async () => {
    if (!property) return;
    try {
      await Share.share({
        title: property.title,
        message: `Check out this auction property: ${property.title}\nReserve Price: ${formatINR(property.reserve_price)}\nLocation: ${property.city}, ${property.state}\n\nDiscovered on AuctionProp`,
      });
    } catch {}
  };

  const handleSourceLink = () => {
    if (property?.source_url) {
      Linking.openURL(property.source_url);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary[500]} />
      </View>
    );
  }

  if (error || !property) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={48} color={colors.error} />
        <Text style={styles.errorText}>{error || 'Property not found'}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchProperty}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const statusColors: Record<string, { color: string; bg: string }> = {
    upcoming: { color: colors.status.upcoming, bg: colors.status.upcomingBg },
    live: { color: colors.status.live, bg: colors.status.liveBg },
    completed: { color: colors.status.completed, bg: colors.status.completedBg },
    cancelled: { color: colors.status.cancelled, bg: colors.status.cancelledBg },
    postponed: { color: colors.status.postponed, bg: colors.status.postponedBg },
  };

  const sc = statusColors[property.status] || statusColors.upcoming;

  const riskColor =
    (property.risk_score ?? 50) <= 30
      ? colors.risk.low
      : (property.risk_score ?? 50) <= 60
      ? colors.risk.medium
      : colors.risk.high;

  const riskLabel =
    (property.risk_score ?? 50) <= 30
      ? 'Low Risk'
      : (property.risk_score ?? 50) <= 60
      ? 'Medium Risk'
      : 'High Risk';

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Image Carousel Placeholder */}
        <View style={styles.imageCarousel}>
          <View style={styles.imagePlaceholder}>
            <Ionicons name="images-outline" size={48} color={colors.text.tertiary} />
            <Text style={styles.imagePlaceholderText}>Property Images</Text>
          </View>
          <View style={styles.imageOverlay}>
            <Badge
              label={property.status.toUpperCase()}
              color={sc.color}
              backgroundColor={sc.bg}
            />
          </View>
        </View>

        <View style={styles.content}>
          {/* Title & Badges */}
          <View style={styles.titleSection}>
            <View style={styles.badgeRow}>
              <Badge
                label={property.property_type.replace('_', ' ')}
                color={colors.propertyType[property.property_type] || colors.text.secondary}
                backgroundColor={
                  (colors.propertyType[property.property_type] || colors.text.secondary) + '15'
                }
              />
              {property.property_subtype && (
                <Badge
                  label={property.property_subtype}
                  size="sm"
                  color={colors.text.secondary}
                  backgroundColor={colors.background.tertiary}
                />
              )}
            </View>
            <Text style={styles.title}>{property.title}</Text>
            <View style={styles.locationRow}>
              <Ionicons name="location" size={16} color={colors.secondary[500]} />
              <Text style={styles.address}>
                {property.address}
                {property.city ? `, ${property.city}` : ''}
                {property.district ? `, ${property.district}` : ''}
                {property.state ? `, ${property.state}` : ''}
                {property.pin_code ? ` - ${property.pin_code}` : ''}
              </Text>
            </View>
          </View>

          {/* Reserve Price */}
          <View style={styles.priceCard}>
            <View>
              <Text style={styles.priceLabel}>Reserve Price</Text>
              <PriceDisplay amount={property.reserve_price} size="xl" />
              <Text style={styles.priceFullText}>
                {formatINR(property.reserve_price, true)}
              </Text>
            </View>
            {property.emd_amount && (
              <View style={styles.emdSection}>
                <Text style={styles.emdLabel}>EMD Amount</Text>
                <PriceDisplay amount={property.emd_amount} size="md" />
              </View>
            )}
          </View>

          {/* Auction Date Countdown */}
          {property.auction_date && (
            <View style={styles.auctionCard}>
              <View style={styles.auctionHeader}>
                <Ionicons name="time-outline" size={20} color={colors.primary[500]} />
                <Text style={styles.auctionTitle}>Auction Date</Text>
              </View>
              <Text style={styles.auctionDateText}>
                {format(parseISO(property.auction_date), 'EEEE, dd MMMM yyyy')}
              </Text>
              {property.auction_start_time && (
                <Text style={styles.auctionTimeText}>
                  {property.auction_start_time}
                  {property.auction_end_time ? ` - ${property.auction_end_time}` : ''}
                </Text>
              )}
              <View style={styles.countdownContainer}>
                <CountdownTimer targetDate={property.auction_date} />
              </View>
            </View>
          )}

          {/* AI Summary */}
          {property.ai_summary && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="sparkles" size={20} color={colors.secondary[500]} />
                <Text style={styles.sectionTitle}>AI Summary</Text>
              </View>
              <Text style={styles.summaryText}>{property.ai_summary}</Text>
            </View>
          )}

          {/* Property Details */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="information-circle-outline" size={20} color={colors.primary[500]} />
              <Text style={styles.sectionTitle}>Property Details</Text>
            </View>
            <View style={styles.detailsGrid}>
              <DetailRow label="Bank" value={property.bank_name} />
              {property.bank_branch && (
                <DetailRow label="Branch" value={property.bank_branch} />
              )}
              {property.borrower_name && (
                <DetailRow label="Borrower" value={property.borrower_name} />
              )}
              {property.area_sqft && (
                <DetailRow
                  label="Total Area"
                  value={`${property.area_sqft.toLocaleString('en-IN')} sq.ft`}
                />
              )}
              {property.carpet_area_sqft && (
                <DetailRow
                  label="Carpet Area"
                  value={`${property.carpet_area_sqft.toLocaleString('en-IN')} sq.ft`}
                />
              )}
              {property.built_up_area_sqft && (
                <DetailRow
                  label="Built-up Area"
                  value={`${property.built_up_area_sqft.toLocaleString('en-IN')} sq.ft`}
                />
              )}
              {property.plot_area_sqft && (
                <DetailRow
                  label="Plot Area"
                  value={`${property.plot_area_sqft.toLocaleString('en-IN')} sq.ft`}
                />
              )}
              {property.floors && (
                <DetailRow label="Floors" value={String(property.floors)} />
              )}
              {property.bedrooms && (
                <DetailRow label="Bedrooms" value={String(property.bedrooms)} />
              )}
              {property.bathrooms && (
                <DetailRow label="Bathrooms" value={String(property.bathrooms)} />
              )}
              {property.possession_status && (
                <DetailRow
                  label="Possession"
                  value={
                    property.possession_status.charAt(0).toUpperCase() +
                    property.possession_status.slice(1)
                  }
                />
              )}
              <DetailRow label="Source" value={property.source} />
              <DetailRow
                label="Listed On"
                value={format(parseISO(property.created_at), 'dd MMM yyyy')}
              />
            </View>
          </View>

          {/* Risk Score */}
          {property.risk_score !== undefined && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="shield-checkmark-outline" size={20} color={riskColor} />
                <Text style={styles.sectionTitle}>Risk Assessment</Text>
              </View>
              <View style={styles.scoreCard}>
                <View style={styles.scoreCircle}>
                  <Text style={[styles.scoreValue, { color: riskColor }]}>
                    {property.risk_score}
                  </Text>
                  <Text style={styles.scoreOutOf}>/100</Text>
                </View>
                <View style={styles.scoreInfo}>
                  <Text style={[styles.scoreLabel, { color: riskColor }]}>
                    {riskLabel}
                  </Text>
                  <View style={styles.scoreBar}>
                    <View
                      style={[
                        styles.scoreBarFill,
                        {
                          width: `${property.risk_score}%`,
                          backgroundColor: riskColor,
                        },
                      ]}
                    />
                  </View>
                </View>
              </View>
            </View>
          )}

          {/* Completeness Score */}
          {property.completeness_score !== undefined && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="checkmark-done-outline" size={20} color={colors.info} />
                <Text style={styles.sectionTitle}>Data Completeness</Text>
              </View>
              <View style={styles.completenessRow}>
                <Text style={styles.completenessValue}>
                  {property.completeness_score}%
                </Text>
                <View style={styles.completenessBar}>
                  <View
                    style={[
                      styles.completenessBarFill,
                      { width: `${property.completeness_score}%` },
                    ]}
                  />
                </View>
              </View>
            </View>
          )}

          {/* Documents */}
          {property.documents && property.documents.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="document-text-outline" size={20} color={colors.primary[500]} />
                <Text style={styles.sectionTitle}>Documents</Text>
              </View>
              {property.documents.map((doc) => (
                <TouchableOpacity
                  key={doc.id}
                  style={styles.documentItem}
                  onPress={() => Linking.openURL(doc.url)}
                >
                  <Ionicons name="document-outline" size={20} color={colors.primary[500]} />
                  <View style={styles.documentInfo}>
                    <Text style={styles.documentName}>{doc.name}</Text>
                    <Text style={styles.documentMeta}>
                      {doc.type.toUpperCase()}
                      {doc.size_bytes
                        ? ` - ${(doc.size_bytes / 1024).toFixed(0)} KB`
                        : ''}
                    </Text>
                  </View>
                  <Ionicons name="download-outline" size={20} color={colors.text.tertiary} />
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Map Placeholder */}
          {(property.latitude || property.longitude) && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="map-outline" size={20} color={colors.primary[500]} />
                <Text style={styles.sectionTitle}>Location</Text>
              </View>
              <View style={styles.mapPlaceholder}>
                <Ionicons name="map" size={40} color={colors.text.tertiary} />
                <Text style={styles.mapPlaceholderText}>Map View</Text>
                <Text style={styles.mapCoords}>
                  {property.latitude?.toFixed(4)}, {property.longitude?.toFixed(4)}
                </Text>
              </View>
            </View>
          )}

          {/* Source Link */}
          {property.source_url && (
            <TouchableOpacity style={styles.sourceLink} onPress={handleSourceLink}>
              <Ionicons name="open-outline" size={18} color={colors.primary[500]} />
              <Text style={styles.sourceLinkText}>View Original Source</Text>
            </TouchableOpacity>
          )}

          <View style={styles.bottomSpacer} />
        </View>
      </ScrollView>

      {/* Bottom Action Bar */}
      <View style={styles.actionBar}>
        <TouchableOpacity
          style={styles.actionIconButton}
          onPress={() => toggleFavorite(property.id)}
        >
          <Ionicons
            name={isFavorite(property.id) ? 'heart' : 'heart-outline'}
            size={24}
            color={isFavorite(property.id) ? colors.error : colors.text.secondary}
          />
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionIconButton} onPress={handleShare}>
          <Ionicons name="share-outline" size={24} color={colors.text.secondary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.enquiryButton}
          onPress={() =>
            router.push({
              pathname: '/property/enquiry',
              params: { propertyId: property.id, propertyTitle: property.title },
            })
          }
        >
          <Ionicons name="chatbubble-outline" size={20} color={colors.white} />
          <Text style={styles.enquiryButtonText}>Send Enquiry</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const DetailRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <View style={styles.detailRow}>
    <Text style={styles.detailLabel}>{label}</Text>
    <Text style={styles.detailValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing[8],
    backgroundColor: colors.background.secondary,
  },
  errorText: {
    fontSize: fontSizes.base,
    color: colors.text.secondary,
    marginTop: spacing[4],
    textAlign: 'center',
  },
  retryButton: {
    marginTop: spacing[4],
    paddingHorizontal: spacing[6],
    paddingVertical: spacing[3],
    backgroundColor: colors.primary[500],
    borderRadius: borderRadius.lg,
  },
  retryText: {
    color: colors.white,
    fontWeight: fontWeights.semibold as any,
  },
  imageCarousel: {
    height: 260,
    backgroundColor: colors.background.tertiary,
    position: 'relative',
  },
  imagePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholderText: {
    fontSize: fontSizes.md,
    color: colors.text.tertiary,
    marginTop: spacing[2],
  },
  imageOverlay: {
    position: 'absolute',
    top: spacing[4],
    left: spacing[4],
  },
  content: {
    padding: spacing[4],
  },
  titleSection: {
    marginBottom: spacing[4],
  },
  badgeRow: {
    flexDirection: 'row',
    gap: spacing[2],
    marginBottom: spacing[3],
  },
  title: {
    fontSize: fontSizes.xl,
    fontWeight: fontWeights.bold as any,
    color: colors.text.primary,
    lineHeight: 28,
    marginBottom: spacing[2],
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  address: {
    fontSize: fontSizes.md,
    color: colors.text.secondary,
    marginLeft: spacing[1],
    flex: 1,
    lineHeight: 20,
  },
  priceCard: {
    backgroundColor: colors.surface.primary,
    borderRadius: borderRadius.xl,
    padding: spacing[5],
    marginBottom: spacing[4],
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    ...shadows.md,
  },
  priceLabel: {
    fontSize: fontSizes.sm,
    color: colors.text.tertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing[1],
  },
  priceFullText: {
    fontSize: fontSizes.sm,
    color: colors.text.secondary,
    marginTop: spacing[1],
  },
  emdSection: {
    alignItems: 'flex-end',
  },
  emdLabel: {
    fontSize: fontSizes.sm,
    color: colors.text.tertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing[1],
  },
  auctionCard: {
    backgroundColor: colors.surface.primary,
    borderRadius: borderRadius.xl,
    padding: spacing[5],
    marginBottom: spacing[4],
    ...shadows.md,
  },
  auctionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    marginBottom: spacing[3],
  },
  auctionTitle: {
    fontSize: fontSizes.base,
    fontWeight: fontWeights.semibold as any,
    color: colors.text.primary,
  },
  auctionDateText: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.semibold as any,
    color: colors.text.primary,
    marginBottom: spacing[1],
  },
  auctionTimeText: {
    fontSize: fontSizes.md,
    color: colors.text.secondary,
    marginBottom: spacing[3],
  },
  countdownContainer: {
    marginTop: spacing[2],
  },
  section: {
    backgroundColor: colors.surface.primary,
    borderRadius: borderRadius.xl,
    padding: spacing[5],
    marginBottom: spacing[4],
    ...shadows.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    marginBottom: spacing[4],
  },
  sectionTitle: {
    fontSize: fontSizes.base,
    fontWeight: fontWeights.semibold as any,
    color: colors.text.primary,
  },
  summaryText: {
    fontSize: fontSizes.md,
    color: colors.text.secondary,
    lineHeight: 22,
  },
  detailsGrid: {},
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  detailLabel: {
    fontSize: fontSizes.md,
    color: colors.text.tertiary,
    flex: 1,
  },
  detailValue: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.medium as any,
    color: colors.text.primary,
    flex: 1.5,
    textAlign: 'right',
  },
  scoreCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[4],
  },
  scoreCircle: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  scoreValue: {
    fontSize: fontSizes['3xl'],
    fontWeight: fontWeights.bold as any,
  },
  scoreOutOf: {
    fontSize: fontSizes.md,
    color: colors.text.tertiary,
  },
  scoreInfo: {
    flex: 1,
  },
  scoreLabel: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.semibold as any,
    marginBottom: spacing[2],
  },
  scoreBar: {
    height: 8,
    backgroundColor: colors.background.tertiary,
    borderRadius: 4,
    overflow: 'hidden',
  },
  scoreBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  completenessRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  completenessValue: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.bold as any,
    color: colors.info,
    minWidth: 48,
  },
  completenessBar: {
    flex: 1,
    height: 8,
    backgroundColor: colors.background.tertiary,
    borderRadius: 4,
    overflow: 'hidden',
  },
  completenessBarFill: {
    height: '100%',
    backgroundColor: colors.info,
    borderRadius: 4,
  },
  documentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
    gap: spacing[3],
  },
  documentInfo: {
    flex: 1,
  },
  documentName: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.medium as any,
    color: colors.text.primary,
  },
  documentMeta: {
    fontSize: fontSizes.sm,
    color: colors.text.tertiary,
    marginTop: 2,
  },
  mapPlaceholder: {
    height: 180,
    backgroundColor: colors.background.tertiary,
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapPlaceholderText: {
    fontSize: fontSizes.md,
    color: colors.text.tertiary,
    marginTop: spacing[2],
  },
  mapCoords: {
    fontSize: fontSizes.sm,
    color: colors.text.tertiary,
    marginTop: spacing[1],
  },
  sourceLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
    paddingVertical: spacing[4],
    backgroundColor: colors.primary[50],
    borderRadius: borderRadius.xl,
    marginBottom: spacing[4],
  },
  sourceLinkText: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.semibold as any,
    color: colors.primary[500],
  },
  bottomSpacer: {
    height: spacing[20],
  },
  actionBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface.primary,
    paddingHorizontal: spacing[4],
    paddingTop: spacing[3],
    paddingBottom: spacing[8],
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    gap: spacing[3],
    ...shadows.xl,
  },
  actionIconButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.background.tertiary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  enquiryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary[500],
    height: 48,
    borderRadius: borderRadius.xl,
    gap: spacing[2],
  },
  enquiryButtonText: {
    fontSize: fontSizes.base,
    fontWeight: fontWeights.semibold as any,
    color: colors.white,
  },
});
