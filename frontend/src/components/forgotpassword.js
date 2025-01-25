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
        <div>
            <h2>Reset Password</h2>
            {error && <div>{error}</div>}
            {message && <div>{message}</div>}
            <div>
                <label>Email Address</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                {!showOtpInput && (
                    <button onClick={handleSendOtp} disabled={!email || isTimerRunning}>
                        {isTimerRunning ? `Resend OTP in ${Math.floor(otpTimer / 60)}:${otpTimer % 60}` : 'Send OTP'}
                    </button>
                )}
            </div>
            {showOtpInput && (
                <div>
                    <label>Enter OTP</label>
                    <input type="text" value={otp} onChange={(e) => setOtp(e.target.value)} />
                    <button onClick={handleVerifyOtp}>Verify OTP</button>
                </div>
            )}
            {showPasswordInput && (
                <>
                    <div>
                        <label>New Password</label>
                        <input type="password" value={newPassword} onChange={(e) => {
                            setNewPassword(e.target.value);
                            validatePassword(e.target.value);
                        }} />
                        {passwordError && <p>{passwordError}</p>}
                    </div>
                    <div>
                        <label>Confirm Password</label>
                        <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                    </div>
                    <button onClick={handleResetPassword}>Reset Password</button>
                </>
            )}
        </div>
    );
};

export default ForgotPassword;
