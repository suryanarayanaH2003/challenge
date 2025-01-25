import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const RegisterUser = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    password: '',
    confirmPassword: ''
  });

  const [error, setError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [otp, setOtp] = useState('');
  const [emailVerified, setEmailVerified] = useState(false);
  const [otpTimer, setOtpTimer] = useState(300);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  useEffect(() => {
    let interval;
    if (isTimerRunning && otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((prev) => prev - 1);
      }, 1000);
    } else if (otpTimer === 0) {
      setIsTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, otpTimer]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (e.target.name === 'password') {
      validatePassword(e.target.value);
    }
  };

  const validatePassword = (password) => {
    const lowercaseCount = (password.match(/[a-z]/g) || []).length;
    const numberCount = (password.match(/[0-9]/g) || []).length;
    const specialCharacterCount = (password.match(/[@$!%*?&]/g) || []).length;

    let errorMessage = '';
    if (lowercaseCount < 3) {
      errorMessage += 'Password must have at least 3 lowercase letters. ';
    }
    if (numberCount < 3) {
      errorMessage += 'Password must have at least 3 numbers. ';
    }
    if (specialCharacterCount < 1) {
      errorMessage += 'Password must have at least 1 special character. ';
    }
    if (password.length < 7) {
      errorMessage += 'Password must be at least 7 characters long. ';
    }

    setPasswordError(errorMessage.trim());
  };

  const handleEmailVerification = async () => {
    if (!formData.email) {
      setError('Please enter an email address');
      return;
    }
    try {
      const response = await axios.post('http://localhost:8000/api/request-email-otp/', {
        email: formData.email
      });

      if (response.data.status === 'success') {
        setShowOtpInput(true);
        setOtpTimer(300);
        setIsTimerRunning(true);
        setError('');
      } else {
        setError(response.data.message || 'Failed to send OTP');
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to send OTP');
    }
  };

  const handleVerifyOtp = async () => {
    try {
      const response = await axios.post('http://localhost:8000/api/verify-email-otp/', {
        email: formData.email,
        otp: otp
      });

      if (response.data.status === 'success') {
        setEmailVerified(true);
        setShowOtpInput(false);
        setError('');
      } else {
        setError(response.data.message || 'Invalid OTP');
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to verify OTP');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!emailVerified) {
      setError('Please verify your email first');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (passwordError) {
      setError('Please fix the password errors before submitting.');
      return;
    }

    try {
      const response = await axios.post('http://localhost:8000/register/user/', {
        name: formData.name,
        email: formData.email,
        mobile: formData.mobile,
        password: formData.password,
        role: 'user'
      });

      if (response.data.status === 'success') {
        navigate('/login');
      } else {
        setError(response.data.message || 'Registration failed');
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="register-container">
      <style>
        {`
          .register-container {
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            background-color: #f7fafc; /* Light gray background */
            padding: 20px;
          }

          .form-title {
            margin-bottom: 20px;
          }

          .form-title h2 {
            font-size: 2rem;
            font-weight: bold;
            color: #333; /* Darker text color */
          }

          .form-wrapper {
            background-color: white; /* White background for forms */
            padding: 20px;
            border-radius: 8px; /* Rounded corners */
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1); /* Subtle shadow */
            width: 100%;
            max-width: 400px; /* Max width for form */
          }

          .register-form {
            display: flex;
            flex-direction: column;
          }

          .form-group {
            margin-bottom: 15px; /* Space between fields */
          }

          .form-input {
            padding: 12px;
            border: 1px solid #ccc;
            border-radius: 4px;
            width: 100%; /* Full width */
            transition: border-color 0.3s; /* Smooth transition for focus */
          }

          .form-input:focus {
            border-color: #007bff; /* Blue border on focus */
            outline: none; /* Remove default outline */
          }

          .input-group {
            display: flex;
            align-items: center;
          }

          .verify-button {
            padding: 12px;
            background-color: #007bff; /* Primary button color */
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            transition: background-color 0.3s; /* Smooth transition for hover */
            margin-left: 10px; /* Space between input and button */
          }

          .verify-button:hover {
            background-color: #0056b3; /* Darker blue on hover */
          }

          .submit-button {
            padding: 12px;
            background-color: #007bff; /* Primary button color */
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            transition: background-color 0.3s; /* Smooth transition for hover */
          }

          .submit-button:hover {
            background-color: #0056b3; /* Darker blue on hover */
          }

          .error-message {
            color: red; /* Red color for error messages */
            font-size: 0.875rem; /* Smaller font size */
            margin-bottom: 10px; /* Space below error message */
          }

          .verified-message {
            color: green; /* Green color for verified message */
            font-size: 0.875rem; /* Smaller font size */
          }

          .login-link {
            margin-top: 20px;
            text-align: center;
          }

          .link {
            color: #007bff; /* Link color */
            text-decoration: none; /* Remove underline */
          }

          .link:hover {
            text-decoration: underline; /* Underline on hover */
          }
        `}
      </style>

      <div className="form-title">
        <h2>Register User Account</h2>
      </div>

      <div className="form-wrapper">
        {error && (
          <div className="error-message">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="register-form">
          <div className="form-group">
            <label>Name</label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <div className="input-group">
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                disabled={emailVerified}
                className="form-input"
              />
              {!emailVerified && (
                <button
                  type="button"
                  onClick={handleEmailVerification}
                  disabled={isTimerRunning}
                  className="verify-button"
                >
                  {isTimerRunning ? formatTime(otpTimer) : 'Verify'}
                </button>
              )}
            </div>
            {emailVerified && (
              <span className="verified-message">Email verified ✓</span>
            )}
          </div>

          {showOtpInput && !emailVerified && (
            <div className="form-group">
              <label>Enter OTP</label>
              <div className="input-group">
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="form-input"
                />
                <button
                  type="button"
                  onClick={handleVerifyOtp}
                  className="verify-button"
                >
                  Verify OTP
                </button>
              </div>
            </div>
          )}

          <div className="form-group">
            <label>Mobile</label>
            <input
              type="tel"
              name="mobile"
              required
              value={formData.mobile}
              onChange={handleChange}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              required
              value={formData.password}
              onChange={handleChange}
              className="form-input"
            />
            {passwordError && <p style={{ color: 'red' }}>{passwordError}</p>}
          </div>

          <div className="form-group">
            <label>Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              required
              value={formData.confirmPassword}
              onChange={handleChange}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <button
              type="submit"
              className="submit-button"
            >
              Register
            </button>
          </div>
        </form>

        <div className="login-link">
          <span>Already have an account? </span>
          <Link to="/login" className="link">Login</Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterUser;