import requests
import sys
import json
from datetime import datetime

class HarajSyriaAPITester:
    def __init__(self, base_url="https://562d1efc-c752-4a02-8150-81962517ac18.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.token = None
        self.user_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def log_test(self, name, success, details=""):
        """Log test results"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name} - PASSED")
        else:
            print(f"❌ {name} - FAILED: {details}")
        
        self.test_results.append({
            "name": name,
            "success": success,
            "details": details
        })

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        
        if self.token:
            test_headers['Authorization'] = f'Bearer {self.token}'
        
        if headers:
            test_headers.update(headers)

        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=test_headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=test_headers, timeout=10)

            success = response.status_code == expected_status
            
            if success:
                self.log_test(name, True)
                try:
                    return True, response.json()
                except:
                    return True, response.text
            else:
                error_msg = f"Expected {expected_status}, got {response.status_code}"
                try:
                    error_detail = response.json()
                    error_msg += f" - {error_detail}"
                except:
                    error_msg += f" - {response.text[:200]}"
                
                self.log_test(name, False, error_msg)
                return False, {}

        except Exception as e:
            self.log_test(name, False, f"Exception: {str(e)}")
            return False, {}

    def test_health_check(self):
        """Test health check endpoint"""
        return self.run_test("Health Check", "GET", "health", 200)

    def test_get_countries(self):
        """Test countries endpoint"""
        success, response = self.run_test("Get Countries", "GET", "countries", 200)
        if success and isinstance(response, dict):
            # Check if we have expected Arab countries
            expected_countries = ["SA", "AE", "SY", "EG", "JO"]
            found_countries = [code for code in expected_countries if code in response]
            if len(found_countries) >= 3:
                print(f"   Found {len(found_countries)} expected countries")
                return True
            else:
                self.log_test("Countries Content Validation", False, f"Only found {len(found_countries)} expected countries")
        return success

    def test_get_cities(self):
        """Test cities endpoint for Syria"""
        success, response = self.run_test("Get Cities for Syria", "GET", "cities/SY", 200)
        if success and isinstance(response, dict) and 'cities' in response:
            cities = response['cities']
            if len(cities) > 5:  # Should have multiple Syrian cities
                print(f"   Found {len(cities)} cities for Syria")
                return True
            else:
                self.log_test("Cities Content Validation", False, f"Only found {len(cities)} cities")
        return success

    def test_get_categories(self):
        """Test categories endpoint"""
        success, response = self.run_test("Get Categories", "GET", "categories", 200)
        if success and isinstance(response, list):
            if len(response) >= 8:  # Should have 8 main categories
                print(f"   Found {len(response)} categories")
                return True
            else:
                self.log_test("Categories Count Validation", False, f"Only found {len(response)} categories, expected 8")
        return success

    def test_get_categories_with_counts(self):
        """Test NEW categories-with-counts endpoint"""
        success, response = self.run_test("Get Categories with Counts", "GET", "categories-with-counts", 200)
        if success and isinstance(response, list):
            if len(response) >= 8:  # Should have 8 main categories
                print(f"   Found {len(response)} categories with counts")
                # Check if ads_count field is present
                has_counts = all('ads_count' in category for category in response)
                if has_counts:
                    print("   ✅ All categories have ads_count field")
                    total_ads = sum(category.get('ads_count', 0) for category in response)
                    print(f"   Total ads across all categories: {total_ads}")
                    return True
                else:
                    self.log_test("Categories Counts Validation", False, "Some categories missing ads_count field")
            else:
                self.log_test("Categories with Counts Validation", False, f"Only found {len(response)} categories, expected 8")
        return success

    def test_get_subcategories(self):
        """Test subcategories endpoints"""
        # Test cars subcategories
        success1, response1 = self.run_test("Get Cars Subcategories", "GET", "subcategories/cars", 200)
        
        # Test all subcategories
        success2, response2 = self.run_test("Get All Subcategories", "GET", "all-subcategories", 200)
        
        if success2 and isinstance(response2, dict):
            expected_categories = ["cars", "real_estate", "electronics", "jobs", "furniture", "clothing", "services", "others"]
            found_categories = [cat for cat in expected_categories if cat in response2]
            if len(found_categories) >= 6:
                print(f"   Found {len(found_categories)} category types in subcategories")
                return True
            else:
                self.log_test("Subcategories Content Validation", False, f"Only found {len(found_categories)} category types")
        
        return success1 and success2

    def test_get_car_data(self):
        """Test car brands and years endpoints"""
        success1, response1 = self.run_test("Get Car Brands", "GET", "car-brands", 200)
        success2, response2 = self.run_test("Get Car Years", "GET", "car-years", 200)
        
        brands_valid = False
        years_valid = False
        
        if success1 and isinstance(response1, dict) and 'brands' in response1:
            brands = response1['brands']
            if len(brands) > 20:  # Should have many car brands
                print(f"   Found {len(brands)} car brands")
                # Check if "أخرى" (Others) is included
                if "أخرى" in brands:
                    print("   ✓ Found 'أخرى' (Others) option in car brands")
                brands_valid = True
        
        if success2 and isinstance(response2, dict) and 'years' in response2:
            years = response2['years']
            if len(years) > 30:  # Should have years from 2010-2050
                print(f"   Found {len(years)} car years")
                # Check if "أخرى" (Others) is included
                if "أخرى" in years:
                    print("   ✓ Found 'أخرى' (Others) option in car years")
                years_valid = True
        
        return success1 and success2 and brands_valid and years_valid

    def test_register_user(self):
        """Test user registration"""
        test_user_data = {
            "name": "Test User",
            "email": f"test_user_{datetime.now().strftime('%H%M%S')}@test.com",
            "phone": "+963123456789",
            "country": "SY",
            "city": "دمشق",
            "password": "TestPass123!"
        }
        
        success, response = self.run_test("User Registration", "POST", "auth/register", 200, test_user_data)
        
        if success and isinstance(response, dict):
            if 'access_token' in response and 'user' in response:
                self.token = response['access_token']
                self.user_id = response['user']['id']
                print(f"   Registered user with ID: {self.user_id}")
                return True
            else:
                self.log_test("Registration Response Validation", False, "Missing access_token or user in response")
        
        return success

    def test_forgot_password(self):
        """Test NEW forgot password functionality"""
        forgot_data = {
            "email": "final1754470057@test.com",
            "method": "email"
        }
        
        success, response = self.run_test("Forgot Password", "POST", "auth/forgot-password", 200, forgot_data)
        
        if success and isinstance(response, dict):
            if 'message' in response:
                print(f"   Message: {response['message']}")
                # Check for development info
                if 'dev_info' in response:
                    dev_info = response['dev_info']
                    if 'token' in dev_info:
                        print(f"   ✅ Reset token generated: {dev_info['token'][:10]}...")
                        # Store token for reset password test
                        self.reset_token = dev_info['token']
                        return True
                    else:
                        self.log_test("Forgot Password Token Validation", False, "No token in dev_info")
                else:
                    print("   ✅ Password reset request processed (no dev_info in production)")
                    return True
            else:
                self.log_test("Forgot Password Response Validation", False, "Missing message in response")
        
        return success

    def test_reset_password(self):
        """Test NEW reset password functionality"""
        if not hasattr(self, 'reset_token'):
            self.log_test("Reset Password", False, "No reset token available from forgot password test")
            return False
        
        reset_data = {
            "token": self.reset_token,
            "new_password": "NewTestPass123!"
        }
        
        success, response = self.run_test("Reset Password", "POST", "auth/reset-password", 200, reset_data)
        
        if success and isinstance(response, dict):
            if 'message' in response:
                print(f"   Message: {response['message']}")
                return True
            else:
                self.log_test("Reset Password Response Validation", False, "Missing message in response")
        
        return success

    def test_login_with_test_credentials(self):
        """Test login with the specific test credentials mentioned in the request"""
        login_data = {
            "email": "final1754470057@test.com",
            "password": "FinalTest123!"
        }
        
        success, response = self.run_test("Login with Test Credentials", "POST", "auth/login", 200, login_data)
        
        if success and isinstance(response, dict):
            if 'access_token' in response and 'user' in response:
                print(f"   ✅ Logged in as: {response['user']['name']}")
                print(f"   User email: {response['user']['email']}")
                return True
            else:
                self.log_test("Test Login Response Validation", False, "Missing access_token or user in response")
        
        return success

    def test_create_ad(self):
        """Test creating an ad (requires authentication)"""
        if not self.token:
            self.log_test("Create Ad", False, "No authentication token available")
            return False
        
        ad_data = {
            "title": "تويوتا كامري 2020 للبيع",
            "description": "سيارة تويوتا كامري موديل 2020 في حالة ممتازة، قطعت 50000 كم فقط",
            "price": 25000,
            "currency": "USD",
            "category_id": "cars_category_id",  # This would need to be a real category ID
            "country": "SY",
            "city": "دمشق",
            "contact_phone": "+963123456789",
            "contact_whatsapp": "+963123456789",
            "car_brand": "تويوتا",
            "car_model": "كامري",
            "car_year": 2020,
            "car_mileage": 50000,
            "car_condition": "ممتاز"
        }
        
        success, response = self.run_test("Create Ad", "POST", "ads", 200, ad_data)
        
        if success and isinstance(response, dict):
            if 'id' in response:
                print(f"   Created ad with ID: {response['id']}")
                return True
            else:
                self.log_test("Create Ad Response Validation", False, "Missing ad ID in response")
        
        return success

    def test_get_ads(self):
        """Test getting ads list"""
        success, response = self.run_test("Get Ads List", "GET", "ads", 200)
        
        if success and isinstance(response, list):
            print(f"   Found {len(response)} ads")
            return True
        
        return success

    def test_get_ads_with_filters(self):
        """Test getting ads with filters"""
        # Test with country filter
        success1, response1 = self.run_test("Get Ads with Country Filter", "GET", "ads?country=SY", 200)
        
        # Test with search filter
        success2, response2 = self.run_test("Get Ads with Search Filter", "GET", "ads?search=تويوتا", 200)
        
        return success1 and success2

    def run_all_tests(self):
        """Run all API tests"""
        print("🚀 Starting Haraj Syria API Tests")
        print("=" * 50)
        
        # Basic endpoints
        self.test_health_check()
        self.test_get_countries()
        self.test_get_cities()
        self.test_get_categories()
        self.test_get_categories_with_counts()  # NEW API
        self.test_get_subcategories()
        self.test_get_car_data()
        
        # Authentication tests
        self.test_register_user()
        self.test_login_with_test_credentials()  # NEW test with specific credentials
        self.test_forgot_password()  # NEW API
        self.test_reset_password()   # NEW API
        
        # Ads tests
        self.test_create_ad()
        self.test_get_ads()
        self.test_get_ads_with_filters()
        
        # Print final results
        print("\n" + "=" * 50)
        print("📊 TEST RESULTS SUMMARY")
        print("=" * 50)
        print(f"Total Tests: {self.tests_run}")
        print(f"Passed: {self.tests_passed}")
        print(f"Failed: {self.tests_run - self.tests_passed}")
        print(f"Success Rate: {(self.tests_passed/self.tests_run)*100:.1f}%")
        
        # Print failed tests details
        failed_tests = [test for test in self.test_results if not test['success']]
        if failed_tests:
            print("\n❌ FAILED TESTS:")
            for test in failed_tests:
                print(f"   - {test['name']}: {test['details']}")
        
        return self.tests_passed == self.tests_run

def main():
    tester = HarajSyriaAPITester()
    success = tester.run_all_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())