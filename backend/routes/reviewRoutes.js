const express = require("express");
const router = express.Router();
const reviewController = require("../controllers/reviewController");
const authMiddleware = require("../middlewares/authMiddleware");

// Admin routes (đặt trước để tránh conflict với :productId)
router.get("/admin/all", authMiddleware, authMiddleware.adminOnly, reviewController.getAllReviews);
router.get("/admin/stats", authMiddleware, authMiddleware.adminOnly, reviewController.getReviewStats);
router.post("/admin/:reviewId/reply", authMiddleware, authMiddleware.adminOnly, reviewController.replyReview);
router.patch("/:reviewId/restore", authMiddleware, authMiddleware.adminOnly, reviewController.restoreReview);

// 1. Lấy tất cả đánh giá của một sản phẩm (Public)
router.get("/:productId", reviewController.getReviewsByProduct);

// 1b. Kiểm tra xem user hiện tại có quyền review sản phẩm này không (Yêu cầu đăng nhập)
router.get("/:productId/can-review", authMiddleware, reviewController.canReview);

// 2. Viết đánh giá mới cho sản phẩm (Yêu cầu đăng nhập & đã mua sản phẩm này)
router.post("/:productId", authMiddleware, reviewController.createReview);

// 3. Xóa đánh giá (Yêu cầu đăng nhập, chỉ chủ đánh giá hoặc admin được xóa)
router.delete("/:reviewId", authMiddleware, reviewController.deleteReview);

// 4. Chỉnh sửa đánh giá (Yêu cầu đăng nhập, chỉ chủ đánh giá mới được sửa)
router.put("/:reviewId", authMiddleware, reviewController.updateReview);

// 5. Ẩn/Hiện đánh giá (Yêu cầu đăng nhập, chỉ chủ đánh giá hoặc admin mới được thao tác)
router.patch("/:reviewId/toggle-hide", authMiddleware, reviewController.toggleHideReview);

module.exports = router;
