const mongoose = require('mongoose');

const oauth_access_tokensSchema = new mongoose.Schema({
    user_id: {
        type: String,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    scopes: {
        type: [String],
        required: true,
        default: []
    },  
    revoked: {
        type: Boolean,
        default: false
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    updated_at: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

exports = mongoose.model('oauth_access_token', oauth_access_tokensSchema);