from flask import Blueprint, jsonify, request, session
from werkzeug.exceptions import BadRequest
from src.helpgetanswer import input_image_setup, get_gemini_response, input_prompt
from werkzeug.utils import secure_filename
from mimetypes import guess_type


getanswer_bp = Blueprint('getAnswer', __name__)

#UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS
   

@getanswer_bp.route('/getanswer', methods=['POST'])
def expensesincomeimage():
    if 'image' not in request.files:
        return jsonify({'error': 'No image provided'}), 400

    image = request.files['image']
    
    if image.filename == '':
        return jsonify({'error': 'No selected image'}), 400

    # Validate file extension
    if not allowed_file(image.filename):
        return jsonify({'error': 'Invalid file type. Allowed types: png, jpg, jpeg, gif'}), 400

    # Validate MIME type
    mime_type, _ = guess_type(image.filename)
    if not mime_type or not mime_type.startswith('image'):
        return jsonify({'error': 'Invalid file type. Please upload an image'}), 400
    
    # Get username from form data
    question = request.form.get('question')
    if not question:
        return jsonify({'error': 'No question provided'}), 400

    try:
        # Call the helper function to process the image
        image_data = input_image_setup(image)

        # Process the image data and extract needed answer
        response=get_gemini_response(input_prompt,image_data,question)

        print(response)

        return jsonify({'response': response}), 200

    except Exception as e:
        print(f"Error: {str(e)}")  # Add logging for debugging
        return jsonify({'error': f'Failed to process image: {str(e)}'}), 500