const Voucher = require("../models/Voucher");

// Lấy danh sách toàn bộ voucher
exports.getVouchers = async (req, res) => {
  try {
    const vouchers = await Voucher.find().sort({ created_at: -1 });
    res.status(200).json({ success: true, promos: vouchers });
  } catch (error) {
    console.error("Lỗi khi lấy danh sách voucher:", error);
    res.status(500).json({ success: false, message: "Lỗi Server" });
  }
};

// Ban hành voucher mới
exports.createVoucher = async (req, res) => {
  const { code, discount, description, minOrderVal, isActive } = req.body;
  try {
    const existing = await Voucher.findOne({ code: code.toUpperCase() });
    if (existing) {
      return res.status(400).json({ success: false, message: "Mã voucher đã tồn tại" });
    }

    const newVoucher = new Voucher({
      code: code.toUpperCase(),
      discount,
      description,
      minOrderVal: minOrderVal || 0,
      isActive: isActive !== undefined ? isActive : true,
    });

    await newVoucher.save();
    res.status(201).json({ success: true, promo: newVoucher });
  } catch (error) {
    console.error("Lỗi khi tạo voucher:", error);
    res.status(500).json({ success: false, message: "Lỗi Server" });
  }
};

// Bật/Tắt trạng thái hoạt động của voucher
exports.toggleVoucher = async (req, res) => {
  const { id } = req.params;
  try {
    let voucher;
    // Kiểm tra xem id truyền vào là _id hay code
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      voucher = await Voucher.findById(id);
    } else {
      voucher = await Voucher.findOne({ code: id });
    }

    if (!voucher) {
      return res.status(404).json({ success: false, message: "Không tìm thấy voucher" });
    }

    voucher.isActive = !voucher.isActive;
    await voucher.save();
    
    res.status(200).json({ success: true, promo: voucher });
  } catch (error) {
    console.error("Lỗi khi toggle voucher:", error);
    res.status(500).json({ success: false, message: "Lỗi Server" });
  }
};

// Xóa vĩnh viễn voucher
exports.deleteVoucher = async (req, res) => {
  const { id } = req.params;
  try {
    let result;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      result = await Voucher.findByIdAndDelete(id);
    } else {
      result = await Voucher.findOneAndDelete({ code: id });
    }

    if (!result) {
      return res.status(404).json({ success: false, message: "Không tìm thấy voucher" });
    }

    res.status(200).json({ success: true, message: "Đã xóa voucher thành công" });
  } catch (error) {
    console.error("Lỗi khi xóa voucher:", error);
    res.status(500).json({ success: false, message: "Lỗi Server" });
  }
};
