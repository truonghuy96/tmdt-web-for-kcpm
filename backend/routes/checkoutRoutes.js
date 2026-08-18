const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");

// Route công khai: Tạo đơn đặt hàng mới (Checkout)
router.post("/", orderController.createOrder);

// Route công khai: Khách chỉ được kiểm tra trạng thái, không được tự xác nhận đã thanh toán
router.get("/payment/status/:orderId", orderController.getPaymentStatus);

// Webhook công khai: Nhận IPN từ SePay để đối soát thanh toán tự động
router.post("/payment/sepay-ipn", orderController.handleSepayIpn);

// Giả lập Webhook SePay gửi thông tin chuyển tiền về (Chỉ dùng cho testing/sandbox)
router.post("/payment/sepay-ipn/simulate/:orderId", orderController.simulateSepayIpn);

module.exports = router;
