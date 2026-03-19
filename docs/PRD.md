# Product Requirements Document (PRD)

## AuctionVault India - Property Auction Discovery Platform

**Version:** 1.0
**Last Updated:** 2026-03-19
**Status:** Draft

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Business Concept](#2-business-concept)
3. [Target Users](#3-target-users)
4. [MVP Scope (Phase 1)](#4-mvp-scope-phase-1)
5. [Phase 2 Features](#5-phase-2-features)
6. [Phase 3 Features](#6-phase-3-features)
7. [Data Sources Strategy](#7-data-sources-strategy)
8. [Legal and Compliance](#8-legal-and-compliance)
9. [Success Metrics](#9-success-metrics)
10. [Assumptions and Constraints](#10-assumptions-and-constraints)

---

## 1. Executive Summary

AuctionVault India is a property auction discovery platform that aggregates, structures, and surfaces auction property listings from banks, NBFCs, government bodies, and e-auction portals across India. The platform targets real estate investors, bargain property buyers, legal professionals, and institutional buyers who currently spend hours manually checking fragmented sources.

The Indian distressed asset and auction property market is valued at over INR 9 lakh crore (USD ~108 billion) with banks holding significant NPAs. Despite the scale, there is no single platform that provides comprehensive, timely, and structured access to auction listings. AuctionVault fills this gap.

**Core value proposition:** Save users 10-20 hours per week by providing a unified, searchable, alert-driven interface for all Indian property auctions.

---

## 2. Business Concept

### The Problem

- Property auction data in India is scattered across 100+ bank websites, government portals, newspaper classifieds, and e-auction platforms.
- Listings are published in inconsistent formats: some as HTML pages, many as PDF notices, some as scanned images.
- No standardized structure: property type, reserve price, auction date, location, and encumbrance details are buried in unstructured text.
- Listings are time-sensitive (auction dates pass quickly) and updated irregularly.
- Professional buyers employ teams of people just to monitor sources.

### The Solution

AuctionVault provides:

1. **Automated Data Collection** - Scrapers and ingestion pipelines that monitor 50+ sources daily
2. **AI-Powered Extraction** - NLP and OCR to extract structured data from PDFs, images, and HTML
3. **Intelligent Deduplication** - Same property listed by multiple sources is merged into a single enriched listing
4. **Unified Search** - Full-text search with filters for location, property type, price range, auction date, bank, and more
5. **Alerts & Notifications** - Email and push notifications when new properties match saved criteria
6. **Map-Based Discovery** - Geospatial visualization of auction properties
7. **Admin Quality Control** - Human-in-the-loop verification for AI-extracted data

### Revenue Model (Summary)

- Freemium model with paid tiers for advanced features
- Premium subscriptions (INR 999-9,999/month)
- Lead marketplace for legal/financial service providers
- API access for institutional clients
- See `MONETIZATION.md` for detailed breakdown

---

## 3. Target Users

### Primary Users

| Persona | Description | Key Needs |
|---------|------------|-----------|
| **Individual Investor** | Looks for below-market properties for personal use or rental income. Budget INR 20L-2Cr. | Simple search, price alerts, property details, auction process guidance |
| **Professional Investor / Flipper** | Buys multiple auction properties per year. Budget INR 50L-10Cr. | Bulk search, historical price data, area analytics, fast alerts |
| **Legal Professional** | Advocates, recovery agents handling SARFAESI/DRT proceedings. | Case tracking, document access, notice timelines, court order references |
| **Institutional Buyer (ARC/Fund)** | Asset reconstruction companies and distressed asset funds. | API access, bulk data, portfolio analytics, due diligence tools |

### Secondary Users

| Persona | Description | Key Needs |
|---------|------------|-----------|
| **Bank NPM Officer** | Bank officials managing NPA portfolio and auction processes. | Benchmark pricing, market comparables, competitor auction tracking |
| **Property Valuers** | Valuers who need auction price data for appraisals. | Historical sale prices, area-wise trends |
| **Channel Partners** | Real estate brokers who assist auction buyers. | Lead generation, client matching, commission tracking |

---

## 4. MVP Scope (Phase 1)

**Timeline:** 12 weeks
**Goal:** Launch with core search and discovery features, covering top 10 bank sources and 2 e-auction platforms.

### 4.1 User Authentication

| Feature | Details |
|---------|---------|
| Registration | Email + password, mobile number (optional) |
| Login | Email/password, OTP via SMS (optional) |
| Session management | JWT tokens with refresh rotation |
| Email verification | Required before accessing alerts |
| Password reset | Email-based reset flow |
| Profile management | Name, preferred cities, property type preferences |
| OAuth (deferred) | Google/Facebook login in Phase 2 |

### 4.2 Property Search & Filters

| Feature | Details |
|---------|---------|
| Full-text search | Search across property title, description, address, bank name |
| Location filter | State, city, locality (hierarchical) |
| Property type filter | Residential (flat, house, plot), Commercial (shop, office, warehouse), Industrial, Agricultural |
| Price range filter | Min-max reserve price slider |
| Auction date filter | Date range picker, "upcoming this week/month" shortcuts |
| Bank/institution filter | Multi-select with bank logos |
| Status filter | Upcoming, ongoing, completed, cancelled |
| Sort options | By date (newest first), price (low-high, high-low), relevance |
| Pagination | 20 results per page with infinite scroll on mobile |
| Map view | Property pins on map with clustering at zoom levels |

### 4.3 Property Listing & Detail Views

**Listing Card:**
- Property title (auto-generated from type + location)
- Reserve price (INR formatted)
- Auction date and time
- Property type badge
- Bank/institution logo
- City and state
- Thumbnail image (if available)
- "Save" / "Set Alert" quick actions

**Detail Page:**
- All listing card fields plus:
- Full address with map pin
- Property area (sq ft / sq m / acres)
- Borrower name (if public)
- EMD (Earnest Money Deposit) amount and deadline
- Bid increment amount
- Inspection dates
- Contact details (authorized officer)
- Source URL (link to original listing)
- Source PDF/document viewer
- Related properties (same area / same bank)
- Auction status timeline
- "Share" functionality

### 4.4 Admin Panel

| Feature | Details |
|---------|---------|
| Dashboard | Source health, ingestion stats, data quality scores |
| Source management | Add/edit/disable scraping sources, configure scraping schedules |
| Listing review | Queue for human review of AI-extracted data, approve/reject/edit |
| User management | View users, manage roles, handle reports |
| Data quality | Duplicate detection review, field completeness metrics |
| System logs | Scraper run logs, error logs, performance metrics |

### 4.5 Source Ingestion Pipeline

**MVP Sources (Top 10):**

| # | Source | Type | Format |
|---|--------|------|--------|
| 1 | SBI (sbi.co.in) | Bank portal | HTML + PDF |
| 2 | PNB (pnb.co.in) | Bank portal | HTML + PDF |
| 3 | Bank of Baroda | Bank portal | HTML |
| 4 | HDFC Bank | Bank portal | PDF |
| 5 | ICICI Bank | Bank portal | HTML + PDF |
| 6 | Union Bank of India | Bank portal | HTML |
| 7 | Canara Bank | Bank portal | PDF |
| 8 | Bank of India | Bank portal | HTML + PDF |
| 9 | MSTC e-Auction | E-auction platform | HTML |
| 10 | e-Auction India (eauction.gov.in) | Govt e-auction | HTML |

**Ingestion Pipeline Steps:**
1. Scheduler triggers scraper at configured interval (default: daily 6 AM IST)
2. Scraper fetches pages/PDFs from source
3. Raw data stored in `raw_listings` table with source metadata
4. AI extraction pipeline processes raw data into structured fields
5. Deduplication engine checks against existing listings
6. New/updated listings indexed in Elasticsearch
7. Alert engine checks saved searches and sends notifications

### 4.6 Daily Scheduler

| Feature | Details |
|---------|---------|
| Cron-based scheduling | Celery Beat with configurable per-source schedules |
| Retry logic | 3 retries with exponential backoff (1min, 5min, 15min) |
| Source health monitoring | Track success/failure rates, auto-disable after 5 consecutive failures |
| Manual trigger | Admin can trigger scraping for any source on demand |
| Concurrency control | Max 3 concurrent scrapers to avoid IP blocking |
| Rate limiting | Per-source configurable request rate (default: 1 req/2 sec) |

### 4.7 AI-Powered Extraction

| Feature | Details |
|---------|---------|
| HTML extraction | DOM-based extraction with source-specific selectors + LLM fallback |
| PDF text extraction | pdfplumber / PyMuPDF for text-based PDFs |
| OCR extraction | Tesseract OCR for scanned/image PDFs |
| Entity extraction | LLM-based extraction of: property type, address, area, price, dates, bank name, borrower, contact details |
| Confidence scoring | Each extracted field gets a confidence score (0-1) |
| Low-confidence queue | Fields with confidence < 0.7 flagged for human review |
| Prompt templates | Source-specific prompt templates for better extraction accuracy |

### 4.8 Deduplication Engine

| Feature | Details |
|---------|---------|
| Exact match | Match on combination of bank + property_address + auction_date |
| Fuzzy match | Trigram similarity on address (threshold > 0.7) + same bank + date within 7 days |
| Merge strategy | Keep earliest source as primary, merge additional data from duplicates |
| Manual override | Admin can manually merge/split detected duplicates |
| Dedup scoring | Each potential duplicate pair gets a similarity score |

### 4.9 Saved Searches & Alerts

| Feature | Details |
|---------|---------|
| Save search | Save current search filters as a named saved search |
| Alert frequency | Real-time (immediate), daily digest, weekly digest |
| Alert channels | Email (MVP), push notification (MVP), SMS (Phase 2) |
| Alert management | View, edit, pause, delete saved searches |
| Match count | Show number of new matches since last check |
| Unsubscribe | One-click unsubscribe from email alerts |
| Free tier limit | Max 3 saved searches |

---

## 5. Phase 2 Features

**Timeline:** Weeks 13-24 (post-MVP)

### 5.1 Premium Subscriptions

- Tiered subscription plans (Basic, Professional, Enterprise)
- Unlimited saved searches and alerts
- Historical auction data access (12+ months)
- Advanced filters (carpet area, floor, facing, encumbrance status)
- Priority alert delivery
- Ad-free experience
- Razorpay/Stripe payment integration

### 5.2 Analytics Dashboard

- Area-wise price trends (average reserve price over time)
- Bank-wise auction volume trends
- Success rate analytics (sold vs. unsold)
- Price discount analysis (reserve price vs. market value estimate)
- Seasonal patterns in auction listings

### 5.3 Export & Reports

- Export search results to CSV/Excel
- Generate PDF reports for shortlisted properties
- Bulk download of property documents
- Custom report builder for institutional clients

### 5.4 API Access

- RESTful API for programmatic access
- API key management
- Usage-based pricing (per-request)
- Webhook support for real-time listing updates
- SDKs for Python and JavaScript

### 5.5 Enhanced Authentication

- Google and Facebook OAuth
- Two-factor authentication
- Organization accounts with team management

### 5.6 Additional Sources

- Expand to 30+ bank sources
- NBFC notices (Bajaj Finance, Tata Capital, etc.)
- DRT tribunal notices
- Major newspaper classifieds (TOI, Hindu, Economic Times)

---

## 6. Phase 3 Features

**Timeline:** Weeks 25-40

### 6.1 Lead Marketplace

- Connect auction property buyers with:
  - Property lawyers specializing in SARFAESI/DRT
  - Property valuers and inspectors
  - Home loan providers for auction purchases
  - Title search and due diligence firms
- Revenue: Commission per successful referral (INR 500-5,000)
- Rating and review system for service providers

### 6.2 Investment Heatmaps

- Geographic heatmaps showing auction activity density
- Overlay with:
  - Property price trends (from registration data where available)
  - Infrastructure development projects
  - Metro/highway proximity
  - Rental yield estimates
- Interactive drill-down from state to city to locality level

### 6.3 Investment Scoring

- AI-driven score (1-100) for each property based on:
  - Discount to estimated market value
  - Location desirability index
  - Property type demand score
  - Legal complexity assessment
  - Historical resale performance in the area
  - Rental yield potential
- Customizable scoring weights per user preference
- Portfolio tracking for purchased properties

### 6.4 Community Features

- Discussion forums per property/area
- Expert Q&A with verified legal professionals
- Auction experience sharing and reviews
- Due diligence checklists and guides

### 6.5 Loan Assistance

- Pre-approved loan offers for auction properties
- EMI calculator with auction-specific terms
- Partner bank integrations for in-app loan applications

---

## 7. Data Sources Strategy

### 7.1 Source Categories

| Category | Examples | Volume Estimate | Format |
|----------|---------|----------------|--------|
| Public Sector Banks | SBI, PNB, BOB, BOI, Canara, Union, Indian Bank, etc. (12 banks) | ~5,000 listings/month | HTML + PDF |
| Private Sector Banks | HDFC, ICICI, Axis, Kotak, IndusInd, Yes Bank, etc. (8 banks) | ~3,000 listings/month | HTML + PDF |
| E-Auction Platforms | MSTC, e-Auction India, C1 India, auction tiger | ~4,000 listings/month | HTML |
| NBFCs | Bajaj Finance, Tata Capital, Muthoot, Manappuram, IIFL | ~2,000 listings/month | PDF + newspaper ads |
| Government / DRT | DRT tribunal sites, state govt revenue dept, municipal corporation | ~1,000 listings/month | PDF + gazette |
| Newspaper Classifieds | Times of India, Hindu, Economic Times, regional papers | ~3,000 listings/month | Scanned images + text |

**Total estimated volume:** ~18,000 new listings per month at scale.

### 7.2 Ingestion Approaches

| Approach | When Used | Tools |
|----------|----------|-------|
| HTML Scraping | Structured web pages with listing tables | Scrapy, BeautifulSoup, Playwright (for JS-rendered pages) |
| PDF Download + Extraction | Bank SARFAESI notices, tender documents | Requests + pdfplumber + LLM extraction |
| OCR Pipeline | Scanned PDF notices, newspaper ad images | Tesseract + image preprocessing + LLM extraction |
| RSS/API Feeds | E-auction platforms with feeds | httpx + feed parsers |
| Email Monitoring | Bank mailing lists, gazette subscriptions | IMAP client + attachment extraction |

### 7.3 Data Quality Measures

- **Confidence scoring:** Every extracted field gets a confidence score
- **Human review queue:** Low-confidence extractions routed to admin review
- **Source reliability tracking:** Per-source accuracy metrics tracked over time
- **User feedback loop:** Users can report incorrect data, which feeds back into extraction improvement
- **Periodic revalidation:** Active listings re-scraped to detect updates/cancellations

---

## 8. Legal and Compliance

### 8.1 Key Legal Considerations

| Area | Status | Notes |
|------|--------|-------|
| Web scraping legality | Generally permissible for public data in India | Respect robots.txt, no login bypass, reasonable rate limits |
| Personal data (borrower names) | Sensitive | Only display if already public in bank notices. Follow IT Act 2000 and DPDP Act 2023 guidelines |
| Copyright on notices | Fair use / public interest | Bank auction notices are statutory requirements under SARFAESI Act - considered public information |
| Data Protection (DPDP Act 2023) | Applicable | User data handling must comply with Digital Personal Data Protection Act |
| SARFAESI Act 2002 | Reference | Bank auction notices are published under statutory mandate - strong argument for public data aggregation |
| IT Act 2000 | Applicable | Standard compliance for digital platforms |

### 8.2 Compliance Flags

- [ ] Privacy policy covering data collection, storage, and sharing
- [ ] Terms of service with clear disclaimers about data accuracy
- [ ] Cookie consent for web properties
- [ ] DPDP Act compliance: consent management, data principal rights, grievance officer
- [ ] Right to erasure implementation for user accounts
- [ ] Data retention policy (auto-delete completed auctions after 24 months)
- [ ] Disclaimers that platform does not provide legal/financial advice
- [ ] Clear attribution to original data sources

### 8.3 Assumptions

1. Public auction notices published by banks under SARFAESI Act are public information and can be aggregated.
2. We will not bypass any login walls or CAPTCHAs to access data.
3. We will respect robots.txt directives and maintain reasonable scraping rates.
4. Borrower personal information beyond what is in the public notice will not be collected or displayed.
5. The platform acts as an information aggregator, not a participant in the auction process.
6. All property data is provided "as-is" with appropriate disclaimers.

---

## 9. Success Metrics

### MVP (Phase 1) KPIs

| Metric | Target | Measurement |
|--------|--------|-------------|
| Sources integrated | 10+ | Count of active scraping sources |
| Listings ingested | 5,000+ | Total listings in database |
| Data accuracy | > 90% | Spot-check sample of 100 listings/week |
| Registered users | 1,000 | Within 4 weeks of launch |
| Daily active users | 200 | Within 8 weeks of launch |
| Search-to-detail conversion | > 30% | Users who view a detail page after searching |
| Alert activation rate | > 20% | Registered users who create at least 1 saved search |
| Page load time (P95) | < 2 seconds | For search results page |
| Uptime | > 99.5% | Monthly uptime percentage |

### Phase 2 KPIs

| Metric | Target |
|--------|--------|
| Paid subscribers | 500 within 3 months |
| MRR (Monthly Recurring Revenue) | INR 5,00,000 |
| Sources integrated | 30+ |
| Listings ingested | 15,000+ per month |
| API customers | 10 institutional clients |

---

## 10. Assumptions and Constraints

### Assumptions

1. Bank websites will remain publicly accessible without significant structural changes for at least 6 months between major redesigns.
2. Users are comfortable with English-language interface (Hindi and regional languages in future phases).
3. Mobile-first usage pattern: 70% mobile, 30% desktop.
4. Average user checks the platform 3-5 times per week.
5. AI extraction accuracy will improve over time as we build training data from human review corrections.

### Constraints

1. **Budget:** Bootstrapped/seed stage. Infrastructure cost must stay under INR 50,000/month for MVP.
2. **Team:** 2-3 full-stack developers, 1 data engineer, 1 product designer.
3. **Timeline:** 12 weeks to MVP launch.
4. **Scraping resilience:** Bank websites may change structure without notice; scrapers need quick adaptation.
5. **AI costs:** LLM API costs for extraction must be managed (target < INR 1 per listing extraction).
6. **Data freshness:** Listings must be no more than 24 hours old for upcoming auctions.

---

*This PRD is a living document and will be updated as the product evolves through validation and user feedback.*
