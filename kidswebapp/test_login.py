import requests
r = requests.post('http://localhost:3000/api/login', json={'username': 'demo_parent', 'password': 'parent123'})
print('Status:', r.status_code)
print('Response:', r.text)
