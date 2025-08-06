import React, { useState, useEffect, useContext } from "react";
import { LanguageContext, AuthContext } from "../App";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AdDetails = () => {
  const { t, language } = useContext(LanguageContext);
  const { user } = useContext(AuthContext);
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [ad, setAd] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [relatedAds, setRelatedAds] = useState([]);
  
  useEffect(() => {
    const fetchAd = async () => {
      try {
        const response = await axios.get(`${API}/ads/${id}`);
        setAd(response.data);
        
        // Fetch related ads from the same category
        if (response.data.category_id) {
          const relatedResponse = await axios.get(`${API}/ads?category_id=${response.data.category_id}&limit=4`);
          setRelatedAds(relatedResponse.data.filter(relatedAd => relatedAd.id !== id));
        }
      } catch (error) {
        setError(error.response?.data?.detail || (language === 'ar' ? 'الإعلان غير موجود' : 'Ad not found'));
      } finally {
        setLoading(false);
      }
    };
    
    fetchAd();
  }, [id, language]);
  
  const openWhatsApp = (phone, title) => {
    const message = encodeURIComponent(`${language === 'ar' ? 'مرحباً، أنا مهتم بإعلانك:' : 'Hello, I am interested in your ad:'} ${title}`);
    window.open(`https://wa.me/${phone.replace(/[^0-9]/g, '')}?text=${message}`, '_blank');
  };
  
  const shareAd = () => {
    if (navigator.share) {
      navigator.share({
        title: ad.title,
        text: ad.description,
        url: window.location.href,
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert(language === 'ar' ? 'تم نسخ رابط الإعلان' : 'Ad link copied to clipboard');
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl">{t('loading')}</div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">{error}</div>
          <button
            onClick={() => navigate('/ads')}
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
          >
            {language === 'ar' ? 'العودة للإعلانات' : 'Back to Ads'}
          </button>
        </div>
      </div>
    );
  }
  
  if (!ad) return null;
  
  return (
    <div className={`min-h-screen bg-gray-50 ${language === 'ar' ? 'rtl' : 'ltr'}`}>
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-600 mb-6">
          <span onClick={() => navigate('/ads')} className="cursor-pointer hover:text-blue-600">
            {language === 'ar' ? 'الإعلانات' : 'Ads'}
          </span>
          <span className="mx-2">›</span>
          <span className="text-gray-900">{ad.title}</span>
        </nav>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Images */}
            <div className="bg-white rounded-lg shadow-md mb-6">
              {ad.images && ad.images.length > 0 ? (
                <div>
                  {/* Main Image */}
                  <div className="h-96 bg-gray-200 rounded-t-lg overflow-hidden relative">
                    <img 
                      src={ad.images[0]} 
                      alt={ad.title}
                      className="w-full h-full object-cover"
                    />
                    {ad.ad_type !== 'free' && (
                      <div className={`absolute top-4 ${language === 'ar' ? 'right-4' : 'left-4'} px-3 py-1 rounded text-sm font-bold text-white ${
                        ad.ad_type === 'featured' ? 'bg-orange-500' : 'bg-purple-500'
                      }`}>
                        {ad.ad_type === 'featured' ? (language === 'ar' ? 'إعلان مميز' : 'Featured Ad') : (language === 'ar' ? 'إعلان بريميوم' : 'Premium Ad')}
                      </div>
                    )}
                  </div>
                  
                  {/* Thumbnail Images */}
                  {ad.images.length > 1 && (
                    <div className="p-4 border-b">
                      <div className="flex gap-2 overflow-x-auto">
                        {ad.images.map((image, index) => (
                          <img
                            key={index}
                            src={image}
                            alt={`${ad.title} ${index + 1}`}
                            className={`w-20 h-20 object-cover rounded cursor-pointer border-2 ${
                              index === 0 ? 'border-blue-500' : 'border-gray-200 hover:border-blue-300'
                            }`}
                            onClick={() => {
                              // Switch main image
                              const newImages = [...ad.images];
                              [newImages[0], newImages[index]] = [newImages[index], newImages[0]];
                              setAd({...ad, images: newImages});
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-96 bg-gray-200 rounded-t-lg flex items-center justify-center relative">
                  <div className="text-gray-400 text-6xl">📷</div>
                  {ad.ad_type !== 'free' && (
                    <div className={`absolute top-4 ${language === 'ar' ? 'right-4' : 'left-4'} px-3 py-1 rounded text-sm font-bold text-white ${
                      ad.ad_type === 'featured' ? 'bg-orange-500' : 'bg-purple-500'
                    }`}>
                      {ad.ad_type === 'featured' ? (language === 'ar' ? 'إعلان مميز' : 'Featured Ad') : (language === 'ar' ? 'إعلان بريميوم' : 'Premium Ad')}
                    </div>
                  )}
                </div>
              )}
              
              {/* Ad Title and Price */}
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h1 className="text-3xl font-bold text-gray-900 flex-1">{ad.title}</h1>
                  <div className="text-right ml-4">
                    <div className="text-3xl font-bold text-blue-600">
                      {ad.currency} {ad.price.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      {language === 'ar' ? 'المشاهدات:' : 'Views:'} {ad.views}
                    </div>
                  </div>
                </div>
                
                {/* Location and Date */}
                <div className="flex items-center text-gray-600 text-sm mb-4">
                  <span>📍 {ad.city}</span>
                  {ad.area && <span className="mx-2">•</span>}
                  {ad.area && <span>{ad.area}</span>}
                  <span className="mx-2">•</span>
                  <span>{new Date(ad.created_at).toLocaleDateString()}</span>
                </div>
                
                {/* Car Details */}
                {ad.car_brand && (
                  <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <h3 className="font-semibold mb-3">{language === 'ar' ? 'تفاصيل السيارة' : 'Car Details'}</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">{language === 'ar' ? 'الماركة:' : 'Brand:'}</span>
                        <div className="font-medium">{ad.car_brand}</div>
                      </div>
                      {ad.car_year && (
                        <div>
                          <span className="text-gray-600">{language === 'ar' ? 'السنة:' : 'Year:'}</span>
                          <div className="font-medium">{ad.car_year}</div>
                        </div>
                      )}
                      {ad.car_mileage && (
                        <div>
                          <span className="text-gray-600">{language === 'ar' ? 'المسافة:' : 'Mileage:'}</span>
                          <div className="font-medium">{ad.car_mileage.toLocaleString()} {language === 'ar' ? 'كم' : 'km'}</div>
                        </div>
                      )}
                      {ad.car_condition && (
                        <div>
                          <span className="text-gray-600">{language === 'ar' ? 'الحالة:' : 'Condition:'}</span>
                          <div className="font-medium">{ad.car_condition}</div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Description */}
                <div>
                  <h3 className="font-semibold text-lg mb-3">{language === 'ar' ? 'الوصف' : 'Description'}</h3>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{ad.description}</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Contact Information */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h3 className="font-semibold text-lg mb-4">{language === 'ar' ? 'معلومات الاتصال' : 'Contact Information'}</h3>
              
              {/* Seller name */}
              <div className="mb-4">
                <div className="text-sm text-gray-600">{language === 'ar' ? 'البائع:' : 'Seller:'}</div>
                <div className="font-medium">{ad.user_name || (language === 'ar' ? 'غير محدد' : 'Not specified')}</div>
              </div>
              
              {/* Contact buttons */}
              <div className="space-y-3">
                <button
                  onClick={() => window.location.href = `tel:${ad.contact_phone}`}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-semibold flex items-center justify-center gap-2"
                >
                  📞 {ad.contact_phone}
                </button>
                
                {ad.contact_whatsapp && (
                  <button
                    onClick={() => openWhatsApp(ad.contact_whatsapp, ad.title)}
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-semibold flex items-center justify-center gap-2"
                  >
                    💬 {language === 'ar' ? 'تواصل عبر واتساب' : 'Chat on WhatsApp'}
                  </button>
                )}
                
                <button
                  onClick={shareAd}
                  className="w-full bg-gray-600 hover:bg-gray-700 text-white py-3 px-4 rounded-lg font-semibold flex items-center justify-center gap-2"
                >
                  🔗 {language === 'ar' ? 'مشاركة الإعلان' : 'Share Ad'}
                </button>
              </div>
              
              {/* Safety tips */}
              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="text-sm font-medium text-yellow-800 mb-2">
                  {language === 'ar' ? 'نصائح للأمان' : 'Safety Tips'}
                </div>
                <ul className="text-xs text-yellow-700 space-y-1">
                  <li>• {language === 'ar' ? 'التقي بالبائع في مكان عام' : 'Meet in a public place'}</li>
                  <li>• {language === 'ar' ? 'فحص السلعة قبل الدفع' : 'Inspect before paying'}</li>
                  <li>• {language === 'ar' ? 'لا تدفع مقدماً' : 'Never pay in advance'}</li>
                </ul>
              </div>
            </div>
            
            {/* Report Ad */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="font-semibold text-lg mb-4">{language === 'ar' ? 'الإبلاغ عن الإعلان' : 'Report Ad'}</h3>
              <p className="text-sm text-gray-600 mb-3">
                {language === 'ar' ? 'هل يحتوي هذا الإعلان على محتوى غير مناسب؟' : 'Does this ad contain inappropriate content?'}
              </p>
              <button className="text-red-600 hover:text-red-700 text-sm font-medium">
                🚨 {language === 'ar' ? 'إبلاغ عن الإعلان' : 'Report this ad'}
              </button>
            </div>
          </div>
        </div>
        
        {/* Related Ads */}
        {relatedAds.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6">{language === 'ar' ? 'إعلانات مشابهة' : 'Related Ads'}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedAds.map((relatedAd) => (
                <div key={relatedAd.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                     onClick={() => navigate(`/ads/${relatedAd.id}`)}>
                  <div className="h-40 bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-400">📷</span>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold mb-2 line-clamp-2">{relatedAd.title}</h3>
                    <div className="text-blue-600 font-bold">{relatedAd.currency} {relatedAd.price.toLocaleString()}</div>
                    <div className="text-sm text-gray-500 mt-1">{relatedAd.city}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdDetails;