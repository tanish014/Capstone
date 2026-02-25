const express = require('express');
const router = express.Router();
const { createRoom, joinRoom, getRoom, leaveRoom } = require('../controllers/roomController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/create', authMiddleware, createRoom);
router.post('/join', authMiddleware, joinRoom);
router.post('/leave', authMiddleware, leaveRoom);
router.get('/:roomId', authMiddleware, getRoom);

module.exports = router;
