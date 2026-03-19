import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { differenceInDays, differenceInHours, differenceInMinutes, isPast, parseISO } from 'date-fns';
import { colors } from '../theme/colors';
import { fontSizes, fontWeights } from '../theme/typography';
import { spacing, borderRadius } from '../theme/spacing';

interface CountdownTimerProps {
  targetDate: string;
  compact?: boolean;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
}

function getTimeLeft(targetDate: string): TimeLeft | null {
  const target = parseISO(targetDate);
  if (isPast(target)) return null;

  const now = new Date();
  const days = differenceInDays(target, now);
  const hours = differenceInHours(target, now) % 24;
  const minutes = differenceInMinutes(target, now) % 60;

  return { days, hours, minutes };
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({
  targetDate,
  compact = false,
}) => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(getTimeLeft(targetDate));

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(getTimeLeft(targetDate));
    }, 60000);

    return () => clearInterval(interval);
  }, [targetDate]);

  if (!timeLeft) {
    return (
      <View style={[styles.container, styles.expired]}>
        <Text style={styles.expiredText}>Auction Ended</Text>
      </View>
    );
  }

  if (compact) {
    return (
      <Text style={styles.compactText}>
        {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m
      </Text>
    );
  }

  const isUrgent = timeLeft.days === 0;

  return (
    <View style={[styles.container, isUrgent && styles.urgentContainer]}>
      <TimeBlock value={timeLeft.days} label="Days" isUrgent={isUrgent} />
      <Text style={[styles.separator, isUrgent && styles.urgentText]}>:</Text>
      <TimeBlock value={timeLeft.hours} label="Hrs" isUrgent={isUrgent} />
      <Text style={[styles.separator, isUrgent && styles.urgentText]}>:</Text>
      <TimeBlock value={timeLeft.minutes} label="Min" isUrgent={isUrgent} />
    </View>
  );
};

const TimeBlock: React.FC<{
  value: number;
  label: string;
  isUrgent: boolean;
}> = ({ value, label, isUrgent }) => (
  <View style={styles.block}>
    <Text style={[styles.value, isUrgent && styles.urgentText]}>
      {String(value).padStart(2, '0')}
    </Text>
    <Text style={[styles.label, isUrgent && styles.urgentLabel]}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary[50],
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderRadius: borderRadius.lg,
  },
  urgentContainer: {
    backgroundColor: '#fef2f2',
  },
  block: {
    alignItems: 'center',
    minWidth: 40,
  },
  value: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.bold as any,
    color: colors.primary[500],
  },
  label: {
    fontSize: fontSizes.xs,
    color: colors.text.secondary,
    marginTop: 2,
  },
  separator: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.bold as any,
    color: colors.primary[300],
    marginHorizontal: spacing[1],
  },
  expired: {
    backgroundColor: colors.status.completedBg,
  },
  expiredText: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.medium as any,
    color: colors.status.completed,
  },
  urgentText: {
    color: colors.error,
  },
  urgentLabel: {
    color: colors.error,
  },
  compactText: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.semibold as any,
    color: colors.secondary[600],
  },
});
