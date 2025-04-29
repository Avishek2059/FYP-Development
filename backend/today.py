from flask import Blueprint, jsonify, request
from database import get_db_connection
from datetime import datetime, timedelta

today_stats_bp = Blueprint('today_stats', __name__)

@today_stats_bp.route('/todaystats', methods=['POST'])
def get_today_stats():
    """
    Endpoint to compare grocery budget vs expenses for a user.
    Expects form data with 'username' and optional 'period' ('weekly' or 'monthly').
    Returns JSON with budget, expenses, and alert message for the grocery category.
    """
    try:
        # Get username from form data
        username = request.form.get('username')
        if not username:
            return jsonify({'error': 'Username is required'}), 400

        # Get today's date range
        today = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
        tomorrow = today + timedelta(days=1)

        # Database connection
        connection = get_db_connection()
        if not connection:
            return jsonify({"error": "Database connection failed"}), 500

        cursor = connection.cursor()

        # Query for today's data
        query = """
            SELECT SUM(income) as total_income, SUM(grand_total) as total_expenses
            FROM Invoices
            WHERE username = %s 
            AND invoice_date >= %s 
            AND invoice_date < %s
        """
        cursor.execute(query, (username, today, tomorrow))
        result = cursor.fetchone()
        today_income = float(result[0] or 0)
        today_expenses = float(result[1] or 0)

        # Calculate progress percentages (assuming max values for context)
        # For simplicity, let's assume a daily budget or max value of 500 for expenses and income

        Income_max_daily_value = 50000  # Adjust this based on your app's logic
        Expenses_max_daily_value = 10000
        expense_progress = min((today_expenses / Expenses_max_daily_value) * 100, 100) if Expenses_max_daily_value else 0
        income_progress = min((today_income / Income_max_daily_value) * 100, 100) if Income_max_daily_value else 0

        # Close cursor and connection
        cursor.close()
        connection.close()

        # Prepare response data
        response_data = {
            "expenses": today_expenses,
            "income": today_income,
            "expenseProgress": round(expense_progress, 2),
            "incomeProgress": round(income_progress, 2)
        }

        return jsonify({
            "status": "success",
            "data": response_data
        }), 200

    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({'error': f'Failed to fetch today\'s stats: {str(e)}'}), 500
