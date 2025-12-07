const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        unique: true,
        sparse: true, // Allow null for guests if we track them by IP in a separate way, or this is just for registered.
    },
    password: {
        type: String,
        required: false, // Not required for guests
    },
    ipAddress: {
        type: String,
        required: true, // Track IP for guests
    },
    role: {
        type: String,
        enum: ['guest', 'user', 'admin'],
        default: 'guest',
    },
    plan: {
        type: String,
        enum: ['free', 'pro', 'enterprise'],
        default: 'free',
    },
    generationsCount: {
        type: Number,
        default: 0,
    },
    lastResetDate: {
        type: Date,
        default: Date.now,
    },
    isBlocked: {
        type: Boolean,
        default: false,
    },
    joinedAt: {
        type: Date,
        default: Date.now,
    }
});

module.exports = mongoose.model('User', UserSchema);
