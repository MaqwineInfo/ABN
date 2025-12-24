const Business = require("../models/businesses");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const dotenv = require('dotenv'); 
const fs = require('fs'); 

dotenv.config();

const s3 = new S3Client({
  region: process.env.AWS_DEFAULT_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_ACCESS_KEY,
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

// Create a new business with file uploads
exports.createBusiness = async (req, res) => {
    try { 
        const businessData = req.body; 
        const [
            profilePictureUrl,
            businessLogoUrl,
            businessCardFrontUrl,
            businessCardBackUrl,
            portfolioImageUrls
        ] = await Promise.all([
            uploadFileToS3(businessData.profile_picture, 'profile-pic'),
            uploadFileToS3(businessData.business_logo, 'logo'),
            uploadFileToS3(businessData.business_card_front, 'card-front'),
            uploadFileToS3(businessData.business_card_back, 'card-back'),
            Promise.all((businessData.portfolio_images || []).map(base64 => uploadFileToS3(base64, 'portfolio')))
        ]);
 
        const newBusiness = new Business({
            ...businessData,
            profile_picture: profilePictureUrl,
            business_logo: businessLogoUrl,
            business_card_front: businessCardFrontUrl,
            business_card_back: businessCardBackUrl, 
            portfolio_images: portfolioImageUrls.filter(url => url !== null),
        });

        await newBusiness.save();
        res.status(201).json({ message: "Business created", business: newBusiness });
    } catch (error) {
        console.error("Error creating business:", error);
        res.status(400).json({ error: error.message });
    }
};

// Get all businesses
exports.getAllBusinesses = async (req, res) => {
  try {
    const businesses = await Business.find()
      .populate("user_id")
      .populate("city_id")
      .populate("chapter_id");
    res.json(businesses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get single business by ID
exports.getBusinessById = async (req, res) => {
  try {
    const business = await Business.findById(req.params.id)
      .populate("user_id")
      .populate("city_id")
      .populate("chapter_id");
    if (!business) return res.status(404).json({ error: "Business not found" });
    res.json(business);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update business
exports.updateBusiness = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body; 
        const isNewBase64Upload = (value) => {
            return value && typeof value === 'string' && value.startsWith('data:image');
        }; 
        const [
            profilePictureUrl,
            businessLogoUrl,
            businessCardFrontUrl,
            businessCardBackUrl
        ] = await Promise.all([
            isNewBase64Upload(updateData.profile_picture)
                ? uploadFileToS3(updateData.profile_picture, 'profile-pic')
                : Promise.resolve(updateData.profile_picture),

            isNewBase64Upload(updateData.business_logo)
                ? uploadFileToS3(updateData.business_logo, 'logo')
                : Promise.resolve(updateData.business_logo),

            isNewBase64Upload(updateData.business_card_front)
                ? uploadFileToS3(updateData.business_card_front, 'card-front')
                : Promise.resolve(updateData.business_card_front),

            isNewBase64Upload(updateData.business_card_back)
                ? uploadFileToS3(updateData.business_card_back, 'card-back')
                : Promise.resolve(updateData.business_card_back)
        ]);
 
        const portfolioImageUrls = await Promise.all(
            (updateData.portfolio_images || []).map(image =>
                isNewBase64Upload(image)
                    ? uploadFileToS3(image, 'portfolio')
                    : Promise.resolve(image)
            )
        ); 
        const finalUpdatePayload = {
            ...updateData, 
            profile_picture: profilePictureUrl,
            business_logo: businessLogoUrl,
            business_card_front: businessCardFrontUrl,
            business_card_back: businessCardBackUrl,
            portfolio_images: portfolioImageUrls.filter(url => url),  
        };
 
        const updatedBusiness = await Business.findByIdAndUpdate(id, finalUpdatePayload, {
            new: true, 
            runValidators: true, 
        });

        if (!updatedBusiness) {
            return res.status(404).json({ error: "Business not found" });
        }

        res.json({ message: "Business updated successfully", business: updatedBusiness });

    } catch (error) {
        console.error("Error updating business:", error);
        res.status(400).json({ error: error.message });
    }
};

// Delete business
exports.deleteBusiness = async (req, res) => {
  try {
    const business = await Business.findByIdAndDelete(req.params.id);
    if (!business) return res.status(404).json({ error: "Business not found" });
    res.json({ message: "Business deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all businesses by user ID city chapter business name
exports.getBusinessesByUserId = async (req, res) => {
  try {
    const businesses = await Business.find({ user_id: req.params.userId })
      .populate("user_id")
      .populate("city_id")
      .populate("chapter_id");
    res.json(businesses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};