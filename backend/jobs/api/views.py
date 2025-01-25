from django.shortcuts import render
import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from bson.objectid import ObjectId
import datetime
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import random
import string


from pymongo import MongoClient
client = MongoClient('mongodb+srv://suryanarayanan110803:9894153716@cluster0.shd6d.mongodb.net/')
db = client['job-portal']
info_collection = db['info']
job_collection = db['jobs']
company_collection = db['companies']  
job_applications_collection = db['job_applications']


SENDER_EMAIL = "kandaring2k24@gmail.com"
APP_PASSWORD = "rqdfvijjlywvcxyp"

email_otp_store = {}

def generate_otp():
    return ''.join(random.choices(string.digits, k=6))

def send_otp_email(email, otp):
    try:
        msg = MIMEMultipart()
        msg['From'] = SENDER_EMAIL
        msg['To'] = email
        msg['Subject'] = 'Email Verification OTP'
        
        body = f'''
        Your OTP for email verification is: {otp}
        
        This OTP will expire in 5 minutes.
        If you didn't request this OTP, please ignore this email.
        '''
        msg.attach(MIMEText(body, 'plain'))
        
        server = smtplib.SMTP('smtp.gmail.com', 587)
        server.starttls()
        server.login(SENDER_EMAIL, APP_PASSWORD)
        server.send_message(msg)
        server.quit()
        return True
    except Exception as e:
        print(f"Error sending email: {str(e)}")
        return False

@csrf_exempt
def request_admin_email_otp(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            email = data.get('email')
            
            if not email:
                return JsonResponse({'status': 'failed', 'message': 'Email is required'})
            
            # Check if email already exists
            existing_user = info_collection.find_one({'email': email})
            if existing_user:
                return JsonResponse({'status': 'failed', 'message': 'Email already registered'})
            
            otp = generate_otp()
            if send_otp_email(email, otp):
                email_otp_store[email] = {
                    'otp': otp,
                    'timestamp': datetime.datetime.utcnow(),
                    'attempts': 0
                }
                return JsonResponse({'status': 'success', 'message': 'OTP sent successfully'})
            return JsonResponse({'status': 'failed', 'message': 'Failed to send OTP'})
            
        except Exception as e:
            return JsonResponse({'status': 'failed', 'message': str(e)})
    
    return JsonResponse({'status': 'failed', 'message': 'Invalid request method'})

@csrf_exempt
def verify_admin_email_otp(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            email = data.get('email')
            otp = data.get('otp')
            
            stored_data = email_otp_store.get(email)
            if not stored_data:
                return JsonResponse({'status': 'failed', 'message': 'No OTP found for this email'})
            
            if datetime.datetime.utcnow() - stored_data['timestamp'] > datetime.timedelta(minutes=5):
                del email_otp_store[email]
                return JsonResponse({'status': 'failed', 'message': 'OTP expired'})
            
            if stored_data['attempts'] >= 3:
                del email_otp_store[email]
                return JsonResponse({'status': 'failed', 'message': 'Too many attempts'})
            
            if stored_data['otp'] == otp:
                del email_otp_store[email]
                return JsonResponse({'status': 'success', 'message': 'Email verified successfully'})
            
            stored_data['attempts'] += 1
            return JsonResponse({'status': 'failed', 'message': 'Invalid OTP'})
            
        except Exception as e:
            return JsonResponse({'status': 'failed', 'message': str(e)})
    
    return JsonResponse({'status': 'failed', 'message': 'Invalid request method'})

@csrf_exempt
def register_admin(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            email = data.get('email')
            
            if not email:
                return JsonResponse({'status': 'failed', 'message': 'Email is required'})

            # Check if email already exists
            existing_user = info_collection.find_one({'email': email})
            if existing_user:
                return JsonResponse({'status': 'failed', 'message': 'Email already registered'})
            
            company_info = {
                'name': data.get('companyName'),
                'description': data.get('companyDescription'),
                'website': data.get('companyWebsite'),
                'address': data.get('companyAddress'),
                'hiring_manager': {
                    'name': data.get('hiringManagerName'),
                    'email': email,
                    'phone': data.get('phone')
                },
                'created_at': datetime.datetime.utcnow()
            }
            
            password = data.get('password')

            # Insert company details
            company_result = company_collection.insert_one(company_info)
            company_id = company_result.inserted_id

            # Insert admin info with email_verified flag
            admin_info = {
                'email': email,
                'password': password,
                'role': 'admin',
                'company_id': str(company_id),
                'email_verified': True,  # Since we verify before registration
                'created_at': datetime.datetime.utcnow()
            }
            
            info_collection.insert_one(admin_info)
            return JsonResponse({'status': 'success'})
            
        except Exception as e:
            return JsonResponse({'status': 'failed', 'message': str(e)})

    return JsonResponse({'status': 'failed', 'message': 'Invalid request method'})

@csrf_exempt
def register_user(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        name = data.get('name')
        email = data.get('email')
        mobile = data.get('mobile')
        password = data.get('password')
        role = data.get('role', 'user')

        existing_user = info_collection.find_one({'email': email})
        if existing_user:
            return JsonResponse({'status': 'failed', 'message': 'Email already registered'})

        info_collection.insert_one({
            'name': name,
            'email': email,
            'mobile': mobile,
            'password': password,
            'role': role,
            'email_verified': True  
        })
        return JsonResponse({'status': 'success'})

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



    
@csrf_exempt
def user(request):
    user_type = request.session.get('user_type')
    print('user', user_type)
    if user_type == 'user':
        if request.method == 'GET':
            text_id = request.GET.get('text_id') 
            text = job_collection.find_one({'_id': ObjectId(text_id)})
            if text:
                text['_id'] = str(text['_id'])  
                return JsonResponse({'status': 'success', 'text': text})
            return JsonResponse({'status': 'failed', 'reason': 'Text not found'})
        return JsonResponse({'status': 'failed', 'reason': 'Invalid request method'})


@csrf_exempt
def request_email_otp(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            email = data.get('email')
            
            if not email:
                return JsonResponse({'status': 'failed', 'message': 'Email is required'})
            
            # Check if email already exists
            existing_user = info_collection.find_one({'email': email})
            if existing_user:
                return JsonResponse({'status': 'failed', 'message': 'Email already registered'})
            
            otp = generate_otp()
            if send_otp_email(email, otp):
                email_otp_store[email] = {
                    'otp': otp,
                    'timestamp': datetime.datetime.utcnow(),
                    'attempts': 0
                }
                return JsonResponse({'status': 'success', 'message': 'OTP sent successfully'})
            return JsonResponse({'status': 'failed', 'message': 'Failed to send OTP'})
            
        except Exception as e:
            return JsonResponse({'status': 'failed', 'message': str(e)})
    
    return JsonResponse({'status': 'failed', 'message': 'Invalid request method'})

@csrf_exempt
def verify_email_otp(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            email = data.get('email')
            otp = data.get('otp')
            
            stored_data = email_otp_store.get(email)
            if not stored_data:
                return JsonResponse({'status': 'failed', 'message': 'No OTP found for this email'})
            
            if datetime.datetime.utcnow() - stored_data['timestamp'] > datetime.timedelta(minutes=5):
                del email_otp_store[email]
                return JsonResponse({'status': 'failed', 'message': 'OTP expired'})
            
            if stored_data['attempts'] >= 3:
                del email_otp_store[email]
                return JsonResponse({'status': 'failed', 'message': 'Too many attempts'})
            
            if stored_data['otp'] == otp:
                del email_otp_store[email]
                return JsonResponse({'status': 'success', 'message': 'Email verified successfully'})
            
            stored_data['attempts'] += 1
            return JsonResponse({'status': 'failed', 'message': 'Invalid OTP'})
            
        except Exception as e:
            return JsonResponse({'status': 'failed', 'message': str(e)})
    
    return JsonResponse({'status': 'failed', 'message': 'Invalid request method'})

def Home(request):
    return render(request, 'home.html')

@csrf_exempt
def forgot_password_request_otp(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            email = data.get('email')
            
            if not email:
                return JsonResponse({'status': 'failed', 'message': 'Email is required'})
            
            # Check if email exists
            user = info_collection.find_one({'email': email})
            if not user:
                return JsonResponse({'status': 'failed', 'message': 'Email not found'})
            
            otp = generate_otp()
            if send_otp_email(email, otp):
                email_otp_store[email] = {
                    'otp': otp,
                    'timestamp': datetime.datetime.utcnow(),
                    'attempts': 0
                }
                return JsonResponse({'status': 'success', 'message': 'OTP sent successfully'})
            return JsonResponse({'status': 'failed', 'message': 'Failed to send OTP'})
            
        except Exception as e:
            return JsonResponse({'status': 'failed', 'message': str(e)})
    
    return JsonResponse({'status': 'failed', 'message': 'Invalid request method'})

@csrf_exempt
def reset_password(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            email = data.get('email')
            new_password = data.get('password')
            
            if not email or not new_password:
                return JsonResponse({'status': 'failed', 'message': 'Email and password are required'})
            
            # Update password in database
            result = info_collection.update_one(
                {'email': email},
                {'$set': {'password': new_password}}
            )
            
            if result.modified_count > 0:
                return JsonResponse({'status': 'success', 'message': 'Password updated successfully'})
            return JsonResponse({'status': 'failed', 'message': 'Failed to update password'})
            
        except Exception as e:
            return JsonResponse({'status': 'failed', 'message': str(e)})
    
    return JsonResponse({'status': 'failed', 'message': 'Invalid request method'})

@csrf_exempt
def verify_otp(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            email = data.get('email')
            otp = data.get('otp')

            stored_data = email_otp_store.get(email)
            if not stored_data:
                return JsonResponse({'status': 'failed', 'message': 'No OTP found for this email'})

            if datetime.datetime.utcnow() - stored_data['timestamp'] > datetime.timedelta(minutes=5):
                del email_otp_store[email]
                return JsonResponse({'status': 'failed', 'message': 'OTP expired'})

            if stored_data['otp'] != otp:
                stored_data['attempts'] += 1
                if stored_data['attempts'] >= 3:
                    del email_otp_store[email]
                    return JsonResponse({'status': 'failed', 'message': 'Too many attempts, OTP expired'})
                return JsonResponse({'status': 'failed', 'message': 'Invalid OTP'})

            # OTP is valid, proceed with the next steps
            return JsonResponse({'status': 'success', 'message': 'OTP verified successfully'})

        except Exception as e:
            return JsonResponse({'status': 'failed', 'message': str(e)})

    return JsonResponse({'status': 'failed', 'message': 'Invalid request method'})
