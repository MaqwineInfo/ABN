const mongoose = require('mongoose');
const { v4: uuidv4 } = require("uuid");

const asksSchema = new mongoose.Schema({
    _id: {
        type: String,
        default: uuidv4,
    },
    user_id: {
        type: String,
        ref: 'users',
        required: true
    },
    ask_type: {
        type: String,
        enum: ['ask', 'give'],
        required: true,
    },
    ask_description: {
        type: String,
        required: true,
        trim: true
    },
    fulfilled_by: { 
        type: String,
        ref: 'users',
        default: null
    },
    status: {
        type: String,
        enum: ['pending', 'fulfilled', 'rejected'],
        default: 'pending'
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
    timestamps: true,
    _id: false
});

module.exports = mongoose.model('Asks', asksSchema);
// module.exports = mongoose.model("User", userSchema);