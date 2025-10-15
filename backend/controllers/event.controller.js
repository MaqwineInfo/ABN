const Event = require("../models/event.model.js");
const dotenv = require("dotenv");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const fs = require("fs");

dotenv.config();

const s3 = new S3Client({
  region: process.env.AWS_DEFAULT_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Sanitize filenames
const sanitizeFileName = (fileName) => {
  let sanitizedFileName = fileName
    .replace(/[^a-zA-Z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .toLowerCase();
  return sanitizedFileName.length > 5
    ? sanitizedFileName.substring(0, 50)
    : sanitizedFileName;
};

// Upload file to S3
const uploadFileToS3 = async (file) => {
  if (!file) return null;

  const sanitizedImageName = sanitizeFileName(file.name);
  const filePath = `abn/${Date.now()}_${sanitizedImageName}`;

  const uploadParams = {
    Bucket: process.env.AWS_BUCKET,
    Key: filePath,
    Body: fs.createReadStream(file.tempFilePath),
    ContentType: file.mimetype,
  };

  try {
    await s3.send(new PutObjectCommand(uploadParams));
    fs.unlinkSync(file.tempFilePath);
    return `https://${process.env.AWS_BUCKET}.s3.${process.env.AWS_DEFAULT_REGION}.amazonaws.com/${filePath}`;
  } catch (error) {
    console.error("Error uploading to S3:", error);
    if (fs.existsSync(file.tempFilePath)) fs.unlinkSync(file.tempFilePath);
    throw new Error("S3 upload failed");
  }
};

// Create Event
exports.createEvent = async (req, res) => {
  try {
    let coverImageUrl = null;
    let galleryUrls = [];

    if (req.files?.coverImage) {
      coverImageUrl = await uploadFileToS3(req.files.coverImage);
    }

    if (req.files?.gallery) {
      const galleryFiles = Array.isArray(req.files.gallery)
        ? req.files.gallery
        : [req.files.gallery];
      galleryUrls = await Promise.all(
        galleryFiles.map((file) => uploadFileToS3(file))
      );
    }

    const event = new Event({
      ...req.body,
      coverImage: coverImageUrl,
      gallery: galleryUrls,
    });

    await event.save();
    res.status(201).json({ success: true, data: event });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// Update Event
exports.updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event)
      return res
        .status(404)
        .json({ success: false, message: "Event not found" });

    if (req.files?.coverImage) {
      event.coverImage = await uploadFileToS3(req.files.coverImage);
    }

    if (req.files?.gallery) {
      const galleryFiles = Array.isArray(req.files.gallery)
        ? req.files.gallery
        : [req.files.gallery];
      const newGalleryUrls = await Promise.all(
        galleryFiles.map((file) => uploadFileToS3(file))
      );
      event.gallery.push(...newGalleryUrls);
    }

    Object.assign(event, req.body);
    await event.save();

    res.json({ success: true, data: event });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// Get Events
exports.getEvents = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;
    const query = {};

    if (status) query.status = status;

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { subtitle: { $regex: search, $options: "i" } },
      ];
    }

    const events = await Event.find(query)
      .sort({ startDate: 1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Event.countDocuments(query);

    res.json({
      success: true,
      data: events,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching events",
      error: error.message,
    });
  }
};

// Get Event by ID
exports.getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event)
      return res
        .status(404)
        .json({ success: false, message: "Event not found" });

    res.json({ success: true, data: event });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching event",
      error: error.message,
    });
  }
};
