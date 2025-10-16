const Meeting = require("../models/meetings");
const Event = require("../models/event.model.js");
const MeetingAttendance = require("../models/meeting_attendances");
require("../models/users");
require("../models/chapters");
require("../models/cities");

const { generateQRCodeBase64 } = require("../lib/qr-generator");
const path = require('path');
const json2csv = require('json2csv').Parser;

// Create a new meeting
exports.createMeeting = async (req, res) => {
  try {
    const meetingData = req.body;

    const requiredFields = ['title', 'city_id', 'chapter_id', 'date', 'start_time', 'end_time', 'address', 'latitude', 'longitude', 'fees'];

    for (const field of requiredFields) {
      if (!meetingData[field]) {
        return res.status(400).json({
          success: false,
          code: 400,
          message: `${field} is required.`,
        });
      }
    }

    const meetingDate = new Date(meetingData.date);
    const startTime = new Date(meetingData.start_time);
    const endTime = new Date(meetingData.end_time);

    if (isNaN(meetingDate) || isNaN(startTime) || isNaN(endTime)) {
      return res.status(400).json({
        success: false,
        code: 400,
        message: "Invalid date or time format.",
      });
    }

    if (endTime <= startTime) {
      return res.status(400).json({
        success: false,
        code: 400,
        message: "End time must be after start time.",
      });
    }

    const qrContent = JSON.stringify({
      title: meetingData.title,
      date: meetingDate.toISOString(),
      chapter_id: meetingData.chapter_id,
      city_id: meetingData.city_id,
    });

    const qrBase64 = await generateQRCodeBase64(qrContent);
    meetingData.qrCodeDataUrl = qrBase64;

    const newMeeting = new Meeting({
      ...meetingData,
      _id: uuidv4(),
      date: meetingDate,
      start_time: startTime,
      end_time: endTime,
      latitude: parseFloat(meetingData.latitude),
      longitude: parseFloat(meetingData.longitude),
      fees: parseFloat(meetingData.fees) || 0,
    });

    await newMeeting.save();

    return res.status(201).json({
      success: true,
      code: 201,
      message: "Meeting created successfully.",
      data: newMeeting,
    });
  } catch (error) {
    console.error("Error creating meeting:", error);
    return res.status(500).json({
      success: false,
      code: 500,
      message: "Unable to create meeting.",
      error: error.message,
    });
  }
};

// Mark attendance from QR code
exports.markAttendanceFromQR = async (req, res) => {
  try {
    const { qrData, user_id } = req.body;

    if (!qrData || !user_id) {
      return res.status(400).json({ error: "QR data and user_id are required." });
    }

    let qrContent;
    try {
      qrContent = JSON.parse(qrData);
    } catch (err) {
      return res.status(400).json({ error: "Invalid QR data format" });
    }

    const { title, date, chapter_id, city_id } = qrContent;
    const searchDate = new Date(date);
    searchDate.setHours(0, 0, 0, 0);

    const meeting = await Meeting.findOne({
      title,
      date: {
        $gte: searchDate,
        $lt: new Date(searchDate.getTime() + 24 * 60 * 60 * 1000)
      },
      chapter_id,
      city_id
    });

    if (!meeting) {
      return res.status(404).json({ error: "Meeting not found from QR code" });
    }

    const alreadyExists = await MeetingAttendance.findOne({
      meeting_id: meeting._id,
      user_id
    });

    if (alreadyExists) {
      return res.status(409).json({ message: "Attendance already marked for this meeting and user." });
    }

    // Mark attendance
    const attendance = new MeetingAttendance({
      meeting_id: meeting._id,
      user_id,
      attendance_status: "present"
    });

    await attendance.save();

    res.status(201).json({
      message: "Attendance recorded successfully",
      attendance
    });

  } catch (error) {
    console.error("Error marking attendance from QR:", error);
    res.status(500).json({ error: error.message });
  }
};

// Export data to CSV
exports.exportToCsv = async (req, res) => {
  try {
    const { meetingId } = req.params;

    const meeting = await Meeting.findById(meetingId);

    if (!meeting) {
      return res.status(404).json({ message: "Meeting not found." });
    }

    const attendees = await MeetingAttendance.find({ meeting_id: meetingId })
      .populate('user_id', 'first_name last_name email');

    if (!attendees || attendees.length === 0) {
      return res.status(404).json({ message: "No attendance found for this meeting" });
    }

    const formattedData = attendees.map(att => ({
      'First Name': att.user_id?.first_name || 'N/A',
      'Last Name': att.user_id?.last_name || 'N/A',
      'Email': att.user_id?.email || 'N/A',
      'Attendance Status': att.attendance_status,
      'Created At': att.created_at,
    }));

    const fields = ['First Name', 'Last Name', 'Email', 'Attendance Status', 'Created At'];
    const opts = { fields };

    const parser = new json2csv(opts);
    const csvData = parser.parse(formattedData);

    const sanitizedTitle = meeting.title
      .replace(/[^a-zA-Z0-9_\- ]/g, '')
      .replace(/\s+/g, '_');

    const filename = `${sanitizedTitle}_attendance.csv`;
    res.header('Content-Type', 'text/csv');
    res.attachment(filename);
    res.send(csvData);

  } catch (error) {
    console.error("Error exporting to CSV:", error);
    res.status(500).json({ error: error.message });
  }
};

// Get all meetings
exports.getAllMeetings = async (req, res) => {
  try {
    const meetings = await Meeting.find()
      .populate("city_id")
      .populate("chapter_id");
    res.json(meetings);
  } catch (error) {
    console.error("Error fetching all meetings:", error);
    res.status(500).json({ error: error.message });
  }
};

// Get meeting by ID
exports.getMeetingById = async (req, res) => {
  try {
    const meeting = await Meeting.findById(req.params.id)
      .populate("city_id")
      .populate("chapter_id");

    if (!meeting) {
      return res.status(404).json({ error: "Meeting not found" });
    }

    res.json(meeting);
  } catch (error) {
    console.error("Error fetching meeting by ID:", error);
    res.status(500).json({ error: error.message });
  }
};

// Update a meeting
exports.updateMeeting = async (req, res) => {
  try {
    const { id } = req.params;
    const meetingData = req.body;

    const requiredFields = ['title', 'city_id', 'chapter_id', 'date', 'start_time', 'end_time', 'address', 'latitude', 'longitude'];
    for (const field of requiredFields) {
      if (!meetingData[field]) {
        return res.status(400).json({ error: `${field} is required.` });
      }
    }

    const meetingDate = new Date(meetingData.date);
    const startTime = new Date(meetingData.start_time);
    const endTime = new Date(meetingData.end_time);

    if (endTime <= startTime) {
      return res.status(400).json({ error: "End time must be after start time." });
    }

    const updatedMeetingData = {
      ...meetingData,
      date: meetingDate,
      start_time: startTime,
      end_time: endTime,
      latitude: parseFloat(meetingData.latitude),
      longitude: parseFloat(meetingData.longitude),
      updated_at: Date.now()
    };

    const qrContent = JSON.stringify({
      title: updatedMeetingData.title,
      date: updatedMeetingData.date.toISOString(),
      chapter_id: updatedMeetingData.chapter_id,
      city_id: updatedMeetingData.city_id,
    });
    updatedMeetingData.qrCodeDataUrl = await generateQRCodeBase64(qrContent);


    const updated = await Meeting.findByIdAndUpdate(id, updatedMeetingData, {
      new: true,
      runValidators: true
    });

    if (!updated) {
      return res.status(404).json({ error: "Meeting not found" });
    }

    res.json({ message: "Meeting updated successfully", meeting: updated });
  } catch (error) {
    console.error("Error updating meeting:", error);
    res.status(400).json({ error: error.message });
  }
};

// Delete a meeting
exports.deleteMeeting = async (req, res) => {
  try {
    const deleted = await Meeting.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ error: "Meeting not found" });
    }

    res.json({ message: "Meeting deleted successfully" });
  } catch (error) {
    console.error("Error deleting meeting:", error);
    res.status(500).json({ error: error.message });
  }
};

// Get meetings scheduled for the next 30 days
exports.getNext30DaysMeetings = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const next30Days = new Date();
    next30Days.setDate(today.getDate() + 30);
    next30Days.setHours(23, 59, 59, 999);

    const meetings = await Meeting.find({
      date: { $gte: today, $lte: next30Days },
      status: 'scheduled'
    })
      .populate("city_id", "name")
      .populate("chapter_id", "name")
      .lean();
    const events = await Event.find({
      startDate: { $gte: today, $lte: next30Days },
      status: 'published'
    }).lean();

    const formattedMeetings = meetings.map(m => ({
      ...m,
      type: 'meeting'
    }));

    const formattedEvents = events.map(e => ({
      _id: e._id,
      title: e.title,
      date: e.startDate,
      start_time: e.startDate,
      end_time: e.endDate,
      status: e.status,
      city_id: { name: e.location?.city || 'N/A' },
      chapter_id: { name: 'Event' },
      type: 'event'
    }));
    const combinedData = [...formattedMeetings, ...formattedEvents];
    combinedData.sort((a, b) => new Date(a.date) - new Date(b.date));

    res.json(combinedData);

  } catch (error) {
    console.error("Error fetching upcoming activities:", error);
    res.status(500).json({ error: error.message });
  }
};