const express = require('express');
const { getDoctors, getDoctor, updateDoctor, uploadIdProof, addDoctorRating, verifyDoctor, getAvailability } = require('../controllers/doctorController');
const { auth, authorize } = require('../middlewares/auth');
const upload = require('../middlewares/upload');

const router = express.Router();

router.get('/', getDoctors);
router.get('/:id', getDoctor);
router.put('/:id', auth, authorize(['doctor', 'admin']), updateDoctor);
router.put('/:id/id-proof', auth, authorize(['doctor', 'admin']), upload.single('idProofImage'), uploadIdProof);
router.put('/:id/rating', auth, authorize(['patient']), addDoctorRating);
router.put('/:id/verify', auth, authorize(['admin']), verifyDoctor);
router.get('/:id/availability', getAvailability);

module.exports = router;