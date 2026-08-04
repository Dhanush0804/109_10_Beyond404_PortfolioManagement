import { configureStore } from '@reduxjs/toolkit';
import userReducer       from './slices/userSlice';
import stocksReducer     from './slices/stocksSlice';
import investmentReducer from './slices/investmentSlice';
import analyticsReducer  from './slices/analyticsSlice';

export const store = configureStore({
  reducer: {
    user:        userReducer,
    stocks:      stocksReducer,
    investments: investmentReducer,
    analytics:   analyticsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }),
});

export default store;
