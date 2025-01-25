import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const ForgotPassword = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [showOtpInput, setShowOtpInput] = useState(false);
    const [showPasswordInput, setShowPasswordInput] = useState(false);
    const [otpTimer, setOtpTimer] = useState(300);
    const [isTimerRunning, setIsTimerRunning] = useState(false);
    const [passwordError, setPasswordError] = useState('');

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

    const handleSendOtp = async () => {
        try {
            const response = await axios.post('http://localhost:8000/api/forgot-password/request-otp/', {
                email: email
            });

            if (response.data.status === 'success') {
                setShowOtpInput(true);
                setOtpTimer(300);
                setIsTimerRunning(true);
                setMessage('OTP sent successfully');
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
            const response = await axios.post('http://localhost:8000/api/forgot-password/verify-otp/', {
                email: email,
                otp: otp
            });

            if (response.data.status === 'success') {
                setShowPasswordInput(true);
                setShowOtpInput(false);
                setMessage('OTP verified successfully');
                setError('');
            } else {
                setError(response.data.message || 'Invalid OTP');
            }
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to verify OTP');
        }
    };

    const handleResetPassword = async () => {
        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        validatePassword(newPassword);

        if (passwordError) {
            setError('Please fix the password errors before submitting.');
            return;
        }

        try {
            const response = await axios.post('http://localhost:8000/api/reset-password/', {
                email: email,
                password: newPassword
            });

            if (response.data.status === 'success') {
                setMessage('Password updated successfully');
                navigate('/login');
            } else {
                setError(response.data.message || 'Failed to reset password');
            }
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to reset password');
        }
    };

    return (
        <div className="forgot-password-container">
            <style>
                {`
          .forgot-password-container {
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            background-color: #f7fafc;
            padding: 20px;
          }

          .form-wrapper {
            background-color: white;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
            width: 100%;
            max-width: 400px;
          }

          .title {
            font-size: 1.5rem;
            font-weight: bold;
            color: #333;
            margin-bottom: 20px;
            text-align: center;
          }

          .form-group {
            margin-bottom: 15px;
          }

          .form-group label {
            display: block;
            margin-bottom: 5px;
            color: #4a5568;
          }

          .form-input {
            width: 100%;
            padding: 12px;
            border: 1px solid #e2e8f0;
            border-radius: 4px;
            transition: border-color 0.3s;
          }

          .form-input:focus {
            border-color: #4299e1;
            outline: none;
          }

          .button {
            width: 100%;
            padding: 12px;
            background-color: #4299e1;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            transition: background-color 0.3s;
          }

          .button:hover {
            background-color: #3182ce;
          }

          .button:disabled {
            background-color: #a0aec0;
            cursor: not-allowed;
          }

          .error-message {
            color: #e53e3e;
            font-size: 0.875rem;
            margin-bottom: 10px;
          }

          .success-message {
            color: #38a169;
            font-size: 0.875rem;
            margin-bottom: 10px;
          }

          .timer {
            color: #4a5568;
            font-size: 0.875rem;
            margin-top: 5px;
          }
        `}
            </style>

            <div className="form-wrapper">
                <h2 className="title">Reset Password</h2>

                {error && <div className="error-message">{error}</div>}
                {message && <div className="success-message">{message}</div>}

                <div className="form-group">
                    <label>Email Address</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="form-input"
                        placeholder="Enter your email"
                        disabled={showOtpInput || showPasswordInput}
                    />
                    {!showOtpInput && !showPasswordInput && (
                        <button
                            onClick={handleSendOtp}
                            className="button"
                            disabled={!email || isTimerRunning}
                        >
                            {isTimerRunning ? `Resend OTP in ${formatTime(otpTimer)}` : 'Send OTP'}
                        </button>
                    )}
                </div>

                {showOtpInput && (
                    <div className="form-group">
                        <label>Enter OTP</label>
                        <input
                            type="text"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            className="form-input"
                            placeholder="Enter OTP"
                        />
                        <button onClick={handleVerifyOtp} className="button">
                            Verify OTP
                        </button>
                    </div>
                )}

                {showPasswordInput && (
                    <>
                        <div className="form-group">
                            <label>New Password</label>
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => {
                                    setNewPassword(e.target.value);
                                    validatePassword(e.target.value);
                                }}
                                className="form-input"
                                placeholder="Enter new password"
                            />
                            {passwordError && <div className="error-message">{passwordError}</div>}
                        </div>

                        <div className="form-group">
                            <label>Confirm Password</label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="form-input"
                                placeholder="Confirm new password"
                            />
                        </div>

                        <button onClick={handleResetPassword} className="button">
                            Reset Password
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default ForgotPassword;
