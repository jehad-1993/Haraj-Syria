# 🛠️ دليل النشر اليدوي - حل مشكلة التنقل

## 🔍 سبب المشكلة المستمرة:
- ✅ الكود مُصلح محلياً
- ❌ GitHub لا يحتوي على آخر إصدار
- ❌ Vercel ينشر من GitHub القديم

## 🎯 الحل النهائي:

### الطريقة الأولى: تحديث الملفات في GitHub يدوياً

1. **اذهب إلى**: https://github.com/jehad-1993/Haraj-Syria
2. **اضغط على**: `frontend/src/App.js`
3. **اضغط على رمز القلم** لتحرير الملف
4. **ابحث عن السطور** (حوالي رقم 255):
   ```javascript
   axios.get(`${API}/categories-with-counts`),
   axios.get(`${API}/ads?limit=8`)
   ```
5. **غيرها إلى**:
   ```javascript
   axios.get(`${API}/categories-with-counts`, { timeout: 1000 }),
   axios.get(`${API}/ads?limit=8`, { timeout: 1000 })
   ```
6. **اضغط "Commit changes"**

### الطريقة الثانية: استبدال الملف كاملاً

1. **انسخ المحتوى** من الملف المُصلح:

```javascript
// محتوى App.js الجديد سيكون في الرسالة التالية
```

---

## 🚀 بعد تحديث GitHub:

1. **اذهب إلى Vercel Dashboard**
2. **اختر مشروع haraj-syria**  
3. **اضغط "Redeploy"**
4. **انتظر النشر** (2-3 دقائق)

## ✅ للتحقق من الحل:
- اذهب إلى: https://haraj-syria.vercel.app
- جرب التنقل بين الصفحات
- يجب أن يعمل التنقل بدون مشاكل

---

## 📦 ملف الحلول البديلة:
تم إنشاء `haraj-syria-fixed.tar.gz` يحتوي على جميع الملفات المُصلحة