const TermsAndConditions = require("../models/termsAndConditions");

// Get the Terms and Conditions
exports.getTermsAndConditions = async (req, res) => {
    try {
        let termsAndConditions = await TermsAndConditions.findOne();
        if (!termsAndConditions) {
            // If no terms exist, create default
            termsAndConditions = new TermsAndConditions({
                content: "<h1>Terms and Conditions</h1><p>This is the default terms and conditions content. Please update it as needed.</p>",
                status: "active"
            });
            await termsAndConditions.save();
        }
        res.json(termsAndConditions);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update the Terms and Conditions
exports.updateTermsAndConditions = async (req, res) => {
    try {
        const { content, status } = req.body;
        const termsAndConditions = await TermsAndConditions.findOneAndUpdate(
            {}, // Find any existing terms (assuming only one)
            { content, status },
            { new: true, runValidators: true, upsert: true }
        );
        res.json({ message: "Terms and Conditions updated successfully", termsAndConditions });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};
