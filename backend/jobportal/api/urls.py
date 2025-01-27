from django.contrib import admin
from django.urls import path
from .views import *

urlpatterns = [
    path('register/admin/', register_admin, name='register_admin'),
    path('register/user/', register_user, name='register_user'),
    path('login/admin/', login_admin, name='login_admin'),
    path('login/user/', login_user, name='login_user'),
    # path('verfiy_admin_otps/', verify_admin_otp, name='verify_admin_otp'),
    path('send_email/', send_otp_email, name='send_email'),
    path('send_otp_email/', send_otp_email_view, name='send_otp_email'),
    path('verify_user_otps/', verify_otp_view, name='verify_user_otps'),
]


