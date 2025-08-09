#!/usr/bin/env python3
import requests
import json

def test_specific_login():
    """Test login with the specific credentials provided in the request"""
    base_url = "https://036382c1-25df-47d0-aaa0-a75807568261.preview.emergentagent.com"
    api_url = f"{base_url}/api"
    
    # Test credentials from the request
    login_data = {
        "email": "final1754470057@test.com",
        "password": "FinalTest123!"
    }
    
    print("🔍 Testing login with specific credentials...")
    print(f"Email: {login_data['email']}")
    print(f"Password: {login_data['password']}")
    
    try:
        response = requests.post(
            f"{api_url}/auth/login",
            json=login_data,
            headers={'Content-Type': 'application/json'},
            timeout=10
        )
        
        print(f"Status Code: {response.status_code}")
        print(f"Response Headers: {dict(response.headers)}")
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Login successful!")
            print(f"User: {data.get('user', {}).get('name', 'Unknown')}")
            print(f"Token: {data.get('access_token', 'No token')[:50]}...")
            return True, data
        else:
            print(f"❌ Login failed with status {response.status_code}")
            try:
                error_data = response.json()
                print(f"Error details: {error_data}")
            except:
                print(f"Error text: {response.text}")
            return False, None
            
    except Exception as e:
        print(f"❌ Exception during login: {str(e)}")
        return False, None

def test_registration_with_new_user():
    """Test registration with a completely new user"""
    base_url = "https://036382c1-25df-47d0-aaa0-a75807568261.preview.emergentagent.com"
    api_url = f"{base_url}/api"
    
    from datetime import datetime
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    
    register_data = {
        "name": f"Test User {timestamp}",
        "email": f"testuser_{timestamp}@example.com",
        "phone": f"+96312345{timestamp[-4:]}",
        "country": "SY",
        "city": "دمشق",
        "password": "TestPass123!"
    }
    
    print(f"\n🔍 Testing registration with new user...")
    print(f"Email: {register_data['email']}")
    
    try:
        response = requests.post(
            f"{api_url}/auth/register",
            json=register_data,
            headers={'Content-Type': 'application/json'},
            timeout=10
        )
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Registration successful!")
            print(f"User: {data.get('user', {}).get('name', 'Unknown')}")
            
            # Now test login with the new user
            login_data = {
                "email": register_data['email'],
                "password": register_data['password']
            }
            
            print(f"\n🔍 Testing login with newly registered user...")
            login_response = requests.post(
                f"{api_url}/auth/login",
                json=login_data,
                headers={'Content-Type': 'application/json'},
                timeout=10
            )
            
            print(f"Login Status Code: {login_response.status_code}")
            
            if login_response.status_code == 200:
                login_data = login_response.json()
                print("✅ Login with new user successful!")
                return True, login_data
            else:
                print(f"❌ Login with new user failed")
                try:
                    error_data = login_response.json()
                    print(f"Login error: {error_data}")
                except:
                    print(f"Login error text: {login_response.text}")
                return False, None
                
        else:
            print(f"❌ Registration failed with status {response.status_code}")
            try:
                error_data = response.json()
                print(f"Registration error: {error_data}")
            except:
                print(f"Registration error text: {response.text}")
            return False, None
            
    except Exception as e:
        print(f"❌ Exception during registration: {str(e)}")
        return False, None

if __name__ == "__main__":
    print("=" * 60)
    print("🚀 FOCUSED LOGIN TESTING")
    print("=" * 60)
    
    # Test 1: Specific credentials from request
    success1, data1 = test_specific_login()
    
    # Test 2: Registration and login with new user
    success2, data2 = test_registration_with_new_user()
    
    print("\n" + "=" * 60)
    print("📊 LOGIN TEST SUMMARY")
    print("=" * 60)
    print(f"Specific credentials test: {'✅ PASSED' if success1 else '❌ FAILED'}")
    print(f"New user registration+login: {'✅ PASSED' if success2 else '❌ FAILED'}")
    
    if success1 or success2:
        print("\n✅ At least one login method is working!")
    else:
        print("\n❌ Both login methods failed - there may be a backend issue")