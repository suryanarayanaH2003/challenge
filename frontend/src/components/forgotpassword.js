import React, { useState } from 'react';
import axios from 'axios';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Handle input change
  const handleInputChange = (e) => {
    setEmail(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      setError('Email is required');
      return;
    }

    // Check if the email is a valid Gmail address
    if (!email.endsWith('@gmail.com')) {
      setError('Please enter a valid Gmail address');
      return;
    }

    try {
      // Ensure the request content type is JSON
      const response = await axios.post('http://127.0.0.1:8000/api/forgotpassword', 
        { email }, 
        {
          headers: {
            'Content-Type': 'application/json',
          },
        });
      
      if (response.data.success) {
        setMessage('Password reset link sent to your email');
        setError('');
      } else {
        setError(response.data.message || 'Error sending reset link');
        setMessage('');
      }
    } catch (err) {
      console.error('Error during forgot password:', err);
      setError('Error during forgot password. Please try again.');
      setMessage('');
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>Forgot Password</h1>
      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          type="email"
          name="email"
          placeholder="Enter your email"
          value={email}
          onChange={handleInputChange}
          style={styles.input}
        />
        <button type="submit" style={styles.button}>Submit</button>
      </form>
      {message && <p style={styles.successMessage}>{message}</p>}
      {error && <p style={styles.errorMessage}>{error}</p>}
    </div>
  );
}

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

export default ForgotPassword;