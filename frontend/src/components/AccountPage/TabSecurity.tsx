import React, { useState } from 'react';
import { CheckCircle2, ArrowRight, Loader2, Eye, EyeOff } from 'lucide-react';
import { showSuccess, showError } from '../../utils/toast';
import { changePassword } from '../../services/api';

interface TabSecurityProps {
  userProfile?: any;
}

export default function TabSecurity({ userProfile }: TabSecurityProps) {
  const isGoogleAccount = userProfile?.authProvider === 'google';
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSavePassword = async () => {
    if (!currentPassword || !newPassword) {
      showError('Vui lòng điền đầy đủ mật khẩu hiện tại và mật khẩu mới.');
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
      const res = await changePassword({ currentPassword, newPassword });
      if (res.success) {
        showSuccess('Cập nhật mật khẩu thành công.');
        setCurrentPassword('');
        setNewPassword('');
        console.log('Mật khẩu của bạn đã được cập nhật an toàn!');
      } else {
        showError(res.message || 'Cập nhật mật khẩu thất bại.');
      }
    } catch (err) {
      showError('Lỗi kết nối đến máy chủ.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isGoogleAccount) {
    return (
      <div className="bg-white/60 backdrop-blur-lg border border-white/60 rounded-xl p-6 relative overflow-hidden flex flex-col shadow-sm text-left">
        <div className="mb-4 border-b border-white/60 pb-2">
          <h3 className="font-headline-lg text-headline-lg text-[#2d3748] tracking-widest uppercase">thay đổi mật khẩu</h3>
          <p className="text-[#4a5568] mt-1 max-w-lg">Cập nhật mật khẩu kết nối hoặc thiết lập đặc cách xác thực</p>
        </div>
        <div className="py-10 text-center max-w-xl mx-auto space-y-4">
          <div className="w-16 h-16 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center mx-auto text-indigo-600">
            <CheckCircle2 size={32} />
          </div>
          <h4 className="font-bold text-sm text-gray-900 uppercase tracking-wider">Đã Đăng Nhập Bằng Tài Khoản Google</h4>
          <p className="text-md text-gray-600 font-sans leading-relaxed">
            Tài khoản của bạn được liên kết trực tiếp và bảo mật bởi hệ thống <span className="text-[#2d3748] font-bold">Google OAuth2</span><br/><br/>
            Mật khẩu và cơ chế xác thực hai lớp (2FA) của bạn được quản lý an toàn trực tiếp bởi Google,<br/>do đó bạn không cần thiết lập mật khẩu truyền thống trên hệ thống TechVie.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/60 backdrop-blur-lg border border-white/60 rounded-xl p-6 relative overflow-hidden flex flex-col shadow-sm text-left">
      <div className="mb-4 border-b border-white/60 pb-2">
        <h3 className="font-headline-lg text-headline-lg text-[#2d3748] tracking-widest uppercase">thay đổi mật khẩu</h3>
        <p className="text-[#4a5568] mt-1 max-w-lg text-sm">Cập nhật mật khẩu kết nối hoặc thiết lập đặc cách xác thực</p>
      </div>

      <div className="space-y-4 flex-grow">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5 relative">
            <label className="font-tech-label text-tech-label text-[#4a5568] !text-xs">MẬT KHẨU HIỆN TẠI</label>
            <div className="relative mt-3">
              <input
                type={showCurrentPassword ? "text" : "password"}
                placeholder="••••••••"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                disabled={isSubmitting}
                className="w-full bg-white/70 border border-gray-200/50 rounded-lg px-3.5 py-2.5 pr-10 text-[#2d3748] focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all duration-300 placeholder-[#4a5568]/30 shadow-sm !text-sm"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          <div className="space-y-1.5 relative">
            <label className="font-tech-label text-tech-label text-[#4a5568] !text-xs">MẬT KHẨU MỚI</label>
            <div className="relative mt-3">
              <input
                type={showNewPassword ? "text" : "password"}
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={isSubmitting}
                className="w-full bg-white/70 border border-gray-200/50 rounded-lg px-3.5 py-2.5 pr-10 text-[#2d3748] focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all duration-300 placeholder-[#4a5568]/30 shadow-sm !text-sm"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
        </div>

        {message && (
          <div className={`p-3 rounded-lg border text-xs font-sans ${
            message.isError 
              ? 'bg-rose-50/50 border-rose-200 text-rose-600' 
              : 'bg-emerald-50/50 border-emerald-200 text-emerald-600'
          }`}>
            {message.text}
          </div>
        )}

        {/* <div className="p-3 bg-white/50 border border-white/60 rounded-xl flex items-start gap-3 shadow-sm">
          <CheckCircle2 size={16} className="text-emerald-700 mt-0.5 flex-shrink-0" />
          <p className="text-[11px] text-[#4a5568] leading-relaxed">
            Xác thực thành viên TechVie được tự động áp dụng ưu đãi giảm giá lên tới 10% tại tất cả các hệ thống showroom & trải nghiệm TechVie chính hãng trên toàn cầu.
          </p>
        </div> */}
      </div>

      <div className="pt-4 border-t border-white/60">
        <button
          type="button"
          onClick={handleSavePassword}
          disabled={isSubmitting}
          className="px-5 py-3 bg-black hover:bg-gray-800 disabled:bg-gray-400 text-white font-tech-label text-tech-label rounded-lg transition-all duration-300 flex items-center gap-2 group shadow-md cursor-pointer disabled:cursor-not-allowed float-end !text-xs mt-2.5"
        >
          {isSubmitting ? (
            <>
              <span>ĐANG XỬ LÝ...</span>
              <Loader2 size={16} className="animate-spin" />
            </>
          ) : (
            <>
              <span>CẬP NHẬT MẬT KHẨU</span>
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
