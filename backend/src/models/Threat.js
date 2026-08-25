const mongoose = require('mongoose');
const ThreatSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: [
            'malware', 
            'virus', 
            'trojan', 
            'worm', 
            'bot', 
            'spyware', 
            'ransomware',
            'phishing',
            'ddos',
            'unknown'
        ],
        required: true,
        default: 'unknown'
    },
    severity: {
        type: Number,
        required: true,
        min: 1,
        max: 10,
        default: 5
    },
    source: {
        ip: {
            type: String,
            required: true,
            default: 'unknown'
        },
        country: {
            type: String,
            default: 'Unknown'
        },
        city: {
            type: String,
            default: 'Unknown'
        },
        latitude: {
            type: Number,
            default: 0
        },
        longitude: {
            type: Number,
            default: 0
        }
    },
    target: {
        ip: {
            type: String,
            default: 'unknown'
        },
        port: {
            type: Number,
            default: 0
        },
        service: {
            type: String,
            default: 'Unknown'
        }
    },
    description: {
        type: String,
        default: 'No description provided'
    },
    status: {
        type: String,
        enum: ['active', 'investigating', 'contained', 'resolved'],
        default: 'active'
    },
    confidence: {
        type: Number,
        min: 0,
        max: 100,
        default: 70
    },
    detectedBy: {
        type: String,
        enum: ['ml_model', 'signature', 'behavior', 'user_report', 'simulation'],
        default: 'simulation'
    },
    mitigation: {
        steps: [{
            type: String
        }],
        automated: {
            type: Boolean,
            default: false
        },
        completed: {
            type: Boolean,
            default: false
        },
        timestamp: {
            type: Date
        }
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});
ThreatSchema.index({ type: 1, severity: -1 });
ThreatSchema.index({ status: 1 });
ThreatSchema.index({ createdAt: -1 });
ThreatSchema.index({ 'source.ip': 1 });
ThreatSchema.statics.getStats = async function() {
    return await this.aggregate([
        {
            $group: {
                _id: null,
                total: { $sum: 1 },
                active: {
                    $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
                },
                investigating: {
                    $sum: { $cond: [{ $eq: ['$status', 'investigating'] }, 1, 0] }
                },
                contained: {
                    $sum: { $cond: [{ $eq: ['$status', 'contained'] }, 1, 0] }
                },
                resolved: {
                    $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] }
                },
                avgSeverity: { $avg: '$severity' }
            }
        }
    ]);
};
ThreatSchema.statics.getByType = async function() {
    return await this.aggregate([
        {
            $group: {
                _id: '$type',
                count: { $sum: 1 },
                avgSeverity: { $avg: '$severity' }
            }
        },
        { $sort: { count: -1 } }
    ]);
};
module.exports = mongoose.model('Threat', ThreatSchema);