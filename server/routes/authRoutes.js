const express = require('express');
const router = express.Router();
const { register, login, getMe, updateTheme, logout } = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.get('/me', authMiddleware, getMe);
router.put('/theme', authMiddleware, updateTheme);
router.post('/logout', authMiddleware, logout);

module.exports = router;
