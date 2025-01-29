import React, { useState } from 'react';
import axios from 'axios';

/*****  ✨ Codeium Command ⭐  *****/
/**
 * Resets a user's password with a new one.
 *
 * @param {string} email Email address of the user.
 * @param {string} newPassword New password to set.
 * @param {string} confirmPassword Confirmation of the new password.
 *
 * @returns {Promise} Resolves if the password reset is successful, rejects if there is an error.
 */
/**  5236577b-bce9-4acc-a319-e3f52c08ef18  ***/function ResetPassword() {
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Handle input changes
  const handleEmailChange = (e) => setEmail(e.target.value);
  const handleNewPasswordChange = (e) => setNewPassword(e.target.value);
  const handleConfirmPasswordChange = (e) => setConfirmPassword(e.target.value);

  // Password validation logic
  const isPasswordValid = (password) => {
    const passwordRegex = /^(?=.[a-z])(?=.[A-Z])(?=.\d)(?=.[@$!%?&])[A-Za-z\d@$!%?&]{8,}$/;
    return passwordRegex.test(password);
  };

  // Email validation logic
  const isGmail = (email) => email.endsWith('@gmail.com');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !newPassword || !confirmPassword) {
      setError('All fields are required');
      return;
    }

    if (!isGmail(email)) {
      setError('Email must end with @gmail.com');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!isPasswordValid(newPassword)) {
      setError(
        'Password must include uppercase, lowercase, number, special character, and be at least 8 characters long'
      );
      return;
    }

    try {
      const response = await axios.post('http://127.0.0.1:8000/api/resetpassword', {
        email,
        newPassword,
      });

      if (response.data.success) {
        setMessage(response.data.message);
        setError('');
      } else {
        setError(response.data.message || 'Error resetting password');
        setMessage('');
      }
    } catch (err) {
      console.error('Error during password reset:', err);
      setError('Error during password reset. Please try again.');
      setMessage('');
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>Reset Password</h1>
      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          type="email"
          name="email"
          placeholder="Enter your email"
          value={email}
          onChange={handleEmailChange}
          style={styles.input}
        />
        <input
          type="password"
          name="newPassword"
          placeholder="Enter new password"
          value={newPassword}
          onChange={handleNewPasswordChange}
          style={styles.input}
        />
        <input
          type="password"
          name="confirmPassword"
          placeholder="Confirm new password"
          value={confirmPassword}
          onChange={handleConfirmPasswordChange}
          style={styles.input}
        />
        <button type="submit" style={styles.button}>Reset Password</button>
      </form>
      {message && <p style={styles.successMessage}>{message}</p>}
      {error && <p style={styles.errorMessage}>{error}</p>}
    </div>
  );
}

// Styles for the component
const styles = {
  container: {
    marginTop: '50px',
    textAlign: 'center',
    fontFamily: 'Arial, sans-serif',
    backgroundColor: '#F3F3F3',
    padding: '20px',
    borderRadius: '8px',
    maxWidth: '400px',
    margin: 'auto',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
  },
  header: {
    color: '#333',
    marginBottom: '20px',
    fontWeight: 'bold',
    fontSize: '28px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  input: {
    padding: '12px 20px',
    margin: '10px 0',
    width: '80%',
    fontSize: '16px',
    borderRadius: '4px',
    border: '1px solid #ddd',
    backgroundColor: '#fff',
    outline: 'none',
    transition: 'border-color 0.3s ease',
  },
  button: {
    backgroundColor: '#4299e1',
    color: '#fff',
    border: 'none',
    padding: '12px 30px',
    borderRadius: '4px',
    fontSize: '16px',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease',
    marginTop: '20px',
  },
  successMessage: {
    color: 'green',
    fontSize: '16px',
    marginTop: '20px',
  },
  errorMessage: {
    color: 'red',
    fontSize: '16px',
    marginTop: '20px',
  },
};

export default ResetPassword;