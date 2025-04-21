import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from urllib.parse import quote


# Gmail SMTP configuration
GMAIL_USER = 'jaiswalavishek2059@gmail.com'  # Replace with your Gmail address
GMAIL_PASSWORD = 'brzs oymo icpk bwjg'  # Replace with your Gmail App Password
ADMIN_EMAIL = 'jaiswalavishek2002@gmail.com'  # Replace with admin's email address
ip='192.168.18.12'

def send_email(to_email, subject, body):
    try:
        msg = MIMEMultipart()
        msg['From'] = GMAIL_USER
        msg['To'] = to_email
        msg['Subject'] = subject
        msg.attach(MIMEText(body, 'plain'))

        server = smtplib.SMTP('smtp.gmail.com', 587)
        server.starttls()
        server.login(GMAIL_USER, GMAIL_PASSWORD)
        server.sendmail(GMAIL_USER, to_email, msg.as_string())
        server.quit()
        print(f"Email sent successfully to {to_email}")
        return True
    except smtplib.SMTPAuthenticationError:
        print("SMTP Authentication Error: Check Gmail username and App Password")
        return False
    except smtplib.SMTPException as e:
        print(f"SMTP Error: {str(e)}")
        return False
    except Exception as e:
        print(f"Failed to send email: {str(e)}")
        return False

def send_verification_email_to_admin(username, user_email):
    encoded_email = quote(user_email)
    body = f"""
    Hello Admin,

    A new user has registered with the following details:

    Username: {username}
    Email: {user_email}

    Please verify or decline the user using the links below:

    Verify: http://{ip}:5005/verify/{encoded_email}
    Decline: http://{ip}:5005/decline/{encoded_email}

    If you did not expect this email, please ignore it.

    Best regards,
    Your App Team
    """
    return send_email(ADMIN_EMAIL, 'New User Registration', body)

def send_verification_status_to_user(to_email, status):
    subject = 'Account Verification Status'
    body = f"""
    Hello,

    Your account verification status has been updated:

    Status: {status.capitalize()}

    {'You can now log in to your account.' if status == 'verified' else 'Your account cannot be used at this time. Please contact support if you believe this is an error.'}

    Best regards,
    Your App Team
    """
    return send_email(to_email, subject, body)