const express = require('express');
const router = express.Router();
const {
    reportThreat,
    generateThreats,
    getThreats,
    getThreat,
    updateThreatStatus,
    addMitigationStep,
    completeMitigation,
    getThreatStats,
    deleteThreat
} = require('../controllers/threatController');
const { protect, adminOnly, analystOrAdmin } = require('../middleware/auth');
router.post('/report', protect, reportThreat);
router.get('/', protect, getThreats);
router.get('/stats', protect, getThreatStats);
router.get('/:id', protect, getThreat);
router.put('/:id/status', protect, updateThreatStatus);
router.post('/:id/mitigation', protect, addMitigationStep);
router.put('/:id/mitigation/complete', protect, completeMitigation);
router.post('/generate', protect, adminOnly, generateThreats);
router.delete('/:id', protect, adminOnly, deleteThreat);
module.exports = router;