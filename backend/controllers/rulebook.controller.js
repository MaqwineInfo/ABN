const RuleBook = require("../models/rulebooks");

// Get the Rule Book
exports.getRuleBook = async (req, res) => {
    try {
        let ruleBook = await RuleBook.findOne();
        if (!ruleBook) { 
            ruleBook = new RuleBook({
                content: "<h1>Rule Book</h1><p>This is the default rule book content. Please update it as needed.</p>",
                status: "active"
            });
            await ruleBook.save();
        }
        res.json(ruleBook);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update the Rule Book
exports.updateRuleBook = async (req, res) => {
    try {
        const { content, status } = req.body;
        const ruleBook = await RuleBook.findOneAndUpdate(
            {},  
            { content, status },
            { new: true, runValidators: true, upsert: true }
        );
        res.json({ message: "Rule Book updated successfully", ruleBook });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};
