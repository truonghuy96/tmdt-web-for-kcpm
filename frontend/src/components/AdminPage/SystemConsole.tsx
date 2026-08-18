import { Sparkles } from 'lucide-react';

interface SystemConsoleProps {
  logs: string[];
  onClearLogs: () => void;
  isDarkMode?: boolean;
}

export default function SystemConsole({ logs, onClearLogs, isDarkMode = false }: SystemConsoleProps) {
  const d = isDarkMode;
  return (
    <div className={`lg:col-span-12 rounded-3xl p-6 shadow-md overflow-hidden relative border flex flex-col justify-between min-h-[300px] ${d ? 'bg-[#0d1117] text-slate-300 border-[#30363d]' : 'bg-white text-slate-600 border-gray-200'}`}>
      <div className="absolute top-0 right-0 p-4 opacity-10">
        <Sparkles size={120} className={d ? "text-indigo-400" : "text-indigo-600"} />
      </div>

      <div className="relative z-10 w-full">
        <div className={`flex justify-between items-center border-b pb-3 mb-4 ${d ? 'border-white/10' : 'border-black/5'}`}>
          <div className="flex items-center gap-2">
            <div className={`w-2.5 h-2.5 rounded-full animate-pulse ${d ? 'bg-emerald-500' : 'bg-emerald-600'}`} />
            <span className={`text-[10px] uppercase font-bold tracking-widest font-mono ${d ? 'text-slate-400' : 'text-slate-500'}`}>
              Dòng Tín Hiệu Hệ Thống (LumiOS Console)
            </span>
          </div>
          <button
            onClick={onClearLogs}
            className={`text-[9px] font-mono transition-colors uppercase underline cursor-pointer ${d ? 'text-slate-500 hover:text-white' : 'text-slate-400 hover:text-slate-900'}`}
          >
            Dọn sạch log
          </button>
        </div>

        <div className={`space-y-2 mt-2 font-mono text-[11px] leading-relaxed max-h-[200px] overflow-y-auto ${d ? 'text-slate-300' : 'text-slate-700'}`}>
          {logs.map((log, index) => (
            <div key={index} className="flex gap-2.5">
              <span className={`shrink-0 select-none ${d ? 'text-indigo-400' : 'text-indigo-600'}`}>❯</span>
              <p className="break-all">{log}</p>
            </div>
          ))}
        </div>
      </div>

      <div className={`pt-4 border-t text-[9px] font-mono flex flex-col sm:flex-row justify-between items-start gap-2 mt-4 relative z-10 ${d ? 'border-white/5 text-slate-500' : 'border-black/5 text-slate-400'}`}>
        <span>PHÂN PHỐI QUA container CẤP THỰC THI (PORT 3000)</span>
        <span>HỆ MÃ HÓA SHA-256 SẴN SÀNG CHO NHÀ SÁNG LẬP</span>
      </div>
    </div>
  );
}
