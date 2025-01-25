import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Button from './ui/button';

const LoginAdmin = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = 'http://localhost:8000/login/admin/';
    try {
      const response = await axios.post(url, formData);
      if (response.data.status === 'success') {
        // Store user data in localStorage
        localStorage.setItem('adminData', JSON.stringify(response.data.user));
        navigate('/admindashboard');
      } else {
        setMessage('Login failed.');
      }
    } catch (error) {
      setMessage('An error occurred.');
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
      maxWidth: '400px',
    },
    title: {
      fontSize: '1.875rem',
      fontWeight: 'bold',
      color: '#1a202c',
      marginBottom: '2rem',
      textAlign: 'center',
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
    error: {
      color: '#e53e3e',
      marginTop: '0.5rem',
      fontSize: '0.875rem',
    },
    buttonContainer: {
      marginTop: '2rem',
    },
  };

  return (
    <div style={styles.container}>
      <form style={styles.form} onSubmit={handleSubmit}>
        <h1 style={styles.title}>Admin Login</h1>
        
        <div style={styles.formGroup}>
          <label style={styles.label} htmlFor="email">Email Address</label>
          <input
            style={styles.input}
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

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
        </div>

        {message && <p style={styles.error}>{message}</p>}

        <div style={styles.buttonContainer}>
          <Button type="submit" style={{ width: '100%' }}>
            Login
          </Button>
        </div>

        <p style={{ textAlign: 'center', marginTop: '1rem' }}>
          Don't have an account?{' '}
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              navigate('/register-admin');
            }}
            style={{ color: '#3182ce', textDecoration: 'none' }}
          >
            Sign up here
          </a>
        </p>
      </form>
    </div>
  );
};

export default LoginAdmin;