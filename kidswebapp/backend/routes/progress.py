"""
Progress routes: track story completion, quiz scores, points
"""
from flask import Blueprint, request, jsonify, current_app
from utils.auth_utils import token_required
from bson import ObjectId
import datetime

progress_bp = Blueprint("progress", __name__)

BADGES = [
    {"id": "first_story",   "name": "Bookworm",        "emoji": "📚", "desc": "Completed your first story",     "threshold": 1,  "type": "stories"},
    {"id": "five_stories",  "name": "Story Explorer",  "emoji": "🗺️", "desc": "Completed 5 stories",            "threshold": 5,  "type": "stories"},
    {"id": "ten_stories",   "name": "Story Master",    "emoji": "🏆", "desc": "Completed 10 stories",           "threshold": 10, "type": "stories"},
    {"id": "first_quiz",    "name": "Quiz Starter",    "emoji": "🧠", "desc": "Completed your first quiz",      "threshold": 1,  "type": "quizzes"},
    {"id": "five_quizzes",  "name": "Quiz Champion",   "emoji": "🌟", "desc": "Completed 5 quizzes",            "threshold": 5,  "type": "quizzes"},
    {"id": "hundred_pts",   "name": "Point Collector", "emoji": "💎", "desc": "Earned 100 points",              "threshold": 100,"type": "points"},
    {"id": "fivehund_pts",  "name": "Star Learner",    "emoji": "⭐", "desc": "Earned 500 points",              "threshold": 500,"type": "points"},
]


def compute_badges(user):
    """Return list of badge ids the user has earned."""
    earned = []
    stories_count = len(user.get("stories_completed", []))
    quizzes_count = user.get("quizzes_taken", 0)
    points = user.get("points", 0)
    
    for badge in BADGES:
        if badge["type"] == "stories" and stories_count >= badge["threshold"]:
            earned.append(badge["id"])
        elif badge["type"] == "quizzes" and quizzes_count >= badge["threshold"]:
            earned.append(badge["id"])
        elif badge["type"] == "points" and points >= badge["threshold"]:
            earned.append(badge["id"])
    return earned


@progress_bp.route("/progress", methods=["GET"])
@token_required
def get_progress():
    db = current_app.db
    user = db.users.find_one({"_id": ObjectId(request.user_id)}, {"password_hash": 0})
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    # Compute currently earned badges
    earned_badge_ids = compute_badges(user)
    earned_badges = [b for b in BADGES if b["id"] in earned_badge_ids]
    
    # Update badges in DB
    db.users.update_one(
        {"_id": ObjectId(request.user_id)},
        {"$set": {"badges": earned_badge_ids}}
    )
    
    # Get recent quiz results
    quiz_results = list(db.quiz_results.find(
        {"user_id": request.user_id},
        {"_id": 0, "results": 0}
    ).sort("submitted_at", -1).limit(5))
    for r in quiz_results:
        if "submitted_at" in r:
            r["submitted_at"] = str(r["submitted_at"])
    
    points = user.get("points", 0)
    level = max(1, points // 100 + 1)  # Level up every 100 points
    
    return jsonify({
        "points": points,
        "level": level,
        "level_name": _level_name(level),
        "points_to_next_level": (level * 100) - points,
        "stories_completed": len(user.get("stories_completed", [])),
        "quizzes_taken": user.get("quizzes_taken", 0),
        "badges": earned_badges,
        "all_badges": BADGES,
        "recent_quiz_results": quiz_results,
    }), 200


def _level_name(level):
    names = ["Beginner", "Learner", "Explorer", "Reader", "Scholar",
             "Champion", "Master", "Legend", "Genius", "Superstar"]
    return names[min(level - 1, len(names) - 1)]
