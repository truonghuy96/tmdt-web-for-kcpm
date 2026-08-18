const mongoose = require("mongoose");
const Product = require("./Product");

const reviewSchema = new mongoose.Schema({
  product_id: {
    type: String,
    required: true,
    ref: "Product",
    index: true,
    description: "Mã sản phẩm đánh giá",
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
    index: true,
    description: "ID người dùng đánh giá",
  },
  username: {
    type: String,
    required: true,
    description: "Tên hiển thị của người đánh giá",
  },
  order_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Order",
    description: "ID đơn hàng chứa sản phẩm này để xác nhận đã mua",
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
    description: "Điểm đánh giá (1-5 sao)",
  },
  title: {
    type: String,
    trim: true,
    maxLength: 100,
    description: "Tiêu đề đánh giá",
  },
  comment: {
    type: String,
    required: true,
    trim: true,
    maxLength: 1000,
    description: "Nội dung bình luận chi tiết",
  },
  verified_purchase: {
    type: Boolean,
    default: true,
    description: "Xác minh đã mua hàng",
  },
  isDeleted: {
    type: Boolean,
    default: false,
    description: "Trạng thái xóa đánh giá (soft delete)",
  },
  isHidden: {
    type: Boolean,
    default: false,
    description: "Trạng thái ẩn đánh giá (chỉ người viết và admin thấy)",
  },
  reply: {
    comment: { type: String, trim: true, maxLength: 1000 },
    replied_at: { type: Date },
    admin_username: { type: String, default: "Admin TechVie" }
  },
}, {
  timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Tạo index compound unique: Mỗi user chỉ đánh giá một sản phẩm một lần duy nhất
reviewSchema.index({ product_id: 1, user_id: 1 }, { unique: true });

// Hàm static tính toán điểm đánh giá trung bình
reviewSchema.statics.calculateAverageRating = async function(productId) {
  const stats = await this.aggregate([
    {
      $match: { product_id: productId, isDeleted: { $ne: true } }
    },
    {
      $group: {
        _id: "$product_id",
        nRating: { $sum: 1 },
        avgRating: { $avg: "$rating" }
      }
    }
  ]);

  try {
    if (stats.length > 0) {
      await Product.findByIdAndUpdate(productId, {
        reviewCount: stats[0].nRating,
        averageRating: Math.round(stats[0].avgRating * 10) / 10 // 1 chữ số thập phân
      });
    } else {
      await Product.findByIdAndUpdate(productId, {
        reviewCount: 0,
        averageRating: 0
      });
    }
  } catch (err) {
    console.error("Lỗi cập nhật average rating sản phẩm:", err);
  }
};

// Hook cập nhật sau khi lưu review mới
reviewSchema.post("save", async function() {
  await this.constructor.calculateAverageRating(this.product_id);
});

// Hook cập nhật sau khi thay đổi (ví dụ soft delete hoặc chỉnh sửa)
reviewSchema.post(/^findOneAndUpdate/, async function(doc) {
  if (doc) {
    await doc.constructor.calculateAverageRating(doc.product_id);
  }
});

const Review = mongoose.model("Review", reviewSchema);

module.exports = Review;
