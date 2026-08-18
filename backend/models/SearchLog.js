const mongoose = require("mongoose");

const searchLogSchema = new mongoose.Schema({
  query: {
    type: String,
    required: true,
    trim: true,
  },
  userId: {
    type: String, // ID hoặc email của người dùng (nếu đăng nhập)
    default: null,
  },
  ip: {
    type: String,
  },
  created_at: {
    type: Date,
    default: Date.now,
  }
});

// Tạo index trên query và userId để tối ưu hóa hiệu suất truy vấn
searchLogSchema.index({ query: 1 });
searchLogSchema.index({ userId: 1 });
searchLogSchema.index({ created_at: -1 });

const SearchLog = mongoose.model("SearchLog", searchLogSchema);

module.exports = SearchLog;
