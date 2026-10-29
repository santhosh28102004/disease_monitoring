const express = require('express');
const caseController = require('../controllers/caseController');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticateToken, authorizeRole(['HEALTHCARE_WORKER', 'HEALTH_OFFICIAL', 'ADMIN']), caseController.getAllCases);
router.get('/:id', authenticateToken, authorizeRole(['HEALTHCARE_WORKER', 'HEALTH_OFFICIAL', 'ADMIN']), caseController.getCaseById);
router.put('/:id/status', authenticateToken, authorizeRole(['HEALTHCARE_WORKER', 'HEALTH_OFFICIAL', 'ADMIN']), caseController.updateCaseStatus);
router.delete('/:id', authenticateToken, authorizeRole(['HEALTHCARE_WORKER', 'HEALTH_OFFICIAL', 'ADMIN']), caseController.deleteCase);
router.post('/:id/observations', authenticateToken, authorizeRole(['HEALTHCARE_WORKER', 'HEALTH_OFFICIAL', 'ADMIN']), caseController.addObservation);

module.exports = router;
