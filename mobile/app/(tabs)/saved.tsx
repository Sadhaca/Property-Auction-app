import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../src/theme/colors';
import { fontSizes, fontWeights } from '../../src/theme/typography';
import { spacing } from '../../src/theme/spacing';
import { PropertyCard } from '../../src/components/PropertyCard';
import { EmptyState } from '../../src/components/EmptyState';
import { LoadingState } from '../../src/components/LoadingState';
import { useFavorites } from '../../src/hooks/useFavorites';

export default function SavedScreen() {
  const { favorites, isLoading, removeFavorite, fetchFavorites, isFavorite, toggleFavorite } =
    useFavorites();

  const handleRemove = (propertyId: string) => {
    Alert.alert(
      'Remove from Saved',
      'Are you sure you want to remove this property from your saved list?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => removeFavorite(propertyId),
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <LoadingState count={3} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {favorites.length === 0 ? (
        <EmptyState
          icon="heart-outline"
          title="No Saved Properties"
          message="Properties you save will appear here. Browse auctions and tap the heart icon to save."
          actionLabel="Browse Properties"
        />
      ) : (
        <FlatList
          data={favorites}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <PropertyCard
              property={item}
              isFavorite={true}
              onToggleFavorite={handleRemove}
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshing={isLoading}
          onRefresh={fetchFavorites}
          ListHeaderComponent={
            <Text style={styles.count}>
              {favorites.length} saved {favorites.length === 1 ? 'property' : 'properties'}
            </Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  listContent: {
    padding: spacing[4],
  },
  count: {
    fontSize: fontSizes.md,
    color: colors.text.secondary,
    fontWeight: fontWeights.medium as any,
    marginBottom: spacing[4],
  },
});
