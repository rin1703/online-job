import type { LoginRequest, LoginResponse, AuthUser } from "@/features/auth/api/auth.type";
import { baseApi } from "@/redux/baseApi";
import { decodeUserFromToken } from "@/lib/jwt";

export interface GetMeResponse {
  success: boolean;
  message: string;
  data: AuthUser;
}

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (data) => ({
        url: 'user/auth/login',
        method: 'POST',
        body: data
      }),
      invalidatesTags: ['Auth'],
    }),

    /**
     * Get current user info
     * Decodes JWT token to get user info (userId, role, etc)
     */
    getMe: builder.query<GetMeResponse, void>({
      queryFn: (_, api) => {
        const state = api.getState() as any;
        const token = state.auth?.token || localStorage.getItem('token');

        if (!token) {
          return {
            error: {
              status: 401,
              data: { message: 'No token found' },
            },
          } as any;
        }

        try {
          // Decode JWT token to get user info
          const user = decodeUserFromToken(token);
          if (!user) {
            return {
              error: {
                status: 401,
                data: { message: 'Failed to decode token' },
              },
            } as any;
          }

          console.log('[authApi] User data from JWT token:', {
            userId: user.userId,
            role: user.role,
          });

          return {
            data: {
              success: true,
              message: 'User fetched',
              data: user,
            },
          };
        } catch (error) {
          console.error('[authApi] Failed to decode token:', error);
          return {
            error: {
              status: 500,
              data: { message: 'Failed to decode token' },
            },
          } as any;
        }
      },
      providesTags: ['Auth'],
    })
  })
})

export const { useLoginMutation, useGetMeQuery } = authApi;
