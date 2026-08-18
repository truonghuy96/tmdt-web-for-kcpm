const ImageKit = require("imagekit");

const imagekit =
  process.env.IMAGEKIT_PUBLIC_KEY &&
    process.env.IMAGEKIT_PRIVATE_KEY &&
    process.env.IMAGEKIT_URL_ENDPOINT
    ? new ImageKit({
      publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
      privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
      urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
    })
    : null;

// Helper upload lên ImageKit
const uploadToImageKit = async (fileBuffer, fileName, folder = "/techvie_products") => {
  if (!imagekit) {
    throw new Error("ImageKit chưa được cấu hình");
  }

  return new Promise((resolve, reject) => {
    imagekit.upload(
      {
        file: fileBuffer,
        fileName: fileName || `img_${Date.now()}`,
        folder: folder,
      },
      (error, result) => {
        if (error) return reject(error);

        resolve({
          url: result.url,
          fileId: result.fileId,
          provider: "imagekit",
        });
      }
    );
  });
};

const deleteFromImageKit = async (fileId) => {
  if (!imagekit) {
    throw new Error("ImageKit chưa được cấu hình");
  }

  try {
    return await imagekit.deleteFile(fileId);
  } catch (error) {
    console.error("Lỗi khi xóa ảnh trên ImageKit:", error);
    throw error;
  }
};

module.exports = {
  imagekit,
  uploadToImageKit,
  deleteFromImageKit,
};
