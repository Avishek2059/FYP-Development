from flask import Blueprint, jsonify, request
from database import get_db_connection
from datetime import datetime
from dateutil.relativedelta import relativedelta

income_exp_bp = Blueprint('income_exp', __name__)

@income_exp_bp.route('/incomeexpenses', methods=['POST'])
def get_income_expenses():
    """
    Endpoint to get income and expenditure data for a user.
    Expects form data with 'username' field in the request body.
    Returns JSON with current and last month's income and expenses, plus percentage changes.
    """
    try:
        # Get username from form data
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
            return jsonify({"error": "Database connection failed"}), 500

        cursor = connection.cursor()

        # Query for current month data
        query = """
            SELECT SUM(income) as total_income, SUM(grand_total) as total_expenses
            FROM Invoices
            WHERE username = %s 
            AND invoice_date >= %s 
            AND invoice_date < %s
        """
        cursor.execute(query, (username, current_month_start, next_month_start))
        current_result = cursor.fetchone()
        current_income = float(current_result[0] or 0)
        current_expenses = float(current_result[1] or 0)

        # Query for last month data
        cursor.execute(query, (username, last_month_start, current_month_start))
        last_result = cursor.fetchone()
        last_income = float(last_result[0] or 0)
        last_expenses = float(last_result[1] or 0)

        # Calculate percentage changes
        income_percentage = ((current_income - last_income) / (last_income or 1)) * 100 if last_income else 0
        expense_percentage = ((current_expenses - last_expenses) / (last_expenses or 1)) * 100 if last_expenses else 0

        # Close cursor and connection
        cursor.close()
        connection.close()

        # Prepare response data
        response_data = {
            "current": {
                "income": current_income,
                "expenses": current_expenses
            },
            "lastMonth": {
                "income": last_income,
                "expenses": last_expenses
            },
            "percentage": {
                "income": round(income_percentage, 2),
                "expenses": round(expense_percentage, 2)
            }
        }

        return jsonify({
            "status": "success",
            "data": response_data
        }), 200

    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({'error': f'Failed to fetch income/expense data: {str(e)}'}), 500
