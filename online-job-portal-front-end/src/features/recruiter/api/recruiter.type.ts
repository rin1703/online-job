export interface CurrentSubscription {
  _id?: string;
  userId?: string;
  packageId?: string;
  startDate?: string;
  endDate?: string | null;
  status?: string;
}

export interface CurrentWithPackagesResponse {
  success: boolean;
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
