const express = require('express');
const router = express.Router();
const {
    register,
    login,
    getCurrentUser,
    updateProfile,
    logout
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
// Register new user
router.post('/register', register);
// Login user
router.post('/login', login);
// Get current user profile
router.get('/me', protect, getCurrentUser);
// Update user profile
router.put('/update-profile', protect, updateProfile);
// Logout user
router.post('/logout', protect, logout);
module.exports = router;