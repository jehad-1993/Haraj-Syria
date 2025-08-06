import React, { useState, useEffect, useContext } from "react";
import { LanguageContext, AuthContext } from "../App";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import ImageUpload from "./ImageUpload";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const PostAd = () => {
  const { t, language } = useContext(LanguageContext);
  const { isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();
  
  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    currency: 'USD',
    category_id: '',
    subcategory_id: '',
    country: '',
    city: '',
    area: '',
    contact_phone: '',
    contact_whatsapp: '',
    ad_type: 'free',
    // Car specific fields
    car_brand: '',
    car_model: '',
    car_year: '',
    car_mileage: '',
    car_condition: 'excellent'
  });
  
  const [images, setImages] = useState([]);
  
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [countries, setCountries] = useState({});
  const [cities, setCities] = useState([]);
  const [carBrands, setCarBrands] = useState([]);
  const [carModels, setCarModels] = useState([]);
  const [carYears, setCarYears] = useState([]);
  const [allSubcategories, setAllSubcategories] = useState({});
  const [selectedCategoryKey, setSelectedCategoryKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  
  // Load initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesRes, countriesRes, carBrandsRes, carYearsRes, subcategoriesRes] = await Promise.all([
          axios.get(`${API}/categories`),
          axios.get(`${API}/countries`),
          axios.get(`${API}/car-brands`),
          axios.get(`${API}/car-years`),
          axios.get(`${API}/all-subcategories`)
        ]);
        
        setCategories(categoriesRes.data);
        setCountries(countriesRes.data);
        setCarBrands(carBrandsRes.data.brands);
        setCarYears(carYearsRes.data.years);
        setAllSubcategories(subcategoriesRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    
    fetchData();
  }, []);
  
  // Load cities when country changes
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
  
  // Load subcategories when category changes
  useEffect(() => {
    if (formData.category_id) {
      const selectedCategory = categories.find(cat => cat.id === formData.category_id);
      if (selectedCategory) {
        // Map category names to keys
        const categoryKeyMap = {
          'سيارات': 'cars',
          'عقارات': 'real_estate', 
          'إلكترونيات': 'electronics',
          'وظائف': 'jobs',
          'أثاث': 'furniture',
          'ملابس': 'clothing',
          'خدمات': 'services',
          'أخرى': 'others'
        };
        
        const categoryKey = categoryKeyMap[selectedCategory.name_ar];
        setSelectedCategoryKey(categoryKey);
        
        if (categoryKey && allSubcategories[categoryKey]) {
          setSubcategories(allSubcategories[categoryKey].subcategories || []);
        } else {
          setSubcategories([]);
        }
      }
    } else {
      setSubcategories([]);
      setSelectedCategoryKey('');
    }
  }, [formData.category_id, categories, allSubcategories]);
  
  // Load car models when car brand changes
  useEffect(() => {
    if (formData.car_brand) {
      const fetchCarModels = async () => {
        try {
          const response = await axios.get(`${API}/car-models/${formData.car_brand}`);
          setCarModels(response.data.models);
        } catch (error) {
          console.error('Error fetching car models:', error);
          setCarModels([]);
        }
      };
      fetchCarModels();
    } else {
      setCarModels([]);
    }
  }, [formData.car_brand]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    
    // Validation
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = t('required');
    if (!formData.description.trim()) newErrors.description = t('required');
    if (!formData.price || formData.price <= 0) newErrors.price = t('required');
    if (!formData.category_id) newErrors.category_id = t('required');
    if (!formData.country) newErrors.country = t('required');
    if (!formData.city) newErrors.city = t('required');
    if (!formData.contact_phone.trim()) newErrors.contact_phone = t('required');
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setLoading(false);
      return;
    }
    
    try {
      // Convert price to number
      const submitData = {
        ...formData,
        price: parseFloat(formData.price),
        car_year: formData.car_year ? parseInt(formData.car_year) : null,
        car_mileage: formData.car_mileage ? parseInt(formData.car_mileage) : null,
        images: images
      };
      
      // Remove empty optional fields
      Object.keys(submitData).forEach(key => {
        if (submitData[key] === '' || submitData[key] === null) {
          delete submitData[key];
        }
      });
      
      const response = await axios.post(`${API}/ads`, submitData);
      
      // Redirect to ad details or ads list
      alert(language === 'ar' ? 'تم إضافة الإعلان بنجاح!' : 'Ad posted successfully!');
      navigate('/my-ads');
      
    } catch (error) {
      setErrors({ submit: error.response?.data?.detail || (language === 'ar' ? 'حدث خطأ أثناء إضافة الإعلان' : 'Error posting ad') });
    } finally {
      setLoading(false);
    }
  };
  
  if (!isAuthenticated) {
    return null; // Will redirect to login
  }
  
  return (
    <div className={`min-h-screen bg-gray-50 py-12 ${language === 'ar' ? 'rtl' : 'ltr'}`}>
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-8">
          <h2 className="text-3xl font-bold text-center mb-8">
            {language === 'ar' ? 'إضافة إعلان جديد' : 'Post New Ad'}
          </h2>
          
          {errors.submit && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {errors.submit}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Title */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {language === 'ar' ? 'عنوان الإعلان' : 'Ad Title'} *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.title ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder={language === 'ar' ? 'مثال: سيارة تويوتا كامري 2020 للبيع' : 'Example: Toyota Camry 2020 for sale'}
                />
                {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
              </div>
              
              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {language === 'ar' ? 'التصنيف' : 'Category'} *
                </label>
                <select
                  value={formData.category_id}
                  onChange={(e) => setFormData({...formData, category_id: e.target.value, subcategory_id: ''})}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.category_id ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">{language === 'ar' ? 'اختر التصنيف...' : 'Choose Category...'}</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {language === 'ar' ? category.name_ar : category.name_en}
                    </option>
                  ))}
                </select>
                {errors.category_id && <p className="text-red-500 text-sm mt-1">{errors.category_id}</p>}
              </div>
              
              {/* Subcategory */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {language === 'ar' ? 'التصنيف الفرعي' : 'Subcategory'}
                </label>
                <select
                  value={formData.subcategory_id}
                  onChange={(e) => setFormData({...formData, subcategory_id: e.target.value})}
                  disabled={!formData.category_id}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                >
                  <option value="">{language === 'ar' ? 'اختر التصنيف الفرعي...' : 'Choose Subcategory...'}</option>
                  {subcategories.map((subcat, index) => (
                    <option key={index} value={index}>
                      {language === 'ar' ? subcat.name_ar : subcat.name_en}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {language === 'ar' ? 'السعر' : 'Price'} *
                </label>
                <div className="flex">
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    className={`flex-1 px-3 py-2 border rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.price ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="0"
                  />
                  <select
                    value={formData.currency}
                    onChange={(e) => setFormData({...formData, currency: e.target.value})}
                    className="px-3 py-2 border border-l-0 border-gray-300 rounded-r-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="USD">USD</option>
                    <option value="SYP">SYP</option>
                    <option value="SAR">SAR</option>
                    <option value="AED">AED</option>
                  </select>
                </div>
                {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
              </div>
              
              {/* Ad Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {language === 'ar' ? 'نوع الإعلان' : 'Ad Type'}
                </label>
                <select
                  value={formData.ad_type}
                  onChange={(e) => setFormData({...formData, ad_type: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="free">{language === 'ar' ? 'مجاني' : 'Free'}</option>
                  <option value="featured">{language === 'ar' ? 'مميز' : 'Featured'}</option>
                  <option value="premium">{language === 'ar' ? 'بريميوم' : 'Premium'}</option>
                </select>
              </div>
            </div>
            
            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {language === 'ar' ? 'وصف الإعلان' : 'Description'} *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                rows={4}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.description ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder={language === 'ar' ? 'اكتب وصفاً مفصلاً عن السلعة أو الخدمة...' : 'Write a detailed description...'}
              />
              {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
            </div>
            
            {/* Images Upload */}
            <div>
              <ImageUpload images={images} setImages={setImages} maxImages={5} />
            </div>
            
            {/* Location */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {language === 'ar' ? 'الدولة' : 'Country'} *
                </label>
                <select
                  value={formData.country}
                  onChange={(e) => setFormData({...formData, country: e.target.value, city: ''})}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.country ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">{language === 'ar' ? 'اختر الدولة...' : 'Choose Country...'}</option>
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
                  {language === 'ar' ? 'المدينة' : 'City'} *
                </label>
                <select
                  value={formData.city}
                  onChange={(e) => setFormData({...formData, city: e.target.value})}
                  disabled={!formData.country}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.city ? 'border-red-500' : 'border-gray-300'
                  } ${!formData.country ? 'bg-gray-100' : ''}`}
                >
                  <option value="">{language === 'ar' ? 'اختر المدينة...' : 'Choose City...'}</option>
                  {cities.map((city) => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
                {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {language === 'ar' ? 'المنطقة' : 'Area'}
                </label>
                <input
                  type="text"
                  value={formData.area}
                  onChange={(e) => setFormData({...formData, area: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={language === 'ar' ? 'مثال: شارع الحمرا' : 'Example: Hamra Street'}
                />
              </div>
            </div>
            
            {/* Contact Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {language === 'ar' ? 'رقم الهاتف' : 'Phone Number'} *
                </label>
                <input
                  type="tel"
                  value={formData.contact_phone}
                  onChange={(e) => setFormData({...formData, contact_phone: e.target.value})}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.contact_phone ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="+963xxxxxxxxx"
                />
                {errors.contact_phone && <p className="text-red-500 text-sm mt-1">{errors.contact_phone}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {language === 'ar' ? 'واتساب' : 'WhatsApp'}
                </label>
                <input
                  type="tel"
                  value={formData.contact_whatsapp}
                  onChange={(e) => setFormData({...formData, contact_whatsapp: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="+963xxxxxxxxx"
                />
              </div>
            </div>
            
            {/* Car-specific fields - only show for cars category */}
            {selectedCategoryKey === 'cars' && (
              <div>
                <h3 className="text-lg font-semibold mb-4 border-t pt-6">
                  {language === 'ar' ? 'معلومات السيارة' : 'Car Information'}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {language === 'ar' ? 'الماركة' : 'Brand'}
                    </label>
                    <select
                      value={formData.car_brand}
                      onChange={(e) => setFormData({...formData, car_brand: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">{language === 'ar' ? 'اختر الماركة...' : 'Choose Brand...'}</option>
                      {carBrands.map((brand) => (
                        <option key={brand} value={brand}>{brand}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {language === 'ar' ? 'سنة الصنع' : 'Year'}
                    </label>
                    <select
                      value={formData.car_year}
                      onChange={(e) => setFormData({...formData, car_year: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">{language === 'ar' ? 'اختر السنة...' : 'Choose Year...'}</option>
                      {carYears.reverse().map((year) => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {language === 'ar' ? 'المسافة المقطوعة (كم)' : 'Mileage (km)'}
                    </label>
                    <input
                      type="number"
                      value={formData.car_mileage}
                      onChange={(e) => setFormData({...formData, car_mileage: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {language === 'ar' ? 'الحالة' : 'Condition'}
                    </label>
                    <select
                      value={formData.car_condition}
                      onChange={(e) => setFormData({...formData, car_condition: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="excellent">{language === 'ar' ? 'ممتازة' : 'Excellent'}</option>
                      <option value="very_good">{language === 'ar' ? 'جيدة جداً' : 'Very Good'}</option>
                      <option value="good">{language === 'ar' ? 'جيدة' : 'Good'}</option>
                      <option value="fair">{language === 'ar' ? 'مقبولة' : 'Fair'}</option>
                      <option value="needs_work">{language === 'ar' ? 'تحتاج عمل' : 'Needs Work'}</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
            
            {/* Submit Button */}
            <div className="flex justify-center pt-6">
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-md disabled:opacity-50 min-w-[200px]"
              >
                {loading ? (language === 'ar' ? 'جاري النشر...' : 'Posting...') : (language === 'ar' ? 'نشر الإعلان' : 'Post Ad')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PostAd;