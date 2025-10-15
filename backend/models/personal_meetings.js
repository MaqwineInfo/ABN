const mongoose = require('mongoose');
const { v4: uuidv4 } = require("uuid");

const personal_meetingsSchema = new mongoose.Schema({
    _id: {
        type: String,
        default: uuidv4,
    },
    host_id: {
        type: String,
        ref: 'users',
        required: true
    },
     chapter_id: {
            type: String,
            ref: "chapters"
        },
    visitor_id: {
        type: String,
        ref: 'users',
        required: true
    },
    remarks: {
        type: String,
        required: true,
        trim: true
    },
    image: {
        type: String,
        required: true
    },
    latitude: {
        type: Number,
        required: true
    },
    longitude: {
        type: Number,
        required: true
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

module.exports = mongoose.model('personal_meetings', personal_meetingsSchema);  
