from flask import Blueprint, jsonify, request, current_app
from utils.auth_utils import token_required, admin_required
from bson import ObjectId
import datetime

games_bp = Blueprint("games", __name__)

BUILTIN_GAME_IDS = ['bubble','race','number','color','memory','star','math','balloon','word','mole']


def serialize_game(g):
    return {
        "id":          str(g["_id"]),
        "label":       g.get("label", ""),
        "emoji":       g.get("emoji", "🎮"),
        "desc":        g.get("desc", ""),
        "color":       g.get("color", "from-purple-500 to-blue-500"),
        "game_url":    g.get("game_url", ""),   # external URL (optional)
        "builtin_id":  g.get("builtin_id", ""), # maps to built-in game id
        "active":      g.get("active", True),
        "created_at":  str(g.get("created_at", "")),
    }


# ── Public: list all admin-added games ────────────────────────────────────────
@games_bp.route("/games/admin-list", methods=["GET"])
def get_admin_games():
    db = current_app.db
    games = list(db.games.find({"active": True}))
    return jsonify([serialize_game(g) for g in games]), 200


# ── Admin: create a game entry ─────────────────────────────────────────────────
@games_bp.route("/admin/games", methods=["GET"])
@token_required
@admin_required
def admin_list_games():
    db = current_app.db
    games = list(db.games.find())
    return jsonify([serialize_game(g) for g in games]), 200


@games_bp.route("/admin/games", methods=["POST"])
@token_required
@admin_required
def admin_create_game():
    data = request.get_json() or {}
    label = (data.get("label") or "").strip()
    emoji = (data.get("emoji") or "🎮").strip()
    desc  = (data.get("desc") or "").strip()
    color = (data.get("color") or "from-purple-500 to-blue-500").strip()
    builtin_id = (data.get("builtin_id") or "").strip()
    game_url   = (data.get("game_url") or "").strip()

    if not label:
        return jsonify({"error": "Label is required"}), 400

    db = current_app.db
    result = db.games.insert_one({
        "label":      label,
        "emoji":      emoji,
        "desc":       desc,
        "color":      color,
        "builtin_id": builtin_id,
        "game_url":   game_url,
        "active":     True,
        "created_at": datetime.datetime.utcnow(),
    })
    return jsonify({"id": str(result.inserted_id), "message": "Game created"}), 201


@games_bp.route("/admin/games/<game_id>", methods=["DELETE"])
@token_required
@admin_required
def admin_delete_game(game_id):
    db = current_app.db
    db.games.delete_one({"_id": ObjectId(game_id)})
    return jsonify({"message": "Deleted"}), 200


@games_bp.route("/admin/games/<game_id>/toggle", methods=["PUT"])
@token_required
@admin_required
def admin_toggle_game(game_id):
    db = current_app.db
    g = db.games.find_one({"_id": ObjectId(game_id)})
    if not g:
        return jsonify({"error": "Not found"}), 404
    new_status = not g.get("active", True)
    db.games.update_one({"_id": ObjectId(game_id)}, {"$set": {"active": new_status}})
    return jsonify({"active": new_status}), 200
