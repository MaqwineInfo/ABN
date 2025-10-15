const PersonalMeeting = require('../models/personal_meetings');
const Business = require("../models/businesses");
const personal_meetings = require('../models/personal_meetings');

// Create new personal meeting  
exports.createPersonalMeeting = async (req, res) => {
  try {
    const personalMeetingData = {
      ...req.body,
      host_id: req.user._id, // Assuming user ID is available in req.user
    };

    const personalMeeting = new PersonalMeeting(personalMeetingData);
    await personalMeeting.save();

    res.status(201).json({ message: "Personal meeting created successfully", personalMeeting });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all personal meetings for a user  
exports.getAllPersonalMeetings = async (req, res) => {
  try {
    const personalMeetings = await PersonalMeeting.find({ host_id: req.user._id }).populate('visitor_id', 'name email');
    res.json(personalMeetings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a single personal meeting by ID 
exports.getPersonalMeetingById = async (req, res) => {
  try {
    const personalMeeting = await PersonalMeeting.findById(req.params.id).populate('visitor_id', 'name email');
    if (!personalMeeting) return res.status(404).json({ error: "Personal meeting not found" });
    res.json(personalMeeting);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update personal meeting
exports.updatePersonalMeeting = async (req, res) => {
  try {
    const updates = { ...req.body, updated_at: Date.now() };

    const personalMeeting = await PersonalMeeting.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!personalMeeting) return res.status(404).json({ error: "Personal meeting not found" });

    res.json({ message: "Personal meeting updated successfully", personalMeeting });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete personal meeting 
exports.deletePersonalMeeting = async (req, res) => {
  try {
    const personalMeeting = await PersonalMeeting.findByIdAndDelete(req.params.id);
    if (!personalMeeting) return res.status(404).json({ error: "Personal meeting not found" });

    res.json({ message: "Personal meeting deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all personal meetings for a visitor  
exports.getVisitorPersonalMeetings = async (req, res) => {
  try {
    const personalMeetings = await PersonalMeeting.find({ visitor_id: req.user._id }).populate('host_id', 'name email');
    res.json(personalMeetings);
  }
  catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Get all personal meetings by host ID  
exports.getPersonalMeetingsByHostId = async (req, res) => {
  try {
    const personalMeetings = await PersonalMeeting.find({ host_id: req.params.hostId }).populate('visitor_id', 'name email');
    res.json(personalMeetings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}; 

// Get total personal meetings based on filters
exports.getTotalPersonalMeetings = async (req, res) => {
  try {
    const { cityId, chapterId, startDate, endDate } = req.query;

    // Parse cityId and chapterId to handle multiple comma-separated IDs
    const cityIds = cityId ? cityId.split(',').map(id => id.trim()).filter(Boolean) : [];
    const chapterIds = chapterId ? chapterId.split(',').map(id => id.trim()).filter(Boolean) : [];

    // If no city or chapter is selected, and only date range is applied, return 0 meetings
    if (cityIds.length === 0 && chapterIds.length === 0 && startDate && endDate) {
      return res.json({ totalPersonalMeetings: 0 });
    }

    let hostUserIds = []; 

    if (cityIds.length > 0 || chapterIds.length > 0) {
      const businessFilter = {};
      if (cityIds.length > 0) {
        businessFilter.city_id = { $in: cityIds };
      }
      if (chapterIds.length > 0) {
        businessFilter.chapter_id = { $in: chapterIds };
      }

      const businessData = await Business.find(businessFilter, { user_id: 1, _id: 0 });
      hostUserIds = businessData.map(b => String(b.user_id));

      if (hostUserIds.length === 0) {
        return res.json({ totalPersonalMeetings: 0 });
      }
    } 
    const meetingsFilter = {};

    if (hostUserIds.length > 0) {
      meetingsFilter.host_id = { $in: hostUserIds };
    } 
    if (startDate && endDate) {
      meetingsFilter.created_at = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
 
    const meetings = await personal_meetings.find(meetingsFilter);
    const totalMeetings = meetings.length;
 
    return res.json({ totalPersonalMeetings: totalMeetings });

  } catch (error) {
    console.error("Error in getTotalPersonalMeetings:", error);
    res.status(500).json({ error: error.message });
  }
};