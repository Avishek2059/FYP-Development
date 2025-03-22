from dotenv import load_dotenv
import os
import google.generativeai as genai
from database import get_db_connection
from flask import Blueprint, jsonify
import mysql.connector

# Load API key
load_dotenv()
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))


model = genai.GenerativeModel("gemini-1.5-flash")

def get_gemini_response(question,prompt):
    response=model.generate_content([prompt[0],question])
    return response.text

def read_sql_query(sql):
    connection = get_db_connection()
    if not connection:
        return {"error": "Database connection failed"}

    cursor = connection.cursor(dictionary=True)
    try:
        cursor.execute(sql)
        invoice = cursor.fetchall()
        #print(f"User fetched: {invoice}")  # Debug log
        return invoice
    except mysql.connector.Error as e:
        #print(f"SQL execution error: {e}")
        return {"error": "Invalid SQL query"}
    finally:
        cursor.close()
        connection.close()

