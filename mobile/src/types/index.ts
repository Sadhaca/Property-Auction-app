export interface User {
  id: string;
  email: string;
  phone?: string;
  full_name: string;
  avatar_url?: string;
  subscription_plan: 'free' | 'basic' | 'premium' | 'enterprise';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AuctionProperty {
  id: string;
  title: string;
  description?: string;
  property_type: PropertyType;
  property_subtype?: string;
  address: string;
  city: string;
  district?: string;
  state: string;
  pin_code?: string;
  latitude?: number;
  longitude?: number;
  reserve_price: number;
  emd_amount?: number;
  auction_date?: string;
  auction_start_time?: string;
  auction_end_time?: string;
  bank_name: string;
  bank_branch?: string;
  bank_contact?: string;
  borrower_name?: string;
  area_sqft?: number;
  carpet_area_sqft?: number;
  built_up_area_sqft?: number;
  plot_area_sqft?: number;
  floors?: number;
  bedrooms?: number;
  bathrooms?: number;
  possession_status?: 'physical' | 'symbolic' | 'unknown';
  status: PropertyStatus;
  source: string;
  source_url?: string;
  images: string[];
  documents: PropertyDocument[];
  ai_summary?: string;
  risk_score?: number;
  completeness_score?: number;
  is_featured: boolean;
  views_count: number;
  created_at: string;
  updated_at: string;
}

export interface PropertyDocument {
  id: string;
  name: string;
  url: string;
  type: string;
  size_bytes?: number;
}

export type PropertyType =
  | 'residential'
  | 'commercial'
  | 'industrial'
  | 'agricultural'
  | 'plot'
  | 'mixed'
  | 'other';

export type PropertyStatus =
  | 'upcoming'
  | 'live'
  | 'completed'
  | 'cancelled'
  | 'postponed';

export interface PropertyFilters {
  search?: string;
  state?: string;
  city?: string;
  district?: string;
  pin_code?: string;
  bank_name?: string;
  property_type?: PropertyType;
  property_subtype?: string;
  min_price?: number;
  max_price?: number;
  min_emd?: number;
  max_emd?: number;
  auction_date_from?: string;
  auction_date_to?: string;
  min_area?: number;
  max_area?: number;
  possession_status?: string;
  status?: PropertyStatus;
  source?: string;
  sort_by?: SortOption;
  sort_order?: 'asc' | 'desc';
  page?: number;
  page_size?: number;
}

export type SortOption =
  | 'relevance'
  | 'price_low'
  | 'price_high'
  | 'date_newest'
  | 'date_oldest'
  | 'auction_date';

export interface SavedSearch {
  id: string;
  name: string;
  filters: PropertyFilters;
  alert_enabled: boolean;
  alert_frequency: 'instant' | 'daily' | 'weekly';
  last_notified_at?: string;
  results_count: number;
  created_at: string;
  updated_at: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
  has_next: boolean;
  has_previous: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  full_name: string;
  email: string;
  phone?: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface TrendingCity {
  city: string;
  state: string;
  count: number;
  avg_price: number;
}

export interface TrendingBank {
  bank_name: string;
  count: number;
  logo_url?: string;
}

export interface EnquiryRequest {
  property_id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
}
