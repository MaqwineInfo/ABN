const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const ruleBookSchema = new mongoose.Schema(
    {
        _id: {
            type: String,
            default: uuidv4,
        },
        content: { 
            type: String,
            required: [true, "Rule Book content is required"],
        },
        status: {  
            type: String,
            enum: ["active", "inactive"],
            default: "active",
        },
    },
    {
        timestamps: true,
        _id: false
    }
);

module.exports = mongoose.model("ruleBooks", ruleBookSchema);
