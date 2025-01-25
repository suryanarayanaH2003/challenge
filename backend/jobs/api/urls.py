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
]


