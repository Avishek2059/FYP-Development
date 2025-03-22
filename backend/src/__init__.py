# import pytesseract
# from PIL import Image
# import os
# import re


# # Set the path to the Tesseract executable
# pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'

# # Function to extract text from a given image
# def extract_text_from_image(image):
#     try:
#         # Ensure image is a valid PIL Image object
#         if isinstance(image, Image.Image):
#             text = pytesseract.image_to_string(image)
#             return {"page_content": text, "metadata": {"source": "image_variable"}}
#         else:
#             print("Error: The provided input is not a valid image.")
#             return None
#     except Exception as e:
#         print(f"Error processing image: {e}")
#         return None


# def extract_required_info(extracted_text):
#     text = extracted_text.get("page_content", "")
   
#     # Extract Date/Time (Pattern: '08 Feb 2025,02:17 PM')
#     date_match = re.search(r'(\d{2} \w{3} \d{4})', text)
#     date_time = date_match.group(1) if date_match else "Not Found"

#     # Extract Service Name (Pattern: 'Fonepay Interbank')
#     service_match = re.findall(r'\n([A-Za-z]+\n[A-Za-z]+)\n', text)
#     service_name = service_match[-1].strip() if service_match else "Not Found"

#     # Extract Amount (Pattern: '15,000.00' after "Amount(NPR)")
#     amount_match = re.findall(r'\n([\d,]+\.\d{2})\n', text)
#     amount = amount_match[0] if amount_match else "Not Found"

#     # Extract Initiator (Pattern: '9745689800')
#     initiator_match = re.search(r'(\d{10})\n?$', text)
#     initiator = initiator_match.group(1) if initiator_match else "Not Found"

#     return {
#         "Date/Time": date_time,
#         "Service Name": service_name,
#         "Amount (NPR)": amount,
#         "Initiator": initiator
#     }