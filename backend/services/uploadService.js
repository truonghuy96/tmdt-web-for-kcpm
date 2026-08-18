const { uploadToImageKit, deleteFromImageKit } = require("../config/imagekit");
const { uploadToCloudinary, deleteFromCloudinary } = require("../config/cloudinary");

/**
 * Upload ảnh với cơ chế Fallback (ImageKit -> Cloudinary)
 */
const uploadImage = async (fileBuffer, fileName, folder = "techvie_products") => {
  try {
    console.log("Đang thử upload lên ImageKit (Primary)...");
    const result = await uploadToImageKit(fileBuffer, fileName, `/${folder}`);
    console.log("Upload ImageKit thành công!");
    return result;
  } catch (imagekitError) {
    console.warn("Upload ImageKit thất bại, tự động chuyển sang Cloudinary (Fallback)... Error:", imagekitError.message || imagekitError);

    try {
      const cloudinaryUrl = await uploadToCloudinary(fileBuffer, folder);
      console.log("Upload Cloudinary (Fallback) thành công!");
      return {
        url: cloudinaryUrl,
        fileId: null,
        provider: "cloudinary",
      };
    } catch (cloudinaryError) {
      console.error("Upload thất bại trên cả 2 dịch vụ (ImageKit & Cloudinary)!");
      throw cloudinaryError;
    }
  }
};

/**
 * Xóa ảnh dựa trên provider
 */
const deleteImage = async (fileId, provider) => {
  if (provider === "imagekit") {
    return await deleteFromImageKit(fileId);
  } else if (provider === "cloudinary") {
    return await deleteFromCloudinary(fileId);
  }
};

module.exports = {
  uploadImage,
  deleteImage,
};
