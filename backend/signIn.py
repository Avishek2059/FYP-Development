from flask import Blueprint, jsonify, request, session
from database import get_db_connection, verify_password
login_bp = Blueprint('login', __name__)


@login_bp.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"message": "Invalid or missing JSON data"}), 400

        username = data.get('username')
        password = data.get('password')
        if not username or not password:
            return jsonify({"error": "Missing required fields"}), 400

        connection = get_db_connection()
        if not connection:
            return jsonify({"error": "Database connection failed"}), 500

        cursor = connection.cursor(dictionary=True)
        cursor.execute("SELECT * FROM Users WHERE username = %s", (username,))
        user = cursor.fetchone()
        #print(f"User fetched: {user}")  # Debug log
        cursor.close()
        connection.close()

        if not user:
            return jsonify({"error": "user with this username not found"}), 401

        stored_hash = user['password']
        if verify_password(stored_hash, password):
            # session['username'] = user['username']
            # return jsonify({"message": "Login successful", "username": user['username']}), 200
            session['user'] = {
            "username": user['username'],
            "fullName": user['fullName'],
            "email": user['email'],
            "phone": user['phone']
            }
            return jsonify({
                "message": "Login successful",
                "user": session['user']
            }), 200
        else:
            return jsonify({"error": "Email or Password do not match"}), 401

    except Exception as e:
        print(f"Exception: {str(e)}")  # Debug log
        if 'connection' in locals() and connection.is_connected():
            if 'cursor' in locals():
                cursor.close()
            connection.close()
        return jsonify({"message": "Server error", "error": str(e)}), 500