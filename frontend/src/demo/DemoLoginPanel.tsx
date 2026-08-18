import React, { useState } from "react";
import { Key, ChevronLeft } from "lucide-react";

interface DemoLoginPanelProps {
  onDemoLogin: (email: string, password: string) => void;
}

export default function DemoLoginPanel({ onDemoLogin }: DemoLoginPanelProps) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div
      className={`fixed left-4 md:left-8 top-1/2 -translate-y-1/2 z-50 transition-all duration-500 ease-out flex items-center ${
        isOpen
          ? "translate-x-0"
          : "-translate-x-[calc(100%-24px)] md:-translate-x-[calc(100%-28px)]"
      }`}
    >
      {/* Main Glass Panel */}
      <div className="w-[240px] p-4 bg-black/50 backdrop-blur-2xl border border-white/15 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] flex flex-col gap-3.5 text-white relative">
        {/* Sparkle border reflex */}
        <div className="absolute inset-0 rounded-2xl border border-white/5 pointer-events-none" />

        <div className="text-center">
          <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-white/50 block mb-1 font-jakarta">
            DEMO NHANH MỘT CHẠM
          </span>
          <button
            type="button"
            onClick={() => onDemoLogin("customer@techvie.com", "customer123")}
            className="w-full mt-1 bg-white/10 hover:bg-white/20 text-white border border-white/10 py-2 rounded-xl text-[10.5px] font-bold tracking-wider transition-all active:scale-95 cursor-pointer font-jakarta"
          >
            Khách: customer@techvie.com
          </button>
        </div>

        <div className="border-t border-white/10 pt-3 text-center">
          <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-indigo-300 block mb-1 font-jakarta">
            QUYỀN ADMINISTRATOR
          </span>
          <button
            type="button"
            onClick={() => onDemoLogin("admin@techvie.com", "admin123")}
            className="w-full mt-1 bg-indigo-600/30 hover:bg-indigo-600/45 text-indigo-200 border border-indigo-500/20 py-2 rounded-xl text-[10.5px] font-extrabold tracking-wider transition-all active:scale-95 cursor-pointer font-jakarta"
          >
            Quản trị: admin@techvie.com
          </button>
        </div>
      </div>

      {/* Tab Toggle Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-7 h-14 bg-black/60 hover:bg-black/80 text-white/80 hover:text-white border-y border-r border-white/15 rounded-r-xl flex items-center justify-center shadow-lg cursor-pointer transition-colors backdrop-blur-md"
        title={isOpen ? "Thu gọn bảng demo" : "Mở rộng bảng demo"}
      >
        {isOpen ? (
          <ChevronLeft size={16} />
        ) : (
          <Key size={14} className="animate-pulse" />
        )}
      </button>
    </div>
  );
}
