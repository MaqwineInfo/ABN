const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const userSchema = new mongoose.Schema(
    {
        _id: {  
            type: String,
            default: uuidv4,
        },
        first_name: {
            type: String,
            required: [true, "First name is required"],
            trim: true,
        },
        last_name: {
            type: String,
            required: [true, "Last name is required"],
            trim: true,
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            trim: true,
            lowercase: true,
            unique: true,
            match: [
                /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
                "Please enter a valid email",
            ],
        },
        phone: {
            type: String,
            // required: [true, "Phone number is required"],
            trim: true,
            unique: true,
            match: [/^\d{10}$/, "Please enter a valid phone number"],
        },
        dob: {
            type: Date,
            required: [true, "Date of birth is required"],
        },
        profile_picture: {
            type: String,
            default: "default-profile.png",
        },

        account_status: {
            type: String,
            enum: ["approved", "pending", "rejected", "active"],
            default: "active",
        },
        password: {
            type: String,
            required: [true, "Password is required"],
            minlength: [6, "Password must be at least 6 characters long"],
        },
        code: {
            type: String,
            ref: "Referral",
        },
        role: {
            type: String,
            required: true,
            enum: ["user", "admin", "member"],
            default: "user",
        },
        createdAt: {
            type: Date,
            default: Date.now,
        },
        updatedAt: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("users", userSchema); 