const express = require('express');
const router = express.Router();
const { upload, uploadFile } = require('../controllers/uploadController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/', authMiddleware, upload, uploadFile);

module.exports = router;
