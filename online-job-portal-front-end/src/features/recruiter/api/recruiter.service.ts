import { baseApi } from '@/redux/baseApi';
import type {
  CurrentWithPackagesResponse,
  WalletBalanceResponse,
  CreatePaymentRequest,
  CreatePaymentResponse,
  BuySubscriptionRequest,
  BuySubscriptionResponse,
  CreateRefundRequest,
  CreateRefundResponse,
} from './recruiter.type';

export const recruiterApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCurrentSubscriptionWithPackages: builder.query<CurrentWithPackagesResponse, string>({
      query: (userId: string) => ({ url: `subscription/current-with-packages/${userId}`, method: 'GET' }),
      providesTags: ['Profile'],
    }),
    getWalletBalance: builder.query<WalletBalanceResponse, void>({
      query: () => ({ url: 'wallet/balance', method: 'GET' }),
      providesTags: ['Profile'],
    }),
    createPayment: builder.mutation<CreatePaymentResponse, CreatePaymentRequest>({
      query: (body) => ({ url: 'payment/create', method: 'POST', body }),
    }),
    buySubscriptionWithWallet: builder.mutation<BuySubscriptionResponse, BuySubscriptionRequest>({
      query: (body) => ({ url: 'subscription/purchase/wallet', method: 'POST', body }),
      invalidatesTags: ['Profile'],
    }),
    createRefund: builder.mutation<CreateRefundResponse, CreateRefundRequest>({
      query: (body) => ({ url: 'refunds/create', method: 'POST', body }),
    }),
    verifyPayment: builder.mutation<{ ok: boolean; success: boolean; status: string; payment?: any }, { orderCode: string }>({
      query: (body) => ({ url: 'payment/verify', method: 'POST', body }),
      invalidatesTags: ['Profile'],
    }),
  }),
});

export const {
  useGetCurrentSubscriptionWithPackagesQuery,
  useGetWalletBalanceQuery,
  useCreatePaymentMutation,
  useBuySubscriptionWithWalletMutation,
  useCreateRefundMutation,
  useVerifyPaymentMutation,
} = recruiterApi;
