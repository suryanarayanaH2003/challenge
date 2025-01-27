from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.csrf import csrf_exempt
from pymongo import MongoClient
import random
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
import logging
import json
import datetime
from django.http import JsonResponse
from bson import ObjectId

client = MongoClient('mongodb+srv://suryanarayanan110803:9894153716@cluster0.shd6d.mongodb.net/')
db = client['job-portal']
info_collection = db['info']
otp_collection = db['otp']
job_collection = db['jobs']
company_collection = db['companies']
job_applications_collection = db['job_applications']

def generate_otp():
    return random.randint(100000, 999999)

def send_otp_email(receiver_email, otp):
    smtp_server = "smtp.gmail.com"
    port = 587
    username = "suryanarayanan.cloud.mfedu@gmail.com"  # Replace with your Gmail address
    password = "nqot vkgg fizc vven"  # Replace with your App Password

    subject = "Your OTP Verification Code"
    body = f"""
    <html>
      <body>
        <p>Your OTP verification code is {otp}.</p>
      </body>
    </html>
    """

    msg = MIMEMultipart()
    msg["From"] = username
    msg["To"] = receiver_email
    msg["Subject"] = subject
    msg.attach(MIMEText(body, "html"))

    try:
        with smtplib.SMTP(smtp_server, port) as server:
            server.starttls()
            server.login(username, password)
            server.sendmail(username, receiver_email, msg.as_string())
        return True
    except Exception as e:
        print(f"Error sending email: {e}")
        return False

@csrf_exempt
def send_otp_email_view(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        email = data.get('email')
        if email:
            otp = generate_otp()
            if send_otp_email(email, otp):
                otp_collection.update_one(
                    {'email': email},
                    {'$set': {'otp': otp, 'otp_expires_at': datetime.datetime.utcnow() + datetime.timedelta(minutes=10)}},
                    upsert=True
                )
                return JsonResponse({'status': 'success', 'message': 'OTP sent successfully'})
            else:
                return JsonResponse({'status': 'error', 'message': 'Failed to send OTP email'})
        else:
            return JsonResponse({'status': 'error', 'message': 'Email is required'})
    return JsonResponse({'status': 'error', 'message': 'Invalid request method'})

@csrf_exempt
def verify_otp_view(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        email = data.get('email')
        otp = data.get('otp')

        if email and otp:
            otp_record = otp_collection.find_one({'email': email})
            if otp_record and otp_record.get('otp') == int(otp):
                if otp_record.get('otp_expires_at') > datetime.datetime.utcnow():
                    return JsonResponse({'status': 'success', 'message': 'OTP verified successfully'})
                else:
                    return JsonResponse({'status': 'error', 'message': 'OTP has expired'})
            else:
                return JsonResponse({'status': 'error', 'message': 'Invalid OTP'})
        else:
            return JsonResponse({'status': 'error', 'message': 'Email and OTP are required'})
    return JsonResponse({'status': 'error', 'message': 'Invalid request method'})

@csrf_exempt
def register_admin(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        
        # Company Information
        company_info = {
            'name': data.get('companyName'),
            'description': data.get('companyDescription'),
            'website': data.get('companyWebsite'),
            'address': data.get('companyAddress'),
            'hiring_manager': {
                'name': data.get('hiringManagerName'),
                'email': data.get('email'),
                'phone': data.get('phone')
            },
            'created_at': datetime.datetime.utcnow()
        }
        
        email = data.get('email')
        password = data.get('password')

        # Check if email already exists
        existing_user = info_collection.find_one({'email': email})
        if existing_user:
            return JsonResponse({'status': 'failed', 'message': 'Email already registered'})

        # First, insert the company details
        company_result = company_collection.insert_one(company_info)
        company_id = company_result.inserted_id

        # Then, create the admin user with reference to company
        admin_info = {
            'email': email,
            'password': password,
            'role': 'admin',
            'company_id': str(company_id),  # Store reference to company
            'created_at': datetime.datetime.utcnow()
        }
        
        info_collection.insert_one(admin_info)
        return JsonResponse({'status': 'success'})

    return JsonResponse({'status': 'failed', 'reason': 'Invalid request method'})


@csrf_exempt
def register_user(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        name = data.get('name')
        email = data.get('email')
        mobile = data.get('mobile')
        password = data.get('password')
        role = data.get('role', 'user')

        # Check if email already exists
        existing_user = info_collection.find_one({'email': email})
        if existing_user:
            return JsonResponse({'status': 'failed', 'message': 'Email already registered'})

        # Insert new user
        info_collection.insert_one({
            'name': name,
            'email': email,
            'mobile': mobile,
            'password': password,
            'role': role
        })
        return JsonResponse({'status': 'success'})

    return JsonResponse({'status': 'failed', 'reason': 'Invalid request method'})


@csrf_exempt
def verify_user_otp(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        email = data.get('email')
        otp = data.get('otp')

        
        user = info_collection.find_one({'email': email, 'otp': otp})
        if user:
           
            info_collection.update_one({'email': email}, {'$set': {'verified': True, 'otp': None}})
            return JsonResponse({'status': 'success', 'message': 'Email verified successfully.'})
        else:
            return JsonResponse({'status': 'failed', 'message': 'Invalid OTP or user not found'})

    return JsonResponse({'status': 'failed', 'reason': 'Invalid request method'})

@csrf_exempt
def login_admin(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        email = data.get('email')
        password = data.get('password')
        user = info_collection.find_one({
            'email': email, 
            'password': password, 
            'role': 'admin'
        })
        if user:
            # Get company details
            company = company_collection.find_one({'_id': ObjectId(user['company_id'])})
            if company:
                company['_id'] = str(company['_id'])  # Convert ObjectId to string
                return JsonResponse({
                    'status': 'success',
                    'user': {
                        'email': user.get('email'),
                        'role': user.get('role'),
                        'company': company
                    }
                })
        return JsonResponse({'status': 'failed', 'reason': 'Invalid credentials'})

    return JsonResponse({'status': 'failed', 'reason': 'Invalid request method'})

@csrf_exempt
def login_user(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        email = data.get('email')
        password = data.get('password')
        user = info_collection.find_one({
            'email': email, 
            'password': password, 
            'role': 'user'
        })
        if user:
            return JsonResponse({
                'status': 'success',
                'user': {
                    'name': user.get('name'),
                    'email': user.get('email'),
                    'role': user.get('role')
                }
            })
        return JsonResponse({'status': 'failed', 'reason': 'Invalid credentials'})

    return JsonResponse({'status': 'failed', 'reason': 'Invalid request method'})


