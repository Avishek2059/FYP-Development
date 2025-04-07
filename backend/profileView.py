from flask import Blueprint, jsonify, request
from database import get_db_connection

profile_bp = Blueprint('profile', __name__)

@profile_bp.route('/profile', methods=['POST'])
def get_profile_data():
    try:
        username = request.form.get('username')

        if not username:
            return jsonify({'error': 'Username is required'}), 400

        connection = get_db_connection()
        if not connection:
            return jsonify({"error": "Database connection failed"}), 500

        cursor = connection.cursor()

        # Query to get the total number of invoices, total expenses, and total income
        query = """
            SELECT 
                COUNT(*) as total_invoices,
                SUM(grand_total) as total_expenses,
                SUM(income) as total_income
            FROM Invoices
            WHERE username = %s
        """
        #print(f"Executing query: {query % username}")
        cursor.execute(query, (username,))
        result = cursor.fetchone()
        #print(f"Query result: {result}")

        # Extract data from the result
        total_invoices = result[0] if result else 0
        total_expenses = float(result[1] or 0) if result and result[1] is not None else 0.0
        total_income = float(result[2] or 0) if result and result[2] is not None else 0.0

        # Calculate total savings
        total_savings = total_income - total_expenses

        cursor.close()
        connection.close()

        response_data = {
            "total_invoices": total_invoices,
            "total_savings": total_savings
        }

        return jsonify({
            "status": "success",
            "data": response_data
        }), 200

    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({'error': f'Failed to fetch profile data: {str(e)}'}), 500