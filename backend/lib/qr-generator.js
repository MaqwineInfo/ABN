// lib/qr-generator.js
const QRCode = require("qrcode");

const generateQRCodeBase64 = async (textData) => {
  try {
    const qrBuffer = await QRCode.toBuffer(textData, {
      errorCorrectionLevel: "H",
      margin: 2,
      color: {
        dark: "#000000",
        light: "#ffffff"
      },
    });

    return `data:image/png;base64,${qrBuffer.toString("base64")}`;
  } catch (error) {
    throw new Error("Failed to generate QR Code: " + error.message);
  }
};

module.exports = { generateQRCodeBase64 };