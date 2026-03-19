import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../src/theme/colors';
import { fontSizes, fontWeights } from '../../src/theme/typography';
import { spacing, borderRadius, shadows } from '../../src/theme/spacing';
import { useAuthStore } from '../../src/lib/auth';
import { Badge } from '../../src/components/Badge';

interface MenuItem {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  subtitle?: string;
  onPress: () => void;
  color?: string;
  showArrow?: boolean;
}

export default function ProfileScreen() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  const planColors: Record<string, { color: string; bg: string }> = {
    free: { color: colors.text.secondary, bg: colors.background.tertiary },
    basic: { color: colors.info, bg: '#eff6ff' },
    premium: { color: colors.warning, bg: '#fef3c7' },
    enterprise: { color: colors.secondary[600], bg: colors.secondary[50] },
  };

  const plan = user?.subscription_plan || 'free';
  const planStyle = planColors[plan] || planColors.free;

  const menuSections: { title: string; items: MenuItem[] }[] = [
    {
      title: 'Account',
      items: [
        {
          icon: 'person-outline',
          label: 'Edit Profile',
          subtitle: 'Update your personal information',
          onPress: () => {},
          showArrow: true,
        },
        {
          icon: 'diamond-outline',
          label: 'Subscription Plan',
          subtitle: `Current plan: ${plan.charAt(0).toUpperCase() + plan.slice(1)}`,
          onPress: () => {},
          showArrow: true,
        },
        {
          icon: 'card-outline',
          label: 'Payment History',
          subtitle: 'View past transactions',
          onPress: () => {},
          showArrow: true,
        },
      ],
    },
    {
      title: 'Preferences',
      items: [
        {
          icon: 'notifications-outline',
          label: 'Notification Settings',
          subtitle: 'Manage push notifications',
          onPress: () => {},
          showArrow: true,
        },
        {
          icon: 'location-outline',
          label: 'Preferred Locations',
          subtitle: 'Set your preferred cities',
          onPress: () => {},
          showArrow: true,
        },
        {
          icon: 'language-outline',
          label: 'Language',
          subtitle: 'English',
          onPress: () => {},
          showArrow: true,
        },
      ],
    },
    {
      title: 'Support',
      items: [
        {
          icon: 'help-circle-outline',
          label: 'Help & FAQ',
          onPress: () => {},
          showArrow: true,
        },
        {
          icon: 'chatbubble-ellipses-outline',
          label: 'Contact Us',
          subtitle: 'support@auctionprop.in',
          onPress: () => {},
          showArrow: true,
        },
        {
          icon: 'star-outline',
          label: 'Rate the App',
          onPress: () => {},
          showArrow: true,
        },
        {
          icon: 'document-text-outline',
          label: 'Terms & Privacy Policy',
          onPress: () => {},
          showArrow: true,
        },
      ],
    },
  ];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Profile Card */}
      <View style={styles.profileCard}>
        {isAuthenticated && user ? (
          <>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user.full_name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .toUpperCase()
                  .slice(0, 2)}
              </Text>
            </View>
            <Text style={styles.userName}>{user.full_name}</Text>
            <Text style={styles.userEmail}>{user.email}</Text>
            {user.phone && <Text style={styles.userPhone}>{user.phone}</Text>}
            <Badge
              label={plan.toUpperCase()}
              color={planStyle.color}
              backgroundColor={planStyle.bg}
              size="md"
            />
          </>
        ) : (
          <>
            <View style={styles.avatar}>
              <Ionicons name="person-outline" size={32} color={colors.white} />
            </View>
            <Text style={styles.userName}>Guest User</Text>
            <Text style={styles.userEmail}>
              Sign in to access all features
            </Text>
            <TouchableOpacity
              style={styles.signInButton}
              onPress={() => router.push('/(auth)/login')}
            >
              <Text style={styles.signInButtonText}>Sign In</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* Menu Sections */}
      {menuSections.map((section) => (
        <View key={section.title} style={styles.menuSection}>
          <Text style={styles.menuSectionTitle}>{section.title}</Text>
          <View style={styles.menuCard}>
            {section.items.map((item, index) => (
              <TouchableOpacity
                key={item.label}
                style={[
                  styles.menuItem,
                  index < section.items.length - 1 && styles.menuItemBorder,
                ]}
                onPress={item.onPress}
              >
                <View
                  style={[
                    styles.menuIconContainer,
                    { backgroundColor: (item.color || colors.primary[500]) + '10' },
                  ]}
                >
                  <Ionicons
                    name={item.icon}
                    size={20}
                    color={item.color || colors.primary[500]}
                  />
                </View>
                <View style={styles.menuContent}>
                  <Text style={styles.menuLabel}>{item.label}</Text>
                  {item.subtitle && (
                    <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
                  )}
                </View>
                {item.showArrow && (
                  <Ionicons
                    name="chevron-forward"
                    size={18}
                    color={colors.text.tertiary}
                  />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ))}

      {/* Logout */}
      {isAuthenticated && (
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color={colors.error} />
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>
      )}

      {/* App Info */}
      <View style={styles.appInfo}>
        <Text style={styles.appInfoText}>AuctionProp v1.0.0</Text>
        <Text style={styles.appInfoText}>India Property Auction Discovery</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  scrollContent: {
    paddingBottom: spacing[10],
  },
  profileCard: {
    backgroundColor: colors.primary[500],
    paddingTop: spacing[8],
    paddingBottom: spacing[6],
    paddingHorizontal: spacing[6],
    alignItems: 'center',
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing[3],
  },
  avatarText: {
    fontSize: fontSizes['2xl'],
    fontWeight: fontWeights.bold as any,
    color: colors.white,
  },
  userName: {
    fontSize: fontSizes.xl,
    fontWeight: fontWeights.bold as any,
    color: colors.white,
    marginBottom: spacing[1],
  },
  userEmail: {
    fontSize: fontSizes.md,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: spacing[1],
  },
  userPhone: {
    fontSize: fontSizes.sm,
    color: 'rgba(255,255,255,0.6)',
    marginBottom: spacing[3],
  },
  signInButton: {
    marginTop: spacing[4],
    backgroundColor: colors.white,
    paddingHorizontal: spacing[8],
    paddingVertical: spacing[3],
    borderRadius: borderRadius.full,
  },
  signInButtonText: {
    fontSize: fontSizes.base,
    fontWeight: fontWeights.semibold as any,
    color: colors.primary[500],
  },
  menuSection: {
    marginTop: spacing[6],
    paddingHorizontal: spacing[4],
  },
  menuSectionTitle: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.semibold as any,
    color: colors.text.tertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing[2],
    marginLeft: spacing[2],
  },
  menuCard: {
    backgroundColor: colors.surface.primary,
    borderRadius: borderRadius.xl,
    ...shadows.sm,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing[4],
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  menuIconContainer: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing[3],
  },
  menuContent: {
    flex: 1,
  },
  menuLabel: {
    fontSize: fontSizes.base,
    fontWeight: fontWeights.medium as any,
    color: colors.text.primary,
  },
  menuSubtitle: {
    fontSize: fontSizes.sm,
    color: colors.text.tertiary,
    marginTop: 2,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing[8],
    marginHorizontal: spacing[4],
    paddingVertical: spacing[4],
    backgroundColor: colors.surface.primary,
    borderRadius: borderRadius.xl,
    gap: spacing[2],
    ...shadows.sm,
  },
  logoutText: {
    fontSize: fontSizes.base,
    fontWeight: fontWeights.semibold as any,
    color: colors.error,
  },
  appInfo: {
    alignItems: 'center',
    marginTop: spacing[8],
    paddingBottom: spacing[4],
  },
  appInfoText: {
    fontSize: fontSizes.sm,
    color: colors.text.tertiary,
    marginBottom: spacing[1],
  },
});
