from dotenv import load_dotenv
import os
#from PIL import Image
import google.generativeai as genai

# Load API key
load_dotenv()
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))


model = genai.GenerativeModel("gemini-1.5-flash")


def get_gemini_response(input,image,user_prompt):
    response=model.generate_content([input,image[0],user_prompt])
    return response.text


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
    

input_prompt="""
You are an expert in understanding invoices. We will upload a a image as invoice
and you will have to answer any questions based on the uploaded invoice image
"""