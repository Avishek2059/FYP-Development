from flask import Blueprint, jsonify, request
from database import get_db_connection
from datetime import datetime
from dateutil.relativedelta import relativedelta

expenses_savings_bp = Blueprint('expenses_savings', __name__)

@expenses_savings_bp.route('/monthlyexpensessavings', methods=['POST'])
def get_monthly_expenses_savings():
    try:
        username = request.form.get('username')
        if not username:
            return jsonify({'error': 'Username is required'}), 400

        current_date = datetime.now()
        current_year = current_date.year

        connection = get_db_connection()
        if not connection:
            return jsonify({"error": "Database connection failed"}), 500

        cursor = connection.cursor()

        query = """
            SELECT 
                month_index, 
                SUM(grand_total) as total_expenses, 
                SUM(income) as total_income 
            FROM (
                SELECT 
                    EXTRACT(MONTH FROM invoice_date) - 1 as month_index, 
                    grand_total, 
                    income 
                FROM Invoices 
                WHERE username = %s 
                AND EXTRACT(YEAR FROM invoice_date) = %s
            ) subquery 
            GROUP BY month_index
        """
        #print(f"Executing query: {query % (username, current_year)}")
        cursor.execute(query, (username, current_year))
        results = cursor.fetchall()
        #print(f"Query results: {results}")

        # Initialize data arrays
        expenses_data = [0] * 12
        savings_data = [0] * 12

        # Populate data
        for row in results:
            month_index = int(row[0])  # 0-based month index
            expenses = float(row[1] or 0)
            income = float(row[2] or 0)
            savings = max(income - expenses, 0)
            expenses_data[month_index] = expenses
            savings_data[month_index] = savings

        # Apply minimum value of 20000 for non-zero months
        for i in range(12):
            expenses_data[i] = max(expenses_data[i], 20000 if expenses_data[i] > 0 else 0)
            savings_data[i] = max(savings_data[i], 20000 if savings_data[i] > 0 else 0)

        cursor.close()
        connection.close()

        response_data = {
            "expenses": expenses_data,
            "savings": savings_data,
            "currentMonth": current_date.month - 1
        }

        return jsonify({
            "status": "success",
            "data": response_data
        }), 200

    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({'error': f'Failed to fetch expenses/savings data: {str(e)}'}), 500

