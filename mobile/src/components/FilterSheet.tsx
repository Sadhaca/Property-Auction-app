import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { fontSizes, fontWeights } from '../theme/typography';
import { spacing, borderRadius } from '../theme/spacing';
import type { PropertyFilters, PropertyType, PropertyStatus, SortOption } from '../types';

interface FilterSheetProps {
  visible: boolean;
  onClose: () => void;
  filters: PropertyFilters;
  onApply: (filters: PropertyFilters) => void;
  onReset: () => void;
}

const STATES = [
  'Maharashtra', 'Delhi', 'Karnataka', 'Tamil Nadu', 'Gujarat',
  'Rajasthan', 'Uttar Pradesh', 'West Bengal', 'Telangana', 'Kerala',
  'Madhya Pradesh', 'Andhra Pradesh', 'Haryana', 'Punjab', 'Bihar',
];

const PROPERTY_TYPES: { value: PropertyType; label: string }[] = [
  { value: 'residential', label: 'Residential' },
  { value: 'commercial', label: 'Commercial' },
  { value: 'industrial', label: 'Industrial' },
  { value: 'agricultural', label: 'Agricultural' },
  { value: 'plot', label: 'Plot' },
  { value: 'mixed', label: 'Mixed Use' },
];

const STATUS_OPTIONS: { value: PropertyStatus; label: string }[] = [
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'live', label: 'Live' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'postponed', label: 'Postponed' },
];

const POSSESSION_OPTIONS = [
  { value: 'physical', label: 'Physical' },
  { value: 'symbolic', label: 'Symbolic' },
  { value: 'unknown', label: 'Unknown' },
];

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'price_low', label: 'Price: Low to High' },
  { value: 'price_high', label: 'Price: High to Low' },
  { value: 'date_newest', label: 'Newest First' },
  { value: 'date_oldest', label: 'Oldest First' },
  { value: 'auction_date', label: 'Auction Date' },
];

const BANKS = [
  'State Bank of India', 'Punjab National Bank', 'Bank of Baroda',
  'Union Bank of India', 'Canara Bank', 'Indian Bank', 'Bank of India',
  'HDFC Bank', 'ICICI Bank', 'Axis Bank', 'Kotak Mahindra Bank',
];

export const FilterSheet: React.FC<FilterSheetProps> = ({
  visible,
  onClose,
  filters,
  onApply,
  onReset,
}) => {
  const [draft, setDraft] = useState<PropertyFilters>({ ...filters });

  const updateDraft = (key: keyof PropertyFilters, value: any) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
  };

  const handleApply = () => {
    onApply(draft);
    onClose();
  };

  const handleReset = () => {
    setDraft({});
    onReset();
  };

  const SelectableChips: React.FC<{
    options: { value: string; label: string }[];
    selected: string | undefined;
    onSelect: (value: string | undefined) => void;
  }> = ({ options, selected, onSelect }) => (
    <View style={styles.chipsContainer}>
      {options.map((option) => (
        <TouchableOpacity
          key={option.value}
          style={[styles.selectChip, selected === option.value && styles.selectedChip]}
          onPress={() =>
            onSelect(selected === option.value ? undefined : option.value)
          }
        >
          <Text
            style={[
              styles.selectChipText,
              selected === option.value && styles.selectedChipText,
            ]}
          >
            {option.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Filters</Text>
          <TouchableOpacity onPress={handleReset}>
            <Text style={styles.resetText}>Reset</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* State */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>State</Text>
            <SelectableChips
              options={STATES.map((s) => ({ value: s, label: s }))}
              selected={draft.state}
              onSelect={(v) => updateDraft('state', v)}
            />
          </View>

          {/* City */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>City</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Enter city name"
              placeholderTextColor={colors.text.tertiary}
              value={draft.city || ''}
              onChangeText={(v) => updateDraft('city', v || undefined)}
            />
          </View>

          {/* District */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>District</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Enter district"
              placeholderTextColor={colors.text.tertiary}
              value={draft.district || ''}
              onChangeText={(v) => updateDraft('district', v || undefined)}
            />
          </View>

          {/* Pin Code */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Pin Code</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Enter pin code"
              placeholderTextColor={colors.text.tertiary}
              value={draft.pin_code || ''}
              onChangeText={(v) => updateDraft('pin_code', v || undefined)}
              keyboardType="numeric"
              maxLength={6}
            />
          </View>

          {/* Bank */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Bank</Text>
            <SelectableChips
              options={BANKS.map((b) => ({ value: b, label: b }))}
              selected={draft.bank_name}
              onSelect={(v) => updateDraft('bank_name', v)}
            />
          </View>

          {/* Property Type */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Property Type</Text>
            <SelectableChips
              options={PROPERTY_TYPES}
              selected={draft.property_type}
              onSelect={(v) => updateDraft('property_type', v)}
            />
          </View>

          {/* Property Subtype */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Property Subtype</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g., Flat, Villa, Office Space"
              placeholderTextColor={colors.text.tertiary}
              value={draft.property_subtype || ''}
              onChangeText={(v) => updateDraft('property_subtype', v || undefined)}
            />
          </View>

          {/* Price Range */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Price Range</Text>
            <View style={styles.rangeRow}>
              <TextInput
                style={[styles.textInput, styles.rangeInput]}
                placeholder="Min (in Lakhs)"
                placeholderTextColor={colors.text.tertiary}
                value={draft.min_price ? String(draft.min_price / 100000) : ''}
                onChangeText={(v) =>
                  updateDraft('min_price', v ? Number(v) * 100000 : undefined)
                }
                keyboardType="numeric"
              />
              <Text style={styles.rangeSeparator}>to</Text>
              <TextInput
                style={[styles.textInput, styles.rangeInput]}
                placeholder="Max (in Lakhs)"
                placeholderTextColor={colors.text.tertiary}
                value={draft.max_price ? String(draft.max_price / 100000) : ''}
                onChangeText={(v) =>
                  updateDraft('max_price', v ? Number(v) * 100000 : undefined)
                }
                keyboardType="numeric"
              />
            </View>
          </View>

          {/* EMD Range */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>EMD Amount Range</Text>
            <View style={styles.rangeRow}>
              <TextInput
                style={[styles.textInput, styles.rangeInput]}
                placeholder="Min EMD"
                placeholderTextColor={colors.text.tertiary}
                value={draft.min_emd ? String(draft.min_emd) : ''}
                onChangeText={(v) =>
                  updateDraft('min_emd', v ? Number(v) : undefined)
                }
                keyboardType="numeric"
              />
              <Text style={styles.rangeSeparator}>to</Text>
              <TextInput
                style={[styles.textInput, styles.rangeInput]}
                placeholder="Max EMD"
                placeholderTextColor={colors.text.tertiary}
                value={draft.max_emd ? String(draft.max_emd) : ''}
                onChangeText={(v) =>
                  updateDraft('max_emd', v ? Number(v) : undefined)
                }
                keyboardType="numeric"
              />
            </View>
          </View>

          {/* Area Range */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Area (sq.ft)</Text>
            <View style={styles.rangeRow}>
              <TextInput
                style={[styles.textInput, styles.rangeInput]}
                placeholder="Min Area"
                placeholderTextColor={colors.text.tertiary}
                value={draft.min_area ? String(draft.min_area) : ''}
                onChangeText={(v) =>
                  updateDraft('min_area', v ? Number(v) : undefined)
                }
                keyboardType="numeric"
              />
              <Text style={styles.rangeSeparator}>to</Text>
              <TextInput
                style={[styles.textInput, styles.rangeInput]}
                placeholder="Max Area"
                placeholderTextColor={colors.text.tertiary}
                value={draft.max_area ? String(draft.max_area) : ''}
                onChangeText={(v) =>
                  updateDraft('max_area', v ? Number(v) : undefined)
                }
                keyboardType="numeric"
              />
            </View>
          </View>

          {/* Possession Status */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Possession Status</Text>
            <SelectableChips
              options={POSSESSION_OPTIONS}
              selected={draft.possession_status}
              onSelect={(v) => updateDraft('possession_status', v)}
            />
          </View>

          {/* Status */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Auction Status</Text>
            <SelectableChips
              options={STATUS_OPTIONS}
              selected={draft.status}
              onSelect={(v) => updateDraft('status', v)}
            />
          </View>

          {/* Source */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Source</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g., IBAPI, Bank Website"
              placeholderTextColor={colors.text.tertiary}
              value={draft.source || ''}
              onChangeText={(v) => updateDraft('source', v || undefined)}
            />
          </View>

          {/* Sort By */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Sort By</Text>
            <SelectableChips
              options={SORT_OPTIONS}
              selected={draft.sort_by}
              onSelect={(v) => updateDraft('sort_by', v as SortOption | undefined)}
            />
          </View>
        </ScrollView>

        {/* Apply Button */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
            <Text style={styles.resetButtonText}>Reset All</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
            <Text style={styles.applyButtonText}>Apply Filters</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  headerTitle: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.semibold as any,
    color: colors.text.primary,
  },
  resetText: {
    fontSize: fontSizes.md,
    color: colors.secondary[600],
    fontWeight: fontWeights.medium as any,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing[8],
  },
  section: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  sectionTitle: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.semibold as any,
    color: colors.text.primary,
    marginBottom: spacing[3],
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
  },
  selectChip: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderRadius: borderRadius.full,
    backgroundColor: colors.background.tertiary,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  selectedChip: {
    backgroundColor: colors.primary[50],
    borderColor: colors.primary[500],
  },
  selectChipText: {
    fontSize: fontSizes.sm,
    color: colors.text.secondary,
  },
  selectedChipText: {
    color: colors.primary[500],
    fontWeight: fontWeights.semibold as any,
  },
  textInput: {
    backgroundColor: colors.background.tertiary,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    fontSize: fontSizes.md,
    color: colors.text.primary,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  rangeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  rangeInput: {
    flex: 1,
  },
  rangeSeparator: {
    fontSize: fontSizes.sm,
    color: colors.text.tertiary,
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[4],
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    gap: spacing[3],
    paddingBottom: spacing[8],
  },
  resetButton: {
    flex: 1,
    paddingVertical: spacing[4],
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.border.medium,
    alignItems: 'center',
  },
  resetButtonText: {
    fontSize: fontSizes.base,
    fontWeight: fontWeights.semibold as any,
    color: colors.text.secondary,
  },
  applyButton: {
    flex: 2,
    paddingVertical: spacing[4],
    borderRadius: borderRadius.xl,
    backgroundColor: colors.primary[500],
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: fontSizes.base,
    fontWeight: fontWeights.semibold as any,
    color: colors.white,
  },
});
