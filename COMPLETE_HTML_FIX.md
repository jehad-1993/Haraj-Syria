# 🔧 إصلاح شامل - إضافة جميع الصفحات

## المشكلة:
الصفحات الديناميكية لا تظهر المحتوى بشكل صحيح.

## الحل:
إضافة جميع الصفحات مباشرة في HTML قبل إغلاق tag `</header>`.

## الكود المطلوب إضافته:

### 1. ابحث عن هذا السطر في GitHub:
```html
</header>
```

### 2. أضف هذا الكود مباشرة بعد `</header>`:

```html
<!-- Main Content Pages -->
<main>
  <!-- Home Page -->
  <div id="home" class="page">
    <div class="hero-gradient py-20">
      <div class="container mx-auto px-4 text-center">
        <h1 class="text-5xl font-bold mb-4 text-gray-800" id="homeTitle">مرحباً بك في حراج سوريا</h1>
        <p class="text-xl mb-8 text-gray-600" id="homeSubtitle">منصة الإعلانات المبوبة الأولى في المنطقة العربية</p>
        
        <!-- Search Section -->
        <div class="max-w-4xl mx-auto mb-16">
          <div class="flex flex-col md:flex-row gap-4">
            <input type="text" class="search-input" id="searchInput" placeholder="ابحث عن أي شيء...">
            <button class="search-btn" id="searchBtn">بحث</button>
          </div>
        </div>
        
        <!-- Quick Categories -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
          <div class="category-card p-6 text-center rounded-lg shadow-md card-hover cursor-pointer">
            <div class="text-4xl mb-3">🚗</div>
            <h3 class="font-semibold text-lg">سيارات</h3>
            <p class="text-sm text-gray-500 mt-1">0 إعلان</p>
          </div>
          <div class="category-card p-6 text-center rounded-lg shadow-md card-hover cursor-pointer">
            <div class="text-4xl mb-3">🏠</div>
            <h3 class="font-semibold text-lg">عقارات</h3>
            <p class="text-sm text-gray-500 mt-1">0 إعلان</p>
          </div>
          <div class="category-card p-6 text-center rounded-lg shadow-md card-hover cursor-pointer">
            <div class="text-4xl mb-3">📱</div>
            <h3 class="font-semibold text-lg">إلكترونيات</h3>
            <p class="text-sm text-gray-500 mt-1">0 إعلان</p>
          </div>
          <div class="category-card p-6 text-center rounded-lg shadow-md card-hover cursor-pointer">
            <div class="text-4xl mb-3">💼</div>
            <h3 class="font-semibold text-lg">وظائف</h3>
            <p class="text-sm text-gray-500 mt-1">0 إعلان</p>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Categories Page -->
  <div id="categories" class="page">
    <div class="container mx-auto px-4 py-8">
      <h1 class="text-3xl font-bold text-center mb-8" id="categoriesTitle">التصنيفات</h1>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto">
        <div class="category-card p-6 text-center rounded-lg shadow-md card-hover cursor-pointer">
          <div class="text-5xl mb-4">🚗</div>
          <h3 class="font-semibold text-lg mb-2">سيارات</h3>
          <p class="text-sm text-gray-500">0 إعلان</p>
        </div>
        <div class="category-card p-6 text-center rounded-lg shadow-md card-hover cursor-pointer">
          <div class="text-5xl mb-4">🏠</div>
          <h3 class="font-semibold text-lg mb-2">عقارات</h3>
          <p class="text-sm text-gray-500">0 إعلان</p>
        </div>
        <div class="category-card p-6 text-center rounded-lg shadow-md card-hover cursor-pointer">
          <div class="text-5xl mb-4">📱</div>
          <h3 class="font-semibold text-lg mb-2">إلكترونيات</h3>
          <p class="text-sm text-gray-500">0 إعلان</p>
        </div>
        <div class="category-card p-6 text-center rounded-lg shadow-md card-hover cursor-pointer">
          <div class="text-5xl mb-4">💼</div>
          <h3 class="font-semibold text-lg mb-2">وظائف</h3>
          <p class="text-sm text-gray-500">0 إعلان</p>
        </div>
        <div class="category-card p-6 text-center rounded-lg shadow-md card-hover cursor-pointer">
          <div class="text-5xl mb-4">🪑</div>
          <h3 class="font-semibold text-lg mb-2">أثاث</h3>
          <p class="text-sm text-gray-500">0 إعلان</p>
        </div>
        <div class="category-card p-6 text-center rounded-lg shadow-md card-hover cursor-pointer">
          <div class="text-5xl mb-4">👕</div>
          <h3 class="font-semibold text-lg mb-2">ملابس</h3>
          <p class="text-sm text-gray-500">0 إعلان</p>
        </div>
        <div class="category-card p-6 text-center rounded-lg shadow-md card-hover cursor-pointer">
          <div class="text-5xl mb-4">🛠️</div>
          <h3 class="font-semibold text-lg mb-2">خدمات</h3>
          <p class="text-sm text-gray-500">0 إعلان</p>
        </div>
        <div class="category-card p-6 text-center rounded-lg shadow-md card-hover cursor-pointer">
          <div class="text-5xl mb-4">📦</div>
          <h3 class="font-semibold text-lg mb-2">أخرى</h3>
          <p class="text-sm text-gray-500">0 إعلان</p>
        </div>
      </div>
    </div>
  </div>

  <!-- Login Page -->
  <div id="login" class="page">
    <div class="container mx-auto px-4 py-8">
      <h1 class="text-3xl font-bold text-center mb-8" id="loginTitle">دخول</h1>
      <div class="form-container">
        <form onsubmit="handleLogin(event)">
          <div class="mb-4">
            <label class="block text-gray-700 text-sm font-bold mb-2" id="loginEmailLabel">البريد الإلكتروني *</label>
            <input type="email" id="loginEmail" class="form-input" required>
          </div>
          <div class="mb-6">
            <label class="block text-gray-700 text-sm font-bold mb-2" id="loginPasswordLabel">كلمة المرور *</label>
            <input type="password" id="loginPassword" class="form-input" required>
          </div>
          <button type="submit" class="form-btn" id="loginBtn">دخول</button>
          <div class="text-center mt-4">
            <a href="#" onclick="showPage('register')" class="text-blue-600 hover:text-blue-800" id="registerLink">ليس لديك حساب؟ سجل الآن</a>
          </div>
        </form>
      </div>
    </div>
  </div>

  <!-- Post Ad Page -->
  <div id="post-ad" class="page">
    <div class="container mx-auto px-4 py-8">
      <h1 class="text-3xl font-bold text-center mb-8" id="postAdTitle">أضف إعلان</h1>
      <div class="form-container">
        <form onsubmit="handlePostAd(event)">
          <div class="mb-4">
            <label class="block text-gray-700 text-sm font-bold mb-2" id="adTitleLabel">عنوان الإعلان *</label>
            <input type="text" id="adTitle" class="form-input" required>
          </div>
          <div class="mb-4">
            <label class="block text-gray-700 text-sm font-bold mb-2" id="adCategoryLabel">التصنيف *</label>
            <select id="adCategory" class="form-input" required>
              <option value="">اختر التصنيف...</option>
              <option value="cars">سيارات</option>
              <option value="real-estate">عقارات</option>
              <option value="electronics">إلكترونيات</option>
              <option value="jobs">وظائف</option>
              <option value="furniture">أثاث</option>
              <option value="clothing">ملابس</option>
              <option value="services">خدمات</option>
              <option value="others">أخرى</option>
            </select>
          </div>
          <div class="mb-4">
            <label class="block text-gray-700 text-sm font-bold mb-2" id="adDescriptionLabel">الوصف *</label>
            <textarea id="adDescription" class="form-input" rows="4" required></textarea>
          </div>
          <div class="mb-4">
            <label class="block text-gray-700 text-sm font-bold mb-2" id="adPriceLabel">السعر (ل.س) *</label>
            <input type="number" id="adPrice" class="form-input" required>
          </div>
          <div class="mb-6">
            <label class="block text-gray-700 text-sm font-bold mb-2" id="adLocationLabel">المدينة *</label>
            <select id="adLocation" class="form-input" required>
              <option value="">اختر المدينة...</option>
              <option value="damascus">دمشق</option>
              <option value="aleppo">حلب</option>
              <option value="homs">حمص</option>
              <option value="hama">حماة</option>
              <option value="latakia">اللاذقية</option>
              <option value="tartus">طرطوس</option>
            </select>
          </div>
          <button type="submit" class="form-btn" id="postAdBtn">نشر الإعلان</button>
        </form>
      </div>
    </div>
  </div>
</main>
```

### 3. أضف هذه Functions للتعامل مع النماذج (قبل إغلاق tag `</script>`):

```javascript
function handleLogin(event) {
  event.preventDefault();
  const email = document.getElementById('loginEmail').value;
  alert(currentLanguage === 'ar' ? 
    `مرحباً بعودتك!\nالبريد الإلكتروني: ${email}` :
    `Welcome back!\nEmail: ${email}`
  );
}

function handlePostAd(event) {
  event.preventDefault();
  const title = document.getElementById('adTitle').value;
  const category = document.getElementById('adCategory').value;
  const price = document.getElementById('adPrice').value;
  
  alert(currentLanguage === 'ar' ? 
    `تم نشر الإعلان بنجاح!\nالعنوان: ${title}\nالسعر: ${price} ل.س` :
    `Ad posted successfully!\nTitle: ${title}\nPrice: ${price} SYP`
  );
}
```

### 4. استبدال function showPage الموجودة بهذا:

```javascript
function showPage(pageId) {
  currentPage = pageId;
  
  // Hide all pages
  const pages = document.querySelectorAll('.page');
  pages.forEach(page => {
    page.classList.remove('active');
  });
  
  // Show the selected page
  const targetPage = document.getElementById(pageId);
  if (targetPage) {
    targetPage.classList.add('active');
  }
  
  // Update navigation active states
  const navLinks = document.querySelectorAll('.nav-link');
  navLinks.forEach(link => link.classList.remove('active'));
  
  const navMapping = {
    'home': 'navHome',
    'categories': 'navCategories',
    'register': 'navRegister', 
    'login': 'navLogin',
    'post-ad': 'navPostAd'
  };
  
  const activeNavId = navMapping[pageId];
  if (activeNavId) {
    const activeNavLink = document.getElementById(activeNavId);
    if (activeNavLink) {
      activeNavLink.classList.add('active');
    }
  }
}
```

### 5. تحديث تهيئة الصفحة:
استبدل هذا السطر في نهاية JavaScript:
```javascript
document.addEventListener('DOMContentLoaded', function() {
  updateLanguage();
});
```

بهذا:
```javascript
document.addEventListener('DOMContentLoaded', function() {
  updateLanguage();
  // Show home page by default
  showPage('home');
});
```