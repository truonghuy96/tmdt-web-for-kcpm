const mongoose = require("mongoose");
require("dotenv").config();

const connectDB = async () => {
  const dbUri = process.env.MONGODB_URI;

  if (!dbUri) {
    if (process.env.NODE_ENV === "production") {
      console.error("✖ CRITICAL: MONGODB_URI is not defined in environment variables!");
      process.exit(1);
    }
    console.log("ℹ MONGODB_URI missing, falling back to local MongoDB...");
  }

  try {
    const conn = await mongoose.connect(dbUri || "mongodb://127.0.0.1:27017/database_for_tmdt_01", {
      serverSelectionTimeoutMS: 5000,
    });
    console.log("Kết nối MongoDB thành công!");
    return conn;
  } catch (err) {
    console.log("⚠ [DATABASE] Không thể kết nối cơ sở dữ liệu.", err.message);
    return null;
  }
};

module.exports = connectDB;
