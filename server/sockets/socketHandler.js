const WhiteboardSession = require('../models/WhiteboardSession');

// Track online users per room
const roomUsers = new Map();

module.exports = function socketHandler(io) {
    io.on('connection', (socket) => {
        console.log(`🔌 User connected: ${socket.id}`);

        // ─── Join Room ───
        socket.on('join-room', ({ roomId, userId, userName }) => {
            socket.join(roomId);

            // Store user info on the socket
            socket.roomId = roomId;
            socket.userId = userId;
            socket.userName = userName;

            // Track online users
            if (!roomUsers.has(roomId)) {
                roomUsers.set(roomId, new Map());
            }
            roomUsers.get(roomId).set(socket.id, { userId, userName, socketId: socket.id });

            // Broadcast to room
            socket.to(roomId).emit('user-joined', {
                userId,
                userName,
                message: `${userName} joined the room`
            });

            // Send current online users to the joining user
            const onlineUsers = Array.from(roomUsers.get(roomId).values());
            io.to(roomId).emit('online-users', onlineUsers);

            console.log(`👤 ${userName} joined room ${roomId}`);
        });

        // ─── Draw Event ───
        socket.on('draw', (data) => {
            socket.to(data.roomId).emit('draw', data);
        });

        // ─── Erase Event ───
        socket.on('erase', (data) => {
            socket.to(data.roomId).emit('erase', data);
        });

        // ─── Stroke Complete (for undo/redo sync) ───
        socket.on('stroke-complete', (data) => {
            socket.to(data.roomId).emit('stroke-complete', data);
        });

        // ─── Undo Event ───
        socket.on('undo', (data) => {
            socket.to(data.roomId).emit('undo', data);
        });

        // ─── Redo Event ───
        socket.on('redo', (data) => {
            socket.to(data.roomId).emit('redo', data);
        });

        // ─── Clear Board Event (host only) ───
        socket.on('clear-board', async ({ roomId, userId }) => {
            io.to(roomId).emit('clear-board');

            // Clear in database
            try {
                await WhiteboardSession.findOneAndUpdate(
                    { roomId },
                    { strokes: [] }
                );
            } catch (err) {
                console.error('Error clearing board in DB:', err);
            }
        });

        // ─── Chat Message Event ───
        socket.on('chat-message', async ({ roomId, userId, userName, message }) => {
            const chatMsg = {
                userId,
                userName,
                message,
                timestamp: new Date()
            };

            // Broadcast to room
            io.to(roomId).emit('chat-message', chatMsg);

            // Persist to DB
            try {
                await WhiteboardSession.findOneAndUpdate(
                    { roomId },
                    { $push: { chatMessages: chatMsg } },
                    { upsert: true }
                );
            } catch (err) {
                console.error('Error saving chat message:', err);
            }
        });

        // ─── File Shared Event ───
        socket.on('file-shared', ({ roomId, file, userName }) => {
            io.to(roomId).emit('file-shared', { file, userName });
        });

        // ─── WebRTC Signaling ───
        socket.on('screen-share-offer', ({ roomId, offer, senderId }) => {
            socket.to(roomId).emit('screen-share-offer', { offer, senderId });
        });

        socket.on('screen-share-answer', ({ roomId, answer, senderId }) => {
            socket.to(roomId).emit('screen-share-answer', { answer, senderId });
        });

        socket.on('ice-candidate', ({ roomId, candidate, senderId }) => {
            socket.to(roomId).emit('ice-candidate', { candidate, senderId });
        });

        socket.on('screen-share-stopped', ({ roomId }) => {
            socket.to(roomId).emit('screen-share-stopped');
        });

        // ─── Disconnect ───
        socket.on('disconnect', () => {
            const { roomId, userName, userId } = socket;

            if (roomId && roomUsers.has(roomId)) {
                roomUsers.get(roomId).delete(socket.id);

                // Broadcast user left
                socket.to(roomId).emit('user-left', {
                    userId,
                    userName,
                    message: `${userName} left the room`
                });

                // Update online users
                const onlineUsers = Array.from(roomUsers.get(roomId).values());
                io.to(roomId).emit('online-users', onlineUsers);

                // Clean up empty rooms
                if (roomUsers.get(roomId).size === 0) {
                    roomUsers.delete(roomId);
                }

                console.log(`👋 ${userName} left room ${roomId}`);
            }

            console.log(`🔌 User disconnected: ${socket.id}`);
        });
    });
};
