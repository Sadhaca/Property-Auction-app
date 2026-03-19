import { useState, useCallback, useEffect } from 'react';
import { api } from '../lib/api';
import type { AuctionProperty, PropertyFilters, PaginatedResponse } from '../types';

interface UsePropertiesReturn {
  properties: AuctionProperty[];
  isLoading: boolean;
  isRefreshing: boolean;
  isLoadingMore: boolean;
  error: string | null;
  total: number;
  hasMore: boolean;
  currentPage: number;
  fetchProperties: (filters?: PropertyFilters) => Promise<void>;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
  filters: PropertyFilters;
  setFilters: (filters: PropertyFilters) => void;
}

export function useProperties(initialFilters?: PropertyFilters): UsePropertiesReturn {
  const [properties, setProperties] = useState<AuctionProperty[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<PropertyFilters>(initialFilters || {});

  const fetchProperties = useCallback(
    async (overrideFilters?: PropertyFilters) => {
      const activeFilters = overrideFilters || filters;
      setIsLoading(true);
      setError(null);

      try {
        const params: Record<string, any> = {
          page: 1,
          page_size: 20,
          ...activeFilters,
        };

        // Clean undefined values
        Object.keys(params).forEach((key) => {
          if (params[key] === undefined || params[key] === '') {
            delete params[key];
          }
        });

        const response = await api.get<PaginatedResponse<AuctionProperty>>(
          '/properties',
          { params }
        );

        setProperties(response.data.items);
        setTotal(response.data.total);
        setHasMore(response.data.has_next);
        setCurrentPage(1);
      } catch (err: any) {
        setError(err.response?.data?.detail || 'Failed to fetch properties');
        setProperties([]);
      } finally {
        setIsLoading(false);
      }
    },
    [filters]
  );

  const loadMore = useCallback(async () => {
    if (!hasMore || isLoadingMore) return;

    setIsLoadingMore(true);
    try {
      const nextPage = currentPage + 1;
      const params: Record<string, any> = {
        page: nextPage,
        page_size: 20,
        ...filters,
      };

      Object.keys(params).forEach((key) => {
        if (params[key] === undefined || params[key] === '') {
          delete params[key];
        }
      });

      const response = await api.get<PaginatedResponse<AuctionProperty>>(
        '/properties',
        { params }
      );

      setProperties((prev) => [...prev, ...response.data.items]);
      setHasMore(response.data.has_next);
      setCurrentPage(nextPage);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load more');
    } finally {
      setIsLoadingMore(false);
    }
  }, [hasMore, isLoadingMore, currentPage, filters]);

  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const params: Record<string, any> = {
        page: 1,
        page_size: 20,
        ...filters,
      };

      Object.keys(params).forEach((key) => {
        if (params[key] === undefined || params[key] === '') {
          delete params[key];
        }
      });

      const response = await api.get<PaginatedResponse<AuctionProperty>>(
        '/properties',
        { params }
      );

      setProperties(response.data.items);
      setTotal(response.data.total);
      setHasMore(response.data.has_next);
      setCurrentPage(1);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to refresh');
    } finally {
      setIsRefreshing(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchProperties();
  }, []);

  return {
    properties,
    isLoading,
    isRefreshing,
    isLoadingMore,
    error,
    total,
    hasMore,
    currentPage,
    fetchProperties,
    loadMore,
    refresh,
    filters,
    setFilters,
  };
}
