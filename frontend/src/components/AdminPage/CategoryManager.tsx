import React, { useState } from 'react';
import { FolderTree, Plus, Edit2, Trash2, Check, X } from 'lucide-react';
import { sendClientLog } from '../../services/api';

interface Category {
  _id: string;
  name: string;
  created_at?: string;
  isDeleted: boolean;
}

interface CategoryManagerProps {
  categories: Category[];
  onCreateCategory: (name: string) => Promise<void>;
  onUpdateCategory: (id: string, name: string) => Promise<void>;
  onToggleCategory: (id: string) => Promise<void>;
  onHardDeleteCategory: (id: string) => Promise<void>;
  isDarkMode?: boolean;
}

export default function CategoryManager({
  categories,
  onCreateCategory,
  onUpdateCategory,
  onToggleCategory,
  onHardDeleteCategory,
  isDarkMode = false,
}: CategoryManagerProps) {
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [togglingIds, setTogglingIds] = useState<Set<string>>(new Set());
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim() || isSubmitting) return;

    try {
      setIsSubmitting(true);
      await onCreateCategory(newCategoryName.trim());
      setNewCategoryName('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const startEditing = (category: Category) => {
    setEditingId(category._id);
    setEditingName(category.name);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditingName('');
  };

  const handleUpdate = async (id: string) => {
    if (!editingName.trim() || isSubmitting) return;

    try {
      setIsSubmitting(true);
      await onUpdateCategory(id, editingName.trim());
      setEditingId(null);
      setEditingName('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggle = async (id: string) => {
    const target = categories.find(c => c._id === id);
    const name = target ? target.name : id;
    const action = target?.isDeleted ? 'BẬT' : 'TẮT';
    
    sendClientLog(`[CategoryManager] Yêu cầu ${action} danh mục "${name}" (ID: ${id})`, 'log');
    setTogglingIds(prev => new Set(prev).add(id));
    try {
      await onToggleCategory(id);
      sendClientLog(`[CategoryManager] Đã ${action} danh mục "${name}" thành công`, 'log');
    } catch (err: any) {
      sendClientLog(`[CategoryManager] Lỗi khi ${action} danh mục "${name}": ${err.message}`, 'error');
    } finally {
      setTogglingIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const d = isDarkMode;

  // Separate active and inactive categories
  const activeCategories = categories.filter(c => !c.isDeleted);
  const inactiveCategories = categories.filter(c => c.isDeleted);

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Form to create Category (4 cols) */}
        <div className={`lg:col-span-4 p-6 sm:p-8 rounded-3xl shadow-sm space-y-4 border transition-all duration-300 ${
          d ? 'bg-[#161b22] border-[#30363d]' : 'bg-white border-gray-200'
        }`}>
          <div>
            <h3 className={`font-extrabold text-base uppercase tracking-wider text-left transition-colors duration-300 ${d ? 'text-white' : 'text-gray-955'}`}>
              Thêm Danh mục mới
            </h3>
            <p className={`text-xs md:text-[13px] font-sans mt-1.5 leading-relaxed text-left transition-colors duration-300 ${d ? 'text-gray-400' : 'text-gray-405'}`}>
              Tạo danh mục sản phẩm mới để dễ phân loại quầy hàng công nghệ của bạn.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5 flex flex-col text-left">
              <label className="text-[10px] uppercase font-bold text-gray-400">Tên danh mục *</label>
              <input
                type="text"
                required
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Ví dụ: Laptop Gaming"
                className={`w-full rounded-xl px-4 py-3 outline-none text-xs font-semibold transition-all duration-300 border ${
                  d
                    ? 'bg-[#0d1117]/60 border-[#30363d] text-white focus:bg-[#161b22] focus:border-indigo-500 placeholder-gray-500'
                    : 'bg-slate-50 border-slate-200 focus:border-black focus:bg-white text-gray-905 placeholder-gray-400'
                }`}
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full h-12 px-6 font-sans text-xs uppercase tracking-widest font-black rounded-xl transition-all duration-300 shadow active:scale-95 cursor-pointer flex items-center justify-center gap-2 ${
                isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
              } ${
                d ? 'bg-white! hover:bg-gray-100! text-black' : 'bg-black hover:bg-slate-900 text-white'
              }`}
            >
              <Plus size={14} />
              Thêm danh mục
            </button>
          </form>

          {/* Stats summary */}
          <div className={`mt-4 pt-4 border-t space-y-2 transition-all duration-300 ${
            d ? 'border-[#30363d]' : 'border-gray-100'
          }`}>
            <div className="flex justify-between items-center">
              <span className={`text-[10px] uppercase font-bold tracking-wider ${d ? 'text-gray-500' : 'text-gray-400'}`}>Đang hoạt động</span>
              <span className={`text-xs font-mono font-extrabold px-2.5 py-0.5 rounded-full ${
                d ? 'bg-emerald-950/40 text-emerald-400' : 'bg-emerald-50 text-emerald-700'
              }`}>{activeCategories.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className={`text-[10px] uppercase font-bold tracking-wider ${d ? 'text-gray-500' : 'text-gray-400'}`}>Đã tắt</span>
              <span className={`text-xs font-mono font-extrabold px-2.5 py-0.5 rounded-full ${
                d ? 'bg-rose-950/40 text-rose-400' : 'bg-rose-50 text-rose-600'
              }`}>{inactiveCategories.length}</span>
            </div>
          </div>
        </div>

        {/* List of categories (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className={`p-6 sm:p-8 rounded-3xl shadow-sm flex justify-between items-center border transition-all duration-300 ${
            d ? 'bg-[#161b22] border-[#30363d]' : 'bg-white border-gray-200'
          }`}>
            <div className="text-left">
              <h3 className={`font-extrabold text-base uppercase tracking-wider transition-colors duration-300 ${d ? 'text-white' : 'text-gray-955'}`}>
                Quản lý danh mục
              </h3>
              <p className={`text-xs md:text-[13px] font-sans mt-1.5 leading-relaxed transition-colors duration-300 ${d ? 'text-gray-400' : 'text-gray-405'}`}>
                Bật/tắt trạng thái hoặc xóa hẳn danh mục khỏi hệ thống.
              </p>
            </div>
            <span className={`text-xs font-mono font-bold px-4 py-2 rounded-full border transition-all duration-300 ${
              d ? 'bg-indigo-950/40 text-indigo-400 border-indigo-900/40' : 'bg-indigo-50 text-indigo-700 border-indigo-100'
            }`}>
              {categories.length} Danh mục
            </span>
          </div>

          {categories.length === 0 ? (
            <div className={`text-center py-20 rounded-[2rem] p-6 border transition-all duration-300 ${
              d ? 'bg-[#161b22] border-[#30363d]' : 'bg-white border-gray-200'
            }`}>
              <FolderTree size={40} className="text-gray-300 mx-auto mb-3" />
              <p className={`text-sm font-extrabold transition-colors duration-300 ${d ? 'text-white' : 'text-gray-808'}`}>
                Chưa có danh mục nào
              </p>
              <p className={`text-xs transition-colors duration-300 ${d ? 'text-gray-400' : 'text-gray-400'}`}>
                Hãy khởi tạo danh mục đầu tiên từ bảng bên trái.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {categories.map((c) => (
                <div 
                  key={c._id} 
                  className={`p-6 rounded-3xl shadow-sm transition-all duration-300 flex flex-col justify-between min-h-[170px] border ${
                    d ? 'bg-[#161b22] border-[#30363d]' : 'bg-white border-gray-200'
                  } ${c.isDeleted ? 'opacity-60' : 'hover:border-black/15'}`}
                >
                  <div className="text-left w-full">
                    {/* Header item info */}
                    <div className={`flex justify-between items-center border-b pb-3 mb-4 transition-all duration-300 ${
                      d ? 'border-[#30363d]' : 'border-gray-100'
                    }`}>
                      <span className="text-[10px] text-gray-400 uppercase tracking-widest font-mono">
                        {c.created_at ? new Date(c.created_at).toLocaleDateString('vi-VN') : 'Mặc định'}
                      </span>
                      
                      {/* Toggle Switch */}
                      <button
                        type="button"
                        onClick={() => handleToggle(c._id)}
                        disabled={togglingIds.has(c._id)}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-all duration-300 cursor-pointer focus:outline-none ${
                          togglingIds.has(c._id) ? 'opacity-50 cursor-wait' : ''
                        } ${
                          !c.isDeleted
                            ? (d ? 'bg-emerald-500' : 'bg-emerald-500')
                            : (d ? 'bg-gray-700' : 'bg-gray-300')
                        }`}
                        title={c.isDeleted ? 'Bật danh mục' : 'Tắt danh mục'}
                      >
                        <span
                          className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm transition-transform duration-300 ${
                            !c.isDeleted ? 'translate-x-4.5' : 'translate-x-0.5'
                          }`}
                        />
                      </button>
                    </div>

                    {editingId === c._id ? (
                      <div className="flex gap-2 items-center mb-4">
                        <input
                          type="text"
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          className={`flex-1 rounded-lg px-2.5 py-1.5 outline-none text-xs font-bold transition-all duration-300 border ${
                            d
                              ? 'bg-[#0d1117] border-[#30363d] text-white focus:border-indigo-500'
                              : 'bg-slate-50 border-slate-200 focus:border-black focus:bg-white text-gray-905'
                          }`}
                        />
                        <button
                          onClick={() => handleUpdate(c._id)}
                          className="p-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors cursor-pointer"
                        >
                          <Check size={14} />
                        </button>
                        <button
                          onClick={cancelEditing}
                          className="p-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors cursor-pointer"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3 mb-4">
                        <h4 className={`font-black text-sm tracking-tight transition-colors duration-300 ${
                          d ? 'text-white' : 'text-gray-955'
                        } ${c.isDeleted ? 'line-through opacity-70' : ''}`}>
                          {c.name}
                        </h4>
                        {c.isDeleted && (
                          <span className={`text-[9px] font-mono px-2 py-0.5 rounded font-extrabold ${
                            d ? 'bg-rose-500/15 text-rose-400' : 'bg-rose-500/10 text-rose-500'
                          }`}>
                            TẮT
                          </span>
                        )}
                        {!c.isDeleted && (
                          <span className={`text-[9px] font-mono px-2 py-0.5 rounded font-extrabold ${
                            d ? 'bg-emerald-500/15 text-emerald-400' : 'bg-emerald-500/10 text-emerald-600'
                          }`}>
                            BẬT
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions bar inside card */}
                  <div className={`flex items-center justify-end gap-5 pt-4 border-t text-xs transition-all duration-300 ${
                    d ? 'border-[#30363d]' : 'border-gray-50'
                  }`}>
                    {editingId !== c._id && (
                      <>
                        {confirmDeleteId === c._id ? (
                          <div className="flex items-center gap-3">
                            <span className="text-[10px] text-rose-500 font-extrabold uppercase animate-pulse">Xác nhận xóa?</span>
                            <button
                              type="button"
                              onClick={() => {
                                console.log('CategoryManager: Confirmed hard delete for category ID:', c._id);
                                sendClientLog(`[CategoryManager] Người dùng ĐỒNG Ý Xóa hẳn danh mục "${c.name}" (ID: ${c._id})`, 'warn');
                                onHardDeleteCategory(c._id);
                                setConfirmDeleteId(null);
                              }}
                              className="px-2.5 py-1 bg-rose-500 hover:bg-rose-600 text-white rounded text-[10px] font-black uppercase cursor-pointer"
                            >
                              Đồng ý
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                sendClientLog(`[CategoryManager] Người dùng đã HỦY yêu cầu Xóa hẳn danh mục "${c.name}" (ID: ${c._id})`, 'log');
                                setConfirmDeleteId(null);
                              }}
                              className="px-2.5 py-1 bg-gray-500 hover:bg-gray-600 text-white rounded text-[10px] font-black uppercase cursor-pointer"
                            >
                              Hủy
                            </button>
                          </div>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => startEditing(c)}
                              className="text-amber-600 hover:text-amber-800 font-black uppercase tracking-wider text-[10px] cursor-pointer flex items-center gap-1.5"
                            >
                              <Edit2 size={11} />
                              Đổi tên
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                console.log('CategoryManager: Initial click for hard delete, setting confirm ID:', c._id);
                                sendClientLog(`[CategoryManager] Người dùng click "Xóa hẳn" danh mục "${c.name}" (ID: ${c._id})`, 'log');
                                setConfirmDeleteId(c._id);
                              }}
                              className="text-rose-500 hover:text-rose-700 font-black uppercase tracking-wider text-[10px] cursor-pointer flex items-center gap-1.5"
                            >
                              <Trash2 size={11} />
                              Xóa hẳn
                            </button>
                          </>
                        )}
                      </>
                    )}
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
