# Architecture Design - AuctionProp

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │ Mobile App   │  │ Admin Panel  │  │ Future API   │              │
│  │ React Native │  │ Next.js      │  │ Clients      │              │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘              │
└─────────┼──────────────────┼──────────────────┼─────────────────────┘
          │                  │                  │
          ▼                  ▼                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     API GATEWAY / LOAD BALANCER                      │
│                    (Nginx / Cloud ALB / API Gateway)                 │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────────────┐
│                        BACKEND API LAYER                             │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                    FastAPI Application                        │   │
│  │  ┌─────────┐ ┌──────────┐ ┌─────────┐ ┌──────────────────┐ │   │
│  │  │Auth API │ │Properties│ │Search   │ │Admin APIs        │ │   │
│  │  │JWT/OAuth│ │CRUD+Filter│ │Saved/   │ │Sources/Ingestion│ │   │
│  │  │         │ │          │ │Alerts   │ │Users/Dashboard   │ │   │
│  │  └─────────┘ └──────────┘ └─────────┘ └──────────────────┘ │   │
│  └──────────────────────────────────────────────────────────────┘   │
└───────┬──────────────┬──────────────┬──────────────┬────────────────┘
        │              │              │              │
        ▼              ▼              ▼              ▼
┌──────────────┐ ┌──────────┐ ┌──────────────┐ ┌──────────────┐
│ PostgreSQL   │ │  Redis   │ │Elasticsearch │ │ S3 Storage   │
│ Primary DB   │ │ Cache/   │ │ Search Index │ │ Documents/   │
│ All models   │ │ Queue    │ │ Properties   │ │ Images       │
└──────────────┘ └──────────┘ └──────────────┘ └──────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    WORKER LAYER (Celery)                             │
│  ┌─────────────┐ ┌──────────────┐ ┌──────────────┐ ┌───────────┐  │
│  │Daily        │ │Source        │ │Document/OCR  │ │Alert      │  │
│  │Scheduler    │ │Crawlers      │ │Pipeline      │ │Processor  │  │
│  │(Celery Beat)│ │(Per-source)  │ │(AI Extract)  │ │(Email/Push│  │
│  └─────────────┘ └──────────────┘ └──────────────┘ └───────────┘  │
│                         │                │                          │
│                         ▼                ▼                          │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │              AI Processing Layer (OpenAI API)                │  │
│  │  • Field extraction  • Summarization  • Risk scoring         │  │
│  │  • Type tagging      • Location inference  • Completeness    │  │
│  └──────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

## Component Breakdown

### 1. Backend API (FastAPI)
- **Framework**: FastAPI with async/await
- **Auth**: JWT tokens with role-based access (user, admin, superadmin)
- **API versioning**: /api/v1/ prefix
- **Validation**: Pydantic schemas
- **Logging**: structlog for structured JSON logging

### 2. Database (PostgreSQL)
- Primary data store for all entities
- Full-text search fallback
- JSONB columns for flexible data (raw_data, document_links, filters)
- Proper indexing on frequently queried columns
- Alembic for schema migrations

### 3. Search (Elasticsearch)
- Property search with full-text and faceted filtering
- Geo-spatial queries for location-based search
- Aggregations for trending/analytics
- Synced from PostgreSQL via service layer

### 4. Cache/Queue (Redis)
- Celery message broker
- API response caching
- Rate limiting
- Session data

### 5. Worker Layer (Celery)
- **Beat scheduler**: Triggers daily ingestion jobs
- **Source crawlers**: Per-source pluggable crawlers
- **OCR pipeline**: Document text extraction
- **AI processing**: Field extraction, summarization
- **Alert processor**: Match saved searches, send notifications

### 6. Storage (S3-compatible)
- Property documents (PDFs, notices)
- Property images
- OCR output files
- Export files

## Tech Stack Rationale

| Component | Choice | Why |
|-----------|--------|-----|
| Backend | FastAPI | Async, fast, auto-docs, Python ecosystem for AI/ML |
| Mobile | React Native (Expo) | Cross-platform, large ecosystem, fast dev |
| Admin | Next.js | React ecosystem, SSR, fast build |
| Database | PostgreSQL | Robust, JSONB, full-text search, geospatial |
| Search | Elasticsearch | Superior full-text search, faceting, aggregations |
| Queue | Celery + Redis | Mature, reliable, periodic scheduling |
| AI | OpenAI API | Best extraction quality, easy integration |
| OCR | Tesseract + pdfplumber | Open source, no vendor lock-in |

## Security Architecture

- JWT authentication with configurable expiry
- Role-based access control (RBAC)
- Rate limiting via Redis
- Input validation via Pydantic
- SQL injection prevention via SQLAlchemy ORM
- CORS configuration
- Encryption at rest (database-level)
- TLS/HTTPS in production
- Audit logging for all admin actions
- Environment-based secrets management

## Cloud Deployment Options

The architecture is cloud-portable:
- **AWS**: RDS (Postgres), ElastiCache (Redis), OpenSearch, S3, ECS/EKS, SQS
- **GCP**: Cloud SQL, Memorystore, Elastic Cloud, GCS, Cloud Run/GKE
- **Azure**: Azure Database, Azure Cache, Elastic Cloud, Blob Storage, AKS

## Monitoring & Observability

- **Error tracking**: Sentry integration
- **Logging**: Structured JSON logs (structlog)
- **Metrics**: Prometheus-compatible health endpoints
- **Ingestion monitoring**: Built-in job tracking and admin dashboard
- **Alerting**: Admin alerts on source failures, data quality drops
