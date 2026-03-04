"""
Quick seed script — creates the 3 demo user accounts if they don't already exist.
Run from the kidswebapp root:
    venv\Scripts\python.exe backend\seed_users.py
"""
import os, sys, datetime, certifi
sys.path.insert(0, os.path.dirname(__file__))

from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))

import bcrypt
from pymongo import MongoClient

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/kids_audio_app")
DB_NAME   = os.getenv("MONGO_DB_NAME", "kids_audio_app")

client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=15000, tlsCAFile=certifi.where())
db = client[DB_NAME]

def hash_pw(pw):
    return bcrypt.hashpw(pw.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

DEMO_USERS = [
    {"username": "demo_admin",  "password": "admin123",  "role": "admin"},
    {"username": "demo_parent", "password": "parent123", "role": "parent"},
    {"username": "demo_kid",    "password": "kid123",    "role": "kid"},
]

for u in DEMO_USERS:
    exists = db.users.find_one({"username": u["username"]})
    if exists:
        print(f"[SKIP]   {u['username']} already exists")
    else:
        db.users.insert_one({
            "username": u["username"],
            "password_hash": hash_pw(u["password"]),
            "role": u["role"],
            "points": 0,
            "badges": [],
            "quizzes_taken": 0,
            "stories_completed": [],
            "created_at": datetime.datetime.utcnow(),
        })
        print(f"[CREATED] {u['username']}  ({u['role']})  password={u['password']}")

print("\nDone! You can now log in with:")
print("  Admin  - username: demo_admin   password: admin123")
print("  Parent - username: demo_parent  password: parent123")
print("  Kid    - username: demo_kid     password: kid123")
