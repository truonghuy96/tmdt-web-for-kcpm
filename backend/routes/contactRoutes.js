const express = require("express");
const router = express.Router();
const contactController = require("../controllers/contactController");
const authMiddleware = require("../middlewares/authMiddleware");

// Route công khai: Gửi liên hệ hoặc đăng ký nhận tin
router.post("/", contactController.createContactInquiry);

// Route bảo mật (Admin): Lấy toàn bộ thư góp ý của khách hàng
router.get("/", authMiddleware, authMiddleware.adminOnly, contactController.getContactMessages);

// Route bảo mật (Admin): Xóa thư góp ý của khách hàng
router.delete("/:id", authMiddleware, authMiddleware.adminOnly, contactController.deleteContactMessage);

// Route bảo mật (Admin): Gửi email trả lời khách hàng
router.post("/:id/reply", authMiddleware, authMiddleware.adminOnly, contactController.replyContactMessage);

module.exports = router;
