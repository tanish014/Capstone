const express = require('express');
const router = express.Router();
const { getMessages } = require('../controllers/chatController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/:roomId', authMiddleware, getMessages);

module.exports = router;
