# 🚀 خطوات بسيطة للنشر (5 دقائق)

## ✅ أسرع طريقة - عبر موقع Vercel:

### 1️⃣ اذهب إلى موقعك
- افتح [vercel.com](https://vercel.com)
- سجل الدخول
- اختر مشروع "haraj-syria"

### 2️⃣ حدث ملف index.html
- اضغط على ملف `index.html` 
- اضغط "Edit" ✏️
- **احذف كل المحتوى**
- **انسخ والصق** الملف الجديد من هنا: `/app/index.html`
- اضغط "Save"

### 3️⃣ حدث ملف vercel.json
- ابحث عن ملف `vercel.json`
- اضغط "Edit" ✏️
- استبدل المحتوى بهذا:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "index.html",
      "use": "@vercel/static"
    },
    {
      "src": "backend/server.py",
      "use": "@vercel/python",
      "config": {
        "runtime": "python3.9"
      }
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "backend/server.py"
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ],
  "env": {
    "MONGO_URL": "@mongo_url"
  }
}
```
- اضغط "Save"

### 4️⃣ أعد النشر
- اذهب إلى "Deployments"
- اضغط "Redeploy"
- انتظر 2-5 دقائق

### 5️⃣ اختبر الموقع
- اذهب إلى: https://haraj-syria.vercel.app
- امسح cache: **Ctrl + F5**
- جرب تبديل اللغة والقوائم

---

## 🔥 بديل سريع - إذا كان لديك GitHub:

```bash
git add .
git commit -m "Fix website issues"
git push origin main
```

**انتهى! الموقع سيتحدث تلقائياً في 2-5 دقائق** ⚡