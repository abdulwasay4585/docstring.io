const express = require('express');
const router = express.Router();
const Groq = require('groq-sdk');
const User = require('../models/User');
const Generation = require('../models/Generation');
const rateLimit = require('express-rate-limit');
const optionalAuth = require('../middleware/optionalAuth');
const auth = require('../middleware/auth');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// RPM Limiter: 5 requests per minute
const apiLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 5,
    message: { error: 'Too many requests, please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
});

router.post('/', [optionalAuth, apiLimiter], async (req, res) => {
    const { code, language, style } = req.body;
    const ip = req.ip || req.connection.remoteAddress;

    if (!code) {
        return res.status(400).json({ error: 'Code is required' });
    }

    try {
        // 1. Check Daily Limit & Resolve User
        let user;

        if (req.user) {
            user = await User.findById(req.user.id);
        }

        // If no logged in user found, or no token provided, look up by IP (Guest)
        if (!user) {
            user = await User.findOne({ ipAddress: ip, email: null }); // Try finding explicit guest first
            if (!user) {
                // Fallback: look for any user with this IP? No, don't hijack registered accounts.
                // Just create/find guest.
                user = await User.findOne({ ipAddress: ip, role: 'guest' });
            }
        }

        if (!user) {
            user = new User({ ipAddress: ip, role: 'guest' });
        }

        // Reset daily count if needed
        const now = new Date();
        const lastReset = new Date(user.lastResetDate);
        if (now.getDate() !== lastReset.getDate() || now.getMonth() !== lastReset.getMonth()) {
            user.generationsCount = 0;
            user.lastResetDate = now;
        }

        // Guest Limit: 5 per day
        if (user.role === 'guest' && user.generationsCount >= 5) {
            return res.status(429).json({ error: 'Guest limit reached (5/day). Please sign up for more.' });
        }

        if (user.generationsCount >= 50 && user.plan === 'free') {
            return res.status(429).json({ error: `Daily limit reached (50) for Free plan. Upgrade to Pro for unlimited.` });
        }

        // 2. Check Plan Restrictions
        // Restrict languages for Free plan (Python only)
        if (user.plan === 'free' && language.toLowerCase() !== 'python') {
            return res.status(403).json({ error: `You are on the Free plan. To generate ${language} documentation, please upgrade to Pro.` });
        }

        // 2. Generate Docstring
        const prompt = `Generate a ${style} style docstring for the following ${language} code. Output ONLY the docstring. Do not include any explanations or markdown formatting outside the docstring itself.\n\nCode:\n${code}`;

        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: "You are a helpful coding assistant specialized in writing high-quality docstrings."
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            model: "llama-3.3-70b-versatile",
            temperature: 0.5,
            max_tokens: 1024,
        });

        const docstring = completion.choices[0]?.message?.content || "";

        // 3. Save Generation & Update User
        const generation = new Generation({
            userId: user._id, // Linking loosely
            ipAddress: ip,
            code,
            language,
            style,
            docstring
        });
        await generation.save();

        user.generationsCount += 1;
        await user.save();

        res.json({ docstring });

    } catch (error) {
        console.error("Generation Error:", error);
        res.status(500).json({ error: 'Failed to generate docstring.' });
    }
});

// @route   GET api/generate/history
// @desc    Get user's generation history
// @access  Private
router.get('/history', optionalAuth, async (req, res) => {
    try {
        let query = {};

        if (req.user) {
            query = { userId: req.user.id };
        } else {
            // If guest, search by IP and ensure no userId is associated (or userId matches the guest user found by IP)
            // Ideally, we want generations created by this IP.
            // But wait, our save logic:
            // const generation = new Generation({ userId: user._id, ... })
            // Even guests have a User document.

            const ip = req.ip || req.connection.remoteAddress;
            const guestUser = await User.findOne({ ipAddress: ip, email: null });

            if (guestUser) {
                query = { userId: guestUser._id };
            } else {
                return res.json([]); // No guest user found for this IP
            }
        }

        const history = await Generation.find(query)
            .sort({ createdAt: -1 });
        res.json(history);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;

// @route   DELETE api/generate/history/:id
// @desc    Delete a history item
// @access  Private
router.delete('/history/:id', auth, async (req, res) => {
    try {
        const historyItem = await Generation.findById(req.params.id);

        if (!historyItem) {
            return res.status(404).json({ msg: 'History item not found' });
        }

        // Check user
        if (historyItem.userId.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'User not authorized' });
        }

        await Generation.findByIdAndDelete(req.params.id); // Use findByIdAndDelete

        res.json({ msg: 'History item removed' });
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'History item not found' });
        }
        res.status(500).send('Server Error');
    }
});

// @route   PUT api/generate/history/:id
// @desc    Update a history item (Not used in UI yet but requested)
// @access  Private
router.put('/history/:id', auth, async (req, res) => {
    try {
        const { docstring } = req.body; // Can expand to code later if needed

        let historyItem = await Generation.findById(req.params.id);

        if (!historyItem) {
            return res.status(404).json({ msg: 'History item not found' });
        }

        // Check user
        if (historyItem.userId.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'User not authorized' });
        }

        historyItem = await Generation.findByIdAndUpdate(
            req.params.id,
            { $set: { docstring } },
            { new: true }
        );

        res.json(historyItem);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});
