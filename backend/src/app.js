const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');
dotenv.config();
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const threatRoutes = require('./routes/threatRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes'); 

connectDB();
const app = express();
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));

app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use('/api/auth', authRoutes);
app.use('/api/threats', threatRoutes);
app.use('/api/dashboard', dashboardRoutes);  // ← ADD THIS

app.get('/', (req, res) => {
    res.json({
        message: 'Cyber Threat Detection API',
        status: 'running',
        version: '1.0.0',
        endpoints: {
            auth: {
                register: 'POST /api/auth/register',
                login: 'POST /api/auth/login',
                me: 'GET /api/auth/me',
                update: 'PUT /api/auth/update-profile',
                logout: 'POST /api/auth/logout'
            },
            threats: {
                report: 'POST /api/threats/report',
                getAll: 'GET /api/threats',
                getStats: 'GET /api/threats/stats',
                getOne: 'GET /api/threats/:id',
                updateStatus: 'PUT /api/threats/:id/status',
                addMitigation: 'POST /api/threats/:id/mitigation',
                completeMitigation: 'PUT /api/threats/:id/mitigation/complete',
                generate: 'POST /api/threats/generate (Admin)',
                delete: 'DELETE /api/threats/:id (Admin)'
            },
            dashboard: {  // ← ADD THIS
                getData: 'GET /api/dashboard',
                timeline: 'GET /api/dashboard/timeline',
                map: 'GET /api/dashboard/map',
                types: 'GET /api/dashboard/types',
                alerts: 'GET /api/dashboard/alerts'
            }
        }
    });
});
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
    });
});
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});
app.use((err, req, res, next) => {
    console.error('Error:', err.stack);
    res.status(500).json({
        success: false,
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
    console.log(`\n Server running on http://localhost:${PORT}`);
    console.log(`API available at http://localhost:${PORT}/`);
    console.log(`Auth endpoints at http://localhost:${PORT}/api/auth`);
    console.log(`Threat endpoints at http://localhost:${PORT}/api/threats`);
    console.log(`Dashboard endpoints at http://localhost:${PORT}/api/dashboard`);  // ← ADD THIS
    console.log(`\n Auth Endpoints:`);
    console.log(`POST/api/auth/register    - Register new user`);
    console.log(`POST /api/auth/login       - Login user`);
    console.log(`GET /api/auth/me          - Get current user (protected)`);
    console.log(`PUT /api/auth/update-profile - Update profile (protected)`);
    console.log(`POST /api/auth/logout      - Logout user (protected)`);
    console.log(`\n Threat Endpoints:`);
    console.log(`POST/api/threats/report   - Report a new threat (protected)`);
    console.log(`GET /api/threats          - Get all threats (protected)`);
    console.log(`GET /api/threats/stats    - Get threat statistics (protected)`);
    console.log(`GET /api/threats/:id      - Get single threat (protected)`);
    console.log(`PUT /api/threats/:id/status - Update threat status (protected)`);
    console.log(`POST /api/threats/:id/mitigation - Add mitigation step (protected)`);
    console.log(`PUT /api/threats/:id/mitigation/complete - Complete mitigation (protected)`);
    console.log(`POST /api/threats/generate - Generate test threats (Admin only)`);
    console.log(`DELETE /api/threats/:id      - Delete threat (Admin only)`);
    console.log(`\n Dashboard Endpoints:`);  // ← ADD THIS
    console.log(`GET /api/dashboard        - Get all dashboard data (protected)`);
    console.log(`GET /api/dashboard/timeline - Get threat timeline (protected)`);
    console.log(`GET /api/dashboard/map    - Get threat map data (protected)`);
    console.log(`GET /api/dashboard/types  - Get threat types (protected)`);
    console.log(`GET /api/dashboard/alerts - Get recent alerts (protected)`);
});
const socketService = require('./config/socket');
const threatSimulator = require('./services/threatSimulator');

socketService.initializeSocket(server);
console.log('🔌 WebSocket initialized');
setTimeout(() => {
    threatSimulator.startSimulation(5000);
    console.log('Threat simulation started (every 5 seconds)');
}, 2000);
process.on('unhandledRejection', (err) => {
    console.error('Unhandled Rejection:', err);
    server.close(() => process.exit(1));
});
module.exports = app;