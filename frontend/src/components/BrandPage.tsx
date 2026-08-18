import { motion } from 'motion/react';
import { Sparkles, Compass, Eye, Gift, BadgeCheck, ShieldCheck } from 'lucide-react';
import SloganQuote from "./SloganQuote";

export default function BrandPage() {

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
      className="py-12 relative min-h-screen"
    >
      {/* Blurred Aesthetic Background Image */}
      {/* <div 
        className="fixed inset-0 z-[0] bg-cover bg-center bg-no-repeat opacity-30 blur-md scale-110"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=2072&auto=format&fit=crop')" }}
      /> */}
      {/* Overlay for readability */}
      {/* <div className="fixed inset-0 z-[-10] bg-slate-50/80 backdrop-blur-sm" /> */}
      {/* Hero Header */}
      <div className="max-w-7xl mx-auto px-6 mb-20 text-center relative">
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-80 h-80 bg-secondary/10 rounded-full blur-3xl pointer-events-none -z-10" />
        <span className="text-lg uppercase tracking-[0.4em] text-secondary font-bold mb-4 block">
          CÂU CHUYỆN & SỨ MỆNH
        </span>
        <h1 className="text-5xl md:text-7xl font-sans tracking-tighter text-gray-950 font-extrabold mb-6 leading-none">
          Kiến Tạo Không Gian Đậm Chất Riêng
        </h1>
        <p className="text-lg text-gray-650 max-w-2xl mx-auto leading-relaxed">
          Chúng tôi hiểu rằng phụ kiện công nghệ không chỉ dùng để bảo vệ thiết bị, mà còn là cách để bạn thể hiện cá tính. TechVie ra đời với sứ mệnh mang đến những giải pháp setup tối giản, tiện ích và độc bản cho người trẻ.
        </p>
      </div>

      {/* Brand Values Grid */}
      <div className="max-w-7xl mx-auto px-6 mb-24 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="p-10 rounded-3xl transition-transform duration-500 hover:-translate-y-2 border border-gray-200 bg-white/80 shadow-sm hover:shadow-md hover:border-gray-300 z-10">
          <div className="w-14 h-14 rounded-2xl bg-secondary/10 flex items-center text-secondary mb-4">
            <Compass size={32} />
          </div>
          <h3 className="text-2xl font-bold mb-3 tracking-tight text-gray-900">Phong Cách Tối Giản</h3>
          <p className="text-gray-600 leading-relaxed font-sans text-[15px]">
            Đề cao tính thẩm mỹ (aesthetic) trong từng chi tiết. Từ giá đỡ công thái học bảo vệ vai gáy đến đèn LED decor, mọi sản phẩm đều được tuyển chọn để tạo nên một không gian làm việc gọn gàng và tràn đầy cảm hứng.
          </p>
        </div>

        <div className=" p-10 rounded-3xl transition-transform duration-500 hover:-translate-y-2 border border-gray-200 bg-white/80 shadow-sm hover:shadow-md  hover:border-gray-300 z-10">
          <div className="w-14 h-14 rounded-2xl bg-secondary/10 flex items-center text-secondary mb-6">
            <Sparkles size={32} />
          </div>
          <h3 className="text-2xl font-bold mb-3 tracking-tight text-gray-900">Dấu Ấn Độc Bản</h3>
          <p className="text-gray-600 leading-relaxed font-sans text-[15px]">
            Thoát khỏi sự đại trà tẻ nhạt. Với dịch vụ thiết kế ốp lưng custom, TechVie giúp bạn tự do in ấn tên, hình ảnh để thể hiện cái tôi duy nhất trên chính những phụ kiện mang theo mỗi ngày.
          </p>
        </div>

        <div className="p-10 rounded-3xl transition-transform duration-500 hover:-translate-y-2 border border-gray-200 bg-white/80 shadow-sm hover:shadow-md  hover:border-gray-300 z-10">
          <div className="w-14 h-14 rounded-2xl bg-secondary/10 flex items-center text-secondary mb-6">
            <Eye size={32} />
          </div>
          <h3 className="text-2xl font-bold mb-3 tracking-tight text-gray-900">Giải Pháp Toàn Diện</h3>
          <p className="text-gray-600 leading-relaxed font-sans text-[15px]">
            Không bán lẻ tẻ, chúng tôi mang đến sự tiện lợi tối đa qua các "Combo Giải pháp". Tối ưu hóa góc học tập, tiết kiệm thời gian mua sắm và chi phí chỉ với một cú click chuột.
          </p>
        </div>
      </div>

      {/* Strategic Partners & Ecosystem Section */}
      <div className="max-w-7xl mx-auto px-6 mb-16">
        <div className="p-10 md:p-12 text-center relative overflow-hidden transition-all duration-500">
          <p className="text-lg uppercase tracking-[0.2em] text-gray-900 font-extrabold mb-8">
            CAM KẾT CHẤT LƯỢNG & TRẢI NGHIỆM
          </p>
          
          <div className="flex flex-wrap gap-4 items-center justify-center max-w-4xl mx-auto">
            {/* QC / Kiểm định */}
            <button className="flex items-center justify-center p-3 h-16 w-16 hover:w-auto hover:pr-5 bg-white rounded-full shadow-sm hover:shadow-md transition-all duration-300 group cursor-pointer overflow-hidden whitespace-nowrap">
              <BadgeCheck className="w-8 h-8 text-gray-400 group-hover:text-blue-500 transition-colors duration-300 shrink-0" strokeWidth={2.5} />
              <span className="font-sans font-extrabold text-[12px] text-gray-400 group-hover:text-blue-500 tracking-widest transition-all duration-300 max-w-0 opacity-0 group-hover:max-w-[120px] group-hover:opacity-100 group-hover:ml-2 overflow-hidden shrink-0">
                KIỂM ĐỊNH QC
              </span>
            </button>

            {/* Đóng gói Gift Box */}
            <button className="flex items-center justify-center p-3 h-16 w-16 hover:w-auto hover:pr-5 bg-white rounded-full shadow-sm hover:shadow-md transition-all duration-300 group cursor-pointer overflow-hidden whitespace-nowrap">
              <Gift className="w-8 h-8 text-gray-400 group-hover:text-amber-500 transition-colors duration-300 shrink-0" strokeWidth={2.5} />
              <span className="font-sans font-extrabold text-[12px] text-gray-400 group-hover:text-amber-500 tracking-widest transition-all duration-300 max-w-0 opacity-0 group-hover:max-w-[120px] group-hover:opacity-100 group-hover:ml-2 overflow-hidden shrink-0">
                GIFT BOX
              </span>
            </button>

            {/* Bảo hành 1-đổi-1 */}
            <button className="flex items-center justify-center p-3 h-16 w-16 hover:w-auto hover:pr-5 bg-white rounded-full shadow-sm hover:shadow-md transition-all duration-300 group cursor-pointer overflow-hidden whitespace-nowrap">
              <ShieldCheck className="w-8 h-8 text-gray-400 group-hover:text-emerald-500 transition-colors duration-300 shrink-0" strokeWidth={2.5} />
              <span className="font-sans font-extrabold text-[12px] text-gray-400 group-hover:text-emerald-500 tracking-widest transition-all duration-300 max-w-0 opacity-0 group-hover:max-w-full group-hover:opacity-100 group-hover:ml-2 overflow-hidden shrink-0">
                BẢO HÀNH 1-ĐỔI-1
              </span>
            </button>
          </div>
          
          <p className="text-gray-500 font-sans text-[16px] mt-8 max-w-3xl mx-auto leading-relaxed">
            Mọi sản phẩm trước khi đến tay bạn đều trải qua quy trình kiểm tra chất lượng (QC) nghiêm ngặt. TechVie chú trọng đóng gói chỉn chu theo tiêu chuẩn hộp quà tặng (Gift box) kèm thư tay, cùng chính sách bảo hành 1-đổi-1 minh bạch, mang lại sự an tâm tuyệt đối khi mua sắm.
          </p>
        </div>        
      </div>
        <div className="p-10 md:p-12 relative overflow-hidden transition-all duration-500">
          <p className="text-lg uppercase tracking-[0.2em] text-gray-900 font-extrabold text-center">
            SỨ MỆNH CỦA TECHVIE
          </p>
          <SloganQuote />
        </div>       
    </motion.div>
  );
}
