const mongoose = require('mongoose');
const { v4: uuidv4 } = require("uuid");

const meetingsSchema = new mongoose.Schema({
    _id: {
        type: String,
        default: uuidv4,
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    status: {
        type: String,
        enum: ['scheduled', 'completed', 'cancelled'],
        default: 'scheduled'
    },
    city_id: {
        type: String,
        ref: 'cities',
        required: true
    },
    chapter_id: {
        type:  String,
        ref: 'chapters',
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    start_time: {
        type: Date,
        required: true
    },
    end_time: {
        type: Date,
        required: true
    },
    address: {
        type: String,
        required: true,
        trim: true
    },
    fees: {
        type: Number,
        default: 0
    }, 
    latitude: {
        type: Number,
        required: true
    },
    longitude: {
        type: Number,
        required: true
    },
    qrCodeDataUrl: {
        type: String,
        required: true
    },
    description: {
        type: String,
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
    timestamps: true, 
});

module.exports = mongoose.model('meetings', meetingsSchema); 