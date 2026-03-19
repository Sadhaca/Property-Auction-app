import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { fontSizes } from '../theme/typography';
import { spacing, borderRadius, shadows } from '../theme/spacing';

interface SearchBarProps {
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  onSubmit?: (text: string) => void;
  debounceMs?: number;
  style?: ViewStyle;
  autoFocus?: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = 'Search properties, cities, banks...',
  value: externalValue,
  onChangeText,
  onSubmit,
  debounceMs = 400,
  style,
  autoFocus = false,
}) => {
  const [internalValue, setInternalValue] = useState('');
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  const value = externalValue !== undefined ? externalValue : internalValue;

  const handleChangeText = useCallback(
    (text: string) => {
      if (externalValue === undefined) {
        setInternalValue(text);
      }

      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }

      debounceTimer.current = setTimeout(() => {
        onChangeText?.(text);
      }, debounceMs);
    },
    [onChangeText, debounceMs, externalValue]
  );

  const handleClear = () => {
    if (externalValue === undefined) {
      setInternalValue('');
    }
    onChangeText?.('');
  };

  return (
    <View style={[styles.container, style]}>
      <Ionicons
        name="search-outline"
        size={20}
        color={colors.text.tertiary}
        style={styles.icon}
      />
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor={colors.text.tertiary}
        value={value}
        onChangeText={handleChangeText}
        onSubmitEditing={() => onSubmit?.(value)}
        returnKeyType="search"
        autoFocus={autoFocus}
        autoCorrect={false}
      />
      {value.length > 0 && (
        <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
          <Ionicons name="close-circle" size={18} color={colors.text.tertiary} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.tertiary,
    borderRadius: borderRadius.xl,
    paddingHorizontal: spacing[4],
    height: 48,
    ...shadows.sm,
  },
  icon: {
    marginRight: spacing[2],
  },
  input: {
    flex: 1,
    fontSize: fontSizes.base,
    color: colors.text.primary,
    height: '100%',
  },
  clearButton: {
    marginLeft: spacing[2],
    padding: spacing[1],
  },
});
