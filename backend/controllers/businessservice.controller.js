const BusinessService = require('../models/business_services');

// Create a new service
exports.createService = async (req, res) => {
  try {
    const service = new BusinessService(req.body);
    const result = await service.save();
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all services
exports.getAllServices = async (req, res) => {
  try {
    const services = await BusinessService.find();
    res.status(200).json(services);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get service by ID
exports.getServiceById = async (req, res) => {
  try {
    const service = await BusinessService.findById(req.params.id);
    if (!service) return res.status(404).json({ error: "Service not found" });
    res.status(200).json(service);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get service by business ID
exports.getServiceByBusinessId = async (req, res) => {
  try {
    const services = await BusinessService.find({ business_id: req.params.businessId });
    if (!services || services.length === 0) return res.status(404).json({ error: "No services found for this business" });
    res.status(200).json(services);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update service
exports.updateService = async (req, res) => {
  try {
    const updated = await BusinessService.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ error: "Service not found" });
    res.status(200).json(updated);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete service
exports.deleteService = async (req, res) => {
  try {
    const deleted = await BusinessService.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Service not found" });
    res.status(200).json({ message: "Service deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
