import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Button from './ui/button';

const JobApplicants = ({ job, onClose }) => {
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchApplicants = async () => {
      try {
        const adminData = JSON.parse(localStorage.getItem('adminData'));
        if (!adminData?.email) {
          setError('Admin authentication required');
          return;
        }

        const response = await axios.get(`http://localhost:8000/job-applicants/${job._id}/`, {
          headers: {
            'X-User-Email': adminData.email
          }
        });

        if (response.data.status === 'success') {
          setApplicants(response.data.applicants);
        } else {
          setError(response.data.message || 'Failed to fetch applicants');
        }
      } catch (err) {
        setError('An error occurred while fetching applicants');
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchApplicants();
  }, [job._id]);

  const handleStatusChange = async (applicantId, newStatus) => {
    try {
      const adminData = JSON.parse(localStorage.getItem('adminData'));
      const response = await axios.put(
        `http://localhost:8000/update-application-status/${applicantId}/`,
        { status: newStatus },
        {
          headers: {
            'X-User-Email': adminData.email
          }
        }
      );

      if (response.data.status === 'success') {
        setApplicants(applicants.map(app => 
          app._id === applicantId ? { ...app, status: newStatus } : app
        ));
      }
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  const styles = {
    modal: {
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
    content: {
      backgroundColor: '#fff',
      padding: '2rem',
      borderRadius: '0.75rem',
      width: '90%',
      maxWidth: '1200px',
      maxHeight: '90vh',
      overflow: 'auto',
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '2rem',
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
    table: {
      width: '100%',
      borderCollapse: 'collapse',
      marginTop: '1rem',
    },
    th: {
      backgroundColor: '#f7fafc',
      padding: '0.75rem',
      textAlign: 'left',
      fontSize: '0.875rem',
      fontWeight: '600',
      color: '#4a5568',
      borderBottom: '2px solid #e2e8f0',
    },
    td: {
      padding: '0.75rem',
      borderBottom: '1px solid #e2e8f0',
      fontSize: '0.875rem',
      color: '#2d3748',
    },
    statusBadge: {
      padding: '0.25rem 0.75rem',
      borderRadius: '9999px',
      fontSize: '0.75rem',
      fontWeight: '500',
      display: 'inline-block',
    },
    statusPending: {
      backgroundColor: '#fef3c7',
      color: '#92400e',
    },
    statusAccepted: {
      backgroundColor: '#dcfce7',
      color: '#166534',
    },
    statusRejected: {
      backgroundColor: '#fee2e2',
      color: '#991b1b',
    },
    actionButton: {
      padding: '0.25rem 0.5rem',
      borderRadius: '0.375rem',
      fontSize: '0.75rem',
      marginRight: '0.5rem',
      cursor: 'pointer',
      border: 'none',
      fontWeight: '500',
    },
    acceptButton: {
      backgroundColor: '#dcfce7',
      color: '#166534',
    },
    rejectButton: {
      backgroundColor: '#fee2e2',
      color: '#991b1b',
    },
  };

  const getStatusStyle = (status) => {
    switch (status.toLowerCase()) {
      case 'accepted':
        return styles.statusAccepted;
      case 'rejected':
        return styles.statusRejected;
      default:
        return styles.statusPending;
    }
  };

  return (
    <div style={styles.modal}>
      <div style={styles.content}>
        <div style={styles.header}>
          <h2 style={styles.title}>Applicants for {job.job_title}</h2>
          <button style={styles.closeButton} onClick={onClose}>×</button>
        </div>

        {loading ? (
          <p>Loading applicants...</p>
        ) : error ? (
          <p style={{ color: '#e53e3e' }}>{error}</p>
        ) : applicants.length === 0 ? (
          <p>No applications yet for this job.</p>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Name</th>
                <th style={styles.th}>Email</th>
                <th style={styles.th}>Qualification</th>
                <th style={styles.th}>Experience</th>
                <th style={styles.th}>Expected Salary</th>
                <th style={styles.th}>Applied Date</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {applicants.map((applicant) => (
                <tr key={applicant._id}>
                  <td style={styles.td}>{applicant.name}</td>
                  <td style={styles.td}>{applicant.applicant_email}</td>
                  <td style={styles.td}>{applicant.qualification}</td>
                  <td style={styles.td}>{applicant.experience}</td>
                  <td style={styles.td}>{applicant.expected_salary}</td>
                  <td style={styles.td}>
                    {new Date(applicant.applied_date).toLocaleDateString()}
                  </td>
                  <td style={styles.td}>
                    <span style={{ ...styles.statusBadge, ...getStatusStyle(applicant.status) }}>
                      {applicant.status}
                    </span>
                  </td>
                  <td style={styles.td}>
                    {applicant.status === 'pending' && (
                      <>
                        <button
                          style={{ ...styles.actionButton, ...styles.acceptButton }}
                          onClick={() => handleStatusChange(applicant._id, 'accepted')}
                        >
                          Accept
                        </button>
                        <button
                          style={{ ...styles.actionButton, ...styles.rejectButton }}
                          onClick={() => handleStatusChange(applicant._id, 'rejected')}
                        >
                          Reject
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default JobApplicants; 