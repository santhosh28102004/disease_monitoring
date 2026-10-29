const express = require('express');
const diseaseController = require('../controllers/diseaseController');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

const router = express.Router();

router.get('/', diseaseController.getAllDiseases);
router.get('/:id', diseaseController.getDiseaseById);
router.post('/', authenticateToken, authorizeRole(['ADMIN']), diseaseController.createDisease);
router.put('/:id', authenticateToken, authorizeRole(['ADMIN']), diseaseController.updateDisease);
router.delete('/:id', authenticateToken, authorizeRole(['ADMIN']), diseaseController.deleteDisease);

module.exports = router;
