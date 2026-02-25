import './LeaveModal.css';

const LeaveModal = ({ onSave, onLeave, onCancel }) => {
    return (
        <div className="modal-overlay" onClick={onCancel}>
            <div className="modal-card" onClick={(e) => e.stopPropagation()}>
                <div className="modal-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="40" height="40">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="12" />
                        <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                </div>
                <h2>Leave Room?</h2>
                <p>Would you like to save your whiteboard before leaving?</p>
                <div className="modal-actions">
                    <button className="modal-btn save-btn" onClick={onSave}>
                        Save & Leave
                    </button>
                    <button className="modal-btn leave-btn" onClick={onLeave}>
                        Leave Without Saving
                    </button>
                    <button className="modal-btn cancel-btn" onClick={onCancel}>
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LeaveModal;
