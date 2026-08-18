import { Cpu, Clock, Loader } from 'lucide-react';

interface TabDevicesProps {
  devices?: any[];
  isLoading?: boolean;
}

export default function TabDevices({ devices = [], isLoading = false }: TabDevicesProps) {
  return (
    <div className="bg-white/60 backdrop-blur-lg border border-white/60 rounded-xl p-6 relative overflow-hidden flex flex-col shadow-sm">
      <div className="mb-4 border-b border-white/60 pb-2">
        <h3 className="font-headline-lg text-headline-lg text-[#2d3748] tracking-widest">THIẾT BỊ HOẠT ĐỘNG & CHỈ SỐ</h3>
        <p className="text-[#4a5568] mt-1 max-w-lg text-sm">Theo dõi bảo hành phần cứng, trạng thái nâng cấp và cấu hình thiết bị của bạn.</p>
      </div>

      {isLoading ? (
        <div className="py-12 flex justify-center items-center">
          <Loader className="animate-spin text-gray-500" size={24} />
        </div>
      ) : devices.length === 0 ? (
        <div className="border border-dashed border-gray-300 rounded-2xl p-8 text-center text-gray-500 font-sans">
          <Cpu className="mx-auto mb-3 text-gray-400" size={32} />
          <h4 className="font-bold text-sm text-gray-800">Bạn chưa sở hữu sản phẩm nào từ TechVie</h4>
          <p className="text-md text-gray-500 mt-1 max-w-md mx-auto">
            Hệ thống sẽ tự động kích hoạt bảo hành điện tử và hiển thị cấu hình thiết bị tại đây ngay khi đơn hàng của bạn được giao thành công!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {devices.map((device, idx) => (
            <div key={idx} className="border border-white/20 rounded-2xl p-6 flex flex-col sm:flex-row gap-5 items-start bg-slate-950 text-white relative overflow-hidden shadow-lg">
              <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
              
              <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-white border border-white/10 flex-shrink-0 overflow-hidden">
                {device.image ? (
                  <img src={device.image} alt={device.name} className="w-full h-full object-cover" />
                ) : (
                  <Cpu size={22} />
                )}
              </div>
              
              <div className="space-y-3 flex-grow min-w-0 text-left">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[8px] uppercase font-bold tracking-widest text-indigo-400 font-mono">BẢO HÀNH CHỦ CHỐT (2 NĂM)</span>
                    <h4 className="font-sans font-black text-base text-white uppercase tracking-tight mt-0.5">{device.name}</h4>
                  </div>
                  <span className="bg-emerald-600 text-white text-[8px] font-black tracking-widest uppercase px-3 py-1 rounded-full border border-emerald-500">
                    Kích hoạt
                  </span>
                </div>
                
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Ngày mua: <strong className="text-slate-300">{device.purchaseDate}</strong>. Giá trị thiết bị: <strong className="text-slate-300">{(device.price || 0).toLocaleString('vi-VN')}₫</strong>
                </p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-white/10 text-[10px] text-slate-300 font-mono">
                  {device.specs && device.specs.slice(0, 3).map((s: any, sIdx: number) => (
                    <div key={sIdx}>
                      <span className="block text-slate-500 uppercase font-bold text-[8px] mb-1">{s.label}</span>
                      <strong className="text-white truncate block">{s.value}</strong>
                    </div>
                  ))}
                  <div>
                    <span className="block text-slate-500 uppercase font-bold text-[8px] mb-1 font-sans">Hạn bảo hành</span>
                    <strong className="text-white font-sans font-normal">{device.warrantyDate}</strong>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* <div className="mt-6 p-4 bg-white/50 border border-white/60 rounded-xl flex items-start gap-3 text-[#2d3748] text-[11px] leading-relaxed shadow-sm">
        <Clock size={20} className="text-black flex-shrink-0 mt-0.5" />
        <div className='!text-sm text-left'>
          <strong>Bạn cần đặt mua thêm loại phụ kiện nào?</strong>
          <p className="text-[#4a5568] mt-0.5">Mọi bộ phụ kiện cao cấp và củ sạc hi-end của TechVie đều đảm bảo truyền dẫn sạc mượt mà đồng bộ. Hãy duyệt sảnh để bổ sung mục giỏ hàng.</p>
        </div>
      </div> */}
    </div>
  );
}
