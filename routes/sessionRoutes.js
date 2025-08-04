const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { createSession, getMySession, getSessionById, deleteSession } = require('../controllers/sessionController');

const router = express.Router();

router.post('/create', protect, createSession);
router.get('/my-sessions', protect, getMySession);
router.get('/:id', protect, getSessionById);
router.delete('/:id', protect, deleteSession);

module.exports = router