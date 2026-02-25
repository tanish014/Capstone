import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import './Dashboard.css';

const Dashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [roomId, setRoomId] = useState('');
    const [roomName, setRoomName] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showJoin, setShowJoin] = useState(false);

    const handleCreateRoom = async () => {
        setError('');
        setLoading(true);
        try {
            const res = await api.post('/rooms/create', { name: roomName || 'Untitled Room' });
            navigate(`/whiteboard/${res.data.room.roomId}`);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create room');
        } finally {
            setLoading(false);
        }
    };

    const handleJoinRoom = async (e) => {
        e.preventDefault();
        setError('');
        if (!roomId.trim()) {
            setError('Please enter a Room ID');
            return;
        }
        setLoading(true);
        try {
            await api.post('/rooms/join', { roomId: roomId.trim().toUpperCase() });
            navigate(`/whiteboard/${roomId.trim().toUpperCase()}`);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to join room');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="dashboard-container">
            <div className="dashboard-bg-shapes">
                <div className="shape shape-1"></div>
                <div className="shape shape-2"></div>
            </div>

            <nav className="dashboard-nav">
                <div className="nav-brand">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="28" height="28">
                        <rect x="3" y="3" width="18" height="18" rx="2" />
                        <path d="M8 12h8M12 8v8" />
                    </svg>
                    <span>CollabBoard</span>
                </div>
                <div className="nav-user">
                    <span className="user-avatar">{user?.name?.charAt(0).toUpperCase()}</span>
                    <span className="user-name">{user?.name}</span>
                    <button onClick={logout} className="btn-logout">Logout</button>
                </div>
            </nav>

            <main className="dashboard-main">
                <div className="dashboard-hero">
                    <h1>Your Whiteboard Workspace</h1>
                    <p>Create a new room or join an existing one to start collaborating in real-time.</p>
                </div>

                {error && <div className="dashboard-error">{error}</div>}

                <div className="dashboard-actions">
                    <div className="action-card create-card">
                        <div className="card-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10" />
                                <path d="M12 8v8M8 12h8" />
                            </svg>
                        </div>
                        <h2>Create Room</h2>
                        <p>Start a new collaborative whiteboard session</p>
                        <input
                            type="text"
                            placeholder="Room Name (optional)"
                            value={roomName}
                            onChange={(e) => setRoomName(e.target.value)}
                            className="action-input"
                        />
                        <button onClick={handleCreateRoom} className="action-btn create-btn" disabled={loading}>
                            {loading ? 'Creating...' : 'Create New Room'}
                        </button>
                    </div>

                    <div className="action-card join-card">
                        <div className="card-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4M10 17l5-5-5-5M15 12H3" />
                            </svg>
                        </div>
                        <h2>Join Room</h2>
                        <p>Enter a Room ID to join an existing session</p>
                        <form onSubmit={handleJoinRoom}>
                            <input
                                type="text"
                                placeholder="Enter Room ID (e.g. A1B2C3D4)"
                                value={roomId}
                                onChange={(e) => setRoomId(e.target.value.toUpperCase())}
                                className="action-input"
                                maxLength={8}
                            />
                            <button type="submit" className="action-btn join-btn" disabled={loading}>
                                {loading ? 'Joining...' : 'Join Room'}
                            </button>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
