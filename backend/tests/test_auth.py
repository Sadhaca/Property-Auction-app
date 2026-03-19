import pytest
from httpx import AsyncClient
from app.models.user import User


@pytest.mark.asyncio
async def test_register(client: AsyncClient):
    response = await client.post(
        "/api/v1/auth/register",
        json={
            "email": "newuser@example.com",
            "password": "SecurePass123",
            "full_name": "New User",
        },
    )
    assert response.status_code == 201
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"


@pytest.mark.asyncio
async def test_register_duplicate_email(client: AsyncClient, test_user: User):
    response = await client.post(
        "/api/v1/auth/register",
        json={
            "email": "testuser@example.com",
            "password": "AnotherPass123",
            "full_name": "Duplicate User",
        },
    )
    assert response.status_code == 400
    assert "already registered" in response.json()["detail"]


@pytest.mark.asyncio
async def test_login_success(client: AsyncClient, test_user: User):
    response = await client.post(
        "/api/v1/auth/login",
        json={"email": "testuser@example.com", "password": "TestPass123"},
    )
    assert response.status_code == 200
    assert "access_token" in response.json()


@pytest.mark.asyncio
async def test_login_wrong_password(client: AsyncClient, test_user: User):
    response = await client.post(
        "/api/v1/auth/login",
        json={"email": "testuser@example.com", "password": "WrongPass"},
    )
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_get_me(client: AsyncClient, test_user: User, user_token: str):
    response = await client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {user_token}"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "testuser@example.com"
    assert data["full_name"] == "Test User"


@pytest.mark.asyncio
async def test_get_me_no_token(client: AsyncClient):
    response = await client.get("/api/v1/auth/me")
    assert response.status_code == 403


@pytest.mark.asyncio
async def test_update_me(client: AsyncClient, test_user: User, user_token: str):
    response = await client.put(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {user_token}"},
        json={"full_name": "Updated Name", "phone": "9876543210"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["full_name"] == "Updated Name"
    assert data["phone"] == "9876543210"
