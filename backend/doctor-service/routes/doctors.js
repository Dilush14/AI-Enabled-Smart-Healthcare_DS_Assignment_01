const express = require('express');
const { getDoctors, getDoctor, updateDoctor, verifyDoctor, getAvailability } = require('../controllers/doctorController');
const { auth, authorize } = require('../middlewares/auth');

const router = express.Router();

router.get('/', getDoctors);
router.get('/:id', getDoctor);
router.put('/:id', auth, authorize(['doctor', 'admin']), updateDoctor);
router.put('/:id/verify', auth, authorize(['admin']), verifyDoctor);
router.get('/:id/availability', getAvailability);

module.exports = router;