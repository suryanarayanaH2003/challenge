import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const PortalDashboard = () => {
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [selectedCompany, setSelectedCompany] = useState(null);
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
            setLoading(true);
            const response = await axios.get('http://localhost:8000/portal-dashboard/');
            if (response.data.companies) {
                setCompanies(response.data.companies);
            } else {
                setCompanies([]);
            }
        } catch (error) {
            console.error('Error fetching companies:', error);
            setError('Failed to fetch companies');
        } finally {
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
                fetchCompanies(); // Refresh companies list
                setTimeout(() => setSuccessMessage(''), 3000);
            }
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to approve company');
            setTimeout(() => setError(''), 3000);
        }
    };

    const fetchCompanyDetails = async (companyId) => {
        try {
            const response = await axios.get(`http://localhost:8000/company/${companyId}/`);
            if (response.data.status === 'success' && response.data.company) {
                setSelectedCompany(response.data.company);
            } else {
                setError('Failed to fetch company details');
            }
        } catch (err) {
            console.error('Error fetching company details:', err);
            setError('An error occurred while fetching company details');
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
        modal: {
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
        },
        modalContent: {
            backgroundColor: '#ffffff',
            borderRadius: '0.75rem',
            padding: '2rem',
            maxWidth: '600px',
            width: '100%',
        },
        modalHeader: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid #e2e8f0',
            paddingBottom: '1rem',
            marginBottom: '1rem',
        },
        modalTitle: {
            fontSize: '1.5rem',
            fontWeight: 'bold',
            color: '#2d3748',
        },
        closeButton: {
            backgroundColor: 'transparent',
            color: '#000000',
            border: 'none',
            fontSize: '1.5rem',
            cursor: 'pointer',
        },
    };

    if (loading) {
        return (
            <div className="container mt-5">
                <div className="text-center">
                    <div className="spinner-border" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            </div>
        );
    }

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
                    {companies.map((company) => company && (
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
                                <h2 style={styles.cardTitle}>{company.name || 'Unnamed Company'}</h2>
                            </div>
                            <div style={styles.cardContent}>
                                {/* <p><strong>Website:</strong> {company.website || 'N/A'}</p> */}
                                <p><strong>Hiring Manager:</strong> {company.hiring_manager?.name || 'N/A'}</p>
                                <p><strong>Email:</strong> {company.hiring_manager?.email || 'N/A'}</p>
                                <p><strong>Phone:</strong> {company.hiring_manager?.phone || 'N/A'}</p>
                                <p><strong>Status:</strong> {company.status || 'N/A'}</p>
                            </div>
                            <div>
                                <a
                                    href="#"
                                    style={{ ...styles.button, marginRight: '0.5rem' }}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        if (company._id) {
                                            fetchCompanyDetails(company._id);
                                        }
                                    }}
                                >
                                    View Company Details
                                </a>
                                {company.status === 'pending' && (
                                    <button
                                        style={styles.button}
                                        onClick={() => handleApproval(company._id)}
                                    >
                                        Approve Company
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {companies.length === 0 && !loading && (
                    <div className="alert alert-info">
                        No companies found for review.
                    </div>
                )}

                {/* Company Details Modal */}
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
                                    <strong>Website:</strong>{' '}
                                    <a
                                        href={selectedCompany.website}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{ color: '#3182ce' }}
                                    >
                                        {selectedCompany.website}
                                    </a>
                                </p>
                                <p>
                                    <strong>Address:</strong> {selectedCompany.address}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PortalDashboard;