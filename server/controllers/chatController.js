const WhiteboardSession = require('../models/WhiteboardSession');

// @desc    Get chat messages for a room
// @route   GET /api/chat/:roomId
exports.getMessages = async (req, res) => {
    try {
        const session = await WhiteboardSession.findOne({ roomId: req.params.roomId });

        if (!session) {
            return res.json({ messages: [] });
        }

        res.json({ messages: session.chatMessages });
    } catch (error) {
        console.error('Get messages error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
