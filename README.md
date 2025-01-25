# Django and React Integration Project - Job Portal

## Table of Contents
- [Introduction](#introduction)
- [Technologies Used](#technologies-used)
- [Setup Instructions](#setup-instructions)
  - [Backend Setup (Django)](#backend-setup-django)
  - [Frontend Setup (React)](#frontend-setup-react)
- [Running the Application](#running-the-application)
- [Project Structure](#project-structure)
- [API Endpoints](#api-endpoints)
- [Common Issues and Troubleshooting](#common-issues-and-troubleshooting)

---

## Introduction
This project integrates a Django backend with a React frontend to create a full-stack job portal application. The Django backend handles user authentication, job postings, and database management, while the React frontend provides a user-friendly interface for both admins and users.

---

## Technologies Used
- **Backend**: Django, Django REST Framework, MongoDB (via `pymongo`)
- **Frontend**: React, React Router DOM, Axios, Tailwind CSS (optional for styling)
- **Database**: MongoDB
- **Others**: Node.js, npm/yarn, Python

---

## Setup Instructions

### Backend Setup (Django)
1. **Clone the Repository:**
   ```bash
   git clone <repository_url>
   cd <repository_folder>/backend
   ```

2. **Create and Activate Virtual Environment:**
   ```bash
   python -m venv env
   source env/bin/activate  # On Windows: env\Scripts\activate
   ```

3. **Install Dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Setup MongoDB:**
   Ensure MongoDB is running locally or use a hosted MongoDB instance. Update the MongoDB connection string in the Django views:
   ```python
   client = MongoClient('mongodb://localhost:27017/')
   ```

5. **Run the Development Server:**
   ```bash
   python manage.py runserver
   ```

6. **Setup CORS:**
   Ensure `django-cors-headers` is installed and configured in `settings.py` to allow requests from the React frontend:
   ```python
   INSTALLED_APPS += ['corsheaders']
   MIDDLEWARE.insert(0, 'corsheaders.middleware.CorsMiddleware')
   CORS_ALLOWED_ORIGINS = ['http://localhost:3000']
   ```

---

### Frontend Setup (React)
1. **Navigate to the Frontend Directory:**
   ```bash
   cd ../frontend
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   ```

3. **Start the React Development Server:**
   ```bash
   npm start
   ```

---

## Running the Application
1. **Start the Django Backend:**
   ```bash
   python manage.py runserver
   ```
2. **Start the React Frontend:**
   ```bash
   npm start
   ```
3. **Access the Application:**
   - Django API: `http://localhost:8000`
   - React Frontend: `http://localhost:3000`

---

## Project Structure

### Backend (Django)
```
backend/
|-- manage.py
|-- db.sqlite3
|-- myapp/
    |-- migrations/
    |-- __init__.py
    |-- admin.py
    |-- apps.py
    |-- models.py
    |-- views.py
    |-- urls.py
```

### Frontend (React)
```
frontend/
|-- public/
|   |-- index.html
|-- src/
    |-- components/
        |-- registerAdmin.js
        |-- registerUser.js
        |-- loginAdmin.js
        |-- loginUser.js
        |-- user.js
    |-- App.js
    |-- index.js
```

---

## API Endpoints

### Registration Endpoints
- **Register Admin:** `POST /register/admin/`
  - Payload:
    ```json
    {
      "username": "<admin_username>",
      "password": "<admin_password>"
    }
    ```

- **Register User:** `POST /register/user/`
  - Payload:
    ```json
    {
      "username": "<user_username>",
      "password": "<user_password>"
    }
    ```

### Login Endpoints
- **Login Admin:** `POST /login/admin/`
  - Payload:
    ```json
    {
      "username": "<admin_username>",
      "password": "<admin_password>"
    }
    ```

- **Login User:** `POST /login/user/`
  - Payload:
    ```json
    {
      "username": "<user_username>",
      "password": "<user_password>"
    }
    ```

### Job and Text Retrieval
- **Admin Home (Upload Jobs):** `POST /home/`
  - Payload: Form data for job details

- **Retrieve User Text:** `GET /user/<text_id>/`
  - Query Parameter: `text_id` (MongoDB ObjectId of the text to retrieve)

---

## Common Issues and Troubleshooting

### 1. CORS Errors
- Ensure `CORS_ALLOWED_ORIGINS` in Django settings is configured properly to allow frontend requests.

### 2. MongoDB Connection Issues
- Verify that MongoDB is running on `localhost:27017` or update the connection string to match your setup.

### 3. React Routing Issues
- Ensure React Router is properly set up and paths match backend endpoints.

### 4. Module Not Found Errors
- For backend:
  ```bash
  pip install <missing_package>
  ```
  For frontend:
  ```bash
  npm install <missing_package>
  ```

---

This README provides the setup and usage instructions for the job portal project. Let me know if additional information is required.