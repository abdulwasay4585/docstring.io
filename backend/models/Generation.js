const mongoose = require('mongoose');

const GenerationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId, // Can be null for guests if we don't link them to a User doc
        ref: 'User',
        required: false,
    },
    ipAddress: {
        type: String,
        required: true,
    },
    code: {
        type: String,
        required: true,
    },
    language: {
        type: String,
        required: true,
    },
    style: {
        type: String,
        required: true,
    },
    docstring: {
        type: String,
        required: true,
    },
    timestamp: {
        type: Date,
        default: Date.now,
    }
});

module.exports = mongoose.model('Generation', GenerationSchema);
