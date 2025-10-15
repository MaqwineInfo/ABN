const BusinessExchange = require("../models/business_exchanges");
const Business = require("../models/businesses");
const mongoose = require('mongoose');

// Create a new exchange
exports.createExchange = async (req, res) => {
  try {
    const exchange = new BusinessExchange(req.body);
    await exchange.save();
    res.status(201).json({ message: "Exchange created successfully", exchange });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all exchanges
exports.getAllExchanges = async (req, res) => {
  try {
    const exchanges = await BusinessExchange.find()
      .populate("business_id")
      .populate("from_member_id")
      .populate("to_member_id");
    res.json(exchanges);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get exchange by ID
exports.getExchangeById = async (req, res) => {
  try {
    const exchange = await BusinessExchange.findById(req.params.id)
      .populate("business_id")
      .populate("from_member_id")
      .populate("to_member_id");

    if (!exchange) {
      return res.status(404).json({ error: "Exchange not found" });
    }

    res.json(exchange);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update exchange
exports.updateExchange = async (req, res) => {
  try {
    const exchange = await BusinessExchange.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    if (!exchange) {
      return res.status(404).json({ error: "Exchange not found" });
    }

    res.json({ message: "Exchange updated", exchange });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Soft delete exchange (set deleted_at)
exports.softDeleteExchange = async (req, res) => {
  try {
    const exchange = await BusinessExchange.findByIdAndUpdate(
      req.params.id,
      { deleted_at: new Date() },
      { new: true }
    );

    if (!exchange) {
      return res.status(404).json({ error: "Exchange not found" });
    }

    res.json({ message: "Exchange soft deleted", exchange });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// exports.getTotalRevenue = async (req, res) => {
//   try {
//     const { cityId, chapterId, startDate, endDate } = req.query; 

     
    
//     const userIdData = await Business.find(
//       { city_id: cityId, chapter_id: chapterId }, { user_id: 1, _id: 0 }
//     );
 

//     const flatArray = userIdData.map(obj => obj.user_id);

//     const exchange = await BusinessExchange.find(
//       { from_member_id: { $in: flatArray } },

//     );
//     const totalRevenue = exchange.reduce((acc, curr) => acc + parseFloat(curr.amount), 0);

//    return res.json({ totalRevenue }); 
//   } catch (error) {
//     console.error("Error in getTotalRevenue:", error);
//     res.status(500).json({ error: error.message });
//   }
// };


exports.getTotalRevenue = async (req, res) => {
  try {
    const { cityId, chapterId, startDate, endDate } = req.query;

    // Parse cityId and chapterId to handle multiple comma-separated IDs
    const cityIds = cityId ? cityId.split(',').map(id => id.trim()).filter(Boolean) : [];
    const chapterIds = chapterId ? chapterId.split(',').map(id => id.trim()).filter(Boolean) : [];

    // If no city or chapter is selected, and only date range is applied, return 0 revenue
    if (cityIds.length === 0 && chapterIds.length === 0 && startDate && endDate) {
      return res.json({ totalRevenue: 0 });
    }

    const businessFilter = {};
    if (cityIds.length > 0) {
      businessFilter.city_id = { $in: cityIds };
    }
    if (chapterIds.length > 0) {
      businessFilter.chapter_id = { $in: chapterIds };
    }

    let userIds = [];
    if (cityIds.length > 0 || chapterIds.length > 0) {
      const businesses = await Business.find(businessFilter, { user_id: 1, _id: 0 });
      userIds = businesses.map(b => String(b.user_id));
      
      // If no businesses found for the given city/chapter filters, return 0
      if (userIds.length === 0) {
        return res.json({ totalRevenue: 0 });
      }
    }

    const exchangeFilter = {
      deleted_at: null
    };

    if (userIds.length > 0) {
      exchangeFilter.from_member_id = { $in: userIds };
    }
    
    if (startDate && endDate) {
      exchangeFilter.created_at = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const exchanges = await BusinessExchange.find(exchangeFilter);

    const totalRevenue = exchanges.reduce((sum, item) => {
      return sum + parseFloat(item.amount || 0);
    }, 0);

    return res.json({ totalRevenue });
  } catch (error) {
    console.error("Error in getTotalRevenue:", error);
    return res.status(500).json({ error: error.message });
  }
};