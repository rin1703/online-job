import { baseUrl } from "@/config";
import type { RootState } from "@/redux/store";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from "@reduxjs/toolkit/query/react";
import { logout } from "@/features/auth/api/auth.slice";

const baseQuery = fetchBaseQuery({
  baseUrl: baseUrl,
  // credentials: 'include', // ❌ Disabled due to BE CORS config issue (CORS_CREDENTIALS is string, not boolean)
  // We use JWT via Authorization header, so cookies are not needed
  prepareHeaders: (headers, { getState }) => {
    const state = getState() as RootState;
    // Try to get token from Redux state first, fallback to localStorage
    const token = state.auth?.token || localStorage.getItem("token");

    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

/**
 * BaseQuery with automatic 401 error handling
 * Logs out user and redirects to login when unauthorized
 */
const baseQueryWithReauth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions,
) => {
  const result = await baseQuery(args, api, extraOptions);

  // Handle 401 Unauthorized errors
  if (result.error && result.error.status === 401) {
    // Clear auth state
    api.dispatch(logout());
    // Clear localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    // Redirect to login page
    window.location.href = "/auth/sign-in";
  }

  return result;
};

export const baseApi = createApi({
  baseQuery: baseQueryWithReauth,
  endpoints: () => ({}),
  // src/features/companies/api/company.type.ts
  tagTypes: [
    "Auth",
    "Jobs",
    "Profile",
    "Applications",
    "Notification",
    "Users",
    "Recruiters",
    "Company",
    "Reports",
    "Chat",
    "Refunds",
  ],
});
