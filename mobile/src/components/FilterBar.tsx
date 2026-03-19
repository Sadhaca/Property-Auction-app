import React from 'react';
import { ScrollView, TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { fontSizes, fontWeights } from '../theme/typography';
import { spacing, borderRadius } from '../theme/spacing';
import type { PropertyFilters } from '../types';

interface FilterChip {
  key: string;
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
  isActive: boolean;
}

interface FilterBarProps {
  filters: PropertyFilters;
  onFilterPress: (filterKey: string) => void;
  onOpenFilters: () => void;
  activeFilterCount: number;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onFilterPress,
  onOpenFilters,
  activeFilterCount,
}) => {
  const chips: FilterChip[] = [
    {
      key: 'state',
      label: filters.state || 'State',
      icon: 'map-outline',
      isActive: !!filters.state,
    },
    {
      key: 'city',
      label: filters.city || 'City',
      icon: 'business-outline',
      isActive: !!filters.city,
    },
    {
      key: 'bank_name',
      label: filters.bank_name || 'Bank',
      icon: 'wallet-outline',
      isActive: !!filters.bank_name,
    },
    {
      key: 'property_type',
      label: filters.property_type
        ? filters.property_type.charAt(0).toUpperCase() + filters.property_type.slice(1)
        : 'Type',
      icon: 'home-outline',
      isActive: !!filters.property_type,
    },
    {
      key: 'price',
      label:
        filters.min_price || filters.max_price
          ? 'Price Set'
          : 'Price Range',
      icon: 'cash-outline',
      isActive: !!(filters.min_price || filters.max_price),
    },
    {
      key: 'date',
      label:
        filters.auction_date_from || filters.auction_date_to
          ? 'Date Set'
          : 'Date',
      icon: 'calendar-outline',
      isActive: !!(filters.auction_date_from || filters.auction_date_to),
    },
  ];

  return (
    <View style={styles.wrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.container}
      >
        {/* All Filters Button */}
        <TouchableOpacity
          style={[styles.filterButton, activeFilterCount > 0 && styles.activeFilterButton]}
          onPress={onOpenFilters}
        >
          <Ionicons
            name="options-outline"
            size={16}
            color={activeFilterCount > 0 ? colors.white : colors.primary[500]}
          />
          <Text
            style={[
              styles.filterButtonText,
              activeFilterCount > 0 && styles.activeFilterButtonText,
            ]}
          >
            Filters
          </Text>
          {activeFilterCount > 0 && (
            <View style={styles.countBadge}>
              <Text style={styles.countText}>{activeFilterCount}</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Filter Chips */}
        {chips.map((chip) => (
          <TouchableOpacity
            key={chip.key}
            style={[styles.chip, chip.isActive && styles.activeChip]}
            onPress={() => onFilterPress(chip.key)}
          >
            {chip.icon && (
              <Ionicons
                name={chip.icon}
                size={14}
                color={chip.isActive ? colors.primary[500] : colors.text.secondary}
                style={styles.chipIcon}
              />
            )}
            <Text
              style={[styles.chipText, chip.isActive && styles.activeChipText]}
              numberOfLines={1}
            >
              {chip.label}
            </Text>
            {chip.isActive && (
              <Ionicons
                name="close-circle"
                size={14}
                color={colors.primary[400]}
                style={styles.chipClose}
              />
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: colors.background.primary,
    paddingVertical: spacing[2],
  },
  container: {
    paddingHorizontal: spacing[4],
    gap: spacing[2],
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary[50],
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.primary[200],
    gap: spacing[1],
  },
  activeFilterButton: {
    backgroundColor: colors.primary[500],
    borderColor: colors.primary[500],
  },
  filterButtonText: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.semibold as any,
    color: colors.primary[500],
  },
  activeFilterButtonText: {
    color: colors.white,
  },
  countBadge: {
    backgroundColor: colors.secondary[500],
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  countText: {
    fontSize: 10,
    fontWeight: fontWeights.bold as any,
    color: colors.white,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  activeChip: {
    backgroundColor: colors.primary[50],
    borderColor: colors.primary[300],
  },
  chipIcon: {
    marginRight: spacing[1],
  },
  chipText: {
    fontSize: fontSizes.sm,
    color: colors.text.secondary,
    fontWeight: fontWeights.medium as any,
  },
  activeChipText: {
    color: colors.primary[500],
    fontWeight: fontWeights.semibold as any,
  },
  chipClose: {
    marginLeft: spacing[1],
  },
});
