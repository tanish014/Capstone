# 🎨 Real-Time Collaborative Whiteboard

A full-stack collaborative whiteboard application — think **Zoom + Miro** — built with the MERN stack and Socket.io.

## ✨ Features

- **JWT Authentication** — Register, Login, Logout with bcrypt hashing
- **Room System** — Create rooms (unique ID), join by ID, host/participant roles
- **Whiteboard Canvas** — Pencil, eraser, color picker, brush size, undo/redo, save snapshot
- **Real-Time Sync** — Socket.io for live drawing, erasing, chat, and presence
- **Chat System** — In-room messaging persisted to MongoDB
- **Screen Sharing** — WebRTC-powered screen sharing
- **File Upload** — Share images/PDFs inside a room
- **Dark/Light Mode** — Theme toggle saved to user preferences
- **Responsive UI** — Works on desktop and mobile

## 📁 Project Structure

```
capstonr/
├── server/                   # Express.js Backend
│   ├── controllers/          # Auth, Room, Whiteboard, Chat, Upload
│   ├── models/               # User, Room, WhiteboardSession
│   ├── routes/               # API routes
│   ├── middleware/            # JWT auth middleware
│   ├── sockets/              # Socket.io event handler
│   ├── uploads/              # Uploaded files
│   ├── server.js             # Entry point
│   ├── .env                  # Environment variables
│   └── package.json
├── client/                   # React + Vite Frontend
│   ├── src/
│   │   ├── components/       # Canvas, Toolbar, ChatPanel, etc.
│   │   ├── pages/            # Login, Register, Dashboard, Whiteboard
│   │   ├── context/          # AuthContext
│   │   ├── hooks/            # useSocket
│   │   ├── services/         # Axios API service
│   │   └── main.jsx
│   └── package.json
└── README.md
```

## 🚀 Setup & Run

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)

### 1. Clone and Install

```bash
# Backend
cd server
npm install

# Frontend
cd ../client
npm install
```

### 2. Configure Environment

Copy `server/.env.example` to `server/.env` and edit:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/whiteboard
JWT_SECRET=your_secret_key
CLIENT_URL=http://localhost:5173
```

### 3. Run Development Servers

```bash
# Terminal 1 — Backend
cd server
npm run dev

# Terminal 2 — Frontend
cd client
npm run dev
```

Open **http://localhost:5173** in your browser.

## 🌐 Deployment

### Backend (Render)
1. Push `server/` to a Git repo
2. Create a **Web Service** on Render
3. Set build command: `npm install`
4. Set start command: `node server.js`
5. Add environment variables (MONGO_URI, JWT_SECRET, CLIENT_URL)

### Frontend (Vercel)
1. Push `client/` to a Git repo
2. Import to Vercel
3. Set `VITE_API_URL` to your Render backend URL + `/api`
4. Set `VITE_SOCKET_URL` to your Render backend URL

### MongoDB Atlas
1. Create a free cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Get connection string and set as `MONGO_URI`

## 📡 Socket Events

| Event | Direction | Description |
|-------|-----------|-------------|
| `join-room` | Client → Server | Join a room |
| `draw` | Bidirectional | Broadcast drawing stroke points |
| `erase` | Bidirectional | Broadcast erase action |
| `stroke-complete` | Bidirectional | Sync completed stroke for undo/redo |
| `undo` / `redo` | Bidirectional | Sync undo/redo actions |
| `clear-board` | Bidirectional | Host clears the board |
| `chat-message` | Bidirectional | Send/receive chat messages |
| `user-joined` / `user-left` | Server → Client | Presence notifications |
| `online-users` | Server → Client | Current user list |
| `file-shared` | Bidirectional | File upload notification |
| `screen-share-*` | Bidirectional | WebRTC signaling |

## 🛡️ API Endpoints

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/api/auth/register` | ✗ | Register user |
| POST | `/api/auth/login` | ✗ | Login |
| GET | `/api/auth/me` | ✓ | Get current user |
| POST | `/api/rooms/create` | ✓ | Create room |
| POST | `/api/rooms/join` | ✓ | Join room |
| GET | `/api/rooms/:roomId` | ✓ | Get room details |
| GET | `/api/whiteboard/:roomId` | ✓ | Get whiteboard session |
| POST | `/api/whiteboard/:roomId/snapshot` | ✓ | Save canvas snapshot |
| GET | `/api/chat/:roomId` | ✓ | Get chat messages |
| POST | `/api/upload` | ✓ | Upload file |

## 🔧 Tech Stack

- **Frontend:** React 19, Vite, Socket.io-client, Axios, React Router
- **Backend:** Node.js, Express.js, Socket.io, JWT, bcryptjs, Multer
- **Database:** MongoDB + Mongoose
- **Real-Time:** Socket.io + WebRTC (screen sharing)

## 📜 License

MIT
