export type ListingType = 'rent' | 'trade' | 'purchase';

export type ListingCondition = 'Brand New' | 'Like New' | 'Excellent' | 'Good' | 'Fair';

export type ListingCategory =
  | 'Electronics'
  | 'Computers and Accessories'
  | 'Books'
  | 'Tools and Equipment'
  | 'Photography'
  | 'Gaming'
  | 'Sports Equipment'
  | 'Cricket Equipment'
  | 'Fashion & Apparel'
  | 'Furniture'
  | 'Other';

export interface UserProfile {
  id: string;
  full_name: string;
  email?: string;
  avatar_url: string;
  bio?: string;
  location?: string;
  rating?: number;
  review_count?: number;
  joined_date?: string;
  trade_trials_used?: number;
  is_trade_subscribed?: boolean;
  subscription_tier?: 'free' | 'pro' | 'elite';
}

export interface Listing {
  id: string;
  user_id: string;
  user?: UserProfile;
  title: string;
  description: string;
  category: ListingCategory;
  condition: ListingCondition;
  listing_type: ListingType;
  
  // Rent
  rental_price?: number;
  rental_duration?: 'Hourly' | 'Daily' | 'Weekly';
  availability_status?: 'available' | 'booked' | 'unavailable';
  
  // Trade
  estimated_value?: number;
  trade_desired?: string;
  trade_cash_adjustment?: number; // e.g. +500 means requester adds 500, -500 means requester requests 500
  
  // Purchase
  purchase_price?: number;
  
  images: string[];
  location: string;
  status: 'active' | 'pending' | 'completed' | 'inactive';
  featured?: boolean;
  view_count?: number;
  created_at: string;
  updated_at?: string;
}

export interface RentalRequest {
  id: string;
  listing_id: string;
  listing?: Listing;
  renter_id: string;
  renter?: UserProfile;
  owner_id: string;
  start_date: string;
  end_date: string;
  duration_type: 'Hourly' | 'Daily' | 'Weekly';
  duration_units: number;
  total_amount: number;
  status: 'pending' | 'approved' | 'rejected' | 'completed' | 'cancelled';
  message: string;
  created_at: string;
}

export interface TradeOffer {
  id: string;
  listing_id: string;
  listing?: Listing;
  requester_id: string;
  requester?: UserProfile;
  owner_id: string;
  offered_item_title: string;
  offered_item_description: string;
  offered_item_image?: string;
  offered_item_value: number;
  cash_adjustment: number; // positive = requester gives extra cash, negative = requester asks cash
  status: 'pending' | 'accepted' | 'rejected' | 'completed' | 'cancelled';
  negotiation_notes?: string;
  created_at: string;
}

export interface PurchaseTransaction {
  id: string;
  listing_id: string;
  listing?: Listing;
  buyer_id: string;
  buyer?: UserProfile;
  seller_id: string;
  seller?: UserProfile;
  amount: number;
  status: 'completed' | 'pending' | 'refunded';
  payment_method: string;
  receipt_number: string;
  shipping_address: string;
  created_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender?: UserProfile;
  content: string;
  message_type: 'text' | 'rental_offer' | 'trade_offer' | 'system';
  metadata?: Record<string, any>;
  is_read: boolean;
  created_at: string;
}

export interface Conversation {
  id: string;
  listing_id?: string;
  listing?: Listing;
  participant1_id: string;
  participant1?: UserProfile;
  participant2_id: string;
  participant2?: UserProfile;
  subject?: string;
  last_message_text?: string;
  last_message_at: string;
  unread_count?: number;
}

export interface Review {
  id: string;
  reviewer_id: string;
  reviewer?: UserProfile;
  target_user_id: string;
  listing_id?: string;
  rating: number;
  comment: string;
  created_at: string;
}

export interface CommunityRequest {
  id: string;
  user_id: string;
  user?: UserProfile;
  item_name: string;
  category?: ListingCategory;
  listing_type?: ListingType;
  details?: string;
  created_at: string;
}
