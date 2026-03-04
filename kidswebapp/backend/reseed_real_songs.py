# -*- coding: utf-8 -*-
"""
Reseed songs with SoundHelix working melody URLs.
Run: backend\venv\Scripts\python.exe backend\reseed_real_songs.py
"""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import certifi
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/kids_audio_app")
DB_NAME   = os.getenv("MONGO_DB_NAME", "kids_audio_app")
client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=10000, tlsCAFile=certifi.where())
client.admin.command("ping")
db = client[DB_NAME]

db.songs.delete_many({})
print("[CLEAR] Removed all existing songs")

# SoundHelix URLs are verified to always work (free royalty-free melodies)
SH = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-{}.mp3"

songs = [
    {
        "title": "Twinkle Twinkle Little Star",
        "artist": "Children's Choir",
        "category": "English Rhymes",
        "cover_image": "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=400",
        "audio_file": SH.format(1),
        "lyrics": "Twinkle, twinkle, little star,\nHow I wonder what you are!\nUp above the world so high,\nLike a diamond in the sky.\nTwinkle, twinkle, little star,\nHow I wonder what you are!",
    },
    {
        "title": "Wheels on the Bus",
        "artist": "Kids Nursery Rhymes",
        "category": "English Rhymes",
        "cover_image": "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400",
        "audio_file": SH.format(2),
        "lyrics": "The wheels on the bus go round and round,\nRound and round, round and round.\nThe wheels on the bus go round and round,\nAll through the town!",
    },
    {
        "title": "Old MacDonald Had a Farm",
        "artist": "Nursery Rhymes Band",
        "category": "English Rhymes",
        "cover_image": "https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=400",
        "audio_file": SH.format(3),
        "lyrics": "Old MacDonald had a farm, E-I-E-I-O!\nAnd on his farm he had a cow, E-I-E-I-O!\nWith a moo moo here, and a moo moo there,\nHere a moo, there a moo, everywhere a moo moo!\nOld MacDonald had a farm, E-I-E-I-O!",
    },
    {
        "title": "Baa Baa Black Sheep",
        "artist": "Children's Choir",
        "category": "English Rhymes",
        "cover_image": "https://images.unsplash.com/photo-1486891129891-e1f5e7a851f9?w=400",
        "audio_file": SH.format(4),
        "lyrics": "Baa baa black sheep, have you any wool?\nYes sir, yes sir, three bags full!\nOne for the master, one for the dame,\nAnd one for the little boy who lives down the lane.",
    },
    {
        "title": "Johny Johny Yes Papa",
        "artist": "Kids World",
        "category": "English Rhymes",
        "cover_image": "https://images.unsplash.com/photo-1476703993599-0035a21b17a9?w=400",
        "audio_file": SH.format(5),
        "lyrics": "Johny Johny, yes papa?\nEating sugar? No papa!\nTelling lies? No papa!\nOpen your mouth, ha ha ha!",
    },
    {
        "title": "Lakdi Ki Kathi",
        "artist": "Bollywood Classic",
        "category": "Hindi Songs",
        "cover_image": "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400",
        "audio_file": SH.format(6),
        "lyrics": "Lakdi ki kathi, kathi pe ghoda,\nGhode ki dum pe jo maara martoda,\nDaudha daudha daudha ghoda dum uthaake daudha!\nAis tai tai tai!",
    },
    {
        "title": "Chanda Mama Door Ke",
        "artist": "Classic Hindi Rhymes",
        "category": "Hindi Songs",
        "cover_image": "https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?w=400",
        "audio_file": SH.format(7),
        "lyrics": "Chanda mama door ke,\nPure pakaye bhoor ke,\nAap khaye thali mein,\nMunne ko de pyali mein.",
    },
    {
        "title": "Machli Jal Ki Rani Hai",
        "artist": "Hindi Nursery Rhymes",
        "category": "Hindi Songs",
        "cover_image": "https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=400",
        "audio_file": SH.format(8),
        "lyrics": "Machli jal ki rani hai,\nJeevan uska paani hai.\nHaath lagao darr jayegi,\nBahar nikalo mar jayegi!",
    },
    {
        "title": "Nani Teri Morni Ko",
        "artist": "Classic Hindi Rhymes",
        "category": "Hindi Songs",
        "cover_image": "https://images.unsplash.com/photo-1446941611757-91d2c3bd3d45?w=400",
        "audio_file": SH.format(9),
        "lyrics": "Nani teri morni ko mor le gaye,\nBaaki jo bacha tha kaale chor le gaye.\nNani O Nani! Nani O Nani!",
    },
    {
        "title": "Ek Chidiya Anek Chidiya",
        "artist": "Doordarshan Classic",
        "category": "Hindi Songs",
        "cover_image": "https://images.unsplash.com/photo-1444492417251-9c84a5fa18e0?w=400",
        "audio_file": SH.format(10),
        "lyrics": "Ek chidiya anek chidiya,\nUd aasman mein ney neidya!\nEk rang anek rang,\nKhelo saath mil ke sang!",
    },
]

result = db.songs.insert_many(songs)
print(f"[OK] {len(result.inserted_ids)} songs inserted!\n")
for s in songs:
    print(f"  ♪ {s['title']} ({s['category']})")
print("\n=== COMPLETE! ===")
