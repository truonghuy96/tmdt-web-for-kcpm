import React, { useState } from 'react';
import { motion } from 'motion/react';
// @ts-ignore
import vietQrLogo from '../../../assets/images/checkout-form/logo-payment/viet_qr_1.png';

interface SepayFieldsProps {
  finalTotal: number;
}

export default function SepayFields({ finalTotal }: SepayFieldsProps) {
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
        alt="VietQR Payment Background"
        decoding="async"
        onLoad={() => setLoaded(true)}
        className={`absolute inset-0 w-full h-full object-cover select-none transition-opacity duration-300 ${
          loaded ? 'opacity-100' : 'opacity-0'
        }`}
      />
      {/* Dark tint overlay */}
      <div className="absolute inset-0 bg-black/45" />

      {/* Liquid Glass Overlay Card */}
      <div className="relative z-10 w-full rounded-xl border border-white/10 bg-indigo-950/30 backdrop-blur-md p-4 text-white shadow-lg flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white p-1 shadow-md">
          <img src={vietQrLogo} className="h-full w-full object-contain" alt="VietQR" />
        </div>
        <div className="space-y-1 text-left font-sans text-xs">
          <h4 className="font-extrabold uppercase tracking-wider text-[10px] text-white/95">
            Chuyển khoản VietQR tự động qua SePay
          </h4>
          <p className="leading-relaxed text-white/80">
            Mã QR chuyển khoản thanh toán số tiền{" "}
            <strong className="font-mono font-black text-sky-300 text-sm">
              {finalTotal.toLocaleString("vi-VN")}₫
            </strong>{" "}
            sẽ được hiển thị tự động <span className="text-sky-200 font-extrabold uppercase tracking-wider">ngay sau khi bạn nhấn nút Đặt hàng</span> ở bước tiếp theo.
            TechVie sử dụng giải pháp SePay bảo mật tối đa, kiểm soát giao dịch 24/7.
          </p>
        </div>
      </div>
    </motion.div>
  );
}
