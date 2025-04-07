from flask import Blueprint, jsonify, request
from database import get_db_connection, verify_password

password_bp = Blueprint('password', __name__)

@password_bp.route('/verifyuser', methods=['POST'])
def verify_user():
    connection = None
    cursor = None
    try:
        # Get form data
        username = request.form.get('username')
        password = request.form.get('password')

        if not username or not password:
            return jsonify({"message": "Missing username or password"}), 400

        # Connect to database
        connection = get_db_connection()
        if not connection:
            return jsonify({"message": "Database connection failed"}), 500

        cursor = connection.cursor(dictionary=True)

        # Check if user exists and verify password
        query = "SELECT * FROM Users WHERE username = %s"
        cursor.execute(query, (username,))
        user = cursor.fetchone()

        if not user:
            return jsonify({"message": "User not found"}), 404

        # Assuming password is stored as SHA-256 hash
        stored_hash = user['password']
        if verify_password(stored_hash, password):

            return jsonify({"message": "User verified"}), 200

        else: 
            return jsonify({"message": "Incorrect password"}), 401

        

    except Exception as e:
        print(f"Error in verifyuser: {str(e)}")
        return jsonify({"message": "Server error", "error": str(e)}), 500
    finally:
        if cursor is not None:
            cursor.close()
        if connection is not None and connection.is_connected():
            connection.close()