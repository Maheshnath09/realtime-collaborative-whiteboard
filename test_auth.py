import requests
import json

# Test registration with new user
url = "http://localhost:8000/api/auth/register"
data = {
    "username": "newuser123",
    "email": "newuser123@example.com",
    "password": "test123"
}

print("Testing Registration...")
try:
    response = requests.post(url, json=data)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")
    if response.status_code == 201:
        print("✅ Registration successful!")
        user_data = response.json()
        print(f"User ID: {user_data.get('id')}")
        print(f"Username: {user_data.get('username')}")
        
        # Now test login
        print("\nTesting Login...")
        login_url = "http://localhost:8000/api/auth/login"
        login_data = {
            "email": "newuser123@example.com",
            "password": "test123"
        }
        login_response = requests.post(login_url, json=login_data)
        print(f"Login Status Code: {login_response.status_code}")
        print(f"Login Response: {login_response.text}")
        if login_response.status_code == 200:
            print("✅ Login successful!")
            token_data = login_response.json()
            print(f"Access Token: {token_data.get('access_token')[:50]}...")
        else:
            print("❌ Login failed!")
    else:
        print("❌ Registration failed!")
except Exception as e:
    print(f"❌ Error: {e}")
