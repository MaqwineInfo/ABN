const mongoose = require("mongoose");

const { Schema } = mongoose;

const TicketSchema = new Schema({
  type: { type: String, required: true, trim: true },
  price: { type: Number, required: true, min: 0 },
  currency: { type: String, default: "INR", trim: true },
  quantity: { type: Number, default: 0 },
  availableFrom: Date,
  availableUntil: Date,
});

const SpeakerSchema = new Schema({
  name: { type: String, required: true, trim: true },
  title: { type: String, trim: true },
  bio: { type: String, trim: true },
  photoUrl: String,
  socialLinks: {
    linkedin: String,
    twitter: String,
    website: String,
  },
});

const AgendaItemSchema = new Schema({
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  title: { type: String, required: true },
  description: String,
});

const EventSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    subtitle: { type: String, trim: true },
    description: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    location: {
      type: {
        venue: String,
        address: String,
        city: String,
        state: String,
        postalCode: String,
        country: String,
        latitude: Number,
        longitude: Number,
      },
      required: true,
    },
    isOnline: { type: Boolean, default: false },
    onlineUrl: { type: String, trim: true },
    coverImage: String,
    gallery: [String],
    agenda: [AgendaItemSchema],
    speakers: [SpeakerSchema],
    tickets: [TicketSchema],
    faqs: [
      {
        question: { type: String, required: true },
        answer: { type: String, required: true },
      },
    ],
    contact: { email: String, phone: String },
    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "draft",
    },
    tags: [String],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Event", EventSchema);
