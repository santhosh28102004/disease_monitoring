const express = require('express');
const locationController = require('../controllers/locationController');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

const router = express.Router();

router.get('/', locationController.getAllLocations);
router.get('/:id', locationController.getLocationById);
router.post('/', authenticateToken, authorizeRole(['ADMIN']), locationController.createLocation);
router.put('/:id', authenticateToken, authorizeRole(['ADMIN']), locationController.updateLocation);
router.delete('/:id', authenticateToken, authorizeRole(['ADMIN']), locationController.deleteLocation);

module.exports = router;
