const threatDetectionService = require('../services/threatDetection');
const Threat = require('../models/Threat');
const reportThreat = async (req, res) => {
    try {
        const threatData = req.body;
        if (!threatData.type || !threatData.source?.ip) {
            return res.status(400).json({
                success: false,
                message: 'Please provide threat type and source IP'
            });
        }
        if (req.user) {
            threatData.reportedBy = req.user._id;
        }
        
        const threat = await threatDetectionService.detectThreat(threatData);
        res.status(201).json({
            success: true,
            message: 'Threat reported successfully',
            threat
        });
    } catch (error) {
        console.error('Report Threat Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to report threat',
            error: error.message
        });
    }
};
const generateThreats = async (req, res) => {
    try {
        const count = parseInt(req.query.count) || 5;
        const threats = await threatDetectionService.generateMultipleThreats(count);
        
        res.json({
            success: true,
            message: `Generated ${count} threats`,
            count: threats.length,
            threats
        });
    } catch (error) {
        console.error('Generate Threats Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate threats',
            error: error.message
        });
    }
};
const getThreats = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const filter = {};
        
        if (req.query.type) filter.type = req.query.type;
        if (req.query.status) filter.status = req.query.status;
        if (req.query.severityMin) filter.severityMin = parseInt(req.query.severityMin);
        if (req.query.severityMax) filter.severityMax = parseInt(req.query.severityMax);
        
        const result = await threatDetectionService.getThreats(page, limit, filter);
        
        res.json({
            success: true,
            ...result
        });
    } catch (error) {
        console.error('Get Threats Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get threats',
            error: error.message
        });
    }
};
const getThreat = async (req, res) => {
    try {
        const { id } = req.params;
        const threat = await threatDetectionService.getThreatById(id);
        
        if (!threat) {
            return res.status(404).json({
                success: false,
                message: 'Threat not found'
            });
        }
        
        res.json({
            success: true,
            threat
        });
    } catch (error) {
        console.error('Get Threat Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get threat',
            error: error.message
        });
    }
};
const updateThreatStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        
        if (!status) {
            return res.status(400).json({
                success: false,
                message: 'Please provide status'
            });
        }
        const threat = await threatDetectionService.updateThreatStatus(
            id, 
            status, 
            req.user?._id
        ); 
        res.json({
            success: true,
            message: 'Threat status updated',
            threat
        });
    } catch (error) {
        console.error('Update Threat Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update threat',
            error: error.message
        });
    }
};
const addMitigationStep = async (req, res) => {
    try {
        const { id } = req.params;
        const { step } = req.body;
        
        if (!step) {
            return res.status(400).json({
                success: false,
                message: 'Please provide mitigation step'
            });
        }
        
        const threat = await threatDetectionService.addMitigationStep(id, step);    
        res.json({
            success: true,
            message: 'Mitigation step added',
            threat
        });
    } catch (error) {
        console.error('Add Mitigation Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to add mitigation step',
            error: error.message
        });
    }
};
const completeMitigation = async (req, res) => {
    try {
        const { id } = req.params;
        const threat = await threatDetectionService.completeMitigation(id);
        
        res.json({
            success: true,
            message: 'Mitigation completed',
            threat
        });
    } catch (error) {
        console.error('Complete Mitigation Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to complete mitigation',
            error: error.message
        });
    }
};
const getThreatStats = async (req, res) => {
    try {
        const stats = await threatDetectionService.getStats();
        
        res.json({
            success: true,
            ...stats
        });
    } catch (error) {
        console.error('Get Stats Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get statistics',
            error: error.message
        });
    }
};
const deleteThreat = async (req, res) => {
    try {
        const { id } = req.params;
        const threat = await Threat.findByIdAndDelete(id);
        
        if (!threat) {
            return res.status(404).json({
                success: false,
                message: 'Threat not found'
            });
        }
        
        res.json({
            success: true,
            message: 'Threat deleted successfully'
        });
    } catch (error) {
        console.error('Delete Threat Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete threat',
            error: error.message
        });
    }
};
module.exports = {
    reportThreat,
    generateThreats,
    getThreats,
    getThreat,
    updateThreatStatus,
    addMitigationStep,
    completeMitigation,
    getThreatStats,
    deleteThreat
};