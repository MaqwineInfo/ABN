const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const chaptersSchema = new mongoose.Schema(
    {
        _id: {
            type: String,
            default: uuidv4,
        },
        city_id: { 
            type: String,
            ref: "cities",
            required: [true, "City ID is required"],
        },
        name: {
            type: String,
            required: [true, "Chapter name is required"],
            trim: true,
        },
        status: {
            type: String,
            enum: ["active", "inactive"],
            default: "active",
        },
        isDeleted: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
        _id: false
    }
);

module.exports = mongoose.model("chapters", chaptersSchema);