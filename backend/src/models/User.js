const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Username is required'],
        unique: true,
        trim: true,
        minlength: [3, 'Username must be at least 3 characters'],
        maxlength: [30, 'Username cannot exceed 30 characters']
    },
        email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please provide a valid email address'
        ]
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters'],
        select: false
    },
        role: {
        type: String,
        enum: ['admin', 'analyst', 'user'],
        default: 'user'
    },
        isActive: {
        type: Boolean,
        default: true
    },
        lastLogin: {
        type: Date
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
UserSchema.pre('save', async function(next) {
    // Only hash if password is modified
    if (!this.isModified('password')) {
        return next();
    }
    
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        this.updatedAt = Date.now();
        
        next();
    } catch (error) {
        next(error);
    }
});
UserSchema.methods.comparePassword = async function(candidatePassword) {
    try {
        return await bcrypt.compare(candidatePassword, this.password);
    } catch (error) {
        throw error;
    }
};
UserSchema.methods.getPublicProfile = function() {
    return {
        id: this._id,
        username: this.username,
        email: this.email,
        role: this.role,
        isActive: this.isActive,
        lastLogin: this.lastLogin,
        createdAt: this.createdAt
    };
};
UserSchema.statics.findByCredentials = async function(email, username) {
    return await this.findOne({
        $or: [
            { email: email.toLowerCase() },
            { username: username }
        ]
    });
};
module.exports = mongoose.model('User', UserSchema);