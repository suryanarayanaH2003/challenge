import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Button from "./ui/button";
import JobApplicants from "./JobApplicants";
import DeleteJob from './DeleteJob';
import SavedJobs from './SavedJobs';

const AdminDashboard = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [adminData, setAdminData] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);
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
      clearTimeout(timeoutId); // Clear the timeout
      timeoutId = setTimeout(logoutUser, 600000); // Set timeout to 10 minutes
    };

    window.addEventListener('mousemove', resetTimer);
    window.addEventListener('keydown', resetTimer);
    window.addEventListener('click', resetTimer);
    window.addEventListener('scroll', resetTimer);

    // Start the timer
    resetTimer();

    const storedAdminData = localStorage.getItem('adminData');
    if (!storedAdminData) {
      navigate('/login-admin'); // Redirect to login if not logged in
      return;
    }

    setAdminData(JSON.parse(storedAdminData));
  }, [navigate]);

  useEffect(() => {
    const fetchJobs = async () => {
      if (!adminData?.email) return;

      try {
        const response = await axios.get("http://localhost:8000/jobs/", {
          headers: {
            'X-User-Email': adminData.email
          }
        });

        if (response.data.status === "success") {
          const sortedJobs = response.data.jobs || [];

          // Remove jobs with crossed deadlines
          const filteredJobs = sortedJobs.filter((job) => {
            const currentDate = new Date();
            const deadlineDate = new Date(job.deadline);
            if (deadlineDate < currentDate) {
              // Delete job if deadline passed
              deleteJob(job._id); // Ensure deletion via API
              return false; // Exclude from state
            }
            return true;
          });

          // Sort jobs by createdAt (newest first)
          filteredJobs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

          setJobs(filteredJobs);
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

  const deleteJob = async (jobId) => {
    try {
      const response = await axios.delete(`http://localhost:8000/jobs/${jobId}/delete/`, {
        headers: {
          'X-User-Email': adminData.email
        }
      });
      if (response.data.status === "success") {
        setJobs(jobs.filter(job => job._id !== jobId)); // Remove job from state
      } else {
        setError(response.data.message || "Failed to delete job.");
      }
    } catch (err) {
      setError("An error occurred while deleting the job.");
    }
  };

  const handleEditJob = async (job) => {
    navigate(`/editjob/${job._id}`, { state: { job } });
  };

  const handleLogout = (key) => {
    localStorage.removeItem(key); 
    navigate('/login-admin'); 
  };

  // Filter jobs based on search query
  const filteredJobs = jobs.filter(job =>
    job.job_title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.qualification?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const styles = {
    adminDashboard: {
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
    companyInfo: {
      marginBottom: "2rem",
      padding: "1.5rem",
      backgroundColor: "#fff",
      borderRadius: "0.75rem",
      boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
    },
    companyName: {
      fontSize: "1.5rem",
      fontWeight: "bold",
      color: "#2d3748",
      marginBottom: "0.5rem",
    },
    companyEmail: {
      color: "#4a5568",
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
    buttonContainer: {
      marginTop: "1rem",
      display: "flex",
      justifyContent: "flex-end",
    },
    searchInput: {
      width: '100%',
      padding: '0.75rem',
      marginBottom: '1rem',
      border: '1px solid #ccc',
      borderRadius: '4px',
      fontSize: '1rem',
    },
  };

  return (
    <div style={styles.adminDashboard}>
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>Admin Dashboard</h1>
          <div>
            <Button onClick={() => navigate("/saved-jobs")}>
              View Preview Jobs
            </Button>
            <Button onClick={() => navigate("/postjobs")}>
              Post New Job
            </Button>
            <Button onClick={() => handleLogout('adminData')}>
              Logout
            </Button>
          </div>
        </div>

        {adminData?.company && (
          <div style={styles.companyInfo}>
            <h2 style={styles.companyName}>{adminData.company.name}</h2>
            <p style={styles.companyEmail}>Admin Email: {adminData.email}</p>
          </div>
        )}

        <input
          style={styles.searchInput}
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
                    <p><strong>Location:</strong> {job.location}</p>
                    <p><strong>Qualification:</strong> {job.qualification}</p>
                    <p><strong>Skills:</strong> {job.required_skills_and_qualifications}</p>
                    <p><strong>Description:</strong> {job.job_description}</p>
                    <p><strong>Salary:</strong> {job.salary_range}</p>
                    <p><strong>Requirement Type:</strong> {job.employment_type}</p>
                    <p><strong>Deadline:</strong> {new Date(job.application_deadline).toLocaleDateString()}</p>
                  </div>
                  <div style={styles.buttonContainer}>
                    <Button onClick={() => handleEditJob(job)}>Edit Job</Button>
                    <DeleteJob jobId={job._id} adminData={adminData} onDeleteSuccess={(deletedJobId) => {
                      setJobs(jobs.filter(job => job._id !== deletedJobId));
                    }} />
                    <Button onClick={() => setSelectedJob(job)}>View Applicants</Button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {selectedJob && (
          <JobApplicants
            job={selectedJob}
            onClose={() => setSelectedJob(null)}
          />
        )}

        {showSavedJobs && (
          <SavedJobs
            adminEmail={adminData?.email}
            onClose={() => setShowSavedJobs(false)}
          />
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
