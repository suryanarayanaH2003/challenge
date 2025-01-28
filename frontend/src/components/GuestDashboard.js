import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Button from './ui/button';

const GuestDashboard = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await axios.get('http://localhost:8000/guest-dashboard/');
        if (response.data.status === 'success') {
          console.log(response.data.jobs);
          
          setJobs(response.data.jobs);
          setFilteredJobs(response.data.jobs);
        } else {
          setError(response.data.message || 'Failed to fetch jobs');
        }
      } catch (err) {
        setError('An error occurred while fetching jobs');
        console.error('Error fetching jobs:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  const handleApplyClick = () => {
    alert('Login needed to apply for jobs');
  };

  const fetchCompanyDetails = async (companyId) => {
    try {
      const response = await axios.get(`http://localhost:8000/company/${companyId}`);
      if (response.data.status === 'success') {
        setSelectedCompany(response.data.company);
      } else {
        setError(response.data.message || 'Failed to fetch company details');
      }
    } catch (err) {
      setError('An error occurred while fetching company details');
      console.error('Error fetching company details:', err);
    }
  };

  const handleSearchChange = (e) => {
  const query = e.target.value.toLowerCase();
  setSearchQuery(query);
  const filtered = jobs.filter((job) =>
    (job.title && job.title.toLowerCase().includes(query)) ||
    (job.job_title && job.job_title.toLowerCase().includes(query)) ||
    (job.company && job.company.toLowerCase().includes(query)) ||
    (job.location && job.location.toLowerCase().includes(query)) ||
    (job.qualification && job.qualification.toLowerCase().includes(query)) ||
    (job.required_skills_and_qualifications && job.required_skills_and_qualifications.toLowerCase().includes(query)) ||
    (job.salary_range && job.salary_range.toLowerCase().includes(query))
  );
  setFilteredJobs(filtered);
};
  const styles = {
    dashboard: {
      minHeight: '100vh',
      backgroundColor: '#f9fafb',
      padding: '2rem',
    },
    container: {
      maxWidth: '1120px',
      margin: '0 auto',
      backgroundColor: '#ffffff',
      borderRadius: '0.75rem',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      overflow: 'hidden',
    },
    header: {
      padding: '2rem',
      borderBottom: '1px solid #e2e8f0',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    title: {
      fontSize: '2rem',
      aligntext: 'center',
      fontWeight: 'bold',
      color: '#000000',
    },
    searchInput: {
      alignItems: 'center',  
      padding: '0.5rem',
      fontSize: '1rem',
      borderRadius: '0.5rem',
      border: '1px solid #e2e8f0',
      width: '100%',
      maxWidth: '400px',
      marginBottom: '1rem',
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
      gap: '1.5rem',
      padding: '2rem',
    },
    card: {
      backgroundColor: '#ffffff',
      borderRadius: '0.75rem',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      overflow: 'hidden',
      transition: 'transform 0.2s',
    },
    cardHover: {
      transform: 'scale(1.05)',
    },
    cardHeader: {
      padding: '1rem',
      borderBottom: '1px solid #e2e8f0',
    },
    cardTitle: {
      fontSize: '1.5rem',
      fontWeight: 'bold',
      color: '#2d3748',
    },
    cardContent: {
      padding: '1rem',
    },
    button: {
      display: 'inline-block',
      margin: '0.5rem 0',
      padding: '0.5rem 1rem',
      backgroundColor: '#3182ce',
      color: '#ffffff',
      borderRadius: '0.5rem',
      textDecoration: 'none',
      textAlign: 'center',
      cursor: 'pointer',
    },
    modal: {
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContent: {
      backgroundColor: '#ffffff',
      borderRadius: '0.75rem',
      padding: '2rem',
      maxWidth: '600px',
      width: '100%',
    },
    modalHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderBottom: '1px solid #e2e8f0',
      paddingBottom: '1rem',
      marginBottom: '1rem',
    },
    modalTitle: {
      fontSize: '1.5rem',
      fontWeight: 'bold',
      color: '#2d3748',
    },
    closeButton: {
      backgroundColor: 'transparent',
      color: '#000000',
      border: 'none',
      fontSize: '1.5rem',
      cursor: 'pointer',
    },
  };

  return (
    <div style={styles.dashboard}>
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={{ ...styles.title, textAlign: 'center' }}>Job Portal</h1>
          <Button onClick={() => navigate('/login-user')}>Login</Button>
        </div>

        <input
        
          type="text"
          placeholder="Search jobs..."
          value={searchQuery}
          onChange={handleSearchChange}
          style={styles.searchInput}
        />

        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p style={{ color: 'red' }}>{error}</p>
        ) : (
          <div style={styles.grid}>
            {filteredJobs.map((job) => (
              <div
                key={job._id}
                style={styles.card}
                onMouseEnter={(e) =>
                  e.currentTarget.setAttribute(
                    'style',
                    Object.entries({
                      ...styles.card,
                      ...styles.cardHover,
                    })
                      .map(([key, value]) => `${key}:${value}`)
                      .join(';')
                  )
                }
                onMouseLeave={(e) =>
                  e.currentTarget.setAttribute(
                    'style',
                    Object.entries(styles.card)
                      .map(([key, value]) => `${key}:${value}`)
                      .join(';')
                  )
                }
              >
                <div style={styles.cardHeader}>
                  <h2 style={styles.cardTitle}>{job.title}</h2>
                </div>
                <div style={styles.cardContent}>
                  <p>
                    <strong>Role:</strong> {job.job_title}
                    </p> 
                  <p>
                    <strong>Company:</strong> {job.company}
                  </p>
                  <p>
                    <strong>Location:</strong> {job.location}
                  </p>
                  <p>
                    <strong>Qualification:</strong> {job.qualification}
                  </p>
                  <p>
                    <strong>Skills:</strong> {job.required_skills_and_qualifications}
                  </p>
                  <p>
                    <strong>Salary:</strong> {job.salary_range}
                  </p>
                </div>
                <div>
                  <a
                    href="#"
                    style={{ ...styles.button, marginRight: '0.5rem' }}
                    onClick={(e) => {
                      e.preventDefault();
                      fetchCompanyDetails(job.company_id);
                    }}
                  >
                    View Company Details
                  </a>

                  <a
                    href="#"
                    style={styles.button}
                    onClick={(e) => {
                      e.preventDefault();
                      handleApplyClick();
                    }}
                  >
                    Apply
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}

        {selectedCompany && (
          <div style={styles.modal}>
            <div style={styles.modalContent}>
              <div style={styles.modalHeader}>
                <h2 style={styles.modalTitle}>Company Details</h2>
                <button
                  style={styles.closeButton}
                  onClick={() => setSelectedCompany(null)}
                >
                  ×
                </button>
              </div>
              <div style={styles.cardContent}>
                <p>
                  <strong>Company Name:</strong> {selectedCompany.name}
                </p>
                <p>
                  <strong>Description:</strong> {selectedCompany.description}
                </p>
                <p>
                  <strong>Website:</strong>{' '}
                  <a
                    href={selectedCompany.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: '#3182ce' }}
                  >
                    {selectedCompany.website}
                  </a>
                </p>
                <p>
                  <strong>Address:</strong> {selectedCompany.address}
                </p>
                <p>
                  <strong>Hiring Manager:</strong> {selectedCompany.hiring_manager.name}
                </p>
                <p>
                  <strong>Contact Email:</strong> {selectedCompany.hiring_manager.email}
                </p>
                <p>
                  <strong>Contact Phone:</strong> {selectedCompany.hiring_manager.phone}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GuestDashboard;