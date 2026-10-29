const express = require('express');
const alertController = require('../controllers/alertController');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

const router = express.Router();

router.get('/', alertController.getAllAlerts);
router.get('/:id', alertController.getAlertById);
router.post('/', authenticateToken, authorizeRole(['HEALTH_OFFICIAL', 'ADMIN']), alertController.createAlert);
router.put('/:id', authenticateToken, authorizeRole(['HEALTH_OFFICIAL', 'ADMIN']), alertController.updateAlert);
router.put('/:id/acknowledge', authenticateToken, alertController.acknowledgeAlert);
router.delete('/:id', authenticateToken, authorizeRole(['ADMIN']), alertController.deleteAlert);

module.exports = router;
