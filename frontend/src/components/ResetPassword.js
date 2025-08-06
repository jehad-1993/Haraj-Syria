import React, { useState, useContext, useEffect } from "react";
import { LanguageContext } from "../App";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const ResetPassword = () => {
  const { language } = useContext(LanguageContext);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [formData, setFormData] = useState({
    token: searchParams.get('token') || '',
    new_password: '',
    confirm_password: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
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
    if (!formData.token) {
      setError(language === 'ar' ? 'رمز إعادة التعيين مفقود' : 'Reset token is missing');
    }
  }, [formData.token, language]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    if (!formData.token) {
      setError(language === 'ar' ? 'رمز إعادة التعيين مطلوب' : 'Reset token is required');
      setLoading(false);
      return;
    }
    
    if (formData.new_password !== formData.confirm_password) {
      setError(language === 'ar' ? 'كلمات المرور غير متطابقة' : 'Passwords do not match');
      setLoading(false);
      return;
    }
    
    if (!Object.values(passwordStrength).every(Boolean)) {
      setError(language === 'ar' ? 'كلمة المرور لا تلبي جميع الشروط' : 'Password does not meet all requirements');
      setLoading(false);
      return;
    }
    
    try {
      await axios.post(`${API}/auth/reset-password`, {
        token: formData.token,
        new_password: formData.new_password
      });
      
      setSuccess(language === 'ar' ? 'تم إعادة تعيين كلمة المرور بنجاح! جاري التوجيه لتسجيل الدخول...' : 'Password has been reset successfully! Redirecting to login...');
      
      setTimeout(() => {
        navigate('/login');
      }, 3000);
      
    } catch (error) {
      setError(error.response?.data?.detail || (language === 'ar' ? 'حدث خطأ في إعادة تعيين كلمة المرور' : 'Error resetting password'));
    } finally {
      setLoading(false);
    }
  };
  
  if (success) {
    return (
      <div className={`min-h-screen bg-gray-50 py-12 ${language === 'ar' ? 'rtl' : 'ltr'}`}>
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-8 text-center">
            <div className="text-6xl mb-4">✅</div>
            <h2 className="text-2xl font-bold text-green-600 mb-4">
              {language === 'ar' ? 'تم بنجاح!' : 'Success!'}
            </h2>
            <p className="text-gray-600">{success}</p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className={`min-h-screen bg-gray-50 py-12 ${language === 'ar' ? 'rtl' : 'ltr'}`}>
      <div className="container mx-auto px-4">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-center mb-8">
            {language === 'ar' ? 'إعادة تعيين كلمة المرور' : 'Reset Password'}
          </h2>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {!searchParams.get('token') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {language === 'ar' ? 'رمز إعادة التعيين' : 'Reset Token'}
                </label>
                <input
                  type="text"
                  value={formData.token}
                  onChange={(e) => setFormData({...formData, token: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={language === 'ar' ? 'أدخل الرمز المرسل إليك' : 'Enter the token sent to you'}
                  required
                />
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {language === 'ar' ? 'كلمة المرور الجديدة' : 'New Password'}
              </label>
              <input
                type="password"
                value={formData.new_password}
                onChange={(e) => {
                  setFormData({...formData, new_password: e.target.value});
                  checkPasswordStrength(e.target.value);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              
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
                {language === 'ar' ? 'تأكيد كلمة المرور' : 'Confirm Password'}
              </label>
              <input
                type="password"
                value={formData.confirm_password}
                onChange={(e) => setFormData({...formData, confirm_password: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-md disabled:opacity-50"
            >
              {loading ? (language === 'ar' ? 'جاري الحفظ...' : 'Saving...') : (language === 'ar' ? 'إعادة تعيين كلمة المرور' : 'Reset Password')}
            </button>
          </form>
          
          <div className="text-center mt-6">
            <button
              onClick={() => navigate('/login')}
              className="text-blue-600 hover:text-blue-700 text-sm"
            >
              {language === 'ar' ? 'العودة لتسجيل الدخول' : 'Back to Login'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;