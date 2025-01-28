import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import JobApplicationModal from "./JobApplicationModal";
import Button from "./ui/button";
import { Search } from "lucide-react";

const UserDashboard = () => {
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userData, setUserData] = useState(null);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);
  const navigate = useNavigate();


  useEffect(() => {
    // Check if admin is logged in
    let timeoutId;

    const logoutUser = () => {
      localStorage.removeItem('user'); 
      navigate('/login-user');
    };

    const resetTimer = () => {
      clearTimeout(timeoutId); 
      timeoutId = setTimeout(logoutUser, 600000); 
    };

    window.addEventListener('mousemove', resetTimer);
    window.addEventListener('keydown', resetTimer);
    window.addEventListener('click', resetTimer);
    window.addEventListener('scroll', resetTimer);

    // Start the timer
    resetTimer();

    const storedUserData = localStorage.getItem('user');
    if (!storedUserData) {
      navigate('/login-user'); 
      return;
    }

    setUserData(JSON.parse(storedUserData));
  }, [navigate]);

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    location: "",
    salaryRange: "",
    employmentType: "",
    datePosted: ""
  });


  // Fetch data effect
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
          setFilteredJobs(response.data.jobs || []);
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

  // Filter jobs based on search term and filters
  useEffect(() => {
    let result = [...jobs];

    // Search term filter
    if (searchTerm) {
      result = result.filter(job =>
        (job.job_title && job.job_title.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (job.company && job.company.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Location filter
    if (filters.location) {
      result = result.filter(job =>
        job.location && job.location.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    // Salary range filter
    if (filters.salaryRange) {
      const [min, max] = filters.salaryRange.split('-').map(num => parseInt(num.replace(/\D/g, '')));
      result = result.filter(job => {
        const jobSalary = parseInt(job.salary_range.replace(/\D/g, ''));
        return jobSalary >= min && jobSalary <= max;
      });
    }

    // Employment type filter
    if (filters.employmentType) {
      result = result.filter(job =>
        job.employment_type === filters.employmentType
      );
    }

    // Date posted filter
    if (filters.datePosted) {
      const currentDate = new Date();
      const filterDays = parseInt(filters.datePosted);
      result = result.filter(job => {
        const jobDate = new Date(job.posted_date);
        const diffTime = Math.abs(currentDate - jobDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= filterDays;
      });
    }

    setFilteredJobs(result);
  }, [searchTerm, filters, jobs]);

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

  const handleApplyClick = (job) => {
    setSelectedJob(job);
  };

  const handleSaveJob = async (jobId) => {
    try {
      const response = await axios.post("http://localhost:8000/save-user-job", {
        job_id: jobId,
        user_id: userData._id, // Assuming userData contains the user ID
      });

      if (response.data.status === "success") {
        alert("Job saved successfully!");
      } else {
        setError(response.data.message || "Failed to save job.");
      }
    } catch (error) {
      console.error("Error saving job:", error);
      setError("An error occurred while saving the job.");
    }
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
    searchContainer: {
      marginBottom: "2rem",
      display: "flex",
      flexDirection: "column",
      gap: "1rem",
    },
    searchBar: {
      display: "flex",
      alignItems: "center",
      gap: "0.5rem",
      padding: "0.5rem",
      border: "1px solid #e2e8f0",
      borderRadius: "0.5rem",
      backgroundColor: "#fff",
    },
    searchInput: {
      flex: 1,
      border: "none",
      outline: "none",
      padding: "0.5rem",
      fontSize: "1rem",
    },
    filterContainer: {
      display: "flex",
      gap: "1rem",
      flexWrap: "wrap",
    },
    select: {
      padding: "0.5rem",
      borderRadius: "0.5rem",
      border: "1px solid #e2e8f0",
      backgroundColor: "#fff",
      minWidth: "150px",
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

        {/* Search and Filter Section */}
        <div style={styles.searchContainer}>
          <div style={styles.searchBar}>
            <Search size={20} />
            <input
              type="text"
              placeholder="Search jobs by title or company..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={styles.searchInput}
            />
          </div>

          <div style={styles.filterContainer}>
            <select
              value={filters.location}
              onChange={(e) => setFilters({ ...filters, location: e.target.value })}
              style={styles.select}
            >
              <option value="">All Locations</option>
              <option value="remote">Remote</option>
              <option value="onsite">On-site</option>
              <option value="hybrid">Hybrid</option>
            </select>

            <select
              value={filters.salaryRange}
              onChange={(e) => setFilters({ ...filters, salaryRange: e.target.value })}
              style={styles.select}
            >
              <option value="">All Salary Ranges</option>
              <option value="0-50000">$0 - $50,000</option>
              <option value="50000-100000">$50,000 - $100,000</option>
              <option value="100000-150000">$100,000 - $150,000</option>
              <option value="150000+">$150,000+</option>
            </select>

            <select
              value={filters.employmentType}
              onChange={(e) => setFilters({ ...filters, employmentType: e.target.value })}
              style={styles.select}
            >
              <option value="">All Employment Types</option>
              <option value="full-time">Full-time</option>
              <option value="part-time">Part-time</option>
              <option value="contract">Contract</option>
              <option value="internship">Internship</option>
            </select>

            <select
              value={filters.datePosted}
              onChange={(e) => setFilters({ ...filters, datePosted: e.target.value })}
              style={styles.select}
            >
              <option value="">All Dates</option>
              <option value="1">Last 24 hours</option>
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
            </select>
          </div>
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
                  <Button onClick={() => fetchCompanyDetails(job.company_id)}>View Company Details</Button>
                  <Button onClick={() => handleSaveJob(job._id)}>Save Job</Button>
                  <Button onClick={() => handleApplyClick(job)}>Apply</Button>
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