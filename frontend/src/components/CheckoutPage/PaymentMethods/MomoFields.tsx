import React, { useState } from 'react';
import { motion } from 'motion/react';
// @ts-ignore
import momoLogo from '../../../assets/images/checkout-form/logo-payment/MoMo_Logo_App.svg.webp';

interface MomoFieldsProps {
  finalTotal: number;
}

export default function MomoFields({ finalTotal }: MomoFieldsProps) {
  const [loaded, setLoaded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl h-[380px] flex items-end p-5 shadow-[0_10px_30px_rgba(0,0,0,0.08)] border border-pink-200"
    >
      {/* Background Image */}
      <img
        src="/src/assets/images/checkout-form/sumup-Z-o7nk0joVQ-unsplash.jpg"
        alt="MoMo Payment Background"
        decoding="async"
        onLoad={() => setLoaded(true)}
        className={`absolute inset-0 w-full h-full object-cover select-none transition-opacity duration-300 ${
          loaded ? 'opacity-100' : 'opacity-0'
        }`}
      />
      {/* Dark tint overlay */}
      <div className="absolute inset-0 bg-black/45" />

      {/* Liquid Glass Overlay Card */}
      <div className="relative z-10 w-full rounded-xl border border-white/10 bg-pink-950/30 backdrop-blur-md p-4 text-white shadow-lg flex items-start gap-3">
        <div className="h-10 w-10 shrink-0 shadow-md rounded-lg overflow-hidden">
          <img src={momoLogo} className="h-full w-full object-cover" alt="MoMo" />
        </div>
        <div className="space-y-1 text-left font-sans text-xs">
          <h4 className="font-extrabold uppercase tracking-wider text-[10px] text-white/95">
            Thanh toán qua Ví điện tử MoMo Sandbox
          </h4>
          <p className="leading-relaxed text-white/80">
            Cổng thanh toán MoMo Sandbox và hướng dẫn thanh toán số tiền{" "}
            <strong className="font-mono font-black text-pink-355 text-sm">
              {finalTotal.toLocaleString("vi-VN")}₫
            </strong>{" "}
            sẽ được hiển thị <span className="text-pink-220 font-extrabold uppercase tracking-wider">ngay sau khi bạn nhấn Đặt hàng</span> ở bước tiếp theo.
            Hệ thống hỗ trợ thanh toán thử nghiệm an toàn và bảo mật cao.
          </p>
        </div>
      </div>
    </motion.div>
  );
}
