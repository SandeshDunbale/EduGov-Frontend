import React, { useState } from 'react';
import './DocumentSubmission.css';
import API from '../../api/axios';

// Added userId to props - make sure BasicDetails passes this!
const DocumentSubmission = ({ prevStep, role, onComplete, userId }) => {
    const [idProof, setIdProof] = useState(null);
    const [certificate, setCertificate] = useState(null);
    const [loading, setLoading] = useState(false);
  

   const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userId) {
        alert("Error: User ID not found. Please go back and try again.");
        return;
    }

    setLoading(true);

    try {
        // You have two files, so you need to make TWO calls, 
        // or update your Java controller to accept a List<MultipartFile>.
        // For now, let's upload them one by one to match your current Controller:

        const uploadFile = async (file, type, docNum) => {
            const formData = new FormData();
            formData.append('file', file); // Must match @RequestParam("file")
            formData.append('userId', userId);
            formData.append('docType', type);
            formData.append('docNum', docNum);

            // URL must include the role (student) as per your @PathVariable
            return await API.post(`/api/documents/${role.toLowerCase()}/upload`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
        };

        // Upload both
        await uploadFile(idProof, 'ID_PROOF', 'ID-' + userId);
        await uploadFile(certificate, 'CERTIFICATE', 'CERT-' + userId);

        alert("Documents uploaded and registration completed!");
        onComplete();
    } catch (error) {
        console.error("Upload failed:", error);
        alert("Upload failed: " + (error.response?.data?.message || "Server Error"));
    } finally {
        setLoading(false);
    }
};
    return (
        <div className="doc-page-wrapper">
            <div className="doc-sidebar">
                <div className="doc-sidebar-content">
                    <div className="doc-logo">🎓 EduGov</div>
                    <h1 className="doc-sidebar-title">Document Verification</h1>
                    <p className="doc-sidebar-text">Upload credentials for User ID: {userId}</p>
                </div>
            </div>

            <div className="doc-main-content">
                <div className="doc-form-container">
                    <button type="button" className="doc-back-link" onClick={prevStep}>
                        ← Back to Details
                    </button>
                    
                    <h2 className="doc-form-header">Upload Documents</h2>
                    <p className="doc-role-info">Required files for <strong>{role}</strong> profile:</p>

                    <form onSubmit={handleSubmit} className="doc-upload-form">
                        <div className="doc-input-group">
                            <label className="doc-label">ID Proof (Identity Document)</label>
                            <input 
                                type="file" 
                                className="doc-file-input" 
                                onChange={(e) => setIdProof(e.target.files[0])} 
                                required 
                            />
                        </div>

                        <div className="doc-input-group">
                            <label className="doc-label">Educational Certificate</label>
                            <input 
                                type="file" 
                                className="doc-file-input" 
                                onChange={(e) => setCertificate(e.target.files[0])} 
                                required 
                            />
                        </div>

                        <button type="submit" className="doc-submit-btn" disabled={loading}>
                            {loading ? "Processing..." : "Complete Registration"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default DocumentSubmission;