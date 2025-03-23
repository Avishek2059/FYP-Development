from flask import Blueprint, jsonify, request, session
from database import get_db_connection, verify_password
expenses_bp = Blueprint('expenses', __name__)


@expenses_bp.route('/expenses', methods=['POST'])
def expenses():
    try:
        username = request.form.get('username')
        selectedCategory = request.form.get('selectedCategory')

        if not username or not selectedCategory:
            return jsonify({"error": "Missing required fields"}), 400
        
        # Define the SQL queries (as strings, not lists) with parameterized placeholders
        query1 = "SELECT * FROM Invoices WHERE username = %s"
        query2 = "SELECT * FROM Invoices WHERE username = %s AND expense_category = %s"

        connection = get_db_connection()
        if not connection:
            return jsonify({"error": "Database connection failed"}), 500

        cursor = connection.cursor(dictionary=True)
        selectedCategory = selectedCategory.lower()
        # Execute the appropriate query with parameters
        if selectedCategory == 'all':
            cursor.execute(query1, (username,))
        else:
            cursor.execute(query2, (username, selectedCategory))
        
        #cursor.execute(query1)
        records = cursor.fetchall()
        #print(f"User fetched: {records}")  # Debug log
        cursor.close()
        connection.close()

        # Convert rows to a list of dictionaries
        expenses = [
            {
                'issuer': row['issuer'],
                'invoice_number': row['invoice_number'],
                'expense_category': row['expense_category'],
                'grand_total': row['grand_total'],
                'invoice_date': row['invoice_date'],
            }
            for row in records
        ]

        # Close the connection
        connection.close()

        # Return the fetched expenses
        return jsonify({'expenses': expenses})
    
    except Exception as e:
        print(f"Exception: {str(e)}")  # Debug log
        if 'connection' in locals() and connection.is_connected():
            if 'cursor' in locals():
                cursor.close()
            connection.close()
        return jsonify({"message": "Server error", "error": str(e)}), 500