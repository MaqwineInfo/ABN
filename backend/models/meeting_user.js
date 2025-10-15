const mongoose = require('mongoose');
const { v4: uuidv4 } = require("uuid");

const meeting_userSchema = new mongoose.Schema({
    _id: {
        type: String,
        default: uuidv4,
    },
    userId: {
        type: String,
        ref: 'User',
        required: true
    },
    meetingId: {
        type: String,
        ref: 'Meeting',
        required: true
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
    timestamps: true,
    _id: false
});

const MeetingUser = mongoose.model('MeetingUser', meeting_userSchema);