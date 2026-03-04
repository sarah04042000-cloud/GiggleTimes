from flask import Blueprint, jsonify, request, current_app
from utils.auth_utils import token_required
from bson import ObjectId
import datetime

stories_bp = Blueprint("stories", __name__)


def serialize_story(story):
    return {
        "id": str(story["_id"]),
        "title": story.get("title", ""),
        "category": story.get("category", ""),
        "audio_file": story.get("audio_file", ""),
        "image": story.get("image", ""),
        "description": story.get("description", ""),
        "full_text": story.get("full_text", ""),
    }


@stories_bp.route("/stories", methods=["GET"])
@token_required
def get_stories():
    db = current_app.db
    category = request.args.get("category", "")
    query = {"category": category} if category else {}

    # If the requester is a kid, apply parent-set category restrictions
    if request.user_role == "kid":
        kid = db.users.find_one({"_id": ObjectId(request.user_id)}, {"allowed_categories": 1})
        allowed = kid.get("allowed_categories") if kid else None
        if allowed is not None and len(allowed) > 0:
            # Intersect with the URL category filter if provided
            if category:
                query["category"] = category if category in allowed else "__none__"
            else:
                query["category"] = {"$in": allowed}

    stories = list(db.stories.find(query))
    return jsonify([serialize_story(s) for s in stories]), 200


@stories_bp.route("/stories/<story_id>", methods=["GET"])
def get_story(story_id):
    db = current_app.db
    try:
        story = db.stories.find_one({"_id": ObjectId(story_id)})
    except Exception:
        return jsonify({"error": "Invalid story id"}), 400
    if not story:
        return jsonify({"error": "Story not found"}), 404
    return jsonify(serialize_story(story)), 200


@stories_bp.route("/stories/<story_id>/complete", methods=["POST"])
@token_required
def complete_story(story_id):
    """Mark a story as completed and award points."""
    db = current_app.db
    data = request.get_json() or {}
    time_spent = data.get("time_spent", 0)  # seconds
    
    user = db.users.find_one({"_id": ObjectId(request.user_id)})
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    # Check if already completed
    already_done = story_id in (user.get("stories_completed") or [])
    points_earned = 0 if already_done else 20  # 20 points per unique story
    
    update = {"$set": {"last_active": datetime.datetime.utcnow()}}
    if not already_done:
        update["$addToSet"] = {"stories_completed": story_id}
        update["$inc"] = {"points": points_earned}
    
    db.users.update_one({"_id": ObjectId(request.user_id)}, update)
    
    # Log progress entry
    db.progress.update_one(
        {"user_id": request.user_id, "story_id": story_id},
        {"$set": {
            "user_id": request.user_id,
            "story_id": story_id,
            "time_spent": time_spent,
            "completed_at": datetime.datetime.utcnow(),
        }},
        upsert=True
    )
    
    return jsonify({"points_earned": points_earned, "already_completed": already_done}), 200


@stories_bp.route("/stories/<story_id>/favorite", methods=["POST"])
@token_required
def toggle_favorite(story_id):
    """Toggle a story in/out of favorites."""
    db = current_app.db
    user = db.users.find_one({"_id": ObjectId(request.user_id)})
    favorites = user.get("favorite_stories", [])
    
    if story_id in favorites:
        db.users.update_one(
            {"_id": ObjectId(request.user_id)},
            {"$pull": {"favorite_stories": story_id}}
        )
        return jsonify({"favorited": False}), 200
    else:
        db.users.update_one(
            {"_id": ObjectId(request.user_id)},
            {"$addToSet": {"favorite_stories": story_id}}
        )
        return jsonify({"favorited": True}), 200


@stories_bp.route("/favorites", methods=["GET"])
@token_required
def get_favorites():
    db = current_app.db
    user = db.users.find_one({"_id": ObjectId(request.user_id)})
    fav_ids = user.get("favorite_stories", [])
    stories = []
    for sid in fav_ids:
        try:
            s = db.stories.find_one({"_id": ObjectId(sid)})
            if s:
                stories.append(serialize_story(s))
        except Exception:
            continue
    return jsonify(stories), 200
