import React, { useState } from 'react';
import { motion } from 'motion/react';
// @ts-ignore
import vnpayLogo from '../../../assets/images/checkout-form/logo-payment/Icon-VNPAY-QR.webp';

interface VnpayFieldsProps {
  finalTotal: number;
}

export default function VnpayFields({ finalTotal }: VnpayFieldsProps) {
  const [loaded, setLoaded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl h-[380px] flex items-end p-5 shadow-[0_10px_30px_rgba(0,0,0,0.08)] border border-blue-200"
    >
      {/* Background Image */}
      <img
        src="/src/assets/images/checkout-form/sumup-Z-o7nk0joVQ-unsplash.jpg"
        alt="VNPAY Payment Background"
        decoding="async"
        onLoad={() => setLoaded(true)}
        className={`absolute inset-0 w-full h-full object-cover select-none transition-opacity duration-300 ${
          loaded ? 'opacity-100' : 'opacity-0'
        }`}
      />
      {/* Dark tint overlay */}
      <div className="absolute inset-0 bg-black/45" />

      {/* Liquid Glass Overlay Card */}
      <div className="relative z-10 w-full rounded-xl border border-white/10 bg-blue-950/30 backdrop-blur-md p-4 text-white shadow-lg flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white p-1 shadow-md">
          <img src={vnpayLogo} className="h-full w-full object-contain rounded-md" alt="VNPay" />
        </div>
        <div className="space-y-1 text-left font-sans text-xs">
          <h4 className="font-extrabold uppercase tracking-wider text-[10px] text-white/95">
            Thanh toán qua Cổng VNPAY Sandbox
          </h4>
          <p className="leading-relaxed text-white/80">
            Liên kết thanh toán VNPAY Sandbox để giao dịch số tiền{" "}
            <strong className="font-mono font-black text-sky-300 text-sm">
              {finalTotal.toLocaleString("vi-VN")}₫
            </strong>{" "}
            sẽ sẵn sàng <span className="text-sky-200 font-extrabold uppercase tracking-wider">ngay sau khi bạn nhấn Đặt hàng</span> ở bước tiếp theo.
            Hỗ trợ quét QR ứng dụng Mobile Banking hoặc thẻ ATM/Tài khoản NCB test.
          </p>
        </div>
      </div>
    </motion.div>
  );
}
