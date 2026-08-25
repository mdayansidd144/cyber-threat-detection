const express = require('express');
const router = express.Router();
const {
    getDashboardData,
    getThreatTimeline,
    getThreatMapData,
    getThreatTypes,
    getRecentAlerts
} = require('../controllers/dashboardController');
const { protect } = require('../middleware/auth');
router.get('/', protect, getDashboardData);
router.get('/timeline', protect, getThreatTimeline);
router.get('/map', protect, getThreatMapData);
router.get('/types', protect, getThreatTypes);
router.get('/alerts', protect, getRecentAlerts);
module.exports = router;