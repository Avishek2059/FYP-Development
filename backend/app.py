from flask import Flask, request, jsonify
from dotenv import load_dotenv
from flask_cors import CORS
import os



from createAccount import createAccount_bp
from signIn import login_bp
from addInvoice import addInvoice_bp
from getanswer import getanswer_bp
from sqlQuery import sqlQuery_bp

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

# Run the Flask app
if __name__ == '__main__':
    app.run(host= '0.0.0.0', port=5005, debug=True)