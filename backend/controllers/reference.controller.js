const ReferencePass = require("../models/reference_passes");
const Business = require("../models/businesses");

// Create new reference pass
exports.createReferencePass = async (req, res) => {
  try {
    const referencePass = new ReferencePass(req.body);
    await referencePass.save();
    res.status(201).json({ message: "Reference pass created successfully", referencePass });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all reference passes
exports.getAllReferencePasses = async (req, res) => {
  try {
    const referencePasses = await ReferencePass.find()
      .populate("from_member_id")
      .populate("to_member_id");
    res.json(referencePasses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get single reference pass by ID
exports.getReferencePassById = async (req, res) => {
  try {
    const referencePass = await ReferencePass.findById(req.params.id)
      .populate("from_member_id")
      .populate("to_member_id");
    if (!referencePass) return res.status(404).json({ error: "Reference pass not found" });
    res.json(referencePass);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update reference pass
exports.updateReferencePass = async (req, res) => {
  try {
    const referencePass = await ReferencePass.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!referencePass) return res.status(404).json({ error: "Reference pass not found" });
    res.json({ message: "Reference pass updated", referencePass });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete reference pass
exports.deleteReferencePass = async (req, res) => {
  try {
    const referencePass = await ReferencePass.findByIdAndDelete(req.params.id);
    if (!referencePass) return res.status(404).json({ error: "Reference pass not found" });
    res.json({ message: "Reference pass deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get total reference passes based on filters
exports.getTotalReferencePasses = async (req, res) => {
  try {
    const { cityId, chapterId, startDate, endDate } = req.query;

    // Parse cityId and chapterId to handle multiple comma-separated IDs
    const cityIds = cityId ? cityId.split(',').map(id => id.trim()).filter(Boolean) : [];
    const chapterIds = chapterId ? chapterId.split(',').map(id => id.trim()).filter(Boolean) : [];

    // If no city or chapter is selected, and only date range is applied, return 0 references
    if (cityIds.length === 0 && chapterIds.length === 0 && startDate && endDate) {
      return res.json({ totalReferencePasses: 0 });
    }

    let fromUserIds = [];
    
    if (cityIds.length > 0 || chapterIds.length > 0) {
      const businessFilter = {};
      if (cityIds.length > 0) {
        businessFilter.city_id = { $in: cityIds };
      }
      if (chapterIds.length > 0) {
        businessFilter.chapter_id = { $in: chapterIds };
      }
      const businessData = await Business.find(businessFilter, { user_id: 1, _id: 0 });
      fromUserIds = businessData.map(b => String(b.user_id));
      
      if (fromUserIds.length === 0) {
        return res.json({ totalReferencePasses: 0 });
      }
    } 
    const referenceFilter = {};
    if (fromUserIds.length > 0) {
      referenceFilter.from_member_id = { $in: fromUserIds };
    } 
    if (startDate && endDate) {
      referenceFilter.created_at = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    } 
    const references = await ReferencePass.find(referenceFilter);
    const totalReferences = references.length;
    res.json({ totalReferencePasses: totalReferences });
  } catch (error) {
    console.error("Error in getTotalReferencePasses:", error);
    res.status(500).json({ error: error.message });
  }
};

