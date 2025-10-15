const mongoose = require('mongoose');
const { v4: uuidv4 } = require("uuid");

const serviceSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: uuidv4,
    },
    business_id: {
      type: String,
      ref: 'businesses',
      required: true,
    },
    service_title: {
      type: String,
      required: true,
      trim: true,
    },
    created_at: {
      type: Date,
      required: true,
    },
    updated_at: {
      type: Date,
      required: true,
    },
    deleted_at: {
      type: Date,
      default: null,
    }
  },
  {
    timestamps: true, 
  });

module.exports = mongoose.model('business_services', serviceSchema);
