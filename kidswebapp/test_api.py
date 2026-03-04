import requests

BASE = "http://localhost:3000/api"

def test_endpoint(name, method, path, data=None, headers=None):
    url = f"{BASE}{path}"
    try:
        if method == "GET":
            r = requests.get(url, headers=headers)
        elif method == "POST":
            r = requests.post(url, json=data, headers=headers)
        print(f"\n{name}:")
        print(f"  URL: {method} {path}")
        print(f"  Status: {r.status_code}")
        if r.status_code >= 400:
            print(f"  Error: {r.text[:200]}")
        else:
            print(f"  Response: {r.text[:200]}...")
    except Exception as e:
        print(f"\n{name}: FAILED - {e}")

# Test without auth
test_endpoint("GET Stories", "GET", "/stories")
test_endpoint("GET Songs", "GET", "/songs")
test_endpoint("GET Quizzes", "GET", "/quizzes")

# Login and get token
print("\n--- Testing Authentication ---")
r = requests.post(f"{BASE}/login", json={"username": "demo_parent", "password": "parent123"})
if r.status_code == 200:
    token = r.json().get("token")
    print(f"Login successful! Token: {token[:20]}...")
    headers = {"Authorization": f"Bearer {token}"}
    
    # Test protected endpoints
    test_endpoint("GET Subscription Status", "GET", "/subscription-status", headers=headers)
    
    # Test admin endpoints (as parent - should fail)
    test_endpoint("GET Admin Users (parent)", "GET", "/admin/users", headers=headers)
    
    # Test login as admin
    r = requests.post(f"{BASE}/login", json={"username": "demo_admin", "password": "admin123"})
    if r.status_code == 200:
        admin_token = r.json().get("token")
        admin_headers = {"Authorization": f"Bearer {admin_token}"}
        test_endpoint("GET Admin Users (admin)", "GET", "/admin/users", headers=admin_headers)
        test_endpoint("GET Admin Stats", "GET", "/admin/stats", headers=admin_headers)
else:
    print(f"Login failed: {r.status_code} - {r.text}")
