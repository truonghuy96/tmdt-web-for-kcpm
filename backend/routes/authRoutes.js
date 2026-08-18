const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const authMiddleware = require("../middlewares/authMiddleware");

// Route Google OAuth
router.get("/google", authController.getGoogleAuthUrl);
router.get("/google/callback", authController.googleCallback);

// Route Đăng ký: POST /api/auth/register
router.post("/register", authController.register);

// Route Kiểm tra Email: GET /api/auth/check-email
router.get("/check-email", authController.checkEmail);

// Route Đăng nhập: POST /api/auth/login
router.post("/login", authController.login);

// Route Lấy Profile: GET /api/auth/profile (Yêu cầu đăng nhập)
router.get("/profile", authMiddleware, authController.getProfile);

// Route Cập Nhật Profile: PUT /api/auth/profile (Yêu cầu đăng nhập)
router.put("/profile", authMiddleware, authController.updateProfile);

// Route Quên Mật Khẩu: POST /api/auth/forgot-password
// Body: { email }
// → Gửi email chứa link đặt lại mật khẩu (token hết hạn sau 15 phút)
router.post("/forgot-password", authController.forgotPassword);

// Route Đặt Lại Mật Khẩu: POST /api/auth/reset-password/:token
// Params: token (lấy từ link email)
// Body: { newPassword }
// → Xác thực token, cập nhật mật khẩu mới vào DB, xóa token
router.post("/reset-password/:token", authController.resetPassword);

// Route Đổi Mật Khẩu (Đã đăng nhập): POST /api/auth/change-password
router.post("/change-password", authMiddleware, authController.changePassword);

// Route Lấy Danh Sách Thiết Bị Của Người Dùng (Đã đăng nhập): GET /api/auth/my-devices
router.get("/my-devices", authMiddleware, authController.getMyDevices);

// Route Gửi email xác thực: POST /api/auth/send-verification-email (Yêu cầu đăng nhập)
router.post("/send-verification-email", authMiddleware, authController.sendVerificationEmail);

// Route Xác nhận mã từ link email: GET /api/auth/verify-email (Public)
router.get("/verify-email", authController.verifyEmail);

module.exports = router;
