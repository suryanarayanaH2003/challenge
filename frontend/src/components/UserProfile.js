import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Button from './ui/button';

const UserProfile = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [applications, setApplications] = useState([]);
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    degree: '',
    designation: '',
    skills: ''
  });

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
      navigate('/login-user');
      return;
    }

    const fetchUserData = async () => {
      try {
        const response = await axios.get('http://localhost:8000/user-profile/', {
          headers: {
            'X-User-Email': user.email
          }
        });
        if (response.data.status === 'success') {
          setUserData(response.data.profile);
          setApplications(response.data.applications);
        }
      } catch (err) {
        setError('Failed to fetch user data');
        console.error('Error fetching user data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token'); // Clear JWT token
    navigate('/login-user'); // Redirect to login page
  };

  const handleEditChange = (e) => {
    setEditData({
      ...editData,
      [e.target.name]: e.target.value
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put('http://localhost:8000/user-profile/', editData, {
        headers: {
          'X-User-Email': userData.email
        }
      });
      if (response.data.status === 'success') {
        setUserData({ ...userData, ...editData });
        setIsEditing(false);
        setError('');
      } else {
        setError(response.data.message || 'Failed to update profile');
      }
    } catch (err) {
      setError('An error occurred during profile update');
    }
  };

  const styles = {
    container: {
      minHeight: '100vh',
      backgroundColor: '#f9fafb',
      padding: '2rem',
    },
    content: {
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
    },
    title: {
      fontSize: '2rem',
      fontWeight: 'bold',
      color: '#1a202c',
      marginBottom: '1rem',
    },
    tabs: {
      display: 'flex',
      gap: '1rem',
      padding: '1rem 2rem',
      backgroundColor: '#f8fafc',
      borderBottom: '1px solid #e2e8f0',
    },
    tab: {
      padding: '0.75rem 1.5rem',
      borderRadius: '0.5rem',
      cursor: 'pointer',
      fontWeight: '500',
      transition: 'all 0.2s',
    },
    activeTab: {
      backgroundColor: '#3182ce',
      color: '#ffffff',
    },
    inactiveTab: {
      backgroundColor: '#ffffff',
      color: '#4a5568',
      border: '1px solid #e2e8f0',
    },
    section: {
      padding: '2rem',
    },
    profileInfo: {
      display: 'grid',
      gap: '1.5rem',
    },
    infoGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem',
    },
    label: {
      fontSize: '0.875rem',
      fontWeight: '500',
      color: '#4a5568',
    },
    value: {
      fontSize: '1rem',
      color: '#1a202c',
    },
    applicationCard: {
      padding: '1.5rem',
      borderRadius: '0.5rem',
      border: '1px solid #e2e8f0',
      marginBottom: '1rem',
    },
    applicationHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '1rem',
    },
    jobTitle: {
      fontSize: '1.25rem',
      fontWeight: 'bold',
      color: '#2d3748',
    },
    status: {
      padding: '0.25rem 0.75rem',
      borderRadius: '9999px',
      fontSize: '0.875rem',
      fontWeight: '500',
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
    backButton: {
      marginBottom: '1rem',
    },
    logoutButton: {
      backgroundColor: '#3182ce',
      color: '#fff',
      padding: '0.5rem 1rem',
      borderRadius: '0.5rem',
      border: 'none',
      cursor: 'pointer',
      fontSize: '1rem',
      transition: 'background-color 0.3s ease',
    },
    editButton: {
      backgroundColor: '#3182ce',
      color: '#fff',
      padding: '0.5rem 1rem',
      borderRadius: '0.5rem',
      border: 'none',
      cursor: 'pointer',
      fontSize: '1rem',
      transition: 'background-color 0.3s ease',
      marginTop: '1rem',
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
    <div style={styles.container}>
      <div style={styles.content}>
        <Button 
          onClick={() => navigate('/userdashboard')}
          style={styles.backButton}
        >
          Back to Dashboard
        </Button>

        <div style={styles.header}>
          <h1 style={styles.title}>My Profile</h1>
        </div>

        <div style={styles.tabs}>
          <button
            style={{
              ...styles.tab,
              ...(activeTab === 'profile' ? styles.activeTab : styles.inactiveTab),
            }}
            onClick={() => setActiveTab('profile')}
          >
            Profile Details
          </button>
          <button
            style={{
              ...styles.tab,
              ...(activeTab === 'applications' ? styles.activeTab : styles.inactiveTab),
            }}
            onClick={() => setActiveTab('applications')}
          >
            Job Applications
          </button>
        </div>

        <div style={styles.section}>
          {activeTab === 'profile' && userData && (
            <div style={styles.profileInfo}>
              <div style={styles.infoGroup}>
                <span style={styles.label}>Full Name</span>
                <span style={styles.value}>{userData.name}</span>
              </div>
              <div style={styles.infoGroup}>
                <span style={styles.label}>Email</span>
                <span style={styles.value}>{userData.email}</span>
              </div>
              <div style={styles.infoGroup}>
                <span style={styles.label}>Mobile</span>
                <span style={styles.value}>{userData.mobile}</span>
              </div>
              {/* <div style={styles.infoGroup}>
                <span style={styles.label}>Password</span>
                <span style={styles.value}>{userData.password}</span>
              </div> */}
              <div style={styles.infoGroup}>
                <span style={styles.label}>Degree</span>
                <span style={styles.value}>{userData.degree}</span>
              </div>
              <div style={styles.infoGroup}>
                <span style={styles.label}>Designation</span>
                <span style={styles.value}>{userData.designation}</span>
              </div>
              <div style={styles.infoGroup}>
                <span style={styles.label}>Skills</span>
                <span style={styles.value}>{userData.skills}</span>
              </div>
              <Button 
                onClick={() => setIsEditing(true)}
                style={styles.editButton}
              >
                Edit Profile
              </Button>
            </div>
          )}

          {isEditing && (
            <form onSubmit={handleEditSubmit} style={styles.profileInfo}>
              <div style={styles.infoGroup}>
                <label style={styles.label} htmlFor="degree">Degree</label>
                <input
                  style={styles.input}
                  type="text"
                  id="degree"
                  name="degree"
                  value={editData.degree}
                  onChange={handleEditChange}
                  required
                />
              </div>
              <div style={styles.infoGroup}>
                <label style={styles.label} htmlFor="designation">Designation</label>
                <input
                  style={styles.input}
                  type="text"
                  id="designation"
                  name="designation"
                  value={editData.designation}
                  onChange={handleEditChange}
                  required
                />
              </div>
              <div style={styles.infoGroup}>
                <label style={styles.label} htmlFor="skills">Skills</label>
                <input
                  style={styles.input}
                  type="text"
                  id="skills"
                  name="skills"
                  value={editData.skills}
                  onChange={handleEditChange}
                  required
                />
              </div>
              <Button type="submit" style={styles.editButton}>
                Save Changes
              </Button>
              <Button 
                onClick={() => setIsEditing(false)}
                style={styles.editButton}
              >
                Cancel
              </Button>
            </form>
          )}

          {activeTab === 'applications' && (
            <div>
              {loading ? (
                <p>Loading applications...</p>
              ) : error ? (
                <p style={{ color: '#e53e3e' }}>{error}</p>
              ) : applications.length === 0 ? (
                <p>No job applications yet.</p>
              ) : (
                applications.map((application) => (
                  <div key={application._id} style={styles.applicationCard}>
                    <div style={styles.applicationHeader}>
                      <h3 style={styles.jobTitle}>{application.job_title}</h3>
                      <span style={{ ...styles.status, ...getStatusStyle(application.status) }}>
                        {application.status}
                      </span>
                    </div>
                    <div style={styles.profileInfo}>
                      <div style={styles.infoGroup}>
                        <span style={styles.label}>Company</span>
                        <span style={styles.value}>{application.company_name}</span>
                      </div>
                      <div style={styles.infoGroup}>
                        <span style={styles.label}>Applied On</span>
                        <span style={styles.value}>
                          {new Date(application.applied_date).toLocaleDateString()}
                        </span>
                      </div>
                      <div style={styles.infoGroup}>
                        <span style={styles.label}>Experience</span>
                        <span style={styles.value}>{application.experience}</span>
                      </div>
                      <div style={styles.infoGroup}>
                        <span style={styles.label}>Expected Salary</span>
                        <span style={styles.value}>{application.expected_salary}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        <button style={styles.logoutButton} onClick={handleLogout}>
          Logout
        </button>
      </div>
    </div>
  );
};

export default UserProfile;