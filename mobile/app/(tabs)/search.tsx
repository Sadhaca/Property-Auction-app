import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../src/theme/colors';
import { fontSizes, fontWeights } from '../../src/theme/typography';
import { spacing, borderRadius } from '../../src/theme/spacing';
import { SearchBar } from '../../src/components/SearchBar';
import { FilterBar } from '../../src/components/FilterBar';
import { FilterSheet } from '../../src/components/FilterSheet';
import { PropertyCard } from '../../src/components/PropertyCard';
import { PropertyListItem } from '../../src/components/PropertyListItem';
import { EmptyState } from '../../src/components/EmptyState';
import { LoadingState } from '../../src/components/LoadingState';
import { useProperties } from '../../src/hooks/useProperties';
import { useFavorites } from '../../src/hooks/useFavorites';
import type { PropertyFilters, SortOption } from '../../src/types';

export default function SearchScreen() {
  const params = useLocalSearchParams<{
    q?: string;
    city?: string;
    bank?: string;
    status?: string;
  }>();

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilterSheet, setShowFilterSheet] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);

  const {
    properties,
    isLoading,
    isRefreshing,
    isLoadingMore,
    total,
    hasMore,
    fetchProperties,
    loadMore,
    refresh,
    filters,
    setFilters,
  } = useProperties({
    search: params.q,
    city: params.city,
    bank_name: params.bank,
    status: params.status as any,
  });

  const { isFavorite, toggleFavorite } = useFavorites();

  useEffect(() => {
    if (params.q || params.city || params.bank || params.status) {
      const newFilters: PropertyFilters = {
        search: params.q,
        city: params.city,
        bank_name: params.bank,
        status: params.status as any,
      };
      setFilters(newFilters);
      fetchProperties(newFilters);
    }
  }, [params.q, params.city, params.bank, params.status]);

  const handleSearch = (text: string) => {
    const newFilters = { ...filters, search: text || undefined };
    setFilters(newFilters);
    fetchProperties(newFilters);
  };

  const handleApplyFilters = (newFilters: PropertyFilters) => {
    setFilters(newFilters);
    fetchProperties(newFilters);
  };

  const handleResetFilters = () => {
    const empty: PropertyFilters = {};
    setFilters(empty);
    fetchProperties(empty);
  };

  const handleFilterChipPress = (key: string) => {
    // Clear specific filter
    const newFilters = { ...filters };
    switch (key) {
      case 'state':
        delete newFilters.state;
        break;
      case 'city':
        delete newFilters.city;
        break;
      case 'bank_name':
        delete newFilters.bank_name;
        break;
      case 'property_type':
        delete newFilters.property_type;
        break;
      case 'price':
        delete newFilters.min_price;
        delete newFilters.max_price;
        break;
      case 'date':
        delete newFilters.auction_date_from;
        delete newFilters.auction_date_to;
        break;
    }
    setFilters(newFilters);
    fetchProperties(newFilters);
  };

  const handleSort = (sortOption: SortOption) => {
    const newFilters = { ...filters, sort_by: sortOption };
    setFilters(newFilters);
    fetchProperties(newFilters);
    setShowSortMenu(false);
  };

  const activeFilterCount = [
    filters.state,
    filters.city,
    filters.bank_name,
    filters.property_type,
    filters.min_price || filters.max_price,
    filters.auction_date_from || filters.auction_date_to,
    filters.possession_status,
    filters.status,
    filters.district,
    filters.pin_code,
    filters.source,
  ].filter(Boolean).length;

  const sortLabel =
    filters.sort_by === 'price_low'
      ? 'Price: Low'
      : filters.sort_by === 'price_high'
      ? 'Price: High'
      : filters.sort_by === 'date_newest'
      ? 'Newest'
      : filters.sort_by === 'auction_date'
      ? 'Auction Date'
      : 'Relevance';

  const renderFooter = () => {
    if (!isLoadingMore) return null;
    return (
      <View style={styles.loadingMore}>
        <ActivityIndicator color={colors.primary[500]} />
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Search Bar */}
      <View style={styles.searchSection}>
        <SearchBar
          value={filters.search || ''}
          onChangeText={handleSearch}
          autoFocus={!params.q && !params.city}
        />
      </View>

      {/* Filter Bar */}
      <FilterBar
        filters={filters}
        onFilterPress={handleFilterChipPress}
        onOpenFilters={() => setShowFilterSheet(true)}
        activeFilterCount={activeFilterCount}
      />

      {/* Results Header */}
      <View style={styles.resultsHeader}>
        <Text style={styles.resultsCount}>
          {total.toLocaleString()} {total === 1 ? 'property' : 'properties'}
        </Text>
        <View style={styles.resultsActions}>
          {/* Sort */}
          <TouchableOpacity
            style={styles.sortButton}
            onPress={() => setShowSortMenu(!showSortMenu)}
          >
            <Ionicons name="swap-vertical-outline" size={16} color={colors.text.secondary} />
            <Text style={styles.sortText}>{sortLabel}</Text>
          </TouchableOpacity>

          {/* View Toggle */}
          <View style={styles.viewToggle}>
            <TouchableOpacity
              style={[styles.viewButton, viewMode === 'grid' && styles.activeViewButton]}
              onPress={() => setViewMode('grid')}
            >
              <Ionicons
                name="grid-outline"
                size={16}
                color={viewMode === 'grid' ? colors.primary[500] : colors.text.tertiary}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.viewButton, viewMode === 'list' && styles.activeViewButton]}
              onPress={() => setViewMode('list')}
            >
              <Ionicons
                name="list-outline"
                size={16}
                color={viewMode === 'list' ? colors.primary[500] : colors.text.tertiary}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Sort Dropdown */}
      {showSortMenu && (
        <View style={styles.sortMenu}>
          {[
            { value: 'relevance' as SortOption, label: 'Relevance' },
            { value: 'price_low' as SortOption, label: 'Price: Low to High' },
            { value: 'price_high' as SortOption, label: 'Price: High to Low' },
            { value: 'date_newest' as SortOption, label: 'Newest First' },
            { value: 'auction_date' as SortOption, label: 'Auction Date' },
          ].map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.sortOption,
                filters.sort_by === option.value && styles.activeSortOption,
              ]}
              onPress={() => handleSort(option.value)}
            >
              <Text
                style={[
                  styles.sortOptionText,
                  filters.sort_by === option.value && styles.activeSortOptionText,
                ]}
              >
                {option.label}
              </Text>
              {filters.sort_by === option.value && (
                <Ionicons name="checkmark" size={16} color={colors.primary[500]} />
              )}
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Property List */}
      {isLoading ? (
        <LoadingState count={4} variant={viewMode === 'list' ? 'list' : 'card'} />
      ) : properties.length === 0 ? (
        <EmptyState
          icon="search-outline"
          title="No Properties Found"
          message="Try adjusting your filters or search terms to find properties."
          actionLabel="Reset Filters"
          onAction={handleResetFilters}
        />
      ) : (
        <FlatList
          data={properties}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) =>
            viewMode === 'grid' ? (
              <PropertyCard
                property={item}
                isFavorite={isFavorite(item.id)}
                onToggleFavorite={toggleFavorite}
              />
            ) : (
              <PropertyListItem
                property={item}
                isFavorite={isFavorite(item.id)}
                onToggleFavorite={toggleFavorite}
              />
            )
          }
          contentContainerStyle={styles.listContent}
          onEndReached={loadMore}
          onEndReachedThreshold={0.3}
          ListFooterComponent={renderFooter}
          refreshing={isRefreshing}
          onRefresh={refresh}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Filter Sheet */}
      <FilterSheet
        visible={showFilterSheet}
        onClose={() => setShowFilterSheet(false)}
        filters={filters}
        onApply={handleApplyFilters}
        onReset={handleResetFilters}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  searchSection: {
    paddingHorizontal: spacing[4],
    paddingTop: spacing[2],
    paddingBottom: spacing[2],
    backgroundColor: colors.background.primary,
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    backgroundColor: colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  resultsCount: {
    fontSize: fontSizes.md,
    color: colors.text.secondary,
    fontWeight: fontWeights.medium as any,
  },
  resultsActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },
  sortText: {
    fontSize: fontSizes.sm,
    color: colors.text.secondary,
    fontWeight: fontWeights.medium as any,
  },
  viewToggle: {
    flexDirection: 'row',
    backgroundColor: colors.background.tertiary,
    borderRadius: borderRadius.md,
    padding: 2,
  },
  viewButton: {
    padding: spacing[1.5],
    borderRadius: borderRadius.sm,
  },
  activeViewButton: {
    backgroundColor: colors.surface.primary,
  },
  sortMenu: {
    position: 'absolute',
    top: 170,
    right: spacing[4],
    backgroundColor: colors.surface.primary,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing[2],
    zIndex: 100,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    minWidth: 200,
  },
  sortOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
  },
  activeSortOption: {
    backgroundColor: colors.primary[50],
  },
  sortOptionText: {
    fontSize: fontSizes.md,
    color: colors.text.primary,
  },
  activeSortOptionText: {
    color: colors.primary[500],
    fontWeight: fontWeights.semibold as any,
  },
  listContent: {
    padding: spacing[4],
  },
  loadingMore: {
    paddingVertical: spacing[6],
    alignItems: 'center',
  },
});
