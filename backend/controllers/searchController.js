const SearchLog = require("../models/SearchLog");
const jwt = require("jsonwebtoken");

const searchController = {
  // 1. Lấy danh mục tìm kiếm phổ biến (Top 5 truy vấn được tìm kiếm nhiều nhất)
  getPopularSearches: async (req, res) => {
    try {
      const popular = await SearchLog.aggregate([
        {
          $group: {
            _id: { $toLower: "$query" }, // Nhóm không phân biệt chữ hoa chữ thường
            originalQuery: { $first: "$query" },
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } },
        { $limit: 5 }
      ]);
      
      const queries = popular.map(item => item.originalQuery);
      
      // Mảng mặc định phong phú nếu database trống
      const fallback = ['Laptop Pro', 'Ultra S26', 'Thủy tinh lỏng', 'Flux', 'Prism-1'];
      const result = queries.length > 0 ? queries : fallback;
      
      return res.status(200).json({ success: true, popular: result });
    } catch (error) {
      console.error("Lỗi lấy tìm kiếm phổ biến:", error);
      return res.status(500).json({ success: false, message: "Lỗi hệ thống khi lấy từ khóa phổ biến." });
    }
  },

  // 2. Lấy lịch sử tìm kiếm gần đây của người dùng (Top 5 gần nhất)
  getSearchHistory: async (req, res) => {
    try {
      let userId = null;
      const authHeader = req.headers.authorization;
      
      if (authHeader && authHeader.startsWith("Bearer ")) {
        try {
          const token = authHeader.split(" ")[1];
          const decoded = jwt.verify(token, process.env.JWT_SECRET || "techvie_jwt_secret_key_2026");
          userId = decoded.id || decoded.email || null;
        } catch (e) {
          // Token không hợp lệ hoặc hết hạn
        }
      }
      
      let filter = {};
      if (userId) {
        filter = { userId };
      } else {
        // Khách vãng lai: Lọc theo IP
        filter = { userId: null, ip: req.ip || req.connection.remoteAddress };
      }
      
      const history = await SearchLog.find(filter)
        .sort({ created_at: -1 })
        .limit(15); // Lấy 15 kết quả rồi lọc trùng
        
      // Lọc trùng lặp các từ khóa giống nhau
      const uniqueQueries = [];
      const seen = new Set();
      for (const log of history) {
        const lowerQ = log.query.toLowerCase();
        if (!seen.has(lowerQ)) {
          seen.add(lowerQ);
          uniqueQueries.push(log.query);
          if (uniqueQueries.length >= 5) break;
        }
      }
      
      // Fallback nếu trống
      const fallback = userId ? ['Core v2', 'TechVie Book'] : ['Laptop Pro', 'Ultra S26'];
      const result = uniqueQueries.length > 0 ? uniqueQueries : fallback;
      
      return res.status(200).json({ success: true, history: result });
    } catch (error) {
      console.error("Lỗi lấy lịch sử tìm kiếm:", error);
      return res.status(500).json({ success: false, message: "Lỗi hệ thống khi lấy lịch sử tìm kiếm." });
    }
  }
};

module.exports = searchController;
