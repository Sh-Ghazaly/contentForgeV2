const { v2: cloudinary } = require("cloudinary");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function uploadBase64Image(base64DataUrl) {
  const result = await cloudinary.uploader.upload(base64DataUrl, {
    folder: "contentforge",
  });
  return result.secure_url;
}

module.exports = { uploadBase64Image };