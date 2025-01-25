import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from './ui/button';

const Home = () => {
  const navigate = useNavigate();

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
    title: {
      fontSize: '2.5rem',
      fontWeight: 'bold',
      color: '#1a202c',
      marginBottom: '2rem',
      textAlign: 'center',
    },
    subtitle: {
      fontSize: '1.25rem',
      color: '#4a5568',
      marginBottom: '3rem',
      textAlign: 'center',
    },
    buttonContainer: {
      display: 'flex',
      gap: '2rem',
      flexWrap: 'wrap',
      justifyContent: 'center',
    },
    section: {
      backgroundColor: '#ffffff',
      padding: '2rem',
      borderRadius: '1rem',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      margin: '1rem',
      minWidth: '300px',
    },
    sectionTitle: {
      fontSize: '1.5rem',
      fontWeight: 'bold',
      color: '#2d3748',
      marginBottom: '1.5rem',
      textAlign: 'center',
    },
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Welcome to Job Portal</h1>
      <p style={styles.subtitle}>Find your dream job or hire the perfect candidate</p>
      
      <div style={styles.buttonContainer}>
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>For Job Seekers</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <Button onClick={() => navigate('/login-user')}>Login as User</Button>
            <Button onClick={() => navigate('/register-user')}>Sign Up as User</Button>
          </div>
        </div>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>For Employers</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <Button onClick={() => navigate('/login-admin')}>Login as Admin</Button>
            <Button onClick={() => navigate('/register-admin')}>Sign Up as Admin</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home; 