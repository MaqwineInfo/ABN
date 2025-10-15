const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const citiesSchema = new mongoose.Schema(
    {
        _id: {
            type: String,
            default: uuidv4,
        },
        name: {
            type: String,
            required: [true, "City name is required"],
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

module.exports = mongoose.model("cities", citiesSchema);