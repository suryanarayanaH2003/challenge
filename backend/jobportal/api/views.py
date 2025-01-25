from django.shortcuts import render
import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from bson.objectid import ObjectId
import datetime


from pymongo import MongoClient
client = MongoClient('mongodb+srv://suryanarayanan110803:9894153716@cluster0.shd6d.mongodb.net/')
db = client['job-portal']
info_collection = db['info']
job_collection = db['jobs']
company_collection = db['companies']  
job_applications_collection = db['job_applications']

@csrf_exempt
def register_admin(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        
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

        existing_user = info_collection.find_one({'email': email})
        if existing_user:
            return JsonResponse({'status': 'failed', 'message': 'Email already registered'})

        company_result = company_collection.insert_one(company_info)
        company_id = company_result.inserted_id

        admin_info = {
            'email': email,
            'password': password,
            'role': 'admin',
            'company_id': str(company_id), 
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

        existing_user = info_collection.find_one({'email': email})
        if existing_user:
            return JsonResponse({'status': 'failed', 'message': 'Email already registered'})

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



