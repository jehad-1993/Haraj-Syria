import React, { useState, useEffect, useContext } from "react";
import { LanguageContext } from "../App";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import LazyImage from "./LazyImage";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AdsList = () => {
  const { t, language } = useContext(LanguageContext);
  const { categoryId } = useParams();
  const navigate = useNavigate();
  
  const [ads, setAds] = useState([]);
  const [categories, setCategories] = useState([]);
  const [countries, setCountries] = useState({});
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    category_id: categoryId || '',
    country: '',
    city: '',
    min_price: '',
    max_price: ''
  });
  const [cities, setCities] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalAds, setTotalAds] = useState(0);
  const adsPerPage = 12;
  
  // Load initial data
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [categoriesRes, countriesRes] = await Promise.all([
          axios.get(`${API}/categories`),
          axios.get(`${API}/countries`)
        ]);
        setCategories(categoriesRes.data);
        setCountries(countriesRes.data);
      } catch (error) {
        console.error('Error fetching initial data:', error);
      }
    };
    
    fetchInitialData();
  }, []);
  
  // Load cities when country changes
  useEffect(() => {
    if (filters.country) {
      const fetchCities = async () => {
        try {
          const response = await axios.get(`${API}/cities/${filters.country}`);
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
  }, [filters.country]);
  
  // Load ads whenever filters or page changes
  useEffect(() => {
    const fetchAds = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page: currentPage.toString(),
          limit: adsPerPage.toString()
        });
        
        // Add filters to params
        Object.entries(filters).forEach(([key, value]) => {
          if (value && value.toString().trim()) {
            params.append(key, value);
          }
        });
        
        const response = await axios.get(`${API}/ads?${params}`);
        setAds(response.data);
        // Note: In a real app, you'd also get total count for pagination
        setTotalAds(response.data.length);
      } catch (error) {
        console.error('Error fetching ads:', error);
        setAds([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAds();
  }, [filters, currentPage]);
  
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      ...(key === 'country' && { city: '' }) // Reset city when country changes
    }));
    setCurrentPage(1); // Reset to first page when filters change
  };
  
  const handleSearch = (e) => {
    e.preventDefault();
    // Search is already handled by the filters useEffect
  };
  
  const clearFilters = () => {
    setFilters({
      search: '',
      category_id: '',
      country: '',
      city: '',
      min_price: '',
      max_price: ''
    });
    setCurrentPage(1);
  };
  
  const openWhatsApp = (phone, title) => {
    const message = encodeURIComponent(`${language === 'ar' ? 'مرحباً، أنا مهتم بإعلانك:' : 'Hello, I am interested in your ad:'} ${title}`);
    window.open(`https://wa.me/${phone.replace(/[^0-9]/g, '')}?text=${message}`, '_blank');
  };
  
  if (loading && ads.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl">{t('loading')}</div>
      </div>
    );
  }
  
  return (
    <div className={`min-h-screen bg-gray-50 ${language === 'ar' ? 'rtl' : 'ltr'}`}>
      {/* Search and Filters Section */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold mb-6">
            {language === 'ar' ? 'تصفح الإعلانات' : 'Browse Ads'}
          </h1>
          
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="mb-6">
            <div className="flex gap-2 max-w-2xl">
              <input
                type="text"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                placeholder={language === 'ar' ? 'ابحث في الإعلانات...' : 'Search ads...'}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold"
              >
                {language === 'ar' ? 'بحث' : 'Search'}
              </button>
            </div>
          </form>
          
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {language === 'ar' ? 'التصنيف' : 'Category'}
              </label>
              <select
                value={filters.category_id}
                onChange={(e) => handleFilterChange('category_id', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">{language === 'ar' ? 'جميع التصنيفات' : 'All Categories'}</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {language === 'ar' ? category.name_ar : category.name_en}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Country Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {language === 'ar' ? 'الدولة' : 'Country'}
              </label>
              <select
                value={filters.country}
                onChange={(e) => handleFilterChange('country', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">{language === 'ar' ? 'جميع الدول' : 'All Countries'}</option>
                {Object.entries(countries).map(([code, country]) => (
                  <option key={code} value={code}>
                    {language === 'ar' ? country.name_ar : country.name_en}
                  </option>
                ))}
              </select>
            </div>
            
            {/* City Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {language === 'ar' ? 'المدينة' : 'City'}
              </label>
              <select
                value={filters.city}
                onChange={(e) => handleFilterChange('city', e.target.value)}
                disabled={!filters.country}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              >
                <option value="">{language === 'ar' ? 'جميع المدن' : 'All Cities'}</option>
                {cities.map((city) => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>
            
            {/* Price Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {language === 'ar' ? 'السعر من' : 'Min Price'}
              </label>
              <input
                type="number"
                value={filters.min_price}
                onChange={(e) => handleFilterChange('min_price', e.target.value)}
                placeholder="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {language === 'ar' ? 'السعر إلى' : 'Max Price'}
              </label>
              <input
                type="number"
                value={filters.max_price}
                onChange={(e) => handleFilterChange('max_price', e.target.value)}
                placeholder="∞"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          {/* Clear Filters Button */}
          <div className="mt-4">
            <button
              onClick={clearFilters}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              {language === 'ar' ? 'مسح جميع الفلاتر' : 'Clear All Filters'}
            </button>
          </div>
        </div>
      </div>
      
      {/* Results Section */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">
            {language === 'ar' ? `${ads.length} إعلان` : `${ads.length} Ads`}
          </h2>
          
          <Link
            to="/post-ad"
            className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-6 rounded-md"
          >
            {language === 'ar' ? 'أضف إعلان' : 'Post Ad'}
          </Link>
        </div>
        
        {loading ? (
          <div className="text-center py-8">
            <div className="text-lg">{t('loading')}</div>
          </div>
        ) : ads.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg mb-4">
              {language === 'ar' ? 'لا توجد إعلانات مطابقة للبحث' : 'No ads found matching your search'}
            </div>
            <button
              onClick={clearFilters}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              {language === 'ar' ? 'مسح الفلاتر' : 'Clear Filters'}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {ads.map((ad) => (
              <div key={ad.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                {/* Image placeholder */}
                <div className="h-48 bg-gray-200 relative overflow-hidden">
                  {ad.images && ad.images.length > 0 ? (
                    <img 
                      src={ad.images[0]} 
                      alt={ad.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                      📷
                    </div>
                  )}
                  {/* Ad type badge */}
                  {ad.ad_type !== 'free' && (
                    <div className={`absolute top-2 ${language === 'ar' ? 'right-2' : 'left-2'} px-2 py-1 rounded text-xs font-bold text-white ${
                      ad.ad_type === 'featured' ? 'bg-orange-500' : 'bg-purple-500'
                    }`}>
                      {ad.ad_type === 'featured' ? (language === 'ar' ? 'مميز' : 'Featured') : (language === 'ar' ? 'بريميوم' : 'Premium')}
                    </div>
                  )}
                  {/* Images count indicator */}
                  {ad.images && ad.images.length > 1 && (
                    <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                      📷 {ad.images.length}
                    </div>
                  )}
                </div>
                
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                    <Link to={`/ads/${ad.id}`} className="hover:text-blue-600">
                      {ad.title}
                    </Link>
                  </h3>
                  
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {ad.description}
                  </p>
                  
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xl font-bold text-blue-600">
                      {ad.currency} {ad.price.toLocaleString()}
                    </span>
                    <span className="text-sm text-gray-500">
                      {language === 'ar' ? 'المشاهدات:' : 'Views:'} {ad.views}
                    </span>
                  </div>
                  
                  <div className="text-sm text-gray-500 mb-3">
                    <div>{ad.city}</div>
                    <div>{new Date(ad.created_at).toLocaleDateString()}</div>
                  </div>
                  
                  {/* Car details if available */}
                  {ad.car_brand && (
                    <div className="text-sm text-gray-600 mb-3 border-t pt-2">
                      <div>{ad.car_brand} {ad.car_year}</div>
                      {ad.car_mileage && <div>{ad.car_mileage.toLocaleString()} {language === 'ar' ? 'كم' : 'km'}</div>}
                    </div>
                  )}
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => window.location.href = `tel:${ad.contact_phone}`}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm py-2 px-3 rounded font-medium"
                    >
                      📞 {language === 'ar' ? 'اتصال' : 'Call'}
                    </button>
                    
                    {ad.contact_whatsapp && (
                      <button
                        onClick={() => openWhatsApp(ad.contact_whatsapp, ad.title)}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white text-sm py-2 px-3 rounded font-medium"
                      >
                        💬 {language === 'ar' ? 'واتساب' : 'WhatsApp'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Pagination could be added here */}
        {ads.length >= adsPerPage && (
          <div className="flex justify-center mt-8">
            <div className="text-gray-500">
              {language === 'ar' ? 'المزيد من الإعلانات قريباً...' : 'More ads coming soon...'}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdsList;