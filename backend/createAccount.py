from flask import Blueprint, jsonify, request
from database import get_db_connection, hash_password
from werkzeug.exceptions import BadRequest

createAccount_bp = Blueprint('createAccount', __name__)

@createAccount_bp.route('/register', methods=['POST'])
def register():
    try:
        # Get JSON data from the request
        data = request.get_json()
        if not data:
            return jsonify({"message": "Invalid or missing JSON data"}), 400

        # Extract fields with .get() to avoid KeyError
        fullName = data.get('fullName')
        email = data.get('email')
        phone = data.get('phone')
        username = data.get('username')
        password = data.get('password')

        # Validate required fields
        if not all([fullName, email, phone, username, password]):
            return jsonify({"message": "Missing required fields"}), 400

        # Open database connection
        connection = get_db_connection()
        if not connection:
            return jsonify({"message": "Database connection failed"}), 500

        cursor = connection.cursor()

        # Check if username already exists
        cursor.execute("SELECT * FROM Users WHERE username = %s", (username,))
        user = cursor.fetchone()
        if user:
            cursor.close()
            connection.close()
            return jsonify({"message": "Username already taken"}), 400

        # Hash the password
        hashed_password = hash_password(password)

        # Insert the new user into the database
        insert_query = """
            INSERT INTO Users (fullName, email, phone, username, password) 
            VALUES (%s, %s, %s, %s, %s)
        """
        cursor.execute(insert_query, (fullName, email, phone, username, hashed_password))

        # Commit the transaction
        connection.commit()

        # Close cursor and connection
        cursor.close()
        connection.close()

        return jsonify({"message": "User registered successfully"}), 201

    except Exception as e:
        # Ensure connection is closed if it exists
        if 'connection' in locals() and connection.is_connected():
            if 'cursor' in locals():
                cursor.close()
            connection.close()
        return jsonify({"message": "Server error", "error": str(e)}), 500
