from flask import Blueprint, jsonify, request, session
import joblib
import pandas as pd
import numpy as np
predict_bp = Blueprint('predict', __name__)


@predict_bp.route('/predict', methods=['POST'])
def predict():
    try:

        selectedCategory = request.form.get('selectedCategory')
        selectedMonth = request.form.get('selectedMonth')
        selectedYear = request.form.get('selectedYear')

        #selectedCategory = 'Food'

        if not selectedCategory or not selectedMonth or not selectedYear:
            return jsonify({"error": "Missing required fields"}), 401
        
        # Load the label encoder
        encoder = joblib.load("./model/label_encoder.pkl")
        if selectedCategory not in encoder.classes_:
            return jsonify({"error": "Invalid category"}), 400
        
        # Load the model
        model = joblib.load("./model/random_forest_model.pkl")

        selectedCategoryEncoded = encoder.transform([selectedCategory])[0]
        selectedMonths = int(selectedMonth)
        selectedYears = int(selectedYear)

        new_data = pd.DataFrame([[selectedCategoryEncoded, selectedYears, selectedMonths]], 
                                columns=["Category", "Year", "Month"])

        # Make prediction
        log_prediction = model.predict(new_data)[0]

        # Unlog the prediction to get the actual expense
        prediction = np.exp(log_prediction)

        return jsonify({'prediction': float(prediction)}), 200
    
    except Exception as e:
        print(f"Exception: {str(e)}")  # Debug log
        return jsonify({"message": "Server error", "error": str(e)}), 500