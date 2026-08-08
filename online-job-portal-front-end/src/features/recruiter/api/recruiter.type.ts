export interface CurrentSubscription {
  _id?: string;
  userId?: string;
  packageId?: string;
  startDate?: string;
  endDate?: string | null;
  status?: string;
  daysRemaining?: number;
}

export interface CurrentWithPackagesResponse {
  ok?: boolean;
  subscription?: CurrentSubscription | null;
  packages?: Array<any>;
}

export interface ApiPackage {
  _id?: string;
  id?: string;
  name?: string;
  shortDescription?: string;
  description?: string;
  price?: number;
  duration?: { value: number; unit?: string };
  features?: any;
  isActive?: boolean;
  buyed?: boolean; // whether this package is currently bought by user
}

// Wallet Types
export interface WalletBalanceResponse {
  message: string;
  balance: number;
}

// Payment Types
export interface CreatePaymentRequest {
  jobPackageId: string;
}

export interface CreatePaymentResponse {
  ok: boolean;
  message: string;
  paymentUrl: string;
  orderCode: string;
}

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';
export type PaymentPurpose = 'subscription' | 'wallet_topup' | 'wallet_payment';

export interface PaymentHistoryItem {
  _id: string;
  orderCode: string;
  publicCode: string;
  amount: number;
  originAmount?: number;
  description: string;
  purpose: PaymentPurpose;
  status: PaymentStatus;
  paymentUrl?: string;
  package?: { _id: string; name: string; type: string } | null;
  refundStatus: 'none' | 'pending' | 'success' | 'failed';
  refundReason?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentHistoryParams {
  search?: string;
  status?: PaymentStatus;
  purpose?: PaymentPurpose;
  dateFrom?: string;
  dateTo?: string;
  minAmount?: number;
  maxAmount?: number;
  page?: number;
  limit?: number;
  sortOrder?: 'asc' | 'desc';
}

export interface PaymentHistoryResponse {
  payments: PaymentHistoryItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Subscription Purchase Types
export interface BuySubscriptionRequest {
  packageId: string;
}

export interface BuySubscriptionResponse {
  message: string;
  subscription: {
    _id: string;
    packageId: string;
    userId: string;
    startDate: string;
    endDate: string;
    status: string;
    autoRenew: boolean;
    features: {
      jobLimit: number;
      visibleDuration: number;
    };
  };
  walletBalance: number;
}

// Refund Types
export type RefundType = 'unused' | 'system';

export interface CreateRefundRequest {
  subscriptionId: string;
  reason: string;
  refundType: RefundType;
  reference?: string;
}

export interface CreateRefundResponse {
  ok: boolean;
  message: string;
  requestId: string;
}
