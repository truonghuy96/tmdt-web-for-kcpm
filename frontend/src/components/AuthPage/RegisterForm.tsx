import React from 'react';
import { motion } from 'motion/react';
import { Eye, EyeOff } from 'lucide-react';
import { checkEmailExists } from '../../services/api';

interface RegisterFormProps {
  regFullName: string;
  setRegFullName: (val: string) => void;
  regEmail: string;
  setRegEmail: (val: string) => void;
  regPassword: string;
  setRegPassword: (val: string) => void;
  regConfirmPassword: string;
  setRegConfirmPassword: (val: string) => void;
  showRegPassword: boolean;
  setShowRegPassword: (show: boolean) => void;
  showRegConfirmPassword: boolean;
  setShowRegConfirmPassword: (show: boolean) => void;
  agreeTerms: boolean;
  setAgreeTerms: (agree: boolean) => void;
  isRegistering: boolean;
  registerError: string;
  onSubmit: (e: React.FormEvent) => void;
}

export default function RegisterForm({
  regFullName,
  setRegFullName,
  regEmail,
  setRegEmail,
  regPassword,
  setRegPassword,
  regConfirmPassword,
  setRegConfirmPassword,
  showRegPassword,
  setShowRegPassword,
  showRegConfirmPassword,
  setShowRegConfirmPassword,
  agreeTerms,
  setAgreeTerms,
  isRegistering,
  registerError,
  onSubmit
}: RegisterFormProps) {
  const [emailCheckError, setEmailCheckError] = React.useState('');
  const [isCheckingEmail, setIsCheckingEmail] = React.useState(false);

  const handleEmailBlur = async () => {
    if (!regEmail) return;
    
    // Simple email regex validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(regEmail)) {
      setEmailCheckError('Định dạng email không hợp lệ.');
      return;
    }

    setEmailCheckError('');
    setIsCheckingEmail(true);
    try {
      const res = await checkEmailExists(regEmail);
      if (res.success && res.exists) {
        setEmailCheckError('Email này đã được sử dụng bởi tài khoản khác!');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsCheckingEmail(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (emailCheckError) return;
    onSubmit(e);
  };

  return (
    <motion.div
      key="register-form-div"
      initial={{ opacity: 0, x: 15, y: 1 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      exit={{ opacity: 0, x: -15, y: -1 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4.5">
        {registerError && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-3 bg-red-500/10 border border-red-500/20 text-red-655 text-xs rounded-xl font-jakarta"
          >
            {registerError}
          </motion.div>
        )}

        {/* Full Name Field */}
        <div className="space-y-1.5">
          <label className="text-[12px] uppercase tracking-widest text-black/60 font-semibold small-caps block ml-0.5 font-jakarta">
            Họ và Tên
          </label>
          <input 
            type="text"
            required
            placeholder="Nguyễn Văn A"
            value={regFullName}
            onChange={(e) => setRegFullName(e.target.value)}
            className="w-full glass-input px-4 py-2.5 rounded-xl text-sm outline-none placeholder-black/35 font-jakarta"
          />
        </div>

        {/* Email Field */}
        <div className="space-y-1.5">
          <label className="text-[12px] uppercase tracking-widest text-black/60 font-semibold small-caps block ml-0.5 font-jakarta">
            Email
          </label>
          <input 
            type="email"
            required
            placeholder="example@techvie.com"
            value={regEmail}
            onChange={(e) => {
              setRegEmail(e.target.value);
              if (emailCheckError) setEmailCheckError('');
            }}
            onBlur={handleEmailBlur}
            className={`w-full glass-input px-4 py-2.5 rounded-xl text-sm outline-none placeholder-black/35 font-jakarta ${
              emailCheckError ? 'border-red-500/50 focus:border-red-500 ring-1 ring-red-500/20' : ''
            }`}
          />
          {isCheckingEmail && (
            <span className="text-[10px] text-gray-400 block ml-1 font-sans animate-pulse">Đang kiểm tra email...</span>
          )}
          {emailCheckError && (
            <span className="text-[10px] text-red-500 block ml-1 font-sans font-bold">{emailCheckError}</span>
          )}
        </div>

        {/* Password Row */}
        <div className="grid grid-cols-2 gap-3.5">
          <div className="space-y-1.5">
            <label className="text-[12px] uppercase tracking-widest text-black/60 font-semibold small-caps block ml-0.5 font-jakarta">
              Mật khẩu
            </label>
            <div className="relative">
              <input 
                type={showRegPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                className="w-full glass-input pl-4 pr-10 py-2.5 rounded-xl text-sm outline-none placeholder-black/35 font-jakarta"
              />
              <button 
                type="button"
                onClick={() => setShowRegPassword(!showRegPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-black/45 hover:text-black transition-opacity cursor-pointer flex items-center justify-center"
              >
                {showRegPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[12px] uppercase tracking-widest text-black/60 font-semibold small-caps block ml-0.5 font-jakarta">
              Xác nhận lại mật khẩu
            </label>
            <div className="relative">
              <input 
                type={showRegConfirmPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                value={regConfirmPassword}
                onChange={(e) => setRegConfirmPassword(e.target.value)}
                className="w-full glass-input px-4 py-2.5 rounded-xl text-sm outline-none placeholder-black/35 font-jakarta"
              />
              <button 
                type="button"
                onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-black/45 hover:text-black transition-opacity cursor-pointer flex items-center justify-center"
              >
                {showRegConfirmPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>
        </div>

        {/* Agree Terms Checkbox */}
        <div className="flex items-center gap-2.5 pt-0.5">
          <input 
            type="checkbox"
            id="reg-agree-terms"
            checked={agreeTerms}
            onChange={(e) => setAgreeTerms(e.target.checked)}
            className="rounded border-black/20 text-black focus:ring-0 h-4 w-4 bg-transparent cursor-pointer" 
          />
          <label htmlFor="reg-agree-terms" className="font-jakarta text-[12px] font-semibold text-black/60 select-none cursor-pointer">
            Tôi đồng ý với <span className="text-black hover:underline cursor-pointer">Điều khoản dịch vụ</span> &amp; <span className="text-black hover:underline cursor-pointer">Bảo mật</span>
          </label>
        </div>

        {/* Submit Button */}
        <button 
          type="submit"
          disabled={isRegistering}
          className="w-full py-4.5 sm:py-5 bg-black text-white rounded-xl font-jakarta text-xs font-bold tracking-[0.2em] mt-2 active:scale-[0.98] transition-all glow-button uppercase cursor-pointer"
        >
          {isRegistering ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              <span>ĐANG ĐĂNG KÝ...</span>
            </div>
          ) : (
            'THAM GIA TECHVIE'
          )}
        </button>
      </form>
    </motion.div>
  );
}
