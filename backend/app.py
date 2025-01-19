# filepath: /d:/FYP Development/FYP Development/backend/app.py
from flask import Flask, request, jsonify
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from flask_bcrypt import Bcrypt
from flask_pymongo import PyMongo
from bson.objectid import ObjectId
from pymongo import MongoClient
from dotenv import load_dotenv
from flask_cors import CORS
import os

app = Flask(__name__)
CORS(app)  # Enable CORS

load_dotenv()  # Load environment variables from .env file

app.config['SECRET_KEY'] = os.getenv('SECRET_KEY')
app.config['MONGO_URI'] = os.getenv('MONGO_URI')
mongo = PyMongo(app)
bcrypt = Bcrypt(app)
jwt = JWTManager(app)

uri = os.getenv('MONGO_URI')

# Create a new client and connect to the server
client = MongoClient(uri)

# Send a ping to confirm a successful connection
try:
    client.admin.command('ping')
    print("Pinged your deployment. You successfully connected to MongoDB!")
except Exception as e:
    print(e)
db = client['FakeData']
collection = db['users']

# User registration
@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    fullName = data['fullName']
    email = data['email']
    phone = data['phone']
    username = data['username']
    password = data['password']

    if collection.find_one({'email': email}) or collection.find_one({'username': username}):
        return jsonify(message="Email or username already taken"), 400

    hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')
    collection.insert_one({'fullName': fullName, 'email': email, 'phone': phone, 'username': username, 'password': hashed_password})
    return jsonify(message="User registered successfully"), 201

# User login
@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data['email']
    password = data['password']

    user = collection.find_one({'email': email})

    if not user or not bcrypt.check_password_hash(user['password'], password):
        return jsonify(message="Invalid credentials"), 401

    access_token = create_access_token(identity=str(user['_id']))
    return jsonify(access_token=access_token), 200

# Protected route
@app.route('/protected', methods=['GET'])
@jwt_required()
def protected():
    current_user_id = get_jwt_identity()
    current_user = collection.find_one({'_id': ObjectId(current_user_id)})
    return jsonify(logged_in_as=current_user['username']), 200

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5005, debug=True)