import React, { useState } from 'react';
import axios from 'axios';
import Button from './ui/button';

const JobApplicationModal = ({ job, onClose, userData }) => {
  const [formData, setFormData] = useState({
    name: userData?.name || '',
    qualification: '',
    skills: '',
    dateOfBirth: '',
    location: '',
    experience: 'fresher',
    expectedSalary: '',
    resume: null
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const applicationData = {
        ...formData,
        job_id: job._id,
        company_id: job.company_id,
        company_name: job.company,
        job_title: job.job_title,
        applicant_email: userData.email,
        applied_date: new Date().toISOString(),
        status: 'pending'
      };

      const response = await axios.post(
        'http://localhost:8000/apply-job/',
        applicationData,
        {
          headers: {
            'Content-Type': 'application/json',
            'X-User-Email': userData.email
          }
        }
      );

      if (response.data.status === 'success') {
        setSuccess('Application submitted successfully!');
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        setError(response.data.message || 'Failed to submit application');
      }
    } catch (err) {
      setError('An error occurred while submitting your application');
      console.error('Application error:', err);
    }
  };

  const styles = {
    overlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
    },
    modal: {
      backgroundColor: '#fff',
      padding: '2rem',
      borderRadius: '0.75rem',
      width: '90%',
      maxWidth: '600px',
      maxHeight: '90vh',
      overflow: 'auto',
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '1.5rem',
    },
    title: {
      fontSize: '1.5rem',
      fontWeight: 'bold',
      color: '#2d3748',
    },
    closeButton: {
      background: 'none',
      border: 'none',
      fontSize: '1.5rem',
      cursor: 'pointer',
      color: '#4a5568',
    },
    form: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
    },
    formGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem',
    },
    label: {
      fontSize: '0.875rem',
      fontWeight: '500',
      color: '#4a5568',
    },
    input: {
      padding: '0.75rem',
      borderRadius: '0.5rem',
      border: '1px solid #e2e8f0',
      fontSize: '1rem',
    },
    select: {
      padding: '0.75rem',
      borderRadius: '0.5rem',
      border: '1px solid #e2e8f0',
      fontSize: '1rem',
      backgroundColor: '#fff',
    },
    error: {
      color: '#e53e3e',
      fontSize: '0.875rem',
      marginTop: '0.5rem',
    },
    success: {
      color: '#38a169',
      fontSize: '0.875rem',
      marginTop: '0.5rem',
    },
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <h2 style={styles.title}>Apply for {job.job_title}</h2>
          <button style={styles.closeButton} onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Full Name</label>
            <input
              style={styles.input}
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Qualification</label>
            <input
              style={styles.input}
              type="text"
              name="qualification"
              value={formData.qualification}
              onChange={handleChange}
              required
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Skills</label>
            <input
              style={styles.input}
              type="text"
              name="skills"
              value={formData.skills}
              onChange={handleChange}
              required
              placeholder="e.g., JavaScript, Python, React"
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Date of Birth</label>
            <input
              style={styles.input}
              type="date"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleChange}
              required
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Location</label>
            <input
              style={styles.input}
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              required
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Experience</label>
            <select
              style={styles.select}
              name="experience"
              value={formData.experience}
              onChange={handleChange}
              required
            >
              <option value="fresher">Fresher</option>
              <option value="1-2">1-2 years</option>
              <option value="3-5">3-5 years</option>
              <option value="5+">5+ years</option>
            </select>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Expected Salary</label>
            <input
              style={styles.input}
              type="text"
              name="expectedSalary"
              value={formData.expectedSalary}
              onChange={handleChange}
              required
              placeholder="e.g., $50,000 - $60,000"
            />
          </div>

          {error && <p style={styles.error}>{error}</p>}
          {success && <p style={styles.success}>{success}</p>}

          <Button type="submit">Submit Application</Button>
        </form>
      </div>
    </div>
  );
};

export default JobApplicationModal; 