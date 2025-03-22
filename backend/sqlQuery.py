from flask import Blueprint, jsonify, request, session
#from database import get_db_connection
from src.helpsqlQuery import get_gemini_response, read_sql_query
sqlQuery_bp = Blueprint('sqlQuery', __name__)

@sqlQuery_bp.route('/sqlquery', methods=['POST'])
def sqlQuery():
    try:
        # data = request.get_json()
        # if not data:
        #     return jsonify({"message": "Invalid or missing JSON data"}), 400

        username = request.form.get('username')
        query = request.form.get('query')

        if not username or not query:
            return jsonify({"error": "Missing required fields"}), 400

        prompt = [
            f"""
            You are an expert in converting English questions to SQL queries!
            The MySQL database has a table named Invoices with the following columns: username, invoice_number, issuer, invoice_date, grand_total, expense_category, income, image, id. 

            Whenever I ask for a query, you'll filter results using WHERE username = '{username}' to fetch only my data based on the provided username.

            For example:

            Example 1 - What is my total expenses till now?, 
                the SQL command will be something like this:
            SELECT SUM(grand_total) AS total_expenses  
            FROM Invoices  
            WHERE username = '{username}';

            Example 2 - What are my expenses?, 
                the SQL command will be something like this:
            SELECT invoice_number, issuer, invoice_date, grand_total, expense_category  
            FROM Invoices  
            WHERE username = '{username}'; 

            Example 3 - Separate my expenses on the basis of category and total them?, 
                the SQL command will be something like this:
            SELECT expense_category, SUM(grand_total) AS total_expense  
            FROM Invoices  
            WHERE username = '{username}'  
            GROUP BY expense_category;

            Example 4 - In which category do I make the most expenses?, 
                the SQL command will be something like this:
            SELECT expense_category, SUM(grand_total) AS total_expense  
            FROM Invoices  
            WHERE username = '{username}'  
            GROUP BY expense_category  
            ORDER BY total_expense DESC  
            LIMIT 1;

            Also, the SQL code should not have ``` at the beginning or end, and the word 'sql' should not appear in the output.
            """
        ]

        # Generate SQL query using Gemini
        sql = get_gemini_response(query, prompt)
        print(f"Generated SQL: {sql}")  # Debug log

        # Execute the SQL query and get the result
        response = read_sql_query(sql)  # Pass username if required by your implementation
        print(f"Query result: {response}")  # Debug log

        # Check if the response indicates an error
        if isinstance(response, dict) and "error" in response:
            return jsonify(response), 500

        # Return the query result as JSON
        return jsonify({
            "message": "Query executed successfully",
            "data": response
        }), 200

        

    except Exception as e:
        print(f"Exception: {str(e)}")  # Debug log
        return jsonify({"message": "Server error", "error": str(e)}), 500
    


#username = username  # Set your username here

