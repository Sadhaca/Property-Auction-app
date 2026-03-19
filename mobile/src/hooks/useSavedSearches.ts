import { useState, useCallback, useEffect } from 'react';
import { api } from '../lib/api';
import type { SavedSearch, PropertyFilters } from '../types';

interface UseSavedSearchesReturn {
  savedSearches: SavedSearch[];
  isLoading: boolean;
  error: string | null;
  fetchSavedSearches: () => Promise<void>;
  saveSearch: (name: string, filters: PropertyFilters) => Promise<void>;
  deleteSearch: (id: string) => Promise<void>;
  toggleAlert: (id: string, enabled: boolean) => Promise<void>;
  updateAlertFrequency: (id: string, frequency: 'instant' | 'daily' | 'weekly') => Promise<void>;
}

export function useSavedSearches(): UseSavedSearchesReturn {
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSavedSearches = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get<SavedSearch[]>('/saved-searches');
      setSavedSearches(response.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to fetch saved searches');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveSearch = useCallback(
    async (name: string, filters: PropertyFilters) => {
      try {
        const response = await api.post<SavedSearch>('/saved-searches', {
          name,
          filters,
          alert_enabled: true,
          alert_frequency: 'daily',
        });
        setSavedSearches((prev) => [response.data, ...prev]);
      } catch (err: any) {
        throw new Error(err.response?.data?.detail || 'Failed to save search');
      }
    },
    []
  );

  const deleteSearch = useCallback(async (id: string) => {
    setSavedSearches((prev) => prev.filter((s) => s.id !== id));
    try {
      await api.delete(`/saved-searches/${id}`);
    } catch (err) {
      console.error('Failed to delete saved search:', err);
      fetchSavedSearches();
    }
  }, [fetchSavedSearches]);

  const toggleAlert = useCallback(async (id: string, enabled: boolean) => {
    setSavedSearches((prev) =>
      prev.map((s) => (s.id === id ? { ...s, alert_enabled: enabled } : s))
    );
    try {
      await api.patch(`/saved-searches/${id}`, { alert_enabled: enabled });
    } catch (err) {
      console.error('Failed to toggle alert:', err);
      fetchSavedSearches();
    }
  }, [fetchSavedSearches]);

  const updateAlertFrequency = useCallback(
    async (id: string, frequency: 'instant' | 'daily' | 'weekly') => {
      setSavedSearches((prev) =>
        prev.map((s) => (s.id === id ? { ...s, alert_frequency: frequency } : s))
      );
      try {
        await api.patch(`/saved-searches/${id}`, { alert_frequency: frequency });
      } catch (err) {
        console.error('Failed to update frequency:', err);
        fetchSavedSearches();
      }
    },
    [fetchSavedSearches]
  );

  useEffect(() => {
    fetchSavedSearches();
  }, [fetchSavedSearches]);

  return {
    savedSearches,
    isLoading,
    error,
    fetchSavedSearches,
    saveSearch,
    deleteSearch,
    toggleAlert,
    updateAlertFrequency,
  };
}
