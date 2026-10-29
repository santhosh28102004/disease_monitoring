const express = require('express');
const reportController = require('../controllers/reportController');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

const router = express.Router();

router.post('/', authenticateToken, reportController.createReport);
router.get('/', authenticateToken, authorizeRole(['HEALTHCARE_WORKER', 'HEALTH_OFFICIAL', 'ADMIN']), reportController.getAllReports);
router.get('/user/my-reports', authenticateToken, reportController.getUserReports);
router.get('/location-cases', authenticateToken, authorizeRole(['CITIZEN']), reportController.getLocationCases);
router.put('/:id', authenticateToken, authorizeRole(['HEALTHCARE_WORKER', 'HEALTH_OFFICIAL', 'ADMIN']), reportController.updateReport);
router.delete('/:id', authenticateToken, authorizeRole(['HEALTHCARE_WORKER', 'HEALTH_OFFICIAL', 'ADMIN']), reportController.deleteReport);
router.get('/:id', reportController.getReportById);
router.put('/:id/verify', authenticateToken, authorizeRole(['HEALTHCARE_WORKER', 'HEALTH_OFFICIAL', 'ADMIN']), reportController.verifyReport);
router.put('/:id/reject', authenticateToken, authorizeRole(['HEALTHCARE_WORKER', 'HEALTH_OFFICIAL', 'ADMIN']), reportController.rejectReport);
router.put('/:id/status', authenticateToken, authorizeRole(['HEALTHCARE_WORKER', 'HEALTH_OFFICIAL', 'ADMIN']), reportController.updateReportStatus);

module.exports = router;
