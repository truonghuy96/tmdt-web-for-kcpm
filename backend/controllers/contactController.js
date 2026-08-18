const Contact = require("../models/Contact");
const sendEmail = require("../utils/sendEmail");

// @desc    Gửi liên hệ góp ý hoặc đăng ký nhận tin (Công khai)
// @route   POST /api/contacts
// @access  Public
exports.createContactInquiry = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: "Họ tên và email là bắt buộc.",
      });
    }

    const newInquiry = new Contact({
      name,
      email,
      subject: subject || "Yêu cầu tư vấn thiết bị",
      message: message || "Khách hàng đăng ký nhận tin",
    });

    await newInquiry.save();

    res.status(201).json({
      success: true,
      message: "Gửi liên hệ thành công!",
      inquiry: newInquiry,
    });
  } catch (error) {
    console.error("Lỗi gửi thư góp ý:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi kết nối máy chủ khi gửi liên hệ.",
      error: error.message,
    });
  }
};

// @desc    Lấy danh sách thư góp ý khách hàng (Chỉ dành cho Admin)
// @route   GET /api/contacts
// @access  Private/Admin
exports.getContactMessages = async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ created_at: -1 });
    res.status(200).json({
      success: true,
      count: contacts.length,
      contacts,
    });
  } catch (error) {
    console.error("Lỗi lấy hòm thư góp ý:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi kết nối máy chủ khi lấy danh sách liên hệ.",
      error: error.message,
    });
  }
};

// @desc    Xóa thư góp ý của khách hàng
// @route   DELETE /api/contacts/:id
// @access  Private/Admin
exports.deleteContactMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const contact = await Contact.findByIdAndDelete(id);
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy thư liên hệ để xóa.",
      });
    }
    res.status(200).json({
      success: true,
      message: "Đã xóa thư liên hệ thành công!",
    });
  } catch (error) {
    console.error("Lỗi xóa thư liên hệ:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi kết nối máy chủ khi xóa thư.",
      error: error.message,
    });
  }
};

// @desc    Gửi email phản hồi cho khách hàng qua SMTP
// @route   POST /api/contacts/:id/reply
// @access  Private/Admin
exports.replyContactMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { replySubject, replyContent } = req.body;

    if (!replyContent) {
      return res.status(400).json({
        success: false,
        message: "Nội dung phản hồi không được để trống.",
      });
    }

    const contact = await Contact.findById(id);
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy thư liên hệ.",
      });
    }

    // Gửi email bằng sendEmail utility
    await sendEmail({
      to: contact.email,
      subject: replySubject || `Phản hồi từ TechVie: ${contact.subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eee; padding: 20px; border-radius: 8px;">
          <h3 style="color: #4f46e5; border-bottom: 1px solid #eee; padding-bottom: 10px;">Xin chào ${contact.name},</h3>
          <p>Chúng tôi đã nhận được thông tin đóng góp ý kiến của bạn về chủ đề: <strong>"${contact.subject}"</strong></p>
          <div style="background-color: #f9fafb; border-left: 4px solid #4f46e5; padding: 15px; margin: 20px 0; font-style: italic;">
            "${contact.message}"
          </div>
          <p><strong>Đội ngũ TechVie Shop xin phản hồi như sau:</strong></p>
          <p style="white-space: pre-line;">${replyContent}</p>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="font-size: 12px; color: #666;">Trân trọng,<br/><strong>Đội ngũ hỗ trợ TechVie Shop</strong><br/>Website: http://localhost:3000</p>
        </div>
      `,
    });

    res.status(200).json({
      success: true,
      message: "Đã gửi email phản hồi thành công!",
    });
  } catch (error) {
    console.error("Lỗi gửi phản hồi email:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi kết nối máy chủ hoặc lỗi cấu hình SMTP khi gửi email.",
      error: error.message,
    });
  }
};
