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
            company_result = company_collection.insert_one(company_info)
            company_id = company_result.inserted_id
            admin_info = {
                'email': email,
                'password': password,
                'role': 'admin',
                'company_id': str(company_id),
                'email_verified': True,  
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
            company = company_collection.find_one({'_id': ObjectId(user['company_id'])})
            if company:
                company['_id'] = str(company['_id'])  
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

            return JsonResponse({'status': 'success', 'message': 'OTP verified successfully'})

        except Exception as e:
            return JsonResponse({'status': 'failed', 'message': str(e)})

    return JsonResponse({'status': 'failed', 'message': 'Invalid request method'})


@csrf_exempt
def post_job(request):
    """
    API to post a new job to the MongoDB collection.
    """
    if request.method == "OPTIONS":
        response = JsonResponse({})
        response["Access-Control-Allow-Origin"] = "http://localhost:3000"
        response["Access-Control-Allow-Methods"] = "POST, OPTIONS"
        response["Access-Control-Allow-Headers"] = "Content-Type, X-User-Email, Accept"
        return response

    if request.method == "POST":
        try:
            # Get admin's email from request
            admin_email = request.headers.get('X-User-Email')
            if not admin_email:
                return JsonResponse({"status": "error", "message": "User not authenticated"}, status=401)

            # Get admin and company details
            admin = info_collection.find_one({'email': admin_email, 'role': 'admin'})
            if not admin:
                return JsonResponse({"status": "error", "message": "Admin not found"}, status=404)

            company = company_collection.find_one({'_id': ObjectId(admin['company_id'])})
            if not company:
                return JsonResponse({"status": "error", "message": "Company not found"}, status=404)

            # Parse the request body
            try:
                body = json.loads(request.body.decode("utf-8"))
                print("Received job data:", body)  # Debug print
            except json.JSONDecodeError as e:
                return JsonResponse({"status": "error", "message": f"Invalid JSON: {str(e)}"}, status=400)

            # Validate required fields
            required_fields = ["Job title", "location", "qualification", "job_description", 
                             "required_skills_and_qualifications", "salary_range"]
            missing_fields = [field for field in required_fields if field not in body]
            if missing_fields:
                return JsonResponse({
                    "status": "error",
                    "message": f"Missing required fields: {', '.join(missing_fields)}"
                }, status=400)

            job = {
                "Job title": body.get("Job title"),
                "company": company['name'],
                "company_id": str(company['_id']),
                "location": body.get("location"),
                "qualification": body.get("qualification"),
                "job_description": body.get("job_description"),
                "required_skills_and_qualifications": body.get("required_skills_and_qualifications"),
                "salary_range": body.get("salary_range"),
                "posted_by": admin_email,
                "created_at": datetime.datetime.utcnow()
            }

            # Insert the job into the collection
            result = job_collection.insert_one(job)
            
            response = JsonResponse({
                "status": "success",
                "message": "Job posted successfully!"
            }, status=201)
            response["Access-Control-Allow-Origin"] = "http://localhost:3000"
            return response

        except Exception as e:
            print("Error in post_job:", str(e))  # Debug print
            response = JsonResponse({
                "status": "error",
                "message": f"Server error: {str(e)}"
            }, status=500)
            response["Access-Control-Allow-Origin"] = "http://localhost:3000"
            return response
    else:
        response = JsonResponse({
            "status": "error",
            "message": "Method not allowed"
        }, status=405)
        response["Access-Control-Allow-Origin"] = "http://localhost:3000"
        return response
    

@csrf_exempt
def get_jobs(request):
    """
    API to get all jobs from the MongoDB collection.
    """
    if request.method == "GET":
        try:
            # Get admin's email from request
            admin_email = request.headers.get('X-User-Email')
            if not admin_email:
                return JsonResponse({"status": "error", "message": "User not authenticated"}, status=401)

            # Fetch jobs posted by this admin
            jobs = list(job_collection.find({"posted_by": admin_email}))

            if not jobs:
                return JsonResponse({"status": "success", "message": "No jobs uploaded.", "jobs": []}, status=200)

            # Convert ObjectId to string for each job
            for job in jobs:
                job["_id"] = str(job["_id"])
                job["job_title"] = job.pop("Job title")

            return JsonResponse({"status": "success", "jobs": jobs}, status=200)
        except Exception as e:
            return JsonResponse({"status": "error", "message": str(e)}, status=500)
    else:
        return JsonResponse({"status": "error", "message": "Invalid request method."}, status=405)
    
@csrf_exempt
def fetch_jobs(request):
    """
    API to get all jobs from the MongoDB collection.
    """
    if request.method == "GET":
        try:
            # Fetch all jobs from the collection
            jobs = list(job_collection.find({}))

            if not jobs:
                return JsonResponse({"status": "success", "message": "No jobs uploaded."}, status=200)

            # Convert ObjectId to string for each job
            for job in jobs:
                job["_id"] = str(job["_id"])
                job["job_title"] = job.pop("Job title")

            return JsonResponse({"status": "success", "jobs": jobs}, status=200)
        except Exception as e:
            return JsonResponse({"status": "error", "message": str(e)}, status=500)
    else:
        return JsonResponse({"status": "error", "message": "Invalid request method."}, status=405)
    

@csrf_exempt
def get_company_details(request, company_id):
    """
    API to get company details by company ID
    """
    if request.method == "GET":
        try:
            company = company_collection.find_one({'_id': ObjectId(company_id)})
            if company:
                company['_id'] = str(company['_id'])
                return JsonResponse({
                    'status': 'success',
                    'company': company
                })
            return JsonResponse({
                'status': 'failed',
                'message': 'Company not found'
            })
        except Exception as e:
            return JsonResponse({
                'status': 'error',
                'message': str(e)
            })
    return JsonResponse({
        'status': 'failed',
        'reason': 'Invalid request method'
    })

@csrf_exempt
def update_company_details(request, company_id):
    """
    API to update company details
    """
    if request.method == "PUT":
        try:
            data = json.loads(request.body)
            update_data = {
                'name': data.get('companyName'),
                'description': data.get('companyDescription'),
                'website': data.get('companyWebsite'),
                'address': data.get('companyAddress'),
                'hiring_manager': {
                    'name': data.get('hiringManagerName'),
                    'email': data.get('email'),
                    'phone': data.get('phone')
                },
                'updated_at': datetime.datetime.utcnow()
            }
            
            result = company_collection.update_one(
                {'_id': ObjectId(company_id)},
                {'$set': update_data}
            )
            
            if result.modified_count > 0:
                return JsonResponse({
                    'status': 'success',
                    'message': 'Company details updated successfully'
                })
            return JsonResponse({
                'status': 'failed',
                'message': 'Company not found or no changes made'
            })
        except Exception as e:
            return JsonResponse({
                'status': 'error',
                'message': str(e)
            })
    return JsonResponse({
        'status': 'failed',
        'reason': 'Invalid request method'
    })

@csrf_exempt
def apply_job(request):
    """
    API to submit a job application
    """
    if request.method == "OPTIONS":
        response = JsonResponse({})
        response["Access-Control-Allow-Origin"] = "http://localhost:3000"
        response["Access-Control-Allow-Methods"] = "POST, OPTIONS"
        response["Access-Control-Allow-Headers"] = "Content-Type, X-User-Email, Accept"
        return response

    if request.method == "POST":
        try:
            # Get user's email from request
            user_email = request.headers.get('X-User-Email')
            if not user_email:
                return JsonResponse({"status": "error", "message": "User not authenticated"}, status=401)

            # Get user details
            user = info_collection.find_one({'email': user_email, 'role': 'user'})
            if not user:
                return JsonResponse({"status": "error", "message": "User not found"}, status=404)

            # Parse the request body
            try:
                body = json.loads(request.body.decode("utf-8"))
                print("Received application data:", body)  # Debug print
            except json.JSONDecodeError as e:
                return JsonResponse({"status": "error", "message": f"Invalid JSON: {str(e)}"}, status=400)

            # Validate required fields
            required_fields = ["name", "qualification", "skills", "dateOfBirth", 
                             "location", "experience", "expectedSalary", "job_id", 
                             "company_id", "company_name", "job_title"]
            missing_fields = [field for field in required_fields if field not in body]
            if missing_fields:
                return JsonResponse({
                    "status": "error",
                    "message": f"Missing required fields: {', '.join(missing_fields)}"
                }, status=400)

            # Create application document
            application = {
                "name": body["name"],
                "qualification": body["qualification"],
                "skills": body["skills"],
                "date_of_birth": body["dateOfBirth"],
                "location": body["location"],
                "experience": body["experience"],
                "expected_salary": body["expectedSalary"],
                "job_id": body["job_id"],
                "company_id": body["company_id"],
                "company_name": body["company_name"],
                "job_title": body["job_title"],
                "applicant_email": user_email,
                "status": "pending",
                "applied_date": datetime.datetime.utcnow()
            }

            # Check if user has already applied for this job
            existing_application = job_applications_collection.find_one({
                "job_id": body["job_id"],
                "applicant_email": user_email
            })

            if existing_application:
                return JsonResponse({
                    "status": "error",
                    "message": "You have already applied for this job"
                }, status=400)

            # Insert the application into the collection
            result = job_applications_collection.insert_one(application)
            
            response = JsonResponse({
                "status": "success",
                "message": "Application submitted successfully!"
            }, status=201)
            response["Access-Control-Allow-Origin"] = "http://localhost:3000"
            return response

        except Exception as e:
            print("Error in apply_job:", str(e))  # Debug print
            response = JsonResponse({
                "status": "error",
                "message": f"Server error: {str(e)}"
            }, status=500)
            response["Access-Control-Allow-Origin"] = "http://localhost:3000"
            return response
    else:
        response = JsonResponse({
            "status": "error",
            "message": "Method not allowed"
        }, status=405)
        response["Access-Control-Allow-Origin"] = "http://localhost:3000"
        return response

@csrf_exempt
def user_applications(request):
    """
    API to get all job applications for a user
    """
    if request.method == "GET":
        try:
            # Get user's email from request
            user_email = request.headers.get('X-User-Email')
            if not user_email:
                return JsonResponse({"status": "error", "message": "User not authenticated"}, status=401)

            # Get user details
            user = info_collection.find_one({'email': user_email, 'role': 'user'})
            if not user:
                return JsonResponse({"status": "error", "message": "User not found"}, status=404)

            # Fetch all applications for this user
            applications = list(job_applications_collection.find({"applicant_email": user_email}))

            # Convert ObjectId to string for each application
            for application in applications:
                application["_id"] = str(application["_id"])

            response = JsonResponse({
                "status": "success",
                "applications": applications
            })
            response["Access-Control-Allow-Origin"] = "http://localhost:3000"
            return response

        except Exception as e:
            print("Error in user_applications:", str(e))
            response = JsonResponse({
                "status": "error",
                "message": f"Server error: {str(e)}"
            }, status=500)
            response["Access-Control-Allow-Origin"] = "http://localhost:3000"
            return response
    else:
        response = JsonResponse({
            "status": "error",
            "message": "Method not allowed"
        }, status=405)
        response["Access-Control-Allow-Origin"] = "http://localhost:3000"
        return response

@csrf_exempt
def job_applicants(request, job_id):
    """
    API to get all applicants for a specific job
    """
    if request.method == "GET":
        try:
            # Get admin's email from request
            admin_email = request.headers.get('X-User-Email')
            if not admin_email:
                return JsonResponse({"status": "error", "message": "Admin not authenticated"}, status=401)

            # Verify admin and get their company
            admin = info_collection.find_one({'email': admin_email, 'role': 'admin'})
            if not admin:
                return JsonResponse({"status": "error", "message": "Admin not found"}, status=404)

            # Get the job to verify it belongs to this admin's company
            job = job_collection.find_one({'_id': ObjectId(job_id)})
            if not job or job.get('posted_by') != admin_email:
                return JsonResponse({"status": "error", "message": "Job not found or unauthorized"}, status=404)

            # Fetch all applications for this job
            applications = list(job_applications_collection.find({"job_id": job_id}))

            # Convert ObjectId to string for each application
            for application in applications:
                application["_id"] = str(application["_id"])

            response = JsonResponse({
                "status": "success",
                "applicants": applications
            })
            response["Access-Control-Allow-Origin"] = "http://localhost:3000"
            return response

        except Exception as e:
            print("Error in job_applicants:", str(e))
            response = JsonResponse({
                "status": "error",
                "message": f"Server error: {str(e)}"
            }, status=500)
            response["Access-Control-Allow-Origin"] = "http://localhost:3000"
            return response
    else:
        response = JsonResponse({
            "status": "error",
            "message": "Method not allowed"
        }, status=405)
        response["Access-Control-Allow-Origin"] = "http://localhost:3000"
        return response

@csrf_exempt
def update_application_status(request, application_id):
    """
    API to update the status of a job application
    """
    if request.method == "OPTIONS":
        response = JsonResponse({})
        response["Access-Control-Allow-Origin"] = "http://localhost:3000"
        response["Access-Control-Allow-Methods"] = "PUT, OPTIONS"
        response["Access-Control-Allow-Headers"] = "Content-Type, X-User-Email"
        return response

    if request.method == "PUT":
        try:
            # Get admin's email from request
            admin_email = request.headers.get('X-User-Email')
            if not admin_email:
                return JsonResponse({"status": "error", "message": "Admin not authenticated"}, status=401)

            # Verify admin
            admin = info_collection.find_one({'email': admin_email, 'role': 'admin'})
            if not admin:
                return JsonResponse({"status": "error", "message": "Admin not found"}, status=404)

            # Get the application
            application = job_applications_collection.find_one({'_id': ObjectId(application_id)})
            if not application:
                return JsonResponse({"status": "error", "message": "Application not found"}, status=404)

            # Get the job to verify it belongs to this admin's company
            job = job_collection.find_one({'_id': ObjectId(application['job_id'])})
            if not job or job.get('posted_by') != admin_email:
                return JsonResponse({"status": "error", "message": "Unauthorized"}, status=403)

            # Parse the request body
            body = json.loads(request.body.decode("utf-8"))
            new_status = body.get('status')
            if new_status not in ['accepted', 'rejected', 'pending']:
                return JsonResponse({"status": "error", "message": "Invalid status"}, status=400)

            # Update the application status
            result = job_applications_collection.update_one(
                {'_id': ObjectId(application_id)},
                {'$set': {'status': new_status}}
            )

            if result.modified_count > 0:
                response = JsonResponse({
                    "status": "success",
                    "message": "Application status updated successfully"
                })
            else:
                response = JsonResponse({
                    "status": "error",
                    "message": "Failed to update application status"
                }, status=400)

            response["Access-Control-Allow-Origin"] = "http://localhost:3000"
            return response

        except Exception as e:
            print("Error in update_application_status:", str(e))
            response = JsonResponse({
                "status": "error",
                "message": f"Server error: {str(e)}"
            }, status=500)
            response["Access-Control-Allow-Origin"] = "http://localhost:3000"
            return response
    else:
        response = JsonResponse({
            "status": "error",
            "message": "Method not allowed"
        }, status=405)
        response["Access-Control-Allow-Origin"] = "http://localhost:3000"
        return response 