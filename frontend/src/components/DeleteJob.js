import React from 'react';
import axios from 'axios';

const DeleteJob = ({ jobId, adminData, onDeleteSuccess }) => {
    const handleDelete = async () => {
        try {
            const response = await axios.delete(`http://localhost:8000/jobs/${jobId}/delete/`, {
                headers: {
                    'X-User-Email': adminData?.email // Use the passed adminData
                }
            });
            if (response.data.status === "success") {
                onDeleteSuccess(jobId); // Call the success callback
            } else {
                alert(response.data.message || "Failed to delete job.");
            }
        } catch (error) {
            alert("An error occurred while deleting the job.");
        }
    };

    return (
        <button onClick={handleDelete}>Delete Job</button>
    );
};

export default DeleteJob;   