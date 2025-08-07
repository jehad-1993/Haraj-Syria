import React, { useState, useEffect, createContext, useContext, Suspense, lazy } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route, Link, useNavigate } from "react-router-dom";
import axios from "axios";

// Lazy load components for better performance
const PostAd = lazy(() => import("./components/PostAd"));
const MyAds = lazy(() => import("./components/MyAds"));
const AdsList = lazy(() => import("./components/AdsList"));
const AdDetails = lazy(() => import("./components/AdDetails"));
const ResetPassword = lazy(() => import("./components/ResetPassword"));

// Import LazyImage component
import LazyImage from "./components/LazyImage";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Language Context
const LanguageContext = createContext();

// Auth Context
const AuthContext = createContext();

// Translation object
const translations = {
  ar: {
    appName: "حراج سوريا",
    home: "الرئيسية",
    register: "تسجيل",
    login: "دخول",
    logout: "خروج",
    myAds: "إعلاناتي",
    postAd: "أضف إعلان",
    search: "بحث",
    categories: "التصنيفات",
    welcome: "مرحباً بك في حراج سوريا",
    welcomeUser: "مرحباً",
    subtitle: "منصة الإعلانات المبوبة الأولى في المنطقة العربية",
    browseCategories: "تصفح التصنيفات",
    latestAds: "أحدث الإعلانات",
    // Registration form
    name: "الاسم",
    email: "البريد الإلكتروني",
    phone: "رقم الجوال",
    country: "الدولة",
    city: "المدينة",
    password: "كلمة المرور",
    confirmPassword: "تأكيد كلمة المرور",
    registerButton: "تسجيل",
    loginButton: "دخول",
    alreadyHaveAccount: "لديك حساب؟",
    dontHaveAccount: "ليس لديك حساب؟",
    // Categories
    cars: "سيارات",
    realEstate: "عقارات",
    electronics: "إلكترونيات",
    jobs: "وظائف",
    furniture: "أثاث",
    clothing: "ملابس",
    services: "خدمات",
    others: "أخرى",
    // Car details
    carBrand: "ماركة السيارة",
    carYear: "سنة الصنع",
    selectCountry: "اختر الدولة",
    selectCity: "اختر المدينة",
    selectCarBrand: "اختر ماركة السيارة",
    selectCarYear: "اختر سنة الصنع",
    chooseCountry: "اختر الدولة...",
    chooseCity: "اختر المدينة...",
    chooseCarBrand: "اختر الماركة...",
    chooseCarYear: "اختر السنة...",
    loading: "جاري التحميل...",
    required: "مطلوب"
  },
  en: {
    appName: "Haraj Syria",
    home: "Home",
    register: "Register",
    login: "Login",
    logout: "Logout",
    myAds: "My Ads",
    postAd: "Post Ad",
    search: "Search",
    categories: "Categories",
    welcome: "Welcome to Haraj Syria",
    welcomeUser: "Hello",
    subtitle: "The premier classified ads platform in the Arab region",
    browseCategories: "Browse Categories",
    latestAds: "Latest Ads",
    // Registration form
    name: "Name",
    email: "Email",
    phone: "Phone",
    country: "Country",
    city: "City",
    password: "Password",
    confirmPassword: "Confirm Password",
    registerButton: "Register",
    loginButton: "Login",
    alreadyHaveAccount: "Already have account?",
    dontHaveAccount: "Don't have account?",
    // Categories
    cars: "Cars",
    realEstate: "Real Estate",
    electronics: "Electronics",
    jobs: "Jobs",
    furniture: "Furniture",
    clothing: "Clothing",
    services: "Services",
    others: "Others",
    // Car details
    carBrand: "Car Brand",
    carYear: "Car Year",
    selectCountry: "Select Country",
    selectCity: "Select City",
    selectCarBrand: "Select Car Brand",
    selectCarYear: "Select Car Year",
    chooseCountry: "Choose Country...",
    chooseCity: "Choose City...",
    chooseCarBrand: "Choose Brand...",
    chooseCarYear: "Choose Year...",
    loading: "Loading...",
    required: "Required"
  }
};

// Language Provider
const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('ar');
  
  const toggleLanguage = () => {
    setLanguage(prev => prev === 'ar' ? 'en' : 'ar');
  };
  
  const t = (key) => translations[language][key] || key;
  
  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

// Auth Provider
const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  
  useEffect(() => {
    if (token) {
      // Set default header for authenticated requests
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }, [token]);
  
  const login = (tokenData) => {
    setToken(tokenData.access_token);
    setUser(tokenData.user);
    localStorage.setItem('token', tokenData.access_token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${tokenData.access_token}`;
  };
  
  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
  };
  
  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
};

// Header Component
const Header = () => {
  const { language, toggleLanguage, t } = useContext(LanguageContext);
  const { user, logout, isAuthenticated } = useContext(AuthContext);
  
  return (
    <header className={`bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 text-white shadow-lg border-b-2 border-yellow-500 ${language === 'ar' ? 'rtl' : 'ltr'}`}>
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-4">
            <Link to="/" className="text-2xl font-bold hover:text-yellow-300 flex items-center transition-colors">
              <img 
                src={language === 'ar' ? '/logos/logo-arabic.svg' : '/logos/logo-english.svg'} 
                alt={t('appName')} 
                className="h-24 w-auto"
              />
            </Link>
          </div>
          
          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/" className="hover:text-yellow-300 transition-colors">{t('home')}</Link>
            <Link to="/ads" className="hover:text-yellow-300 transition-colors">{t('categories')}</Link>
            {isAuthenticated ? (
              <>
                <Link to="/my-ads" className="hover:text-yellow-300 transition-colors">{t('myAds')}</Link>
                <Link to="/post-ad" className="hover:text-yellow-300 transition-colors">{t('postAd')}</Link>
                <span className="text-yellow-300">{t('welcomeUser')} {user?.name}</span>
                <button onClick={logout} className="hover:text-yellow-300 transition-colors">{t('logout')}</button>
              </>
            ) : (
              <>
                <Link to="/login" className="hover:text-yellow-300 transition-colors">{t('login')}</Link>
                <Link to="/register" className="hover:text-yellow-300 transition-colors">{t('register')}</Link>
              </>
            )}
          </nav>
          
          <button
            onClick={toggleLanguage}
            className="bg-gradient-to-r from-yellow-500 to-amber-600 text-slate-800 px-4 py-2 rounded-full font-semibold hover:from-yellow-400 hover:to-amber-500 transition-all shadow-lg border-2 border-yellow-400"
          >
            {language === 'ar' ? (
              <>🇺🇸 EN</>
            ) : (
              <>🇸🇦 ع</>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

// Home Page Component
const Home = () => {
  const { t, language } = useContext(LanguageContext);
  const [categories, setCategories] = useState([]);
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesRes, adsRes] = await Promise.all([
          axios.get(`${API}/categories-with-counts`),
          axios.get(`${API}/ads?limit=8`)
        ]);
        setCategories(categoriesRes.data);
        setAds(adsRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl">{t('loading')}</div>
      </div>
    );
  }
  
  return (
    <div className={`${language === 'ar' ? 'rtl' : 'ltr'}`}>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-500 to-purple-600 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-4">{t('welcome')}</h1>
          <p className="text-xl mb-8">{t('subtitle')}</p>
          <div className="max-w-2xl mx-auto">
            <div className="flex rounded-lg overflow-hidden shadow-lg">
              <input
                type="text"
                placeholder={language === 'ar' ? 'ابحث عن سيارات، عقارات، إلكترونيات، وظائف...' : 'Search for cars, real estate, electronics, jobs...'}
                className="flex-1 px-6 py-4 text-gray-800 text-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <button className="bg-orange-500 hover:bg-orange-600 px-8 py-4 text-lg font-semibold transition-colors duration-200 flex items-center gap-2">
                🔍 {t('search')}
              </button>
            </div>
          </div>
        </div>
      </section>
      
      {/* Categories Section */}
      <section className="py-28 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-20 mt-16">{t('browseCategories')}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {categories.map((category) => (
              <Link
                key={category.id}
                to={`/category/${category.id}`}
                className="bg-white rounded-lg shadow-md p-6 text-center hover:shadow-xl hover:scale-105 transition-all duration-300 group"
              >
                <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">
                  {category.name_ar === 'سيارات' && '🚗'}
                  {category.name_ar === 'عقارات' && '🏠'}
                  {category.name_ar === 'إلكترونيات' && '📱'}
                  {category.name_ar === 'وظائف' && '💼'}
                  {category.name_ar === 'أثاث' && '🪑'}
                  {category.name_ar === 'ملابس' && '👕'}
                  {category.name_ar === 'خدمات' && '🔧'}
                  {category.name_ar === 'أخرى' && '📦'}
                </div>
                <h3 className="font-semibold text-lg mb-2">
                  {language === 'ar' ? category.name_ar : category.name_en}
                </h3>
                <div className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full inline-block">
                  {category.ads_count || 0} {language === 'ar' ? 'إعلان' : 'ads'}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
      
      {/* Latest Ads Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">{t('latestAds')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {ads.map((ad) => (
              <div key={ad.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <div className="h-48 relative">
                  {ad.images && ad.images.length > 0 ? (
                    <LazyImage
                      src={ad.images[0]}
                      alt={ad.title}
                      className="w-full h-full object-cover"
                      skeletonClassName="bg-gray-200 animate-pulse"
                    />
                  ) : (
                    <div className="h-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-400 text-4xl">📷</span>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold mb-2 truncate">{ad.title}</h3>
                  <p className="text-gray-600 text-sm mb-2 line-clamp-2">{ad.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-blue-600">${ad.price}</span>
                    <span className="text-sm text-gray-500">{ad.city}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

// Registration Component
const Register = () => {
  const { t, language } = useContext(LanguageContext);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    country: '',
    city: '',
    password: '',
    confirmPassword: ''
  });
  
  const [countries, setCountries] = useState({});
  const [cities, setCities] = useState([]);
  const [phoneCodes, setPhoneCodes] = useState({});
  const [carBrands, setCarBrands] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [passwordStrength, setPasswordStrength] = useState({
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false,
    hasSpecialChar: false,
    isValidLength: false
  });
  
  const checkPasswordStrength = (password) => {
    setPasswordStrength({
      hasUpperCase: /[A-Z]/.test(password),
      hasLowerCase: /[a-z]/.test(password),
      hasNumber: /\d/.test(password),
      hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
      isValidLength: password.length >= 8
    });
  };
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [countriesRes, carBrandsRes, phoneCodesRes] = await Promise.all([
          axios.get(`${API}/countries`),
          axios.get(`${API}/car-brands`),
          axios.get(`${API}/phone-codes`)
        ]);
        setCountries(countriesRes.data);
        setCarBrands(carBrandsRes.data.brands);
        setPhoneCodes(phoneCodesRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    
    fetchData();
  }, []);
  
  useEffect(() => {
    if (formData.country) {
      const fetchCities = async () => {
        try {
          const response = await axios.get(`${API}/cities/${formData.country}`);
          setCities(response.data.cities);
        } catch (error) {
          console.error('Error fetching cities:', error);
          setCities([]);
        }
      };
      
      fetchCities();
    } else {
      setCities([]);
    }
  }, [formData.country]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    
    // Validation
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = t('required');
    if (!formData.email.trim()) newErrors.email = t('required');
    if (!formData.phone.trim()) newErrors.phone = t('required');
    if (!formData.country) newErrors.country = t('required');
    if (!formData.city) newErrors.city = t('required');
    if (!formData.password) newErrors.password = t('required');
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'كلمات المرور غير متطابقة';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setLoading(false);
      return;
    }
    
    try {
      const response = await axios.post(`${API}/auth/register`, {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        country: formData.country,
        city: formData.city,
        password: formData.password
      });
      
      login(response.data);
      navigate('/');
    } catch (error) {
      console.error('Registration error:', error.response?.data);
      let errorMessage = 'حدث خطأ أثناء التسجيل';
      
      if (error.response?.data?.detail) {
        // Handle different types of error details
        if (typeof error.response.data.detail === 'string') {
          errorMessage = error.response.data.detail;
        } else if (Array.isArray(error.response.data.detail)) {
          // Handle FastAPI validation errors
          const validationErrors = error.response.data.detail.map(err => err.msg).join(', ');
          errorMessage = validationErrors;
        } else {
          errorMessage = 'خطأ في البيانات المدخلة';
        }
      }
      
      setErrors({ submit: errorMessage });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className={`min-h-screen bg-gray-50 py-12 ${language === 'ar' ? 'rtl' : 'ltr'}`}>
      <div className="container mx-auto px-4">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-center mb-8">{t('register')}</h2>
          
          {errors.submit && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {errors.submit}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('name')} *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('email')} *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('country')} *
              </label>
              <select
                value={formData.country}
                onChange={(e) => setFormData({...formData, country: e.target.value, city: ''})}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.country ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">{t('chooseCountry')}</option>
                {Object.entries(countries).map(([code, country]) => (
                  <option key={code} value={code}>
                    {language === 'ar' ? country.name_ar : country.name_en}
                  </option>
                ))}
              </select>
              {errors.country && <p className="text-red-500 text-sm mt-1">{errors.country}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('city')} *
              </label>
              <select
                value={formData.city}
                onChange={(e) => setFormData({...formData, city: e.target.value})}
                disabled={!formData.country}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.city ? 'border-red-500' : 'border-gray-300'
                } ${!formData.country ? 'bg-gray-100' : ''}`}
              >
                <option value="">{t('chooseCity')}</option>
                {cities.map((city) => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
              {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('phone')} *
              </label>
              <div className="flex">
                <span className="inline-flex items-center px-3 text-sm text-gray-900 bg-gray-200 border border-r-0 border-gray-300 rounded-l-md">
                  {formData.country && phoneCodes[formData.country] ? phoneCodes[formData.country] : '+963'}
                </span>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className={`flex-1 px-3 py-2 border rounded-r-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.phone ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="123456789"
                />
              </div>
              {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('password')} *
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => {
                  setFormData({...formData, password: e.target.value});
                  checkPasswordStrength(e.target.value);
                }}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.password ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
              
              {/* Password Strength Indicators */}
              <div className="mt-2 space-y-1">
                <div className={`flex items-center text-xs ${passwordStrength.isValidLength ? 'text-green-600' : 'text-gray-400'}`}>
                  <span className="mr-2">{passwordStrength.isValidLength ? '✓' : '○'}</span>
                  {language === 'ar' ? 'على الأقل 8 أحرف' : 'At least 8 characters'}
                </div>
                <div className={`flex items-center text-xs ${passwordStrength.hasUpperCase ? 'text-green-600' : 'text-gray-400'}`}>
                  <span className="mr-2">{passwordStrength.hasUpperCase ? '✓' : '○'}</span>
                  {language === 'ar' ? 'حرف كبير (A-Z)' : 'Uppercase letter (A-Z)'}
                </div>
                <div className={`flex items-center text-xs ${passwordStrength.hasLowerCase ? 'text-green-600' : 'text-gray-400'}`}>
                  <span className="mr-2">{passwordStrength.hasLowerCase ? '✓' : '○'}</span>
                  {language === 'ar' ? 'حرف صغير (a-z)' : 'Lowercase letter (a-z)'}
                </div>
                <div className={`flex items-center text-xs ${passwordStrength.hasNumber ? 'text-green-600' : 'text-gray-400'}`}>
                  <span className="mr-2">{passwordStrength.hasNumber ? '✓' : '○'}</span>
                  {language === 'ar' ? 'رقم (0-9)' : 'Number (0-9)'}
                </div>
                <div className={`flex items-center text-xs ${passwordStrength.hasSpecialChar ? 'text-green-600' : 'text-gray-400'}`}>
                  <span className="mr-2">{passwordStrength.hasSpecialChar ? '✓' : '○'}</span>
                  {language === 'ar' ? 'رمز خاص (!@#$...)' : 'Special character (!@#$...)'}
                </div>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('confirmPassword')} *
              </label>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-md disabled:opacity-50"
            >
              {loading ? t('loading') : t('registerButton')}
            </button>
          </form>
          
          <p className="text-center mt-6 text-gray-600">
            {t('alreadyHaveAccount')}{' '}
            <Link to="/login" className="text-blue-600 hover:underline">
              {t('login')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

// Login Component
const Login = () => {
  const { t, language } = useContext(LanguageContext);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordData, setForgotPasswordData] = useState({
    email: '',
    method: 'email'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await axios.post(`${API}/auth/login`, formData);
      login(response.data);
      navigate('/');
    } catch (error) {
      console.error('Login error:', error.response?.data);
      let errorMessage = 'حدث خطأ أثناء تسجيل الدخول';
      
      if (error.response?.data?.detail) {
        if (typeof error.response.data.detail === 'string') {
          errorMessage = error.response.data.detail;
        } else if (Array.isArray(error.response.data.detail)) {
          const validationErrors = error.response.data.detail.map(err => err.msg).join(', ');
          errorMessage = validationErrors;
        } else {
          errorMessage = 'خطأ في بيانات تسجيل الدخول';
        }
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    
    try {
      const response = await axios.post(`${API}/auth/forgot-password`, forgotPasswordData);
      
      // Show success message
      setMessage(response.data.message);
      
      // If development info is available, show it
      if (response.data.dev_info) {
        setMessage(prev => prev + `\n\n${language === 'ar' ? 'للتطوير:' : 'For Development:'}\n${language === 'ar' ? 'الرمز:' : 'Token:'} ${response.data.dev_info.token}\n${language === 'ar' ? 'الرابط:' : 'Link:'} ${response.data.dev_info.reset_link || 'N/A'}`);
      }
      
      setShowForgotPassword(false);
    } catch (error) {
      console.error('Forgot password error:', error.response?.data);
      let errorMessage = 'حدث خطأ في إرسال طلب استعادة كلمة المرور';
      
      if (error.response?.data?.detail) {
        if (typeof error.response.data.detail === 'string') {
          errorMessage = error.response.data.detail;
        } else if (Array.isArray(error.response.data.detail)) {
          const validationErrors = error.response.data.detail.map(err => err.msg).join(', ');
          errorMessage = validationErrors;
        } else {
          errorMessage = 'خطأ في بيانات استعادة كلمة المرور';
        }
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className={`min-h-screen bg-gray-50 py-12 ${language === 'ar' ? 'rtl' : 'ltr'}`}>
      <div className="container mx-auto px-4">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-center mb-8">{t('login')}</h2>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          
          {message && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
              {message}
            </div>
          )}
          
          {!showForgotPassword ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('email')}
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('password')}
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-md disabled:opacity-50"
              >
                {loading ? t('loading') : t('loginButton')}
              </button>
              
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="text-blue-600 hover:text-blue-700 text-sm"
                >
                  {language === 'ar' ? 'نسيت كلمة المرور؟' : 'Forgot Password?'}
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleForgotPassword} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('email')}
                </label>
                <input
                  type="email"
                  value={forgotPasswordData.email}
                  onChange={(e) => setForgotPasswordData({...forgotPasswordData, email: e.target.value})}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {language === 'ar' ? 'طريقة الاستلام' : 'Recovery Method'}
                </label>
                <select
                  value={forgotPasswordData.method}
                  onChange={(e) => setForgotPasswordData({...forgotPasswordData, method: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="email">{language === 'ar' ? 'البريد الإلكتروني' : 'Email'}</option>
                  <option value="sms">{language === 'ar' ? 'رسالة نصية' : 'SMS'}</option>
                </select>
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-md disabled:opacity-50"
              >
                {loading ? t('loading') : (language === 'ar' ? 'إرسال رابط الاستعادة' : 'Send Recovery Link')}
              </button>
              
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(false)}
                  className="text-gray-600 hover:text-gray-700 text-sm"
                >
                  {language === 'ar' ? 'العودة للدخول' : 'Back to Login'}
                </button>
              </div>
            </form>
          )}
          
          <p className="text-center mt-6 text-gray-600">
            {t('dontHaveAccount')}{' '}
            <Link to="/register" className="text-blue-600 hover:underline">
              {t('register')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

// Main App Component
function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <div className="App min-h-screen bg-gradient-to-br from-blue-900 via-slate-800 to-indigo-900">
          <BrowserRouter>
            <Header />
            <main>
              <Suspense fallback={
                <div className="flex justify-center items-center min-h-screen">
                  <div className="text-xl animate-pulse">
                    {/* Loading spinner */}
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-blue-600 rounded-full animate-bounce"></div>
                      <div className="w-4 h-4 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-4 h-4 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              }>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/post-ad" element={<PostAd />} />
                  <Route path="/my-ads" element={<MyAds />} />
                  <Route path="/ads" element={<AdsList />} />
                  <Route path="/ads/:id" element={<AdDetails />} />
                  <Route path="/category/:categoryId" element={<AdsList />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                  <Route path="*" element={<Home />} />
                </Routes>
              </Suspense>
            </main>
          </BrowserRouter>
        </div>
      </AuthProvider>
    </LanguageProvider>
  );
}

export { LanguageContext, AuthContext };
export default App;