from flask import Blueprint, jsonify, request
from database import get_db_connection  # Assuming this handles your DB connection
from datetime import datetime
from dateutil.relativedelta import relativedelta  # For date calculations

monthlySaving_bp = Blueprint('monthlySaving', __name__)

@monthlySaving_bp.route('/monthlysavings', methods=['POST'])
def get_monthly_savings():
    """
    Endpoint to get monthly savings data for a user.
    Expects 'username' as a query parameter.
    Returns current month and last month's income/expense data.
    """
    try:
        # Get username from query parameters
        username = request.form.get('username')
        if not username:
            return jsonify({'error': 'Username is required'}), 400

        # Get current date and calculate months
        current_date = datetime.now()
        current_month_start = current_date.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        last_month_start = current_month_start - relativedelta(months=1)
        next_month_start = current_month_start + relativedelta(months=1)

        # Database connection
        connection = get_db_connection()
        if not connection:
            return jsonify({"message": "Database connection failed"}), 500

        cursor = connection.cursor()

        # Query for current month data
        current_query = """
            SELECT SUM(income) as total_income, SUM(grand_total) as total_expenses
            FROM Invoices
            WHERE username = %s 
            AND invoice_date >= %s 
            AND invoice_date < %s
        """
        cursor.execute(current_query, (username, current_month_start, next_month_start))
        current_result = cursor.fetchone()
        
        current_income = float(current_result[0] or 0)
        current_expenses = float(current_result[1] or 0)

        # Query for last month data
        last_month_end = current_month_start
        cursor.execute(current_query, (username, last_month_start, last_month_end))
        last_result = cursor.fetchone()
        
        last_income = float(last_result[0] or 0)
        last_expenses = float(last_result[1] or 0)

        # Close cursor and connection
        cursor.close()
        connection.close()

        # Prepare response data
        response_data = {
            "income": current_income,
            "expenses": current_expenses,
            "lastMonth": {
                "income": last_income,
                "expenses": last_expenses
            }
        }

        #print(response_data)

        return jsonify({
            "status": "success",
            "data": response_data
        }), 200

    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({'error': f'Failed to fetch savings data: {str(e)}'}), 500