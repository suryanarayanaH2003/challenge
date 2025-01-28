import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import JobApplicationModal from "./JobApplicationModal";
import Button from "./ui/button";

const UserDashboard = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userData, setUserData] = useState(null);
  const [selectedTitle, setSelectedTitle] = useState("");
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredJobs, setFilteredJobs] = useState(jobs);

  const jobTitles = Array.from(new Set(jobs.map((jobs) => jobs.job_title)));

  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = JSON.parse(localStorage.getItem('user'));
        if (user) {
          setUserData(user);
        } else {
          navigate('/login-user');
        }

        const response = await axios.get("http://localhost:8000/fetchjobs");
        if (response.data.status === "success") {
          setJobs(response.data.jobs || []);
          setFilteredJobs(response.data.jobs);
        } else {
          setError(response.data.message || "Failed to fetch jobs.");
        }
      } catch (err) {
        setError("An error occurred while fetching data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  useEffect(() => {
    let timeoutId;

    const resetTimer = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        localStorage.removeItem('user');
        navigate('/login-user');
      }, 100000000);
    };

    window.addEventListener('mousemove', resetTimer);
    window.addEventListener('keydown', resetTimer);
    window.addEventListener('click', resetTimer);
    window.addEventListener('scroll', resetTimer);

    resetTimer();

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('keydown', resetTimer);
      window.removeEventListener('click', resetTimer);
      window.removeEventListener('scroll', resetTimer);
    };
  }, [navigate]);

  const fetchCompanyDetails = async (companyId) => {
    try {
      const response = await axios.get(`http://localhost:8000/company/${companyId}/`);
      if (response.data.status === "success") {
        setSelectedCompany(response.data.company);
      } else {
        setError("Failed to fetch company details.");
      }
    } catch (err) {
      setError("An error occurred while fetching company details.");
    }
  };

  const handleTitleChange = (event) => {
    const selected = event.target.value;
    setSelectedTitle(selected);
    applyFilters(selected, searchQuery);
  };



  const handleSearchChange = (event) => {
    const query = event.target.value.toLowerCase();
    setSearchQuery(query);
    applyFilters(selectedTitle, query);
  };

  const applyFilters = (title, query) => {
    const filtered = jobs.filter((jobs) => {
      const matchesTitle = title ? jobs.job_title === title : true;
      const matchesSearch = jobs.job_title.toLowerCase().includes(query);
      return matchesTitle && matchesSearch;
    });
    setFilteredJobs(filtered);
  };

  

  
  const handleApplyClick = (job) => {
    setSelectedJob(job);
  };


  const styles = {
    dashboard: {
      minHeight: "100vh",
      backgroundColor: "#f9fafb",
    },
    container: {
      maxWidth: "1120px",
      margin: "0 auto",
      padding: "2rem",
    },
    header: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "2rem",
    },
    title: {
      fontSize: "2rem",
      fontWeight: "bold",
      color: "#1a202c",
    },
    welcome: {
      fontSize: "1.25rem",
      color: "#4a5568",
      marginBottom: "2rem",
    },
    searchContainer: {
      display: 'flex',
      alignItems: 'center',
      marginBottom: '1rem',
    },
    searchInput: {
      padding: '0.5rem',
      fontSize: '1rem',
      borderRadius: '0.5rem',
      border: '1px solid #e2e8f0',
      width: '100%',
      maxWidth: '400px',
      marginRight: '1rem',
    },
    filterButton: {
      padding: '0.5rem 1rem',
      fontSize: '1rem',
      borderRadius: '0.5rem',
      border: 'none',
      backgroundColor: '#3182ce',
      color: '#fff',
      cursor: 'pointer',
    },
    filterContainer: {
      display: 'flex',
      flexDirection: 'column',
      marginBottom: '1rem',
    },
    filterInput: {
      padding: '0.5rem',
      fontSize: '1rem',
      borderRadius: '0.5rem',
      border: '1px solid #e2e8f0',
      marginBottom: '0.5rem',
    },
    grid: {
      display: "grid",
      gridTemplateColumns: "repeat(1, 1fr)",
      gap: "2rem",
    },
    card: {
      backgroundColor: "#fff",
      borderRadius: "0.75rem",
      padding: "1.5rem",
      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
      transition: "transform 0.2s, box-shadow 0.2s",
    },
    cardHover: {
      transform: "scale(1.03)",
      boxShadow: "0 6px 10px rgba(0, 0, 0, 0.15)",
    },
    cardHeader: {
      marginBottom: "1rem",
    },
    cardTitle: {
      fontSize: "1.5rem",
      fontWeight: "bold",
      color: "#2d3748",
    },
    cardContent: {
      lineHeight: "1.5",
      color: "#4a5568",
    },
    button: {
      marginTop: "1rem",
      display: "inline-block",
      backgroundColor: "#3182ce",
      color: "#fff",
      padding: "0.5rem 1rem",
      borderRadius: "0.5rem",
      textDecoration: "none",
      fontWeight: "500",
      textAlign: "center",
      marginRight: "1rem",
    },
    modal: {
      position: "fixed",
      top: "0",
      left: "0",
      right: "0",
      bottom: "0",
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: "1000",
    },
    modalContent: {
      backgroundColor: "#fff",
      padding: "2rem",
      borderRadius: "0.75rem",
      maxWidth: "600px",
      width: "90%",
      maxHeight: "90vh",
      overflow: "auto",
    },
    modalHeader: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "1.5rem",
    },
    modalTitle: {
      fontSize: "1.5rem",
      fontWeight: "bold",
      color: "#2d3748",
    },
    closeButton: {
      background: "none",
      border: "none",
      fontSize: "1.5rem",
      cursor: "pointer",
      color: "#4a5568",
    },
    '@media (minWidth: 640px)': {
      grid: {
        gridTemplateColumns: "repeat(2, 1fr)",
      },
    },
    '@media (minWidth: 1024px)': {
      grid: {
        gridTemplateColumns: "repeat(3, 1fr)",
      },
    },
  };

  return (
    <div style={styles.dashboard}>
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>Job Portal</h1>
          <Button onClick={() => navigate('/user-profile')}>My Profile</Button>
        </div>

        {userData && (
          <p style={styles.welcome}>Welcome, {userData.name}!</p>
        )}

<div className="p-4">
      {/* Search Bar */}
      <label htmlFor="job-search" className="block text-lg font-medium mb-2">
        Search Jobs:
      </label>
      <input
        id="job-search"
        type="text"
        value={searchQuery}
        onChange={handleSearchChange}
        placeholder="Search by title..."
        className="p-2 border rounded w-full mb-4"
      />

      {/* Dropdown for filtering */}
      <label htmlFor="job-filter" className="block text-lg font-medium mb-2">
        Filter by Titles:
      </label>
      <select
        id="job-filter"
        value={selectedTitle}
        onChange={handleTitleChange}
        className="p-2 border rounded w-full"
      >
        <option value="">All Titles</option>
        {jobTitles.map((title, index) => (
          <option key={index} value={title}>
            {title}
          </option>
        ))}
      </select>
    </div>


        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p style={{ color: "red" }}>{error}</p>
        ) : (
          <div style={styles.grid}>
            {filteredJobs.map((job) => (
              <div
                key={job._id}
                style={styles.card}
                onMouseEnter={(e) =>
                  e.currentTarget.setAttribute(
                    "style",
                    Object.entries({
                      ...styles.card,
                      ...styles.cardHover,
                    })
                      .map(([key, value]) => `${key}:${value}`)
                      .join(";")
                  )
                }
                onMouseLeave={(e) =>
                  e.currentTarget.setAttribute(
                    "style",
                    Object.entries(styles.card)
                      .map(([key, value]) => `${key}:${value}`)
                      .join(";")
                  )
                }
              >
                <div style={styles.cardHeader}>
                  <h2 style={styles.cardTitle}>{job.job_title}</h2>
                </div>
                <div style={styles.cardContent}>
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
                    style={{ ...styles.button, marginBottom: '0.5rem' }}
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
                      handleApplyClick(job);
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
                  <strong>Website:</strong>{" "}
                  <a
                    href={selectedCompany.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "#3182ce" }}
                  >
                    {selectedCompany.website}
                  </a>
                </p>
                <p>
                  <strong>Address:</strong> {selectedCompany.address}
                </p>
                <p>
                  <strong>Hiring Manager:</strong>{" "}
                  {selectedCompany.hiring_manager.name}
                </p>
                <p>
                  <strong>Contact Email:</strong>{" "}
                  {selectedCompany.hiring_manager.email}
                </p>
                <p>
                  <strong>Contact Phone:</strong>{" "}
                  {selectedCompany.hiring_manager.phone}
                </p>
              </div>
            </div>
          </div>
        )}
        {selectedJob && (
          <JobApplicationModal
            job={selectedJob}
            userData={userData}
            onClose={() => setSelectedJob(null)}
          />
        )}
      </div>
    </div>
  );
};

export default UserDashboard;
