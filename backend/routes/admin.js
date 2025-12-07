const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Generation = require('../models/Generation');
const auth = require('../middleware/auth');

// Middleware to check admin role
const adminAuth = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied. Admin only.' });
    }
    next();
};

// @route   GET api/admin/stats
// @desc    Get dashboard stats
router.get('/stats', auth, adminAuth, async (req, res) => {
    try {
        const totalUsers = await User.countDocuments({ role: { $ne: 'guest' } });

        // Active users in last 24h (User who generated something)
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const activeUsers = await Generation.distinct('ipAddress', { timestamp: { $gte: oneDayAgo } }).then(ips => ips.length);
        // Note: this counts active IPs, simpler for MVP. If we want registered active users, we'd query userId.

        // RPM approximation (just mock or need real store? The requirement says "Using 12/30 RPM")
        // We can count generations in last minute
        const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
        const rpm = await Generation.countDocuments({ timestamp: { $gte: oneMinuteAgo } });

        const generationsToday = await Generation.countDocuments({ timestamp: { $gte: new Date().setHours(0, 0, 0, 0) } });
        const failedRequests = 0; // we don't track failures in DB currently, would need a Log model or update Generation to have status. Assuming 0 for MVP.

        res.json({
            growth: {
                totalUsers,
                activeUsers24h: activeUsers,
            },
            health: {
                rpm,
                dailyRequests: generationsToday,
                errors: failedRequests,
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/admin/users
// @desc    List all users
router.get('/users', auth, adminAuth, async (req, res) => {
    try {
        const users = await User.find({ role: { $ne: 'guest' } }).sort({ joinedAt: -1 });
        res.json(users);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// @route   PUT api/admin/users/:id/block
// @desc    Block/Unblock user
router.put('/users/:id/block', auth, adminAuth, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ error: 'User not found' });

        user.isBlocked = !user.isBlocked;
        await user.save();
        res.json(user);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// @route   PUT api/admin/users/:id/plan
// @desc    Toggle user plan (Free <-> Pro)
router.put('/users/:id/plan', auth, adminAuth, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ error: 'User not found' });

        // Toggle logic: Default to 'pro' if currently 'free' or undefined. Switch to 'free' if currently 'pro'.
        user.plan = user.plan === 'pro' ? 'free' : 'pro';

        await user.save();
        res.json(user);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
