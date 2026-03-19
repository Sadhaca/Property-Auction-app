import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { colors } from '../theme/colors';
import { fontSizes, fontWeights } from '../theme/typography';
import { borderRadius, spacing } from '../theme/spacing';

interface BadgeProps {
  label: string;
  color?: string;
  backgroundColor?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'filled' | 'outline';
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  color,
  backgroundColor,
  size = 'md',
  variant = 'filled',
}) => {
  const sizeStyles: Record<string, { container: ViewStyle; text: TextStyle }> = {
    sm: {
      container: { paddingHorizontal: spacing[1.5], paddingVertical: spacing[0.5] },
      text: { fontSize: fontSizes.xs },
    },
    md: {
      container: { paddingHorizontal: spacing[2], paddingVertical: spacing[1] },
      text: { fontSize: fontSizes.sm },
    },
    lg: {
      container: { paddingHorizontal: spacing[3], paddingVertical: spacing[1.5] },
      text: { fontSize: fontSizes.md },
    },
  };

  const bgColor = backgroundColor || colors.primary[100];
  const textColor = color || colors.primary[500];

  return (
    <View
      style={[
        styles.container,
        sizeStyles[size].container,
        variant === 'filled'
          ? { backgroundColor: bgColor }
          : { borderWidth: 1, borderColor: textColor },
      ]}
    >
      <Text
        style={[styles.text, sizeStyles[size].text, { color: textColor }]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: borderRadius.full,
    alignSelf: 'flex-start',
  },
  text: {
    fontWeight: fontWeights.semibold as TextStyle['fontWeight'],
  },
});
