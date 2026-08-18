const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");
const authMiddleware = require("../middlewares/authMiddleware");

// Áp dụng middleware bảo mật cho toàn bộ các API quản lý đơn hàng
router.use(authMiddleware);

// Lấy danh sách đơn hàng của người dùng hiện tại
router.get("/user", orderController.getUserOrders);

router.use(authMiddleware.adminOnly);

// Lấy danh sách toàn bộ đơn hàng
router.get("/", orderController.getOrders);

// Cập nhật trạng thái đơn hàng (sử dụng POST để tương thích với frontend cũ)
router.post("/:id/status", orderController.updateOrderStatus);

// Cập nhật trạng thái thanh toán của đơn hàng
router.post("/:id/payment-status", orderController.updatePaymentStatus);

// Xóa sạch toàn bộ đơn hàng
router.delete("/", orderController.clearAllOrders);

module.exports = router;
