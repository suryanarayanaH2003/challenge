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
            errorMessage += 'At least 3 lowercase letters. ';
        }
        if (numberCount < 3) {
            errorMessage += 'At least 3 numbers. ';
        }
        if (specialCharacterCount < 1) {
            errorMessage += 'At least 1 special character. ';
        }
        if (password.length < 7) {
            errorMessage += 'At least 7 characters long. ';
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
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    height: 100vh;
                    background-color: #f4f4f4;
                }

                .forgot-password-card {
                    background: white;
                    padding: 20px;
                    border-radius: 8px;
                    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
                    width: 300px;
                }

                h2 {
                    text-align: center;
                    margin-bottom: 20px;
                }

                .form-group {
                    margin-bottom: 15px;
                }

                .input-field {
                    width: 100%;
                    padding: 10px;
                    border: 1px solid #ccc;
                    border-radius: 4px;
                }

                .btn {
                    width: 100%;
                    padding: 10px;
                    background-color: #007bff;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                }

                .btn:hover {
                    background-color: #0056b3;
                }

                .error-message {
                    color: red;
                    font-size: 0.9em;
                }

                .success-message {
                    color: green;
                    font-size: 0.9em;
                    text-align: center;
                }
                `}
            </style>
            <div className="forgot-password-card">
                <h2>Reset Password</h2>
                {error && <div className="error-message">{error}</div>}
                {message && <div className="success-message">{message}</div>}
                <div className="form-group">
                    <label>Email Address</label>
                    <input type="email" className="input-field" value={email} onChange={(e) => setEmail(e.target.value)} />
                    {!showOtpInput && (
                        <button className="btn" onClick={handleSendOtp} disabled={!email || isTimerRunning}>
                            {isTimerRunning ? `Resend OTP in ${Math.floor(otpTimer / 60)}:${otpTimer % 60}` : 'Send OTP'}
                        </button>
                    )}
                </div>
                {showOtpInput && (
                    <div className="form-group">
                        <label>Enter OTP</label>
                        <input type="text" className="input-field" value={otp} onChange={(e) => setOtp(e.target.value)} />
                        <button className="btn" onClick={handleVerifyOtp}>Verify OTP</button>
                    </div>
                )}
                {showPasswordInput && (
                    <>
                        <div className="form-group">
                            <label>New Password</label>
                            <input type="password" className="input-field" value={newPassword} onChange={(e) => {
                                setNewPassword(e.target.value);
                                validatePassword(e.target.value);
                            }} />
                            {passwordError && <p className="error-message">{passwordError}</p>}
                        </div>
                        <div className="form-group">
                            <label>Confirm Password</label>
                            <input type="password" className="input-field" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                        </div>
                        <button className="btn" onClick={handleResetPassword}>Reset Password</button>
                    </>
                )}
            </div>
        </div>
    );
};

export default ForgotPassword;
