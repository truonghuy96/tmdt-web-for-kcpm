const fs = require("fs");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
const { uploadToImageKit } = require("../config/imagekit");

const frontendAssetsDir = path.join(__dirname, "../../frontend/src/assets");
const outputFile = path.join(__dirname, "../../frontend/src/config/imagekitAssets.json");

// Đọc tất cả các file ảnh đệ quy trong thư mục
function getAllFiles(dirPath, arrayOfFiles = []) {
  if (!fs.existsSync(dirPath)) return arrayOfFiles;

  const files = fs.readdirSync(dirPath);

  files.forEach((file) => {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
    } else {
      // Chỉ lấy các file ảnh
      if (/\.(png|jpe?g|svg|webp|gif)$/i.test(file)) {
        arrayOfFiles.push(fullPath);
      }
    }
  });

  return arrayOfFiles;
}

async function runUpload() {
  console.log("=== BẮT ĐẦU UPLOAD FRONTEND ASSETS LÊN IMAGEKIT ===");
  
  if (!process.env.IMAGEKIT_PUBLIC_KEY || !process.env.IMAGEKIT_PRIVATE_KEY) {
    console.error("LỖI: Chưa cấu hình IMAGEKIT_PUBLIC_KEY / IMAGEKIT_PRIVATE_KEY trong backend/.env!");
    process.exit(1);
  }

  const files = getAllFiles(frontendAssetsDir);
  console.log(`Tìm thấy ${files.length} file ảnh trong frontend/src/assets...`);

  let mapping = {};
  if (fs.existsSync(outputFile)) {
    try {
      mapping = JSON.parse(fs.readFileSync(outputFile, "utf8"));
    } catch (e) {
      mapping = {};
    }
  }

  for (const filePath of files) {
    // Tính relative path để làm key và folder
    const relativePath = path.relative(frontendAssetsDir, filePath).replace(/\\/g, "/");
    const fileName = path.basename(filePath);
    const folderPath = "/techvie_assets/" + path.dirname(relativePath).replace(/^\.$/, "");

    console.log(`\nĐang upload: ${relativePath} -> Folder: ${folderPath}`);

    try {
      const fileBuffer = fs.readFileSync(filePath);
      const res = await uploadToImageKit(fileBuffer, fileName, folderPath);
      console.log(`=> Thành công: ${res.url}`);
      mapping[relativePath] = res.url;
    } catch (err) {
      console.error(`=> Thất bại cho ${relativePath}:`, err.message || err);
    }
  }

  // Đảm bảo thư mục frontend/src/config tồn tại
  const configDir = path.dirname(outputFile);
  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true });
  }

  fs.writeFileSync(outputFile, JSON.stringify(mapping, null, 2), "utf8");
  console.log(`\n=== HOÀN TẤT! Đã lưu kết quả mapping vào ${outputFile} ===`);
}

runUpload();
