const mongoose = require('mongoose');

const strokeSchema = new mongoose.Schema({
    points: [{
        x: Number,
        y: Number
    }],
    color: {
        type: String,
        default: '#ffffff'
    },
    size: {
        type: Number,
        default: 3
    },
    tool: {
        type: String,
        enum: ['pencil', 'eraser'],
        default: 'pencil'
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
}, { _id: true });

const chatMessageSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    userName: String,
    message: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
}, { _id: true });

const whiteboardSessionSchema = new mongoose.Schema({
    roomId: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    strokes: [strokeSchema],
    chatMessages: [chatMessageSchema],
    savedImage: {
        type: String,
        default: null
    }
}, { timestamps: true });

module.exports = mongoose.model('WhiteboardSession', whiteboardSessionSchema);
