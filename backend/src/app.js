const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');

dotenv.config();
const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));
app.get('/', (req, res) => {
    res.json({
        message: 'Cyber Threat Detection API',
        status: 'running',
        version: '1.0.0',
        timestamp: new Date().toISOString()
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
const PORT = process.env.PORT || 5000;

async function startServer() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/cyber_threat', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('MongoDB Connected Successfully!');
        console.log(`Database: ${mongoose.connection.name}`);
        console.log(`Host: ${mongoose.connection.host}`);
        console.log(`MongoDB Status: Connected`);
        // Test database route
app.post('/test-db', async (req, res) => {
    try {
        const Test = require('./models/Test');
        const test = new Test({
            name: 'Test Entry',
            message: 'MongoDB is working!'
        });
        await test.save();
        res.json({ success: true, message: 'Data saved to database!' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/test-db', async (req, res) => {
    try {
        const Test = require('./models/Test');
        const data = await Test.find();
        res.json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
                app.listen(PORT, () => {
            console.log(`Server is running on http://localhost:${PORT}`);
            console.log(`API available at http://localhost:${PORT}/`);
            console.log(`Health check at http://localhost:${PORT}/health`);
        });
        
    } catch (error) {
        console.error('Failed to start server:', error.message);
        console.log('Make sure MongoDB is running and IP is whitelisted!');
        process.exit(1);
    }
}
startServer();