const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const dotenv = require('dotenv');
dotenv.config();

// Configure the AWS S3 client
const s3 = new S3Client({
  region: process.env.AWS_DEFAULT_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
}); 

const uploadBase64ToS3 = async (base64String, fileNamePrefix) => { 
  if (!base64String || typeof base64String !== 'string') {
    return null;
  }
 
  const match = base64String.match(/^data:(.+);base64,(.+)$/);
  if (!match) {
    console.error("Invalid Base64 string format received.");
    return null;  
  }

  const contentType = match[1];  
  const base64Data = match[2];   
  const fileExtension = contentType.split('/')[1];
 
  const fileContent = Buffer.from(base64Data, 'base64');
 
  const filePath = `abn/${fileNamePrefix}-${Date.now()}.${fileExtension}`;

  const uploadParams = {
    Bucket: process.env.AWS_BUCKET,
    Key: filePath,
    Body: fileContent,
    ContentType: contentType,
  };

  try { 
    await s3.send(new PutObjectCommand(uploadParams)); 
    return `https://${process.env.AWS_BUCKET}.s3.${process.env.AWS_DEFAULT_REGION}.amazonaws.com/${filePath}`;
  } catch (error) {
    console.error("Error uploading to S3:", error); 
    throw new Error("S3 upload failed");
  }
};

module.exports = { uploadBase64ToS3 };