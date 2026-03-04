import sys, os
sys.path.insert(0, os.path.dirname(__file__))
os.chdir(os.path.dirname(__file__))

from dotenv import load_dotenv
load_dotenv()

import certifi
from pymongo import MongoClient

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/kids_audio_app")
DB_NAME = os.getenv("MONGO_DB_NAME", "kids_audio_app")

client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=10000, tlsCAFile=certifi.where())
db = client[DB_NAME]

users = list(db.users.find({}, {"username": 1, "role": 1, "password_hash": 1}))
print(f"Total users: {len(users)}")
for u in users:
    print(f"  [{u.get('role','?')}] {u.get('username','?')} - hash: {str(u.get('password_hash',''))[:20]}...")
