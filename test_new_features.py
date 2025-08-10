import requests
import sys
import json
from datetime import datetime

class NewFeaturesAPITester:
    def __init__(self, base_url="https://77dcd158-47b2-4f3f-96d9-b244d15ee6d8.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.tests_run = 0
        self.tests_passed = 0

    def log_test(self, name, success, details=""):
        """Log test results"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name} - PASSED")
        else:
            print(f"❌ {name} - FAILED: {details}")

    def run_test(self, name, method, endpoint, expected_status, data=None):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}

        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=10)

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

    def test_car_models_api(self):
        """Test new car models API for specific brands"""
        brands_to_test = ["تويوتا", "كيا", "هيونداي", "مرسيدس"]
        
        for brand in brands_to_test:
            success, response = self.run_test(
                f"Car Models for {brand}", 
                "GET", 
                f"car-models/{brand}", 
                200
            )
            
            if success and isinstance(response, dict) and 'models' in response:
                models = response['models']
                print(f"   Found {len(models)} models for {brand}: {models[:3]}...")
                
                # Check if "أخرى" (Others) is included
                if "أخرى" in models:
                    print(f"   ✓ 'أخرى' option found for {brand}")
                else:
                    print(f"   ⚠️  'أخرى' option missing for {brand}")
            else:
                return False
        
        return True

    def test_phone_codes_api(self):
        """Test new phone codes API"""
        success, response = self.run_test("Phone Codes API", "GET", "phone-codes", 200)
        
        if success and isinstance(response, dict):
            # Check for expected country codes
            expected_codes = ["SY", "SA", "AE", "EG", "JO"]
            found_codes = [code for code in expected_codes if code in response]
            
            print(f"   Found phone codes for {len(found_codes)} countries")
            print(f"   Syria code: {response.get('SY', 'Not found')}")
            
            if len(found_codes) >= 3:
                return True
            else:
                self.log_test("Phone Codes Content", False, f"Only found {len(found_codes)} expected codes")
        
        return success

    def test_admin_pending_ads_api(self):
        """Test admin pending ads API"""
        success, response = self.run_test("Admin Pending Ads", "GET", "admin/ads/pending", 200)
        
        if success and isinstance(response, list):
            print(f"   Found {len(response)} pending ads")
            
            # Check if any ads have pending status
            pending_ads = [ad for ad in response if ad.get('status') == 'pending']
            print(f"   Ads with pending status: {len(pending_ads)}")
            
            return True
        
        return success

    def test_subcategories_updates(self):
        """Test updated subcategories with new additions"""
        # Test cars subcategories for "سيارات سيدان"
        success, response = self.run_test("Cars Subcategories Update", "GET", "subcategories/cars", 200)
        
        if success and isinstance(response, dict) and 'subcategories' in response:
            subcategories = response['subcategories']
            
            # Check for "سيارات سيدان"
            sedan_found = any(sub.get('name_ar') == 'سيارات سيدان' for sub in subcategories)
            others_found = any(sub.get('name_ar') == 'أخرى' for sub in subcategories)
            
            print(f"   Total subcategories: {len(subcategories)}")
            print(f"   'سيارات سيدان' found: {sedan_found}")
            print(f"   'أخرى' found: {others_found}")
            
            if sedan_found and others_found:
                return True
            else:
                self.log_test("Subcategories Content", False, f"Missing expected subcategories")
        
        return success

    def test_all_subcategories_others(self):
        """Test that all subcategories have 'أخرى' option"""
        success, response = self.run_test("All Subcategories Others Check", "GET", "all-subcategories", 200)
        
        if success and isinstance(response, dict):
            categories_with_others = 0
            total_categories = len(response)
            
            for category_key, category_data in response.items():
                if 'subcategories' in category_data:
                    subcategories = category_data['subcategories']
                    has_others = any(sub.get('name_ar') == 'أخرى' for sub in subcategories)
                    
                    if has_others:
                        categories_with_others += 1
                    else:
                        print(f"   ⚠️  Category '{category_key}' missing 'أخرى' option")
            
            print(f"   Categories with 'أخرى': {categories_with_others}/{total_categories}")
            
            if categories_with_others == total_categories:
                return True
            else:
                self.log_test("Others Option Check", False, f"Only {categories_with_others}/{total_categories} have 'أخرى'")
        
        return success

    def run_all_tests(self):
        """Run all new features tests"""
        print("🚀 Testing New Features for Haraj Syria")
        print("=" * 50)
        
        # Test new APIs
        self.test_car_models_api()
        self.test_phone_codes_api()
        self.test_admin_pending_ads_api()
        
        # Test updated subcategories
        self.test_subcategories_updates()
        self.test_all_subcategories_others()
        
        # Print final results
        print("\n" + "=" * 50)
        print("📊 NEW FEATURES TEST RESULTS")
        print("=" * 50)
        print(f"Total Tests: {self.tests_run}")
        print(f"Passed: {self.tests_passed}")
        print(f"Failed: {self.tests_run - self.tests_passed}")
        print(f"Success Rate: {(self.tests_passed/self.tests_run)*100:.1f}%")
        
        return self.tests_passed == self.tests_run

def main():
    tester = NewFeaturesAPITester()
    success = tester.run_all_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())