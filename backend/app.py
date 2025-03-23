from flask import Flask, request, jsonify
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

# Run the Flask app
if __name__ == '__main__':
    app.run(host= '0.0.0.0', port=5005, debug=True)