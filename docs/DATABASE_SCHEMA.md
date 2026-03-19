# Database Schema Design

## Entity Relationship Overview

```
Users ──┬── Favorites ──── AuctionProperties ──┬── PropertyDocuments
        ├── SavedSearches                       ├── PropertyChangeHistory
        ├── Enquiries                           ├── IngestionLogs
        └── AuditLogs                           └── Sources ── IngestionJobs

SubscriptionPlans ── Users
```

## Tables

### users
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| email | VARCHAR(255) | UNIQUE, NOT NULL |
| phone | VARCHAR(20) | UNIQUE, nullable |
| password_hash | VARCHAR(255) | NOT NULL |
| full_name | VARCHAR(255) | NOT NULL |
| role | ENUM(user,admin,superadmin) | DEFAULT user |
| is_active | BOOLEAN | DEFAULT true |
| subscription_plan_id | UUID | FK → subscription_plans |
| created_at | TIMESTAMP | DEFAULT now() |
| updated_at | TIMESTAMP | auto-update |

### subscription_plans
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| name | VARCHAR(100) | e.g., Free, Pro, Enterprise |
| price | DECIMAL(10,2) | Monthly price INR |
| duration_days | INTEGER | Plan duration |
| features | JSONB | Feature flags |
| max_saved_searches | INTEGER | |
| max_alerts | INTEGER | |
| can_export | BOOLEAN | |
| api_access | BOOLEAN | |
| is_active | BOOLEAN | DEFAULT true |
| created_at | TIMESTAMP | |

### auction_properties (CORE TABLE)
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| source_id | UUID | FK → sources |
| source_reference | VARCHAR(255) | ID from source |
| bank_name | VARCHAR(255) | INDEX |
| bank_branch | VARCHAR(255) | |
| title | VARCHAR(500) | NOT NULL |
| description | TEXT | |
| property_type | ENUM | residential/commercial/land/industrial/agricultural |
| property_subtype | ENUM | flat/house/plot/building/office/warehouse/factory/shop |
| address | TEXT | |
| locality | VARCHAR(255) | |
| district | VARCHAR(255) | |
| city | VARCHAR(255) | INDEX |
| state | VARCHAR(100) | INDEX |
| pin_code | VARCHAR(10) | |
| latitude | DECIMAL(10,8) | |
| longitude | DECIMAL(11,8) | |
| reserve_price | DECIMAL(15,2) | INDEX |
| emd_amount | DECIMAL(15,2) | |
| bid_increment | DECIMAL(15,2) | |
| auction_date | DATE | INDEX |
| auction_time | TIME | |
| inspection_date | DATE | |
| possession_status | ENUM | borrower_occupied/symbolic/physical/vacant/unknown |
| encumbrance_notes | TEXT | |
| borrower_name | VARCHAR(255) | |
| contact_person | VARCHAR(255) | |
| contact_phone | VARCHAR(50) | |
| contact_email | VARCHAR(255) | |
| document_links | JSONB | |
| image_urls | JSONB | |
| status | ENUM | active/updated/sold/withdrawn/expired. INDEX |
| first_seen_at | TIMESTAMP | |
| last_seen_at | TIMESTAMP | |
| ai_summary | TEXT | |
| ai_risk_score | DECIMAL(3,2) | 0.00-1.00 |
| data_completeness_score | DECIMAL(3,2) | 0.00-1.00 |
| area_sqft | DECIMAL(12,2) | |
| raw_data | JSONB | Original scraped data |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

**Indexes**: city, state, status, auction_date, reserve_price, bank_name, property_type, (city, state), (auction_date, status)

### sources
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| name | VARCHAR(255) | NOT NULL |
| source_type | ENUM | website/pdf/api/rss |
| base_url | VARCHAR(500) | |
| crawler_module | VARCHAR(255) | Python module path |
| schedule_cron | VARCHAR(100) | Cron expression |
| is_active | BOOLEAN | |
| config | JSONB | Source-specific config |
| last_run_at | TIMESTAMP | |
| created_at | TIMESTAMP | |

### ingestion_jobs
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| source_id | UUID | FK → sources |
| status | ENUM | pending/running/completed/failed |
| started_at | TIMESTAMP | |
| completed_at | TIMESTAMP | |
| records_found | INTEGER | |
| records_new | INTEGER | |
| records_updated | INTEGER | |
| records_failed | INTEGER | |
| error_log | TEXT | |
| created_at | TIMESTAMP | |

### ingestion_logs
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| job_id | UUID | FK → ingestion_jobs |
| property_id | UUID | FK → auction_properties |
| action | ENUM | created/updated/skipped/failed |
| details | JSONB | |
| created_at | TIMESTAMP | |

### property_documents
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| property_id | UUID | FK → auction_properties |
| document_type | VARCHAR(100) | notice/order/photo |
| file_url | VARCHAR(500) | S3 path |
| ocr_text | TEXT | |
| ocr_status | ENUM | pending/completed/failed |
| ai_extraction | JSONB | Extracted fields |
| created_at | TIMESTAMP | |

### property_change_history
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| property_id | UUID | FK → auction_properties |
| field_name | VARCHAR(100) | |
| old_value | TEXT | |
| new_value | TEXT | |
| changed_at | TIMESTAMP | |
| source_job_id | UUID | FK → ingestion_jobs |

### saved_searches
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| user_id | UUID | FK → users |
| name | VARCHAR(255) | |
| filters | JSONB | PropertyFilters |
| alert_enabled | BOOLEAN | |
| alert_frequency | ENUM | daily/weekly/instant |
| last_alerted_at | TIMESTAMP | |
| created_at | TIMESTAMP | |

### favorites
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| user_id | UUID | FK → users |
| property_id | UUID | FK → auction_properties |
| created_at | TIMESTAMP | |
| **UNIQUE** | (user_id, property_id) | |

### enquiries
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| user_id | UUID | FK → users |
| property_id | UUID | FK → auction_properties |
| message | TEXT | |
| status | ENUM | pending/responded/closed |
| created_at | TIMESTAMP | |

### audit_logs
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| user_id | UUID | FK → users |
| action | VARCHAR(100) | |
| entity_type | VARCHAR(100) | |
| entity_id | VARCHAR(255) | |
| details | JSONB | |
| ip_address | VARCHAR(45) | |
| created_at | TIMESTAMP | |
