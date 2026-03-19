import { useState, useCallback, useEffect } from 'react';
import { api } from '../lib/api';
import type { AuctionProperty } from '../types';

interface UseFavoritesReturn {
  favorites: AuctionProperty[];
  favoriteIds: Set<string>;
  isLoading: boolean;
  toggleFavorite: (propertyId: string) => Promise<void>;
  isFavorite: (propertyId: string) => boolean;
  fetchFavorites: () => Promise<void>;
  removeFavorite: (propertyId: string) => Promise<void>;
}

export function useFavorites(): UseFavoritesReturn {
  const [favorites, setFavorites] = useState<AuctionProperty[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);

  const fetchFavorites = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await api.get<AuctionProperty[]>('/favorites');
      setFavorites(response.data);
      setFavoriteIds(new Set(response.data.map((p) => p.id)));
    } catch (err) {
      console.error('Failed to fetch favorites:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const toggleFavorite = useCallback(
    async (propertyId: string) => {
      const isCurrentlyFavorite = favoriteIds.has(propertyId);

      // Optimistic update
      setFavoriteIds((prev) => {
        const next = new Set(prev);
        if (isCurrentlyFavorite) {
          next.delete(propertyId);
        } else {
          next.add(propertyId);
        }
        return next;
      });

      if (isCurrentlyFavorite) {
        setFavorites((prev) => prev.filter((p) => p.id !== propertyId));
      }

      try {
        if (isCurrentlyFavorite) {
          await api.delete(`/favorites/${propertyId}`);
        } else {
          await api.post(`/favorites/${propertyId}`);
        }
      } catch (err) {
        // Revert on error
        setFavoriteIds((prev) => {
          const next = new Set(prev);
          if (isCurrentlyFavorite) {
            next.add(propertyId);
          } else {
            next.delete(propertyId);
          }
          return next;
        });
        console.error('Failed to toggle favorite:', err);
      }
    },
    [favoriteIds]
  );

  const removeFavorite = useCallback(async (propertyId: string) => {
    setFavoriteIds((prev) => {
      const next = new Set(prev);
      next.delete(propertyId);
      return next;
    });
    setFavorites((prev) => prev.filter((p) => p.id !== propertyId));

    try {
      await api.delete(`/favorites/${propertyId}`);
    } catch (err) {
      console.error('Failed to remove favorite:', err);
      fetchFavorites();
    }
  }, [fetchFavorites]);

  const isFavorite = useCallback(
    (propertyId: string) => favoriteIds.has(propertyId),
    [favoriteIds]
  );

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  return {
    favorites,
    favoriteIds,
    isLoading,
    toggleFavorite,
    isFavorite,
    fetchFavorites,
    removeFavorite,
  };
}
