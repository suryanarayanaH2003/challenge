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
    path("postjobs/", post_job, name="post_job"),
    path('jobs/', get_jobs, name='get_jobs'),
    path('fetchjobs/', fetch_jobs, name='fetch_jobs'),
    path('company/<str:company_id>/', get_company_details, name='get_company_details'),
    path('company/<str:company_id>/update/', update_company_details, name='update_company_details'),
    path('apply-job/', apply_job, name='apply_job'),
    path('guest-dashboard/', guest_dashboard, name='guest_dashboard'),
    path('user-profile/', user_profile, name='user_applications'),
    path('job-applicants/<str:job_id>/', job_applicants, name='job_applicants'),
    path('update-application-status/<str:application_id>/', update_application_status, name='update_application_status'),
    path('logout/', logout_view, name='logout'),  # Add the logout URL

]


