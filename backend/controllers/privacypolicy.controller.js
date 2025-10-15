const PrivacyPolicy = require("../models/privacypolicies");

// Get the Privacy Policy
exports.getPrivacyPolicy = async (req, res) => {
  try {
    let privacyPolicy = await PrivacyPolicy.findOne();

    if (!privacyPolicy) { 
      privacyPolicy = new PrivacyPolicy({
        content:
          "<h1>Privacy Policy</h1><p>This is the default privacy policy content. Please update it as needed.</p>",
        status: "active",
      });
      await privacyPolicy.save();
    }

    res.status(200).json({ success: true, data: privacyPolicy });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Update or create Privacy Policy
exports.updatePrivacyPolicy = async (req, res) => {
  try {
    const { content, status } = req.body;

    const privacyPolicy = await PrivacyPolicy.findOneAndUpdate(
      {},
      { content, status },
      { new: true, runValidators: true, upsert: true }
    );

    res.status(200).json({
      success: true,
      message: "Privacy Policy updated successfully",
      data: privacyPolicy,
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};
