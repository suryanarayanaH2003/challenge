import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Button from "./ui/button";
import JobApplicants from "./JobApplicants";

const AdminDashboard = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [adminData, setAdminData] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if admin is logged in
    let timeoutId;
  
    const logoutUser = () => {
      window.location.href = "{% url 'logout' %}"; // Redirect to logout URL
    };
  
    const resetTimer = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(logoutUser, 30000); // 30 seconds
    };
  
    // Event listeners for user activity
    window.addEventListener('mousemove', resetTimer);
    window.addEventListener('keydown', resetTimer);
    window.addEventListener('click', resetTimer);
    window.addEventListener('scroll', resetTimer);
  
    // Start the timer
    resetTimer();
    
    const storedAdminData = localStorage.getItem('adminData');
    if (!storedAdminData) {
      navigate('');
      return;
    }

    setAdminData(JSON.parse(storedAdminData));
  }, [navigate]);

  // Fetch jobs from the backend
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
          setJobs(response.data.jobs || []);
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
  };

  return (
    <div style={styles.adminDashboard}>
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>Admin Dashboard</h1>
          <Button onClick={() => navigate("/postjobs")}>
            Post New Job
          </Button>
        </div>

        {adminData?.company && (
          <div style={styles.companyInfo}>
            <h2 style={styles.companyName}>{adminData.company.name}</h2>
            <p style={styles.companyEmail}>Admin Email: {adminData.email}</p>
          </div>
        )}

        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p style={{ color: "red" }}>{error}</p>
        ) : (
          <div style={styles.grid}>
            {jobs.length === 0 ? (
              <p>No jobs posted yet.</p>
            ) : (
              jobs.map((job) => (
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
                      <strong>Location:</strong> {job.location}
                    </p>
                    <p>
                      <strong>Qualification:</strong> {job.qualification}
                    </p>
                    <p>
                      <strong>Skills:</strong> {job.required_skills_and_qualifications}
                    </p>
                    <p>
                      <strong>Description:</strong> {job.job_description}
                    </p>
                    <p>
                      <strong>Salary:</strong> {job.salary_range}
                    </p>
                  </div>
                  <div style={styles.buttonContainer}>
                    <Button onClick={() => setSelectedJob(job)}>
                      View Applicants
                    </Button>
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
      </div>
    </div>
  );
};

export default AdminDashboard;
