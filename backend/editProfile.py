from flask import Blueprint, jsonify, request,session
from database import get_db_connection
import os
import uuid

update_profile_bp = Blueprint('update_profile', __name__)

# Directory to store uploaded images
UPLOAD_FOLDER = 'uploads/profile_images'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

# Allowed file extensions for images
ALLOWED_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.gif'}

def allowed_file(filename):
    """Check if the file has an allowed extension."""
    return os.path.splitext(filename)[1].lower() in ALLOWED_EXTENSIONS

@update_profile_bp.route('/updateprofile', methods=['POST'])
def update_profile():
    try:
        # Get form data
        username = request.form.get('username')
        full_name = request.form.get('fullName')
        email = request.form.get('email')
        phone = request.form.get('phone')

        if not all([username, full_name, email, phone]):
            return jsonify({'error': 'Missing required fields'}), 400

        # Handle profile image upload
        profile_image_path = None
        if 'profileImage' in request.files:
            file = request.files['profileImage']
            if file and file.filename:
                # Validate file type
                if not allowed_file(file.filename):
                    return jsonify({'error': 'Invalid file type. Allowed types: jpg, jpeg, png, gif'}), 400
                # Generate a unique filename
                filename = f"{uuid.uuid4()}_{file.filename}"
                file_path = os.path.join(UPLOAD_FOLDER, filename)
                file.save(file_path)
                profile_image_path = file_path
                print(f"Profile image saved to: {file_path}")

        # Connect to the database
        connection = get_db_connection()
        if not connection:
            return jsonify({"error": "Database connection failed"}), 500

        cursor = connection.cursor(dictionary=True)

        # Update query, including profileImage if a new image was uploaded
        if profile_image_path:
            query = """
                UPDATE Users
                SET fullName = %s, email = %s, phone = %s, profileImage = %s
                WHERE username = %s
            """
            cursor.execute(query, (full_name, email, phone, profile_image_path, username))
        else:
            query = """
                UPDATE Users
                SET fullName = %s, email = %s, phone = %s
                WHERE username = %s
            """
            cursor.execute(query, (full_name, email, phone, username))

        connection.commit()

        # Verify the update
        #cursor.execute("SELECT username, fullName, email, phone, profileImage FROM Users WHERE username = %s", (username,))
        cursor.execute("SELECT * FROM Users WHERE username = %s", (username,))
        updated_user = cursor.fetchone()
        cursor.close()
        connection.close()

        if not updated_user:
            return jsonify({'error': 'User not found after update'}), 404

        # Construct the image URL (assuming the Flask app serves the 'uploads' folder)
        image_url = None
        if updated_user['profileImage']:
            profile_image = updated_user['profileImage']
            image_url = profile_image.replace('\\', '/')
            if not image_url.startswith('/'):
                image_url = f"/{image_url}"

        session['user'] = {
            "username": updated_user['username'],
            "fullName": updated_user['fullName'],
            "email": updated_user['email'],
            "phone": updated_user['phone'],
            "profileImage": image_url
            }

        return jsonify({
            "status": "success",
            "message": "Profile updated successfully",
            "user": session['user']
        }), 200

    except Exception as e:
        print(f"Error in update_profile: {str(e)}")
        return jsonify({'error': f'Failed to update profile: {str(e)}'}), 500
    finally:
        if 'cursor' in locals():
            cursor.close()
        if 'connection' in locals():
            connection.close()