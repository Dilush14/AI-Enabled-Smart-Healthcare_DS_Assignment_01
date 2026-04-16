const express = require('express');
const { auth, internalAuth } = require('../middlewares/auth');
const {
  getNotifications,
  createNotification,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
} = require('../controllers/notificationController');

const router = express.Router();

router.get('/', auth, getNotifications);
router.get('/unread-count', auth, getUnreadCount);
router.post('/', auth, createNotification);
router.post('/internal', internalAuth, createNotification);
router.put('/read-all', auth, markAllAsRead);
router.put('/:id/read', auth, markAsRead);

module.exports = router;