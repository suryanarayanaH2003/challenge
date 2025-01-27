import React, { useState } from 'react';
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