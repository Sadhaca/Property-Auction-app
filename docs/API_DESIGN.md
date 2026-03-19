# API Design - AuctionProp

Base URL: `/api/v1`

## Authentication

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | /auth/register | User registration | Public |
| POST | /auth/login | Login, returns JWT | Public |
| GET | /auth/me | Current user profile | User |
| PUT | /auth/me | Update profile | User |

## Properties

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /properties | List with filters & pagination | User |
| GET | /properties/{id} | Property detail | User |
| GET | /properties/recent | Recently added | User |
| GET | /properties/trending | Trending cities/banks/volumes | User |

### Filter Query Parameters
```
state, city, district, pin_code, bank_name,
property_type, property_subtype,
min_price, max_price, min_emd, max_emd,
auction_date_from, auction_date_to,
min_area, max_area, possession_status,
status, source_id, search (text query),
sort_by (latest|auction_date|price_asc|price_desc|relevance),
page, page_size
```

## Saved Searches

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | /saved-searches | Create saved search | User |
| GET | /saved-searches | List user's saved searches | User |
| PUT | /saved-searches/{id} | Update | User |
| DELETE | /saved-searches/{id} | Delete | User |
| POST | /saved-searches/{id}/alert | Toggle alert | User |

## Favorites

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | /favorites | Add favorite | User |
| GET | /favorites | List favorites | User |
| DELETE | /favorites/{property_id} | Remove favorite | User |

## Enquiries

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | /enquiries | Submit enquiry | User |
| GET | /enquiries | List (admin: all, user: own) | User |

## Admin - Sources

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /admin/sources | List all sources | Admin |
| POST | /admin/sources | Create source | Admin |
| PUT | /admin/sources/{id} | Update source | Admin |
| DELETE | /admin/sources/{id} | Delete source | Admin |
| POST | /admin/sources/{id}/trigger | Manual trigger | Admin |
| GET | /admin/sources/{id}/jobs | Source job history | Admin |

## Admin - Ingestion

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /admin/ingestion/jobs | List ingestion jobs | Admin |
| GET | /admin/ingestion/jobs/{id}/logs | Job logs | Admin |
| GET | /admin/ingestion/summary | Daily summary | Admin |

## Admin - Users

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /admin/users | List users | Admin |
| PUT | /admin/users/{id}/role | Change role | Admin |
| PUT | /admin/users/{id}/status | Activate/deactivate | Admin |

## Admin - Dashboard

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /admin/dashboard/stats | Overview stats | Admin |
| GET | /admin/dashboard/data-quality | Quality metrics | Admin |

## Admin - Audit

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /admin/audit-logs | Audit trail | Admin |

## Response Format

```json
{
  "items": [...],
  "total": 100,
  "page": 1,
  "page_size": 20,
  "total_pages": 5
}
```

## Error Format

```json
{
  "detail": "Error message",
  "code": "ERROR_CODE"
}
```
