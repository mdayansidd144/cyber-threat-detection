const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');

dotenv.config();
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
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
    console.log(`\n Auth Endpoints:`);
    console.log(`   POST   /api/auth/register    - Register new user`);
    console.log(`   POST   /api/auth/login       - Login user`);
    console.log(`   GET    /api/auth/me          - Get current user (protected)`);
    console.log(`   PUT    /api/auth/update-profile - Update profile (protected)`);
    console.log(`   POST   /api/auth/logout      - Logout user (protected)`);
});
process.on('unhandledRejection', (err) => {
    console.error('Unhandled Rejection:', err);
    server.close(() => process.exit(1));
});
module.exports = app;