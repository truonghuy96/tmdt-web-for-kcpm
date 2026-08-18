import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Truck } from 'lucide-react';

interface CodFieldsProps {
  finalTotal: number;
}

export default function CodFields({ finalTotal }: CodFieldsProps) {
  const [loaded, setLoaded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl h-[380px] flex items-end p-5 shadow-[0_10px_30px_rgba(0,0,0,0.08)] border border-indigo-100"
    >
      {/* Background Image */}
      <img
        src="/src/assets/images/checkout-form/ruwell-salatan-kqo8P16y0YY-unsplash (small).jpg"
        alt="COD Delivery Background"
        decoding="async"
        onLoad={() => setLoaded(true)}
        className={`absolute inset-0 w-full h-full object-cover select-none transition-opacity duration-300 ${
          loaded ? 'opacity-100' : 'opacity-0'
        }`}
      />
      {/* Dark tint overlay */}
      <div className="absolute inset-0 bg-black/35" />

      {/* Liquid Glass Overlay Card */}
      <div className="relative z-10 w-full rounded-xl border border-white/20 bg-white/10 backdrop-blur-md p-4 text-white shadow-lg flex items-start gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm text-white">
          <Truck size={16} className="animate-pulse" />
        </div>
        <div className="space-y-1 text-left font-sans text-xs">
          <h4 className="font-extrabold uppercase tracking-wider text-[10px] text-white/90">
            Thanh toán khi nhận hàng (COD)
          </h4>
          <p className="leading-relaxed text-white/80">
            Bạn sẽ thanh toán trực tiếp số tiền{" "}
            <strong className="font-mono font-black text-emerald-300 text-sm">
              {finalTotal.toLocaleString("vi-VN")}₫
            </strong>{" "}
            bằng tiền mặt hoặc chuyển khoản với bưu tá khi nhận sản phẩm tại nhà.
            TechVie khuyên bạn nên đồng kiểm hàng nguyên seal trước khi đồng thuận nhận hàng.
          </p>
        </div>
      </div>
    </motion.div>
  );
}
