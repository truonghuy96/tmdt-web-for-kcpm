const Review = require("../models/Review");
const Product = require("../models/Product");
const Order = require("../models/Order");
const mongoose = require("mongoose");
const User = require("../models/User");
const jwt = require("jsonwebtoken");

// 1. Lấy danh sách đánh giá của sản phẩm (Public)
exports.getReviewsByProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    // Giải mã token (nếu có) để lấy userId hiện tại cho việc ẩn/hiện bình luận
    let currentUserId = null;
    let currentUserRole = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "techvie_jwt_secret_key_2026");
        currentUserId = decoded.id;
        currentUserRole = decoded.role;
      } catch (err) {
        // Bỏ qua token lỗi cho request công cộng
      }
    }

    // Tìm tất cả các reviews chưa bị xóa hoàn toàn của sản phẩm
    const allReviews = await Review.find({ product_id: productId, isDeleted: { $ne: true } })
      .populate("user_id", "username avatar email role")
      .sort({ created_at: -1 });

    // Lọc các review theo điều kiện ẩn (isHidden)
    // Nếu review có isHidden = true, chỉ hiển thị cho chính người viết hoặc Admin
    const reviews = allReviews.filter(review => {
      if (!review.isHidden) return true;

      const reviewAuthorId = typeof review.user_id === 'object' && review.user_id 
        ? review.user_id._id.toString() 
        : review.user_id.toString();

      const isAuthor = currentUserId && (currentUserId === reviewAuthorId);
      const isAdmin = currentUserRole === 'admin';

      return isAuthor || isAdmin;
    });

    // Tính toán phân bổ số sao (Breakdown)
    const breakdown = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let totalRating = 0;

    reviews.forEach(review => {
      if (breakdown[review.rating] !== undefined) {
        breakdown[review.rating]++;
      }
      totalRating += review.rating;
    });

    const totalReviews = reviews.length;
    const averageRating = totalReviews > 0 ? Math.round((totalRating / totalReviews) * 10) / 10 : 0;

    return res.status(200).json({
      success: true,
      reviews,
      summary: {
        averageRating,
        reviewCount: totalReviews,
        breakdown,
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Lỗi khi lấy danh sách đánh giá sản phẩm!",
      error: error.message,
    });
  }
};

// 1b. Kiểm tra quyền đánh giá sản phẩm (Auth required)
// Logic: tìm order chứa sản phẩm này theo email của tài khoản (không phải email nhập tay trong form)
exports.canReview = async (req, res) => {
  try {
    const { productId } = req.params;

    // Lấy email thực của tài khoản đang đăng nhập từ DB (không dùng email trong form checkout)
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, canReview: false, message: "Không tìm thấy tài khoản!" });
    }

    // Tìm đơn hàng đã hoàn thành có chứa sản phẩm này, liên kết qua email tài khoản
    const purchasedOrder = await Order.findOne({
      email: user.email,
      "items.product_id": productId,
      status_type: "success",
    });

    if (!purchasedOrder) {
      return res.status(200).json({ success: true, canReview: false, reason: "not_purchased" });
    }

    // Kiểm tra đã review chưa
    const existingReview = await Review.findOne({
      product_id: productId,
      user_id: req.user.id,
      isDeleted: { $ne: true },
    });

    if (existingReview) {
      return res.status(200).json({ success: true, canReview: false, reason: "already_reviewed" });
    }

    return res.status(200).json({ success: true, canReview: true });
  } catch (error) {
    return res.status(500).json({ success: false, canReview: false, message: error.message });
  }
};

// 2. Tạo đánh giá mới (Auth required)
exports.createReview = async (req, res) => {
  try {
    const { productId } = req.params;
    const { rating, title, comment } = req.body;

    if (!rating || !comment) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng cung cấp đầy đủ số sao đánh giá (rating) và bình luận (comment)!",
      });
    }

    const numericRating = Number(rating);
    if (isNaN(numericRating) || numericRating < 1 || numericRating > 5) {
      return res.status(400).json({
        success: false,
        message: "Số sao đánh giá phải từ 1 đến 5!",
      });
    }

    // Kiểm tra sản phẩm tồn tại
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy sản phẩm cần đánh giá!",
      });
    }

    // Lấy thông tin user hiện tại
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy thông tin tài khoản người dùng!",
      });
    }

    // Kiểm tra xem người dùng đã mua sản phẩm này chưa qua đơn hàng (Order)
    // Liên kết qua email của tài khoản
    const purchasedOrder = await Order.findOne({
      email: user.email,
      "items.product_id": productId,
      status_type: "success",
    });

    if (!purchasedOrder) {
      return res.status(403).json({
        success: false,
        message: "Bạn chỉ có thể đánh giá sản phẩm khi đã mua sản phẩm này và đơn hàng được giao thành công!",
      });
    }

    // Kiểm tra xem người dùng đã đánh giá sản phẩm này chưa (Tránh đánh giá nhiều lần / tận dụng lại review đã soft delete)
    const existingReview = await Review.findOne({
      product_id: productId,
      user_id: req.user.id,
    });

    if (existingReview) {
      if (!existingReview.isDeleted) {
        return res.status(400).json({
          success: false,
          message: "Bạn đã đánh giá sản phẩm này rồi! Mỗi sản phẩm chỉ được đánh giá một lần.",
        });
      } else {
        // Hồi sinh đánh giá đã bị soft delete và cập nhật nội dung mới để tránh lỗi Unique Index MongoDB
        existingReview.isDeleted = false;
        existingReview.rating = numericRating;
        existingReview.title = title || "";
        existingReview.comment = comment;
        existingReview.verified_purchase = true;
        existingReview.created_at = new Date();
        existingReview.reply = undefined; // Xóa phản hồi cũ của admin (nếu có)

        await existingReview.save();

        return res.status(201).json({
          success: true,
          message: "Đăng đánh giá thành công!",
          review: existingReview,
        });
      }
    }

    // Tạo review mới
    const newReview = new Review({
      product_id: productId,
      user_id: req.user.id,
      username: user.username || "Người dùng TechVie",
      order_id: purchasedOrder._id,
      rating: numericRating,
      title: title || "",
      comment,
      verified_purchase: true,
    });

    await newReview.save();

    return res.status(201).json({
      success: true,
      message: "Đăng đánh giá thành công!",
      review: newReview,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Lỗi khi gửi đánh giá sản phẩm!",
      error: error.message,
    });
  }
};

// 3. Xóa đánh giá (Auth required: Chỉ người đánh giá hoặc Admin được xóa)
exports.deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;

    const review = await Review.findById(reviewId);
    if (!review || review.isDeleted) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy đánh giá!",
      });
    }

    // Kiểm tra quyền: Phải là chủ đánh giá hoặc Admin
    const isOwner = review.user_id.toString() === req.user.id;
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Bạn không có quyền xóa đánh giá này!",
      });
    }

    // Thực hiện soft delete để kích hoạt Hook Mongoose
    const updatedReview = await Review.findByIdAndUpdate(
      reviewId,
      { isDeleted: true },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: "Đã xóa đánh giá thành công!",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Lỗi khi xóa đánh giá!",
      error: error.message,
    });
  }
};

// 4. Lấy danh sách toàn bộ đánh giá (Admin only)
exports.getAllReviews = async (req, res) => {
  try {
    const { search, rating, includeDeleted } = req.query;
    let query = {};

    if (rating) {
      const numRating = Number(rating);
      if (!isNaN(numRating) && numRating >= 1 && numRating <= 5) {
        query.rating = numRating;
      }
    }

    if (includeDeleted !== "true") {
      query.isDeleted = { $ne: true };
    }

    if (search && search.trim() !== "") {
      const searchRegex = new RegExp(search.trim(), "i");
      
      // Tìm các sản phẩm khớp tên trước
      const matchedProducts = await Product.find({ name: searchRegex }, "_id");
      const matchedProductIds = matchedProducts.map(p => p._id);

      query.$or = [
        { comment: searchRegex },
        { title: searchRegex },
        { username: searchRegex },
        { product_id: { $in: matchedProductIds } }
      ];
    }

    const reviews = await Review.find(query)
      .populate("user_id", "username email avatar")
      .populate("product_id", "name image")
      .sort({ created_at: -1 });

    return res.status(200).json({
      success: true,
      reviews,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Lỗi khi tải toàn bộ danh sách đánh giá!",
      error: error.message,
    });
  }
};

// 5. Thống kê đánh giá phục vụ dashboard Admin (Admin only)
exports.getReviewStats = async (req, res) => {
  try {
    const totalReviews = await Review.countDocuments({ isDeleted: { $ne: true } });
    const deletedReviews = await Review.countDocuments({ isDeleted: true });

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentReviews = await Review.countDocuments({
      isDeleted: { $ne: true },
      created_at: { $gte: sevenDaysAgo }
    });

    const activeReviews = await Review.find({ isDeleted: { $ne: true } }, "rating");
    let totalRating = 0;
    const breakdown = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

    activeReviews.forEach(r => {
      totalRating += r.rating;
      if (breakdown[r.rating] !== undefined) {
        breakdown[r.rating]++;
      }
    });

    const averageRating = activeReviews.length > 0 
      ? Math.round((totalRating / activeReviews.length) * 10) / 10 
      : 0;

    return res.status(200).json({
      success: true,
      stats: {
        totalReviews,
        deletedReviews,
        recentReviews,
        averageRating,
        breakdown
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Lỗi lấy thông tin thống kê đánh giá!",
      error: error.message,
    });
  }
};

// 6. Khôi phục đánh giá đã xóa mềm (Admin only)
exports.restoreReview = async (req, res) => {
  try {
    const { reviewId } = req.params;

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy đánh giá!",
      });
    }

    if (!review.isDeleted) {
      return res.status(400).json({
        success: false,
        message: "Đánh giá này hiện chưa bị xóa!",
      });
    }

    const updatedReview = await Review.findByIdAndUpdate(
      reviewId,
      { isDeleted: false },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: "Đã khôi phục đánh giá thành công!",
      review: updatedReview
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Lỗi khi khôi phục đánh giá!",
      error: error.message,
    });
  }
};

// 5. Cập nhật đánh giá (User edit - Auth required)
exports.updateReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { rating, title, comment } = req.body;

    if (!rating || !comment) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng cung cấp số sao (rating) và nội dung bình luận (comment)!",
      });
    }

    const numericRating = Number(rating);
    if (isNaN(numericRating) || numericRating < 1 || numericRating > 5) {
      return res.status(400).json({
        success: false,
        message: "Số sao đánh giá phải từ 1 đến 5!",
      });
    }

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy đánh giá!",
      });
    }

    // Xác minh quyền sở hữu: chỉ chủ đánh giá mới được sửa
    if (review.user_id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Bạn không có quyền chỉnh sửa đánh giá này!",
      });
    }

    review.rating = numericRating;
    review.title = title || "";
    review.comment = comment;

    await review.save();

    return res.status(200).json({
      success: true,
      message: "Chỉnh sửa đánh giá thành công!",
      review,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Lỗi khi cập nhật đánh giá!",
      error: error.message,
    });
  }
};

// 6. Admin phản hồi đánh giá (Admin only)
exports.replyReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { comment } = req.body;

    if (!comment || !comment.trim()) {
      return res.status(400).json({
        success: false,
        message: "Nội dung phản hồi không được để trống!",
      });
    }

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy đánh giá để phản hồi!",
      });
    }

    // Cập nhật trường reply
    review.reply = {
      comment: comment.trim(),
      replied_at: new Date(),
      admin_username: "Admin TechVie",
    };

    await review.save();

    return res.status(200).json({
      success: true,
      message: "Gửi phản hồi thành công!",
      review,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Lỗi khi phản hồi đánh giá!",
      error: error.message,
    });
  }
};

// 7. Ẩn/Hiện đánh giá (Owner hoặc Admin)
exports.toggleHideReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { isHidden } = req.body;

    const review = await Review.findById(reviewId);
    if (!review || review.isDeleted) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy đánh giá!",
      });
    }

    const isOwner = review.user_id.toString() === req.user.id;
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Bạn không có quyền thực hiện thao tác này!",
      });
    }

    review.isHidden = typeof isHidden === 'boolean' ? isHidden : !review.isHidden;
    await review.save();

    return res.status(200).json({
      success: true,
      message: review.isHidden ? "Đã ẩn đánh giá thành công!" : "Đã hiển thị lại đánh giá thành công!",
      review
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Lỗi khi cập nhật trạng thái ẩn/hiện đánh giá!",
      error: error.message,
    });
  }
};
