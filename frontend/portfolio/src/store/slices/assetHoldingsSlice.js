import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchAssetHoldingsByCustomer } from '../../api/assetHoldingsApi';

export const loadAssetHoldings = createAsyncThunk('assetHoldings/loadByCustomer', async (customerId) => {
  return await fetchAssetHoldingsByCustomer(customerId);
});

const assetHoldingsSlice = createSlice({
  name: 'assetHoldings',
  initialState: {
    items: [],
    loading: false,
    error: null,
    customerId: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadAssetHoldings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadAssetHoldings.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
        state.customerId = action.meta.arg ?? null;
      })
      .addCase(loadAssetHoldings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error?.message ?? 'Failed to load holdings';
        state.items = [];
      });
  },
});

export default assetHoldingsSlice.reducer;
