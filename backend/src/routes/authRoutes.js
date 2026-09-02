const jwt = require('jsonwebtoken');
const express = require('express');
const router = express.Router();
const passport = require('passport');
const {
    register,
    login,
    getCurrentUser,
    updateProfile,
    logout
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getCurrentUser);
router.put('/update-profile', protect, updateProfile);
router.post('/logout', protect, logout);
router.get('/google',
    passport.authenticate('google', {
        scope: ['profile', 'email'],
        prompt: 'select_account'
    })
);
router.get('/google/callback',
    passport.authenticate('google', {
        failureRedirect: 'http://localhost:3001/login',
        session: false
    }),
    (req, res) => {
        try {
            const token = jwt.sign(
                { userId: req.user._id, email: req.user.email },
                process.env.JWT_SECRET,
                { expiresIn: '7d' }
            );
            const redirectUrl = `http://localhost:3001/auth-success?token=${token}`;
            res.redirect(redirectUrl);
        } catch (error) {
            console.error('Google callback error:', error);
            res.redirect('http://localhost:3001/login?error=google-auth-failed');
        }
    }
);
module.exports = router;