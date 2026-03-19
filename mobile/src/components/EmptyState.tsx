import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { fontSizes, fontWeights } from '../theme/typography';
import { spacing } from '../theme/spacing';

interface EmptyStateProps {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = 'search-outline',
  title,
  message,
  actionLabel,
  onAction,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Ionicons name={icon} size={48} color={colors.text.tertiary} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      {actionLabel && onAction && (
        <TouchableOpacity style={styles.button} onPress={onAction}>
          <Text style={styles.buttonText}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing[8],
    paddingVertical: spacing[16],
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.background.tertiary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing[6],
  },
  title: {
    fontSize: fontSizes.xl,
    fontWeight: fontWeights.semibold as any,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing[2],
  },
  message: {
    fontSize: fontSizes.md,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  button: {
    marginTop: spacing[6],
    backgroundColor: colors.primary[500],
    paddingHorizontal: spacing[6],
    paddingVertical: spacing[3],
    borderRadius: 24,
  },
  buttonText: {
    fontSize: fontSizes.base,
    fontWeight: fontWeights.semibold as any,
    color: colors.white,
  },
});
