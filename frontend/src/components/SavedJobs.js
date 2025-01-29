import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Button from "./ui/button";
import JobApplicants from "./JobApplicants";
import DeleteJob from './DeleteJob';
import SavedJobs from './SavedJobs';

const SavedJob = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState(null);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);
  const [error, setError] = useState(null);
  const [adminData, setAdminData] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSavedJobs, setShowSavedJobs] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let timeoutId;

    const logoutUser = () => {
      localStorage.removeItem('adminData'); 
      navigate('/login-admin'); 
    };

    const resetTimer = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(logoutUser, 600000); 
    };

    window.addEventListener('mousemove', resetTimer);
    window.addEventListener('keydown', resetTimer);
    window.addEventListener('click', resetTimer);
    window.addEventListener('scroll', resetTimer);

    resetTimer();

    const storedAdminData = localStorage.getItem('adminData');
    if (!storedAdminData) {
      navigate('/login-admin'); 
      return;
    }

    setAdminData(JSON.parse(storedAdminData));
  }, [navigate]);

  // Fetch jobs from the backend
  useEffect(() => {
    const fetchJobs = async () => {
      if (!adminData?.email) return;
  
      try {
        const response = await axios.get("http://localhost:8000/saved-jobs/", {
          headers: {
            'X-User-Email': adminData.email
          }
        });
  
        if (response.data.status === "success") {
          let savedJobs = response.data.jobs || [];
  
          // Reverse the jobs array to have the last saved job first (LIFO)
          savedJobs = savedJobs.reverse();
  
          setJobs(savedJobs);
        } else {
          setError(response.data.message || "Failed to fetch jobs.");
        }
      } catch (err) {
        setError("An error occurred while fetching job data.");
      } finally {
        setLoading(false);
      }
    };
  
    fetchJobs();
  }, [adminData]);
  

  const publishJob = async (jobId) => {
    try {
        const response = await axios.put(`http://localhost:8000/jobs/${jobId}/publish/`, {}, {
            headers: {
                'X-User-Email': adminData.email
            }
        });

        if (response.data.status === "success") {
            alert("Job published successfully!");
        } else {
            setError(response.data.message || "Failed to publish job.");
        }
    } catch (error) {
        console.error("Error publishing job:", error);
        setError("An error occurred while publishing the job.");
    }
};

  // Filter jobs based on search query
  const filteredJobs = jobs.filter(job =>
    (job.job_title && job.job_title.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (job.location && job.location.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (job.qualification && job.qualification.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const styles = {
    SavedJob: {
      minHeight: "100vh",
      backgroundColor: "#f7f7f7",
      fontFamily: "'Roboto', sans-serif",
    },
    container: {
      maxWidth: "1200px",
      margin: "0 auto",
      padding: "3rem 2rem",
    },
    header: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "3rem",
      borderBottom: "2px solid #e0e0e0",
      paddingBottom: "1rem",
    },
    title: {
      fontSize: "2.2rem",
      fontWeight: "700",
      color: "#333",
    },
    searchInput: {
      padding: "0.8rem 1.2rem",
      border: "1px solid #ccc",
      borderRadius: "25px",
      fontSize: "1rem",
      width: "100%",
      marginBottom: "2rem",
      boxSizing: "border-box",
      transition: "0.3s ease-in-out",
    },
    searchInputFocus: {
      outline: "none",
      borderColor: "#3182ce",
    },
    grid: {
      display: "grid",
      gridTemplateColumns: "repeat(1, 1fr)",
      gap: "2rem",
    },
    card: {
      backgroundColor: "#fff",
      borderRadius: "12px",
      padding: "2rem",
      boxShadow: "0 10px 20px rgba(0, 0, 0, 0.05)",
      transition: "all 0.3s ease-in-out",
      cursor: "pointer",
      border: "1px solid #f1f1f1",
    },
    cardHover: {
      transform: "scale(1.03)",
      boxShadow: "0 15px 25px rgba(0, 0, 0, 0.1)",
    },
    cardHeader: {
      marginBottom: "1rem",
      borderBottom: "1px solid #e0e0e0",
      paddingBottom: "1rem",
    },
    cardTitle: {
      fontSize: "1.8rem",
      fontWeight: "600",
      color: "#444",
    },
    cardContent: {
      lineHeight: "1.6",
      color: "#555",
    },
    cardContentItem: {
      marginBottom: "0.8rem",
    },
    button: {
      marginTop: "1.2rem",
      backgroundColor: "#3182ce",
      color: "#fff",
      padding: "0.7rem 1.5rem",
      borderRadius: "30px",
      fontWeight: "500",
      cursor: "pointer",
      border: "none",
      boxShadow: "0 5px 10px rgba(0, 0, 0, 0.1)",
      transition: "0.3s",
    },
    buttonHover: {
      backgroundColor: "#2563eb",
    },
    buttonContainer: {
      marginTop: "1.5rem",
      display: "flex",
      justifyContent: "center",
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
    <div style={styles.SavedJob}>
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>Preview Jobs</h1>
          <div>
            <Button onClick={() => navigate("/admindashboard")}>Back to Dashboard</Button>
          </div>
        </div>

        <input
          style={{ ...styles.searchInput, ...(searchQuery ? styles.searchInputFocus : {}) }}
          type="text"
          placeholder="Search jobs..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p style={{ color: "red" }}>{error}</p>
        ) : (
          <div style={styles.grid}>
            {filteredJobs.length === 0 ? (
              <p>No jobs found.</p>
            ) : (
              filteredJobs.map((job) => (
                <div
                  key={job._id}
                  style={styles.card}
                  onClick={() => setSelectedJob(job)} // Open job details on the same page
                  onMouseEnter={(e) =>
                    e.currentTarget.setAttribute("style", Object.entries({ ...styles.card, ...styles.cardHover }).map(([key, value]) => `${key}:${value}`).join(";"))
                  }
                  onMouseLeave={(e) =>
                    e.currentTarget.setAttribute("style", Object.entries(styles.card).map(([key, value]) => `${key}:${value}`).join(";"))
                  }
                >
                  <div style={styles.cardHeader}>
                    <h2 style={styles.cardTitle}>{job.job_title}</h2>
                  </div>
                  <div style={styles.cardContent}>
                    <p style={styles.cardContentItem}>
                      <strong>Company:</strong> {job.company}
                    </p>
                    <p style={styles.cardContentItem}>
                      <strong>Location:</strong> {job.location}
                    </p>
                    <p style={styles.cardContentItem}>
                      <strong>Qualification:</strong> {job.qualification}
                    </p>
                    <p style={styles.cardContentItem}>
                      <strong>Job Description:</strong> {job.job_description}
                    </p>
                    <p style={styles.cardContentItem}>
                      <strong>Required Skills:</strong> {job.required_skills_and_qualifications}
                    </p>
                    <p style={styles.cardContentItem}>
                      <strong>Salary Range:</strong> {job.salary_range}
                    </p>
                    <p style={styles.cardContentItem}>
                      <strong>Employment Type:</strong> {job.employment_type}
                    </p>
                    <p style={styles.cardContentItem}>
                      <strong>Application Deadline:</strong> {job.application_deadline}
                    </p>
                  </div>
                  <div style={styles.buttonContainer}>
                    <button
                      style={styles.button}
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent click event from propagating
                        publishJob(job._id);
                      }}
                    >
                      Publish Job
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {selectedJob && (
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Job Details</h3>
            <p><strong>Job Title:</strong> {selectedJob.job_title}</p>
            <p><strong>Location:</strong> {selectedJob.location}</p>
            <p><strong>Qualification:</strong> {selectedJob.qualification}</p>
            <p><strong>Job Description:</strong> {selectedJob.job_description}</p>
            <p><strong>Required Skills:</strong> {selectedJob.required_skills_and_qualifications}</p>
            <p><strong>Salary Range:</strong> {selectedJob.salary_range}</p>
            <p><strong>Employment Type:</strong> {selectedJob.employment_type}</p>
            <p><strong>Application Deadline:</strong> {selectedJob.application_deadline}</p>
            <Button onClick={() => setSelectedJob(null)}>Close</Button>
          </div>
        )}

        {showSavedJobs && (
          <SavedJobs adminEmail={adminData?.email} onClose={() => setShowSavedJobs(false)} />
        )}
      </div>
    </div>
  );
};

export default SavedJob;
