const Order = require("../models/Order");

const PAYMENT_METHODS = ["cod", "card_online", "bank_transfer", "momo", "zalopay", "vnpay"];
const PAYMENT_STATUSES = ["pending", "paid", "failed", "cancelled"];

const paymentLabels = {
  cod: "Thanh toán khi nhận hàng (COD)",
  card_online: "Thẻ tín dụng / Thẻ ghi nợ",
  bank_transfer: "Chuyển khoản ngân hàng",
  momo: "Ví điện tử MoMo",
  zalopay: "Ví điện tử ZaloPay",
  vnpay: "Cổng thanh toán VNPAY",
};

const paymentStatusLabels = {
  pending: "Chờ thanh toán",
  paid: "Đã thanh toán",
  failed: "Thanh toán thất bại",
  cancelled: "Đã hủy thanh toán",
};

const normalizePaymentMethod = (paymentMethod = "") => {
  const raw = String(paymentMethod || "").trim();
  const pmLower = raw.toLowerCase();

  if (PAYMENT_METHODS.includes(raw)) return raw;
  if (pmLower.includes("momo")) return "momo";
  if (pmLower.includes("zalo")) return "zalopay";
  if (pmLower.includes("vnpay") || pmLower.includes("vn pay")) return "vnpay";
  if (pmLower.includes("bank") || pmLower.includes("transfer") || pmLower.includes("chuyển khoản") || pmLower.includes("chuyen khoan") || pmLower.includes("ngân hàng") || pmLower.includes("ngan hang")) {
    return "bank_transfer";
  }
  if (pmLower.includes("card") || pmLower.includes("visa") || pmLower.includes("master") || pmLower.includes("tín dụng") || pmLower.includes("tin dung") || pmLower.includes("online")) {
    return "card_online";
  }
  if (pmLower.includes("cod") || pmLower.includes("nhận hàng") || pmLower.includes("nhan hang")) {
    return "cod";
  }

  return "cod";
};

const normalizeDeliveryMethod = (deliveryMethod = "") => {
  const raw = String(deliveryMethod || "").trim();
  const dmLower = raw.toLowerCase();

  if (["express", "standard"].includes(raw)) return raw;
  if (dmLower.includes("express") || dmLower.includes("hỏa tốc") || dmLower.includes("hoa toc") || dmLower.includes("nhanh")) {
    return "express";
  }
  return "standard";
};

const buildOrderReference = (order) => `TECHVIE-${order._id.toString().slice(-6).toUpperCase()}`;

const buildPaymentDetails = (req, order, paymentMethod) => {
  const reference = buildOrderReference(order);
  const shortCode = reference.replace("TECHVIE-", "");

  if (paymentMethod === "bank_transfer") {
    return {
      payment_reference: reference,
      payment_note: `TECHVIE ${shortCode} ${String(order.phone || "").slice(-4)}`,
      payment_url: "",
    };
  }

  if (paymentMethod === "momo" || paymentMethod === "zalopay") {
    return {
      payment_reference: reference,
      payment_note: `${reference} ${String(order.phone || "").slice(-4)}`,
      payment_url: "",
    };
  }

  return {
    payment_reference: reference,
    payment_note: paymentMethod === "cod" ? "Khách thanh toán trực tiếp khi nhận hàng" : `Thanh toán cho đơn ${reference}`,
    payment_url: "",
  };
};

const mapOrderForFrontend = (order, originalCart = null) => {
  const mappedCart = originalCart || order.items.map((item) => ({
    product: {
      id: item.product_id,
      name: item.product_name,
      price: item.product_price,
    },
    quantity: item.quantity,
  }));

  const provider = order.payment_provider || order.payment_method || "cod";
  const paymentStatus = order.payment_status || "pending";

  return {
    orderId: order._id.toString(),
    fullName: order.full_name,
    phone: order.phone,
    email: order.email,
    address: order.address,
    notes: order.notes,
    paymentMethod: paymentLabels[provider] || paymentLabels.cod,
    rawPaymentMethod: order.payment_method,
    paymentProvider: provider,
    paymentStatus,
    paymentStatusLabel: paymentStatusLabels[paymentStatus] || paymentStatusLabels.pending,
    paymentReference: order.payment_reference,
    paymentNote: order.payment_note,
    paymentUrl: order.payment_url,
    transactionId: order.transaction_id,
    paidAt: order.paid_at ? order.paid_at.toISOString() : null,
    deliveryMethod: order.delivery_method === "express" ? "Hỏa tốc (Express)" : "Tiêu chuẩn (Standard)",
    cart: mappedCart,
    finalTotal: order.final_total,
    status: order.status,
    statusType: order.status_type,
    createdAt: order.created_at.toISOString(),
  };
};

const applyPaymentStatus = (order, paymentStatus, transactionId) => {
  order.payment_status = paymentStatus;

  if (paymentStatus === "paid") {
    order.transaction_id = transactionId || order.transaction_id || `${String(order.payment_provider || "PAY").toUpperCase()}_${Date.now()}_${order._id.toString().slice(-6).toUpperCase()}`;
    order.paid_at = order.paid_at || new Date();
    if (order.status === "Chờ xác nhận thanh toán") {
      order.status = "Đã xác nhận thanh toán";
      order.status_type = "processing";
    }
  }

  if (paymentStatus === "failed" || paymentStatus === "cancelled") {
    order.transaction_id = transactionId || order.transaction_id || "";
    order.paid_at = undefined;
    if (order.status === "Chờ xác nhận thanh toán" || order.status === "Đã xác nhận thanh toán") {
      order.status = paymentStatus === "failed" ? "Thanh toán thất bại" : "Hủy bỏ";
      order.status_type = paymentStatus === "failed" ? "processing" : "cancelled";
    }
  }
};

const ensurePaymentDefaults = (order) => {
  const normalizedPayment = normalizePaymentMethod(order.payment_method || order.payment_provider || "cod");
  order.payment_method = normalizedPayment;
  order.payment_provider = order.payment_provider || normalizedPayment;
  order.payment_status = order.payment_status || "pending";
  order.payment_reference = order.payment_reference || buildOrderReference(order);
  order.payment_note = order.payment_note || (normalizedPayment === "cod" ? "Khách thanh toán trực tiếp khi nhận hàng" : `Thanh toán cho đơn ${order.payment_reference}`);
};

// @desc    Tạo đơn hàng mới (Checkout)
// @route   POST /api/checkout
// @access  Public
exports.createOrder = async (req, res) => {
  try {
    const {
      fullName,
      phone,
      email,
      address,
      notes,
      paymentMethod,
      deliveryMethod,
      cart,
      finalTotal,
    } = req.body;

    if (!fullName || !phone || !email || !address) {
      return res.status(400).json({
        success: false,
        message: "Thiếu thông tin bắt buộc để tiến hành đặt hàng.",
      });
    }

    if (!cart || !Array.isArray(cart) || cart.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Giỏ hàng rỗng.",
      });
    }

    const normalizedPayment = normalizePaymentMethod(paymentMethod);
    const normalizedDelivery = normalizeDeliveryMethod(deliveryMethod);

    const items = cart.map((item) => {
      const prod = item.product || {};
      return {
        product_id: prod.id || prod._id || "unknown-product-id",
        product_name: prod.name || "Sản phẩm TechVie",
        product_price: Number(prod.price) || 0,
        quantity: Number(item.quantity) || 1,
      };
    });

    const requiresSellerVerification = ["bank_transfer", "momo", "zalopay"].includes(normalizedPayment);

    const newOrder = new Order({
      full_name: fullName,
      phone,
      email,
      address,
      notes: notes || "",
      payment_method: normalizedPayment,
      payment_provider: normalizedPayment,
      payment_status: "pending",
      delivery_method: normalizedDelivery,
      final_total: finalTotal || "0₫",
      items,
      status: requiresSellerVerification ? "Chờ xác nhận thanh toán" : "Đang lắp ráp chuẩn bị gửi",
      status_type: "processing",
    });

    Object.assign(newOrder, buildPaymentDetails(req, newOrder, normalizedPayment));

    await newOrder.save();

    const responseOrder = mapOrderForFrontend(newOrder, cart);

    res.status(201).json({
      success: true,
      message: "Đặt hàng thành công và được ghi nhận tại máy chủ Express!",
      orderId: newOrder._id.toString(),
      order: responseOrder,
      payment: {
        provider: responseOrder.paymentProvider,
        status: responseOrder.paymentStatus,
        statusLabel: responseOrder.paymentStatusLabel,
        reference: responseOrder.paymentReference,
        note: responseOrder.paymentNote,
        paymentUrl: responseOrder.paymentUrl,
      },
    });
  } catch (error) {
    console.error("Lỗi khi xử lý đặt hàng:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi kết nối máy chủ khi xử lý đặt hàng.",
      error: error.message,
    });
  }
};

// @desc    Lấy trạng thái thanh toán của đơn hàng
// @route   GET /api/checkout/payment/status/:orderId
// @access  Public
exports.getPaymentStatus = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy đơn hàng.",
      });
    }

    res.status(200).json({
      success: true,
      order: mapOrderForFrontend(order),
      payment: {
        provider: order.payment_provider,
        status: order.payment_status,
        statusLabel: paymentStatusLabels[order.payment_status],
        reference: order.payment_reference,
        note: order.payment_note,
        paymentUrl: order.payment_url,
        transactionId: order.transaction_id,
        paidAt: order.paid_at,
      },
    });
  } catch (error) {
    console.error("Lỗi lấy trạng thái thanh toán:", error);
    res.status(500).json({
      success: false,
      message: "Không thể lấy trạng thái thanh toán.",
      error: error.message,
    });
  }
};

// @desc    Lấy sổ danh sách đơn đặt hàng (Chỉ dành cho Admin)
// @route   GET /api/orders
// @access  Private/Admin
exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ created_at: -1 });
    const mappedOrders = orders.map((order) => mapOrderForFrontend(order));

    res.status(200).json({
      success: true,
      count: orders.length,
      orders: mappedOrders,
    });
  } catch (error) {
    console.error("Lỗi lấy sổ đơn đặt hàng:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi kết nối máy chủ khi lấy danh sách đơn hàng.",
      error: error.message,
    });
  }
};

// @desc    Cập nhật trạng thái bưu kiện đơn hàng (Chỉ dành cho Admin)
// @route   POST /api/orders/:id/status
// @access  Private/Admin
exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, statusType } = req.body;

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy mã đơn hàng.",
      });
    }

    if (status) order.status = status;
    if (statusType) order.status_type = statusType;
    ensurePaymentDefaults(order);

    await order.save();

    res.status(200).json({
      success: true,
      message: "Cập nhật trạng thái thành công!",
      order: mapOrderForFrontend(order),
    });
  } catch (error) {
    console.error("Lỗi cập nhật trạng thái đơn hàng:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi kết nối máy chủ khi cập nhật đơn hàng.",
      error: error.message,
    });
  }
};

// @desc    Cập nhật trạng thái thanh toán (Chỉ dành cho Admin)
// @route   POST /api/orders/:id/payment-status
// @access  Private/Admin
exports.updatePaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentStatus, transactionId } = req.body;

    if (!PAYMENT_STATUSES.includes(paymentStatus)) {
      return res.status(400).json({
        success: false,
        message: "Trạng thái thanh toán không hợp lệ.",
      });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy mã đơn hàng.",
      });
    }

    ensurePaymentDefaults(order);
    applyPaymentStatus(order, paymentStatus, transactionId);
    await order.save();

    res.status(200).json({
      success: true,
      message: "Cập nhật trạng thái thanh toán thành công!",
      order: mapOrderForFrontend(order),
    });
  } catch (error) {
    console.error("Lỗi cập nhật trạng thái thanh toán:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi kết nối máy chủ khi cập nhật thanh toán.",
      error: error.message,
    });
  }
};

// @desc    Xóa sạch toàn bộ đơn đặt hàng trên máy chủ (Chỉ dành cho Admin)
// @route   DELETE /api/orders
// @access  Private/Admin
exports.clearAllOrders = async (req, res) => {
  try {
    await Order.deleteMany();
    res.status(200).json({
      success: true,
      message: "Đã xoá toàn bộ sổ đặt hàng trên máy chủ.",
    });
  } catch (error) {
    console.error("Lỗi xóa sạch đơn đặt hàng:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi kết nối máy chủ khi dọn sổ đơn hàng.",
      error: error.message,
    });
  }
};

// @desc    Lấy danh sách đơn hàng của người dùng hiện tại
// @route   GET /api/orders/user
// @access  Private
exports.getUserOrders = async (req, res) => {
  try {
    const email = req.user.email;
    const orders = await Order.find({ email }).sort({ created_at: -1 });

    const mappedOrders = orders.map((o) => {
      const mappedItems = o.items.map((item) => ({
        product_id: item.product_id,   // ← thêm để frontend kiểm tra verified_purchase
        name: item.product_name,
        qty: item.quantity,
        type: "Thiết bị TechVie",
      }));

      return {
        id: o._id.toString(),
        date: o.created_at.toLocaleDateString("vi-VN"),
        total: o.final_total,
        status: o.status,
        statusType: o.status_type,
        paymentMethod: o.payment_method,
        items: mappedItems,
      };
    });

    res.status(200).json({
      success: true,
      count: orders.length,
      orders: mappedOrders,
    });
  } catch (error) {
    console.error("Lỗi lấy đơn hàng của người dùng:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi kết nối máy chủ khi tải đơn hàng.",
      error: error.message,
    });
  }
};

// @desc    Nhận thông tin thông báo thanh toán tự động (IPN Webhook) từ SePay
// @route   POST /api/checkout/payment/sepay-ipn
// @access  Public (Xác thực bằng Token trong Header)
exports.handleSepayIpn = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const secretKey = process.env.SEPAY_SECRET_KEY || "your_secret_key";

    // 1. Xác thực nguồn gửi Webhook
    if (!authHeader || !authHeader.includes(secretKey)) {
      return res.status(401).json({
        success: false,
        message: "Không có quyền truy cập Webhook. Token không hợp lệ.",
      });
    }

    const { id, content, transferAmount, transferType } = req.body;

    // 2. Chỉ xử lý các giao dịch dòng tiền nhận vào (transferType = "in")
    if (transferType !== "in") {
      return res.status(200).json({
        success: true,
        message: "Bỏ qua giao dịch chi tiền ra.",
      });
    }

    // 3. Sử dụng Regex trích xuất mã đối soát đơn hàng TECHVIE-XXXXXX hoặc TECHVIE XXXXXX
    const match = String(content || "").match(/TECHVIE[- ]?([A-Z0-9]{6})/i);
    if (!match) {
      return res.status(400).json({
        success: false,
        message: "Nội dung chuyển khoản không chứa mã đơn hàng TechVie hợp lệ.",
      });
    }

    const code = match[1].toUpperCase();
    const paymentReference = `TECHVIE-${code}`;

    // 4. Tìm đơn hàng khớp mã đối soát trong DB
    const order = await Order.findOne({ payment_reference: paymentReference });
    if (!order) {
      return res.status(404).json({
        success: false,
        message: `Không tìm thấy đơn hàng tương ứng với mã đối soát: ${paymentReference}`,
      });
    }

    // Nếu đơn hàng đã thanh toán rồi thì trả về thành công luôn để tránh lặp lại
    if (order.payment_status === "paid") {
      return res.status(200).json({
        success: true,
        message: "Đơn hàng này đã được xác nhận thanh toán trước đó.",
      });
    }

    // 5. So sánh số tiền giao dịch
    const parseTotalToNum = (totalStr) => {
      if (!totalStr) return 0;
      const clean = totalStr.replace(/\D/g, "");
      return parseInt(clean, 10) || 0;
    };
    const orderAmount = parseTotalToNum(order.final_total);

    if (Number(transferAmount) < orderAmount) {
      return res.status(400).json({
        success: false,
        message: `Số tiền chuyển khoản (${transferAmount}đ) không đủ so với tổng hóa đơn (${orderAmount}đ).`,
      });
    }

    // 6. Ghi nhận thanh toán và cập nhật trạng thái đơn hàng
    order.payment_status = "paid";
    order.transaction_id = id || `SEPAY_${Date.now()}`;
    order.paid_at = new Date();

    if (order.status === "Chờ xác nhận thanh toán") {
      order.status = "Đã xác nhận thanh toán";
      order.status_type = "processing";
    }

    await order.save();

    console.log(`[SEPAY Webhook] Thanh toán tự động thành công cho đơn hàng: ${paymentReference}, số tiền: ${transferAmount}đ`);

    res.status(200).json({
      success: true,
      message: "Đối soát và cập nhật đơn hàng thành công!",
    });
  } catch (error) {
    console.error("Lỗi xử lý Webhook SePay IPN:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi hệ thống khi xử lý Webhook thanh toán.",
      error: error.message,
    });
  }
};

// @desc    Giả lập Webhook SePay đối soát tự động phục vụ Sandbox Testing
// @route   POST /api/checkout/payment/sepay-ipn/simulate/:orderId
// @access  Public (Tự ký bằng SEPAY_SECRET_KEY nội bộ)
exports.simulateSepayIpn = async (req, res) => {
  try {
    const { orderId } = req.params;
    
    // Tìm đơn hàng theo ID
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy đơn hàng để giả lập thanh toán.",
      });
    }

    const parseTotalToNum = (totalStr) => {
      if (!totalStr) return 0;
      const clean = totalStr.replace(/\D/g, "");
      return parseInt(clean, 10) || 0;
    };
    const orderAmount = parseTotalToNum(order.final_total);

    // Xây dựng payload giả lập tương tự SePay Webhook
    const mockPayload = {
      id: `MOCK_SP_${Date.now().toString().slice(-6)}`,
      content: order.payment_reference ? order.payment_reference.replace("-", " ") : `TECHVIE ORDER`,
      transferAmount: orderAmount,
      transferType: "in",
    };

    // Tự động ký Header Authorization bằng API Key của dự án để vượt qua xác thực
    const secretKey = process.env.SEPAY_SECRET_KEY || "your_secret_key";
    req.headers.authorization = `Bearer ${secretKey}`;
    req.body = mockPayload;

    console.log(`[SEPAY SIMULATION] Bắt đầu kích hoạt giả lập thanh toán SePay cho đơn: ${order.payment_reference}`);
    
    // Gọi tiếp hàm xử lý webhook chính
    return exports.handleSepayIpn(req, res);
  } catch (error) {
    console.error("Lỗi giả lập Webhook SePay:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi hệ thống khi giả lập thanh toán.",
      error: error.message,
    });
  }
};
