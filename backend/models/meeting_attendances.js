const mongoose = require('mongoose'); 
const { v4: uuidv4 } = require("uuid");

const meeting_attendancesSchema = new mongoose.Schema(
    {
        _id: {
            type: String,
            default: uuidv4,
        },
        meeting_id: {
            type: String,
            ref: 'meetings',
            required: true
        },
        user_id: {
            type: String,
            ref: 'users',
            required: true
        },
        attendance_status: {
            type: String,  
            required: true,
        },
        created_at: {
            type: Date,
            default: Date.now
        },
        updated_at: {
            type: Date,
            default: Date.now
        }
    },
    {   
        timestamps: true,  
    }
);

module.exports = mongoose.model("meeting_attendances", meeting_attendancesSchema);