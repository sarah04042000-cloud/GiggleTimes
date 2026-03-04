from flask import Blueprint, jsonify, request, current_app
from utils.auth_utils import token_required
from bson import ObjectId

riddles_bp = Blueprint("riddles", __name__)


def serialize_riddle(r):
    return {
        "id": str(r["_id"]),
        "question": r.get("question", ""),
        "answer": r.get("answer", ""),
        "hint": r.get("hint", ""),
        "category": r.get("category", "General"),
        "difficulty": r.get("difficulty", "Easy"),
        "emoji": r.get("emoji", "🧩"),
    }


@riddles_bp.route("/riddles", methods=["GET"])
def get_riddles():
    db = current_app.db
    category = request.args.get("category")
    query = {"category": category} if category else {}
    riddles = list(db.riddles.find(query))
    return jsonify([serialize_riddle(r) for r in riddles]), 200


@riddles_bp.route("/riddles/<riddle_id>", methods=["GET"])
def get_riddle(riddle_id):
    db = current_app.db
    try:
        riddle = db.riddles.find_one({"_id": ObjectId(riddle_id)})
    except Exception:
        return jsonify({"error": "Invalid ID"}), 400
    if not riddle:
        return jsonify({"error": "Not found"}), 404
    return jsonify(serialize_riddle(riddle)), 200
