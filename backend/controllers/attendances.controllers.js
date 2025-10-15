const MeetingAttendance = require("../models/meeting_attendances");
const Meeting = require("../models/meetings");
const User = require("../models/users");

// GET total attendances for a specific meeting
exports.getTotalAttendances = async (req, res) => {
    try {
        const { meetingId } = req.params; 
        if (!meetingId) {
            return res.status(400).json({ message: "Meeting ID is required" });
        } 
        const meeting = await Meeting.findById(meetingId);
        if (!meeting) {
            return res.status(404).json({ message: "Meeting not found" });
        } 
        const totalAttendances = await MeetingAttendance.countDocuments({ meeting_id: meetingId });

        res.status(200).json({ totalAttendances });
    } catch (error) {
        console.error("Error fetching total attendances:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

// GET all attendees for a specific meeting with user details
exports.getAttendeesDetails = async (req, res) => {
    try {
        const { meetingId } = req.params;

        if (!meetingId) {
            return res.status(400).json({ message: "Meeting ID is required" });
        }

        const attendees = await MeetingAttendance.find({ meeting_id: meetingId })
            .populate('user_id', 'name email');  

        res.status(200).json(attendees);
    } catch (error) {
        console.error("Error fetching attendees details:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
