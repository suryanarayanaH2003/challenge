import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Button from './ui/button';

const RegisterUser = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    password: '',
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:8000/register/user/', {
        ...formData,
        role: 'user'
      });
      
      if (response.data.status === 'success') {
        navigate('/login-user');
      } else {
        setError(response.data.message || 'Registration failed');
      }
    } catch (err) {
      setError('An error occurred during registration');
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
        <h1 style={styles.title}>Sign Up as Job Seeker</h1>
        
        <div style={styles.formGroup}>
          <label style={styles.label} htmlFor="name">Full Name</label>
          <input
            style={styles.input}
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

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
          <label style={styles.label} htmlFor="mobile">Mobile Number</label>
          <input
            style={styles.input}
            type="tel"
            id="mobile"
            name="mobile"
            value={formData.mobile}
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

        {error && <p style={styles.error}>{error}</p>}

        <div style={styles.buttonContainer}>
          <Button type="submit" style={{ width: '100%' }}>
            Sign Up
          </Button>
        </div>

        <p style={{ textAlign: 'center', marginTop: '1rem' }}>
          Already have an account?{' '}
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              navigate('/login-user');
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

export default RegisterUser;