import { ShieldAlert } from 'lucide-react';

interface AdminButtonProps {
  onNavigate: (tab: any) => void;
}

export default function AdminButton({ onNavigate }: AdminButtonProps) {
  return (
    <button
      type="button"
      onClick={() => onNavigate('admin')}
      className="group fixed bottom-6 left-6 z-50 flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white border border-indigo-500/25 text-[11px] font-bold tracking-wider cursor-pointer shadow-[0_12px_40px_rgba(99,102,241,0.4),0_0_20px_rgba(99,102,241,0.25)] hover:shadow-[0_18px_50px_rgba(99,102,241,0.6),0_0_30px_rgba(99,102,241,0.45)] uppercase font-sans overflow-hidden transition-all duration-300 hover:scale-105 active:scale-95 select-none"
    >
      {/* Shimmer sweep sweep glass effect */}
      <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:glass-shimmer-sweep pointer-events-none" />
      
      <ShieldAlert size={14} className="text-white shrink-0 group-hover:rotate-12 transition-transform duration-200 pointer-events-none" />
      <span className="relative z-10 text-white pointer-events-none leading-none">Quản trị Hệ thống</span>
    </button>
  );
}
