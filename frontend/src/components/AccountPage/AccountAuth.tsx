import { motion } from 'motion/react';
import { Cpu } from 'lucide-react';

interface AccountAuthProps {
  onNavigate: (tab: any) => void;
}

export default function AccountAuth({ onNavigate }: AccountAuthProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="w-full max-w-md mx-auto relative"
    >
      <div className="bg-white/85 backdrop-blur-[40px] border border-white/60 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.05)] overflow-hidden p-8 space-y-6">
        {/* Specular Highlight Top Edge */}
        <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-white/80 via-white/50 to-transparent" />

        <div className="w-16 h-16 bg-[#2d3748] text-white rounded-2xl flex items-center justify-center mx-auto shadow-md transition-transform hover:rotate-12 duration-300">
          <Cpu size={28} className="animate-pulse" />
        </div>

        <div className="space-y-2 text-center">
          <h2 className="font-headline-lg text-headline-lg text-[#2d3748] tracking-widest uppercase">
            YÊU CẦU ĐĂNG NHẬP
          </h2>
          <p className="text-xs text-[#4a5568] max-w-[280px] mx-auto leading-relaxed">
            Để xem chi tiết hồ sơ cá nhân, bản kê vận chuyển và lịch sử đơn đặt hàng thiết bị cao cấp của bạn.
          </p>
        </div>
        
        <div className="flex flex-col gap-3 pt-2">
          <a
            href="#login"
            onClick={(e) => {
              e.preventDefault();
              onNavigate('login');
            }}
            className="w-full py-4 bg-black hover:bg-gray-800 text-white rounded-lg font-tech-label text-tech-label text-center transition-all shadow-md active:scale-95 cursor-pointer block"
          >
            ĐĂNG NHẬP
          </a>
          <a
            href="#register"
            onClick={(e) => {
              e.preventDefault();
              onNavigate('register');
            }}
            className="w-full py-4 bg-white/70 hover:bg-white text-[#2d3748] border border-gray-200/50 rounded-lg font-tech-label text-tech-label text-center transition-all active:scale-95 cursor-pointer block"
          >
            ĐĂNG KÝ TÀI KHOẢN MỚI
          </a>
        </div>
      </div>
    </motion.div>
  );
}
