
export interface Category {
  id: string;
  name: string;
  imageUrl: string;
}

export enum RentalType {
  Daily = 'daily',
  Monthly = 'monthly',
}

export interface Review {
  id:string;
  user: string;
  rating: number; // 1-5
  comment: string;
  date: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  categoryId: string;
  imageUrl: string[];
  rentalType: RentalType;
  specs: Record<string, string>;
  lenderPricing: { // Price set by the lender
    daily?: number;
    monthly?: {
      '3': number;
      '6': number;
      '12': number;
    };
  };
  displayPricing: { // Price shown to renters after AI adjustment
    daily?: number;
    monthly?: {
      '3': number;
      '6': number;
      '12': number;
    };
  };
  aiAssessedQuality: 'Standard' | 'Excellent';
  reviews?: Review[];
  estimatedValue?: number;
  lenderEmail: string;
  commissionRate: number; // e.g., 0.15 for 15%
}

export interface User {
  name: string;
  email: string;
  kycVerified: boolean;
  emailVerified: boolean;
  isAdmin?: boolean;
  sessionId?: string;
}

export type View = 'home' | 'listing' | 'detail' | 'documentation' | 'admin' | 'lenderDashboard';

export type SortOption = 'relevance' | 'price-asc' | 'price-desc' | 'rating-desc';

export interface Order {
  id: string;
  productId: string;
  userEmail: string;
  renterName: string;
  startDate: string;
  endDate: string;
  status: 'pending' | 'active' | 'completed' | 'rejected';
  totalPrice: number;
  lenderEarnings: number;
}
