import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { AuthState, AuthUser } from './auth.type';

const initialState: AuthState = {
  token: null,
  user: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    /**
     * Set credentials (token and user) in Redux state and localStorage
     * User information should be decoded from JWT token
     * @param token - JWT token from backend
     * @param user - Decoded user info from token (required)
     */
    setCredentials: (
      state,
      action: PayloadAction<{ token: string; user: AuthUser }>
    ) => {
      state.token = action.payload.token;
      state.user = action.payload.user;

      // Persist to localStorage
      localStorage.setItem('token', action.payload.token);
      localStorage.setItem('user', JSON.stringify(action.payload.user));

      console.log('[authSlice] Credentials set:', {
        hasToken: !!action.payload.token,
        user: {
          userId: action.payload.user.userId,
          email: action.payload.user.email,
          role: action.payload.user.role,
        },
      });
    },

    /**
     * Logout user - clear token and user from state and localStorage
     */
    logout: (state) => {
      state.token = null;
      state.user = null;

      // Clear localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      console.log('[authSlice] User logged out');
    },

 
    updateUser: (state, action: PayloadAction<Partial<AuthUser>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        localStorage.setItem('user', JSON.stringify(state.user));
        console.log('[authSlice] User updated:', {
          email: state.user.email,
          role: state.user.role,
        });
      }
    },

    /**
     * Initialize auth from localStorage and validate with server
     * Used on app load to restore session
     */
    initializeAuthFromStorage: (state) => {
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');
      
      if (token && userStr) {
        try {
          const user = JSON.parse(userStr);
          state.token = token;
          state.user = user;
          console.log('[authSlice] Auth initialized from localStorage:', {
            userId: user.userId,
            role: user.role,
          });
        } catch (error) {
          console.error('[authSlice] Failed to parse stored user:', error);
          // Clear invalid storage
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
    },
  },
});

export const { setCredentials, logout, updateUser, initializeAuthFromStorage } = authSlice.actions;
export default authSlice.reducer;
