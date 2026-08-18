import { Product, Review, ReviewSummary } from '../types';

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/**
 * TechVie E-Commerce API Service
 * Tập trung toàn bộ các yêu cầu HTTP/gửi nhận dữ liệu với Express Backend Server.
 * Thiết kế tinh giản, tối thiểu hoá độ trễ và hỗ trợ TypeScript chặt chẽ.
 */

// Helper to load token and headers for Admin APIs
function getAuthHeaders() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('techvie_token') : '';
  const cleanToken = token ? (token.startsWith('Bearer ') ? token : `Bearer ${token}`) : '';
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (cleanToken) {
    headers['Authorization'] = cleanToken;
  }
  return headers;
}

// Đăng ký nhận bản tin khuyến mãi (Newsletter Subscription)
export async function subscribeNewsletter(email: string): Promise<{ success: boolean; message: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/contacts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Khách hàng đăng ký Newsletter',
        email: email,
        subject: 'Đăng ký Nhận Bản Tin Khuyến Mãi',
        message: `Khách hàng yêu cầu đăng ký nhận ưu đãi bản tin qua email: ${email}`
      })
    });
    if (!response.ok) {
      throw new Error('Không thể kết nối với máy chủ!');
    }
    const data = await response.json();
    return { success: data.success, message: data.message || 'Đăng ký thành công!' };
  } catch (error) {
    console.error('Lỗi khi đăng ký nhận tin:', error);
    // Fallback hỗ trợ offline/development mượt mà
    return { success: true, message: 'Đăng ký nhận tin thành công (chế độ dự phòng offline)' };
  }
}

// Gửi hòm thư liên hệ góp ý (Contact Inquiry)
export async function sendContactInquiry(payload: {
  name: string;
  email: string;
  subject: string;
  message: string;
}): Promise<{ success: boolean; message: string; inquiry?: any }> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/contacts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!response.ok) {
      throw new Error('Gửi góp ý thất bại!');
    }
    return await response.json();
  } catch (error) {
    console.error('Lỗi gửi thư góp ý:', error);
    return { success: false, message: 'Có lỗi xảy ra, vui lòng thử lại sau.' };
  }
}

export async function getCurrentUser(token: string): Promise<{ success: boolean; user?: any; message?: string }> {
  try {
    const cleanToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
    const response = await fetch(`${API_BASE_URL}/api/auth/profile`, {
      method: 'GET',
      headers: {
        'Authorization': cleanToken,
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      throw new Error('Phiên đăng nhập không hợp lệ hoặc đã hết hạn.');
    }
    return await response.json();
  } catch (error: any) {
    console.error('Lỗi khi lấy thông tin người dùng:', error);
    return { success: false, message: error.message };
  }
}

export async function updateUserProfile(profile: { name: string; phone: string; address: string }): Promise<{ success: boolean; user?: any; message?: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/profile`, {
      method: 'PUT',
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(profile),
    });
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || 'Không thể cập nhật hồ sơ.');
    }
    return await response.json();
  } catch (error: any) {
    console.error('Lỗi khi cập nhật hồ sơ:', error);
    return { success: false, message: error.message };
  }
}

// Tải danh sách đơn đặt hàng của cá nhân người dùng
export async function getUserOrders(token: string): Promise<{ success: boolean; orders?: any[]; message?: string }> {
  try {
    const cleanToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
    const response = await fetch(`${API_BASE_URL}/api/orders/user`, {
      method: 'GET',
      headers: {
        'Authorization': cleanToken,
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      throw new Error('Không thể tải lịch sử đơn hàng.');
    }
    return await response.json();
  } catch (error: any) {
    console.error('Lỗi khi lấy danh sách đơn hàng:', error);
    return { success: false, message: error.message };
  }
}

// Kiểm tra xem email đã được đăng ký hay chưa
export async function checkEmailExists(email: string): Promise<{ success: boolean; exists: boolean; message?: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/check-email?email=${encodeURIComponent(email)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      throw new Error('Không thể kiểm tra email.');
    }
    return await response.json();
  } catch (error: any) {
    console.error('Lỗi khi kiểm tra email:', error);
    return { success: false, exists: false, message: error.message };
  }
}

// Tải danh sách thư góp ý khách hàng (Chỉ dành cho Administrator)
export async function getContactMessages(): Promise<{ success: boolean; contacts: any[] }> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/contacts`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Không thể tải hòm thư!');
    return await response.json();
  } catch (error) {
    console.error('Lỗi lấy hòm thư góp ý:', error);
    return { success: false, contacts: [] };
  }
}

// Xóa thư góp ý khách hàng (Chỉ dành cho Administrator)
export async function deleteContactMessage(id: string): Promise<{ success: boolean; message?: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/contacts/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Không thể xóa thư liên hệ.');
    return await response.json();
  } catch (error: any) {
    console.error('Lỗi khi xóa thư liên hệ:', error);
    return { success: false, message: error.message };
  }
}

// Trả lời thư góp ý khách hàng (Chỉ dành cho Administrator)
export async function replyContactMessage(id: string, replySubject: string, replyContent: string): Promise<{ success: boolean; message?: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/contacts/${id}/reply`, {
      method: 'POST',
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ replySubject, replyContent })
    });
    if (!response.ok) throw new Error('Không thể gửi thư phản hồi.');
    return await response.json();
  } catch (error: any) {
    console.error('Lỗi khi gửi thư phản hồi:', error);
    return { success: false, message: error.message };
  }
}

// Tải danh sách thiết bị của tài khoản người dùng
export async function getUserDevices(): Promise<{ success: boolean; devices: any[] }> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/my-devices`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Không thể tải danh sách thiết bị.');
    return await response.json();
  } catch (error: any) {
    console.error('Lỗi khi tải danh sách thiết bị:', error);
    return { success: false, devices: [] };
  }
}

// Tải danh sách đơn đặt hàng từ Server (Chỉ dành cho Administrator)
export async function getAdminOrders(): Promise<{ success: boolean; orders: any[] }> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/orders`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Không thể tải sổ đơn hàng!');
    return await response.json();
  } catch (error) {
    console.error('Lỗi lấy sổ đơn hàng:', error);
    return { success: false, orders: [] };
  }
}

// Cập nhật trạng thái bưu kiện đơn hàng (Chỉ dành cho Administrator)
export async function updateOrderStatus(orderId: number | string, status: string, statusType: string): Promise<{ success: boolean; order?: any }> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/orders/${orderId}/status`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status, statusType })
    });
    if (!response.ok) throw new Error('Cập nhật trạng thái thất bại!');
    return await response.json();
  } catch (error) {
    console.error('Lỗi cập nhật trạng thái đơn hàng:', error);
    return { success: false };
  }
}

// Khởi tạo một đơn hàng mẫu ngẫu nhiên (Dashboard Helper)
export async function seedDummyOrder(payload: any): Promise<{ success: boolean; orderId?: number | string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!response.ok) throw new Error('Thanh toán đơn thử nghiệm thất bại!');
    return await response.json();
  } catch (error) {
    console.error('Lỗi tạo đơn thử nghiệm:', error);
    return { success: false };
  }
}

// Xoá sạch toàn bộ nhật ký đơn hàng trên Server (Chỉ dành cho Administrator)
export async function clearAllOrdersFromServer(): Promise<{ success: boolean; message: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/orders`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Dọn dẹp bưu kiện thất bại!');
    return await response.json();
  } catch (error) {
    console.error('Lỗi dọn sạch đơn hàng:', error);
    return { success: false, message: 'Lỗi dọn dẹp đơn bưu kiện trên máy chủ.' };
  }
}

// Lưu trữ đơn hàng thực tế của khách hàng khi Checkout
// export async function submitCheckoutOrder(orderData: {
//   fullName: string;
//   phone: string;
//   email: string;
//   address: string;
//   notes: string;
//   paymentMethod: string;
//   deliveryMethod: string;
//   cart: Array<{ product: Product; quantity: number }>;
//   finalTotal: string;
// }): Promise<{ success: boolean; orderId?: number | string; message?: string }> {
//   try {
//     const response = await fetch(`${API_BASE_URL}/api/checkout`, {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify(orderData)
//     });
//     if (!response.ok) throw new Error('Gửi đơn mua hàng thất bại!');
//     return await response.json();
//   } catch (error) {
//     console.error('Lỗi trong quá trình thanh toán:', error);
//     return { success: false, message: 'Máy chủ bận hoặc gặp lỗi truyền kết nối.' };
//   }
// }

// Tải danh sách phân loại sản phẩm (Categories) từ backend
export async function getCategories(includeDeleted: boolean = false): Promise<{ success: boolean; categories: string[] }> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/categories${includeDeleted ? '?includeDeleted=true' : ''}`);
    if (!response.ok) throw new Error('Không thể tải danh mục sản phẩm!');
    const data = await response.json();
    if (data && data.success && Array.isArray(data.categories)) {
      const dbCategories = data.categories.map((cat: any) => cat.name);
      const categories = dbCategories.includes('Tất cả')
        ? dbCategories
        : ['Tất cả', ...dbCategories];
      return { success: true, categories };
    }
    throw new Error('Dữ liệu danh mục không đúng định dạng!');
  } catch (error) {
    console.error('Lỗi khi lấy danh mục sản phẩm:', error);
    // Trả về fallback tĩnh nếu Backend gặp sự cố hoặc ngoại tuyến
    return {
      success: true,
      categories: ['Tất cả', 'Điện thoại', 'Laptop', 'Đồng hồ', 'Âm thanh', 'Bàn phím']
    };
  }
}

// Tải danh sách sản phẩm (Products) từ backend (Hỗ trợ lọc theo từ khóa tìm kiếm)
export async function getProducts(search?: string, includeDeleted: boolean = false): Promise<{ success: boolean; products: Product[] }> {
  try {
    const queryParams = [];
    if (search) queryParams.push(`search=${encodeURIComponent(search.trim())}`);
    if (includeDeleted) queryParams.push(`includeDeleted=true`);
    const queryString = queryParams.length > 0 ? `?${queryParams.join('&')}` : '';
    const url = `${API_BASE_URL}/api/products${queryString}`;
    console.log(`[API getProducts] ➔ Bắt đầu gửi yêu cầu tải danh sách sản phẩm${search ? ` với từ khóa "${search}"` : ''} từ backend...`);
    const response = await fetch(url);
    if (!response.ok) throw new Error('Không thể tải danh sách sản phẩm!');
    const data = await response.json();
    
    let productList: any[] = [];
    if (Array.isArray(data)) {
      productList = data;
    } else if (data && Array.isArray(data.products)) {
      productList = data.products;
    } else if (data && Array.isArray(data.data)) {
      productList = data.data;
    }
    
    const mappedProducts = productList.map((p: any) => ({
      ...p,
      id: p.id || p._id || String(Math.random()),
    }));
    console.log(`[API getProducts] ✔ Tải thành công ${mappedProducts.length} sản phẩm từ backend.`);
    return { success: true, products: mappedProducts };
  } catch (error) {
    console.error('[API getProducts] ❌ Lỗi khi tải danh sách sản phẩm:', error);
    return { success: false, products: [] };
  }
}

// Thêm sản phẩm mới (chỉ dành cho Admin)
export async function createProduct(formData: FormData, token: string): Promise<{ success: boolean; message: string; product?: Product }> {
  try {
    console.log('[API createProduct] ➔ Bắt đầu gửi yêu cầu tạo sản phẩm mới:', formData.get('name'));
    const cleanToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
    const response = await fetch(`${API_BASE_URL}/api/products`, {
      method: 'POST',
      headers: {
        'Authorization': cleanToken,
      },
      body: formData,
    });
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.message || 'Không thể tạo sản phẩm mới!');
    }
    const data = await response.json();
    console.log('[API createProduct] ✔ Phản hồi từ backend:', data);
    const product = data.product ? { ...data.product, id: data.product.id || data.product._id } : undefined;
    return { success: true, message: data.message || 'Thêm sản phẩm thành công!', product };
  } catch (error: any) {
    console.error('[API createProduct] ❌ Lỗi thêm sản phẩm:', error);
    return { success: false, message: error.message || 'Lỗi kết nối khi thêm sản phẩm.' };
  }
}

// Cập nhật sản phẩm (chỉ dành cho Admin)
export async function updateProduct(id: string, formData: FormData, token: string): Promise<{ success: boolean; message: string; product?: Product }> {
  try {
    console.log(`[API updateProduct] ➔ Bắt đầu gửi yêu cầu cập nhật sản phẩm #${id}:`, formData.get('name'));
    const cleanToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
    const response = await fetch(`${API_BASE_URL}/api/products/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': cleanToken,
      },
      body: formData,
    });
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.message || 'Không thể cập nhật sản phẩm!');
    }
    const data = await response.json();
    console.log(`[API updateProduct] ✔ Phản hồi cập nhật sản phẩm #${id}:`, data);
    const product = data.product ? { ...data.product, id: data.product.id || data.product._id } : undefined;
    return { success: true, message: data.message || 'Cập nhật sản phẩm thành công!', product };
  } catch (error: any) {
    console.error(`[API updateProduct] ❌ Lỗi cập nhật sản phẩm #${id}:`, error);
    return { success: false, message: error.message || 'Lỗi kết nối khi cập nhật sản phẩm.' };
  }
}

// Xóa sản phẩm (chỉ dành cho Admin)
export async function deleteProduct(id: string, token: string): Promise<{ success: boolean; message: string }> {
  try {
    console.log(`[API deleteProduct] ➔ Bắt đầu gửi yêu cầu xóa sản phẩm #${id}...`);
    const cleanToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
    const response = await fetch(`${API_BASE_URL}/api/products/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': cleanToken,
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.message || 'Không thể xóa sản phẩm!');
    }
    const data = await response.json();
    console.log(`[API deleteProduct] ✔ Phản hồi xóa sản phẩm #${id}:`, data);
    return { success: true, message: data.message || 'Xóa sản phẩm thành công!' };
  } catch (error: any) {
    console.error(`[API deleteProduct] ❌ Lỗi xóa sản phẩm #${id}:`, error);
    return { success: false, message: error.message || 'Lỗi kết nối khi xóa sản phẩm.' };
  }
}

// Tải danh sách thành viên hệ thống (Chỉ dành cho Admin)
export async function getSystemUsers(token: string, includeDeleted: boolean = false): Promise<{ success: boolean; users: any[] }> {
  try {
    const cleanToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
    const url = `${API_BASE_URL}/api/users${includeDeleted ? '?includeDeleted=true' : ''}`;
    const response = await fetch(url, {
      headers: {
        'Authorization': cleanToken,
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) throw new Error('Không thể tải danh sách thành viên!');
    return await response.json();
  } catch (error) {
    console.error('Lỗi lấy danh sách thành viên:', error);
    return { success: false, users: [] };
  }
}

// Cấp tài khoản thành viên mới (Chỉ dành cho Admin)
export async function adminCreateUser(userData: any, token: string): Promise<{ success: boolean; message: string; user?: any }> {
  try {
    const cleanToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
    const response = await fetch(`${API_BASE_URL}/api/users`, {
      method: 'POST',
      headers: {
        'Authorization': cleanToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.message || 'Cấp tài khoản thất bại!');
    }
    return await response.json();
  } catch (error: any) {
    console.error('Lỗi admin cấp tài khoản:', error);
    return { success: false, message: error.message || 'Lỗi kết nối khi cấp tài khoản.' };
  }
}

// Thay đổi phân quyền thành viên (Chỉ dành cho Admin)
export async function toggleUserRole(id: string, token: string): Promise<{ success: boolean; message: string; user?: any }> {
  try {
    const cleanToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
    const response = await fetch(`${API_BASE_URL}/api/users/${id}/role`, {
      method: 'PUT',
      headers: {
        'Authorization': cleanToken,
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.message || 'Không thể đổi phân quyền!');
    }
    return await response.json();
  } catch (error: any) {
    console.error('Lỗi đổi phân quyền thành viên:', error);
    return { success: false, message: error.message || 'Lỗi kết nối.' };
  }
}

// Thay đổi trạng thái VIP thành viên (Chỉ dành cho Admin)
export async function toggleUserVip(id: string, token: string): Promise<{ success: boolean; message: string; user?: any }> {
  try {
    const cleanToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
    const response = await fetch(`${API_BASE_URL}/api/users/${id}/vip`, {
      method: 'PUT',
      headers: {
        'Authorization': cleanToken,
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.message || 'Không thể đổi trạng thái VIP!');
    }
    return await response.json();
  } catch (error: any) {
    console.error('Lỗi thay đổi trạng thái VIP thành viên:', error);
    return { success: false, message: error.message || 'Lỗi kết nối.' };
  }
}

// Khóa / Mở khóa tài khoản thành viên (Chỉ dành cho Admin)
export async function toggleUserStatus(id: string, token: string): Promise<{ success: boolean; message: string; user?: any }> {
  try {
    const cleanToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
    const response = await fetch(`${API_BASE_URL}/api/users/${id}/status`, {
      method: 'PUT',
      headers: {
        'Authorization': cleanToken,
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.message || 'Không thể thay đổi trạng thái tài khoản!');
    }
    return await response.json();
  } catch (error: any) {
    console.error('Lỗi đổi trạng thái tài khoản thành viên:', error);
    return { success: false, message: error.message || 'Lỗi kết nối.' };
  }
}

// Gỡ bỏ tài khoản thành viên khỏi database (Chỉ dành cho Admin)
export async function adminDeleteUser(id: string, token: string): Promise<{ success: boolean; message: string }> {
  try {
    const cleanToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
    const response = await fetch(`${API_BASE_URL}/api/users/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': cleanToken,
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.message || 'Không thể gỡ bỏ tài khoản thành viên!');
    }
    return await response.json();
  } catch (error: any) {
    console.error('Lỗi gỡ bỏ tài khoản thành viên:', error);
    return { success: false, message: error.message || 'Lỗi kết nối.' };
  }
}

// Khôi phục tài khoản thành viên đã xóa (Chỉ dành cho Admin)
export async function restoreUser(id: string, token: string): Promise<{ success: boolean; message: string }> {
  try {
    const cleanToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
    const response = await fetch(`${API_BASE_URL}/api/users/${id}/restore`, {
      method: 'PUT',
      headers: {
        'Authorization': cleanToken,
        'Content-Type': 'application/json',
      },
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.message || 'Không thể khôi phục tài khoản thành viên!');
    return { success: true, message: data.message || 'Khôi phục tài khoản thành công!' };
  } catch (error: any) {
    console.error('Lỗi khôi phục tài khoản thành viên:', error);
    return { success: false, message: error.message || 'Lỗi kết nối.' };
  }
}

// Khôi phục sản phẩm đã xóa (Chỉ dành cho Admin)
export async function restoreProduct(id: string, token: string): Promise<{ success: boolean; message: string }> {
  try {
    const cleanToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
    const response = await fetch(`${API_BASE_URL}/api/products/${id}/restore`, {
      method: 'PUT',
      headers: {
        'Authorization': cleanToken,
        'Content-Type': 'application/json',
      },
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.message || 'Không thể khôi phục sản phẩm!');
    return { success: true, message: data.message || 'Khôi phục sản phẩm thành công!' };
  } catch (error: any) {
    console.error('Lỗi khôi phục sản phẩm:', error);
    return { success: false, message: error.message || 'Lỗi kết nối.' };
  }
}

// Tải danh mục tìm kiếm phổ biến (Popular Searches) từ backend
export async function getPopularSearches(): Promise<{ success: boolean; popular: string[] }> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/search/popular`);
    if (!response.ok) throw new Error('Không thể tải tìm kiếm phổ biến!');
    return await response.json();
  } catch (error) {
    console.error('Lỗi khi tải danh sách tìm kiếm phổ biến:', error);
    return {
      success: true,
      popular: ['Giao diện Prism-1', 'Cảm biến Flux', 'Thủy tinh lỏng', 'Hệ thống v2.0']
    };
  }
}

// Tải lịch sử tìm kiếm gần đây (Search History) từ backend
export async function getSearchHistory(): Promise<{ success: boolean; history: string[] }> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/search/history`, {
      headers: getAuthHeaders() // Tự động đính kèm token nếu đăng nhập để tải lịch sử cá nhân
    });
    if (!response.ok) throw new Error('Không thể tải lịch sử tìm kiếm!');
    return await response.json();
  } catch (error) {
    console.error('Lỗi khi tải lịch sử tìm kiếm:', error);
    return {
      success: true,
      history: ['Core v2', 'Lab Update']
    };
  }
}

// Đổi mật khẩu thành viên (Change Password)
export async function changePassword(payload: {
  currentPassword: string;
  newPassword: string;
}): Promise<{ success: boolean; message: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/change-password`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });
    const data = await response.json();
    return { success: data.success, message: data.message || 'Thao tác hoàn tất!' };
  } catch (error) {
    console.error('Lỗi khi đổi mật khẩu:', error);
    return { success: false, message: 'Không thể kết nối đến máy chủ trực tuyến.' };
  }
}

// Lấy danh sách danh mục từ backend
export async function getBackendCategories(includeDeleted = false): Promise<{ success: boolean; categories?: any[]; message?: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/categories?includeDeleted=${includeDeleted}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    if (!response.ok) throw new Error('Không thể kết nối máy chủ để tải danh mục!');
    return await response.json();
  } catch (error: any) {
    console.error('Lỗi tải danh mục:', error);
    return { success: false, message: error.message };
  }
}

// Tạo danh mục mới (Chỉ cho Admin)
export async function createCategory(name: string): Promise<{ success: boolean; category?: any; message?: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/categories`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ name })
    });
    return await response.json();
  } catch (error: any) {
    console.error('Lỗi tạo danh mục:', error);
    return { success: false, message: error.message };
  }
}

// Cập nhật tên danh mục (Chỉ cho Admin)
export async function updateCategory(id: string, name: string): Promise<{ success: boolean; category?: any; message?: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/categories/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ name })
    });
    return await response.json();
  } catch (error: any) {
    console.error('Lỗi cập nhật danh mục:', error);
    return { success: false, message: error.message };
  }
}

// Xóa danh mục (Soft Delete - Chỉ cho Admin)
export async function deleteCategory(id: string): Promise<{ success: boolean; category?: any; message?: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/categories/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return await response.json();
  } catch (error: any) {
    console.error('Lỗi xóa danh mục:', error);
    return { success: false, message: error.message };
  }
}

// Khôi phục danh mục đã xóa mềm (Chỉ cho Admin)
export async function restoreCategory(id: string): Promise<{ success: boolean; category?: any; message?: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/categories/${id}/restore`, {
      method: 'PATCH',
      headers: getAuthHeaders()
    });
    return await response.json();
  } catch (error: any) {
    console.error('Lỗi khôi phục danh mục:', error);
    return { success: false, message: error.message };
  }
}

// Toggle bật/tắt danh mục (Chỉ cho Admin)
export async function toggleCategory(id: string): Promise<{ success: boolean; category?: any; message?: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/categories/${id}/toggle`, {
      method: 'PATCH',
      headers: getAuthHeaders()
    });
    return await response.json();
  } catch (error: any) {
    console.error('Lỗi toggle danh mục:', error);
    return { success: false, message: error.message };
  }
}

// Xóa hẳn danh mục khỏi cơ sở dữ liệu (Chỉ cho Admin)
export async function hardDeleteCategory(id: string): Promise<{ success: boolean; message?: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/categories/${id}/permanent`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return await response.json();
  } catch (error: any) {
    console.error('Lỗi xóa hẳn danh mục:', error);
    return { success: false, message: error.message };
  }
}

// Gửi logs từ Client về hiển thị trên CMD Backend Server
export async function sendClientLog(message: string, level: 'log' | 'warn' | 'error' = 'log', details?: any): Promise<void> {
  try {
    fetch(`${API_BASE_URL}/api/logs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ level, message, details })
    }).catch(() => {});
  } catch (e) {}
}

// Cập nhật trạng thái thanh toán đơn hàng (Admin xác nhận chuyển khoản/đối soát)
export async function updateOrderPaymentStatus(orderId: number | string, paymentStatus: 'pending' | 'paid' | 'failed' | 'cancelled'): Promise<{ success: boolean; order?: any; message?: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/orders/${orderId}/payment-status`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ paymentStatus })
    });
    if (!response.ok) throw new Error('Cập nhật thanh toán thất bại!');
    return await response.json();
  } catch (error) {
    console.error('Lỗi cập nhật trạng thái thanh toán:', error);
    return { success: false, message: 'Lỗi máy chủ.' };
  }
}

// Lưu trữ đơn hàng thực tế của khách hàng khi Checkout
export async function submitCheckoutOrder(orderData: {
  fullName: string;
  phone: string;
  email: string;
  address: string;
  notes: string;
  paymentMethod: string;
  deliveryMethod: string;
  cart: Array<{ product: Product; quantity: number }>;
  finalTotal: string;
}): Promise<{ success: boolean; orderId?: number | string; message?: string; order?: any; payment?: any }> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData)
    });
    if (!response.ok) throw new Error('Gửi đơn mua hàng thất bại!');
    return await response.json();
  } catch (error) {
    console.error('Lỗi trong quá trình thanh toán:', error);
    return { success: false, message: 'Máy chủ bận hoặc gặp lỗi truyền kết nối.' };
  }
}

// Khách hàng chỉ được kiểm tra trạng thái thanh toán, không được tự xác nhận đã thanh toán
export async function getCheckoutPaymentStatus(orderId: number | string): Promise<{ success: boolean; message?: string; order?: any; payment?: any }> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/checkout/payment/status/${orderId}`);
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Không thể kiểm tra trạng thái thanh toán!');
    return data;
  } catch (error: any) {
    console.error('Lỗi kiểm tra trạng thái thanh toán:', error);
    return { success: false, message: error.message || 'Không thể kiểm tra trạng thái thanh toán.' };
  }
}

// Giả lập đối soát thanh toán tự động qua SePay Webhook (Dành cho kiểm thử Sandbox)
export async function simulateSepayPayment(orderId: number | string): Promise<{ success: boolean; message?: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/checkout/payment/sepay-ipn/simulate/${orderId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error('Lỗi giả lập thanh toán SePay:', error);
    return { success: false, message: error.message || 'Không thể kết nối đến máy chủ.' };
  }
}

// Gửi yêu cầu xác thực email (gửi email thật qua SMTP)
export async function sendEmailVerification(): Promise<{ success: boolean; message: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/send-verification-email`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    const data = await response.json();
    return { success: data.success, message: data.message || 'Yêu cầu gửi mail thành công!' };
  } catch (error: any) {
    console.error('Lỗi khi gửi yêu cầu xác thực email:', error);
    return { success: false, message: error.message || 'Không thể kết nối đến máy chủ.' };
  }
}

// Lấy danh sách đánh giá của sản phẩm
export async function getReviewsByProduct(productId: string): Promise<{ success: boolean; reviews: Review[]; summary: ReviewSummary; message?: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/reviews/${productId}`);
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Không thể lấy danh sách đánh giá!');
    return data;
  } catch (error: any) {
    console.error('Lỗi khi lấy đánh giá sản phẩm:', error);
    return {
      success: false,
      reviews: [],
      summary: { averageRating: 0, reviewCount: 0, breakdown: {} },
      message: error.message || 'Không thể kết nối đến máy chủ.'
    };
  }
}

// Tạo đánh giá mới cho sản phẩm
export async function createReview(productId: string, reviewData: { rating: number; title?: string; comment: string }): Promise<{ success: boolean; review?: Review; message?: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/reviews/${productId}`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(reviewData)
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Không thể tạo đánh giá!');
    return data;
  } catch (error: any) {
    console.error('Lỗi khi tạo đánh giá sản phẩm:', error);
    return { success: false, message: error.message || 'Không thể kết nối đến máy chủ.' };
  }
}

// Xóa đánh giá
export async function deleteReview(reviewId: string): Promise<{ success: boolean; message?: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/reviews/${reviewId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Không thể xóa đánh giá!');
    return data;
  } catch (error: any) {
    console.error('Lỗi khi xóa đánh giá sản phẩm:', error);
    return { success: false, message: error.message || 'Không thể kết nối đến máy chủ.' };
  }
}

// Kiểm tra quyền đánh giá sản phẩm (server-side, chính xác nhất)
export async function checkCanReview(productId: string): Promise<{ success: boolean; canReview: boolean; reason?: string; message?: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/reviews/${productId}/can-review`, {
      headers: getAuthHeaders()
    });
    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error('Lỗi khi kiểm tra quyền đánh giá:', error);
    return { success: false, canReview: false, message: error.message || 'Không thể kết nối đến máy chủ.' };
  }
}

// Lấy toàn bộ danh sách đánh giá cho admin
export async function getAdminReviews(params?: { search?: string; rating?: string; includeDeleted?: boolean }): Promise<{ success: boolean; reviews?: any[]; message?: string }> {
  try {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.rating) query.append('rating', params.rating);
    if (params?.includeDeleted) query.append('includeDeleted', 'true');

    const response = await fetch(`${API_BASE_URL}/api/reviews/admin/all?${query.toString()}`, {
      headers: getAuthHeaders()
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Không thể tải danh sách đánh giá admin.');
    return data;
  } catch (error: any) {
    console.error('Lỗi khi tải đánh giá admin:', error);
    return { success: false, message: error.message || 'Không thể kết nối đến máy chủ.' };
  }
}

// Lấy thống kê đánh giá cho admin
export async function getAdminReviewStats(): Promise<{ success: boolean; stats?: any; message?: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/reviews/admin/stats`, {
      headers: getAuthHeaders()
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Không thể tải thống kê đánh giá.');
    return data;
  } catch (error: any) {
    console.error('Lỗi khi tải thống kê đánh giá:', error);
    return { success: false, message: error.message || 'Không thể kết nối đến máy chủ.' };
  }
}

// Khôi phục đánh giá đã xóa
export async function restoreReview(reviewId: string): Promise<{ success: boolean; message?: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/reviews/${reviewId}/restore`, {
      method: 'PATCH',
      headers: getAuthHeaders()
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Không thể khôi phục đánh giá.');
    return data;
  } catch (error: any) {
    console.error('Lỗi khi khôi phục đánh giá:', error);
    return { success: false, message: error.message || 'Không thể kết nối đến máy chủ.' };
  }
}

// Chỉnh sửa đánh giá (User edit)
export async function updateReview(reviewId: string, rating: number, title: string, comment: string): Promise<{ success: boolean; message?: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/reviews/${reviewId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ rating, title, comment })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Không thể chỉnh sửa đánh giá.');
    return data;
  } catch (error: any) {
    console.error('Lỗi khi chỉnh sửa đánh giá:', error);
    return { success: false, message: error.message || 'Không thể kết nối đến máy chủ.' };
  }
}

// Phản hồi đánh giá (Admin reply)
export async function replyReview(reviewId: string, comment: string): Promise<{ success: boolean; message?: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/reviews/admin/${reviewId}/reply`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ comment })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Không thể gửi phản hồi.');
    return data;
  } catch (error: any) {
    console.error('Lỗi khi gửi phản hồi:', error);
    return { success: false, message: error.message || 'Không thể kết nối đến máy chủ.' };
  }
}

// Ẩn/Hiện đánh giá (Owner hoặc Admin)
export async function toggleHideReview(reviewId: string, isHidden?: boolean): Promise<{ success: boolean; message?: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/reviews/${reviewId}/toggle-hide`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ isHidden })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Không thể thay đổi trạng thái ẩn/hiện đánh giá.');
    return data;
  } catch (error: any) {
    console.error('Lỗi khi ẩn/hiện đánh giá:', error);
    return { success: false, message: error.message || 'Không thể kết nối đến máy chủ.' };
  }
}

// ================= VOUCHER APIS =================

export async function getVouchers(): Promise<{ success: boolean; promos?: any[]; message?: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/vouchers`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Không thể lấy danh sách voucher');
    return data;
  } catch (error: any) {
    console.error('Lỗi khi lấy danh sách voucher:', error);
    return { success: false, message: error.message };
  }
}

export async function createVoucher(voucherData: any): Promise<{ success: boolean; promo?: any; message?: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/vouchers`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(voucherData)
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Không thể tạo voucher');
    return data;
  } catch (error: any) {
    console.error('Lỗi khi tạo voucher:', error);
    return { success: false, message: error.message };
  }
}

export async function toggleVoucherStatus(id: string): Promise<{ success: boolean; promo?: any; message?: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/vouchers/${id}/toggle`, {
      method: 'PUT',
      headers: getAuthHeaders()
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Không thể cập nhật trạng thái voucher');
    return data;
  } catch (error: any) {
    console.error('Lỗi khi cập nhật trạng thái voucher:', error);
    return { success: false, message: error.message };
  }
}

export async function deleteVoucher(id: string): Promise<{ success: boolean; message?: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/vouchers/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Không thể xóa voucher');
    return data;
  } catch (error: any) {
    console.error('Lỗi khi xóa voucher:', error);
    return { success: false, message: error.message };
  }
}



