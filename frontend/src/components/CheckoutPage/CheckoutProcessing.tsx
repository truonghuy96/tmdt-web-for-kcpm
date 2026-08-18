import React from 'react';
import { motion } from 'motion/react';
import { Sparkles } from 'lucide-react';

export default function CheckoutProcessing() {
  return (
    <motion.div 
      key="checkout-step-processing"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-xl mx-auto py-16 text-center space-y-6"
    >
      <div className="relative w-24 h-24 mx-auto mb-8">
        {/* Outer spinning ring representing mechanical frame setup */}
        <div className="absolute inset-0 rounded-full border-4 border-dashed border-indigo-600/20 animate-spin" style={{ animationDuration: '8s' }} />
        {/* Inner fast spinning ring */}
        <div className="absolute inset-2 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin" />
        {/* Center icon */}
        <div className="absolute inset-5 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center">
          <Sparkles size={20} className="text-indigo-600 animate-pulse" />
        </div>
      </div>

      <h2 className="text-xl md:text-2xl font-black text-gray-900 tracking-tight uppercase">
        ĐANG HIỆU CHUẨN KẾT NỐI ĐẶT HÀNG
      </h2>
      <p className="text-xs text-gray-500 font-sans leading-relaxed max-w-sm mx-auto">
        Hệ thống xử lý trung tâm đang liên kết với cổng thanh toán và chuẩn bị đóng gói thiết bị bàn giao... Vui lòng không đóng tab này.
      </p>

      <div className="w-[180px] h-1.5 bg-gray-200 rounded-full overflow-hidden mx-auto">
        <div className="h-full bg-indigo-600 rounded-full animate-pulse w-3/4" />
      </div>

      <p className="text-[10px] font-mono uppercase tracking-widest text-indigo-600 animate-bounce">
        TECHVIE SECURE SEC TRANSACTIONS RUNNING...
      </p>
    </motion.div>
  );
}
