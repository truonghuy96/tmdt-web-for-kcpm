export type TabType = 'home' | 'brand' | 'products' | 'news' | 'contact' | 'checkout' | 'account' | 'login' | 'register' | 'admin' | 'policy' | 'reset-password';

export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  description: string;
  specs: {
    label: string;
    value: string;
  }[];
  colors?: string[];
  averageRating?: number;
  reviewCount?: number;
  stock?: number;
  badge?: 'PREMIUM' | 'TRENDY' | 'FLAGSHIP' | 'LIMITED' | 'NORMAL';
}

export interface ReviewUser {
  _id: string;
  username: string;
  avatar?: string;
  email?: string;
}

export interface Review {
  id: string;
  _id: string;
  product_id: string;
  user_id: ReviewUser | string;
  username: string;
  order_id: string;
  rating: number;
  title?: string;
  comment: string;
  verified_purchase: boolean;
  created_at: string;
  isHidden?: boolean;
  reply?: {
    comment: string;
    replied_at: string;
    admin_username: string;
  };
}

export interface ReviewSummary {
  averageRating: number;
  reviewCount: number;
  breakdown: {
    [key: number]: number;
  };
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedColor?: string;
}

export interface NewsArticle {
  id: string;
  title: string;
  category: string;
  date: string;
  summary: string;
  content: string;
  image: string;
}

export interface TimelineEvent {
  year: string;
  title: string;
  description: string;
}

export interface TeamMember {
  name: string;
  role: string;
  bio: string;
  image: string;
}


