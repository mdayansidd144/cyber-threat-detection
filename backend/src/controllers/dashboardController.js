const Threat = require('../models/Threat');
const threatDetectionService = require('../services/threatDetection');
const threatSimulator = require('../services/threatSimulator');
const socketService = require('../config/socket');
async function getDashboardData(req, res) {
    try {
        const threats = await Threat.find()
            .sort({ createdAt: -1 })
            .limit(50)
            .populate('assignedTo', 'username');
        const stats = await threatDetectionService.getStats();
        const byType = await Threat.getByType();
        const simulationStatus = threatSimulator.getSimulationStatus();
        res.json({
            success: true,
            data: {
                threats,
                stats: stats.stats || { total: 0, active: 0, investigating: 0, contained: 0, resolved: 0 },
                byType: stats.byType || [],
                dailyCounts: stats.dailyCounts || [],
                simulation: simulationStatus,
                timestamp: new Date().toISOString()
            }
        });
    } catch (error) {
        console.error('Dashboard Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get dashboard data',
            error: error.message
        });
    }
}
async function getThreatTimeline(req, res) {
    try {
        const days = parseInt(req.query.days) || 7;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        const timeline = await Threat.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate }
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' },
                        day: { $dayOfMonth: '$createdAt' },
                        hour: { $hour: '$createdAt' }
                    },
                    count: { $sum: 1 },
                    avgSeverity: { $avg: '$severity' }
                }
            },
            {
                $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1, '_id.hour': 1 }
            }
        ]);
        res.json({
            success: true,
            data: timeline,
            days
        });
    } catch (error) {
        console.error('Timeline Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get threat timeline',
            error: error.message
        });
    }
}
async function getThreatMapData(req, res) {
    try {
        const mapData = await Threat.aggregate([
            {
                $group: {
                    _id: {
                        country: '$source.country',
                        city: '$source.city',
                        lat: '$source.latitude',
                        lng: '$source.longitude'
                    },
                    count: { $sum: 1 },
                    avgSeverity: { $avg: '$severity' },
                    threats: { $push: '$$ROOT' }
                }
            },
            {
                $project: {
                    country: '$_id.country',
                    city: '$_id.city',
                    latitude: '$_id.lat',
                    longitude: '$_id.lng',
                    count: 1,
                    avgSeverity: 1,
                    recentThreats: { $slice: ['$threats', 5] }
                }
            },
            { $sort: { count: -1 } }
        ]);
        res.json({
            success: true,
            data: mapData
        });
    } catch (error) {
        console.error('Map Data Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get threat map data',
            error: error.message
        });
    }
}
async function getThreatTypes(req, res) {
    try {
        const types = await Threat.getByType();

        res.json({
            success: true,
            data: types
        });
    } catch (error) {
        console.error('Types Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get threat types',
            error: error.message
        });
    }
}
async function getRecentAlerts(req, res) {
    try {
        const limit = parseInt(req.query.limit) || 20;
        const alerts = await Threat.find({ severity: { $gte: 5 } })
            .sort({ createdAt: -1 })
            .limit(limit)
            .populate('assignedTo', 'username');

        res.json({
            success: true,
            data: alerts
        });
    } catch (error) {
        console.error('Alerts Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get alerts',
            error: error.message
        });
    }
}
module.exports = {
    getDashboardData,
    getThreatTimeline,
    getThreatMapData,
    getThreatTypes,
    getRecentAlerts
};