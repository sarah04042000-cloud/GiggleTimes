import os
from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS
from dotenv import load_dotenv
from pymongo import MongoClient

load_dotenv()

app = Flask(__name__)

# Allow all origins for development; tighten in production
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)

AUDIO_DIR = os.path.join(os.path.dirname(__file__), "static", "audio")

@app.route("/audio/<filename>")
def serve_audio(filename):
    """Serve local audio files with CORS headers."""
    response = send_from_directory(AUDIO_DIR, filename)
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Accept-Ranges'] = 'bytes'
    return response

# ─── MongoDB Atlas ───────────────────────────────────────────────────────────
import datetime

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/kids_audio_app")
DB_NAME   = os.getenv("MONGO_DB_NAME", "kids_audio_app")

# pymongo 4.16 handles TLS via the OS trust store automatically
client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=20000)
db     = client[DB_NAME]

app.config["JWT_SECRET"] = os.getenv("JWT_SECRET", "kids_story_super_secret_2024")
app.db = db  # Required — all routes access current_app.db

# ─── Blueprints ──────────────────────────────────────────────────────────────
from routes.auth     import auth_bp
from routes.stories  import stories_bp
from routes.riddles  import riddles_bp
from routes.quizzes  import quizzes_bp
from routes.admin    import admin_bp
from routes.payments import payments_bp
from routes.parent   import parent_bp
from routes.progress import progress_bp
from routes.games    import games_bp
from routes.songs    import songs_bp

app.register_blueprint(auth_bp,     url_prefix="/api")
app.register_blueprint(stories_bp,  url_prefix="/api")
app.register_blueprint(riddles_bp,  url_prefix="/api")
app.register_blueprint(quizzes_bp,  url_prefix="/api")
app.register_blueprint(admin_bp,    url_prefix="/api/admin")
app.register_blueprint(payments_bp, url_prefix="/api")
app.register_blueprint(parent_bp,   url_prefix="/api")
app.register_blueprint(progress_bp, url_prefix="/api")
app.register_blueprint(games_bp,    url_prefix="/api")
app.register_blueprint(songs_bp,    url_prefix="/api")


@app.route("/")
def index():
    return {"message": "Kids Audio App API is running 🎮"}


if __name__ == "__main__":
    print("Kids Audio API starting on http://localhost:5000")
    app.run(debug=True, port=5000, host="0.0.0.0")
