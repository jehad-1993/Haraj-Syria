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
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        test_user_data = {
            "name": "Ahmad Al-Shami",
            "email": f"ahmad_shami_{timestamp}@harajsyria.com",
            "phone": f"+96311{timestamp[-6:]}",
            "country": "SY",
            "city": "دمشق",
            "password": "Damascus2025!"
        }
        
        success, response = self.run_test("User Registration", "POST", "auth/register", 200, test_user_data)
        
        if success and isinstance(response, dict):
            if 'access_token' in response and 'user' in response:
                self.token = response['access_token']
                self.user_id = response['user']['id']
                # Store credentials for login test
                self.registered_email = test_user_data['email']
                self.registered_password = test_user_data['password']
                print(f"   Registered user with ID: {self.user_id}")
                return True
            else:
                self.log_test("Registration Response Validation", False, "Missing access_token or user in response")
        
        return success

    def test_forgot_password(self):
        """Test forgot password functionality"""
        if not hasattr(self, 'registered_email'):
            self.log_test("Forgot Password", False, "No registered user email available")
            return False
            
        forgot_data = {
            "email": self.registered_email,
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

    def test_login_user(self):
        """Test user login with registered credentials"""
        if not hasattr(self, 'registered_email') or not hasattr(self, 'registered_password'):
            self.log_test("User Login", False, "No registered user credentials available")
            return False
            
        login_data = {
            "email": self.registered_email,
            "password": self.registered_password
        }
        
        success, response = self.run_test("User Login", "POST", "auth/login", 200, login_data)
        
        if success and isinstance(response, dict):
            if 'access_token' in response and 'user' in response:
                self.token = response['access_token']
                self.user_id = response['user']['id']
                print(f"   ✅ Logged in as: {response['user']['name']}")
                print(f"   User email: {response['user']['email']}")
                return True
            else:
                self.log_test("Login Response Validation", False, "Missing access_token or user in response")
        
        return success

    def test_create_ad(self):
        """Test creating an ad (requires authentication)"""
        if not self.token:
            self.log_test("Create Ad", False, "No authentication token available")
            return False
        
        # First get a real category ID
        success, categories = self.run_test("Get Categories for Ad Creation", "GET", "categories", 200)
        if not success or not categories:
            self.log_test("Create Ad", False, "Could not get categories for ad creation")
            return False
        
        # Use the first category (cars)
        category_id = categories[0]['id'] if categories else "default_category"
        
        ad_data = {
            "title": "تويوتا كامري 2022 للبيع - حالة ممتازة",
            "description": "سيارة تويوتا كامري موديل 2022 في حالة ممتازة، قطعت 35000 كم فقط. السيارة محافظة عليها جداً ولم تتعرض لأي حوادث. جميع الصيانات الدورية تمت في الوكالة المعتمدة.",
            "price": 28500,
            "currency": "USD",
            "category_id": category_id,
            "country": "SY",
            "city": "دمشق",
            "area": "المزة",
            "contact_phone": "+963991234567",
            "contact_whatsapp": "+963991234567",
            "car_brand": "تويوتا",
            "car_model": "كامري",
            "car_year": 2022,
            "car_mileage": 35000,
            "car_condition": "excellent"
        }
        
        success, response = self.run_test("Create Ad", "POST", "ads", 200, ad_data)
        
        if success and isinstance(response, dict):
            if 'id' in response:
                self.created_ad_id = response['id']  # Store for other tests
                print(f"   Created ad with ID: {response['id']}")
                print(f"   Ad title: {response.get('title', 'N/A')}")
                print(f"   Ad status: {response.get('status', 'N/A')}")
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

    def test_get_user_ads(self):
        """Test getting user's own ads"""
        if not self.token:
            self.log_test("Get User Ads", False, "No authentication token available")
            return False
        
        success, response = self.run_test("Get User Ads", "GET", "users/ads", 200)
        
        if success and isinstance(response, list):
            print(f"   Found {len(response)} user ads")
            return True
        
        return success

    def test_get_single_ad(self):
        """Test getting a single ad by ID"""
        if not hasattr(self, 'created_ad_id'):
            self.log_test("Get Single Ad", False, "No created ad ID available")
            return False
        
        success, response = self.run_test("Get Single Ad", "GET", f"ads/{self.created_ad_id}", 200)
        
        if success and isinstance(response, dict):
            if 'id' in response and response['id'] == self.created_ad_id:
                print(f"   Retrieved ad: {response.get('title', 'N/A')}")
                print(f"   Views: {response.get('views', 0)}")
                return True
            else:
                self.log_test("Single Ad Response Validation", False, "Ad ID mismatch or missing")
        
        return success

    def test_car_models_endpoint(self):
        """Test car models endpoint"""
        success, response = self.run_test("Get Toyota Car Models", "GET", "car-models/تويوتا", 200)
        
        if success and isinstance(response, dict) and 'models' in response:
            models = response['models']
            if len(models) > 5:  # Should have multiple Toyota models
                print(f"   Found {len(models)} Toyota models")
                # Check if "كامري" (Camry) is included
                if "كامري" in models:
                    print("   ✓ Found 'كامري' (Camry) in Toyota models")
                return True
            else:
                self.log_test("Car Models Content Validation", False, f"Only found {len(models)} models")
        
        return success

    def test_car_conditions_endpoint(self):
        """Test car conditions endpoint"""
        success, response = self.run_test("Get Car Conditions", "GET", "car-conditions", 200)
        
        if success and isinstance(response, dict) and 'conditions' in response:
            conditions = response['conditions']
            if len(conditions) >= 5:  # Should have multiple conditions
                print(f"   Found {len(conditions)} car conditions")
                # Check if conditions have both Arabic and English names
                has_arabic = any('name_ar' in condition for condition in conditions)
                has_english = any('name_en' in condition for condition in conditions)
                if has_arabic and has_english:
                    print("   ✓ Car conditions have both Arabic and English names")
                    return True
                else:
                    self.log_test("Car Conditions Validation", False, "Missing Arabic or English names")
            else:
                self.log_test("Car Conditions Count Validation", False, f"Only found {len(conditions)} conditions")
        
        return success

    def test_phone_codes_endpoint(self):
        """Test phone codes endpoint"""
        success, response = self.run_test("Get Phone Codes", "GET", "phone-codes", 200)
        
        if success and isinstance(response, dict):
            # Check if Syria (+963) is included
            if "SY" in response and response["SY"] == "+963":
                print("   ✓ Found Syria phone code: +963")
                print(f"   Total countries with phone codes: {len(response)}")
                return True
            else:
                self.log_test("Phone Codes Validation", False, "Syria phone code not found or incorrect")
        
        return success

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