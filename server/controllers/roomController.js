const { v4: uuidv4 } = require('uuid');
const Room = require('../models/Room');
const WhiteboardSession = require('../models/WhiteboardSession');

// @desc    Create a new room
// @route   POST /api/rooms/create
exports.createRoom = async (req, res) => {
    try {
        const { name } = req.body;
        const roomId = uuidv4().slice(0, 8).toUpperCase();

        const room = await Room.create({
            roomId,
            name: name || 'Untitled Room',
            hostId: req.user._id,
            participants: [{
                userId: req.user._id,
                name: req.user.name
            }]
        });

        // Create whiteboard session for this room
        await WhiteboardSession.create({ roomId });

        res.status(201).json({
            message: 'Room created successfully',
            room
        });
    } catch (error) {
        console.error('Create room error:', error);
        res.status(500).json({ message: 'Server error creating room' });
    }
};

// @desc    Join a room by roomId
// @route   POST /api/rooms/join
exports.joinRoom = async (req, res) => {
    try {
        const { roomId } = req.body;

        if (!roomId) {
            return res.status(400).json({ message: 'Room ID is required' });
        }

        const room = await Room.findOne({ roomId, isActive: true });
        if (!room) {
            return res.status(404).json({ message: 'Room not found or is no longer active' });
        }

        // Check if user is already in the room
        const alreadyJoined = room.participants.some(
            p => p.userId && p.userId.toString() === req.user._id.toString()
        );

        if (!alreadyJoined) {
            room.participants.push({
                userId: req.user._id,
                name: req.user.name
            });
            await room.save();
        }

        res.json({
            message: 'Joined room successfully',
            room
        });
    } catch (error) {
        console.error('Join room error:', error);
        res.status(500).json({ message: 'Server error joining room' });
    }
};

// @desc    Get room details
// @route   GET /api/rooms/:roomId
exports.getRoom = async (req, res) => {
    try {
        const room = await Room.findOne({ roomId: req.params.roomId })
            .populate('hostId', 'name email');

        if (!room) {
            return res.status(404).json({ message: 'Room not found' });
        }

        res.json({ room });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Leave a room
// @route   POST /api/rooms/leave
exports.leaveRoom = async (req, res) => {
    try {
        const { roomId } = req.body;
        const room = await Room.findOne({ roomId });

        if (!room) {
            return res.status(404).json({ message: 'Room not found' });
        }

        room.participants = room.participants.filter(
            p => p.userId && p.userId.toString() !== req.user._id.toString()
        );

        // If host leaves and no participants, deactivate room
        if (room.hostId.toString() === req.user._id.toString() && room.participants.length === 0) {
            room.isActive = false;
        }

        await room.save();

        res.json({ message: 'Left room successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
