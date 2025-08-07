# 🇸🇾 Haraj Syria - منصة الإعلانات المبوبة

تطبيق ويب متكامل للإعلانات المبوبة مخصص للسوق السورية مع دعم كامل للغة العربية والإنجليزية.

## 🌟 المميزات الرئيسية

- **دعم ثنائي اللغة**: العربية والإنجليزية مع RTL support
- **شعار مخصص**: شعار أنيق بالقوس التراثي السوري
- **إدارة الإعلانات**: نشر وتصفح الإعلانات بسهولة
- **نظام المستخدمين**: تسجيل وتسجيل دخول آمن
- **البحث والفلترة**: بحث متقدم حسب الفئات والمواقع
- **تحميل الصور**: دعم الصور مع lazy loading
- **تصميم متجاوب**: يعمل على جميع الأجهزة

## 🛠️ التقنيات المستخدمة

### Backend
- **FastAPI**: Python web framework
- **MongoDB**: NoSQL database
- **JWT**: Authentication
- **Bcrypt**: Password hashing
- **Pydantic**: Data validation

### Frontend
- **React**: User interface library
- **Tailwind CSS**: Styling framework
- **React Router**: Navigation
- **Axios**: HTTP client
- **Context API**: State management

## 🚀 النشر على Vercel

### المتطلبات
1. حساب GitHub
2. حساب Vercel مجاني
3. حساب MongoDB Atlas مجاني

### خطوات النشر

#### 1. حفظ المشروع في GitHub
```bash
# إذا لم تكن قد حفظت المشروع بعد
git init
git add .
git commit -m "Initial commit: Haraj Syria app"
git remote add origin https://github.com/yourusername/haraj-syria.git
git push -u origin main
```

#### 2. إعداد MongoDB Atlas
1. اذهب إلى [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. أنشئ حساب مجاني
3. أنشئ cluster جديد
4. احصل على connection string

#### 3. النشر على Vercel

##### طريقة الواجهة الرسومية:
1. اذهب إلى [Vercel](https://vercel.com)
2. سجل دخول باستخدام GitHub
3. اضغط "New Project"
4. اختر repository الخاص بـ Haraj Syria
5. اضغط "Deploy"

##### طريقة Command Line:
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy the project
vercel --prod
```

#### 4. إعداد متغيرات البيئة في Vercel
1. اذهب إلى Project Settings في Vercel
2. اضغط Environment Variables
3. أضف المتغيرات التالية:

```
MONGO_URL=mongodb+srv://username:password@cluster.mongodb.net/haraj-syria
REACT_APP_BACKEND_URL=https://your-vercel-app.vercel.app
```

#### 5. إعادة النشر
بعد إضافة متغيرات البيئة، اضغط "Redeploy" لإعادة النشر.

## 📁 هيكل المشروع

```
haraj-syria/
├── frontend/                 # React application
│   ├── public/
│   │   ├── logos/            # App logos (Arabic & English)
│   │   └── index.html
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── contexts/         # React contexts
│   │   ├── App.js           # Main app component
│   │   └── index.js         # Entry point
│   └── package.json
├── backend/                  # FastAPI application
│   ├── server.py            # Main backend server
│   └── requirements.txt     # Python dependencies
├── vercel.json              # Vercel configuration
├── requirements.txt         # Root Python dependencies
└── README.md               # This file
```

## 🔧 التطوير المحلي

### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn server:app --reload --host 0.0.0.0 --port 8001
```

### Frontend
```bash
cd frontend
yarn install
yarn start
```

## 🌐 العنوان المباشر
بعد النشر، ستحصل على رابط مثل: `https://haraj-syria.vercel.app`

## 📞 الدعم والمساهمة

لأي استفسارات أو مقترحات، يرجى إنشاء issue في GitHub.

---

**تم تطوير هذا المشروع بواسطة AI Assistant على منصة Emergent** 🤖✨
