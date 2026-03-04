"""
Quiz routes: get questions, submit answers, view results
"""
from flask import Blueprint, request, jsonify, current_app
from utils.auth_utils import token_required, admin_required
from bson import ObjectId
import datetime

quizzes_bp = Blueprint("quizzes", __name__)


def serialize_quiz(quiz, hide_answer=True):
    q = {
        "id": str(quiz["_id"]),
        "question": quiz.get("question", ""),
        "options": quiz.get("options", []),
        "category": quiz.get("category", "General"),
    }
    if not hide_answer:
        q["answer"] = quiz.get("answer", "")
    return q


@quizzes_bp.route("/quizzes", methods=["GET"])
@token_required
def get_quizzes():
    db = current_app.db
    category = request.args.get("category", "")
    query = {"category": category} if category else {}
    quizzes = list(db.quizzes.find(query))
    # Hide answers from child view, show for admin/parent
    hide = request.user_role == "kid"
    return jsonify([serialize_quiz(q, hide_answer=hide) for q in quizzes]), 200


@quizzes_bp.route("/quizzes/submit", methods=["POST"])
@token_required
def submit_quiz():
    """
    Body: { "answers": [{"quiz_id": "...", "selected": "option text"}, ...] }
    Returns score and per-question results.
    """
    data = request.get_json() or {}
    answers = data.get("answers", [])
    if not answers:
        return jsonify({"error": "No answers provided"}), 400

    db = current_app.db
    results = []
    correct = 0

    for ans in answers:
        qid = ans.get("quiz_id", "")
        selected = ans.get("selected", "")
        try:
            quiz = db.quizzes.find_one({"_id": ObjectId(qid)})
        except Exception:
            continue
        if not quiz:
            continue
        is_correct = quiz.get("answer", "") == selected
        if is_correct:
            correct += 1
        results.append({
            "quiz_id": qid,
            "question": quiz.get("question", ""),
            "selected": selected,
            "correct_answer": quiz.get("answer", ""),
            "is_correct": is_correct,
        })

    total = len(results)
    score_pct = round((correct / total) * 100) if total > 0 else 0

    # Award points only for kids and parents (not admin)
    is_admin_user = request.user_role == "admin"
    points_earned = 0 if is_admin_user else correct * 10

    # Store result
    db.quiz_results.insert_one({
        "user_id": request.user_id,
        "total": total,
        "correct": correct,
        "score_pct": score_pct,
        "points_earned": points_earned,
        "results": results,
        "submitted_at": datetime.datetime.utcnow(),
    })

    # Update user stats (skip points for admin)
    if is_admin_user:
        db.users.update_one(
            {"_id": ObjectId(request.user_id)},
            {"$inc": {"quizzes_taken": 1}}
        )
    else:
        db.users.update_one(
            {"_id": ObjectId(request.user_id)},
            {"$inc": {"points": points_earned, "quizzes_taken": 1}}
        )

    return jsonify({
        "total": total,
        "correct": correct,
        "score_pct": score_pct,
        "points_earned": points_earned,
        "results": results,
    }), 200


@quizzes_bp.route("/quizzes/results", methods=["GET"])
@token_required
def my_results():
    db = current_app.db
    results = list(db.quiz_results.find(
        {"user_id": request.user_id},
        {"_id": 0, "results": 0}
    ).sort("submitted_at", -1).limit(20))
    for r in results:
        if "submitted_at" in r:
            r["submitted_at"] = str(r["submitted_at"])
    return jsonify(results), 200


@quizzes_bp.route("/quizzes/results/<user_id>", methods=["GET"])
@token_required
def user_results(user_id):
    # Only admin or parent can view other user's results
    if request.user_role not in ("admin", "parent"):
        return jsonify({"error": "Access denied"}), 403
    db = current_app.db
    results = list(db.quiz_results.find(
        {"user_id": user_id},
        {"_id": 0, "results": 0}
    ).sort("submitted_at", -1).limit(20))
    for r in results:
        if "submitted_at" in r:
            r["submitted_at"] = str(r["submitted_at"])
    return jsonify(results), 200
