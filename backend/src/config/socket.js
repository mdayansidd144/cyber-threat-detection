const socketIO = require('socket.io');
const Threat = require('../models/Threat');
let io = null;
function initializeSocket(server) {
    io = socketIO(server, {
        cors: {
            origin: ['http://localhost:3000', 'http://localhost:3001'],
            methods: ['GET', 'POST'],
            credentials: true
        }
    });
    io.on('connection', (socket) => {
        console.log(`🔌 Client connected: ${socket.id}`);

        socket.on('disconnect', () => {
            console.log(`🔌 Client disconnected: ${socket.id}`);
        });
        socket.on('get_initial_data', async () => {
            try {
                const threats = await Threat.find().sort({ createdAt: -1 }).limit(50);
                const stats = await Threat.getStats();
                const byType = await Threat.getByType();
                
                socket.emit('initial_data', {
                    threats,
                    stats: stats[0] || { total: 0, active: 0, investigating: 0, contained: 0, resolved: 0 },
                    byType
                });
            } catch (error) {
                console.error('Error sending initial data:', error);
            }
        });
    });
    return io;
}
function getIO() {
    if (!io) {
        throw new Error('Socket.io not initialized');
    }
    return io;
}
function emitNewThreat(threat) {
    if (io) {
        io.emit('new_threat', threat);
        io.emit('threat_update', { type: 'new', threat });
    }
}
function emitThreatUpdate(threat) {
    if (io) {
        io.emit('threat_update', { type: 'update', threat });
    }
}
function emitStatsUpdate(stats) {
    if (io) {
        io.emit('stats_update', stats);
    }
}
module.exports = {
    initializeSocket,
    getIO,
    emitNewThreat,
    emitThreatUpdate,
    emitStatsUpdate
};