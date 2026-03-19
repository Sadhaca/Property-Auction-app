import uuid
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field


class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    full_name: str = Field(min_length=1, max_length=255)
    phone: Optional[str] = None


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None


class UserResponse(BaseModel):
    id: uuid.UUID
    email: str
    phone: Optional[str] = None
    full_name: str
    role: str
    is_active: bool
    subscription_plan_id: Optional[uuid.UUID] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenPayload(BaseModel):
    sub: str
    role: str
    exp: Optional[int] = None
