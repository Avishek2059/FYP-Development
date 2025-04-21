from flask import Blueprint, request, jsonify
from database import get_db_connection
from datetime import datetime

# Create the budget blueprint
budget_bp = Blueprint('budget', __name__)

# Endpoint to set a budget
@budget_bp.route('/set_budget', methods=['POST'])
def set_budget():
    try:
        data = request.get_json()

        # Validate required fields
        required_fields = ['username', 'category', 'period', 'amount']
        for field in required_fields:
            if field not in data or not data[field]:
                return jsonify({'error': f'Missing required field: {field}'}), 400

        # Extract values
        username = data['username']
        category = data['category']
        period = data['period']

        # Validate period
        valid_periods = ['Today', 'Week', 'Month']
        if period not in valid_periods:
            return jsonify({'error': f'Invalid period. Must be one of: {", ".join(valid_periods)}'}), 400

        # Validate and convert amount
        try:
            amount = float(data['amount'])
            if amount <= 0:
                raise ValueError
        except ValueError:
            return jsonify({'error': 'Amount must be a positive number'}), 400

        # Insert into database
        connection = get_db_connection()
        if not connection:
            return jsonify({"message": "Database connection failed"}), 500

        cursor = connection.cursor()
        query = "INSERT INTO budget (username, category, period, amount) VALUES (%s, %s, %s, %s)"
        cursor.execute(query, (username, category, period, amount))
        connection.commit()

        # Get the ID of the inserted row
        budget_id = cursor.lastrowid
        cursor.close()
        connection.close()

        return jsonify({
            'message': f'Budget of {amount} set for {category} {period}',
            'budget': {
                'id': budget_id,
                'username': username,
                'category': category,
                'period': period,
                'amount': amount
            }
        }), 201

    except Exception as e:
        return jsonify({'error': str(e)}), 500
