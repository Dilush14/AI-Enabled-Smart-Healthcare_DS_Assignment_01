const express = require('express');
const { createSession, getSession } = require('../controllers/telemedicineController');
const { auth } = require('../middlewares/auth');

const router = express.Router();

router.post('/create-session', auth, createSession);
router.get('/session/:id', auth, getSession);

module.exports = router;