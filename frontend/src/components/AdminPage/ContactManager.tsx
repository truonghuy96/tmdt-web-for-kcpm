import { useState } from 'react';
import { RotateCcw, MessageSquare, Send, X as CloseIcon } from 'lucide-react';

interface ContactManagerProps {
  messages: any[];
  isLoadingMessages: boolean;
  onRefreshMessages: () => void;
  onDeleteMessage: (id: string) => void;
  onReplyMessage: (id: string, subject: string, content: string) => Promise<{ success: boolean; message?: string }>;
  isDarkMode?: boolean;
}

export default function ContactManager({
  messages,
  isLoadingMessages,
  onRefreshMessages,
  onDeleteMessage,
  onReplyMessage,
  isDarkMode = false,
}: ContactManagerProps) {
  const d = isDarkMode;
  const [replyTarget, setReplyTarget] = useState<any | null>(null);
  const [replySubject, setReplySubject] = useState('');
  const [replyContent, setReplyContent] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSendReply = async () => {
    if (!replyContent) return;
    setIsSending(true);
    try {
      const res = await onReplyMessage(replyTarget._id || replyTarget.id, replySubject, replyContent);
      if (res.success) {
        console.log("Đã gửi email phản hồi thành công!");
        setReplyTarget(null);
      } else {
        console.error(res.message || "Gửi email thất bại.");
      }
    } catch (err) {
      console.error(err);
      console.error("Lỗi kết nối khi gửi email.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      <div className={`flex flex-col sm:flex-row justify-between sm:items-center gap-4 p-6 sm:p-8 rounded-3xl shadow-sm border transition-all duration-300 ${
        d ? 'bg-[#161b22] border-[#30363d]' : 'bg-white border-gray-200'
      }`}>
        <div>
          <h3 className={`font-extrabold text-base uppercase tracking-wider transition-colors duration-300 ${d ? 'text-white' : 'text-gray-955'}`}>Hòm thư góp ý khách hàng</h3>
          <p className={`text-xs md:text-[13px] font-sans mt-1.5 leading-relaxed transition-colors duration-300 ${d ? 'text-gray-400' : 'text-gray-405'}`}>
            Cập nhật và đọc những bình bách của khách hàng tương tác qua biểu mẫu liên hệ.
          </p>
        </div>

        <button
          onClick={onRefreshMessages}
          className={`w-12 h-12 border flex items-center justify-center rounded-xl transition-all duration-300 cursor-pointer ${
            d ? 'bg-[#21262d] border-[#30363d] hover:bg-[#30363d] text-white' : 'bg-white border-gray-200 hover:bg-gray-50 text-gray-800'
          }`}
          title="Tải lại thư"
        >
          <RotateCcw size={16} />
        </button>
      </div>

      {isLoadingMessages ? (
        <div className={`text-center py-20 border rounded-3xl ${
          d ? 'bg-[#161b22] border-[#30363d]' : 'bg-white border-gray-200'
        }`}>
          <div className={`w-8 h-8 border-3 rounded-full animate-spin mx-auto mb-3 ${
            d ? 'border-white/15 border-t-white' : 'border-black/15 border-t-black'
          }`} />
          <p className={`text-xs ${d ? 'text-gray-400' : 'text-gray-500'}`}>Đang đồng bộ hòm thư...</p>
        </div>
      ) : messages.length === 0 ? (
        <div className={`text-center py-20 border rounded-3xl p-6 ${
          d ? 'bg-[#161b22] border-[#30363d]' : 'bg-white border-gray-200'
        }`}>
          <MessageSquare size={36} className="text-gray-400 mx-auto mb-3" />
          <p className={`text-sm font-extrabold ${d ? 'text-white' : 'text-gray-805'}`}>Hòm thư đang trống</p>
          <p className={`text-xs ${d ? 'text-gray-400' : 'text-gray-405'}`}>Khách hàng chưa để lại bức thư bưu tín nào trong tuần.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {messages.map((msg: any) => (
            <div
              key={msg._id || msg.id}
              className={`p-6 rounded-3xl shadow-sm transition-all flex flex-col justify-between h-[230px] border ${
                d 
                  ? 'bg-[#161b22] border-[#30363d] hover:border-indigo-500/40 hover:bg-[#161b22]/70' 
                  : 'bg-white border-gray-200 hover:border-black/15 hover:bg-gray-50/20'
              }`}
            >
              <div>
                <div className={`flex justify-between items-start gap-2 border-b pb-3 mb-3 text-xs ${
                  d ? 'border-[#30363d]' : 'border-gray-100'
                }`}>
                  <div className="min-w-0">
                    <h4 className={`font-extrabold truncate ${d ? 'text-white' : 'text-gray-900'}`}>{msg.name}</h4>
                    <span className="font-mono text-[10px] text-gray-400 block truncate">{msg.email}</span>
                  </div>
                  <span className="text-[9px] font-mono text-gray-400 shrink-0">
                    {msg.createdAt ? new Date(msg.createdAt).toLocaleDateString('vi-VN') : 'Mới'}
                  </span>
                </div>

                <p className={`font-bold text-xs mb-1 ${d ? 'text-gray-200' : 'text-gray-900'}`}>
                  Chủ đề:{' '}
                  <strong className={`font-extrabold uppercase text-[9.5px] tracking-wide ${
                    d ? 'text-indigo-400' : 'text-indigo-650'
                  }`}>
                    {msg.subject}
                  </strong>
                </p>
                <p className={`text-xs leading-relaxed line-clamp-4 font-sans italic ${
                  d ? 'text-gray-400' : 'text-gray-550'
                }`}>
                  " {msg.message} "
                </p>
              </div>

              <div className="pt-2 flex justify-between items-center border-t border-dashed border-gray-100/10">
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm("Bạn có chắc chắn muốn xóa phản hồi này?")) {
                      onDeleteMessage(msg._id || msg.id);
                    }
                  }}
                  className="text-[10px] font-black uppercase tracking-wider text-rose-500 hover:text-rose-600 cursor-pointer"
                >
                  Xóa thư
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setReplyTarget(msg);
                    setReplySubject(`Phản hồi từ TechVie: ${msg.subject}`);
                    setReplyContent('');
                  }}
                  className={`text-[10px] font-black uppercase tracking-wider transition-colors duration-200 hover:underline cursor-pointer ${
                    d ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-650 hover:text-indigo-750'
                  }`}
                >
                  Kết nối hòm thư liên hệ ❯
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* SMTP Email Reply Modal */}
      {replyTarget && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-[6px] z-[100] flex items-center justify-center p-4">
          <div className={`w-full max-w-xl rounded-[2.5rem] p-8 relative shadow-2xl border transition-all duration-300 ${
            d 
              ? 'bg-[#161b22] border-[#30363d] text-white shadow-[0_24px_70px_rgba(0,0,0,0.4)]' 
              : 'bg-white border-gray-200 text-gray-955 shadow-[0_24px_70px_rgba(0,0,0,0.12)]'
          }`}>
            <button 
              type="button" 
              onClick={() => setReplyTarget(null)}
              className={`absolute top-6 right-6 w-8 h-8 rounded-full border flex items-center justify-center transition-all cursor-pointer ${
                d 
                  ? 'border-[#30363d] text-gray-400 hover:bg-[#21262d] hover:text-white' 
                  : 'border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-black'
              }`}
            >
              <CloseIcon size={14} />
            </button>

            <div className="border-b border-gray-200/10 pb-4 mb-5">
              <h3 className={`font-extrabold text-base uppercase tracking-wider ${d ? 'text-white' : 'text-gray-955'}`}>Phản hồi khách hàng</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] text-gray-400 font-mono block">Gửi tới: {replyTarget.email}</span>
                <span className="text-[10px] text-gray-500">•</span>
                <a
                  href={`https://mail.google.com/mail/?view=cm&fs=1&to=${replyTarget.email}&su=${encodeURIComponent(replySubject)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] text-indigo-400 hover:text-indigo-300 hover:underline font-bold uppercase tracking-wider"
                >
                  Mở bằng Gmail ↗
                </a>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold tracking-wider text-gray-400">Tiêu đề email</label>
                <input
                  type="text"
                  value={replySubject}
                  onChange={(e) => setReplySubject(e.target.value)}
                  className={`w-full px-4 py-2.5 rounded-xl text-xs outline-none border transition-colors ${
                    d ? 'bg-[#0d1117] border-[#30363d] text-white focus:border-indigo-500' : 'bg-gray-50 border-gray-250 text-gray-900 focus:border-indigo-500'
                  }`}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold tracking-wider text-gray-400">Nội dung phản hồi</label>
                <textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  rows={6}
                  placeholder="Nhập nội dung thư trả lời khách hàng tại đây..."
                  className={`w-full px-4 py-2.5 rounded-xl text-xs outline-none border transition-colors resize-none ${
                    d ? 'bg-[#0d1117] border-[#30363d] text-white focus:border-indigo-500' : 'bg-gray-50 border-gray-250 text-gray-900 focus:border-indigo-500'
                  }`}
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setReplyTarget(null)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors ${
                    d ? 'bg-gray-850 hover:bg-gray-800 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  Hủy bỏ
                </button>
                <button
                  type="button"
                  disabled={isSending || !replyContent}
                  onClick={handleSendReply}
                  className="px-5 py-2.5 bg-indigo-650 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <Send size={12} /> {isSending ? 'Đang gửi...' : 'Gửi email'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
