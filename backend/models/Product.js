const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  // id sẽ là tên sản phẩm
  _id: {
    type: String,
    required: true,
    description: "Mã chuỗi thiết bị duy nhất. Ví dụ: techvie-book-pro-x",
  },
  name: {
    type: String,
    required: true,
    description: "Tên hiển thị sản phẩm",
  },
  price: {
    type: Number,
    required: true,
    min: 0,
    description: "Giá niêm yết (VND) >= 0",
  },
  category: {
    type: String,
    required: true,
    index: true,
    description: "Phân loại: Điện thoại, Laptop, Đồng hồ...",
  },
  image: {
    type: String,
    description: "URL hình ảnh sản phẩm",
  },
  description: {
    type: String,
    description: "Mô tả tóm tắt tính năng",
  },
  specs: {
    type: mongoose.Schema.Types.Mixed,
    default: [],
    description: "Mảng JSON chứa thông số kỹ thuật",
  },
  colors: {
    type: [String],
    default: [],
    description: "Mảng chứa thông tin màu sắc",
  },
  status: {
    type: String,
    enum: ["AVAILABLE", "OUT_OF_STOCK", "DISCONTINUED"],
    default: "AVAILABLE",
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
    description: "Đánh giá trung bình (0-5)",
  },
  reviewCount: {
    type: Number,
    default: 0,
    min: 0,
    description: "Số lượng đánh giá sản phẩm",
  },
  stock: {
    type: Number,
    default: 0,
    min: 0,
    description: "Số lượng hàng tồn kho",
  },
  badge: {
    type: String,
    enum: ["PREMIUM", "TRENDY", "FLAGSHIP", "LIMITED", "NORMAL"],
    default: "NORMAL",
  },
}, {
  timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Tạo trường ảo 'id' phản ánh giá trị từ '_id'
productSchema.virtual("id").get(function() {
  return this._id;
});

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
