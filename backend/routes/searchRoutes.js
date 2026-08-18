const express = require("express");
const router = express.Router();
const searchController = require("../controllers/searchController");

// 1. Lấy danh mục tìm kiếm phổ biến (Top 5)
router.get("/popular", searchController.getPopularSearches);

// 2. Lấy lịch sử tìm kiếm gần đây của người dùng hoặc IP khách vãng lai
router.get("/history", searchController.getSearchHistory);

module.exports = router;
