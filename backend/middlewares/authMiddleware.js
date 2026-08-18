const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Không tìm thấy token xác thực hoặc sai định dạng Bearer!",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "techvie_jwt_secret_key_2026");
    req.user = decoded; // Lưu thông tin giải mã (ví dụ: { id, email }) vào request
    next();
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: "Token không hợp lệ hoặc đã hết hạn!",
      error: error.message,
    });
  }
};

const adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Truy cập bị từ chối: Yêu cầu quyền quản trị viên!",
    });
  }
  next();
};

authMiddleware.adminOnly = adminOnly;

module.exports = authMiddleware;

