from flask import Blueprint, jsonify, request, session
from database import get_db_connection, hash_password
from werkzeug.exceptions import BadRequest
from src.helper import input_image_setup, extract_invoice_details, convert_to_sql_date
from werkzeug.utils import secure_filename
from mimetypes import guess_type

addInvoice_bp = Blueprint('addInvoice', __name__)

#UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}
#app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Ensure the upload directory exists
# if not os.path.exists(UPLOAD_FOLDER):
#     os.makedirs(UPLOAD_FOLDER)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS
   

@addInvoice_bp.route('/expensesincomeimage', methods=['POST'])
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
    username = request.form.get('username')
    if not username:
        return jsonify({'error': 'No username provided'}), 400

    try:
        # Call the helper function to process the image
        image_data = input_image_setup(image)

        # Process the image data and extract needed details
        issuer, invoice_date, grand_total, invoice_number, expense_category = extract_invoice_details(image_data)

        print(issuer, invoice_date, grand_total, invoice_number, expense_category)

        # Validate extracted values and raise specific errors if any value is "Not Found"
        error_messages = []

        if issuer in [None, "Not Found"]:
            error_messages.append("Error: Issuer not found.")

        if invoice_date in [None, "Not Found"]:
            error_messages.append("Error: Invoice date not found.")

        if grand_total in [None, "Not Found"]:
            error_messages.append("Error: Grand total not found.")

        if invoice_number in [None, "Not Found"]:
            error_messages.append("Error: Invoice number not found.")

        if expense_category in [None, "Not Found"]:
            error_messages.append("Error: Expense category not found.")

        # If any errors exist, return a JSON response with status 400
        if error_messages:
            return jsonify({"status": "error", "errors": error_messages}), 400
        
        # Open database connection
        connection = get_db_connection()
        if not connection:
            return jsonify({"message": "Database connection failed"}), 500

        cursor = connection.cursor()

        # Check if username already exists
        cursor.execute("SELECT * FROM Invoices WHERE invoice_number = %s", (invoice_number,))
        invoice = cursor.fetchone()
        if invoice:
            cursor.close()
            connection.close()
            return jsonify({"message": "Invoice with this invoice no. already exist"}), 405
        
        # Insert the new invoice into the database
        insert_query = """
            INSERT INTO Invoices (username, invoice_number, issuer, invoice_date, grand_total, expense_category, income, image) 
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        """
        #username = username  # Placeholder for now
        income= 0.0
        print(username)

        # Example: Handling image from a file upload (e.g., Flask request)
        # Replace this with your actual image source
        #image = request.files['image']  # From Flask form upload
        image_data = image.read()  # Convert FileStorage to binary (bytes)
        print(image_data)
        print(f"Received file: {image.filename}")
        print(f"File content length: {len(image_data)} bytes")
        print(f"File MIME type: {image.mimetype}")
        # Ensure extracted data is valid
        invoice_dates= convert_to_sql_date(invoice_date)
        cursor.execute(insert_query, (username, invoice_number, issuer, invoice_dates, grand_total, expense_category,income,image_data))

        # Commit the transaction
        connection.commit()

        # Close cursor and connection
        cursor.close()
        connection.close()

        #return jsonify({"message": "Invoice added successfully"}), 201

        #return jsonify({'message': 'Invoice saved successfully', 'data': expense_records}), 201
        return jsonify({
        "status": "success",
            "data": {
                "issuer": issuer,
                "invoice_date": invoice_date,
                "grand_total": grand_total,
                "invoice_number": invoice_number,
                "expense_category": expense_category
            }
        }), 201

    except Exception as e:
        print(f"Error: {str(e)}")  # Add logging for debugging
        return jsonify({'error': f'Failed to process image: {str(e)}'}), 500
