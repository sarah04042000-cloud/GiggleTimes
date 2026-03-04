"""
Real Razorpay Payment Routes
Replaces old simulated UPI payment system.
Requires: pip install razorpay
Env vars: RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET
"""
from flask import Blueprint, request, jsonify, current_app
from utils.auth_utils import token_required
from bson import ObjectId
import datetime
import uuid
import os
import hmac
import hashlib

payments_bp = Blueprint("payments", __name__)

PLANS = {
    "single": {"name": "Single Kid Plan",      "amount": 19900, "currency": "INR"},  # amount in paise
    "family": {"name": "Family Plan (3 Kids)", "amount": 39900, "currency": "INR"},
}


def get_razorpay_client():
    """Lazy-load Razorpay client so the app doesn't crash if razorpay isn't installed yet."""
    try:
        import razorpay
        key_id = os.getenv("RAZORPAY_KEY_ID", "")
        key_secret = os.getenv("RAZORPAY_KEY_SECRET", "")
        if not key_id or not key_secret:
            return None, "Razorpay credentials not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env"
        client = razorpay.Client(auth=(key_id, key_secret))
        return client, None
    except ImportError:
        return None, "Razorpay SDK not installed. Run: venv\\Scripts\\pip install razorpay"


# ─── Create Order ─────────────────────────────────────────────────────────────

@payments_bp.route("/payment/create-order", methods=["POST"])
@token_required
def create_order():
    """Create a Razorpay order. Falls back to demo mode if keys aren't configured."""
    data = request.get_json() or {}
    plan = data.get("plan", "single")

    if plan not in PLANS:
        return jsonify({"error": "Invalid plan. Choose 'single' or 'family'"}), 400

    plan_info = PLANS[plan]
    receipt = f"rcpt_{uuid.uuid4().hex[:12]}"

    key_id     = os.getenv("RAZORPAY_KEY_ID", "")
    key_secret = os.getenv("RAZORPAY_KEY_SECRET", "")

    # ── Demo mode: no real Razorpay keys configured ───────────────────────────
    is_demo = (
        not key_id
        or not key_secret
        or key_id.startswith("rzp_test_YOUR")
        or key_secret == "YOUR_KEY_SECRET_HERE"
    )

    db = current_app.db
    db.transactions.insert_one({
        "transaction_id": receipt,
        "razorpay_order_id": f"order_DEMO_{receipt}",
        "user_id": request.user_id,
        "plan": plan,
        "amount": plan_info["amount"] // 100,
        "currency": plan_info["currency"],
        "status": "pending",
        "demo": is_demo,
        "created_at": datetime.datetime.utcnow(),
    })

    if is_demo:
        # Return a demo order — frontend will handle this gracefully
        return jsonify({
            "order_id": f"order_DEMO_{receipt}",
            "amount": plan_info["amount"],
            "currency": plan_info["currency"],
            "plan": plan,
            "plan_name": plan_info["name"],
            "key": "demo",
            "receipt": receipt,
            "demo": True,
        }), 200

    # ── Real Razorpay ─────────────────────────────────────────────────────────
    client, err = get_razorpay_client()
    if err:
        return jsonify({"error": err}), 500

    try:
        order = client.order.create({
            "amount":   plan_info["amount"],
            "currency": plan_info["currency"],
            "receipt":  receipt,
            "notes":    {"plan": plan, "user_id": request.user_id},
        })
    except Exception as e:
        return jsonify({"error": f"Failed to create Razorpay order: {str(e)}"}), 500

    # Update with real order id
    db.transactions.update_one(
        {"transaction_id": receipt},
        {"$set": {"razorpay_order_id": order["id"]}}
    )

    return jsonify({
        "order_id": order["id"],
        "amount":   plan_info["amount"],
        "currency": plan_info["currency"],
        "plan": plan,
        "plan_name": plan_info["name"],
        "key": key_id,
        "receipt": receipt,
        "demo": False,
    }), 200



# ─── Verify Payment ───────────────────────────────────────────────────────────

@payments_bp.route("/payment/verify", methods=["POST"])
@token_required
def verify_payment():
    """
    Verify Razorpay payment signature.
    Accepts demo orders (order_id starts with 'order_DEMO_') without real signature check.
    """
    data = request.get_json() or {}
    razorpay_payment_id = data.get("razorpay_payment_id", "")
    razorpay_order_id   = data.get("razorpay_order_id", "")
    razorpay_signature  = data.get("razorpay_signature", "")

    if not all([razorpay_payment_id, razorpay_order_id, razorpay_signature]):
        return jsonify({"error": "Missing payment verification data"}), 400

    db = current_app.db
    txn = db.transactions.find_one({
        "razorpay_order_id": razorpay_order_id,
        "user_id": request.user_id,
    })
    if not txn:
        return jsonify({"error": "Transaction not found"}), 404

    if txn["status"] == "paid":
        return jsonify({"message": "Already verified", "plan": txn["plan"]}), 200

    # ── Demo mode: skip real signature verification ───────────────────────────
    is_demo = txn.get("demo", False) or razorpay_order_id.startswith("order_DEMO_")

    if not is_demo:
        key_secret = os.getenv("RAZORPAY_KEY_SECRET", "")
        if not key_secret or key_secret == "YOUR_KEY_SECRET_HERE":
            return jsonify({"error": "Razorpay not configured on server"}), 500

        # Verify HMAC-SHA256 signature
        message = f"{razorpay_order_id}|{razorpay_payment_id}"
        expected_signature = hmac.new(
            key_secret.encode("utf-8"),
            message.encode("utf-8"),
            hashlib.sha256
        ).hexdigest()

        if not hmac.compare_digest(expected_signature, razorpay_signature):
            return jsonify({"error": "Payment signature verification failed."}), 400

    # Mark paid
    db.transactions.update_one(
        {"razorpay_order_id": razorpay_order_id},
        {"$set": {
            "status": "paid",
            "razorpay_payment_id": razorpay_payment_id,
            "razorpay_signature": razorpay_signature,
            "paid_at": datetime.datetime.utcnow(),
        }}
    )

    # Activate subscription on user
    db.users.update_one(
        {"_id": ObjectId(request.user_id)},
        {"$set": {
            "subscription": txn["plan"],
            "subscription_status": "active",
            "subscribed_at": datetime.datetime.utcnow(),
        }}
    )

    # Record in subscriptions collection
    db.subscriptions.insert_one({
        "user_id": request.user_id,
        "plan": txn["plan"],
        "payment_status": "paid",
        "razorpay_order_id": razorpay_order_id,
        "razorpay_payment_id": razorpay_payment_id,
        "amount": txn["amount"],
        "paid_at": datetime.datetime.utcnow(),
    })

    return jsonify({
        "success": True,
        "message": "Payment verified! Subscription activated.",
        "plan": txn["plan"],
    }), 200


# ─── Subscription Status ──────────────────────────────────────────────────────

@payments_bp.route("/payment/status", methods=["GET"])
@token_required
def payment_status():
    db = current_app.db
    user = db.users.find_one({"_id": ObjectId(request.user_id)}, {"password_hash": 0})
    if not user:
        return jsonify({"error": "User not found"}), 404
    return jsonify({
        "plan": user.get("subscription", None),
        "status": user.get("subscription_status", "inactive"),
        "subscribed_at": str(user.get("subscribed_at", "")),
    }), 200


# ─── Payment History ──────────────────────────────────────────────────────────

@payments_bp.route("/payment/history", methods=["GET"])
@token_required
def payment_history():
    db = current_app.db
    txns = list(db.transactions.find({"user_id": request.user_id}, {"_id": 0}))
    for t in txns:
        for k in ("created_at", "paid_at"):
            if k in t:
                t[k] = str(t[k])
    return jsonify(txns), 200


# ─── Legacy: keep /payment/initiate for backward compat (redirects to create-order) ───

@payments_bp.route("/payment/initiate", methods=["POST"])
@token_required
def initiate_payment_legacy():
    """Legacy endpoint kept for backward compatibility. Use /payment/create-order instead."""
    return create_order()
