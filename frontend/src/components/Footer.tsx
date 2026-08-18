import React from "react";
import { Link } from "react-router-dom";
import { TabType } from "../types";
import { Facebook, Instagram, Youtube, Copyright } from "lucide-react";

interface FooterProps {
  navigationItems: Array<{ id: TabType; label: string }>;
  setActiveTab: (tab: TabType) => void;
}

export default function Footer({ navigationItems, setActiveTab }: FooterProps) {
  return (
    <footer className="w-full bg-white border-t border-gray-200 pt-14 pb-6 mt-20 relative z-10 select-none">
      <div className="max-w-none mx-auto px-4 sm:px-8 md:px-10 lg:px-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">
        {/* Description summary */}
        <div className="sm:col-span-2 lg:col-span-1 space-y-4">
          <h3 className="text-2xl font-black text-gray-900 tracking-tight">
            TECHVIE
          </h3>
          <p className="text-sm text-gray-500 font-sans leading-relaxed max-w-xs text-justify">
            Cung cấp các giải pháp phụ kiện tiện ích và đồ setup không gian làm việc. Chúng tôi giúp bạn kiến tạo góc học tập tối giản, bảo vệ sức khỏe và mang đậm cá tính riêng.
          </p>
        </div>

        {/* Nav columns */}
        <div>
          <h5 className="text-[12px] uppercase font-bold tracking-[0.2em] text-gray-400 mb-5 font-sans">
            CÁC KHÔNG GIAN
          </h5>
          <ul className="space-y-2.5">
            {navigationItems.map((item) => (
              <li key={item.id}>
                <Link
                  to={item.id === 'home' ? '/' : `/${item.id}`}
                  onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                  className="group text-sm text-gray-600 font-sans text-left uppercase tracking-wider font-semibold cursor-pointer block relative overflow-hidden"
                >
                  <span className="relative inline-block transition-colors duration-200 group-hover:text-black">
                    {item.label}
                    <span className="absolute left-0 bottom-0 w-0 h-px bg-black transition-all duration-300 group-hover:w-full" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact Info */}
        <div>
          <h5 className="text-[12px] uppercase font-bold tracking-[0.2em] text-gray-400 mb-5 font-sans">
            LIÊN HỆ
          </h5>
          <ul className="space-y-3 text-sm text-gray-600 font-sans">
            <li className="flex items-start gap-2">
              <span className="font-semibold text-gray-800 shrink-0">Điện thoại:</span>
              <a href="tel:0909826249" className="hover:text-black hover:underline transition-colors">0909-826-249</a>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-semibold text-gray-800 shrink-0">Email:</span>
              <a href="mailto:contact@techvie-store.com" className="hover:text-black hover:underline transition-colors break-all">contact@techvie-store.com</a>
            </li>
            <li className="flex flex-col gap-1 mt-2">
              <span className="font-semibold text-gray-800">Địa chỉ:</span>
              <a
                href="https://maps.app.goo.gl/BdJPvnyL8PYoqSPP9"
                target="_blank"
                rel="noreferrer"
                className="leading-relaxed hover:text-black hover:underline transition-colors block"
              >
                02 Võ Oanh, Phường Thạnh Mỹ Tây, TP. HCM
              </a>
              <span className="leading-relaxed italic text-xs text-gray-400">(Xem bản đồ tại trang Liên hệ)</span>
            </li>
          </ul>
        </div>

        {/* Social Links */}
        <div>
          <h5 className="text-[12px] uppercase font-bold tracking-[0.2em] text-gray-400 mb-5">
            MẠNG XÃ HỘI
          </h5>
          <div className="flex space-x-3">
            {[
              { Icon: Facebook, label: "Facebook" },
              { Icon: Instagram, label: "Instagram" },
              { Icon: Youtube, label: "Youtube" },
            ].map(({ Icon, label }) => (
              <a
                key={label}
                href="#"
                className="group w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-black hover:text-white hover:border-black transition-all duration-300 hover:scale-110 active:scale-95"
                title={label}
              >
                <Icon size={18} className="transition-transform duration-300 group-hover:scale-110" />
              </a>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-5 leading-relaxed font-sans">
            Theo dõi TechVie để nhận cập nhật sản phẩm và ưu đãi độc quyền.
          </p>
        </div>
      </div>

      {/* Rights bar */}
      <div className="max-w-none mx-auto px-4 sm:px-8 md:px-10 lg:px-16 mt-12 pt-6 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center text-[11px] font-mono uppercase tracking-widest text-gray-400 gap-3 text-center sm:text-left">
        <span className="flex items-center gap-1.5">
          <Copyright size={13} /> 2026 TechVie. Kiến tạo góc học tập đậm chất riêng.
        </span>
        <span className="text-gray-300">v1.0.0</span>
      </div>
    </footer>
  );
}
