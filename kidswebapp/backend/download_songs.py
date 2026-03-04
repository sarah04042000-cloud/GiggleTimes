"""
download_songs.py — Downloads 10 real kids songs (English + Hindi) from YouTube
using yt-dlp's search feature so it picks any available result.
Run: python download_songs.py
"""
import subprocess, sys, os, json

OUT_DIR = os.path.join(os.path.dirname(__file__), "static", "audio", "songs")
os.makedirs(OUT_DIR, exist_ok=True)

# Use ytsearch: — yt-dlp will search YouTube and pick the first available result
SONGS = [
    ("song_twinkle.mp3",     "ytsearch1:twinkle twinkle little star nursery rhyme original",
     "Twinkle Twinkle Little Star", "Nursery Rhymes", "Rhymes",
     "Twinkle, twinkle, little star,\nHow I wonder what you are!\nUp above the world so high,\nLike a diamond in the sky."),

    ("song_abc.mp3",         "ytsearch1:ABC song for kids original nursery rhyme",
     "ABC Song", "Kids Learning", "Learning Songs",
     "A B C D E F G,\nH I J K L M N O P,\nQ R S, T U V,\nW X, Y and Z!\nNow I know my ABCs!"),

    ("song_babyshark.mp3",   "ytsearch1:baby shark original kids song pinkfong",
     "Baby Shark", "Pinkfong", "Rhymes",
     "Baby shark, doo doo doo doo doo doo!\nMommy shark! Daddy shark! Grandma shark!"),

    ("song_wheels.mp3",      "ytsearch1:wheels on the bus nursery rhyme kids original",
     "Wheels on the Bus", "Kids Songs", "Rhymes",
     "The wheels on the bus go round and round,\nAll through the town!"),

    ("song_johnnyjohnny.mp3","ytsearch1:johnny johnny yes papa original kids rhyme",
     "Johnny Johnny Yes Papa", "Nursery Rhymes", "Rhymes",
     "Johnny Johnny! Yes Papa?\nEating sugar? No Papa!\nTelling lies? No Papa!\nOpen your mouth — Ha ha ha!"),

    ("song_row.mp3",         "ytsearch1:row row row your boat nursery rhyme kids",
     "Row Row Row Your Boat", "Kids Songs", "Rhymes",
     "Row, row, row your boat,\nGently down the stream.\nMerrily, merrily, merrily, merrily,\nLife is but a dream!"),

    # Hindi songs
    ("song_lakdi.mp3",       "ytsearch1:lakdi ki kathi hindi kids song original",
     "Lakdi Ki Kathi", "Hindi Kids Songs", "Hindi Songs",
     "Lakdi ki kathi, kathi pe ghoda,\nGhode ki dum pe jo maara thappad,\nDaudaa daudaa daudaa ghoda!"),

    ("song_machli.mp3",      "ytsearch1:machli jal ki rani hai hindi nursery rhyme",
     "Machli Jal Ki Rani Hai", "Hindi Kids Songs", "Hindi Songs",
     "Machli jal ki rani hai,\nJeevan uska paani hai.\nHaath lagao dar jayegi,\nBahar nikalo mar jayegi!"),

    ("song_chanda.mp3",      "ytsearch1:chanda mama door ke hindi kids song original",
     "Chanda Mama Door Ke", "Hindi Kids Songs", "Hindi Songs",
     "Chanda mama door ke,\nPuye pakaye boor ke.\nAap khaye thali mein,\nMunne ko de pyali mein!"),

    ("song_rain.mp3",        "ytsearch1:rain rain go away kids nursery rhyme original audio",
     "Rain Rain Go Away", "Kids Songs", "Rhymes",
     "Rain, rain, go away!\nCome again another day!\nLittle children want to play!\nRain, rain, go away!"),
]

print("Downloading songs using yt-dlp YouTube search...")
print("=" * 52)

results = []
for filename, search_query, title, artist, category, lyrics in SONGS:
    final_path = os.path.join(OUT_DIR, filename)
    print(f"\n🎵 {title}")
    print(f"   Searching: {search_query[:60]}")
    try:
        r = subprocess.run([
            sys.executable, "-m", "yt_dlp",
            "-x",
            "--audio-format", "mp3",
            "--audio-quality", "5",
            "--no-playlist",
            "--match-filter", "duration < 300",  # max 5 min
            "-q", "--no-warnings",
            "-o", os.path.join(OUT_DIR, filename.replace(".mp3", ".%(ext)s")),
            search_query
        ], capture_output=True, text=True, timeout=180)

        if os.path.exists(final_path):
            size = os.path.getsize(final_path) // 1024
            print(f"   ✓ OK ({size} KB)")
            results.append({"title": title, "artist": artist, "category": category,
                             "lyrics": lyrics, "filename": filename, "ok": True})
        else:
            print(f"   ✗ No file — {r.stderr[:80] if r.stderr else 'unknown error'}")
            results.append({"title": title, "ok": False})
    except subprocess.TimeoutExpired:
        print(f"   ✗ Timeout")
        results.append({"title": title, "ok": False})
    except Exception as e:
        print(f"   ✗ {e}")
        results.append({"title": title, "ok": False})

with open(os.path.join(OUT_DIR, "results.json"), "w", encoding="utf-8") as f:
    json.dump(results, f, indent=2, ensure_ascii=False)

ok = [r for r in results if r.get("ok")]
print(f"\n{'='*52}")
print(f"✅ Downloaded {len(ok)}/{len(SONGS)} songs")
if ok:
    print("Now run: python reseed_downloaded_songs.py")
