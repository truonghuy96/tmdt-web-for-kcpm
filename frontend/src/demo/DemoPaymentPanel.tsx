import React, { useState } from "react";
import { CreditCard, RefreshCw, ChevronLeft, ChevronRight, Terminal } from "lucide-react";

interface DemoPaymentPanelProps {
  serverOrderId: number | string | null;
  isSimulating: boolean;
  isChecking: boolean;
  onSimulate: () => void;
  onRefresh: () => void;
}

export default function DemoPaymentPanel({
  serverOrderId,
  isSimulating,
  isChecking,
  onSimulate,
  onRefresh,
}: DemoPaymentPanelProps) {
  const [isOpen, setIsOpen] = useState(true);

  if (!serverOrderId) return null;

  return (
    <div
      className={`fixed left-0 bottom-24 z-50 transition-all duration-500 ease-out flex items-center ${
        isOpen
          ? "translate-x-0"
          : "-translate-x-[calc(100%-24px)] md:-translate-x-[calc(100%-28px)]"
      }`}
    >
      {/* Main Glass Panel */}
      <div className="w-[240px] p-4 bg-black/60 backdrop-blur-2xl border border-white/15 rounded-l-none rounded-r-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] flex flex-col gap-3.5 text-white relative">
        {/* Sparkle border reflex */}
        <div className="absolute inset-0 rounded-r-2xl border border-white/5 pointer-events-none" />

        <div className="text-center border-b border-white/10 pb-2 flex items-center justify-center gap-1.5">
          <Terminal size={14} className="text-indigo-400" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/80 block font-jakarta">
            DEV PAYMENT PANEL
          </span>
        </div>

        <div className="space-y-1 font-mono text-[9px] text-white/60">
          <p>Order ID: <span className="text-white font-bold">{serverOrderId}</span></p>
        </div>

        <div className="space-y-2">
          <button
            type="button"
            onClick={onSimulate}
            disabled={isSimulating}
            className="w-full bg-emerald-600/80 hover:bg-emerald-600/95 disabled:opacity-60 text-white border border-emerald-500/20 py-2 rounded-xl text-[10px] font-extrabold tracking-wider transition-all active:scale-95 cursor-pointer font-jakarta uppercase flex items-center justify-center gap-1.5"
          >
            <CreditCard size={11} className={isSimulating ? "animate-bounce" : ""} />
            {isSimulating ? "Đang giả lập..." : "Giả lập thanh toán"}
          </button>

          <button
            type="button"
            onClick={onRefresh}
            disabled={isChecking}
            className="w-full bg-white/10 hover:bg-white/20 disabled:opacity-60 text-white border border-white/10 py-2 rounded-xl text-[10px] font-bold tracking-wider transition-all active:scale-95 cursor-pointer font-jakarta uppercase flex items-center justify-center gap-1.5"
          >
            <RefreshCw size={11} className={isChecking ? "animate-spin" : ""} />
            {isChecking ? "Đang check..." : "Check giao dịch"}
          </button>
        </div>
      </div>

      {/* Tab Toggle Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-7 h-14 bg-black/70 hover:bg-black/90 text-white/80 hover:text-white border-y border-r border-white/15 rounded-r-xl flex items-center justify-center shadow-lg cursor-pointer transition-colors backdrop-blur-md"
        title={isOpen ? "Thu gọn bảng demo" : "Mở rộng bảng demo"}
      >
        {isOpen ? (
          <ChevronLeft size={16} />
        ) : (
          <CreditCard size={14} className="animate-pulse text-indigo-400" />
        )}
      </button>
    </div>
  );
}
