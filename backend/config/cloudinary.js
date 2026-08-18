const cloudinary = require("cloudinary").v2;
const multer = require("multer");

// Cấu hình SDK Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Cấu hình bộ nhớ tạm thời bằng Multer (lưu dạng Buffer)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Helper để upload file buffer lên Cloudinary
const uploadToCloudinary = (fileBuffer, folder = "techvie_products") => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: folder },
      (error, result) => {
        if (error) return reject(error);
        if (result) return resolve(result.secure_url);
        return reject(new Error("Upload thất bại không rõ nguyên nhân"));
      }
    );
    uploadStream.end(fileBuffer);
  });
};

// Helper để xóa file trên Cloudinary bằng public_id
const deleteFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error("Lỗi khi xóa ảnh trên Cloudinary:", error);
    throw error;
  }
};

module.exports = {
  upload,
  uploadToCloudinary,
  deleteFromCloudinary,
};
