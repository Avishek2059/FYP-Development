from flask import Blueprint, jsonify, request,session
from database import get_db_connection
import joblib
import pandas as pd
import numpy as np
from datetime import datetime
from dateutil.relativedelta import relativedelta  # For date calculations

recommendation_bp = Blueprint('recommendation', __name__)


@recommendation_bp.route('/recommendation', methods=['POST'])
def recommendation():
    try:
        # Get username from request
        username = request.form.get('username')
        if not username:
            return jsonify({'error': 'Username is required'}), 400

        # Date calculations
        current_date = datetime.now()
        current_month_start = current_date.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        last_month_start = current_month_start - relativedelta(months=1)
        print(current_month_start, last_month_start)

        # Database connection
        connection = get_db_connection()
        if not connection:
            return jsonify({"error": "Database connection failed"}), 500

        # Fetch monthly data
        cursor = connection.cursor(dictionary=True)
        query = """
            SELECT 
                SUM(income) AS monthly_income,
                SUM(CASE WHEN expense_category = 'Housing' THEN grand_total ELSE 0 END) AS Housing,
                SUM(CASE WHEN expense_category = 'Food' THEN grand_total ELSE 0 END) AS Food,
                SUM(CASE WHEN expense_category = 'Transportation' THEN grand_total ELSE 0 END) AS Transportation,
                SUM(CASE WHEN expense_category = 'Entertainment' THEN grand_total ELSE 0 END) AS Entertainment,
                SUM(CASE WHEN expense_category = 'Shopping' THEN grand_total ELSE 0 END) AS Shopping,
                SUM(CASE WHEN expense_category = 'Healthcare' THEN grand_total ELSE 0 END) AS Healthcare,
                SUM(CASE WHEN expense_category = 'Debt Payments' THEN grand_total ELSE 0 END) AS 'Debt Payments',
                SUM(CASE WHEN expense_category = 'Savings/Investments' THEN grand_total ELSE 0 END) AS 'Savings/Investments',
                SUM(CASE WHEN expense_category = 'Miscellaneous' THEN grand_total ELSE 0 END) AS Miscellaneous
            FROM invoices
            WHERE username = %s
            AND invoice_date >= %s 
            AND invoice_date < %s
        """
        cursor.execute(query,(username, last_month_start, current_month_start))
        monthly_data = cursor.fetchone()
        
        if not monthly_data or all(v is None for v in monthly_data.values()):
            return jsonify({'error': 'No data found for this user'}), 404


        # Load model and encoder
        model = joblib.load("./model/random_forest_classifier_model.pkl")
        le = joblib.load("./model/label_classifier_encoder.pkl")

        # Features for the model (adjust based on your actual model requirements)
        features = [
                'monthly_income',
                'Housing',
                'Food',
                'Transportation',
                'Entertainment',
                'Shopping',
                'Healthcare',
                'Debt Payments',
                'Savings/Investments',
                'Miscellaneous'
            ]
        
        cleaned_data = {k: monthly_data[k] if monthly_data[k] is not None else 0 for k in features}
        # Prepare data for prediction
        input_df = pd.DataFrame([cleaned_data])[features]
        prediction = model.predict(input_df)
        strategy = le.inverse_transform(prediction)[0]

        # Recommendation logic
        recommendations = {
            'Aggressive Saving': 'Save 30-40% of income, invest in low-risk options',
            'Moderate Saving': 'Save 15-25% of income, build emergency fund',
            'Basic Saving': 'Save 5-10% of income, focus on small consistent savings',
            'Needs Budgeting': 'Cut discretionary spending by 20%, review budget'
        }

        # Clean up
        cursor.close()
        connection.close()

        # Prepare response with monthly data
        response_data = {
            'monthly_data': cleaned_data,
            'strategy': strategy,
            'recommendation': recommendations[strategy]
        }

        return jsonify(response_data), 200

    except Exception as e:
        print(f"Exception: {str(e)}")
        return jsonify({"message": "Server error", "error": str(e)}), 500