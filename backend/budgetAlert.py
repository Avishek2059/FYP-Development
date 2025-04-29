from flask import Blueprint, jsonify, request
from database import get_db_connection
from datetime import datetime, timedelta
from dateutil.relativedelta import relativedelta

budgetAlert_bp = Blueprint('budgetAlert', __name__)

@budgetAlert_bp.route('/budgetAlert', methods=['POST'])
def get_budget_alert():
    """
    Endpoint to compare budgets vs expenses for all categories for a user.
    Expects form data with 'username'. Fetches budget period from budget table.
    Returns JSON with budget, expenses, and alert messages for each category.
    """
    try:
        # Get username from form data
        username = request.form.get('username')
        print(f"Received username: {username}")
        if not username:
            return jsonify({'error': 'Username is required'}), 400

        # Database connection
        connection = get_db_connection()
        if not connection:
            return jsonify({"error": "Database connection failed"}), 500

        cursor = connection.cursor()

        # Query for all budgets for the user
        budget_query = """
            SELECT category, amount, period
            FROM budget
            WHERE username = %s
        """
        cursor.execute(budget_query, (username,))
        budget_results = cursor.fetchall()

        if not budget_results:
            cursor.close()
            connection.close()
            return jsonify({
                "status": "success",
                "data": [{
                    "category": "none",
                    "budget": 0.0,
                    "expenses": 0.0,
                    "alert": "No budgets set for any category."
                }]
            }), 200

        # Process each budget and calculate expenses
        alerts = []
        for budget in budget_results:
            category = budget[0]
            budget_amount = float(budget[1])
            period = budget[2]  # Today, Week, Month

            if period not in ['Today', 'Week', 'Month']:
                alerts.append({
                    "category": category,
                    "budget": budget_amount,
                    "expenses": 0.0,
                    "alert": f"Invalid period '{period}' for {category} budget. Must be 'Today', 'Week', or 'Month'."
                })
                continue

            # Calculate date range based on period
            today = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
            if period == 'Today':
                start_date = today
                end_date = today + timedelta(days=1)
            elif period == 'Week':
                start_date = today - timedelta(days=today.weekday())  # Start of current week (Monday)
                end_date = start_date + timedelta(days=7)
            else:  # Month
                start_date = today.replace(day=1)  # Start of current month
                end_date = start_date + relativedelta(months=1)

            # Query for total expenses for the category in the period
            expenses_query = """
                SELECT SUM(grand_total) as total_expenses
                FROM Invoices
                WHERE username = %s 
                AND expense_category = %s 
                AND invoice_date >= %s 
                AND invoice_date < %s
            """
            cursor.execute(expenses_query, (username, category, start_date, end_date))
            expenses_result = cursor.fetchone()
            total_expenses = float(expenses_result[0] or 0)

            # Compare budget vs expenses
            alert_message = None
            if total_expenses > budget_amount:
                alert_message = f"Warning: You have exceeded your {period.lower()} {category} budget of {budget_amount:.2f}. Total spent: {total_expenses:.2f}."
            elif total_expenses == budget_amount:
                alert_message = f"Alert: You have reached your {period.lower()} {category} budget of {budget_amount:.2f}. Total spent: {total_expenses:.2f}."
            elif total_expenses >= budget_amount * 0.9:
                alert_message = f"Alert: You are close to your {period.lower()} {category} budget of {budget_amount:.2f}. Total spent: {total_expenses:.2f}."

            alerts.append({
                "category": category,
                "budget": budget_amount,
                "expenses": total_expenses,
                "alert": alert_message
            })

        # Close cursor and connection
        cursor.close()
        connection.close()

        # Prepare response data
        return jsonify({
            "status": "success",
            "data": alerts
        }), 200

    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({'error': f'Failed to fetch budget alerts: {str(e)}'}), 500