import { configureStore } from '@reduxjs/toolkit';
import userReducer       from './slices/userSlice';
import stocksReducer     from './slices/stocksSlice';
import investmentReducer from './slices/investmentSlice';
import analyticsReducer  from './slices/analyticsSlice';
import assetHoldingsReducer from './slices/assetHoldingsSlice';
import algoReducer from './slices/algoSlice';

export const store = configureStore({
  reducer: {
    user:        userReducer,
    stocks:      stocksReducer,
    investments: investmentReducer,
    analytics:   analyticsReducer,
    assetHoldings: assetHoldingsReducer,
    algo: algoReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }),
});

export default store;
