const express = require('express');
const router = express.Router();
const { getSession, saveStrokes, saveSnapshot, clearBoard } = require('../controllers/whiteboardController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/:roomId', authMiddleware, getSession);
router.post('/:roomId/strokes', authMiddleware, saveStrokes);
router.post('/:roomId/snapshot', authMiddleware, saveSnapshot);
router.delete('/:roomId/clear', authMiddleware, clearBoard);

module.exports = router;
