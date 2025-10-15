const dotenv = require('dotenv');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const fs = require('fs');
const User = require('../models/users');
const Business = require('../models/businesses');
const bcrypt = require('bcrypt');

dotenv.config();

const s3 = new S3Client({
  region: process.env.AWS_DEFAULT_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

const sanitizeFileName = (fileName) => {
  let sanitizedFileName = fileName
    .replace(/[^a-zA-Z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .toLowerCase();
  return sanitizedFileName.length > 5 ? sanitizedFileName.substring(0, 50) : sanitizedFileName;
};

exports.uploadImage = async (req) => {
  if (!req.files || !req.files.image) {
    throw new Error("Image file is required");
  }

  const image = req.files.image;
  const sanitizedImageName = sanitizeFileName(image.name);
  const filePath = `abn/${Date.now()}_${sanitizedImageName}`;

  const uploadParams = {
    Bucket: process.env.AWS_BUCKET,
    Key: filePath,
    Body: fs.createReadStream(image.tempFilePath),
    ContentType: image.mimetype,
  };

  await s3.send(new PutObjectCommand(uploadParams));
  return `https://${process.env.AWS_BUCKET}.s3.${process.env.AWS_DEFAULT_REGION}.amazonaws.com/${filePath}`;
};

//create a new user
exports.createUser = async (req, res) => {
  try {
    if (!req.body.password) return res.status(400).json({ error: "Password is required" });
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);
    const user = new User({ ...req.body, password: hashedPassword });
    await user.save();
    res.status(201).json({ message: "User created successfully", user });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get user by ID
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// login user
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Email and password are required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: "Invalid credentials" });

    res.json({ message: "Login successful", user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Update user
exports.updateUser = async (req, res) => {
  try {
    const updates = { ...req.body };
    if (req.files && req.files.profilePicture) {
      const imageUrl = await uploadImage(req);
      updates.profilePicture = imageUrl;
    }
    if (req.body.password) {
      updates.password = await bcrypt.hash(req.body.password, 10);
    }
    const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ message: "User updated", user });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get upcoming birthdays
exports.getUpcomingBirthdays = async (req, res) => {
  try {
    const today = new Date();
    const endDate = new Date();
    endDate.setDate(today.getDate() + 30);

    const users = await User.aggregate([
      {
        $addFields: {
          dobDay: { $dayOfMonth: "$dob" },
          dobMonth: { $month: "$dob" },
        },
      },
      {
        $addFields: {
          nextBirthday: {
            $dateFromParts: {
              year: today.getFullYear(),
              month: "$dobMonth",
              day: "$dobDay",
            },
          },
        },
      },
      {
        $addFields: {
          adjustedBirthday: {
            $cond: [
              { $lt: ["$nextBirthday", today] },
              {
                $dateFromParts: {
                  year: today.getFullYear() + 1,
                  month: "$dobMonth",
                  day: "$dobDay",
                },
              },
              "$nextBirthday"
            ],
          },
        },
      },
      {
        $addFields: {
          daysUntil: {
            $floor: {
              $divide: [
                { $subtract: ["$adjustedBirthday", today] },
                1000 * 60 * 60 * 24
              ]
            }
          }
        }
      },
      {
        $match: { daysUntil: { $gte: 0, $lte: 30 } }
      },
      {
        $sort: { daysUntil: 1 }
      }
    ]);

    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// Change user password
exports.changePassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;
    if (!newPassword) return res.status(400).json({ error: "New password is required" });
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const user = await User.findByIdAndUpdate(id, { password: hashedPassword }, { new: true });
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ message: "Password updated successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get total members with optional filters
exports.getTotalMembers = async (req, res) => {
  try {
    const { cityId, chapterId, startDate, endDate } = req.query;
    const cityIds = cityId ? cityId.split(',').map(id => id.trim()).filter(Boolean) : [];
    const chapterIds = chapterId ? chapterId.split(',').map(id => id.trim()).filter(Boolean) : [];

    if (cityIds.length === 0 && chapterIds.length === 0 && startDate && endDate) {
      return res.json({ totalMembers: 0 });
    }

    if (cityIds.length === 0 && chapterIds.length === 0 && (!startDate || !endDate)) {
      const totalMembers = await User.countDocuments();
      return res.json({ totalMembers });
    }

    const businessFilter = {};
    if (cityIds.length > 0) businessFilter.city_id = { $in: cityIds };
    if (chapterIds.length > 0) businessFilter.chapter_id = { $in: chapterIds };
    if (startDate && endDate) businessFilter.joining_date = {
      $gte: new Date(startDate),
      $lte: new Date(endDate),
    };

    const businessData = await Business.find(businessFilter, { user_id: 1, _id: 0 });
    const userIds = businessData.map(b => String(b.user_id));

    if (userIds.length === 0) return res.json({ totalMembers: 0 });
    const totalMembers = await User.countDocuments({ _id: { $in: userIds } });
    return res.json({ totalMembers });
  } catch (error) {
    console.error("Error in getTotalMembers:", error);
    res.status(500).json({ error: error.message });
  }
}; 