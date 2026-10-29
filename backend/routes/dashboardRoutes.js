const express = require('express');
const dashboardController = require('../controllers/dashboardController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.get('/statistics', dashboardController.getDashboardStatistics);
router.get('/disease-trends', dashboardController.getDiseaseTrends);
router.get('/location-statistics', dashboardController.getLocationStatistics);
router.get('/severity-statistics', dashboardController.getSeverityStatistics);
router.get('/case-status', dashboardController.getCaseStatusStatistics);
router.get('/high-risk-areas', dashboardController.getHighRiskAreas);
router.get('/audit-logs', authenticateToken, dashboardController.getAuditLogs);

module.exports = router;
