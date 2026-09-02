const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');
passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: '/api/auth/google/callback',
            scope: ['profile', 'email'],
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                console.log('Google Profile:', profile);
                let user = await User.findOne({ googleId: profile.id });
                if (user) {
                    user.lastLogin = new Date();
                    user.username = profile.displayName;
                    if (profile.photos && profile.photos.length > 0) {
                        user.avatar = profile.photos[0].value;
                    }
                    await user.save();
                    return done(null, user);
                }
                const email = profile.emails[0].value;
                user = await User.findOne({ email });
                if (user) {
                    user.googleId = profile.id;
                    user.isGoogleAuth = true;
                    user.username = profile.displayName;
                    if (profile.photos && profile.photos.length > 0) {
                        user.avatar = profile.photos[0].value;
                    }
                    await user.save();
                    return done(null, user);
                }
                const randomPassword = Math.random().toString(36).slice(-12);
                user = new User({
                    googleId: profile.id,
                    username: profile.displayName,
                    email: email,
                    password: randomPassword,
                    isGoogleAuth: true,
                    isActive: true,
                    avatar: profile.photos && profile.photos.length > 0 ? profile.photos[0].value : '',
                    lastLogin: new Date()
                });
                await user.save();
                console.log('New Google user created:', user.email);
                return done(null, user);
            } catch (error) {
                console.error('Google Auth Error:', error);
                return done(error, null);
            }
        }
    )
);
passport.serializeUser((user, done) => {
    done(null, user.id);
});
passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});
module.exports = passport;