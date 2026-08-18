const express = require("express");
const router = express.Router();
const voucherController = require("../controllers/voucherController");

// Lấy danh sách voucher
router.get("/", voucherController.getVouchers);

// Tạo voucher mới
router.post("/", voucherController.createVoucher);

// Bật/Tắt trạng thái voucher
router.put("/:id/toggle", voucherController.toggleVoucher);

// Xóa voucher
router.delete("/:id", voucherController.deleteVoucher);

module.exports = router;
