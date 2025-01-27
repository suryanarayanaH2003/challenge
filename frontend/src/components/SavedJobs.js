import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Button from './ui/button';

const SavedJobs = ({ adminEmail, onClose }) => {
    const [savedJobs, setSavedJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchSavedJobs = async () => {
            setLoading(true); // Set loading to true before fetching
            setError(null); // Reset error state before fetching
            try {
                const response = await axios.get('http://localhost:8000/jobs/', {
                    headers: {
                        'X-User-Email': adminEmail
                    }
                });
                
                if (response.data.status === "success") {
                    setSavedJobs(response.data.savedJobs || []);
                } else {
                    setError(response.data.message || "Failed to fetch saved jobs.");
                }
            } catch (err) {
                // Log the error for debugging
                console.error("Error fetching saved jobs:", err);
                setError("An error occurred while fetching saved jobs. Please try again later.");
            } finally {
                setLoading(false); // Set loading to false after fetching
            }
        };

        fetchSavedJobs();
    }, [adminEmail]);

    const handleRemoveSavedJob = async (jobId) => {
        try {
            const response = await axios.delete(`http://localhost:8000/saved-jobs/${jobId}/`, {
                headers: {
                    'X-User-Email': adminEmail
                }
            });
            
            if (response.data.status === "success") {
                setSavedJobs(savedJobs.filter(job => job._id !== jobId));
            } else {
                setError(response.data.message || "Failed to remove saved job.");
            }
        } catch (err) {
            console.error("Error removing saved job:", err);
            setError("An error occurred while removing the saved job.");
        }
    };

    const handlePublishJob = async (jobId) => {
        try {
            const response = await axios.put(`http://localhost:8000/publishjob/${jobId}/`, {}, {
                headers: {
                    'X-User-Email': adminEmail
                }
            });
            
            if (response.data.status === "success") {
                setSavedJobs(savedJobs.filter(job => job._id !== jobId)); // Remove published job from saved jobs
            } else {
                setError(response.data.message || "Failed to publish job.");
            }
        } catch (err) {
            console.error("Error publishing job:", err);
            setError("An error occurred while publishing the job.");
        }
    };

    const handleEditJob = (job) => {
        // Navigate to the edit job page with job details
        window.location.href = `/editjob/${job._id}`; // Adjust this as per your routing
    };

    const styles = {
        modal: {
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            backgroundColor: '#fff',
            padding: '2rem',
            borderRadius: '0.75rem',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            maxWidth: '800px',
            width: '90%',
            maxHeight: '80vh',
            overflow: 'auto',
        },
        header: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.5rem',
        },
        title: {
            fontSize: '1.5rem',
            fontWeight: 'bold',
        },
        jobCard: {
            border: '1px solid #e2e8f0',
            borderRadius: '0.5rem',
            padding: '1rem',
            marginBottom: '1rem',
        },
        overlay: {
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 1000,
        },
    };

    return (
        <div style={styles.overlay}>
            <div style={styles.modal}>
                <div style={styles.header}>
                    <h2 style={styles.title}>Saved Jobs</h2>
                    <Button onClick={onClose}>Close</Button>
                </div>

                {loading ? (
                    <p>Loading saved jobs...</p>
                ) : error ? (
                    <p style={{ color: 'red' }}>{error}</p>
                ) : savedJobs.length === 0 ? (
                    <p>No saved jobs found.</p>
                ) : (
                    savedJobs.map((job) => (
                        <div key={job._id} style={styles.jobCard}>
                            <h3>{job.job_title}</h3>
                            <p><strong>Location:</strong> {job.location}</p>
                            <p><strong>Qualification:</strong> {job.qualification}</p>
                            <p><strong>Salary Range:</strong> {job.salary_range}</p>
                            <div>
                                <Button onClick={() => handleEditJob(job)}>Edit</Button>
                                <Button onClick={() => handleRemoveSavedJob(job._id)}>Delete</Button>
                                <Button onClick={() => handlePublishJob(job._id)}>Publish</Button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default SavedJobs; 