from flask import Blueprint, request, jsonify, current_app
from utils.auth_utils import admin_required, token_required
from bson import ObjectId
import datetime

admin_bp = Blueprint("admin", __name__)


def serialize_doc(doc):
    doc["id"] = str(doc.pop("_id"))
    # Serialize datetime fields
    for k in list(doc.keys()):
        if isinstance(doc.get(k), datetime.datetime):
            doc[k] = str(doc[k])
    return doc


# ─── Stories ─────────────────────────────────────────────────────────────────

@admin_bp.route("/stories", methods=["GET"])
@admin_required
def list_stories():
    db = current_app.db
    stories = list(db.stories.find())
    return jsonify([serialize_doc(s) for s in stories]), 200


@admin_bp.route("/stories", methods=["POST"])
@admin_required
def create_story():
    data = request.get_json() or {}
    title = data.get("title", "").strip()
    if not title:
        return jsonify({"error": "Title is required"}), 400
    db = current_app.db
    result = db.stories.insert_one({
        "title": title,
        "category": data.get("category", "").strip(),
        "description": data.get("description", "").strip(),
        "full_text": data.get("full_text", "").strip(),
        "audio_file": data.get("audio_file", "").strip(),
        "image": data.get("image", "").strip(),
        "created_at": datetime.datetime.utcnow(),
    })
    return jsonify({"message": "Story created", "id": str(result.inserted_id)}), 201


@admin_bp.route("/stories/<story_id>", methods=["PUT"])
@admin_required
def update_story(story_id):
    data = request.get_json() or {}
    db = current_app.db
    try:
        db.stories.update_one({"_id": ObjectId(story_id)}, {"$set": data})
    except Exception:
        return jsonify({"error": "Invalid story id"}), 400
    return jsonify({"message": "Story updated"}), 200


@admin_bp.route("/stories/<story_id>", methods=["DELETE"])
@admin_required
def delete_story(story_id):
    db = current_app.db
    try:
        db.stories.delete_one({"_id": ObjectId(story_id)})
    except Exception:
        return jsonify({"error": "Invalid story id"}), 400
    return jsonify({"message": "Story deleted"}), 200


# ─── Songs ───────────────────────────────────────────────────────────────────

@admin_bp.route("/songs", methods=["GET"])
@admin_required
def list_songs():
    db = current_app.db
    songs = list(db.songs.find())
    return jsonify([serialize_doc(s) for s in songs]), 200


@admin_bp.route("/songs", methods=["POST"])
@admin_required
def create_song():
    data = request.get_json() or {}
    title = data.get("title", "").strip()
    if not title:
        return jsonify({"error": "Title is required"}), 400
    db = current_app.db
    result = db.songs.insert_one({
        "title": title,
        "artist": data.get("artist", "Kids World"),
        "audio_file": data.get("audio_file", "").strip(),
        "cover_image": data.get("cover_image", "").strip(),
        "category": data.get("category", "Rhymes"),
        "created_at": datetime.datetime.utcnow(),
    })
    return jsonify({"message": "Song created", "id": str(result.inserted_id)}), 201


@admin_bp.route("/songs/<song_id>", methods=["PUT"])
@admin_required
def update_song(song_id):
    data = request.get_json() or {}
    db = current_app.db
    try:
        db.songs.update_one({"_id": ObjectId(song_id)}, {"$set": data})
    except Exception:
        return jsonify({"error": "Invalid song id"}), 400
    return jsonify({"message": "Song updated"}), 200


@admin_bp.route("/songs/<song_id>", methods=["DELETE"])
@admin_required
def delete_song(song_id):
    db = current_app.db
    try:
        db.songs.delete_one({"_id": ObjectId(song_id)})
    except Exception:
        return jsonify({"error": "Invalid song id"}), 400
    return jsonify({"message": "Song deleted"}), 200


# ─── Riddles ─────────────────────────────────────────────────────────────────

@admin_bp.route("/riddles", methods=["GET"])
@admin_required
def list_riddles():
    db = current_app.db
    riddles = list(db.riddles.find())
    return jsonify([serialize_doc(r) for r in riddles]), 200


@admin_bp.route("/riddles", methods=["POST"])
@admin_required
def create_riddle():
    data = request.get_json() or {}
    question = data.get("question", "").strip()
    if not question:
        return jsonify({"error": "Question is required"}), 400
    answer = data.get("answer", "").strip()
    if not answer:
        return jsonify({"error": "Answer is required"}), 400
    db = current_app.db
    result = db.riddles.insert_one({
        "question": question,
        "answer": answer,
        "hint": data.get("hint", "").strip(),
        "category": data.get("category", "General"),
        "difficulty": data.get("difficulty", "Easy"),
        "emoji": data.get("emoji", "🧩"),
        "created_at": datetime.datetime.utcnow(),
    })
    return jsonify({"message": "Riddle created", "id": str(result.inserted_id)}), 201


@admin_bp.route("/riddles/<riddle_id>", methods=["PUT"])
@admin_required
def update_riddle(riddle_id):
    data = request.get_json() or {}
    db = current_app.db
    try:
        db.riddles.update_one({"_id": ObjectId(riddle_id)}, {"$set": data})
    except Exception:
        return jsonify({"error": "Invalid riddle id"}), 400
    return jsonify({"message": "Riddle updated"}), 200


@admin_bp.route("/riddles/<riddle_id>", methods=["DELETE"])
@admin_required
def delete_riddle(riddle_id):
    db = current_app.db
    try:
        db.riddles.delete_one({"_id": ObjectId(riddle_id)})
    except Exception:
        return jsonify({"error": "Invalid riddle id"}), 400
    return jsonify({"message": "Riddle deleted"}), 200


# ─── Quizzes ─────────────────────────────────────────────────────────────────

@admin_bp.route("/quizzes", methods=["GET"])
@admin_required
def list_quizzes():
    db = current_app.db
    quizzes = list(db.quizzes.find())
    return jsonify([serialize_doc(q) for q in quizzes]), 200


@admin_bp.route("/quizzes", methods=["POST"])
@admin_required
def create_quiz():
    data = request.get_json() or {}
    question = data.get("question", "").strip()
    if not question:
        return jsonify({"error": "Question is required"}), 400
    db = current_app.db
    result = db.quizzes.insert_one({
        "question": question,
        "options": data.get("options", []),
        "answer": data.get("answer", "").strip(),
        "category": data.get("category", "General"),
        "created_at": datetime.datetime.utcnow(),
    })
    return jsonify({"message": "Quiz created", "id": str(result.inserted_id)}), 201


@admin_bp.route("/quizzes/<quiz_id>", methods=["PUT"])
@admin_required
def update_quiz(quiz_id):
    data = request.get_json() or {}
    db = current_app.db
    try:
        db.quizzes.update_one({"_id": ObjectId(quiz_id)}, {"$set": data})
    except Exception:
        return jsonify({"error": "Invalid quiz id"}), 400
    return jsonify({"message": "Quiz updated"}), 200


@admin_bp.route("/quizzes/<quiz_id>", methods=["DELETE"])
@admin_required
def delete_quiz(quiz_id):
    db = current_app.db
    try:
        db.quizzes.delete_one({"_id": ObjectId(quiz_id)})
    except Exception:
        return jsonify({"error": "Invalid quiz id"}), 400
    return jsonify({"message": "Quiz deleted"}), 200


# ─── Users ───────────────────────────────────────────────────────────────────

@admin_bp.route("/users", methods=["GET"])
@admin_required
def get_all_users():
    db = current_app.db
    users = list(db.users.find({}, {"password_hash": 0}))
    for u in users:
        u["id"] = str(u.pop("_id"))
        for k in list(u.keys()):
            if isinstance(u.get(k), datetime.datetime):
                u[k] = str(u[k])
    return jsonify(users), 200


@admin_bp.route("/users", methods=["POST"])
@admin_required
def create_user():
    """Admin creates a new user account with any role."""
    from utils.auth_utils import hash_password
    data = request.get_json() or {}
    username = data.get("username", "").strip()
    password = data.get("password", "").strip()
    role = data.get("role", "parent")

    if not username or not password:
        return jsonify({"error": "Username and password are required"}), 400
    if role not in ("admin", "parent", "kid"):
        return jsonify({"error": "Invalid role"}), 400

    db = current_app.db
    if db.users.find_one({"username": username}):
        return jsonify({"error": "Username already exists"}), 409

    result = db.users.insert_one({
        "username": username,
        "password_hash": hash_password(password),
        "role": role,
        "points": 0,
        "badges": [],
        "quizzes_taken": 0,
        "stories_completed": [],
        "created_at": datetime.datetime.utcnow(),
    })
    return jsonify({"message": "User created", "id": str(result.inserted_id)}), 201


@admin_bp.route("/users/<user_id>", methods=["PUT"])
@admin_required
def update_user(user_id):
    """Edit a user — change role, reset password, or toggle subscription."""
    data = request.get_json() or {}
    allowed = {}

    if "role" in data and data["role"] in ("admin", "parent", "kid"):
        allowed["role"] = data["role"]
    if "subscription_status" in data and data["subscription_status"] in ("active", "inactive"):
        allowed["subscription_status"] = data["subscription_status"]
    if "subscription" in data:
        allowed["subscription"] = data["subscription"]
    if "password" in data and data["password"]:
        from utils.auth_utils import hash_password
        allowed["password_hash"] = hash_password(data["password"])

    if not allowed:
        return jsonify({"error": "No valid fields to update"}), 400

    db = current_app.db
    try:
        db.users.update_one({"_id": ObjectId(user_id)}, {"$set": allowed})
    except Exception:
        return jsonify({"error": "Invalid user id"}), 400
    return jsonify({"message": "User updated"}), 200


@admin_bp.route("/users/<user_id>", methods=["DELETE"])
@admin_required
def delete_user(user_id):
    db = current_app.db
    try:
        db.users.delete_one({"_id": ObjectId(user_id)})
    except Exception:
        return jsonify({"error": "Invalid user id"}), 400
    return jsonify({"message": "User deleted"}), 200


# ─── Stats ──────────────────────────────────────────────────────────────────


@admin_bp.route("/stats", methods=["GET"])
@admin_required
def get_stats():
    db = current_app.db
    stats = {
        "total_users": db.users.count_documents({}),
        "total_stories": db.stories.count_documents({}),
        "total_songs": db.songs.count_documents({}),
        "total_quizzes": db.quizzes.count_documents({}),
        "total_transactions": db.transactions.count_documents({}),
        "total_paid": db.transactions.count_documents({"status": "paid"}),
        "total_subscriptions": db.users.count_documents({"subscription_status": "active"}),
    }
    return jsonify(stats), 200


# ─── Payments/Transactions ────────────────────────────────────────────────────

@admin_bp.route("/payments", methods=["GET"])
@admin_required
def get_all_payments():
    db = current_app.db
    txns = list(db.transactions.find({}, {"_id": 0}))
    for t in txns:
        for k in ("created_at", "paid_at"):
            if k in t:
                t[k] = str(t[k])
    return jsonify(txns), 200
