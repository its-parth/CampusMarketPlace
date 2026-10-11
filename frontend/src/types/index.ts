export type UserRole = 'STUDENT' | 'ADMIN';
export type VerificationStatus = 'UNVERIFIED' | 'PENDING' | 'VERIFIED' | 'REJECTED';
export type ProductCondition = 'BRAND_NEW' | 'LIKE_NEW' | 'GOOD' | 'FAIR' | 'REFURBISHED';
export type ProductStatus = 'AVAILABLE' | 'RESERVED' | 'SOLD' | 'ARCHIVED';
export type TransactionStatus = 'PENDING' | 'ACCEPTED' | 'COMPLETED' | 'CANCELLED';

export interface User {
  id: number;
  full_name: string;
  email: string;
  role: UserRole;
  avatar_url?: string;
  phone?: string;
  university: string;
  student_id_number?: string;
  verification_status: VerificationStatus;
  student_card_image?: string;
  bio?: string;
  rating_avg: number;
  rating_count: number;
  is_active?: boolean;
  created_at?: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  product_count?: number;
}

export interface ProductImage {
  id: number;
  product_id: number;
  image_url: string;
  is_primary: boolean;
}

export interface Product {
  id: number;
  seller_id: number;
  category_id: number;
  title: string;
  description: string;
  price: number;
  original_price?: number;
  condition_state: ProductCondition;
  status: ProductStatus;
  campus_location: string;
  is_featured: boolean;
  views_count: number;
  favorites_count: number;
  created_at: string;
  updated_at?: string;
  
  // Joined fields
  category_name?: string;
  category_slug?: string;
  seller_name?: string;
  seller_email?: string;
  seller_avatar?: string;
  seller_rating?: number;
  seller_rating_count?: number;
  seller_university?: string;
  seller_verification?: VerificationStatus;
  primary_image?: string;
  images?: ProductImage[];
  is_favorite?: boolean;
}

export interface Conversation {
  id: number;
  product_id: number;
  buyer_id: number;
  seller_id: number;
  last_message_at: string;
  created_at: string;
  product_title?: string;
  product_price?: number;
  product_status?: ProductStatus;
  product_image?: string;
  other_user_id?: number;
  other_user_name?: string;
  other_user_avatar?: string;
  other_user_verification?: VerificationStatus;
  last_message?: string;
  unread_count?: number;
}

export interface Message {
  id: number;
  conversation_id: number;
  sender_id: number;
  sender_name?: string;
  sender_avatar?: string;
  message_text: string;
  is_read: boolean;
  created_at: string;
}

export interface Transaction {
  id: number;
  product_id: number;
  buyer_id: number;
  seller_id: number;
  agreed_price: number;
  status: TransactionStatus;
  meetup_location?: string;
  meetup_time?: string;
  notes?: string;
  completed_at?: string;
  created_at: string;
  
  // Joined fields
  product_title?: string;
  product_price?: number;
  product_image?: string;
  seller_name?: string;
  seller_avatar?: string;
  seller_email?: string;
  buyer_name?: string;
  buyer_avatar?: string;
  review_id?: number;
  rating?: number;
  review_comment?: string;
}

export interface Review {
  id: number;
  transaction_id: number;
  reviewer_id: number;
  reviewee_id: number;
  rating: number;
  comment?: string;
  created_at: string;
  reviewer_name?: string;
  reviewer_avatar?: string;
}

export interface Report {
  id: number;
  reporter_id: number;
  target_type: 'PRODUCT' | 'USER';
  target_id: number;
  reason: string;
  description: string;
  status: 'PENDING' | 'INVESTIGATING' | 'RESOLVED' | 'DISMISSED';
  action_taken?: string;
  created_at: string;
  reporter_name?: string;
  reporter_email?: string;
  target_detail?: any;
}

export interface NotificationItem {
  id: number;
  user_id: number;
  title: string;
  message: string;
  type: 'SYSTEM' | 'CHAT' | 'TRANSACTION' | 'VERIFICATION' | 'PRICE_DROP';
  link?: string;
  is_read: boolean;
  created_at: string;
}
