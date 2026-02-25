import { useState } from 'react';
import api from '../services/api';
import './FileUpload.css';

const FileUpload = ({ files, onFileUploaded, roomId }) => {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');

    const handleUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];
        if (!allowedTypes.includes(file.type)) {
            setError('Only images and PDF files are allowed');
            return;
        }

        if (file.size > 10 * 1024 * 1024) {
            setError('File size must be less than 10MB');
            return;
        }

        setError('');
        setUploading(true);

        try {
            const formData = new FormData();
            formData.append('file', file);

            const res = await api.post('/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            onFileUploaded(res.data.file);
        } catch (err) {
            setError(err.response?.data?.message || 'Upload failed');
        } finally {
            setUploading(false);
            e.target.value = '';
        }
    };

    const getServerUrl = () => {
        return import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
    };

    return (
        <div className="file-upload">
            <div className="upload-area">
                <label htmlFor="file-input" className={`upload-label ${uploading ? 'uploading' : ''}`}>
                    {uploading ? (
                        <div className="upload-spinner"></div>
                    ) : (
                        <>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="24" height="24">
                                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                                <polyline points="17,8 12,3 7,8" />
                                <line x1="12" y1="3" x2="12" y2="15" />
                            </svg>
                            <span>Upload File</span>
                            <span className="upload-hint">Images & PDF (max 10MB)</span>
                        </>
                    )}
                </label>
                <input
                    id="file-input"
                    type="file"
                    onChange={handleUpload}
                    accept="image/*,.pdf"
                    hidden
                    disabled={uploading}
                />
            </div>

            {error && <div className="upload-error">{error}</div>}

            <div className="files-list">
                {files.length === 0 && (
                    <p className="no-files">No files shared yet</p>
                )}
                {files.map((file, idx) => (
                    <a
                        key={idx}
                        href={`${getServerUrl()}${file.url}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="file-item"
                    >
                        <div className="file-icon">
                            {file.mimetype?.startsWith('image/') ? (
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                                    <circle cx="8.5" cy="8.5" r="1.5" />
                                    <polyline points="21,15 16,10 5,21" />
                                </svg>
                            ) : (
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                                    <polyline points="14,2 14,8 20,8" />
                                </svg>
                            )}
                        </div>
                        <div className="file-details">
                            <span className="file-name">{file.originalName}</span>
                            <span className="file-meta">by {file.sharedBy}</span>
                        </div>
                    </a>
                ))}
            </div>
        </div>
    );
};

export default FileUpload;
