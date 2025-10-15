const mongoose = require('mongoose');
const { v4: uuidv4 } = require("uuid");

const reference_passesSchema = new mongoose.Schema({
    _id: {
        type: String,
        default: uuidv4,
    },
    from_member_id: {
        type: String,
        ref: 'users',
        required: true
    },
    to_member_id: {
        type: String,
        ref: 'users',  
        required: true
    },
    date: {
        type: Date,
        default: Date.now,
        required: true
    },
    remarks: {
        type: String,
        required: true,
        trim: true
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

module.exports = mongoose.model('reference_passes', reference_passesSchema);
