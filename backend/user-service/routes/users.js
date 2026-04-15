const express = require('express');
const { getProfile, updateProfile } = require('../controllers/userController');
const { auth } = require('../middlewares/auth');

const router = express.Router();

router.get('/profile', auth, getProfile);
router.put('/update', auth, updateProfile);

module.exports = router;