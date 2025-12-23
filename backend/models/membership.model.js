const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const yearRecordSchema = new mongoose.Schema(
  {
    _id: { type: String, default: uuidv4 },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    price: { type: Number, required: true },
    isRenewed: { type: Boolean, default: false },
    paymentStatus: {
      type: String,
      enum: ["paid", "unpaid", "pending"],
      default: "pending",
    },
  },
  { _id: false }  
);

const membershipSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: uuidv4,
    },
    userId: {
      type: String,
      ref: "users",
      required: [true, "User ID is required"],
    },
    years: {
      type: [yearRecordSchema], 
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
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

// Middleware to update updatedAt
membershipSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model("Membership", membershipSchema);
