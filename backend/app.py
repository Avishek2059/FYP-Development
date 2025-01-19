from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from flask_bcrypt import Bcrypt
from dotenv import load_dotenv
from flask_cors import CORS
import os

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS

# Load environment variables from .env file
load_dotenv()

# Configure Flask app with environment variables
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY')
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('SQLALCHEMY_DATABASE_URI')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize SQLAlchemy
db = SQLAlchemy(app)

# Define the Users model for SQLAlchemy
class Users(db.Model):
    __tablename__ = 'users'
    fullName = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), nullable=False)
    phone = db.Column(db.String(100), nullable=False)
    username = db.Column(db.String(100), nullable=False, primary_key=True)
    password = db.Column(db.String(100), nullable=False)

    def __init__(self, fullName, email, phone, username, password):
        self.fullName = fullName
        self.email = email
        self.phone = phone
        self.username = username
        self.password = password

# Initialize Bcrypt for password hashing
bcrypt = Bcrypt(app)

# Initialize JWTManager for handling JWTs
jwt = JWTManager(app)

# Create all SQLAlchemy tables
with app.app_context():
    db.create_all()

# User registration endpoint
@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    fullName = data['fullName']
    email = data['email']
    phone = data['phone']
    username = data['username']
    password = data['password']

    if Users.query.filter_by(email=email).first() or Users.query.filter_by(username=username).first():
        return jsonify(message="Email or username already taken"), 400

    hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')
    new_user = Users(fullName=fullName, email=email, phone=phone, username=username, password=hashed_password)
    db.session.add(new_user)
    db.session.commit()
    return jsonify(message="User registered successfully"), 201

# User login endpoint
@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data['email']
    password = data['password']

    user = Users.query.filter_by(email=email).first()

    if not user or not bcrypt.check_password_hash(user.password, password):
        return jsonify(message="Invalid credentials"), 401

    access_token = create_access_token(identity=user.id)
    return jsonify(access_token=access_token), 200

# Protected route
@app.route('/protected', methods=['GET'])
@jwt_required()
def protected():
    current_user_id = get_jwt_identity()
    current_user = Users.query.get(current_user_id)
    return jsonify(logged_in_as=current_user.username), 200

# Run the Flask app
if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5005, debug=True)