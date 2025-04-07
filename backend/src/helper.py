import re
from dotenv import load_dotenv
import os
#from PIL import Image
import google.generativeai as genai
from io import BytesIO
from dateutil import parser
from datetime import datetime

# Load API key
load_dotenv()
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))

# Expense Categories
EXPENSE_CATEGORIES = [
    "Food", "Education", "Clothing", "Transportation", "Housing & Utilities",
    "Entertainment & Leisure", "Healthcare & Medical", "Debt & Loans",
    "Savings & Investments", "Gifts & Donations", "Personal Care",
    "Insurance", "Business & Work-related", "Miscellaneous"
]


# Input Prompt for Gemini
input_prompt = """
You are an expert in analyzing invoices and categorizing expenses.
You will receive input images of invoices and must extract key details, 
including the issuer, date, total amount, invoice number (or bill number), and categorize the expense into one of the predefined categories.

Predefined Categories:
- Food
- Education
- Clothing
- Transportation
- Housing & Utilities
- Entertainment & Leisure
- Healthcare & Medical
- Debt & Loans
- Savings & Investments
- Gifts & Donations
- Personal Care
- Insurance
- Business & Work-related
- Miscellaneous

Output Format:
- Extract only the required values (e.g., "Kamalpokhari" instead of "Kamalpokhari Mart Pvt. Ltd.").
- Provide only one matching category from the predefined list.
- Example:
  - Invoice from: "KFC" → Category: "Food"
  - Invoice from: "City Bus Service" → Category: "Transportation"
  - Invoice from: "ABC Bookstore" → Category: "Education"

Return the extracted details in plain text without extra words.
"""

def clean_response(response, data_type):
    """
    Cleans Gemini's response to return only the required values.
    Uses regex to extract relevant information.
    """
    response = response.strip()

    if data_type == "issuer":
        # First, try to find up to "LTD."
        match = re.search(r"from\s(.+?LTD\.)", response, re.IGNORECASE)
        
        if match:
            return match.group(1).rstrip('.')  # If "LTD." is found, return up to "LTD."
        else:
            # If "LTD." is not found, fallback to match everything up to the first dot.
            match = re.search(r"from\s(.+?\.)", response)
            return match.group(1).rstrip('.') if match else "Not Found"

    elif data_type == "date":
        #match = re.search(r"(\d{1,2}/\d{1,2}/\d{4})", response)
        match = re.search(r"(\d{1,2}/\d{1,2}/\d{4}|\d{4}-\d{2}-\d{2})", response)
        return match.group(1) if match else "Not Found"

    elif data_type == "total":
        match = re.search(r"([\d,]+\.\d{2}|\d+)", response)
        return match.group(1) if match else "Not Found"

    elif data_type == "category":
        issuer_lower = response.lower()

        # Define category rules
        if any(keyword in issuer_lower for keyword in ["electricity", "water", "internet", "phone", "rent", "nea"]):
            return "Housing"
        elif any(keyword in issuer_lower for keyword in ["restaurant", "cafe", "mart", "grocery", "food"]):
            return "Food"
        elif any(keyword in issuer_lower for keyword in ["school", "university", "bookstore", "tuition"]):
            return "Education"
        elif any(keyword in issuer_lower for keyword in ["clothing", "fashion", "apparel"]):
            return "Shopping"
        elif any(keyword in issuer_lower for keyword in ["bus", "taxi", "train", "fuel", "transport"]):
            return "Transport"
        elif any(keyword in issuer_lower for keyword in ["hospital", "clinic", "pharmacy", "medicine"]):
            return "Healthcare"
        elif any(keyword in issuer_lower for keyword in ["movie", "netflix", "entertainment", "subscription"]):
            return "Entertainment"
        elif any(keyword in issuer_lower for keyword in ["loan", "credit", "bank payment", "debt", "installment"]):
            return "Debt Payments"
        elif any(keyword in issuer_lower for keyword in ["savings", "investment", "bank deposit", "mutual fund", "stocks"]):
            return "Savings/Investments"
        elif any(keyword in issuer_lower for keyword in ["gift", "donation", "charity", "present"]):
            return "Gifts & Donations"
        
        return "Miscellaneous"

    # elif data_type == "bill_number" or data_type == "invoice_number":
    #     match = re.search(r"(bill|invoice)\s*(?:number|no)\s*is\s*([\w\d-]+)", response, re.IGNORECASE)
    #     print(response)
    #     return match.group(2).rstrip('.') if match else response

    elif data_type == "bill_number" or data_type == "invoice_number":
        match = re.search(r"(?:bill|invoice)\s*(?:number|no)?\s*is\s*([\w\d-]+)", response, re.IGNORECASE)

        # Check if the first match is invalid (i.e., capturing only "KP") or not found
        if not match or match.group(1) == "KP":
            match = re.search(r"KP:\s*([\w\d-]+)", response, re.IGNORECASE)

        print(response)
        return match.group(1).rstrip('.') if match else "Not Found"
    
    
    return response  # Default return if no match

def get_gemini_response(image, question, data_type):
    """
    Calls Gemini API and extracts relevant information.
    """
    model = genai.GenerativeModel("gemini-1.5-flash")
    response = model.generate_content([question, image[0]]).text

    # Clean the response to enforce correct formatting
    return clean_response(response, data_type)


def input_image_setup(uploaded_file):
    """
    Processes the uploaded image file, reads it into memory as bytes, 
    and prepares it for further processing.
    
    :param uploaded_file: The image file sent in the POST request
    :return: The image content as bytes, wrapped in a list (for further processing)
    """
    if uploaded_file:
        # Read the contents of the file into memory
        bytes_data = uploaded_file.read()  # Reads the file into a byte stream
        image_parts = [
            {
                "mime_type": uploaded_file.content_type,  # Use content_type for MIME type
                "data": bytes_data  # The byte data of the image
            }
        ]
        return image_parts
    else:
        raise FileNotFoundError("No file uploaded")

def extract_invoice_details(invoice_image):
    """
    Extracts invoice details and categorizes the expense.
    """
    issuer = get_gemini_response(invoice_image, "Where is the invoice from?", "issuer")
    invoice_date = get_gemini_response(invoice_image, "What is the invoice date?", "date")
    grand_total = get_gemini_response(invoice_image, "What is the total or grand total?", "total")
    invoice_number = get_gemini_response(invoice_image, "What is the invoice number?", "invoice_number")
    expense_category = get_gemini_response(invoice_image, "What category does this invoice belong to?", "category")
    
    return issuer, invoice_date, grand_total, invoice_number, expense_category

# Local storage for extracted details
#expense_records = []

def convert_to_sql_date(date_str):
    formats = ["%d/%m/%Y", "%m/%d/%Y", "%Y-%m-%d", "%d-%m-%Y", "%d %b %Y", "%d %B %Y"]
    
    for fmt in formats:
        try:
            return datetime.strptime(date_str, fmt).strftime("%Y-%m-%d")
        except ValueError:
            continue
    
    return "0000-00-00"  # Default if no format matches









