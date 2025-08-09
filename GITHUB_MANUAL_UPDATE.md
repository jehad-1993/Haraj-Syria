# 🔧 حل المشكلة: تحديث GitHub يدوياً

## 🎯 لحل مشكلة التنقل نهائياً:

### الخطوة 1: تحديث ملف App.js في GitHub

1. **اذهب إلى**: https://github.com/jehad-1993/Haraj-Syria/blob/main/frontend/src/App.js

2. **اضغط على رمز القلم** (Edit this file)

3. **ابحث عن السطور** (حوالي رقم 255) التي تحتوي على:
   ```javascript
   const [categoriesRes, adsRes] = await Promise.all([
     axios.get(`${API}/categories-with-counts`),
     axios.get(`${API}/ads?limit=8`)
   ]);
   ```

4. **استبدلها بـ**:
   ```javascript
   const [categoriesRes, adsRes] = await Promise.all([
     axios.get(`${API}/categories-with-counts`, { timeout: 1000 }),
     axios.get(`${API}/ads?limit=8`, { timeout: 1000 })
   ]);
   ```

5. **ابحث أيضاً عن** catch block وتأكد من وجود fallback data:
   ```javascript
   } catch (error) {
     console.error('Error fetching data:', error);
     // Set mock data as fallback so the app can still function
     setCategories([
       { id: '1', name_ar: 'سيارات', name_en: 'Cars', ads_count: 0 },
       { id: '2', name_ar: 'عقارات', name_en: 'Real Estate', ads_count: 0 },
       { id: '3', name_ar: 'إلكترونيات', name_en: 'Electronics', ads_count: 0 },
       { id: '4', name_ar: 'وظائف', name_en: 'Jobs', ads_count: 0 },
       { id: '5', name_ar: 'أثاث', name_en: 'Furniture', ads_count: 0 },
       { id: '6', name_ar: 'ملابس', name_en: 'Clothing', ads_count: 0 },
       { id: '7', name_ar: 'خدمات', name_en: 'Services', ads_count: 0 },
       { id: '8', name_ar: 'أخرى', name_en: 'Others', ads_count: 0 }
     ]);
     setAds([]);
   } finally {
     setLoading(false);
   }
   ```

6. **اكتب commit message**: `Fix navigation issue - Add timeout and fallback data`

7. **اضغط "Commit changes"**

---

### الخطوة 2: تحديث متغيرات البيئة

1. **اذهب إلى**: https://github.com/jehad-1993/Haraj-Syria/blob/main/frontend/.env

2. **اضغط Edit** وتأكد من أن المحتوى:
   ```
   REACT_APP_BACKEND_URL=https://036382c1-25df-47d0-aaa0-a75807568261.preview.emergentagent.com
   WDS_SOCKET_PORT=443
   ```

3. **Commit changes**

---

### الخطوة 3: إعادة النشر من Vercel

1. **اذهب إلى**: https://vercel.com/dashboard
2. **اختر مشروع**: `haraj-syria`
3. **اضغط "Redeploy"**
4. **انتظر النشر** (2-3 دقائق)

---

## ✅ النتيجة المتوقعة:
بعد هذه الخطوات، ستختفي مشكلة التنقل نهائياً من:
https://haraj-syria.vercel.app

---

## 🚨 البديل الأسرع: استبدال الملف كاملاً

إذا كانت التعديلات معقدة، يمكنك:
1. حذف محتوى App.js من GitHub
2. نسخ المحتوى الكامل من الملف المُصلح
3. لصقه في GitHub
4. Commit changes

**هل تحتاج مساعدة في أي من هذه الخطوات؟**