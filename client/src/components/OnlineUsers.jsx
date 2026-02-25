import './OnlineUsers.css';

const OnlineUsers = ({ users, hostId }) => {
    return (
        <div className="online-users">
            <div className="users-header">
                <h3>Online Users ({users.length})</h3>
            </div>
            <ul className="users-list">
                {users.map((user, idx) => (
                    <li key={user.socketId || idx} className="user-item">
                        <div className="user-avatar-sm">
                            {user.userName?.charAt(0).toUpperCase()}
                        </div>
                        <div className="user-info">
                            <span className="user-name-sm">{user.userName}</span>
                            {user.userId === hostId && <span className="host-tag">Host</span>}
                        </div>
                        <div className="online-dot"></div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default OnlineUsers;
