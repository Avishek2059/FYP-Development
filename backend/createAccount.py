from flask import Blueprint, jsonify, request
from database import get_db_connection, hash_password
from src.adminVerificationHelper import send_verification_status_to_user, send_verification_email_to_admin
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
        profileImage='null'
        verificationStatus='unverified'
        
        #print(f"Received data: {data}")
        

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
            
            # Determine which field is duplicated
            if user[3] == username:  # assuming username is in the 4th column
                return jsonify({"message": "Username already taken"}), 400
            elif user[1] == email:  # assuming email is in the 2nd column
                return jsonify({"message": "Email already registered"}), 400
            else:
                return jsonify({"message": "Username or Email already in use"}), 400

        # Send verification email to admin
        if not send_verification_email_to_admin( username, email):
            return jsonify({"error": "Failed to send verification email"}), 500
        
        # Hash the password
        hashed_password = hash_password(password)
        

        # Insert the new user into the database
        insert_query = """
            INSERT INTO Users (fullName, email, phone, username, password, profileImage, isVerifide) 
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        """
        cursor.execute(insert_query, (fullName, email, phone, username, hashed_password, profileImage, verificationStatus))

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
    
    

@createAccount_bp.route('/verify/<email>', methods=['GET'])
def verify(email):
    print("Entering /user/verify")
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM Users WHERE email = %s", (email,))
        user = cursor.fetchone()
        if not user:
            cursor.close()
            conn.close()
            return jsonify({"error": "User not found"}), 400

        # Update user verification status to 'verified'
        cursor.execute("UPDATE Users SET isVerifide = %s WHERE email = %s",
                       ('verified', email))
        conn.commit()
        cursor.close()
        conn.close()
        
        # Send verification status email to user
        if not send_verification_status_to_user(email, 'verified'):
            print(f"Warning: Failed to send verification status email to {email}")

        return jsonify({"message": "User verified successfully"}), 200
    except Exception as e:
        print(f"Error in /user/verify: {str(e)}")
        return jsonify({"error": "Internal Server Error"}), 500

@createAccount_bp.route('/decline/<email>', methods=['GET'])
def decline(email):
    print("Entering /decline")
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM Users WHERE email = %s", (email,))
        user = cursor.fetchone()
        if not user:
            cursor.close()
            conn.close()
            return jsonify({"error": "User not found"}), 400

        # Update user verification status to 'declined'
        cursor.execute("UPDATE Users SET isVerifide = %s WHERE email = %s",
                       ('declined', email))
        conn.commit()
        cursor.close()
        conn.close()

        # Send decline status email to user
        if not send_verification_status_to_user(email, 'declined'):
            print(f"Warning: Failed to send decline status email to {email}")
        
        return jsonify({"message": "User declined successfully"}), 200
    except Exception as e:
        print(f"Error in /decline: {str(e)}")
        return jsonify({"error": "Internal Server Error"}), 500
    

