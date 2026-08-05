import { configureStore } from '@reduxjs/toolkit';
import userReducer       from './slices/userSlice';
import stocksReducer     from './slices/stocksSlice';
import investmentReducer from './slices/investmentSlice';
import analyticsReducer  from './slices/analyticsSlice';
import assetHoldingsReducer from './slices/assetHoldingsSlice';

export const store = configureStore({
  reducer: {
    user:        userReducer,
    stocks:      stocksReducer,
    investments: investmentReducer,
    analytics:   analyticsReducer,
    assetHoldings: assetHoldingsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }),
});

export default store;
