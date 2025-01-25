import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Button from './ui/button';

const RegisterAdmin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    companyName: '',
    companyDescription: '',
    companyWebsite: '',
    companyAddress: '',
    hiringManagerName: '',
    email: '',
    phone: '',
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
      [e.target.name]: e.target.value,
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
      const response = await axios.post('http://localhost:8000/api/request-admin-email-otp/', {
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
      const response = await axios.post('http://localhost:8000/api/verify-admin-email-otp/', {
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

    if (passwordError) {
      setError('Please fix the password errors before submitting.');
      return;
    }

    if (!emailVerified) {
      setError('Please verify your email first');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      const response = await axios.post('http://localhost:8000/register/admin/', {
        ...formData,
        role: 'admin'
      });

      if (response.data.status === 'success') {
        navigate('/login-admin');
      } else {
        setError(response.data.message || 'Registration failed');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred during registration');
    }
  };

  const styles = {
    container: {
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f9fafb',
      padding: '2rem',
    },
    form: {
      backgroundColor: '#ffffff',
      padding: '2rem',
      borderRadius: '1rem',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      width: '100%',
      maxWidth: '600px',
    },
    title: {
      fontSize: '1.875rem',
      fontWeight: 'bold',
      color: '#1a202c',
      marginBottom: '2rem',
      textAlign: 'center',
    },
    subtitle: {
      fontSize: '1.25rem',
      color: '#4a5568',
      marginBottom: '1.5rem',
      marginTop: '2rem',
      borderBottom: '2px solid #e2e8f0',
      paddingBottom: '0.5rem',
    },
    formGroup: {
      marginBottom: '1.5rem',
    },
    label: {
      display: 'block',
      marginBottom: '0.5rem',
      color: '#4a5568',
      fontSize: '0.875rem',
      fontWeight: '500',
    },
    input: {
      width: '100%',
      padding: '0.75rem',
      borderRadius: '0.5rem',
      border: '1px solid #e2e8f0',
      fontSize: '1rem',
      color: '#1a202c',
      transition: 'border-color 0.2s',
    },
    textarea: {
      width: '100%',
      padding: '0.75rem',
      borderRadius: '0.5rem',
      border: '1px solid #e2e8f0',
      fontSize: '1rem',
      color: '#1a202c',
      transition: 'border-color 0.2s',
      minHeight: '100px',
      resize: 'vertical',
    },
    error: {
      color: '#e53e3e',
      marginTop: '0.5rem',
      fontSize: '0.875rem',
    },
    buttonContainer: {
      marginTop: '2rem',
    },
    verifyButton: {
      padding: '0.75rem',
      borderRadius: '0.5rem',
      border: '1px solid #e2e8f0',
      backgroundColor: '#3182ce',
      color: '#ffffff',
      cursor: 'pointer',
      transition: 'background-color 0.2s',
    },
  };

  return (
    <div style={styles.container}>
      <form style={styles.form} onSubmit={handleSubmit}>
        <h1 style={styles.title}>Company Registration</h1>

        <h2 style={styles.subtitle}>Company Information</h2>
        <div style={styles.formGroup}>
          <label style={styles.label} htmlFor="companyName">Company Name</label>
          <input
            style={styles.input}
            type="text"
            id="companyName"
            name="companyName"
            value={formData.companyName}
            onChange={handleChange}
            required
          />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label} htmlFor="companyDescription">Company Description</label>
          <textarea
            style={styles.textarea}
            id="companyDescription"
            name="companyDescription"
            value={formData.companyDescription}
            onChange={handleChange}
            required
            placeholder="Tell us about your company..."
          />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label} htmlFor="companyWebsite">Company Website</label>
          <input
            style={styles.input}
            type="url"
            id="companyWebsite"
            name="companyWebsite"
            value={formData.companyWebsite}
            onChange={handleChange}
            placeholder="https://example.com"
          />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label} htmlFor="companyAddress">Company Address</label>
          <textarea
            style={styles.textarea}
            id="companyAddress"
            name="companyAddress"
            value={formData.companyAddress}
            onChange={handleChange}
            required
          />
        </div>

        <h2 style={styles.subtitle}>Hiring Manager Information</h2>
        <div style={styles.formGroup}>
          <label style={styles.label} htmlFor="hiringManagerName">Hiring Manager Name</label>
          <input
            style={styles.input}
            type="text"
            id="hiringManagerName"
            name="hiringManagerName"
            value={formData.hiringManagerName}
            onChange={handleChange}
            required
          />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label} htmlFor="email">Email Address</label>
          <div style={{ display: 'flex', gap: '10px' }}>
            <input
              style={{ ...styles.input, flex: 1 }}
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              disabled={emailVerified}
              required
            />
            {!emailVerified && (
              <button
                type="button"
                onClick={handleEmailVerification}
                disabled={isTimerRunning}
                style={styles.verifyButton}
              >
                {isTimerRunning ? formatTime(otpTimer) : 'Verify Email'}
              </button>
            )}
          </div>
          {emailVerified && (
            <p style={{ color: 'green', marginTop: '0.5rem' }}>
              Email verified ✓
            </p>
          )}
        </div>

        {showOtpInput && !emailVerified && (
          <div style={styles.formGroup}>
            <label style={styles.label}>Enter OTP</label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input
                style={{ ...styles.input, flex: 1 }}
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter OTP"
              />
              <button
                type="button"
                onClick={handleVerifyOtp}
                style={styles.verifyButton}
              >
                Verify OTP
              </button>
            </div>
          </div>
        )}

        <div style={styles.formGroup}>
          <label style={styles.label} htmlFor="phone">Phone Number</label>
          <input
            style={styles.input}
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
          />
        </div>

        <h2 style={styles.subtitle}>Account Security</h2>
        <div style={styles.formGroup}>
          <label style={styles.label} htmlFor="password">Password</label>
          <input
            style={styles.input}
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
          {passwordError && <p style={styles.error}>{passwordError}</p>}
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label} htmlFor="confirmPassword">Confirm Password</label>
          <input
            style={styles.input}
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />
        </div>

        {error && <p style={styles.error}>{error}</p>}

        <div style={styles.buttonContainer}>
          <Button type="submit" style={{ width: '100%' }}>
            Register Company
          </Button>
        </div>

        <p style={{ textAlign: 'center', marginTop: '1rem' }}>
          Already have an account?{' '}
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              navigate('/login-admin');
            }}
            style={{ color: '#3182ce', textDecoration: 'none' }}
          >
            Login here
          </a>
        </p>
      </form>
    </div>
  );
};

export default RegisterAdmin;