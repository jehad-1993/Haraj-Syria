import React, { useState, useEffect, useContext } from "react";
import { LanguageContext, AuthContext } from "../App";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const MyAds = () => {
  const { t, language } = useContext(LanguageContext);
  const { isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);
  
  // Fetch user ads
  useEffect(() => {
    const fetchAds = async () => {
      if (!isAuthenticated) return;
      
      try {
        const response = await axios.get(`${API}/users/ads`);
        setAds(response.data);
      } catch (error) {
        setError(error.response?.data?.detail || (language === 'ar' ? 'حدث خطأ في جلب الإعلانات' : 'Error fetching ads'));
      } finally {
        setLoading(false);
      }
    };
    
    fetchAds();
  }, [isAuthenticated, language]);
  
  const deleteAd = async (adId) => {
    if (!confirm(language === 'ar' ? 'هل أنت متأكد من حذف الإعلان؟' : 'Are you sure you want to delete this ad?')) {
      return;
    }
    
    try {
      await axios.delete(`${API}/ads/${adId}`);
      setAds(ads.filter(ad => ad.id !== adId));
    } catch (error) {
      alert(error.response?.data?.detail || (language === 'ar' ? 'حدث خطأ في حذف الإعلان' : 'Error deleting ad'));
    }
  };
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'expired':
        return 'bg-red-100 text-red-800';
      case 'removed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getStatusText = (status) => {
    const statusMap = {
      active: language === 'ar' ? 'نشط' : 'Active',
      pending: language === 'ar' ? 'في انتظار الموافقة' : 'Pending',
      expired: language === 'ar' ? 'منتهي الصلاحية' : 'Expired',
      removed: language === 'ar' ? 'محذوف' : 'Removed'
    };
    return statusMap[status] || status;
  };
  
  const openWhatsApp = (phone, title) => {
    const message = encodeURIComponent(`${language === 'ar' ? 'مرحباً، أنا مهتم بإعلانك:' : 'Hello, I am interested in your ad:'} ${title}`);
    window.open(`https://wa.me/${phone.replace(/[^0-9]/g, '')}?text=${message}`, '_blank');
  };
  
  if (!isAuthenticated) {
    return null; // Will redirect to login
  }
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl">{t('loading')}</div>
      </div>
    );
  }
  
  return (
    <div className={`min-h-screen bg-gray-50 py-12 ${language === 'ar' ? 'rtl' : 'ltr'}`}>
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">
            {language === 'ar' ? 'إعلاناتي' : 'My Ads'}
          </h1>
          <button
            onClick={() => navigate('/post-ad')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-md"
          >
            {language === 'ar' ? 'إضافة إعلان جديد' : 'Post New Ad'}
          </button>
        </div>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        {ads.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="text-gray-500 text-lg mb-4">
              {language === 'ar' ? 'لا توجد إعلانات حالياً' : 'No ads yet'}
            </div>
            <button
              onClick={() => navigate('/post-ad')}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-md"
            >
              {language === 'ar' ? 'أضف أول إعلان' : 'Post Your First Ad'}
            </button>
          </div>
        ) : (
          <div className="grid gap-6">
            {ads.map((ad) => (
              <div key={ad.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-2">{ad.title}</h3>
                    <p className="text-gray-600 mb-2 line-clamp-2">{ad.description}</p>
                    <div className="flex flex-wrap gap-2 text-sm text-gray-500">
                      <span>{ad.city}, {ad.country}</span>
                      <span>•</span>
                      <span>{new Date(ad.created_at).toLocaleDateString()}</span>
                      <span>•</span>
                      <span>{language === 'ar' ? 'المشاهدات:' : 'Views:'} {ad.views}</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-2">
                    <span className="text-2xl font-bold text-blue-600">
                      {ad.currency} {ad.price.toLocaleString()}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(ad.status)}`}>
                      {getStatusText(ad.status)}
                    </span>
                  </div>
                </div>
                
                {/* Car details if available */}
                {ad.car_brand && (
                  <div className="border-t pt-4 mb-4">
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                      <span>{language === 'ar' ? 'الماركة:' : 'Brand:'} {ad.car_brand}</span>
                      {ad.car_year && <span>{language === 'ar' ? 'السنة:' : 'Year:'} {ad.car_year}</span>}
                      {ad.car_mileage && <span>{language === 'ar' ? 'المسافة:' : 'Mileage:'} {ad.car_mileage.toLocaleString()} {language === 'ar' ? 'كم' : 'km'}</span>}
                      {ad.car_condition && <span>{language === 'ar' ? 'الحالة:' : 'Condition:'} {ad.car_condition}</span>}
                    </div>
                  </div>
                )}
                
                <div className="flex justify-between items-center border-t pt-4">
                  <div className="flex gap-3">
                    <button
                      onClick={() => window.location.href = `tel:${ad.contact_phone}`}
                      className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
                    >
                      📞 {ad.contact_phone}
                    </button>
                    
                    {ad.contact_whatsapp && (
                      <button
                        onClick={() => openWhatsApp(ad.contact_whatsapp, ad.title)}
                        className="flex items-center gap-2 text-green-600 hover:text-green-700"
                      >
                        💬 {language === 'ar' ? 'واتساب' : 'WhatsApp'}
                      </button>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => navigate(`/ads/${ad.id}`)}
                      className="text-blue-600 hover:text-blue-700 px-3 py-1 rounded"
                    >
                      {language === 'ar' ? 'عرض' : 'View'}
                    </button>
                    
                    <button
                      onClick={() => deleteAd(ad.id)}
                      className="text-red-600 hover:text-red-700 px-3 py-1 rounded"
                      disabled={ad.status === 'removed'}
                    >
                      {language === 'ar' ? 'حذف' : 'Delete'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyAds;