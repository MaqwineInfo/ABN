const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const business_portfoliosSchema = new mongoose.Schema(
    {
        _id: {
            type: String,
            default: uuidv4,
        },
        business_id: { 
            type: String,
            ref: "Business",
            required: [true, "Business ID is required"],
        },
        portfolio_file: {
            type: String,
            required: [true, "Portfolio name is required"],
            trim: true,
        },
        description: {
            type: String,
            required: [true, "Description is required"],
            trim: true,
        },
        created_at: {
            type: Date,
            default: Date.now,
        },
        updated_at: {
            type: Date,
            default: Date.now,
        },
        deleted_at: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
        _id: false,
    }
);

module.exports = mongoose.model("business_portfolios", business_portfoliosSchema);