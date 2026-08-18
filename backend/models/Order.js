const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
  product_id: {
    type: String,
    required: true,
    ref: "Product",
    description: "Tham chiếu đến products.id",
  },
  product_name: {
    type: String,
    required: true,
    description: "Bản sao tên sản phẩm tại thời điểm mua",
  },
  product_price: {
    type: Number,
    required: true,
    min: 0,
    description: "Bản sao giá bán tại thời điểm mua",
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    description: "Số lượng mua, bắt buộc > 0",
  },
});

const orderSchema = new mongoose.Schema({
  full_name: {
    type: String,
    required: true,
    description: "Họ tên người nhận bưu phẩm",
  },
  phone: {
    type: String,
    required: true,
    description: "Số điện thoại di động thụ hưởng",
  },
  email: {
    type: String,
    required: true,
    description: "Email nhận hoá đơn điện tử",
  },
  address: {
    type: String,
    required: true,
    description: "Địa chỉ chi tiết điểm giao nhận",
  },
  notes: {
    type: String,
    description: "Ghi chú thời gian giao hàng custom",
  },
  payment_method: {
    type: String,
    required: true,
    enum: ["cod", "card_online", "bank_transfer", "momo", "zalopay"],
    description: "Phương thức: 'cod', 'card_online', 'bank_transfer', 'momo', 'zalopay'",
  },
  payment_provider: {
    type: String,
    required: true,
    enum: ["cod", "card_online", "bank_transfer", "momo", "zalopay"],
    default: "cod",
    index: true,
    description: "Nhà cung cấp/cổng thanh toán được chọn",
  },
  payment_status: {
    type: String,
    required: true,
    enum: ["pending", "paid", "failed", "cancelled"],
    default: "pending",
    index: true,
    description: "Trạng thái thanh toán: pending, paid, failed, cancelled",
  },
  payment_reference: {
    type: String,
    index: true,
    description: "Mã tham chiếu đối soát thanh toán",
  },
  payment_note: {
    type: String,
    description: "Nội dung chuyển khoản hoặc ghi chú thanh toán",
  },
  transaction_id: {
    type: String,
    description: "Mã giao dịch trả về từ cổng thanh toán/demo gateway",
  },
  payment_url: {
    type: String,
    description: "URL chuyển hướng sang cổng thanh toán MoMo/ZaloPay sandbox hoặc demo",
  },
  paid_at: {
    type: Date,
    description: "Thời điểm thanh toán được xác nhận",
  },
  delivery_method: {
    type: String,
    required: true,
    enum: ["express", "standard"],
    description: "Tốc độ vận tải: 'express', 'standard'",
  },
  final_total: {
    type: String,
    required: true,
    description: "Chuỗi tiền hiển thị tổng hóa đơn (Ví dụ: '28.500.000₫')",
  },
  status: {
    type: String,
    required: true,
    default: "Đang lắp ráp chuẩn bị gửi",
  },
  status_type: {
    type: String,
    required: true,
    default: "processing",
    enum: ["processing", "shipping", "success", "cancelled"],
    index: true,
    description: "'processing', 'shipping', 'success', 'cancelled'",
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  items: {
    type: [orderItemSchema],
    default: [],
    description: "Danh sách sản phẩm mua chi tiết",
  },
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Tạo trường ảo 'order_id' phản ánh từ '_id' để tương thích ngược với API cũ
orderSchema.virtual("order_id").get(function() {
  return this._id.toString();
});

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
