from flask import Blueprint, jsonify, request
from database import get_db_connection
from datetime import datetime

category_expenses_bp = Blueprint('category_expenses', __name__)

@category_expenses_bp.route('/categoryexpenses', methods=['POST'])
def get_category_expenses():
    try:
        username = request.form.get('username')
        selected_date_str = request.form.get('selected_date')  # Format: YYYY-MM-DD

        if not username:
            return jsonify({'error': 'Username is required'}), 400
        if not selected_date_str:
            return jsonify({'error': 'Selected date is required'}), 400

        try:
            selected_date = datetime.strptime(selected_date_str, '%Y-%m-%d').date()
        except ValueError:
            return jsonify({'error': 'Invalid date format, use YYYY-MM-DD'}), 400

        connection = get_db_connection()
        if not connection:
            return jsonify({"error": "Database connection failed"}), 500

        cursor = connection.cursor()

        # Query to fetch expenses by category for the selected date
        query = """
            SELECT 
                expense_category,
                SUM(grand_total) as total_expense
            FROM Invoices
            WHERE username = %s 
            AND DATE(invoice_date) = %s
            GROUP BY expense_category
        """
        #print(f"Executing query: {query % (username, selected_date)}")
        cursor.execute(query, (username, selected_date))
        results = cursor.fetchall()
        #print(f"Query results: {results}")

        # Define categories and colors
        categories = [
            {"name": "Food", "color": "#FF6F61"},           # Coral
            {"name": "Transport", "color": "#6B7280"},      # Gray
            {"name": "Entertainment", "color": "#FBBF24"},  # Yellow
            {"name": "Housing", "color": "#34D399"},        # Green
            {"name": "Shopping", "color": "#60A5FA"},       # Blue
            {"name": "Healthcare", "color": "#A78BFA"},     # Purple
            {"name": "Debt Payments", "color": "#F87171"},  # Red
            {"name": "Savings/Investments", "color": "#4ADE80"}, # Light Green
            {"name": "Gifts & Donations", "color": "#F472B6"}, # Pink
            {"name": "Miscellaneous", "color": "#FCD34D"},  # Amber
        ]

        # Initialize data for all categories (excluding "All")
        category_data = []
        for category in categories:
            expense = 0
            for row in results:
                if row[0] and row[0].lower() == category["name"].lower():
                    expense = float(row[1] or 0)
                    break
            category_data.append({
                "name": category["name"],
                "expense": expense,
                "color": category["color"]
            })

        cursor.close()
        connection.close()

        response_data = {
            "categories": category_data,
            "selected_date": selected_date.strftime('%Y-%m-%d')
        }

        return jsonify({
            "status": "success",
            "data": response_data
        }), 200

    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({'error': f'Failed to fetch category expenses: {str(e)}'}), 500