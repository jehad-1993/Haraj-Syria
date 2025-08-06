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
    phone: str = Field(..., min_length=10, max_length=20)
    country: str
    city: str
    password_hash: str = Field(exclude=True, default="")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    is_active: bool = True
    is_verified: bool = False

class UserCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    phone: str = Field(..., min_length=10, max_length=20)
    country: str
    city: str
    password: str = Field(..., min_length=6)

class UserLogin(BaseModel):
    email: EmailStr
    password: str

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
    area: Optional[str]
    images: List[str]
    contact_phone: str
    contact_whatsapp: Optional[str]
    status: AdStatus
    ad_type: AdType
    created_at: datetime
    views: int
    user_name: Optional[str] = None
    # خصائص السيارات
    car_brand: Optional[str] = None
    car_model: Optional[str] = None
    car_year: Optional[int] = None
    car_mileage: Optional[int] = None
    car_condition: Optional[str] = None

# Utility functions
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(hours=JWT_EXPIRATION_HOURS)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)
    return encoded_jwt

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    user_doc = await db.users.find_one({"id": user_id})
    if user_doc is None:
        raise HTTPException(status_code=401, detail="User not found")
    
    # Create User object with password_hash included
    return User(**user_doc)

# Data constants
ARAB_COUNTRIES = {
    "SA": {"name_ar": "السعودية", "name_en": "Saudi Arabia"},
    "AE": {"name_ar": "الإمارات", "name_en": "UAE"},
    "KW": {"name_ar": "الكويت", "name_en": "Kuwait"},
    "QA": {"name_ar": "قطر", "name_en": "Qatar"},
    "BH": {"name_ar": "البحرين", "name_en": "Bahrain"},
    "OM": {"name_ar": "عمان", "name_en": "Oman"},
    "JO": {"name_ar": "الأردن", "name_en": "Jordan"},
    "LB": {"name_ar": "لبنان", "name_en": "Lebanon"},
    "SY": {"name_ar": "سوريا", "name_en": "Syria"},
    "IQ": {"name_ar": "العراق", "name_en": "Iraq"},
    "EG": {"name_ar": "مصر", "name_en": "Egypt"},
    "LY": {"name_ar": "ليبيا", "name_en": "Libya"},
    "TN": {"name_ar": "تونس", "name_en": "Tunisia"},
    "DZ": {"name_ar": "الجزائر", "name_en": "Algeria"},
    "MA": {"name_ar": "المغرب", "name_en": "Morocco"},
    "YE": {"name_ar": "اليمن", "name_en": "Yemen"},
    "SD": {"name_ar": "السودان", "name_en": "Sudan"}
}

# Subcategories for all main categories
SUBCATEGORIES = {
    "cars": {
        "name_ar": "سيارات",
        "name_en": "Cars", 
        "subcategories": [
            {"name_ar": "سيارات سيدان", "name_en": "Sedan Cars"},
            {"name_ar": "سيارات صالون", "name_en": "Sedans"},
            {"name_ar": "سيارات دفع رباعي", "name_en": "SUVs"},
            {"name_ar": "سيارات رياضية", "name_en": "Sports Cars"},
            {"name_ar": "سيارات اقتصادية", "name_en": "Economy Cars"},
            {"name_ar": "شاحنات صغيرة", "name_en": "Pickup Trucks"},
            {"name_ar": "فانات", "name_en": "Vans"},
            {"name_ar": "دراجات نارية", "name_en": "Motorcycles"},
            {"name_ar": "قطع غيار", "name_en": "Auto Parts"},
            {"name_ar": "أخرى", "name_en": "Others"}
        ]
    },
    "real_estate": {
        "name_ar": "عقارات",
        "name_en": "Real Estate",
        "subcategories": [
            {"name_ar": "شقق للبيع", "name_en": "Apartments for Sale"},
            {"name_ar": "شقق للإيجار", "name_en": "Apartments for Rent"},
            {"name_ar": "فلل للبيع", "name_en": "Villas for Sale"},
            {"name_ar": "فلل للإيجار", "name_en": "Villas for Rent"},
            {"name_ar": "أراضي", "name_en": "Land"},
            {"name_ar": "محلات تجارية", "name_en": "Commercial Stores"},
            {"name_ar": "مكاتب", "name_en": "Offices"},
            {"name_ar": "مستودعات", "name_en": "Warehouses"},
            {"name_ar": "أخرى", "name_en": "Others"}
        ]
    },
    "electronics": {
        "name_ar": "إلكترونيات",
        "name_en": "Electronics",
        "subcategories": [
            {"name_ar": "جوالات وهواتف", "name_en": "Mobile Phones"},
            {"name_ar": "أجهزة كمبيوتر", "name_en": "Computers"},
            {"name_ar": "لابتوب", "name_en": "Laptops"},
            {"name_ar": "تلفزيونات", "name_en": "TVs"},
            {"name_ar": "كاميرات", "name_en": "Cameras"},
            {"name_ar": "أجهزة صوت", "name_en": "Audio Systems"},
            {"name_ar": "ألعاب فيديو", "name_en": "Video Games"},
            {"name_ar": "إكسسوارات", "name_en": "Accessories"},
            {"name_ar": "أخرى", "name_en": "Others"}
        ]
    },
    "jobs": {
        "name_ar": "وظائف",
        "name_en": "Jobs",
        "subcategories": [
            {"name_ar": "تقنية المعلومات", "name_en": "IT"},
            {"name_ar": "طب وصحة", "name_en": "Healthcare"},
            {"name_ar": "هندسة", "name_en": "Engineering"},
            {"name_ar": "تعليم", "name_en": "Education"},
            {"name_ar": "مبيعات وتسويق", "name_en": "Sales & Marketing"},
            {"name_ar": "محاسبة ومالية", "name_en": "Accounting & Finance"},
            {"name_ar": "خدمة عملاء", "name_en": "Customer Service"},
            {"name_ar": "أخرى", "name_en": "Others"}
        ]
    },
    "furniture": {
        "name_ar": "أثاث",
        "name_en": "Furniture",
        "subcategories": [
            {"name_ar": "غرف نوم", "name_en": "Bedrooms"},
            {"name_ar": "صالات ومجالس", "name_en": "Living Rooms"},
            {"name_ar": "غرف طعام", "name_en": "Dining Rooms"},
            {"name_ar": "مطابخ", "name_en": "Kitchens"},
            {"name_ar": "مكاتب", "name_en": "Office Furniture"},
            {"name_ar": "أثاث أطفال", "name_en": "Kids Furniture"},
            {"name_ar": "أثاث حدائق", "name_en": "Garden Furniture"},
            {"name_ar": "ديكور ومفروشات", "name_en": "Decor & Furnishings"},
            {"name_ar": "أخرى", "name_en": "Others"}
        ]
    },
    "clothing": {
        "name_ar": "ملابس",
        "name_en": "Clothing",
        "subcategories": [
            {"name_ar": "ملابس رجالية", "name_en": "Men's Clothing"},
            {"name_ar": "ملابس نسائية", "name_en": "Women's Clothing"},
            {"name_ar": "ملابس أطفال", "name_en": "Kids Clothing"},
            {"name_ar": "أحذية", "name_en": "Shoes"},
            {"name_ar": "حقائب", "name_en": "Bags"},
            {"name_ar": "إكسسوارات", "name_en": "Accessories"},
            {"name_ar": "ساعات", "name_en": "Watches"},
            {"name_ar": "مجوهرات", "name_en": "Jewelry"},
            {"name_ar": "أخرى", "name_en": "Others"}
        ]
    },
    "services": {
        "name_ar": "خدمات",
        "name_en": "Services",
        "subcategories": [
            {"name_ar": "صيانة وإصلاح", "name_en": "Maintenance & Repair"},
            {"name_ar": "تنظيف", "name_en": "Cleaning"},
            {"name_ar": "تدريس خصوصي", "name_en": "Private Tutoring"},
            {"name_ar": "تصميم وبرمجة", "name_en": "Design & Programming"},
            {"name_ar": "نقل وشحن", "name_en": "Moving & Shipping"},
            {"name_ar": "خدمات طبية", "name_en": "Medical Services"},
            {"name_ar": "خدمات قانونية", "name_en": "Legal Services"},
            {"name_ar": "أخرى", "name_en": "Others"}
        ]
    },
    "others": {
        "name_ar": "أخرى",
        "name_en": "Others",
        "subcategories": [
            {"name_ar": "كتب ومجلات", "name_en": "Books & Magazines"},
            {"name_ar": "رياضة ولياقة", "name_en": "Sports & Fitness"},
            {"name_ar": "هوايات وألعاب", "name_en": "Hobbies & Games"},
            {"name_ar": "حيوانات أليفة", "name_en": "Pets"},
            {"name_ar": "موسيقى وآلات", "name_en": "Music & Instruments"},
            {"name_ar": "صحة وجمال", "name_en": "Health & Beauty"},
            {"name_ar": "أدوات ومعدات", "name_en": "Tools & Equipment"},
            {"name_ar": "متنوعة", "name_en": "Miscellaneous"}
        ]
    }
}

CITIES_BY_COUNTRY = {
    "SY": ["دمشق", "حلب", "حمص", "حماة", "اللاذقية", "طرطوس", "دير الزور", "الرقة", "السويداء", "درعا", "القنيطرة", "إدلب", "الحسكة", "القامشلي"],
    "SA": ["الرياض", "جدة", "مكة المكرمة", "المدينة المنورة", "الدمام", "الخبر", "تبوك", "بريدة", "خميس مشيط", "الأحساء", "حائل", "جيزان"],
    "AE": ["دبي", "أبوظبي", "الشارقة", "عجمان", "الفجيرة", "رأس الخيمة", "أم القيوين"],
    "EG": ["القاهرة", "الإسكندرية", "الجيزة", "شبرا الخيمة", "بورسعيد", "السويس", "الأقصر", "أسوان", "المنصورة", "طنطا"],
    "JO": ["عمان", "إربد", "الزرقاء", "الرصيفة", "وادي السير", "العقبة", "الكرك", "معان", "جرش", "عجلون"],
    "LB": ["بيروت", "طرابلس", "صيدا", "صور", "بعلبك", "جونيه", "النبطية", "زحلة", "الخيام", "البترون"],
    "IQ": ["بغداد", "البصرة", "أربيل", "الموصل", "النجف", "كربلاء", "الحلة", "الرمادي", "كركوك", "السليمانية"],
    "KW": ["مدينة الكويت", "حولي", "الفروانية", "مبارك الكبير", "الأحمدي", "الجهراء"],
    "QA": ["الدوحة", "الريان", "أم صلال", "الوكرة", "الخور", "الدعاين"],
    "BH": ["المنامة", "المحرق", "الحد", "عيسى", "الرفاع", "جدحفص"],
    "OM": ["مسقط", "صلالة", "نزوى", "صحار", "البريمي", "بوشر"],
    "MA": ["الرباط", "الدار البيضاء", "فاس", "مراكش", "أغادير", "طنجة", "مكناس", "وجدة"],
    "TN": ["تونس", "صفاقس", "سوسة", "القيروان", "بنزرت", "المنستير", "قابس", "أريانة"],
    "DZ": ["الجزائر", "وهران", "قسنطينة", "عنابة", "باتنة", "سطيف", "سيدي بلعباس", "بسكرة"],
    "LY": ["طرابلس", "بنغازي", "مصراتة", "البيضاء", "الزاوية", "سبها", "طبرق", "درنة"],
    "YE": ["صنعاء", "عدن", "تعز", "الحديدة", "إب", "ذمار", "المكلا", "لحج"],
    "SD": ["الخرطوم", "أم درمان", "بحري", "بورسودان", "كسلا", "الأبيض", "نيالا", "الفاشر"]
}

CAR_BRANDS = [
    "تويوتا", "هوندا", "نيسان", "مازدا", "سوزوكي", "ميتسوبيشي", "سوبارو", "إنفينيتي", "لكزس", "أكورا",
    "بي ام دبليو", "مرسيدس", "أودي", "فولكس واغن", "أوبل", "فولفو", "ساب", "رينو", "بيجو", "ستروين",
    "فيات", "ألفا روميو", "لانسيا", "فيراري", "لامبورغيني", "مازيراتي", "لاند روفر", "رولز رويس", "بنتلي", "جاغوار",
    "فورد", "شيفروليه", "دودج", "كرايسلر", "جي ام سي", "لينكولن", "كاديلاك", "بويك", "تسلا",
    "هيونداي", "كيا", "جينيسيس", "داو", "شيري", "جيلي", "بايك", "جريت وول", "إم جي"
]

CAR_YEARS = list(range(2010, 2051))

CAR_MODELS = {
    "تويوتا": ["كامري", "كورولا", "افالون", "راف 4", "هايلاندر", "برادو", "لاند كروزر", "هيلوكس", "يارس", "أخرى"],
    "هوندا": ["أكورد", "سيفيك", "سي ار في", "بايلوت", "أوديسي", "فيت", "سيتي", "أخرى"],
    "نيسان": ["التيما", "سنترا", "ماكسيما", "باثفايندر", "مورانو", "رينج", "تيدا", "صني", "أخرى"],
    "كيا": ["أوبتيما", "سيراتو", "ريو", "سورينتو", "سبورتاج", "كارنيفال", "بيكانتو", "أخرى"],
    "هيونداي": ["إلنترا", "سوناتا", "أزيرا", "توكسان", "سانتا في", "أكسنت", "i10", "أخرى"],
    "مرسيدس": ["C-Class", "E-Class", "S-Class", "GLC", "GLE", "GLS", "A-Class", "أخرى"],
    "بي ام دبليو": ["سلسلة 3", "سلسلة 5", "سلسلة 7", "X3", "X5", "X6", "سلسلة 1", "أخرى"],
    "أودي": ["A3", "A4", "A6", "A8", "Q3", "Q5", "Q7", "أخرى"],
    "فولكس واغن": ["جيتا", "باسات", "تيغوان", "تورانج", "جولف", "بولو", "أخرى"],
    "شيفروليه": ["كروز", "ماليبو", "إمبالا", "تاهو", "سوبربان", "ترافيرس", "سبارك", "أخرى"],
    "فورد": ["فيوجن", "فوكس", "إكسبلورر", "إدج", "إكسبيديشن", "فييستا", "أخرى"],
    "جينيسيس": ["G70", "G80", "G90", "GV70", "GV80", "أخرى"],
    "لكزس": ["ES", "IS", "LS", "RX", "GX", "LX", "NX", "أخرى"],
    "إنفينيتي": ["Q50", "Q60", "Q70", "QX50", "QX60", "QX80", "أخرى"],
    "أكورا": ["TLX", "ILX", "RLX", "MDX", "RDX", "أخرى"],
    "مازدا": ["مازدا 3", "مازدا 6", "CX-3", "CX-5", "CX-9", "MX-5", "أخرى"],
    "سوزوكي": ["سويفت", "فيتارا", "جيمني", "بالينو", "أخرى"],
    "ميتسوبيشي": ["لانسر", "أوتلاندر", "باجيرو", "إكليبس كروس", "أخرى"],
    "دودج": ["تشارجر", "تشالنجر", "دورانجو", "جورني", "أخرى"],
    "جي ام سي": ["أكاديا", "تيرين", "يوكون", "سييرا", "كانيون", "أخرى"],
    "جاغوار": ["XE", "XF", "XJ", "F-PACE", "E-PACE", "I-PACE", "أخرى"],
    "لاند روفر": ["رينج روفر", "ديسكفري", "ديفندر", "إيفوك", "فيلار", "أخرى"],
    "بورشه": ["911", "كايين", "ماكان", "بانامرا", "تايكان", "أخرى"],
    "بنتلي": ["كونتيننتال", "فلاينغ سبور", "بنتايغا", "مولسان", "أخرى"],
    "رولز رويس": ["فانتوم", "غوست", "ريث", "دون", "كولينان", "أخرى"]
}

COUNTRY_PHONE_CODES = {
    "SA": "+966",
    "AE": "+971", 
    "KW": "+965",
    "QA": "+974",
    "BH": "+973",
    "OM": "+968",
    "JO": "+962",
    "LB": "+961",
    "SY": "+963",
    "IQ": "+964",
    "EG": "+20",
    "LY": "+218",
    "TN": "+216",
    "DZ": "+213",
    "MA": "+212",
    "YE": "+967",
    "SD": "+249"
}

# Routes

# Authentication
@api_router.post("/auth/register", response_model=TokenResponse)
async def register(user_data: UserCreate):
    # Check if user exists
    existing_user = await db.users.find_one({"$or": [{"email": user_data.email}, {"phone": user_data.phone}]})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email or phone already exists"
        )
    
    # Hash password
    hashed_password = hash_password(user_data.password)
    
    # Create user
    user = User(
        name=user_data.name,
        email=user_data.email,
        phone=user_data.phone,
        country=user_data.country,
        city=user_data.city,
        password_hash=hashed_password
    )
    
    await db.users.insert_one(user.dict())
    
    # Create token
    access_token = create_access_token(data={"sub": user.id})
    
    return TokenResponse(
        access_token=access_token,
        user=UserResponse(**user.dict())
    )

@api_router.post("/auth/login", response_model=TokenResponse)
async def login(user_data: UserLogin):
    user = await db.users.find_one({"email": user_data.email})
    if not user or not verify_password(user_data.password, user["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    access_token = create_access_token(data={"sub": user["id"]})
    
    return TokenResponse(
        access_token=access_token,
        user=UserResponse(**user)
    )

# Data endpoints
@api_router.get("/countries")
async def get_countries():
    return ARAB_COUNTRIES

@api_router.get("/cities/{country_code}")
async def get_cities(country_code: str):
    if country_code not in CITIES_BY_COUNTRY:
        raise HTTPException(status_code=404, detail="Country not found")
    return {"cities": CITIES_BY_COUNTRY[country_code]}

@api_router.get("/car-brands")
async def get_car_brands():
    return {"brands": CAR_BRANDS}

@api_router.get("/car-years")
async def get_car_years():
    return {"years": CAR_YEARS}

@api_router.get("/subcategories/{category_key}")
async def get_subcategories(category_key: str):
    if category_key not in SUBCATEGORIES:
        raise HTTPException(status_code=404, detail="Category not found")
    return SUBCATEGORIES[category_key]

@api_router.get("/all-subcategories")
async def get_all_subcategories():
    return SUBCATEGORIES

# Categories
@api_router.get("/categories", response_model=List[Category])
async def get_categories():
    # Initialize categories if not exist
    categories_count = await db.categories.count_documents({})
    if categories_count == 0:
        default_categories = [
            Category(name_ar="سيارات", name_en="Cars", sort_order=1),
            Category(name_ar="عقارات", name_en="Real Estate", sort_order=2),
            Category(name_ar="إلكترونيات", name_en="Electronics", sort_order=3),
            Category(name_ar="وظائف", name_en="Jobs", sort_order=4),
            Category(name_ar="أثاث", name_en="Furniture", sort_order=5),
            Category(name_ar="ملابس", name_en="Clothing", sort_order=6),
            Category(name_ar="خدمات", name_en="Services", sort_order=7),
            Category(name_ar="أخرى", name_en="Others", sort_order=8)
        ]
        
        for category in default_categories:
            await db.categories.insert_one(category.dict())
    
    categories = await db.categories.find({"is_active": True}).sort("sort_order", 1).to_list(100)
    return [Category(**cat) for cat in categories]

# Ads
@api_router.post("/ads", response_model=AdResponse)
async def create_ad(ad_data: AdCreate, current_user: User = Depends(get_current_user)):
    ad = Ad(
        **ad_data.dict(),
        user_id=current_user.id
    )
    
    await db.ads.insert_one(ad.dict())
    
    # Add user name for response
    ad_response = AdResponse(**ad.dict(), user_name=current_user.name)
    return ad_response

@api_router.get("/ads", response_model=List[AdResponse])
async def get_ads(
    page: int = 1,
    limit: int = 20,
    category_id: Optional[str] = None,
    country: Optional[str] = None,
    city: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    search: Optional[str] = None
):
    skip = (page - 1) * limit
    
    # Build filter
    filter_dict = {"status": AdStatus.ACTIVE}
    
    if category_id:
        filter_dict["category_id"] = category_id
    if country:
        filter_dict["country"] = country  
    if city:
        filter_dict["city"] = city
    if min_price is not None:
        filter_dict["price"] = {"$gte": min_price}
    if max_price is not None:
        if "price" in filter_dict:
            filter_dict["price"]["$lte"] = max_price
        else:
            filter_dict["price"] = {"$lte": max_price}
    if search:
        filter_dict["$or"] = [
            {"title": {"$regex": search, "$options": "i"}},
            {"description": {"$regex": search, "$options": "i"}}
        ]
    
    ads = await db.ads.find(filter_dict).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)
    
    # Add user names
    result = []
    for ad in ads:
        user = await db.users.find_one({"id": ad["user_id"]})
        ad_response = AdResponse(**ad, user_name=user["name"] if user else "Unknown")
        result.append(ad_response)
    
    return result

@api_router.get("/ads/{ad_id}", response_model=AdResponse)
async def get_ad(ad_id: str):
    ad = await db.ads.find_one({"id": ad_id})
    if not ad:
        raise HTTPException(status_code=404, detail="Ad not found")
    
    # Increment views
    await db.ads.update_one({"id": ad_id}, {"$inc": {"views": 1}})
    ad["views"] += 1
    
    # Get user name
    user = await db.users.find_one({"id": ad["user_id"]})
    
    return AdResponse(**ad, user_name=user["name"] if user else "Unknown")

@api_router.put("/ads/{ad_id}", response_model=AdResponse)
async def update_ad(ad_id: str, ad_data: AdUpdate, current_user: User = Depends(get_current_user)):
    ad = await db.ads.find_one({"id": ad_id})
    if not ad:
        raise HTTPException(status_code=404, detail="Ad not found")
    
    if ad["user_id"] != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this ad")
    
    update_data = {k: v for k, v in ad_data.dict().items() if v is not None}
    update_data["updated_at"] = datetime.utcnow()
    
    await db.ads.update_one({"id": ad_id}, {"$set": update_data})
    
    updated_ad = await db.ads.find_one({"id": ad_id})
    return AdResponse(**updated_ad, user_name=current_user.name)

@api_router.delete("/ads/{ad_id}")
async def delete_ad(ad_id: str, current_user: User = Depends(get_current_user)):
    ad = await db.ads.find_one({"id": ad_id})
    if not ad:
        raise HTTPException(status_code=404, detail="Ad not found")
    
    if ad["user_id"] != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this ad")
    
    await db.ads.update_one({"id": ad_id}, {"$set": {"status": AdStatus.REMOVED}})
    
    return {"message": "Ad deleted successfully"}

# User ads
@api_router.get("/users/ads", response_model=List[AdResponse])
async def get_user_ads(current_user: User = Depends(get_current_user)):
    ads = await db.ads.find({"user_id": current_user.id}).sort("created_at", -1).to_list(100)
    return [AdResponse(**ad, user_name=current_user.name) for ad in ads]

# Image upload
@api_router.post("/upload-image")
async def upload_image(file: UploadFile = File(...), current_user: User = Depends(get_current_user)):
    # Validate file type
    allowed_types = ["image/jpeg", "image/png", "image/gif", "image/webp"]
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail="Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.")
    
    # Validate file size (max 5MB)
    file_size = 0
    content = await file.read()
    file_size = len(content)
    
    if file_size > 5 * 1024 * 1024:  # 5MB
        raise HTTPException(status_code=400, detail="File too large. Maximum size is 5MB.")
    
    # Generate unique filename
    file_extension = file.filename.split(".")[-1] if "." in file.filename else "jpg"
    filename = f"{uuid.uuid4()}.{file_extension}"
    file_path = UPLOAD_DIR / filename
    
    # Save file
    async with aiofiles.open(file_path, "wb") as buffer:
        await buffer.write(content)
    
    # Return file URL
    file_url = f"/uploads/{filename}"
    return {"url": file_url, "filename": filename}

# Serve uploaded files
from fastapi.staticfiles import StaticFiles
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# Health check
@api_router.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.utcnow()}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()