const Threat = require('../models/Threat');
const THREAT_TYPES = {
    malware: {
        severity: 7,
        description: 'Malicious software designed to damage or gain unauthorized access',
        mitigation: ['Run antivirus scan', 'Isolate infected system', 'Remove malicious files']
    },
    virus: {
        severity: 8,
        description: 'Self-replicating program that attaches to files and spreads',
        mitigation: ['Delete infected files', 'Run antivirus scan', 'Update virus definitions']
    },
    trojan: {
        severity: 7,
        description: 'Disguised malicious software that appears legitimate',
        mitigation: ['Remove trojan files', 'Reset compromised passwords', 'Check for backdoors']
    },
    worm: {
        severity: 6,
        description: 'Self-replicating program that spreads over networks',
        mitigation: ['Patch network vulnerabilities', 'Scan for infected systems', 'Block network ports']
    },
    bot: {
        severity: 5,
        description: 'Compromised machine controlled by attacker',
        mitigation: ['Remove bot software', 'Change all passwords', 'Update system patches']
    },
    spyware: {
        severity: 9,
        description: 'Software that secretly monitors and collects user data',
        mitigation: ['Run anti-spyware scan', 'Clear browser data', 'Change all passwords']
    },
    ransomware: {
        severity: 10,
        description: 'Malware that encrypts files and demands payment',
        mitigation: ['Disconnect from network', 'Don\'t pay ransom', 'Restore from backup']
    },
    phishing: {
        severity: 6,
        description: 'Attempt to steal credentials via fake communications',
        mitigation: ['Educate users', 'Block phishing domains', 'Reset compromised accounts']
    },
    ddos: {
        severity: 8,
        description: 'Distributed denial of service attack flooding network',
        mitigation: ['Activate DDoS protection', 'Rate limit traffic', 'Block malicious IPs']
    }
};
const generateSimulatedThreat = () => {
    const types = Object.keys(THREAT_TYPES);
    const type = types[Math.floor(Math.random() * types.length)];
    const threatInfo = THREAT_TYPES[type];
    const ip = `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
    const countries = ['US', 'CN', 'RU', 'IN', 'GB', 'DE', 'FR', 'JP', 'BR', 'AU', 'NG', 'ZA', 'EG', 'SA'];
    const cities = ['New York', 'Beijing', 'Moscow', 'Mumbai', 'London', 'Berlin', 'Paris', 'Tokyo', 'Sao Paulo', 'Sydney', 'Lagos', 'Cairo', 'Riyadh', 'Johannesburg'];
    
    const countryIdx = Math.floor(Math.random() * countries.length);
    
    return {
        type,
        severity: threatInfo.severity + (Math.random() * 3 - 1.5),
        source: {
            ip: ip,
            country: countries[countryIdx],
            city: cities[countryIdx],
            latitude: (Math.random() * 180 - 90),
            longitude: (Math.random() * 360 - 180)
        },
        target: {
            ip: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
            port: Math.floor(Math.random() * 65535) + 1,
            service: ['HTTP', 'HTTPS', 'SSH', 'FTP', 'SMTP', 'DNS', 'RDP', 'MySQL'][Math.floor(Math.random() * 8)]
        },
        description: `${type.charAt(0).toUpperCase() + type.slice(1)} activity detected from ${countries[countryIdx]}`,
        confidence: Math.floor(Math.random() * 30) + 70,
        detectedBy: 'simulation',
        mitigation: {
            steps: threatInfo.mitigation,
            automated: false,
            completed: false
        }
    };
};
class ThreatDetectionService {
    async detectThreat(threatData) {
        try {
            const threat = new Threat(threatData);
            await threat.save();
            return threat;
        } catch (error) {
            console.error('Error detecting threat:', error);
            throw error;
        }
    }
    async generateRandomThreat() {
        const threatData = generateSimulatedThreat();
        return await this.detectThreat(threatData);
    }
    async generateMultipleThreats(count = 5) {
        const threats = [];
        for (let i = 0; i < count; i++) {
            const threat = await this.generateRandomThreat();
            threats.push(threat);
        }
        return threats;
    }
    async getThreats(page = 1, limit = 50, filter = {}) {
        const skip = (page - 1) * limit;
        
        const query = {};
        if (filter.type) query.type = filter.type;
        if (filter.status) query.status = filter.status;
        if (filter.severityMin) query.severity = { $gte: filter.severityMin };
        if (filter.severityMax) query.severity = { ...query.severity, $lte: filter.severityMax };
        const [threats, total] = await Promise.all([
            Threat.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate('assignedTo', 'username email'),
            Threat.countDocuments(query)
        ]);
        
        return {
            threats,
            total,
            page,
            totalPages: Math.ceil(total / limit)
        };
    }
    async getThreatById(id) {
        return await Threat.findById(id).populate('assignedTo', 'username email');
    }
    async updateThreatStatus(id, status, userId) {
        const threat = await Threat.findById(id);
        if (!threat) {
            throw new Error('Threat not found');
        }
        
        threat.status = status;
        threat.updatedAt = Date.now();
        
        if (userId) {
            threat.assignedTo = userId;
        }
        
        await threat.save();
        return threat;
    }
    async addMitigationStep(id, step) {
        const threat = await Threat.findById(id);
        if (!threat) {
            throw new Error('Threat not found');
        }
        
        threat.mitigation.steps.push(step);
        threat.updatedAt = Date.now();
        await threat.save();
        return threat;
    }
    async completeMitigation(id) {
        const threat = await Threat.findById(id);
        if (!threat) {
            throw new Error('Threat not found');
        }
        threat.mitigation.completed = true;
        threat.mitigation.timestamp = Date.now();
        threat.status = 'contained';
        threat.updatedAt = Date.now();
        await threat.save();
        return threat;
    }
    async getStats() {
        const stats = await Threat.getStats();
        const byType = await Threat.getByType();
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        
        const dailyCounts = await Threat.aggregate([
            {
                $match: {
                    createdAt: { $gte: sevenDaysAgo }
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' },
                        day: { $dayOfMonth: '$createdAt' }
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
        ]);
        return {
            stats: stats[0] || { total: 0, active: 0, investigating: 0, contained: 0, resolved: 0 },
            byType,
            dailyCounts,
            topThreats: byType.slice(0, 5)
        };
    }
}
module.exports = new ThreatDetectionService();