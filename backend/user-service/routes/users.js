const express = require('express');
const { getProfile, updateProfile, getAllUsers } = require('../controllers/userController');
const { auth, authorize } = require('../middlewares/auth');

const router = express.Router();

router.get('/profile', auth, getProfile);
router.put('/update', auth, updateProfile);
router.get('/', auth, authorize(['admin']), getAllUsers);

module.exports = router;