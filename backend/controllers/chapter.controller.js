const Chapter = require("../models/chapters");

// Create a new chapter
exports.createChapter = async (req, res) => {
    try {
        const chapter = new Chapter(req.body);
        await chapter.save();
        res.status(201).json({ message: "Chapter created successfully", chapter });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Get all chapters (optionally populate city)
exports.getAllChapters = async (req, res) => {
    try { 
        const chapters = await Chapter.find({ isDeleted: false }).populate("city_id", "name");
        res.json(chapters);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get a chapter by ID
exports.getChapterById = async (req, res) => {
    try { 
        const chapter = await Chapter.findOne({ _id: req.params.id, isDeleted: false }).populate("city_id", "name");
        if (!chapter) return res.status(404).json({ error: "Chapter not found" });
        res.json(chapter);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get chapters by city
exports.getChaptersByCity = async (req, res) => {
    try {
        const chapters = await Chapter.find({ city_id: req.params.city }).populate("city_id", "name");
        if (chapters.length === 0) return res.status(404).json({ error: "No chapters found for this city" });
        res.json(chapters);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update chapter
exports.updateChapter = async (req, res) => {
    try {
        const chapter = await Chapter.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        if (!chapter) return res.status(404).json({ error: "Chapter not found" });
        res.json({ message: "Chapter updated successfully", chapter });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Delete chapter
exports.deleteChapter = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("Deleting chapter with ID:", id);
 
    const chapter = await Chapter.findOne({ _id: id, isDeleted: false });
    console.log("Found chapter:", chapter);
    if (!chapter) {
      return res.status(404).json({
        success: false,
        message: "Chapter not found or already deleted",
      });
    }

    // Perform soft delete
    chapter.isDeleted = true;
    chapter.status = "inactive";
    await chapter.save();

    res.status(200).json({
      success: true,
      message: "Chapter soft deleted successfully",
      chapter,
    });
  } catch (error) {
    console.error("Error soft deleting chapter:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

