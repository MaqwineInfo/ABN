const BusinessPortfolio = require("../models/business_portfolios");

// Create a new portfolio
exports.createPortfolio = async (req, res) => {
  try {
    const portfolio = new BusinessPortfolio(req.body);
    await portfolio.save();
    res.status(201).json({ message: "Portfolio created successfully", portfolio });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all portfolios
exports.getAllPortfolios = async (req, res) => {
  try {
    const portfolios = await BusinessPortfolio.find().populate("business_id");
    res.json(portfolios);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a single portfolio by ID
exports.getPortfolioById = async (req, res) => {
  try {
    const portfolio = await BusinessPortfolio.findById(req.params.id).populate("business_id");
    if (!portfolio) {
      return res.status(404).json({ error: "Portfolio not found" });
    }
    res.json(portfolio);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a portfolio
exports.updatePortfolio = async (req, res) => {
  try {
    const portfolio = await BusinessPortfolio.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!portfolio) {
      return res.status(404).json({ error: "Portfolio not found" });
    }
    res.json({ message: "Portfolio updated", portfolio });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Soft delete a portfolio (mark deleted_at)
exports.softDeletePortfolio = async (req, res) => {
  try {
    const portfolio = await BusinessPortfolio.findByIdAndUpdate(
      req.params.id,
      { deleted_at: new Date() },
      { new: true }
    );
    if (!portfolio) {
      return res.status(404).json({ error: "Portfolio not found" });
    }
    res.json({ message: "Portfolio soft deleted", portfolio });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
