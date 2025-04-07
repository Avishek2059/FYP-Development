from flask import Blueprint, jsonify, request
from database import get_db_connection
import random
import string
from datetime import date

addincome_bp = Blueprint('addincome', __name__)

def generate_invoice_number():
    """Generate a random invoice number in the format INV-YYYYMMDD-XXXX."""
    today = date.today()
    date_part = today.strftime("%Y%m%d")  # e.g., 20250325 for March 25, 2025
    random_part = ''.join(random.choices(string.ascii_uppercase + string.digits, k=4))  # e.g., AB12
    return f"INV-{date_part}-{random_part}"

@addincome_bp.route('/addincome', methods=['POST'])
def add_income():
    connection = None
    cursor = None
    try:
        # Access the fields from FormData
        issuer = request.form.get('category')  # Changed from category to issuer
        username = request.form.get('username')
        amount = request.form.get('amount')

        print(issuer,username,amount)

        if not issuer or not username or not amount:
            return jsonify({"message": "Missing required fields"}), 400

        # Convert amount to float and validate
        try:
            amount = float(amount)
            if amount <= 0:
                return jsonify({"message": "Amount must be greater than 0"}), 400
        except ValueError:
            return jsonify({"message": "Amount must be a valid number"}), 400

        # Generate invoice number
        invoice_number = generate_invoice_number()

        # Get current date for invoice_date
        invoice_date = date.today()

        # Connect to the database
        connection = get_db_connection()
        if not connection:
            return jsonify({"message": "Database connection failed"}), 500

        cursor = connection.cursor()

        # Check if the invoice number already exists
        while True:
            cursor.execute("SELECT COUNT(*) FROM Invoices WHERE invoice_number = %s", (invoice_number,))
            if cursor.fetchone()[0] == 0:
                break
            invoice_number = generate_invoice_number()

        # Insert the income into the database
        query = """
            INSERT INTO Invoices (username, invoice_number, issuer, invoice_date, grand_total, expense_category, income, image)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        """
        cursor.execute(query, (username, invoice_number, issuer, invoice_date, 0.0, 'null', amount, 'null'))
        connection.commit()

        return jsonify({
            "message": "Income added successfully",
            "invoice_number": invoice_number,
            "invoice_date": str(invoice_date),
            "income": str(amount)
        }), 200

    except Exception as e:
        print(f"Error in addincome: {str(e)}")
        return jsonify({"message": "Server error", "error": str(e)}), 500
    
    finally:
        # Cleanup database resources
        if cursor is not None:
            cursor.close()
        if connection is not None and connection.is_connected():
            connection.close()
