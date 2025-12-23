const { v4: uuidv4 } = require("uuid");
const Membership = require("../models/membership.model");

// Create a new membership 
exports.createMembership = async (req, res) => {
  try {
    const { userId, price, paymentStatus } = req.body;

    if (!userId || !price) {
      return res.status(400).json({
        success: false,
        code: 400,
        message: "userId and price are required.",
      });
    }

    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setFullYear(endDate.getFullYear() + 1);

    const firstYear = {
      _id: uuidv4(),
      startDate,
      endDate,
      price: parseFloat(price),
      isRenewed: false,
      paymentStatus: paymentStatus || "pending",
    };

    const membership = new Membership({
      _id: uuidv4(),
      userId,
      years: [firstYear],
      isActive: true,
    });

    await membership.save();

    return res.status(201).json({
      success: true,
      code: 201,
      message: "Membership created successfully for 1 year.",
      data: membership,
    });
  } catch (error) {
    console.error("Error creating membership:", error);
    return res.status(500).json({
      success: false,
      code: 500,
      message: "Unable to create membership.",
      error: error.message,
    });
  }
};

// Renew membership  
exports.renewMembership = async (req, res) => {
  try {
    const { id } = req.params;  
    const { price, paymentStatus } = req.body;

    const membership = await Membership.findOne({ _id: id, isDeleted: false });
    if (!membership) {
      return res.status(404).json({
        success: false,
        message: "Membership not found.",
      });
    }
 
    let lastYear = membership.years[membership.years.length - 1];

    if (!lastYear) {
      return res.status(400).json({
        success: false,
        message: "No previous membership record found to renew.",
      });
    }
 
    lastYear.isRenewed = true;
 
    let startDate = new Date(lastYear.endDate);
    startDate.setDate(startDate.getDate() + 1);
 
    let endDate = new Date(startDate);
    endDate.setFullYear(endDate.getFullYear() + 1);
 
    const newYearRecord = {
      _id: uuidv4(),
      startDate,
      endDate,
      price: price || lastYear.price,
      isRenewed: false,  
      paymentStatus: paymentStatus || "pending",
    };
 
    membership.years.push(newYearRecord);
    membership.updatedAt = new Date();
    await membership.save();

    return res.status(200).json({
      success: true,
      code: 200,
      message: "Membership renewed successfully for 1 year.",
      data: membership,
    });
  } catch (error) {
    console.error("Error renewing membership:", error);
    return res.status(500).json({
      success: false,
      code: 500,
      message: "Unable to renew membership.",
      error: error.message,
    });
  }
};

// Get all memberships
exports.getAllMemberships = async (req, res) => {
  try {
    const memberships = await Membership.find({ isDeleted: false })
      .populate("userId", "first_name last_name email");

    return res.status(200).json({
      success: true,
      code: 200,
      message: "Memberships fetched successfully.",
      data: memberships,
    });
  } catch (error) {
    console.error("Error fetching memberships:", error);
    return res.status(500).json({
      success: false,
      code: 500,
      message: "Unable to fetch memberships.",
      error: error.message,
    });
  }
};

// Soft delete membership
exports.deleteMembership = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedMembership = await Membership.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { isDeleted: true, updatedAt: new Date() },
      { new: true }
    );

    if (!deletedMembership) {
      return res.status(404).json({
        success: false,
        code: 404,
        message: "Membership not found or already deleted.",
      });
    }

    return res.status(200).json({
      success: true,
      code: 200,
      message: "Membership deleted successfully.",
      data: deletedMembership,
    });
  } catch (error) {
    console.error("Error deleting membership:", error);
    return res.status(500).json({
      success: false,
      code: 500,
      message: "Unable to delete membership.",
      error: error.message,
    });
  }
};

const stripTime = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

// Get memberships expiring in the next 30 days
exports.getExpiringMemberships = async (req, res) => {
  try {
    const today = stripTime(new Date());
    const next30Days = new Date(today);
    next30Days.setDate(today.getDate() + 30);

    const memberships = await Membership.find({
      isDeleted: false,
      isActive: true,
    }).populate("userId", "first_name last_name email");

    const expiringMemberships = [];

    memberships.forEach((membership) => {
      membership.years.forEach((year) => {
        const endDate = stripTime(new Date(year.endDate));

        // ✅ Show all unrenewed memberships that expire within 30 days
        if (
          !year.isRenewed &&
          endDate >= today &&
          endDate <= next30Days
        ) {
          expiringMemberships.push({
            membershipId: membership._id,
            yearId: year._id,
            user: membership.userId,
            remainingDays: Math.ceil((endDate - today) / (1000 * 60 * 60 * 24)),
            ...year.toObject ? year.toObject() : year,
          });
        }
      });
    });

    if (!expiringMemberships.length) {
      return res.status(404).json({
        success: false,
        code: 404,
        message: "No memberships expiring in the next 30 days.",
        user: [],
      });
    }

    return res.status(200).json({
      success: true,
      code: 200,
      message: "Expiring memberships fetched successfully.",
      data: expiringMemberships,
    });
  } catch (error) {
    console.error("Error fetching expiring memberships:", error);
    return res.status(500).json({
      success: false,
      code: 500,
      message: "Unable to fetch expiring memberships.",
      error: error.message,
    });
  }
};