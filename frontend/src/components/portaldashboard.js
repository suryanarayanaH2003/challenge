import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const PortalDashboard = () => {
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const navigate = useNavigate();

    // Check if admin is logged in
    useEffect(() => {
        const admin = localStorage.getItem('portalAdmin');
        if (!admin) {
            navigate('/portal-login');
        }
    }, [navigate]);

    // Fetch companies data
    const fetchCompanies = async () => {
        try {
            const response = await axios.get('http://localhost:8000/portal-dashboard/');
            setCompanies(response.data.companies);
            setLoading(false);
        } catch (error) {
            setError('Failed to fetch companies');
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCompanies();
    }, []);

    // Handle company approval
    const handleApproval = async (companyId) => {
        try {
            const response = await axios.post('http://localhost:8000/portal-dashboard/', {
                company_id: companyId,
                status: 'approved'
            });

            if (response.data.status === 'success') {
                setSuccessMessage('Company approved successfully');
                // Refresh companies list
                fetchCompanies();
                // Clear success message after 3 seconds
                setTimeout(() => setSuccessMessage(''), 3000);
            }
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to approve company');
            setTimeout(() => setError(''), 3000);
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
    };

    if (loading) return (
        <div className="container mt-5">
            <div className="text-center">
                <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        </div>
    );

    return (
        <div style={styles.dashboard}>
            <div style={styles.container}>
                <div style={styles.header}>
                    <h2 style={styles.title}>Company Approval Dashboard</h2>
                    <button onClick={() => navigate('/portal-login')} className="btn btn-danger">
                        Logout
                    </button>
                </div>

                {error && (
                    <div className="alert alert-danger alert-dismissible fade show" role="alert">
                        {error}
                        <button type="button" className="btn-close" onClick={() => setError('')}></button>
                    </div>
                )}
                
                {successMessage && (
                    <div className="alert alert-success alert-dismissible fade show" role="alert">
                        {successMessage}
                        <button type="button" className="btn-close" onClick={() => setSuccessMessage('')}></button>
                    </div>
                )}

                <div style={styles.grid}>
                    {companies.map((company) => (
                        <div
                            key={company._id}
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
                                <h2 style={styles.cardTitle}>{company.name}</h2>
                            </div>
                            <div style={styles.cardContent}>
                                <p><strong>Website:</strong> {company.website}</p>
                                <p><strong>Hiring Manager:</strong> {company.hiring_manager.name}</p>
                                <p><strong>Email:</strong> {company.hiring_manager.email}</p>
                                <p><strong>Phone:</strong> {company.hiring_manager.phone}</p>
                                <p><strong>Status:</strong> {company.status}</p>
                            </div>
                            {company.status === 'pending' && (
                                <button
                                    style={styles.button}
                                    onClick={() => handleApproval(company._id)}
                                >
                                    Approve Company
                                </button>
                            )}
                        </div>
                    ))}
                </div>

                {companies.length === 0 && (
                    <div className="alert alert-info">
                        No companies found for review.
                    </div>
                )}
            </div>
        </div>
    );
};

export default PortalDashboard;