import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { colors } from '../theme/colors';
import { spacing, borderRadius, shadows } from '../theme/spacing';

interface LoadingStateProps {
  count?: number;
  variant?: 'card' | 'list';
}

const SkeletonBlock: React.FC<{
  width: number | string;
  height: number;
  borderRadiusVal?: number;
  style?: any;
}> = ({ width, height, borderRadiusVal = borderRadius.md, style }) => {
  const animatedValue = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [animatedValue]);

  return (
    <Animated.View
      style={[
        {
          width: width as any,
          height,
          borderRadius: borderRadiusVal,
          backgroundColor: colors.border.light,
          opacity: animatedValue,
        },
        style,
      ]}
    />
  );
};

const SkeletonCard: React.FC = () => (
  <View style={styles.card}>
    <SkeletonBlock width="100%" height={160} borderRadiusVal={0} />
    <View style={styles.cardContent}>
      <SkeletonBlock width="70%" height={18} />
      <SkeletonBlock width="50%" height={14} style={{ marginTop: spacing[2] }} />
      <View style={styles.row}>
        <SkeletonBlock width="40%" height={24} style={{ marginTop: spacing[3] }} />
        <SkeletonBlock width={80} height={24} style={{ marginTop: spacing[3] }} />
      </View>
      <View style={styles.row}>
        <SkeletonBlock width={60} height={20} style={{ marginTop: spacing[2] }} />
        <SkeletonBlock width={60} height={20} style={{ marginTop: spacing[2] }} />
      </View>
    </View>
  </View>
);

const SkeletonListItem: React.FC = () => (
  <View style={styles.listItem}>
    <SkeletonBlock width={80} height={80} borderRadiusVal={borderRadius.lg} />
    <View style={styles.listContent}>
      <SkeletonBlock width="80%" height={16} />
      <SkeletonBlock width="60%" height={12} style={{ marginTop: spacing[2] }} />
      <SkeletonBlock width="40%" height={18} style={{ marginTop: spacing[2] }} />
    </View>
  </View>
);

export const LoadingState: React.FC<LoadingStateProps> = ({
  count = 3,
  variant = 'card',
}) => {
  return (
    <View style={styles.container}>
      {Array.from({ length: count }).map((_, index) =>
        variant === 'card' ? (
          <SkeletonCard key={index} />
        ) : (
          <SkeletonListItem key={index} />
        )
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: spacing[4],
  },
  card: {
    backgroundColor: colors.surface.primary,
    borderRadius: borderRadius.xl,
    marginBottom: spacing[4],
    overflow: 'hidden',
    ...shadows.md,
  },
  cardContent: {
    padding: spacing[4],
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  listItem: {
    flexDirection: 'row',
    backgroundColor: colors.surface.primary,
    borderRadius: borderRadius.xl,
    padding: spacing[3],
    marginBottom: spacing[3],
    ...shadows.sm,
  },
  listContent: {
    flex: 1,
    marginLeft: spacing[3],
    justifyContent: 'center',
  },
});
