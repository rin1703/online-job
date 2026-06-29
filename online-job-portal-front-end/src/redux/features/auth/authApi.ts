import type {
  ChangePasswordRequest,
  ChangePasswordResponse,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
} from '@/features/auth/api/auth.type';
import type { JobSeekerFormData, RecruiterFormData } from '@/features/auth/auth.schema';
import { baseApi } from '@/redux/baseApi';

interface SignUpResponse {
  success: boolean;
  userID: string;
  message: string;
}

/**
 * SignInResponse from backend
 * Backend only returns token - user info should be decoded from JWT
 */
interface SignInResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    // User info is not returned by backend - decode from JWT instead
  };
}

const transformSignUpData = (credentials: JobSeekerFormData | RecruiterFormData) => {
  if (credentials.role === 'job_seeker') {
    const jobSeekerData = credentials as JobSeekerFormData;
    // Backend has inconsistency: validation expects fullName/phoneNumber,
    // but service expects firstName/lastName/birthday/phone
    // Send both to satisfy both layers
    return {
      fullName: `${jobSeekerData.firstName.trim()} ${jobSeekerData.lastName.trim()}`.trim(),
      email: jobSeekerData.email.trim(),
      password: jobSeekerData.password,
      phoneNumber: jobSeekerData.phone.trim(),
      // Also send fields for service layer
      firstName: jobSeekerData.firstName.trim(),
      lastName: jobSeekerData.lastName.trim(),
      birthday: jobSeekerData.birthday,
      phone: jobSeekerData.phone.trim(),
      role: jobSeekerData.role,
    };
  } else {
    // Recruiter registration
    const recruiterData = credentials as RecruiterFormData;

    // Parse location string format: "Street Address, Ward, District, Province"
    const parseLocation = (locationStr: string) => {
      const parts = locationStr.split(',').map(p => p.trim()).filter(p => p.length > 0);

      if (parts.length >= 4) {
        // Format: Street Address, Ward, District, Province
        return {
          address: parts[0], // Street Address
          district: `${parts[1]}, ${parts[2]}`, // Ward, District
          city: parts[parts.length - 1], // Province
        };
      } else if (parts.length === 3) {
        // Format: Ward, District, Province (no street address)
        return {
          address: parts[0], // Ward as address
          district: parts[1], // District
          city: parts[2], // Province
        };
      } else if (parts.length === 2) {
        // Format: District, Province
        return {
          address: '',
          district: parts[0],
          city: parts[1],
        };
      } else {
        // Format: Only Province
        return {
          address: '',
          district: '',
          city: parts[0] || '',
        };
      }
    };

    const location = parseLocation(recruiterData.location);

    return {
      email: recruiterData.email.trim(),
      password: recruiterData.password,
      firstName: recruiterData.firstName.trim(),
      lastName: recruiterData.lastName.trim(),
      birthday: recruiterData.birthday,
      phone: recruiterData.phone.trim(),
      companyName: recruiterData.companyName.trim(),
      taxCode: recruiterData.taxCode.trim().toUpperCase(), // Auto-uppercase
      location: location,
      role: recruiterData.role,
    };
  }
};

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Sign Up
    signUp: builder.mutation<SignUpResponse, JobSeekerFormData | RecruiterFormData>({
      query: (credentials) => {
        // Route to correct endpoint based on role
        const endpoint = credentials.role === 'recruiter'
          ? '/user/auth/register/recruiter'
          : '/user/auth/register';

        return {
          url: endpoint,
          method: 'POST',
          body: transformSignUpData(credentials),
        };
      },
    }),

    // Sign In
    signIn: builder.mutation<SignInResponse, { email: string; password: string }>({
      query: (credentials) => ({
        url: '/user/auth/login',
        method: 'POST',
        body: credentials,
      }),

      async onQueryStarted(_arg, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          console.log('[authApi.onQueryStarted] Sign in response:', data);
          if (data.success && data.data?.token) {
            console.log('[authApi.onQueryStarted] Note: Credential saving is now handled in SignInForm component');
          } else {
            console.error('[authApi.onQueryStarted] Invalid response structure:', data);
          }
        } catch (error: any) {
          console.error('[authApi.onQueryStarted] Login failed:', {
            errorStatus: error?.status,
            errorData: error?.data,
            errorMessage: error?.message,
            fullError: error,
          });
        }
      },
    }),

    // Logout
    logout: builder.mutation<void, void>({
      queryFn: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        return { data: undefined };
      },
    }),

    // Forgot Password - Send OTP
    forgotPassword: builder.mutation<ForgotPasswordResponse, ForgotPasswordRequest>({
      query: (data) => ({
        url: '/user/auth/forgot-password',
        method: 'POST',
        body: data,
      }),
    }),

    // Reset Password - Verify OTP and set new password
    resetPassword: builder.mutation<ResetPasswordResponse, ResetPasswordRequest>({
      query: (data) => ({
        url: '/user/auth/reset-password',
        method: 'POST',
        body: data,
      }),
    }),

    // Change Password - For authenticated users
    changePassword: builder.mutation<ChangePasswordResponse, ChangePasswordRequest>({
      query: (data) => ({
        url: '/user/password/change',
        method: 'PUT',
        body: {
          oldPassword: data.currentPassword,
          newPassword: data.newPassword,
        },
      }),
    }),
  }),
});

export const {
  useSignUpMutation,
  useSignInMutation,
  useLogoutMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useChangePasswordMutation,
} = authApi;
