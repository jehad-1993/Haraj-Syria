# 🔧 إصلاح JavaScript للتنقل

## المشكلة الموجودة:
```javascript
function showPage(pageId) {
  // For this example, we're only showing the register page
  currentPage = pageId;
}
```

## الحل - استبدال هذه Function بالكود التالي:

```javascript
function showPage(pageId) {
  currentPage = pageId;
  
  // Hide all pages
  const pages = document.querySelectorAll('.page');
  pages.forEach(page => page.classList.remove('active'));
  
  // Show the selected page
  const targetPage = document.getElementById(pageId);
  if (targetPage) {
    targetPage.classList.add('active');
  } else {
    // If page doesn't exist, create a simple placeholder
    const mainContainer = document.querySelector('body');
    let pageElement = document.getElementById(pageId);
    
    if (!pageElement) {
      pageElement = document.createElement('div');
      pageElement.id = pageId;
      pageElement.className = 'page active';
      
      if (pageId === 'home') {
        pageElement.innerHTML = `
          <div class="hero-gradient py-20">
            <div class="container mx-auto px-4 text-center">
              <h1 class="text-5xl font-bold mb-4 text-gray-800">مرحباً بك في حراج سوريا</h1>
              <p class="text-xl mb-8 text-gray-600">منصة الإعلانات المبوبة الأولى في المنطقة العربية</p>
            </div>
          </div>
        `;
      } else if (pageId === 'categories') {
        pageElement.innerHTML = `
          <div class="container mx-auto px-4 py-8">
            <h1 class="text-3xl font-bold text-center mb-8">التصنيفات</h1>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-6xl mx-auto">
              <div class="category-card p-6 text-center rounded-lg shadow-md">
                <div class="text-4xl mb-3">🚗</div>
                <h3 class="font-semibold text-lg">سيارات</h3>
              </div>
              <div class="category-card p-6 text-center rounded-lg shadow-md">
                <div class="text-4xl mb-3">🏠</div>
                <h3 class="font-semibold text-lg">عقارات</h3>
              </div>
              <div class="category-card p-6 text-center rounded-lg shadow-md">
                <div class="text-4xl mb-3">📱</div>
                <h3 class="font-semibold text-lg">إلكترونيات</h3>
              </div>
              <div class="category-card p-6 text-center rounded-lg shadow-md">
                <div class="text-4xl mb-3">💼</div>
                <h3 class="font-semibold text-lg">وظائف</h3>
              </div>
            </div>
          </div>
        `;
      } else if (pageId === 'login') {
        pageElement.innerHTML = `
          <div class="container mx-auto px-4 py-8">
            <h1 class="text-3xl font-bold text-center mb-8">دخول</h1>
            <div class="form-container">
              <form onsubmit="handleLogin(event)">
                <div class="mb-4">
                  <label class="block text-gray-700 text-sm font-bold mb-2">البريد الإلكتروني</label>
                  <input type="email" class="form-input" required>
                </div>
                <div class="mb-6">
                  <label class="block text-gray-700 text-sm font-bold mb-2">كلمة المرور</label>
                  <input type="password" class="form-input" required>
                </div>
                <button type="submit" class="form-btn">دخول</button>
              </form>
            </div>
          </div>
        `;
      } else if (pageId === 'post-ad') {
        pageElement.innerHTML = `
          <div class="container mx-auto px-4 py-8">
            <h1 class="text-3xl font-bold text-center mb-8">أضف إعلان</h1>
            <div class="form-container">
              <form onsubmit="handlePostAd(event)">
                <div class="mb-4">
                  <label class="block text-gray-700 text-sm font-bold mb-2">عنوان الإعلان</label>
                  <input type="text" class="form-input" required>
                </div>
                <div class="mb-4">
                  <label class="block text-gray-700 text-sm font-bold mb-2">الوصف</label>
                  <textarea class="form-input" rows="4" required></textarea>
                </div>
                <div class="mb-6">
                  <label class="block text-gray-700 text-sm font-bold mb-2">السعر</label>
                  <input type="number" class="form-input" required>
                </div>
                <button type="submit" class="form-btn">نشر الإعلان</button>
              </form>
            </div>
          </div>
        `;
      }
      
      // Insert before the script tag
      const scriptTag = document.querySelector('script');
      scriptTag.parentNode.insertBefore(pageElement, scriptTag);
    }
  }
  
  // Update navigation active states
  const navLinks = document.querySelectorAll('.nav-link');
  navLinks.forEach(link => link.classList.remove('active'));
  
  const activeNavLink = document.getElementById('nav' + pageId.charAt(0).toUpperCase() + pageId.slice(1).replace('-', ''));
  if (activeNavLink) {
    activeNavLink.classList.add('active');
  }
}

function handleLogin(event) {
  event.preventDefault();
  alert('تم تسجيل الدخول بنجاح!');
}

function handlePostAd(event) {
  event.preventDefault();
  alert('تم نشر الإعلان بنجاح!');
}
```

## خطوات التطبيق:

1. **اذهب إلى**: https://github.com/jehad-1993/Haraj-Syria/blob/main/index.html
2. **اضغط Edit (رمز القلم)**
3. **ابحث عن السطر** (حوالي رقم 830):
   ```javascript
   function showPage(pageId) {
     // For this example, we're only showing the register page
     currentPage = pageId;
   }
   ```
4. **استبدلها بالكود الجديد أعلاه**
5. **اضغط "Commit changes"**

هذا سيحل مشكلة التنقل نهائياً! 🎉