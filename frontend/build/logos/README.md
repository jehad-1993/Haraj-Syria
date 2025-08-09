# 🎨 شعارات حراج سوريا | Haraj Syria Logos

## 📁 الشعارات المتاحة | Available Logos

### الشعار المُطبق حالياً | Currently Applied Logo
- `logo-arabic.svg` - النسخة العربية (مُطبقة في الواجهة العربية)
- `logo-english.svg` - النسخة الإنجليزية (مُطبقة في الواجهة الإنجليزية)

### الشعارات الاحتياطية | Backup Logos
- `logo-traditional.svg` - الشعار التقليدي الكامل (عربي + إنجليزي)
- `logo-modern.svg` - الشعار الحديث المبسط
- `logo-composite.svg` - الشعار المركب

---

## 🔄 كيفية تغيير الشعار | How to Change Logo

### الطريقة الأولى: تغيير الشعار عبر الكود
1. اذهب إلى ملف `/app/frontend/src/App.js`
2. ابحث عن السطر رقم 187 تقريباً:
```jsx
<img 
  src={language === 'ar' ? '/logos/logo-arabic.svg' : '/logos/logo-english.svg'} 
  alt={t('appName')} 
  className="h-8 w-auto"
/>
```

3. غيّر أسماء الملفات حسب الشعار المطلوب:
```jsx
// للشعار الحديث
src={language === 'ar' ? '/logos/logo-modern.svg' : '/logos/logo-modern.svg'}

// للشعار المركب  
src={language === 'ar' ? '/logos/logo-composite.svg' : '/logos/logo-composite.svg'}

// للشعار التقليدي الكامل
src={'/logos/logo-traditional.svg'}
```

### الطريقة الثانية: استبدال الملفات
1. احفظ الشعار الجديد بنفس الاسم (`logo-arabic.svg`, `logo-english.svg`)
2. استبدل الملفات في مجلد `/app/frontend/public/logos/`
3. أعد تحميل الموقع

---

## 💾 حفظ الشعارات الاحتياطية | Save Backup Logos

### للحفظ على جهازك:
1. **افتح الرابط**: [معاينة الشعارات](https://036382c1-25df-47d0-aaa0-a75807568261.preview.emergentagent.com/logo-designs.html)
2. **انقر بالزر الأيمن** على أي شعار → "حفظ الصورة باسم"
3. **أو انسخ الروابط المباشرة**:
   - `/logos/logo-traditional.svg`
   - `/logos/logo-modern.svg` 
   - `/logos/logo-composite.svg`

### للنسخ الاحتياطي للمطور:
```bash
# انسخ مجلد الشعارات كاملاً
cp -r /app/frontend/public/logos /backup-location/

# أو انسخ شعار معين
cp /app/frontend/public/logos/logo-modern.svg /backup-location/
```

---

## ⚙️ خصائص الشعار الحالي | Current Logo Properties

- **النوع**: SVG (قابل للتكبير بدون فقدان الجودة)
- **الألوان**: أزرق داكن (#1e3c72) + ذهبي (#d4af37)  
- **الأبعاد**: 180×70 بكسل
- **الأيقونة**: قوس تراثي سوري
- **يتغير تلقائياً** حسب لغة الواجهة

---

## 🎨 إنشاء شعارات جديدة | Create New Logos

إذا أردت تصميم شعارات جديدة:

1. **استخدم أدوات التصميم**:
   - Adobe Illustrator
   - Figma
   - Canva
   - أو أي أداة تصميم SVG

2. **احفظ باصيغة SVG**
3. **ضع الملف في**: `/app/frontend/public/logos/`
4. **طبّق التغيير في الكود**

---

## 🔗 روابط مفيدة | Useful Links

- **معاينة الشعارات**: `/logo-designs.html`
- **الموقع الرئيسي**: [حراج سوريا](https://036382c1-25df-47d0-aaa0-a75807568261.preview.emergentagent.com)
- **مجلد الشعارات**: `/app/frontend/public/logos/`

---

**📅 تاريخ التحديث**: يناير 2025  
**🎨 المصمم**: AI Assistant