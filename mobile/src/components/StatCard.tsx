import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { fontSizes, fontWeights } from '../theme/typography';
import { spacing, borderRadius, shadows } from '../theme/spacing';

interface StatCardProps {
  title: string;
  subtitle?: string;
  value: string | number;
  icon?: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  onPress?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  subtitle,
  value,
  icon = 'business-outline',
  iconColor = colors.primary[500],
  onPress,
}) => {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={!onPress}
    >
      <View style={[styles.iconContainer, { backgroundColor: iconColor + '15' }]}>
        <Ionicons name={icon} size={20} color={iconColor} />
      </View>
      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>
      {subtitle && (
        <Text style={styles.subtitle} numberOfLines={1}>
          {subtitle}
        </Text>
      )}
      <Text style={styles.value}>{value} properties</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface.primary,
    borderRadius: borderRadius.xl,
    padding: spacing[4],
    width: 140,
    marginRight: spacing[3],
    ...shadows.md,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing[2],
  },
  title: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.semibold as any,
    color: colors.text.primary,
    marginBottom: spacing[0.5],
  },
  subtitle: {
    fontSize: fontSizes.xs,
    color: colors.text.tertiary,
    marginBottom: spacing[1],
  },
  value: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.medium as any,
    color: colors.secondary[600],
    marginTop: spacing[1],
  },
});
