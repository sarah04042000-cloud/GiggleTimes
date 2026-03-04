"""
Parent routes: manage child accounts, view progress, set screen time
"""
from flask import Blueprint, request, jsonify, current_app
from utils.auth_utils import token_required
from bson import ObjectId
import datetime

parent_bp = Blueprint("parent", __name__)


def parent_required(f):
    """Decorator to ensure only parents (or admins) can access the route."""
    from functools import wraps
    @wraps(f)
    def decorated(*args, **kwargs):
        if request.user_role not in ("parent", "admin"):
            return jsonify({"error": "Parent access required"}), 403
        return f(*args, **kwargs)
    return decorated


@parent_bp.route("/parent/children", methods=["GET"])
@token_required
def get_children():
    """Get all child accounts linked to this parent."""
    if request.user_role not in ("parent", "admin"):
        return jsonify({"error": "Access denied"}), 403
    db = current_app.db
    children = list(db.users.find(
        {"parent_id": request.user_id, "role": "kid"},
        {"password_hash": 0}
    ))
    for c in children:
        c["id"] = str(c.pop("_id"))
        if "created_at" in c:
            c["created_at"] = str(c["created_at"])
    return jsonify(children), 200


@parent_bp.route("/parent/children", methods=["POST"])
@token_required
def create_child():
    """Create a new child account linked to this parent."""
    if request.user_role not in ("parent", "admin"):
        return jsonify({"error": "Access denied"}), 403
    
    from utils.auth_utils import hash_password
    data = request.get_json() or {}
    username = data.get("username", "").strip()
    password = data.get("password", "").strip()
    
    if not username or not password:
        return jsonify({"error": "Username and password required"}), 400
    
    db = current_app.db
    if db.users.find_one({"username": username}):
        return jsonify({"error": "Username already exists"}), 409
    
    result = db.users.insert_one({
        "username": username,
        "password_hash": hash_password(password),
        "role": "kid",
        "parent_id": request.user_id,
        "points": 0,
        "badges": [],
        "quizzes_taken": 0,
        "stories_completed": [],
        "screen_time_limit": 60,  # minutes per day
        "created_at": datetime.datetime.utcnow(),
    })
    return jsonify({
        "message": "Child account created",
        "id": str(result.inserted_id),
        "username": username
    }), 201


@parent_bp.route("/parent/progress/<child_id>", methods=["GET"])
@token_required
def get_child_progress(child_id):
    """View a child's progress (quiz results, story completion)."""
    if request.user_role not in ("parent", "admin"):
        return jsonify({"error": "Access denied"}), 403
    
    db = current_app.db
    child = db.users.find_one(
        {"_id": ObjectId(child_id)},
        {"password_hash": 0}
    )
    if not child:
        return jsonify({"error": "Child not found"}), 404
    
    # Get quiz results
    quiz_results = list(db.quiz_results.find(
        {"user_id": child_id},
        {"_id": 0, "results": 0}
    ).sort("submitted_at", -1).limit(20))
    for r in quiz_results:
        if "submitted_at" in r:
            r["submitted_at"] = str(r["submitted_at"])
    
    # Get story progress
    story_progress = list(db.progress.find({"user_id": child_id}, {"_id": 0}))
    for p in story_progress:
        if "completed_at" in p:
            p["completed_at"] = str(p["completed_at"])
    
    return jsonify({
        "child": {
            "id": child_id,
            "username": child.get("username"),
            "points": child.get("points", 0),
            "badges": child.get("badges", []),
            "stories_completed_count": len(child.get("stories_completed", [])),
            "quizzes_taken": child.get("quizzes_taken", 0),
            "screen_time_limit": child.get("screen_time_limit", 60),
        },
        "quiz_results": quiz_results,
        "story_progress": story_progress,
    }), 200


@parent_bp.route("/parent/screentime", methods=["PUT"])
@token_required
def set_screen_time():
    """Set daily screen time limit for a child."""
    if request.user_role not in ("parent", "admin"):
        return jsonify({"error": "Access denied"}), 403
    
    data = request.get_json() or {}
    child_id = data.get("child_id", "")
    limit_minutes = data.get("limit_minutes", 60)
    
    db = current_app.db
    try:
        db.users.update_one(
            {"_id": ObjectId(child_id), "parent_id": request.user_id},
            {"$set": {"screen_time_limit": limit_minutes}}
        )
    except Exception:
        return jsonify({"error": "Invalid child id"}), 400
    
    return jsonify({"message": f"Screen time limit set to {limit_minutes} minutes/day"}), 200


@parent_bp.route("/parent/content-settings", methods=["GET"])
@token_required
def get_content_settings():
    """Get allowed story categories for a specific child."""
    if request.user_role not in ("parent", "admin"):
        return jsonify({"error": "Access denied"}), 403

    child_id = request.args.get("child_id", "")
    if not child_id:
        return jsonify({"error": "child_id is required"}), 400

    db = current_app.db
    try:
        child = db.users.find_one({"_id": ObjectId(child_id)}, {"allowed_categories": 1})
    except Exception:
        return jsonify({"error": "Invalid child id"}), 400
    if not child:
        return jsonify({"error": "Child not found"}), 404

    # None means all allowed; empty list means nothing allowed
    allowed = child.get("allowed_categories", None)
    return jsonify({"allowed_categories": allowed}), 200


@parent_bp.route("/parent/content-settings", methods=["PUT"])
@token_required
def set_content_settings():
    """
    Set allowed story categories for a child.
    Pass allowed_categories=null to allow everything.
    Pass allowed_categories=["Moral","Bedtime"] to restrict.
    """
    if request.user_role not in ("parent", "admin"):
        return jsonify({"error": "Access denied"}), 403

    data = request.get_json() or {}
    child_id = data.get("child_id", "")
    allowed_categories = data.get("allowed_categories")  # None = all allowed

    VALID_CATEGORIES = ["Moral", "Bedtime", "Animal", "Mythology", "Adventure"]

    if allowed_categories is not None:
        if not isinstance(allowed_categories, list):
            return jsonify({"error": "allowed_categories must be a list or null"}), 400
        # Filter to known categories only
        allowed_categories = [c for c in allowed_categories if c in VALID_CATEGORIES]

    db = current_app.db
    try:
        db.users.update_one(
            {"_id": ObjectId(child_id), "parent_id": request.user_id},
            {"$set": {"allowed_categories": allowed_categories}}
        )
    except Exception:
        return jsonify({"error": "Invalid child id"}), 400

    return jsonify({"message": "Content settings saved", "allowed_categories": allowed_categories}), 200
