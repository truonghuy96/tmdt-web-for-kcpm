import React, { useState } from "react";
import { ShieldCheck, Truck, RefreshCw, Lock, ArrowRight, FileText } from "lucide-react";

interface PolicySection {
  id: string;
  title: string;
  icon: React.ReactNode;
  summary: string;
  details: string[];
}

const policies: PolicySection[] = [
  {
    id: "warranty",
    title: "Chính sách Bảo hành",
    icon: <ShieldCheck className="w-6 h-6" />,
    summary: "Cam kết chất lượng với chính sách bảo hành 1-đổi-1 nhanh chóng, bảo vệ quyền lợi tối đa cho bạn.",
    details: [
      "Bảo hành 1-đổi-1 đối với các thiết bị điện tử (đèn LED, cáp sạc) nếu có lỗi từ nhà sản xuất.",
      "Sẵn sàng đổi mới sản phẩm nếu có lỗi kỹ thuật (màu in xấu, sai thiết kế) đối với các sản phẩm ốp lưng custom.",
      "Hỗ trợ xử lý sự cố nhanh chóng qua các kênh chăm sóc khách hàng chính thức.",
      "Lưu ý: Không hỗ trợ bảo hành với các trường hợp rơi vỡ, móp méo, đứt gãy do quá trình sử dụng chủ quan."
    ]
  },
  {
    id: "shipping",
    title: "Chính sách Vận chuyển",
    icon: <Truck className="w-6 h-6" />,
    summary: "Đóng gói aesthetic dạng hộp quà tặng, giao hàng an toàn đến tận tay qua các đối tác vận chuyển uy tín.",
    details: [
      "Mọi đơn hàng đều được đóng gói chỉn chu dưới dạng hộp quà tặng (Gift box) kèm mút chống sốc bảo vệ an toàn tuyệt đối.",
      "Thời gian giao hàng dự kiến từ 1-3 ngày đối với khu vực TP.HCM và 3-5 ngày cho các tỉnh thành khác.",
      "Đối với các đơn hàng ốp lưng in hình custom, thời gian xưởng hoàn thiện và bàn giao cho bưu cục là từ 1-2 ngày.",
      "Quy định xác nhận: Chúng tôi sẽ gọi điện xác nhận trước khi đóng hàng. Nếu sau 2 ngày quý khách không xác nhận đặt hàng qua điện thoại (tối đa 3 lần gọi), TechVie có quyền hủy đơn hàng của quý khách.",
      "Khách hàng có thể theo dõi mã vận đơn (Tracking) trực tiếp trên hệ thống để nắm bắt lộ trình."
    ]
  },
  {
    id: "returns",
    title: "Đổi trả & Hoàn tiền",
    icon: <RefreshCw className="w-6 h-6" />,
    summary: "Quy trình xử lý minh bạch. Yêu cầu cung cấp video mở hộp (unbox) để đảm bảo tính khách quan.",
    details: [
      "Điều kiện bắt buộc: Khách hàng cần cung cấp video quay rõ quá trình mở hàng (unbox) không cắt ghép để được hỗ trợ bảo hành hoặc đổi trả.",
      "Hỗ trợ hoàn tiền hoặc đổi mới trong vòng 7 ngày đầu tiên nếu sản phẩm giao sai phân loại, sai màu sắc.",
      "Không hỗ trợ hoàn trả với các sản phẩm in ấn custom theo yêu cầu cá nhân (trừ trường hợp lỗi do xưởng in).",
      "Chi phí vận chuyển hai chiều phát sinh do lỗi từ phía TechVie sẽ do cửa hàng chi trả hoàn toàn."
    ]
  },
  {
    id: "privacy",
    title: "Bảo mật Dữ liệu",
    icon: <Lock className="w-6 h-6" />,
    summary: "Tôn trọng và bảo vệ tuyệt đối thông tin cá nhân của bạn theo đúng quy định của pháp luật hiện hành.",
    details: [
      "Mọi thông tin định danh (Họ tên, SĐT, Địa chỉ) chỉ được sử dụng cho mục đích giao hàng và chăm sóc khách hàng.",
      "Mật khẩu và dữ liệu giao dịch trên website TechVie được mã hóa an toàn qua giao thức HTTPS bảo mật.",
      "Khách hàng có toàn quyền yêu cầu xóa bỏ hoặc chỉnh sửa dữ liệu cá nhân trên hệ thống bất cứ lúc nào.",
      "TechVie cam kết không bán, không chia sẻ dữ liệu của bạn cho bất kỳ bên thứ ba nào vì mục đích quảng cáo thương mại."
    ]
  }
];

export default function PolicyPage() {
  const [activePolicy, setActivePolicy] = useState<string>("warranty");

  const currentPolicy = policies.find(p => p.id === activePolicy) || policies[0];

  return (
    <div className="py-12 max-w-7xl mx-auto px-6 font-sans text-left">
      {/* Page Header */}
      <div className="mb-14">
        <span className="text-xs uppercase tracking-[0.3em] text-gray-500 font-bold mb-3 block">
          TECHVIE SERVICES
        </span>
        <h1 className="text-4xl md:text-5xl font-sans tracking-tighter text-gray-950 font-extrabold mb-4">
          Chính Sách Của TechVie
        </h1>
        <p className="text-md text-justify text-gray-500 font-sans mt-2 max-w-2xl">
          Tại TechVie, chúng tôi tin rằng trải nghiệm mua sắm phụ kiện và đồ setup không chỉ dừng lại ở thiết kế thẩm mỹ hay chất lượng sản phẩm, mà còn ở sự an tâm và dịch vụ hỗ trợ tận tâm, minh bạch dành cho bạn.
        </p>
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
        {/* Left Column: Policy Cards Grid */}
        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-5">
          {policies.map((policy) => {
            const isActive = policy.id === activePolicy;
            return (
              <div
                key={policy.id}
                onClick={() => setActivePolicy(policy.id)}
                className={`group p-6 sm:p-8 rounded-3xl border text-left transition-all duration-300 cursor-pointer flex flex-col justify-between min-h-[240px] relative overflow-hidden select-none
                  ${isActive 
                    ? "bg-linear-to-b from-black/5 to-white/90 border-black/5 shadow-xl" 
                    : "bg-white text-gray-950 border-gray-200 hover:border-gray-300 hover:shadow-lg hover:-translate-y-1"
                  }
                `}
              >
                {/* Visual ambient glow inside active card */}
                {isActive && (
                  <div className="absolute -top-12 -right-12 w-32 h-32 bg-white/5 rounded-full blur-2xl pointer-events-none" />
                )}

                <div className="space-y-5">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 border
                    ${isActive ? "" : "bg-gray-50 text-gray-900 border-gray-200 group-hover:border-black group-hover:bg-gray-100"}
                  `}>
                    {policy.icon}
                  </div>
                  <h3 className="font-extrabold text-base uppercase tracking-tight">{policy.title}</h3>
                  <p className={`text-sm leading-relaxed
                    ${isActive ? "text-gray-800" : "text-gray-500"}
                  `}>
                    {policy.summary}
                  </p>
                </div>

                <div className={`pt-6 flex items-center gap-1.5 text-[12px] font-black uppercase tracking-wider mt-auto transition-colors duration-300 ${isActive ? 'text-gray-600' : 'text-gray-500 group-hover:text-black'}`}>
                  <span>Chi tiết</span>
                  <ArrowRight size={12} className={`transition-transform duration-300 group-hover:translate-x-1 ${isActive ? "text-gray-600" : "text-black"}`} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Detailed Charter View */}
        <div className="lg:col-span-5 p-8 lg:p-10 relative min-h-[460px] flex flex-col justify-between">
          <div className="space-y-8">
            <div className="flex items-center gap-4 border-b border-gray-200 pb-6">
              <div className="w-12 h-12 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-900 shadow-sm shrink-0">
                <FileText size={20} />
              </div>
              <div>
                <span className="text-[12px] font-mono font-bold uppercase tracking-widest text-gray-500 block mb-1">CHARTER SPECIFICATION</span>
                <h4 className="font-extrabold text-xl uppercase tracking-tight text-gray-950 leading-tight">
                  {currentPolicy.title}
                </h4>
              </div>
            </div>

            <div className="space-y-6">
              {currentPolicy.details.map((item, index) => (
                <div key={index} className="flex gap-4 items-start text-md font-sans">
                  <span className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center text-[16px] font-bold font-mono shrink-0 mt-0.5 shadow-sm">
                    {index + 1}
                  </span>
                  <p className="text-gray-700 leading-relaxed font-medium text-justify">
                    {item}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-6 border-t border-gray-200 mt-10 text-[14px] font-mono text-gray-500 leading-relaxed font-semibold">
            Cam kết thuộc Điều khoản Sử dụng Hệ thống TECHVIE. Mọi quyền lợi được pháp luật bảo vệ.
          </div>
        </div>
      </div>
    </div>
  );
}
