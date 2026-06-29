import { baseApi } from '@/redux/baseApi';
import { configureStore } from '@reduxjs/toolkit';
import { enableMapSet } from 'immer';
import authReducer from "@/features/auth/api/auth.slice";
import jobReducer from "@/features/job-seeker/api/job.slice";
import { addressApi } from './features/address/address.api.ts';

// Enable Map/Set support in Immer (required for Redux Toolkit with Set/Map)
enableMapSet();

export const store = configureStore({
  reducer: {
    [baseApi.reducerPath]: baseApi.reducer,
    [addressApi.reducerPath]: addressApi.reducer,
    auth: authReducer,
    job: jobReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types for Set serialization
        ignoredActions: ['job/toggleSaveJob'],
        // Ignore these field paths in all actions
        ignoredActionPaths: [
          'payload.savedJobs',
          'meta.baseQueryMeta.request',
          'meta.baseQueryMeta.response',
          // Ignore FormData in upload mutations
          'meta.arg.originalArgs',
        ],
        // Ignore these paths in the state
        ignoredPaths: ['job.savedJobs'],
      },
    }).concat(baseApi.middleware, addressApi.middleware),
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
