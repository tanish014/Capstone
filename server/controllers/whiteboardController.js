const WhiteboardSession = require('../models/WhiteboardSession');

// @desc    Get whiteboard session for a room
// @route   GET /api/whiteboard/:roomId
exports.getSession = async (req, res) => {
    try {
        let session = await WhiteboardSession.findOne({ roomId: req.params.roomId });

        if (!session) {
            session = await WhiteboardSession.create({ roomId: req.params.roomId });
        }

        res.json({ session });
    } catch (error) {
        console.error('Get session error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Save strokes to session
// @route   POST /api/whiteboard/:roomId/strokes
exports.saveStrokes = async (req, res) => {
    try {
        const { strokes } = req.body;

        const session = await WhiteboardSession.findOneAndUpdate(
            { roomId: req.params.roomId },
            { strokes, updatedAt: Date.now() },
            { new: true, upsert: true }
        );

        res.json({ message: 'Strokes saved', session });
    } catch (error) {
        console.error('Save strokes error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Save snapshot image
// @route   POST /api/whiteboard/:roomId/snapshot
exports.saveSnapshot = async (req, res) => {
    try {
        const { imageData } = req.body;

        if (!imageData) {
            return res.status(400).json({ message: 'Image data is required' });
        }

        const session = await WhiteboardSession.findOneAndUpdate(
            { roomId: req.params.roomId },
            { savedImage: imageData, updatedAt: Date.now() },
            { new: true, upsert: true }
        );

        res.json({ message: 'Snapshot saved successfully' });
    } catch (error) {
        console.error('Save snapshot error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Clear board strokes
// @route   DELETE /api/whiteboard/:roomId/clear
exports.clearBoard = async (req, res) => {
    try {
        await WhiteboardSession.findOneAndUpdate(
            { roomId: req.params.roomId },
            { strokes: [], updatedAt: Date.now() }
        );

        res.json({ message: 'Board cleared' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
