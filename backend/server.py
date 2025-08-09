from fastapi import FastAPI, APIRouter, HTTPException, status, Depends, File, UploadFile
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timedelta
import jwt
import bcrypt
from enum import Enum
import shutil
import aiofiles
import secrets
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Create uploads directory
UPLOAD_DIR = ROOT_DIR / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Secret - في بيئة الإنتاج يجب أن يكون في .env
JWT_SECRET = "haraj_syria_secret_key_2025"
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24 * 7  # أسبوع

# Create the main app without a prefix
app = FastAPI(title="Haraj Syria API", version="1.0.0")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Security
security = HTTPBearer()

# Enums
class AdStatus(str, Enum):
    ACTIVE = "active"
    PENDING = "pending"
    EXPIRED = "expired"
    REMOVED = "removed"

class AdType(str, Enum):
    FREE = "free"
    FEATURED = "featured"
    PREMIUM = "premium"

# Models
class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    phone: str = Field(..., min_length=7, max_length=20)  # Flexible phone validation for different countries
    country: str
    city: str
    password_hash: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    is_active: bool = True
    is_verified: bool = False

class UserCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    phone: str = Field(..., min_length=7, max_length=20)  # Flexible phone validation for different countries
    country: str
    city: str
    password: str = Field(..., min_length=6)

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class ForgotPasswordRequest(BaseModel):
    email: EmailStr
    method: str = Field(..., description="email or sms")

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str = Field(..., min_length=8)

class PasswordResetToken(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    token: str
    method: str  # "email" or "sms"
    expires_at: datetime = Field(default_factory=lambda: datetime.utcnow() + timedelta(hours=1))
    is_used: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)

class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    phone: str
    country: str
    city: str
    created_at: datetime
    is_active: bool

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class Category(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name_ar: str
    name_en: str
    parent_id: Optional[str] = None
    subcategories: Optional[List[str]] = []
    is_active: bool = True
    sort_order: int = 0

class Ad(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str = Field(..., min_length=5, max_length=200)
    description: str = Field(..., min_length=10, max_length=2000)
    price: float = Field(..., ge=0)
    currency: str = "USD"
    category_id: str
    subcategory_id: Optional[str] = None
    user_id: str
    country: str
    city: str
    area: Optional[str] = None
    images: List[str] = []
    contact_phone: str
    contact_whatsapp: Optional[str] = None
    status: AdStatus = AdStatus.PENDING
    ad_type: AdType = AdType.FREE
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    expires_at: datetime = Field(default_factory=lambda: datetime.utcnow() + timedelta(days=30))
    views: int = 0
    # خصائص إضافية للسيارات
    car_brand: Optional[str] = None
    car_model: Optional[str] = None
    car_year: Optional[int] = None
    car_mileage: Optional[int] = None
    car_condition: Optional[str] = None

class AdCreate(BaseModel):
    title: str = Field(..., min_length=5, max_length=200)
    description: str = Field(..., min_length=10, max_length=2000)
    price: float = Field(..., ge=0)
    currency: str = "USD"
    category_id: str
    subcategory_id: Optional[str] = None
    country: str
    city: str
    area: Optional[str] = None
    contact_phone: str
    contact_whatsapp: Optional[str] = None
    ad_type: AdType = AdType.FREE
    # خصائص إضافية للسيارات
    car_brand: Optional[str] = None
    car_model: Optional[str] = None
    car_year: Optional[int] = None
    car_mileage: Optional[int] = None
    car_condition: Optional[str] = None

class AdApprovalSettings(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    auto_approve_free: bool = False
    auto_approve_featured: bool = False
    auto_approve_premium: bool = False
    require_approval_for_new_users: bool = True
    require_approval_days: int = 30  # New users need approval for X days
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class AdUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    status: Optional[AdStatus] = None

class AdResponse(BaseModel):
    id: str
    title: str
    description: str
    price: float
    currency: str
    category_id: str
    subcategory_id: Optional[str]
    country: str
    city: str

