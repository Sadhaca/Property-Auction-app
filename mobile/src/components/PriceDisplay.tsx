import React from 'react';
import { Text, TextStyle, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { fontSizes, fontWeights } from '../theme/typography';

interface PriceDisplayProps {
  amount: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showFull?: boolean;
  style?: TextStyle;
}

export function formatINR(amount: number, showFull: boolean = false): string {
  if (showFull) {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  }

  if (amount >= 10000000) {
    const crores = amount / 10000000;
    const formatted = crores % 1 === 0 ? crores.toFixed(0) : crores.toFixed(2);
    return `\u20B9${formatted} Cr`;
  }

  if (amount >= 100000) {
    const lakhs = amount / 100000;
    const formatted = lakhs % 1 === 0 ? lakhs.toFixed(0) : lakhs.toFixed(2);
    return `\u20B9${formatted} L`;
  }

  if (amount >= 1000) {
    const thousands = amount / 1000;
    const formatted = thousands % 1 === 0 ? thousands.toFixed(0) : thousands.toFixed(1);
    return `\u20B9${formatted}K`;
  }

  return `\u20B9${amount.toLocaleString('en-IN')}`;
}

export const PriceDisplay: React.FC<PriceDisplayProps> = ({
  amount,
  size = 'md',
  showFull = false,
  style,
}) => {
  const sizeStyles: Record<string, TextStyle> = {
    sm: { fontSize: fontSizes.sm },
    md: { fontSize: fontSizes.base },
    lg: { fontSize: fontSizes.xl },
    xl: { fontSize: fontSizes['2xl'] },
  };

  return (
    <Text style={[styles.price, sizeStyles[size], style]} numberOfLines={1}>
      {formatINR(amount, showFull)}
    </Text>
  );
};

const styles = StyleSheet.create({
  price: {
    fontWeight: fontWeights.bold as TextStyle['fontWeight'],
    color: colors.primary[500],
  },
});
