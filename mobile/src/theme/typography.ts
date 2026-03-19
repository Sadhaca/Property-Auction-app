import { TextStyle } from 'react-native';

export const fontSizes = {
  xs: 10,
  sm: 12,
  md: 14,
  base: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 28,
  '4xl': 32,
  '5xl': 40,
} as const;

export const fontWeights: Record<string, TextStyle['fontWeight']> = {
  light: '300',
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  extrabold: '800',
};

export const lineHeights = {
  tight: 1.2,
  normal: 1.5,
  relaxed: 1.75,
};

export const typography = {
  h1: {
    fontSize: fontSizes['4xl'],
    fontWeight: fontWeights.bold,
    lineHeight: fontSizes['4xl'] * lineHeights.tight,
  } as TextStyle,
  h2: {
    fontSize: fontSizes['3xl'],
    fontWeight: fontWeights.bold,
    lineHeight: fontSizes['3xl'] * lineHeights.tight,
  } as TextStyle,
  h3: {
    fontSize: fontSizes['2xl'],
    fontWeight: fontWeights.semibold,
    lineHeight: fontSizes['2xl'] * lineHeights.tight,
  } as TextStyle,
  h4: {
    fontSize: fontSizes.xl,
    fontWeight: fontWeights.semibold,
    lineHeight: fontSizes.xl * lineHeights.tight,
  } as TextStyle,
  h5: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.semibold,
    lineHeight: fontSizes.lg * lineHeights.normal,
  } as TextStyle,
  body: {
    fontSize: fontSizes.base,
    fontWeight: fontWeights.regular,
    lineHeight: fontSizes.base * lineHeights.normal,
  } as TextStyle,
  bodySmall: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.regular,
    lineHeight: fontSizes.md * lineHeights.normal,
  } as TextStyle,
  caption: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.regular,
    lineHeight: fontSizes.sm * lineHeights.normal,
  } as TextStyle,
  overline: {
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.medium,
    lineHeight: fontSizes.xs * lineHeights.normal,
    textTransform: 'uppercase' as const,
    letterSpacing: 1,
  } as TextStyle,
  button: {
    fontSize: fontSizes.base,
    fontWeight: fontWeights.semibold,
    lineHeight: fontSizes.base * lineHeights.normal,
  } as TextStyle,
  label: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.medium,
    lineHeight: fontSizes.md * lineHeights.normal,
  } as TextStyle,
};

export type Typography = typeof typography;
