const City = require("../models/cities");

// Create a new city
exports.createCity = async (req, res) => {
  try {
    const city = new City(req.body);
    await city.save();
    res.status(201).json({ message: "City created successfully", city });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all cities
exports.getAllCities = async (req, res) => {
  try {
    const cities = await City.find({ isDeleted: false }).sort({ name: 1 });
    res.json(cities);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a city by ID
exports.getCityById = async (req, res) => {
  try {
    const city = await City.findById(req.params.id);
    if (!city) return res.status(404).json({ error: "City not found" });
    res.json(city);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a city
exports.updateCity = async (req, res) => {
  try {
    const city = await City.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!city) return res.status(404).json({ error: "City not found" });
    res.json({ message: "City updated successfully", city });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Soft delete a city
exports.deleteCity = async (req, res) => {
  try {
    const { id } = req.params;

    const city = await City.findOne({ _id: id, isDeleted: false });

    if (!city) {
      return res.status(404).json({
        success: false,
        message: "City not found or already deleted",
      });
    }

    // Perform soft delete
    city.isDeleted = true;
    city.status = "inactive";
    await city.save();

    return res.status(200).json({
      success: true,
      message: "City soft deleted successfully",
      city,
    });
  } catch (error) {
    console.error("Error soft deleting city:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
