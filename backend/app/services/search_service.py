"""Elasticsearch indexing and search service for auction properties."""
from typing import Optional, Any

import structlog
from elasticsearch import AsyncElasticsearch

from app.config import settings

logger = structlog.get_logger()

INDEX_NAME = "auction_properties"

INDEX_MAPPING = {
    "mappings": {
        "properties": {
            "id": {"type": "keyword"},
            "title": {"type": "text", "analyzer": "standard"},
            "description": {"type": "text", "analyzer": "standard"},
            "bank_name": {"type": "keyword"},
            "property_type": {"type": "keyword"},
            "property_subtype": {"type": "keyword"},
            "city": {"type": "keyword"},
            "state": {"type": "keyword"},
            "district": {"type": "keyword"},
            "pin_code": {"type": "keyword"},
            "address": {"type": "text"},
            "reserve_price": {"type": "float"},
            "emd_amount": {"type": "float"},
            "auction_date": {"type": "date"},
            "area_sqft": {"type": "float"},
            "status": {"type": "keyword"},
            "possession_status": {"type": "keyword"},
            "created_at": {"type": "date"},
            "location": {"type": "geo_point"},
        }
    }
}


class SearchService:
    def __init__(self):
        self._client: Optional[AsyncElasticsearch] = None

    async def get_client(self) -> AsyncElasticsearch:
        if self._client is None:
            self._client = AsyncElasticsearch(hosts=[settings.ELASTICSEARCH_URL])
        return self._client

    async def ensure_index(self):
        """Create the index if it doesn't exist."""
        client = await self.get_client()
        exists = await client.indices.exists(index=INDEX_NAME)
        if not exists:
            await client.indices.create(index=INDEX_NAME, body=INDEX_MAPPING)
            logger.info("elasticsearch_index_created", index=INDEX_NAME)

    async def index_property(self, property_data: dict):
        """Index a single property document."""
        client = await self.get_client()
        doc_id = property_data.get("id")
        body = {k: v for k, v in property_data.items() if v is not None}

        # Build geo_point if lat/lon available
        lat = body.pop("latitude", None)
        lon = body.pop("longitude", None)
        if lat and lon:
            body["location"] = {"lat": lat, "lon": lon}

        await client.index(index=INDEX_NAME, id=doc_id, body=body)

    async def bulk_index(self, properties: list[dict]):
        """Bulk index multiple property documents."""
        client = await self.get_client()
        actions = []
        for prop in properties:
            doc_id = prop.get("id")
            actions.append({"index": {"_index": INDEX_NAME, "_id": doc_id}})
            body = {k: v for k, v in prop.items() if v is not None}
            lat = body.pop("latitude", None)
            lon = body.pop("longitude", None)
            if lat and lon:
                body["location"] = {"lat": lat, "lon": lon}
            actions.append(body)

        if actions:
            await client.bulk(body=actions)
            logger.info("bulk_indexed", count=len(properties))

    async def search(
        self,
        query_text: Optional[str] = None,
        filters: Optional[dict] = None,
        page: int = 1,
        page_size: int = 20,
    ) -> dict:
        """Full-text search with optional filters."""
        client = await self.get_client()

        must_clauses: list[dict[str, Any]] = []
        filter_clauses: list[dict[str, Any]] = []

        if query_text:
            must_clauses.append({
                "multi_match": {
                    "query": query_text,
                    "fields": ["title^3", "description", "address", "bank_name^2", "city^2"],
                }
            })

        if filters:
            for key, value in filters.items():
                if value is None:
                    continue
                if key in ("min_price", "max_price"):
                    range_q: dict[str, Any] = {}
                    if filters.get("min_price"):
                        range_q["gte"] = filters["min_price"]
                    if filters.get("max_price"):
                        range_q["lte"] = filters["max_price"]
                    if range_q:
                        filter_clauses.append({"range": {"reserve_price": range_q}})
                elif key in ("city", "state", "bank_name", "property_type", "status"):
                    filter_clauses.append({"term": {key: value}})

        body: dict[str, Any] = {
            "from": (page - 1) * page_size,
            "size": page_size,
            "query": {
                "bool": {
                    "must": must_clauses or [{"match_all": {}}],
                    "filter": filter_clauses,
                }
            },
            "sort": [{"auction_date": {"order": "asc"}}],
        }

        result = await client.search(index=INDEX_NAME, body=body)
        hits = result.get("hits", {})
        return {
            "total": hits.get("total", {}).get("value", 0),
            "items": [hit["_source"] for hit in hits.get("hits", [])],
        }

    async def delete_property(self, property_id: str):
        client = await self.get_client()
        await client.delete(index=INDEX_NAME, id=property_id, ignore=[404])

    async def close(self):
        if self._client:
            await self._client.close()
            self._client = None


search_service = SearchService()
