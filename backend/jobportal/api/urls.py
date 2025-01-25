from django.contrib import admin
from django.urls import path
from .views import *

urlpatterns = [
    path('register/admin/', register_admin, name='register_admin'),
    path('register/user/', register_user, name='register_user'),
    path('login/admin/', login_admin, name='login_admin'),
    path('login/user/', login_user, name='login_user'),
]

