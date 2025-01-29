import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const EditJob = () => {
    const { jobId } = useParams();
    const [job, setJob] = useState({
        Job_title: '',
        location: '',
        qualification: '',
        job_description: '',
        required_skills_and_qualifications: '',
        salary_range: '',
        employment_type: '',
        application_deadline: ''
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchJobDetails = async () => {
            try {
                const storedAdminData = localStorage.getItem('adminData');
                if (!storedAdminData) {
                    navigate('/'); // Redirect if no admin data found
                    return;
                }
                const adminData = JSON.parse(storedAdminData);

                const response = await axios.get(`http://localhost:8000/job-details/${jobId}/`, {
                    headers: {
                        'X-User-Email': adminData.email
                    }
                });

                if (response.data.status === "success") {
                    setJob(response.data.job); // Populate the form with fetched job details
                } else {
                    setError(response.data.message || "Failed to fetch job details.");
                }
            } catch (err) {
                setError("An error occurred while fetching job data.");
            } finally {
                setLoading(false);
            }
        };

        fetchJobDetails();
    }, [jobId, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSuccessMessage(null); // Clear previous success message

        try {
            const storedAdminData = localStorage.getItem('adminData');
            if (!storedAdminData) {
                navigate('/'); // Redirect if no admin data found
                return;
            }
            const adminData = JSON.parse(storedAdminData);

            const response = await axios.put(`http://localhost:8000/jobs/${jobId}/edit/`, job, {
                headers: {
                    'X-User-Email': adminData.email
                }
            });

            if (response.data.status === "success") {
                setSuccessMessage("Job updated successfully!");
                setTimeout(() => {
                    navigate('/admindashboard'); // Redirect after 2 seconds
                }, 2000);
            } else {
                setError(response.data.message);
            }
        } catch (err) {
            setError("An error occurred while updating the job.");
        }
    };

    if (loading) return <p>Loading job details...</p>;

    return (
        <div style={styles.container}>
            <h2 style={styles.title}>Edit Job</h2>
            <form onSubmit={handleSubmit}>
                <input
                    style={styles.input}
                    type="text"
                    value={job.Job_title}
                    onChange={(e) => setJob({ ...job, Job_title: e.target.value })}
                    placeholder="Job Title"
                    required
                />
                <input
                    style={styles.input}
                    type="text"
                    value={job.location}
                    onChange={(e) => setJob({ ...job, location: e.target.value })}
                    placeholder="Location"
                    required
                />
                <input
                    style={styles.input}
                    type="text"
                    value={job.qualification}
                    onChange={(e) => setJob({ ...job, qualification: e.target.value })}
                    placeholder="Qualification"
                />
                <textarea
                    style={styles.input}
                    value={job.job_description}
                    onChange={(e) => setJob({ ...job, job_description: e.target.value })}
                    placeholder="Job Description"
                />
                <input
                    style={styles.input}
                    type="text"
                    value={job.required_skills_and_qualifications}
                    onChange={(e) => setJob({ ...job, required_skills_and_qualifications: e.target.value })}
                    placeholder="Required Skills"
                />
                <input
                    style={styles.input}
                    type="text"
                    value={job.salary_range}
                    onChange={(e) => setJob({ ...job, salary_range: e.target.value })}
                    placeholder="Salary Range"
                />
                <input
                    style={styles.input}
                    type="text"
                    value={job.employment_type}
                    onChange={(e) => setJob({ ...job, employment_type: e.target.value })}
                    placeholder="Employment Type"
                />
                <input
                    style={styles.input}
                    type="date"
                    value={job.application_deadline}
                    onChange={(e) => setJob({ ...job, application_deadline: e.target.value })}
                    placeholder="Application Deadline"
                />
                <button style={styles.button} type="submit">Update Job</button>
                {successMessage && <p style={{ color: 'green', ...styles.message }}>{successMessage}</p>}
                {error && <p style={{ color: 'red', ...styles.message }}>{error}</p>}
            </form>
        </div>
    );
};

// Styles
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
    message: {
        textAlign: 'center',
        marginTop: '1rem',
    },
};

export default EditJob;
