import requests
import sys
import json
from datetime import datetime

class ApprovalSystemTester:
    def __init__(self, base_url="https://ca33c9b0-1706-48ac-be05-1e904cd05bee.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.token = None
        self.user_id = None
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

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        
        if self.token:
            test_headers['Authorization'] = f'Bearer {self.token}'
        
        if headers:
            test_headers.update(headers)

        print(f"\n🔍 Testing {name}...")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=test_headers, timeout=10)

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

    def test_register_new_user(self):
        """Test registering a completely new user"""
        timestamp = datetime.now().strftime('%H%M%S%f')
        test_user_data = {
            "name": f"Test User {timestamp}",
            "email": f"testuser_{timestamp}@example.com",
            "phone": f"+96312345{timestamp[-4:]}",
            "country": "SY",
            "city": "دمشق",
            "password": "TestPass123!"
        }
        
        success, response = self.run_test("Register New User", "POST", "auth/register", 200, test_user_data)
        
        if success and isinstance(response, dict):
            if 'access_token' in response and 'user' in response:
                self.token = response['access_token']
                self.user_id = response['user']['id']
                print(f"   Registered user: {response['user']['name']} ({response['user']['email']})")
                return True
            else:
                self.log_test("Registration Response Validation", False, "Missing access_token or user in response")
        
        return success

    def test_create_ad_pending_status(self):
        """Test creating an ad and verify it has pending status"""
        if not self.token:
            self.log_test("Create Ad with Pending Status", False, "No authentication token available")
            return False
        
        # First get a valid category ID
        success, categories = self.run_test("Get Categories for Ad Creation", "GET", "categories", 200)
        if not success or not categories:
            return False
        
        category_id = categories[0]['id'] if categories else "test_category"
        
        ad_data = {
            "title": f"Test Ad - {datetime.now().strftime('%H:%M:%S')}",
            "description": "This is a test ad to verify the approval system works correctly. The ad should be created with pending status.",
            "price": 1000,
            "currency": "USD",
            "category_id": category_id,
            "country": "SY",
            "city": "دمشق",
            "contact_phone": "+963123456789",
            "ad_type": "free"
        }
        
        success, response = self.run_test("Create Ad with Pending Status", "POST", "ads", 200, ad_data)
        
        if success and isinstance(response, dict):
            if 'id' in response and 'status' in response:
                ad_id = response['id']
                status = response['status']
                print(f"   Created ad ID: {ad_id}")
                print(f"   Ad status: {status}")
                
                if status == 'pending':
                    print("✅ Ad correctly created with 'pending' status")
                    return ad_id
                else:
                    self.log_test("Ad Status Check", False, f"Expected 'pending', got '{status}'")
                    return False
            else:
                self.log_test("Create Ad Response", False, "Missing id or status in response")
        
        return False

    def test_pending_ads_endpoint(self):
        """Test the admin pending ads endpoint"""
        success, response = self.run_test("Get Pending Ads", "GET", "admin/ads/pending", 200)
        
        if success and isinstance(response, list):
            pending_count = len(response)
            print(f"   Found {pending_count} pending ads")
            
            # Check if ads have pending status
            actual_pending = [ad for ad in response if ad.get('status') == 'pending']
            print(f"   Ads with 'pending' status: {len(actual_pending)}")
            
            if len(actual_pending) > 0:
                print("✅ Found ads with pending status")
                return response[0]['id'] if response else None
            else:
                print("⚠️  No ads with pending status found")
                return None
        
        return success

    def test_approve_ad(self, ad_id):
        """Test approving an ad"""
        if not ad_id:
            self.log_test("Approve Ad", False, "No ad ID provided")
            return False
        
        success, response = self.run_test(f"Approve Ad {ad_id}", "PUT", f"admin/ads/{ad_id}/approve", 200)
        
        if success:
            print(f"✅ Successfully approved ad {ad_id}")
            return True
        
        return success

    def test_reject_ad(self, ad_id):
        """Test rejecting an ad"""
        if not ad_id:
            self.log_test("Reject Ad", False, "No ad ID provided")
            return False
        
        success, response = self.run_test(f"Reject Ad {ad_id}", "PUT", f"admin/ads/{ad_id}/reject", 200)
        
        if success:
            print(f"✅ Successfully rejected ad {ad_id}")
            return True
        
        return success

    def test_login_issue_debug(self):
        """Debug the login issue with ahmed@test.com"""
        print("\n🔍 Debugging Login Issue...")
        
        # First check if user exists by trying to register with same email
        test_data = {
            "name": "Ahmed Test",
            "email": "ahmed@test.com",
            "phone": "+963123456789",
            "country": "SY",
            "city": "دمشق",
            "password": "123456"
        }
        
        # This should fail if user exists
        success, response = self.run_test("Check User Exists", "POST", "auth/register", 400, test_data)
        
        if success:  # 400 means user exists
            print("✅ User ahmed@test.com exists in database")
            
            # Now try login
            login_data = {
                "email": "ahmed@test.com",
                "password": "123456"
            }
            
            success, response = self.run_test("Debug Login", "POST", "auth/login", 200, login_data)
            
            if not success:
                print("❌ Login still failing - this indicates a backend issue")
                return False
            else:
                print("✅ Login working correctly")
                return True
        else:
            print("❌ User ahmed@test.com does not exist or registration check failed")
            return False

    def run_all_tests(self):
        """Run all approval system tests"""
        print("🚀 Testing Approval System for Haraj Syria")
        print("=" * 50)
        
        # Debug login issue first
        self.test_login_issue_debug()
        
        # Test user registration
        if self.test_register_new_user():
            # Test ad creation with pending status
            ad_id = self.test_create_ad_pending_status()
            
            # Test pending ads endpoint
            pending_ad_id = self.test_pending_ads_endpoint()
            
            # Test approval/rejection
            if ad_id:
                self.test_approve_ad(ad_id)
            
            if pending_ad_id and pending_ad_id != ad_id:
                self.test_reject_ad(pending_ad_id)
        
        # Print final results
        print("\n" + "=" * 50)
        print("📊 APPROVAL SYSTEM TEST RESULTS")
        print("=" * 50)
        print(f"Total Tests: {self.tests_run}")
        print(f"Passed: {self.tests_passed}")
        print(f"Failed: {self.tests_run - self.tests_passed}")
        print(f"Success Rate: {(self.tests_passed/self.tests_run)*100:.1f}%")
        
        return self.tests_passed >= (self.tests_run * 0.8)  # 80% success rate

def main():
    tester = ApprovalSystemTester()
    success = tester.run_all_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())