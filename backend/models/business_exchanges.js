const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const business_exchangesSchema = new mongoose.Schema(
    {
        _id: {
            type: String,
            default: uuidv4,
        },
        business_id: {
            type: String,
        },
        from_member_id: {
            type: String,
        },
        to_member_id: {
            type: String,
        },
        remarks: {
            type: String,
            required: [true, "Remarks are required"],
            trim: true,
        },
        amount: {
            type: String,
            required: [true, "Amount is required"],
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

module.exports = mongoose.model("business_exchanges", business_exchangesSchema);