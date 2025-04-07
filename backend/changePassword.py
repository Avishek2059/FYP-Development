from flask import Blueprint, jsonify, request
from database import get_db_connection, hash_password
changepassword_bp = Blueprint('changepassword', __name__)

@changepassword_bp.route('/updatepassword', methods=['POST'])
def update_password():
    connection = None
    cursor = None
    try:
        username = request.form.get('username')
        new_password = request.form.get('new_password')

        if not username or not new_password:
            return jsonify({"message": "Missing username or new password"}), 400

        if len(new_password) < 6:
            return jsonify({"message": "Password must be at least 6 characters"}), 400

        connection = get_db_connection()
        if not connection:
            return jsonify({"message": "Database connection failed"}), 500

        cursor = connection.cursor()
        
        # Update password
        hashed_password = hash_password(new_password)
        query = "UPDATE Users SET password = %s WHERE username = %s"
        cursor.execute(query, (hashed_password, username))
        connection.commit()

        return jsonify({"message": "Password updated successfully"}), 200

    except Exception as e:
        print(f"Error in updatepassword: {str(e)}")
        return jsonify({"message": "Server error", "error": str(e)}), 500

    finally:
        if cursor is not None:
            cursor.close()
        if connection is not None and connection.is_connected():
            connection.close()