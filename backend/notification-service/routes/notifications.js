const express = require('express');
const { auth } = require('../middlewares/auth');
const {
  getNotifications,
  createNotification,
  markAsRead,
} = require('../controllers/notificationController');

const router = express.Router();

router.get('/', auth, getNotifications);
router.post('/', auth, createNotification);
router.put('/:id/read', auth, markAsRead);

module.exports = router;