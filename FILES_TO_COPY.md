# الملفات المطلوبة للنشر

## 1. ملف index.html
انسخ محتوى هذا الملف: `/app/index.html`

## 2. ملف vercel.json  
انسخ محتوى هذا الملف: `/app/vercel.json`

## محتوى vercel.json:
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

## الخطوات:
1. انسخ محتوى index.html من المجلد /app
2. انسخ محتوى vercel.json أعلاه
3. احفظهما في ملفات على حاسوبك
4. ارفعهما إلى Vercel كما هو موضح في الدليل