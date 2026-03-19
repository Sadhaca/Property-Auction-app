import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../src/theme/colors';
import { fontSizes, fontWeights } from '../../src/theme/typography';
import { spacing, borderRadius, shadows } from '../../src/theme/spacing';
import { SearchBar } from '../../src/components/SearchBar';
import { PropertyCard } from '../../src/components/PropertyCard';
import { StatCard } from '../../src/components/StatCard';
import { LoadingState } from '../../src/components/LoadingState';
import { useAuthStore } from '../../src/lib/auth';
import { useFavorites } from '../../src/hooks/useFavorites';
import { api } from '../../src/lib/api';
import type { AuctionProperty, TrendingCity, TrendingBank } from '../../src/types';

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { isFavorite, toggleFavorite } = useFavorites();

  const [recentProperties, setRecentProperties] = useState<AuctionProperty[]>([]);
  const [upcomingAuctions, setUpcomingAuctions] = useState<AuctionProperty[]>([]);
  const [trendingCities, setTrendingCities] = useState<TrendingCity[]>([]);
  const [trendingBanks, setTrendingBanks] = useState<TrendingBank[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const [recentRes, upcomingRes, citiesRes, banksRes] = await Promise.allSettled([
        api.get('/properties', { params: { page_size: 10, sort_by: 'date_newest' } }),
        api.get('/properties', { params: { page_size: 10, status: 'upcoming', sort_by: 'auction_date' } }),
        api.get('/analytics/trending-cities'),
        api.get('/analytics/trending-banks'),
      ]);

      if (recentRes.status === 'fulfilled') {
        setRecentProperties(recentRes.value.data.items || recentRes.value.data);
      }
      if (upcomingRes.status === 'fulfilled') {
        setUpcomingAuctions(upcomingRes.value.data.items || upcomingRes.value.data);
      }
      if (citiesRes.status === 'fulfilled') {
        setTrendingCities(citiesRes.value.data);
      }
      if (banksRes.status === 'fulfilled') {
        setTrendingBanks(banksRes.value.data);
      }
    } catch (err) {
      console.error('Failed to fetch home data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const handleSearch = (text: string) => {
    router.push({ pathname: '/(tabs)/search', params: { q: text } });
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <LoadingState count={3} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>
              {user ? `Hello, ${user.full_name.split(' ')[0]}` : 'Welcome'}
            </Text>
            <Text style={styles.headerSubtitle}>
              Discover auction properties across India
            </Text>
          </View>
          <TouchableOpacity
            style={styles.notificationButton}
            onPress={() => router.push('/(tabs)/alerts')}
          >
            <Ionicons
              name="notifications-outline"
              size={24}
              color={colors.primary[500]}
            />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <SearchBar onSubmit={handleSearch} />
        </View>

        {/* Recently Added */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recently Added</Text>
            <TouchableOpacity
              onPress={() => router.push('/(tabs)/search')}
            >
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            horizontal
            data={recentProperties}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <PropertyCard
                property={item}
                compact
                isFavorite={isFavorite(item.id)}
                onToggleFavorite={toggleFavorite}
              />
            )}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
          />
        </View>

        {/* Trending Cities */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Trending Cities</Text>
          </View>
          <FlatList
            horizontal
            data={
              trendingCities.length > 0
                ? trendingCities
                : [
                    { city: 'Mumbai', state: 'Maharashtra', count: 245, avg_price: 5000000 },
                    { city: 'Delhi', state: 'Delhi', count: 189, avg_price: 4500000 },
                    { city: 'Bangalore', state: 'Karnataka', count: 167, avg_price: 3800000 },
                    { city: 'Chennai', state: 'Tamil Nadu', count: 134, avg_price: 3200000 },
                    { city: 'Pune', state: 'Maharashtra', count: 112, avg_price: 2800000 },
                  ]
            }
            keyExtractor={(item) => item.city}
            renderItem={({ item }) => (
              <StatCard
                title={item.city}
                subtitle={item.state}
                value={item.count}
                icon="location-outline"
                iconColor={colors.secondary[500]}
                onPress={() =>
                  router.push({
                    pathname: '/(tabs)/search',
                    params: { city: item.city },
                  })
                }
              />
            )}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
          />
        </View>

        {/* Trending Banks */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Trending Banks</Text>
          </View>
          <FlatList
            horizontal
            data={
              trendingBanks.length > 0
                ? trendingBanks
                : [
                    { bank_name: 'SBI', count: 523 },
                    { bank_name: 'PNB', count: 312 },
                    { bank_name: 'Bank of Baroda', count: 287 },
                    { bank_name: 'HDFC Bank', count: 234 },
                    { bank_name: 'ICICI Bank', count: 198 },
                  ]
            }
            keyExtractor={(item) => item.bank_name}
            renderItem={({ item }) => (
              <StatCard
                title={item.bank_name}
                value={item.count}
                icon="wallet-outline"
                iconColor={colors.primary[400]}
                onPress={() =>
                  router.push({
                    pathname: '/(tabs)/search',
                    params: { bank: item.bank_name },
                  })
                }
              />
            )}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
          />
        </View>

        {/* Upcoming Auctions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Upcoming Auctions</Text>
            <TouchableOpacity
              onPress={() =>
                router.push({
                  pathname: '/(tabs)/search',
                  params: { status: 'upcoming' },
                })
              }
            >
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          {upcomingAuctions.map((property) => (
            <PropertyCard
              key={property.id}
              property={property}
              isFavorite={isFavorite(property.id)}
              onToggleFavorite={toggleFavorite}
            />
          ))}
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing[6],
    paddingTop: spacing[4],
    paddingBottom: spacing[2],
  },
  greeting: {
    fontSize: fontSizes['2xl'],
    fontWeight: fontWeights.bold as any,
    color: colors.text.primary,
  },
  headerSubtitle: {
    fontSize: fontSizes.md,
    color: colors.text.secondary,
    marginTop: spacing[0.5],
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    paddingHorizontal: spacing[6],
    paddingVertical: spacing[4],
  },
  section: {
    marginTop: spacing[4],
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing[6],
    marginBottom: spacing[4],
  },
  sectionTitle: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.bold as any,
    color: colors.text.primary,
  },
  seeAll: {
    fontSize: fontSizes.md,
    color: colors.primary[500],
    fontWeight: fontWeights.medium as any,
  },
  horizontalList: {
    paddingHorizontal: spacing[6],
  },
  bottomSpacer: {
    height: spacing[8],
  },
});
