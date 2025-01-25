from django.contrib import admin
from django.urls import path
from .views import *

urlpatterns = [
    path('register/admin/', register_admin, name='register_admin'),
    path('register/user/', register_user, name='register_user'),
    path('login/admin/', login_admin, name='login_admin'),
    path('login/user/', login_user, name='login_user'),
     path('api/request-email-otp/', request_email_otp, name='request-email-otp'),
    path('api/verify-email-otp/', verify_email_otp, name='verify-email-otp'),
    path('register/user/', register_user, name='register-user'),
    path('home/', Home, name='home'),
    path('api/request-admin-email-otp/', request_admin_email_otp, name='request-admin-email-otp'),
    path('api/verify-admin-email-otp/', verify_admin_email_otp, name='verify-admin-email-otp'),
    path('register/admin/', register_admin, name='register-admin'),
    path('api/forgot-password/request-otp/', forgot_password_request_otp, name='forgot-password-request-otp'),
    path('api/forgot-password/verify-otp/', verify_otp, name='verify-otp'),  # Ensure this line is present
    path('api/reset-password/', reset_password, name='reset-password'),

]


