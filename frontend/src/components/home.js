import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from './ui/button';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div style={styles.container}>
      <style>
        {`
          body {
            margin: 0;
            font-family: Arial, sans-serif;
          }

          @keyframes fadeIn {
            from {
              opacity: 0;
            }
            to {
              opacity: 1;
            }
          }

          @keyframes slideIn {
            from {
              transform: translateY(-20px);
              opacity: 0;
            }
            to {
              transform: translateY(0);
              opacity: 1;
            }
          }

          @keyframes zoomIn {
            from {
              transform: scale(0.9);
              opacity: 0;
            }
            to {
              transform: scale(1);
              opacity: 1;
            }
          }

          h1, h2, p {
            margin: 0;
            padding: 0;
          }

          button {
            cursor: pointer;
            transition: background-color 0.3s ease;
          }

          button:hover {
            background-color: #f0f0f0; /* Change button color on hover */
          }
        `}
      </style>
      <h1 style={styles.title}>Welcome to Job Portal</h1>
      <p style={styles.subtitle}>Find your dream job or hire the perfect candidate</p>

      <div style={styles.buttonContainer}>
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>For Job Seekers</h2>
          <div style={styles.buttonGroup}>
            <Button onClick={() => navigate('/login-user')}>Login as User</Button>
            <Button onClick={() => navigate('/register-user')}>Sign Up as User</Button>
          </div>
        </div>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>For Employers</h2>
          <div style={styles.buttonGroup}>
            <Button onClick={() => navigate('/login-admin')}>Login as Admin</Button>
            <Button onClick={() => navigate('/register-admin')}>Sign Up as Admin</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000000', // Black background
    color: '#ffffff', // White text
    padding: '2rem',
    animation: 'fadeIn 1s ease-in-out', // Animation for fade-in effect
  },
  title: {
    fontSize: '3rem',
    fontWeight: 'bold',
    marginBottom: '1rem',
    textAlign: 'center',
    animation: 'slideIn 1s ease-in-out', // Animation for title
  },
  subtitle: {
    fontSize: '1.5rem',
    marginBottom: '2rem',
    textAlign: 'center',
    animation: 'slideIn 1.5s ease-in-out', // Animation for subtitle
  },
  buttonContainer: {
    display: 'flex',
    gap: '2rem',
    flexWrap: 'wrap',
    justifyContent: 'center',
    animation: 'fadeIn 2s ease-in-out', // Animation for button container
  },
  section: {
    backgroundColor: '#ffffff',
    padding: '2rem',
    borderRadius: '1rem',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    margin: '1rem',
    minWidth: '300px',
    animation: 'zoomIn 1s ease-in-out', // Animation for sections
  },
  sectionTitle: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '#2d3748',
    marginBottom: '1.5rem',
    textAlign: 'center',
  },
  buttonGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
};

export default Home; 