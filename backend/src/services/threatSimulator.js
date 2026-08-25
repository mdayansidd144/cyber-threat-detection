const threatDetectionService = require('./threatDetection');
const socketService = require('../config/socket');
let simulationInterval = null;
let isRunning = false;
const THREAT_TYPES = ['malware', 'virus', 'trojan', 'worm', 'bot', 'spyware', 'ransomware', 'phishing', 'ddos'];
const COUNTRIES = ['US', 'CN', 'RU', 'IN', 'GB', 'DE', 'FR', 'JP', 'BR', 'AU', 'NG', 'ZA', 'EG', 'SA'];
const CITIES = ['New York', 'Beijing', 'Moscow', 'Mumbai', 'London', 'Berlin', 'Paris', 'Tokyo', 'Sao Paulo', 'Sydney', 'Lagos', 'Cairo', 'Riyadh', 'Johannesburg'];
const SERVICES = ['HTTP', 'HTTPS', 'SSH', 'FTP', 'SMTP', 'DNS', 'RDP', 'MySQL', 'MongoDB', 'Redis'];
function generateRandomThreat() {
    const type = THREAT_TYPES[Math.floor(Math.random() * THREAT_TYPES.length)];
    const countryIdx = Math.floor(Math.random() * COUNTRIES.length);
    const cityIdx = Math.floor(Math.random() * CITIES.length);
    const severity = Math.floor(Math.random() * 8) + 3;
    return {
        type: type,
        severity: severity,
        source: {
            ip: `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
            country: COUNTRIES[countryIdx],
            city: CITIES[cityIdx],
            latitude: (Math.random() * 180 - 90),
            longitude: (Math.random() * 360 - 180)
        },
        target: {
            ip: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
            port: Math.floor(Math.random() * 65535) + 1,
            service: SERVICES[Math.floor(Math.random() * SERVICES.length)]
        },
        description: `${type.charAt(0).toUpperCase() + type.slice(1)} activity detected from ${COUNTRIES[countryIdx]}`,
        confidence: Math.floor(Math.random() * 30) + 70,
        detectedBy: 'simulation',
        status: 'active'
    };
}
function startSimulation(interval = 5000) {
    if (isRunning) {
        console.log('Simulation already running');
        return;
    }
    console.log(`Starting threat simulation (interval: ${interval}ms)`);
    isRunning = true;
    simulationInterval = setInterval(async () => {
        try {
            const threatData = generateRandomThreat();
            const threat = await threatDetectionService.detectThreat(threatData);
            
            console.log(`New threat detected: ${threat.type} (${threat.severity}/10)`);      
            socketService.emitNewThreat(threat);
            const stats = await threatDetectionService.getStats();
            socketService.emitStatsUpdate(stats);    
        } catch (error) {
            console.error('Error in simulation:', error);
        }
    }, interval);
}
function stopSimulation() {
    if (simulationInterval) {
        clearInterval(simulationInterval);
        simulationInterval = null;
        isRunning = false;
        console.log('Threat simulation stopped');
    }
}
function getSimulationStatus() {
    return {
        isRunning,
        interval: simulationInterval ? 5000 : null
    };
}
module.exports = {
    startSimulation,
    stopSimulation,
    getSimulationStatus,
    generateRandomThreat
};