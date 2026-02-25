import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import useSocket from '../hooks/useSocket';
import api from '../services/api';
import Canvas from '../components/Canvas';
import Toolbar from '../components/Toolbar';
import ChatPanel from '../components/ChatPanel';
import OnlineUsers from '../components/OnlineUsers';
import FileUpload from '../components/FileUpload';
import ScreenShare from '../components/ScreenShare';
import ThemeToggle from '../components/ThemeToggle';
import LeaveModal from '../components/LeaveModal';
import './Whiteboard.css';

const Whiteboard = () => {
    const { roomId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { socket, emit, on, off } = useSocket(roomId, user?._id, user?.name);

    const [tool, setTool] = useState('pencil');
    const [color, setColor] = useState('#ffffff');
    const [brushSize, setBrushSize] = useState(3);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [messages, setMessages] = useState([]);
    const [sharedFiles, setSharedFiles] = useState([]);
    const [showLeaveModal, setShowLeaveModal] = useState(false);
    const [room, setRoom] = useState(null);
    const [rightPanel, setRightPanel] = useState('chat');
    const canvasRef = useRef(null);

    // Load room data
    useEffect(() => {
        const loadRoom = async () => {
            try {
                const res = await api.get(`/rooms/${roomId}`);
                setRoom(res.data.room);
            } catch {
                navigate('/dashboard');
            }
        };
        loadRoom();
    }, [roomId, navigate]);

    // Load chat messages
    useEffect(() => {
        const loadMessages = async () => {
            try {
                const res = await api.get(`/chat/${roomId}`);
                setMessages(res.data.messages || []);
            } catch (err) {
                console.error('Failed to load messages:', err);
            }
        };
        loadMessages();
    }, [roomId]);

    // Socket event listeners
    useEffect(() => {
        if (!socket.current) return;

        const handleOnlineUsers = (users) => setOnlineUsers(users);
        const handleChatMessage = (msg) => setMessages(prev => [...prev, msg]);
        const handleUserJoined = (data) => {
            setMessages(prev => [...prev, {
                message: data.message,
                userName: 'System',
                timestamp: new Date(),
                isSystem: true
            }]);
        };
        const handleUserLeft = (data) => {
            setMessages(prev => [...prev, {
                message: data.message,
                userName: 'System',
                timestamp: new Date(),
                isSystem: true
            }]);
        };
        const handleFileShared = ({ file, userName }) => {
            setSharedFiles(prev => [...prev, { ...file, sharedBy: userName }]);
            setMessages(prev => [...prev, {
                message: `${userName} shared a file: ${file.originalName}`,
                userName: 'System',
                timestamp: new Date(),
                isSystem: true
            }]);
        };

        on('online-users', handleOnlineUsers);
        on('chat-message', handleChatMessage);
        on('user-joined', handleUserJoined);
        on('user-left', handleUserLeft);
        on('file-shared', handleFileShared);

        return () => {
            off('online-users', handleOnlineUsers);
            off('chat-message', handleChatMessage);
            off('user-joined', handleUserJoined);
            off('user-left', handleUserLeft);
            off('file-shared', handleFileShared);
        };
    }, [socket.current, on, off]);

    const handleSendMessage = useCallback((message) => {
        emit('chat-message', {
            roomId,
            userId: user._id,
            userName: user.name,
            message
        });
    }, [emit, roomId, user]);

    const handleClearBoard = useCallback(() => {
        if (room?.hostId?._id === user._id || room?.hostId === user._id) {
            emit('clear-board', { roomId, userId: user._id });
            if (canvasRef.current) canvasRef.current.clearCanvas();
        }
    }, [emit, roomId, user, room]);

    const handleUndo = useCallback(() => {
        if (canvasRef.current) canvasRef.current.undo();
        emit('undo', { roomId, userId: user._id });
    }, [emit, roomId, user]);

    const handleRedo = useCallback(() => {
        if (canvasRef.current) canvasRef.current.redo();
        emit('redo', { roomId, userId: user._id });
    }, [emit, roomId, user]);

    const handleSaveSnapshot = useCallback(async () => {
        if (canvasRef.current) {
            const imageData = canvasRef.current.getSnapshot();
            try {
                await api.post(`/whiteboard/${roomId}/snapshot`, { imageData });
                // Trigger download
                const link = document.createElement('a');
                link.download = `whiteboard-${roomId}-${Date.now()}.png`;
                link.href = imageData;
                link.click();
            } catch (err) {
                console.error('Failed to save snapshot:', err);
            }
        }
    }, [roomId]);

    const handleLeave = useCallback(async () => {
        try {
            await api.post('/rooms/leave', { roomId });
        } catch (err) {
            console.error('Error leaving room:', err);
        }
        navigate('/dashboard');
    }, [roomId, navigate]);

    const handleFileUploaded = useCallback((file) => {
        emit('file-shared', { roomId, file, userName: user.name });
        setSharedFiles(prev => [...prev, { ...file, sharedBy: user.name }]);
    }, [emit, roomId, user]);

    const handleShareLink = useCallback(() => {
        const link = `${window.location.origin}/whiteboard/${roomId}`;
        navigator.clipboard.writeText(link).then(() => {
            alert('Room link copied to clipboard!');
        });
    }, [roomId]);

    const isHost = room?.hostId?._id === user?._id || room?.hostId === user?._id;

    return (
        <div className="whiteboard-container">
            {/* Top Bar */}
            <header className="wb-header">
                <div className="wb-header-left">
                    <div className="room-badge">
                        <span className="room-label">Room</span>
                        <span className="room-id">{roomId}</span>
                        <button className="btn-copy" onClick={handleShareLink} title="Copy room link">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                                <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
                                <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
                            </svg>
                        </button>
                    </div>
                    <div className="participant-badge">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                            <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4-4v2" />
                            <circle cx="9" cy="7" r="4" />
                            <path d="M23 21v-2a4 4 0 00-3-3.87" />
                            <path d="M16 3.13a4 4 0 010 7.75" />
                        </svg>
                        <span>{onlineUsers.length} online</span>
                    </div>
                    {isHost && <span className="host-badge">Host</span>}
                </div>
                <div className="wb-header-right">
                    <button className="btn-save" onClick={handleSaveSnapshot} title="Save as image">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                            <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
                            <polyline points="17,21 17,13 7,13 7,21" />
                            <polyline points="7,3 7,8 15,8" />
                        </svg>
                    </button>
                    <button className="btn-leave" onClick={() => setShowLeaveModal(true)}>
                        Leave Room
                    </button>
                </div>
            </header>

            <div className="wb-body">
                {/* Left Sidebar - Toolbar */}
                <Toolbar
                    tool={tool}
                    setTool={setTool}
                    color={color}
                    setColor={setColor}
                    brushSize={brushSize}
                    setBrushSize={setBrushSize}
                    onUndo={handleUndo}
                    onRedo={handleRedo}
                    onClear={handleClearBoard}
                    isHost={isHost}
                />

                {/* Center - Canvas */}
                <div className="wb-canvas-area">
                    <Canvas
                        ref={canvasRef}
                        tool={tool}
                        color={color}
                        brushSize={brushSize}
                        roomId={roomId}
                        socket={socket}
                        emit={emit}
                        on={on}
                        off={off}
                    />
                </div>

                {/* Right Sidebar */}
                <div className="wb-right-sidebar">
                    <div className="sidebar-tabs">
                        <button
                            className={`sidebar-tab ${rightPanel === 'chat' ? 'active' : ''}`}
                            onClick={() => setRightPanel('chat')}
                        >
                            Chat
                        </button>
                        <button
                            className={`sidebar-tab ${rightPanel === 'users' ? 'active' : ''}`}
                            onClick={() => setRightPanel('users')}
                        >
                            Users
                        </button>
                        <button
                            className={`sidebar-tab ${rightPanel === 'files' ? 'active' : ''}`}
                            onClick={() => setRightPanel('files')}
                        >
                            Files
                        </button>
                    </div>

                    <div className="sidebar-content">
                        {rightPanel === 'chat' && (
                            <ChatPanel
                                messages={messages}
                                onSendMessage={handleSendMessage}
                                currentUserId={user?._id}
                            />
                        )}
                        {rightPanel === 'users' && (
                            <OnlineUsers users={onlineUsers} hostId={room?.hostId?._id || room?.hostId} />
                        )}
                        {rightPanel === 'files' && (
                            <FileUpload
                                files={sharedFiles}
                                onFileUploaded={handleFileUploaded}
                                roomId={roomId}
                            />
                        )}
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <footer className="wb-footer">
                <ScreenShare roomId={roomId} socket={socket} emit={emit} on={on} off={off} />
                <ThemeToggle />
            </footer>

            {/* Leave Modal */}
            {showLeaveModal && (
                <LeaveModal
                    onSave={async () => {
                        await handleSaveSnapshot();
                        handleLeave();
                    }}
                    onLeave={handleLeave}
                    onCancel={() => setShowLeaveModal(false)}
                />
            )}
        </div>
    );
};

export default Whiteboard;
