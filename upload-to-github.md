# رفع الكود إلى GitHub Repository

## خطوات رفع الملفات إلى: https://github.com/jehad-1993/Haraj-Syria

### الطريقة الأسهل: رفع الملفات مباشرة عبر واجهة GitHub

1. **اذهب إلى Repository:** https://github.com/jehad-1993/Haraj-Syria

2. **اضغط "Add file" -> "Create new file"**

3. **أنشئ الملفات التالية واحد تلو الآخر:**

#### الملف الأول: `vercel.json`
```json
{
  "version": 2,
  "builds": [
    {
      "src": "frontend/package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "frontend/build",
        "installCommand": "cd frontend && yarn install",
        "buildCommand": "cd frontend && yarn build"
      }
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
      "dest": "frontend/build/$1"
    }
  ],
  "env": {
    "MONGO_URL": "@mongo_url"
  }
}
```

#### الملف الثاني: `requirements.txt`
```
fastapi==0.104.1
uvicorn==0.24.0
pymongo==4.6.0
python-jose[cryptography]==3.3.0
python-multipart==0.0.6
bcrypt==4.1.2
pydantic==2.5.2
python-dotenv==1.0.0
aiofiles==23.2.1
```

#### الملف الثالث: `build.sh`
```bash
#!/bin/bash
echo "Building Haraj Syria Application"
cd frontend
yarn install
yarn build
cd ..
echo "Build completed successfully"
```

### بعد رفع هذه الملفات الأساسية:

سأساعدك في رفع باقي الملفات (frontend و backend folders) في الخطوة التالية.

هل تريد البدء برفع هذه الملفات الثلاثة أولاً؟