from flask import Blueprint, request, jsonify, current_app
from utils.auth_utils import hash_password, check_password, generate_token, token_required
from bson import ObjectId
import datetime

auth_bp = Blueprint("auth", __name__)


@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json()
    username = data.get("username", "").strip()
    password = data.get("password", "").strip()
    role = data.get("role", "parent")  # parent | kid | admin

    if not username or not password:
        return jsonify({"error": "Username and password are required"}), 400

    db = current_app.db
    if db.users.find_one({"username": username}):
        return jsonify({"error": "Username already exists"}), 409

    hashed = hash_password(password)
    result = db.users.insert_one({
        "username": username,
        "password_hash": hashed,
        "role": role,
        "points": 0,
        "badges": [],
        "quizzes_taken": 0,
        "stories_completed": [],
        "created_at": datetime.datetime.utcnow(),
    })

    token = generate_token(str(result.inserted_id), role)
    return jsonify({
        "message": "User registered successfully",
        "token": token,
        "user": {"id": str(result.inserted_id), "username": username, "role": role, "points": 0}
    }), 201


@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    username = data.get("username", "").strip()
    password = data.get("password", "").strip()

    if not username or not password:
        return jsonify({"error": "Username and password are required"}), 400

    db = current_app.db
    user = db.users.find_one({"username": username})
    if not user or not check_password(password, user["password_hash"]):
        return jsonify({"error": "Invalid credentials"}), 401

    token = generate_token(str(user["_id"]), user["role"])
    return jsonify({
        "message": "Login successful",
        "token": token,
        "user": {
            "id": str(user["_id"]),
            "username": user["username"],
            "role": user["role"],
            "points": user.get("points", 0),
            "subscription": user.get("subscription"),
            "subscription_status": user.get("subscription_status", "inactive"),
        }
    }), 200


@auth_bp.route("/me", methods=["GET"])
@token_required
def get_me():
    db = current_app.db
    user = db.users.find_one({"_id": ObjectId(request.user_id)}, {"password_hash": 0})
    if not user:
        return jsonify({"error": "User not found"}), 404
    user["id"] = str(user.pop("_id"))
    if "created_at" in user:
        user["created_at"] = str(user["created_at"])
    return jsonify(user), 200
