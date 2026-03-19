import pytest
from httpx import AsyncClient
from app.models.property import AuctionProperty


@pytest.mark.asyncio
async def test_list_properties(client: AsyncClient, sample_property: AuctionProperty):
    response = await client.get("/api/v1/properties")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] >= 1
    assert len(data["items"]) >= 1


@pytest.mark.asyncio
async def test_filter_by_city(client: AsyncClient, sample_property: AuctionProperty):
    response = await client.get("/api/v1/properties", params={"city": "Mumbai"})
    assert response.status_code == 200
    data = response.json()
    assert data["total"] >= 1
    for item in data["items"]:
        assert "Mumbai" in (item["city"] or "")


@pytest.mark.asyncio
async def test_filter_by_price_range(client: AsyncClient, sample_property: AuctionProperty):
    response = await client.get(
        "/api/v1/properties",
        params={"min_price": 5000000, "max_price": 10000000},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["total"] >= 1


@pytest.mark.asyncio
async def test_filter_by_bank(client: AsyncClient, sample_property: AuctionProperty):
    response = await client.get(
        "/api/v1/properties",
        params={"bank_name": "State Bank"},
    )
    assert response.status_code == 200
    assert response.json()["total"] >= 1


@pytest.mark.asyncio
async def test_get_property_detail(client: AsyncClient, sample_property: AuctionProperty):
    response = await client.get(f"/api/v1/properties/{sample_property.id}")
    assert response.status_code == 200
    data = response.json()
    assert data["bank_name"] == "State Bank of India"
    assert data["city"] == "Mumbai"


@pytest.mark.asyncio
async def test_get_property_not_found(client: AsyncClient):
    response = await client.get("/api/v1/properties/00000000-0000-0000-0000-000000000000")
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_trending(client: AsyncClient, sample_property: AuctionProperty):
    response = await client.get("/api/v1/properties/trending")
    assert response.status_code == 200
    data = response.json()
    assert "top_cities" in data
    assert "top_banks" in data


@pytest.mark.asyncio
async def test_recent(client: AsyncClient, sample_property: AuctionProperty):
    response = await client.get("/api/v1/properties/recent")
    assert response.status_code == 200
    assert isinstance(response.json(), list)
