import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Button from "./ui/button";

import '../App.css'; // Update the path to point to the correct location

const PostJobs = () => {
  const navigate = useNavigate();
  const [adminData, setAdminData] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    location: "",
    qualification: "",
    job_description: "",
    required_skills_and_qualifications: "",
    salary_range: "",
    employment_type: "",  // Added this field
    application_deadline: "" // Added this field
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

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

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const validateForm = () => {
    // Check if any required field is empty
    for (const field in formData) {
      if (formData[field] === "") {
        setError(`Please fill in the ${field} field.`);
        return false;
      }
    }

    const currentDate = new Date();
    const deadlineDate = new Date(formData.application_deadline);
    if (deadlineDate <= currentDate) {
      setError("Application deadline must be greater than the current date.");
      return false;
    }

    setError("");
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return; // Stop the submission if validation fails
    }

    try {
      console.log('Submitting job with data:', formData);
      console.log('Admin data:', adminData);

      if (!adminData?.email) {
        setError("Admin email not found. Please log in again.");
        navigate('/login-admin');
        return;
      }

      // Transform the data to match backend expectations
      const jobData = {
        "Job_title": formData.title,
        location: formData.location,
        qualification: formData.qualification,
        job_description: formData.job_description,
        required_skills_and_qualifications: formData.required_skills_and_qualifications,
        salary_range: formData.salary_range,
        employment_type: formData.employment_type, // Ensure it's added
        application_deadline: formData.application_deadline // Ensure it's added
      };

      console.log('Transformed job data:', jobData);

      const response = await axios.post(
        "http://localhost:8000/postjobs/",
        jobData,
        {
          headers: {
            'X-User-Email': adminData.email,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          withCredentials: false  // Changed to false since we're not using cookies
        }
      );

      console.log('Response:', response.data);

      if (response.data.status === "success") {
        setSuccess("Job posted successfully!");
        alert("Job posted successfully!");
        // Clear form
        setFormData({
          title: "",
          location: "",
          qualification: "",
          job_description: "",
          required_skills_and_qualifications: "",
          salary_range: "",
          employment_type: "", // Clear this field
          application_deadline: "" // Clear this field
        });
        // Redirect to dashboard after 2 seconds
        setTimeout(() => {
          navigate("/admindashboard");
        }, 2000);

        // Call saveJob after posting
        await saveJob(response.data.jobId);
      } else {
        setError(response.data.message || "Failed to post job.");
      }
    } catch (err) {
      console.error('Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        headers: err.response?.headers,
        data: err.response?.config?.data
      });

      if (err.response?.status === 401) {
        setError("You are not authenticated. Please log in again.");
        navigate('/login-admin');
      } else if (err.response?.status === 500) {
        setError("Server error. Please try again later.");
      } else {
        setError(err.response?.data?.message || "An error occurred while posting the job. Please try again.");
      }
    }
  };

  const handleSaveJob = async (e) => {
    e.preventDefault();
    try {
      if (!validateForm()) {
        return;
      }

      const jobData = {
        "Job_title": formData.title,
        location: formData.location,
        qualification: formData.qualification,
        job_description: formData.job_description,
        required_skills_and_qualifications: formData.required_skills_and_qualifications,
        salary_range: formData.salary_range,
        employment_type: formData.employment_type,
        application_deadline: formData.application_deadline,
        published: false, 
      };

      const response = await axios.post(
        "http://localhost:8000/savejob/", // New endpoint for saving jobs
        jobData,
        {
          headers: {
            'X-User-Email': adminData.email,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
        }
      );

      if (response.data.status === "success") {
        setSuccess("Job saved successfully!");
        alert("Job saved successfully!");
        // Clear form
        setFormData({
          title: "",
          location: "",
          qualification: "",
          job_description: "",
          required_skills_and_qualifications: "",
          salary_range: "",
          employment_type: "",
          application_deadline: ""
        });
        // Redirect to dashboard after 2 seconds
        setTimeout(() => {
          navigate("/admindashboard");
        }, 2000);
      } else {
        setError(response.data.message || "Failed to save job.");
      }
    } catch (err) {
      console.error('Error saving job:', err);
    }
  };

  const saveJob = async (jobId) => {
    try {
      const response = await axios.post("http://localhost:8000/savejob", { jobId });
      if (response.data.status === "success") {
        alert("Job saved successfully!");
      } else {
        setError(response.data.message || "Failed to save job.");
      }
    } catch (err) {
    }
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  const styles = {
    container: {
      minHeight: "100vh",
      backgroundColor: "#f9fafb",
      padding: "2rem",
    },
    form: {
      maxWidth: "800px",
      margin: "0 auto",
      backgroundColor: "#ffffff",
      padding: "2rem",
      borderRadius: "0.75rem",
      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    },
    title: {
      fontSize: "1.875rem",
      fontWeight: "bold",
      color: "#1a202c",
      marginBottom: "2rem",
      textAlign: "center",
    },
    companyInfo: {
      marginBottom: "2rem",
      padding: "1rem",
      backgroundColor: "#f8fafc",
      borderRadius: "0.5rem",
      border: "1px solid #e2e8f0",
    },
    companyName: {
      fontSize: "1.25rem",
      fontWeight: "bold",
      color: "#2d3748",
      marginBottom: "0.5rem",
    },
    formGroup: {
      marginBottom: "1.5rem",
    },
    label: {
      display: "block",
      marginBottom: "0.5rem",
      color: "#4a5568",
      fontSize: "0.875rem",
      fontWeight: "500",
    },
    input: {
      width: "100%",
      padding: "0.75rem",
      borderRadius: "0.5rem",
      border: "1px solid #e2e8f0",
      fontSize: "1rem",
      color: "#1a202c",
    },
    textarea: {
      width: "100%",
      padding: "0.75rem",
      borderRadius: "0.5rem",
      border: "1px solid #e2e8f0",
      fontSize: "1rem",
      color: "#1a202c",
      minHeight: "150px",
      resize: "vertical",
    },
    error: {
      color: "#e53e3e",
      marginTop: "0.5rem",
      fontSize: "0.875rem",
    },
    success: {
      color: "#38a169",
      marginTop: "0.5rem",
      fontSize: "0.875rem",
    },
    buttonContainer: {
      display: "flex",
      gap: "1rem",
      marginTop: "2rem",
    },
  };

  const modalStyles = {
    overlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
    },
    content: {
      background: 'white',
      padding: '20px',
      borderRadius: '8px',
      boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
      textAlign: 'center',
    },
  };


  return (
    <div style={styles.container}>
      <form style={styles.form} onSubmit={handleSubmit}>
        <h1 style={styles.title}>Post a New Job</h1>

        {adminData?.company && (
          <div style={styles.companyInfo}>
            <h2 style={styles.companyName}>Posting as: {adminData.company.name}</h2>
          </div>
        )}

        <div style={styles.formGroup}>
          <label style={styles.label} htmlFor="title">Job_title</label>
          <input
            style={styles.input}
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
          />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label} htmlFor="location">Location</label>
          <input
            style={styles.input}
            type="text"
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            required
          />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label} htmlFor="qualification">Qualification Required</label>
          <input
            style={styles.input}
            type="text"
            id="qualification"
            name="qualification"
            value={formData.qualification}
            onChange={handleChange}
            required
          />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label} htmlFor="job_description">Job Description</label>
          <textarea
            style={styles.textarea}
            id="job_description"
            name="job_description"
            value={formData.job_description}
            onChange={handleChange}
            required
          />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label} htmlFor="required_skills_and_qualifications">Required Skills and Qualifications</label>
          <textarea
            style={styles.textarea}
            id="required_skills_and_qualifications"
            name="required_skills_and_qualifications"
            value={formData.required_skills_and_qualifications}
            onChange={handleChange}
            required
          />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label} htmlFor="salary_range">Salary Range</label>
          <input
            style={styles.input}
            type="text"
            id="salary_range"
            name="salary_range"
            value={formData.salary_range}
            onChange={handleChange}
            required
          />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label} htmlFor="employment_type">Employment Type</label>
          <select
            style={styles.input}
            id="employment_type"
            name="employment_type"
            value={formData.employment_type}
            onChange={handleChange}
            required
          >
            <option value="">Select Employment Type</option>
            <option value="Full-time">Full-time</option>
            <option value="Part-time">Part-time</option>
            <option value="Contract">Contract</option>
            <option value="Internship">Internship</option>
          </select>
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label} htmlFor="application_deadline">Application Deadline</label>
          <input
            style={styles.input}
            type="date"
            id="application_deadline"
            name="application_deadline"
            value={formData.application_deadline}
            onChange={handleChange}
            required
          />
        </div>

        {error && <p style={styles.error}>{error}</p>}
        {success && <p style={styles.success}>{success}</p>}

        <div style={styles.buttonContainer}>
          <Button type="submit" style={{ flex: 1 }} onClick={handleSubmit}>
            Post Job
          </Button>
          <Button type="button" style={{ flex: 1 }} onClick={handleSaveJob}>
            Save Job
          </Button>
          <Button
            type="button"
            onClick={() => navigate("/admindashboard")}
            style={{ backgroundColor: "#718096", flex: 1 }}
          >
            Cancel
          </Button>
        </div>
      </form>

      {modalOpen && (
        <div style={modalStyles.overlay}>
          <div style={modalStyles.content}>
            <h2>Success!</h2>
            <p>{modalMessage}</p>
            <button onClick={closeModal}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostJobs;
