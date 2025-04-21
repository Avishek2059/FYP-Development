from flask import Flask, request, jsonify,send_from_directory
from dotenv import load_dotenv
from flask_cors import CORS
import os



from createAccount import createAccount_bp
from signIn import login_bp
from addInvoice import addInvoice_bp
from getanswer import getanswer_bp
from sqlQuery import sqlQuery_bp
from predict import predict_bp
from expenses import expenses_bp
from monthlySaving import monthlySaving_bp
from incomeExpenses import income_exp_bp
from today import today_stats_bp
from monthlyExpSave import expenses_savings_bp
from weekly_stats import weekly_stats_bp
from categoryexpenses import category_expenses_bp
from profileView import profile_bp
from editProfile import update_profile_bp
from addIncome import addincome_bp
from deleteAccount import deleteaccount_bp
from changeVerify import password_bp
from changePassword import changepassword_bp
from Recommendation import recommendation_bp
from ForgetPassword import password_reset_bp
from budget import budget_bp


# Initialize Flask app
app = Flask(__name__)
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY')
CORS(app)  # Enable CORS

# Load environment variables from .env file
load_dotenv()

app.register_blueprint(createAccount_bp)
app.register_blueprint(login_bp)
app.register_blueprint(addInvoice_bp)
app.register_blueprint(getanswer_bp)
app.register_blueprint(sqlQuery_bp)
app.register_blueprint(predict_bp)
app.register_blueprint(expenses_bp)
app.register_blueprint(monthlySaving_bp)
app.register_blueprint(income_exp_bp)
app.register_blueprint(today_stats_bp)
app.register_blueprint(expenses_savings_bp)
app.register_blueprint(weekly_stats_bp)
app.register_blueprint(category_expenses_bp)
app.register_blueprint(profile_bp)
app.register_blueprint(update_profile_bp)
app.register_blueprint(addincome_bp)
app.register_blueprint(deleteaccount_bp)
app.register_blueprint(password_bp)
app.register_blueprint(changepassword_bp)
app.register_blueprint(recommendation_bp)
app.register_blueprint(password_reset_bp)
app.register_blueprint(budget_bp)


# Serve the 'uploads' folder as a static directory
app.config['UPLOAD_FOLDER'] = 'uploads'

# Optional: If you need a custom route for uploads
@app.route('/uploads/<path:filename>')
def serve_uploaded_file(filename):
    try:
        return send_from_directory(app.config['UPLOAD_FOLDER'], filename)
    except FileNotFoundError:
        return jsonify({"error": f"File not found: {filename}"}), 404
    except Exception as e:
        return jsonify({"error": f"Failed to serve file: {str(e)}"}), 500

# Run the Flask app
if __name__ == '__main__':
    app.run(host= '0.0.0.0', port=5005, debug=True)