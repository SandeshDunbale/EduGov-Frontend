import React, { useState } from 'react';
import './DocumentSubmission.css';
import API from '../../api/axios';
import toast, { Toaster } from 'react-hot-toast';
 
const DocumentSubmission = ({ prevStep, role, onComplete, userId }) => {
    const [idProof, setIdProof] = useState(null);
    const [certificate, setCertificate] = useState(null);
    const [loading, setLoading] = useState(false);
 
    // Validation Function
    const validateFile = (file) => {
        if (!file) return false;
       
        const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
        const allowedExtensions = /(\.pdf|\.jpg|\.jpeg|\.png)$/i;
 
        if (!allowedTypes.includes(file.type) || !allowedExtensions.exec(file.name)) {
            toast.error(`Invalid file: ${file.name}. Only PDF, JPG, JPEG, and PNG are allowed.`);
            return false;
        }
       
        // Optional: Limit size (e.g., 5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast.error(`File ${file.name} is too large. Max size is 5MB.`);
            return false;
        }
 
        return true;
    };
 
    const handleSubmit = async (e) => {
        e.preventDefault();
       
        if (!userId) {
            toast.error("Error: User ID not found. Please go back and try again.");
            return;
        }
 
        // Validate both files before starting the upload process
        if (!validateFile(idProof) || !validateFile(certificate)) {
            return;
        }
 
        setLoading(true);
 
        try {
            const uploadFile = async (file, type, docNum) => {
                const formData = new FormData();
                formData.append('file', file);
                formData.append('userId', userId);
                formData.append('docType', type);
                formData.append('docNum', docNum);
 
                return await API.post(`/api/documents/${role.toLowerCase()}/upload`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            };
 
            await uploadFile(idProof, 'ID_PROOF', 'ID-' + userId);
            await uploadFile(certificate, 'CERTIFICATE', 'CERT-' + userId);
 
            toast.success("Documents uploaded and registration completed!");
           
            setTimeout(() => {
                onComplete();
            }, 1500);
        } catch (error) {
            console.error("Upload failed:", error);
            toast.error("Upload failed: " + (error.response?.data?.message || "Server Error"));
        } finally {
            setLoading(false);
        }
    };
 
    return (
        <div className="doc-page-wrapper">
            {/* Toast container configured for top-right */}
            <Toaster
                position="top-right"
                toastOptions={{
                    className: 'custom-toast',
                    duration: 3000,
                }}
            />
 
            <div className="doc-sidebar">
                <div className="doc-sidebar-content">
                    <div className="doc-logo">🎓 EduGov</div>
                    <h1 className="doc-sidebar-title">Document Verification</h1>
                    <p className="doc-sidebar-text">Upload Your credentials</p>
                </div>
            </div>
 
            <div className="doc-main-content">
                <div className="doc-form-container">
                    <button type="button" className="doc-back-link" onClick={prevStep}>
                        &larr; Back to Details
                    </button>
                   
                    <h2 className="doc-form-header">Upload Documents</h2>
                    <p className="doc-role-info">Required files for <strong>{role}</strong> profile:</p>
 
                    <form onSubmit={handleSubmit} className="doc-upload-form">
                        <div className="doc-input-group">
                            <label className="doc-label">ID Proof (Identity Document)</label>
                            <input
                                type="file"
                                className="doc-file-input"
                                // Added 'accept' attribute to filter files in the file browser
                                accept=".pdf,.jpg,.jpeg,.png"
                                onChange={(e) => setIdProof(e.target.files[0])}
                                required
                            />
                        </div>
 
                        <div className="doc-input-group">
                            <label className="doc-label">Educational Certificate</label>
                            <input
                                type="file"
                                className="doc-file-input"
                                // Added 'accept' attribute
                                accept=".pdf,.jpg,.jpeg,.png"
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