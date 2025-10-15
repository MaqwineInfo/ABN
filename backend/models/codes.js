const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const codesSchema = new mongoose.Schema(
    {
        _id: {
            type: String,
            default: uuidv4,
        },
        code: {
            type: String,
            required: [true, "Code is required"],
            unique: true,
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

module.exports = mongoose.model("codes", codesSchema);