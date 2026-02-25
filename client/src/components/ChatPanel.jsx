import { useState, useRef, useEffect } from 'react';
import './ChatPanel.css';

const ChatPanel = ({ messages, onSendMessage, currentUserId }) => {
    const [message, setMessage] = useState('');
    const messagesEndRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!message.trim()) return;
        onSendMessage(message.trim());
        setMessage('');
    };

    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="chat-panel">
            <div className="chat-messages">
                {messages.length === 0 && (
                    <div className="chat-empty">
                        <p>No messages yet. Start the conversation!</p>
                    </div>
                )}
                {messages.map((msg, idx) => (
                    <div
                        key={idx}
                        className={`chat-msg ${msg.isSystem ? 'system-msg' : msg.userId === currentUserId ? 'own-msg' : 'other-msg'}`}
                    >
                        {msg.isSystem ? (
                            <span className="system-text">{msg.message}</span>
                        ) : (
                            <>
                                <div className="msg-header">
                                    <span className="msg-author">{msg.userName}</span>
                                    <span className="msg-time">{formatTime(msg.timestamp)}</span>
                                </div>
                                <p className="msg-text">{msg.message}</p>
                            </>
                        )}
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>
            <form onSubmit={handleSubmit} className="chat-input-form">
                <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="chat-input"
                    maxLength={500}
                />
                <button type="submit" className="chat-send-btn" disabled={!message.trim()}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                        <line x1="22" y1="2" x2="11" y2="13" />
                        <polygon points="22,2 15,22 11,13 2,9" />
                    </svg>
                </button>
            </form>
        </div>
    );
};

export default ChatPanel;
