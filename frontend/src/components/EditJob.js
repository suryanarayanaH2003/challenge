import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const EditJob = () => {
    const { jobId } = useParams();
    const [job, setJob] = useState({
        job_title: '',
        location: '',
        qualification: '',
        job_description: '',
        required_skills_and_qualifications: '',
        salary_range: ''
    });
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null); // State for success message
    const [adminData, setAdminData] = useState(null);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const storedAdminData = localStorage.getItem('adminData');
        if (storedAdminData) {
            setAdminData(JSON.parse(storedAdminData));
        } else {
            navigate(''); // Redirect if admin data is not found
        }
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
              setJob(response.data.jobs || []);
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSuccessMessage(null); // Clear previous success message
        try {
            const response = await axios.put(`http://localhost:8000/jobs/${jobId}/edit/`, job, {
                headers: {
                    'X-User-Email': adminData?.email
                }
            });
            if (response.data.status === "success") {
                setSuccessMessage("Job updated successfully!"); // Set success message
                setTimeout(() => {
                    navigate('/admindashboard'); // Redirect to Admin Dashboard after a short delay
                }, 2000); // Redirect after 2 seconds
            } else {
                setError(response.data.message);
            }
        } catch (err) {
            console.error("Error updating job:", err);
            setError("An error occurred while updating the job.");
        }
    };

    // Inline styles
    const styles = {
        container: {
            maxWidth: '600px',
            margin: '2rem auto',
            padding: '2rem',
            backgroundColor: '#f9f9f9',
            borderRadius: '8px',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
        },
        title: {
            textAlign: 'center',
            marginBottom: '1.5rem',
            color: '#333',
        },
        input: {
            width: '100%',
            padding: '0.75rem',
            marginBottom: '1rem',
            border: '1px solid #ccc',
            borderRadius: '4px',
            fontSize: '1rem',
        },
        button: {
            width: '100%',
            padding: '0.75rem',
            backgroundColor: '#3182ce',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '1rem',
            cursor: 'pointer',
            transition: 'background-color 0.3s',
        },
        buttonHover: {
            backgroundColor: '#2b6cb0',
        },
        message: {
            textAlign: 'center',
            marginTop: '1rem',
        },
    };

    return (
        <div style={styles.container}>
            <h2 style={styles.title}>Edit Job</h2>
            <form onSubmit={handleSubmit}>
                <input
                    style={styles.input}
                    type="text"
                    value={job.job_title || ''}
                    onChange={(e) => setJob({ ...job, job_title: e.target.value })}
                    placeholder="Job Title"
                    required
                />
                <input
                    style={styles.input}
                    type="text"
                    value={job.location || ''}
                    onChange={(e) => setJob({ ...job, location: e.target.value })}
                    placeholder="Location"
                    required
                />
                <input
                    style={styles.input}
                    type="text"
                    value={job.qualification || ''}
                    onChange={(e) => setJob({ ...job, qualification: e.target.value })}
                    placeholder="Qualification"
                    required
                />
                <textarea
                    style={styles.input}
                    value={job.job_description || ''}
                    onChange={(e) => setJob({ ...job, job_description: e.target.value })}
                    placeholder="Job Description"
                    required
                />
                <input
                    style={styles.input}
                    type="text"
                    value={job.required_skills_and_qualifications || ''}
                    onChange={(e) => setJob({ ...job, required_skills_and_qualifications: e.target.value })}
                    placeholder="Required Skills"
                    required
                />
                <input
                    style={styles.input}
                    type="text"
                    value={job.salary_range || ''}
                    onChange={(e) => setJob({ ...job, salary_range: e.target.value })}
                    placeholder="Salary Range"
                    required
                />
                <button style={styles.button} type="submit">Update Job</button>
                {successMessage && <p style={{ color: 'green', ...styles.message }}>{successMessage}</p>} {/* Display success message */}
                {error && <p style={{ color: 'red', ...styles.message }}>{error}</p>} {/* Display error message */}
            </form>
        </div>
    );
};

export default EditJob; 