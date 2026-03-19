import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { format, parseISO } from 'date-fns';
import { colors } from '../../src/theme/colors';
import { fontSizes, fontWeights } from '../../src/theme/typography';
import { spacing, borderRadius, shadows } from '../../src/theme/spacing';
import { EmptyState } from '../../src/components/EmptyState';
import { LoadingState } from '../../src/components/LoadingState';
import { Badge } from '../../src/components/Badge';
import { useSavedSearches } from '../../src/hooks/useSavedSearches';
import type { SavedSearch } from '../../src/types';

export default function AlertsScreen() {
  const {
    savedSearches,
    isLoading,
    fetchSavedSearches,
    deleteSearch,
    toggleAlert,
    updateAlertFrequency,
  } = useSavedSearches();

  const handleDelete = (id: string, name: string) => {
    Alert.alert(
      'Delete Saved Search',
      `Are you sure you want to delete "${name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteSearch(id),
        },
      ]
    );
  };

  const handleFrequencyChange = (id: string) => {
    Alert.alert('Alert Frequency', 'Choose notification frequency', [
      {
        text: 'Instant',
        onPress: () => updateAlertFrequency(id, 'instant'),
      },
      {
        text: 'Daily',
        onPress: () => updateAlertFrequency(id, 'daily'),
      },
      {
        text: 'Weekly',
        onPress: () => updateAlertFrequency(id, 'weekly'),
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const renderItem = ({ item }: { item: SavedSearch }) => {
    const filterSummary: string[] = [];
    if (item.filters.state) filterSummary.push(item.filters.state);
    if (item.filters.city) filterSummary.push(item.filters.city);
    if (item.filters.bank_name) filterSummary.push(item.filters.bank_name);
    if (item.filters.property_type) filterSummary.push(item.filters.property_type);
    if (item.filters.search) filterSummary.push(`"${item.filters.search}"`);

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.cardTitleRow}>
            <Ionicons name="search" size={18} color={colors.primary[500]} />
            <Text style={styles.cardTitle} numberOfLines={1}>
              {item.name}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => handleDelete(item.id, item.name)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="trash-outline" size={18} color={colors.text.tertiary} />
          </TouchableOpacity>
        </View>

        {/* Filter tags */}
        {filterSummary.length > 0 && (
          <View style={styles.tags}>
            {filterSummary.map((tag, index) => (
              <Badge
                key={index}
                label={tag}
                size="sm"
                color={colors.text.secondary}
                backgroundColor={colors.background.tertiary}
              />
            ))}
          </View>
        )}

        {/* Results count */}
        <Text style={styles.resultsText}>
          {item.results_count} matching properties
        </Text>

        {/* Alert Settings */}
        <View style={styles.alertRow}>
          <View style={styles.alertLeft}>
            <Ionicons
              name="notifications-outline"
              size={16}
              color={item.alert_enabled ? colors.secondary[500] : colors.text.tertiary}
            />
            <Text
              style={[
                styles.alertText,
                !item.alert_enabled && styles.alertDisabled,
              ]}
            >
              Alerts {item.alert_enabled ? 'On' : 'Off'}
            </Text>
            {item.alert_enabled && (
              <TouchableOpacity
                style={styles.frequencyBadge}
                onPress={() => handleFrequencyChange(item.id)}
              >
                <Text style={styles.frequencyText}>
                  {item.alert_frequency}
                </Text>
                <Ionicons
                  name="chevron-down"
                  size={12}
                  color={colors.primary[500]}
                />
              </TouchableOpacity>
            )}
          </View>
          <Switch
            value={item.alert_enabled}
            onValueChange={(enabled) => toggleAlert(item.id, enabled)}
            trackColor={{
              false: colors.border.medium,
              true: colors.secondary[300],
            }}
            thumbColor={
              item.alert_enabled ? colors.secondary[500] : colors.text.tertiary
            }
          />
        </View>

        {/* Last notified */}
        {item.last_notified_at && (
          <Text style={styles.lastNotified}>
            Last notified: {format(parseISO(item.last_notified_at), 'dd MMM yyyy, hh:mm a')}
          </Text>
        )}
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <LoadingState count={3} variant="list" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {savedSearches.length === 0 ? (
        <EmptyState
          icon="notifications-outline"
          title="No Saved Searches"
          message="Save your searches to get notified when new matching properties are listed."
          actionLabel="Search Properties"
        />
      ) : (
        <FlatList
          data={savedSearches}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshing={isLoading}
          onRefresh={fetchSavedSearches}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  listContent: {
    padding: spacing[4],
  },
  card: {
    backgroundColor: colors.surface.primary,
    borderRadius: borderRadius.xl,
    padding: spacing[4],
    marginBottom: spacing[3],
    ...shadows.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[3],
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: spacing[2],
  },
  cardTitle: {
    fontSize: fontSizes.base,
    fontWeight: fontWeights.semibold as any,
    color: colors.text.primary,
    flex: 1,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[1.5],
    marginBottom: spacing[3],
  },
  resultsText: {
    fontSize: fontSizes.sm,
    color: colors.secondary[600],
    fontWeight: fontWeights.medium as any,
    marginBottom: spacing[3],
  },
  alertRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing[3],
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  alertLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  alertText: {
    fontSize: fontSizes.sm,
    color: colors.text.secondary,
    fontWeight: fontWeights.medium as any,
  },
  alertDisabled: {
    color: colors.text.tertiary,
  },
  frequencyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary[50],
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[0.5],
    borderRadius: borderRadius.full,
    gap: 4,
  },
  frequencyText: {
    fontSize: fontSizes.xs,
    color: colors.primary[500],
    fontWeight: fontWeights.medium as any,
    textTransform: 'capitalize',
  },
  lastNotified: {
    fontSize: fontSizes.xs,
    color: colors.text.tertiary,
    marginTop: spacing[2],
  },
});
