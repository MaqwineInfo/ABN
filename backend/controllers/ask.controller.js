const Ask = require("../models/asks");

// Create Ask
exports.createAsk = async (req, res) => {
  try {
    const ask = new Ask(req.body);
    await ask.save();
    res.status(201).json({ message: "Ask created successfully", ask });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all Asks
exports.getAllAsks = async (req, res) => {
  try {
    const asks = await Ask.find().populate("user_id", "first_name last_name email");
    res.json(asks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get single Ask by ID
exports.getAskById = async (req, res) => {
  try {
    const ask = await Ask.findById(req.params.id).populate("user_id", "first_name last_name email");
    if (!ask) return res.status(404).json({ error: "Ask not found" });
    res.json(ask);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update Ask
exports.updateAsk = async (req, res) => {
  try {
    const ask = await Ask.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!ask) return res.status(404).json({ error: "Ask not found" });
    res.json({ message: "Ask updated", ask });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete Ask
exports.deleteAsk = async (req, res) => {
  try {
    const ask = await Ask.findByIdAndDelete(req.params.id);
    if (!ask) return res.status(404).json({ error: "Ask not found" });
    res.json({ message: "Ask deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
