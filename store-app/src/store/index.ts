import { configureStore, Middleware } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import packReducer from './packSlice';

// Custom logging middleware to log action and state changes in the console
const loggerMiddleware: Middleware = (storeApi) => (next) => (action: any) => {
  console.log('[Redux Action Dispatched]:', action);
  const result = next(action);
  console.log('[Redux Next State]:', storeApi.getState());
  return result;
};

export const store = configureStore({
  reducer: {
    auth: authReducer,
    pack: packReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(loggerMiddleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
