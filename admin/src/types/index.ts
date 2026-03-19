export interface User {
  id: string;
  email: string;
  name: string;
  role: "admin" | "super_admin" | "moderator" | "viewer";
  avatar?: string;
  phone?: string;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuctionProperty {
  id: string;
  title: string;
  description?: string;
  propertyType: "residential" | "commercial" | "industrial" | "agricultural" | "mixed";
  auctionType: "bank" | "government" | "court" | "private";
  status: "active" | "expired" | "sold" | "withdrawn" | "upcoming";

  // Location
  address: string;
  city: string;
  state: string;
  pincode: string;
  latitude?: number;
  longitude?: number;

  // Financial
  reservePrice: number;
  marketValue?: number;
  emdAmount?: number;
  bidIncrementAmount?: number;

  // Auction details
  auctionDate?: string;
  auctionStartTime?: string;
  auctionEndTime?: string;
  emdLastDate?: string;
  inspectionDate?: string;

  // Property details
  area?: number;
  areaUnit?: string;
  builtUpArea?: number;
  borrowerName?: string;

  // Bank / Institution
  bankName?: string;
  branchName?: string;
  contactPerson?: string;
  contactPhone?: string;
  contactEmail?: string;

  // Source
  sourceId: string;
  sourceName?: string;
  sourceUrl?: string;
  externalId?: string;

  // Documents
  documents?: PropertyDocument[];

  // AI
  aiSummary?: string;
  aiTags?: string[];

  // Meta
  viewCount?: number;
  favoriteCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface PropertyDocument {
  id: string;
  name: string;
  type: string;
  url: string;
  size?: number;
}

export interface Source {
  id: string;
  name: string;
  slug: string;
  type: "scraper" | "api" | "manual" | "rss";
  url: string;
  description?: string;
  isEnabled: boolean;
  schedule?: string;
  lastRunAt?: string;
  lastRunStatus?: "success" | "failed" | "partial";
  totalRecords: number;
  config?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface IngestionJob {
  id: string;
  sourceId: string;
  sourceName: string;
  status: "pending" | "running" | "completed" | "failed" | "cancelled";
  startedAt?: string;
  completedAt?: string;
  duration?: number;
  stats: {
    totalProcessed: number;
    newRecords: number;
    updatedRecords: number;
    failedRecords: number;
    skippedRecords: number;
  };
  errorMessage?: string;
  logs?: IngestionLog[];
  triggeredBy: string;
  createdAt: string;
}

export interface IngestionLog {
  id: string;
  level: "info" | "warning" | "error" | "debug";
  message: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export interface DashboardStats {
  totalProperties: number;
  activeProperties: number;
  totalUsers: number;
  activeUsers: number;
  totalSources: number;
  activeSources: number;
  todayIngestion: number;
  propertiesGrowth: number;
  usersGrowth: number;
}

export interface DataQuality {
  overallScore: number;
  completeness: number;
  accuracy: number;
  freshness: number;
  duplicates: number;
  missingFields: {
    field: string;
    count: number;
    percentage: number;
  }[];
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  entity: string;
  entityId?: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface IngestionChartData {
  date: string;
  newRecords: number;
  updatedRecords: number;
  failedRecords: number;
}

export interface CityPropertyCount {
  city: string;
  state: string;
  count: number;
  percentage: number;
}

export interface PropertyChangeHistory {
  id: string;
  field: string;
  oldValue: string;
  newValue: string;
  changedBy: string;
  changedAt: string;
}
