from flask import Blueprint, jsonify, request
from database import get_db_connection
from datetime import datetime, timedelta, date

weekly_stats_bp = Blueprint('weekly_stats', __name__)

@weekly_stats_bp.route('/weeklystats', methods=['POST'])
def get_weekly_stats():
    try:
        username = request.form.get('username')
        start_date_str = request.form.get('start_date')  # Format: YYYY-MM-DD

        if not username:
            return jsonify({'error': 'Username is required'}), 400
        if not start_date_str:
            return jsonify({'error': 'Start date is required'}), 400

        try:
            start_date = datetime.strptime(start_date_str, '%Y-%m-%d').date()  # Convert to date
        except ValueError:
            return jsonify({'error': 'Invalid start date format, use YYYY-MM-DD'}), 400

        # Calculate the end date (start_date + 6 days to cover a full week)
        end_date = start_date + timedelta(days=6)

        connection = get_db_connection()
        if not connection:
            return jsonify({"error": "Database connection failed"}), 500

        cursor = connection.cursor()

        # Query to fetch daily income and expenses for the week
        query = """
            SELECT 
                DATE(invoice_date) as day,
                SUM(grand_total) as total_expenses,
                SUM(income) as total_income
            FROM Invoices
            WHERE username = %s 
            AND invoice_date >= %s 
            AND invoice_date <= %s
            GROUP BY DATE(invoice_date)
        """
        #print(f"Executing query: {query % (username, start_date, end_date)}")
        cursor.execute(query, (username, start_date, end_date))
        results = cursor.fetchall()
        #print(f"Query results: {results}")

        # Initialize arrays for 7 days (Sun to Sat)
        income_data = [0] * 7
        expense_data = [0] * 7

        # Map results to the correct day of the week
        for row in results:
            day = row[0]  # Date of the invoice (datetime.date)
            day_index = (day - start_date).days  # 0 to 6 (Sun to Sat)
            if 0 <= day_index <= 6:
                income_data[day_index] = float(row[2] or 0)
                expense_data[day_index] = float(row[1] or 0)

        cursor.close()
        connection.close()

        response_data = {
            "income": income_data,
            "expenses": expense_data,
            "start_date": start_date.strftime('%Y-%m-%d'),
            "end_date": end_date.strftime('%Y-%m-%d')
        }

        return jsonify({
            "status": "success",
            "data": response_data
        }), 200

    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({'error': f'Failed to fetch weekly stats: {str(e)}'}), 500