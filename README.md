# AuctionVault India - Property Auction Discovery Platform

AuctionVault is a comprehensive platform for discovering, tracking, and analyzing auction properties across India. It aggregates property auction listings from banks (SBI, PNB, HDFC, ICICI, etc.), NBFCs, government bodies, DRT tribunals, and e-auction portals into a single searchable interface with intelligent alerts and AI-powered data extraction.

---

## Table of Contents

- [Project Overview](#project-overview)
- [Architecture Overview](#architecture-overview)
- [Prerequisites](#prerequisites)
- [Repository Structure](#repository-structure)
- [Setup Instructions](#setup-instructions)
- [Environment Variables](#environment-variables)
- [Deployment Guide](#deployment-guide)
- [MVP Scope](#mvp-scope)
- [Contributing](#contributing)
- [License](#license)

---

## Project Overview

India's property auction market is fragmented across hundreds of bank portals, government gazette notifications, newspaper classifieds, and e-auction platforms. Buyers, investors, and legal professionals waste significant time manually checking multiple sources.

AuctionVault solves this by:

- **Aggregating** auction listings from 50+ sources (bank portals, MSTC, e-auction sites, NBFC notices, DRT orders, newspaper ads)
- **Extracting** structured data from PDFs, images, and unstructured HTML using AI/ML pipelines
- **Deduplicating** listings that appear across multiple sources
- **Alerting** users when properties matching their saved searches are listed
- **Providing** rich search, filtering, and map-based discovery
- **Enabling** an admin panel for data quality oversight and source management

---

## Architecture Overview

```
                         +-----------------+
                         |   Mobile App    |
                         | (React Native)  |
                         +--------+--------+
                                  |
                         +--------v--------+
                         |   API Gateway   |
                         |   (FastAPI)     |
                         +--------+--------+
                                  |
          +-----------+-----------+-----------+-----------+
          |           |           |           |           |
   +------v---+ +----v-----+ +--v-------+ +-v--------+ +v-----------+
   |PostgreSQL| |  Redis   | |Elastic-  | | Celery   | | Admin      |
   |   15+    | | (Cache,  | |search 8  | | Workers  | | Panel      |
   |          | |  Queue)  | |(Search)  | | (Scrape, | | (Next.js)  |
   +----------+ +----------+ +----------+ |  AI, ETL)| +------------+
                                           +----------+
```

| Component | Technology | Purpose |
|-----------|-----------|---------|
| Backend API | FastAPI (Python 3.11+) | REST API, auth, business logic |
| Admin Panel | Next.js 14 (React 18) | Source management, data QA, analytics |
| Mobile App | React Native (Expo) | User-facing property discovery |
| Database | PostgreSQL 15+ with PostGIS | Primary data store with geospatial queries |
| Cache/Queue | Redis 7+ | Caching, rate limiting, Celery broker |
| Search Engine | Elasticsearch 8 | Full-text search, geo queries, faceted filters |
| Task Queue | Celery with Redis broker | Scraping, AI extraction, scheduling |
| AI/ML | OpenAI API / local models | PDF extraction, OCR, entity recognition |
| Storage | S3-compatible (MinIO local) | PDF/image storage |
| Monitoring | Prometheus + Grafana | Metrics, alerting, dashboards |

---

## Prerequisites

| Tool | Minimum Version | Notes |
|------|----------------|-------|
| Python | 3.11+ | Backend API and workers |
| Node.js | 18+ | Admin panel and mobile tooling |
| PostgreSQL | 15+ | With PostGIS extension |
| Redis | 7+ | Cache and Celery broker |
| Elasticsearch | 8.x | Search engine |
| Docker | 24+ | For containerized development |
| Docker Compose | 2.20+ | Multi-service orchestration |

Optional:
- **Tesseract OCR** 5+ for local OCR processing
- **poppler-utils** for PDF rendering
- **GDAL** for advanced geospatial operations

---

## Repository Structure

```
Property-Auction-app/
├── README.md
├── docker-compose.yml
├── .env.example
├── .gitignore
├── docs/
│   ├── PRD.md
│   ├── ARCHITECTURE.md
│   ├── DATABASE_SCHEMA.md
│   ├── API_DESIGN.md
│   └── MONETIZATION.md
├── backend/                    # FastAPI application
│   ├── app/
│   │   ├── main.py
│   │   ├── config.py
│   │   ├── models/            # SQLAlchemy models
│   │   ├── schemas/           # Pydantic schemas
│   │   ├── api/               # Route handlers
│   │   │   ├── v1/
│   │   │   │   ├── auth.py
│   │   │   │   ├── properties.py
│   │   │   │   ├── search.py
│   │   │   │   ├── alerts.py
│   │   │   │   └── admin.py
│   │   ├── services/          # Business logic
│   │   ├── repositories/      # Data access layer
│   │   ├── workers/           # Celery tasks
│   │   │   ├── scrapers/
│   │   │   ├── extractors/
│   │   │   └── schedulers/
│   │   └── utils/
│   ├── alembic/               # Database migrations
│   ├── tests/
│   ├── requirements.txt
│   └── Dockerfile
├── admin/                      # Next.js admin panel
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   ├── lib/
│   │   └── hooks/
│   ├── package.json
│   └── Dockerfile
└── mobile/                     # React Native app
    ├── src/
    │   ├── screens/
    │   ├── components/
    │   ├── services/
    │   ├── store/
    │   └── navigation/
    ├── app.json
    └── package.json
```

---

## Setup Instructions

### 1. Quick Start with Docker Compose (Recommended)

```bash
# Clone the repository
git clone https://github.com/your-org/Property-Auction-app.git
cd Property-Auction-app

# Copy environment file and configure
cp .env.example .env
# Edit .env with your values (database passwords, API keys, etc.)

# Start all services
docker compose up -d

# Run database migrations
docker compose exec backend alembic upgrade head

# Seed initial data (source configurations, admin user)
docker compose exec backend python -m app.scripts.seed

# Verify services
docker compose ps
```

Services will be available at:
- **Backend API**: http://localhost:8000
- **API Docs (Swagger)**: http://localhost:8000/docs
- **Admin Panel**: http://localhost:3000
- **Elasticsearch**: http://localhost:9200
- **Redis Commander** (optional): http://localhost:8081

### 2. Backend (Manual Setup)

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Linux/macOS
# or: venv\Scripts\activate  # Windows

# Install dependencies
pip install -r requirements.txt

# Set up environment
cp ../.env.example .env
# Edit .env with local values

# Run database migrations
alembic upgrade head

# Start the API server
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

# Start Celery worker (in a separate terminal)
celery -A app.workers.celery_app worker --loglevel=info --concurrency=4

# Start Celery Beat scheduler (in a separate terminal)
celery -A app.workers.celery_app beat --loglevel=info
```

### 3. Admin Panel (Manual Setup)

```bash
cd admin

# Install dependencies
npm install

# Set up environment
cp .env.example .env.local
# Edit .env.local

# Start development server
npm run dev
# Available at http://localhost:3000
```

### 4. Mobile App (Manual Setup)

```bash
cd mobile

# Install dependencies
npm install

# Start Expo development server
npx expo start
# Scan QR code with Expo Go app on your device
```

### 5. Database Setup (Without Docker)

```sql
-- Connect to PostgreSQL as superuser
CREATE DATABASE auctionvault;
CREATE USER auctionvault_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE auctionvault TO auctionvault_user;

-- Enable extensions
\c auctionvault
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
```

---

## Environment Variables

See `.env.example` for a complete list. Key variables:

| Variable | Description | Required |
|----------|------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `REDIS_URL` | Redis connection string | Yes |
| `ELASTICSEARCH_URL` | Elasticsearch URL | Yes |
| `SECRET_KEY` | JWT signing key (min 32 chars) | Yes |
| `OPENAI_API_KEY` | OpenAI API key for AI extraction | Yes (for AI features) |
| `AWS_ACCESS_KEY_ID` | S3 access key for file storage | Yes (production) |
| `AWS_SECRET_ACCESS_KEY` | S3 secret key | Yes (production) |
| `S3_BUCKET_NAME` | S3 bucket for PDFs/images | Yes (production) |
| `SMTP_HOST` | Email server for alerts | Yes (for alerts) |
| `SENTRY_DSN` | Sentry error tracking | Recommended |

---

## Deployment Guide

### Development (Docker Compose)

```bash
docker compose up -d
```

This starts PostgreSQL, Redis, Elasticsearch, the backend API, admin panel, and Celery workers in containers. Volumes persist data across restarts.

### Staging / Production

The application is designed to be cloud-portable:

**AWS:**
- ECS Fargate or EKS for containers
- RDS PostgreSQL with PostGIS
- ElastiCache for Redis
- OpenSearch Service for Elasticsearch
- S3 for file storage
- CloudFront for CDN
- SES for transactional email

**GCP:**
- Cloud Run or GKE for containers
- Cloud SQL for PostgreSQL
- Memorystore for Redis
- Elastic Cloud for Elasticsearch
- Cloud Storage for files
- Cloud CDN

**Azure:**
- Container Apps or AKS for containers
- Azure Database for PostgreSQL
- Azure Cache for Redis
- Elasticsearch on Elastic Cloud
- Blob Storage for files
- Azure CDN

### Production Checklist

- [ ] Set strong, unique `SECRET_KEY`
- [ ] Configure SSL/TLS termination
- [ ] Set up database backups (daily, with point-in-time recovery)
- [ ] Configure Elasticsearch snapshots
- [ ] Enable rate limiting at API gateway level
- [ ] Set up monitoring (Prometheus + Grafana or cloud-native)
- [ ] Configure log aggregation
- [ ] Set up CI/CD pipeline
- [ ] Review and restrict CORS origins
- [ ] Enable WAF rules
- [ ] Set up health check endpoints
- [ ] Configure auto-scaling policies

---

## MVP Scope

The Minimum Viable Product includes:

1. **User Authentication** - Registration, login, JWT-based sessions, email verification
2. **Property Search & Filters** - Full-text search, filters by city/state/bank/property-type/price-range/auction-date
3. **Property Listing & Detail Views** - Paginated listings with map view, detailed property pages
4. **Admin Panel** - Source management, data quality review, user management
5. **Source Ingestion Pipeline** - Scrapers for top 10 bank portals and MSTC/e-auction India
6. **Daily Scheduler** - Automated daily scraping with retry logic
7. **AI-Powered Extraction** - Structured data extraction from unstructured PDFs and HTML
8. **Deduplication Engine** - Fuzzy matching to prevent duplicate listings
9. **Saved Searches & Alerts** - Save search criteria, receive email/push notifications on new matches

See `docs/PRD.md` for the complete product requirements and phased roadmap.

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit changes (`git commit -m 'Add your feature'`)
4. Push to your branch (`git push origin feature/your-feature`)
5. Open a Pull Request

Please follow the existing code style and include tests for new features.

---

## License

This project is proprietary software. All rights reserved.

License terms to be determined. Contact the project maintainers for licensing inquiries.
