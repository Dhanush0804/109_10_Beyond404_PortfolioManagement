import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchInvestmentsByCustomer, placeDummyBuyOrder as placeDummyBuyOrderApi, placeDummySellOrder as placeDummySellOrderApi } from '../../api/investmentApi';

export const loadInvestments = createAsyncThunk('investments/load', async (customerId) => {
  return await fetchInvestmentsByCustomer(customerId);
});

export const placeDummyBuyOrder = createAsyncThunk('investments/dummyBuy', async (payload) => {
  return await placeDummyBuyOrderApi(payload);
});

export const placeDummySellOrder = createAsyncThunk('investments/dummySell', async (payload) => {
  return await placeDummySellOrderApi(payload);
});

const investmentSlice = createSlice({
  name: 'investments',
  initialState: { items: [], loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadInvestments.pending,   (s) => { s.loading = true; s.error = null; })
      .addCase(loadInvestments.fulfilled, (s, a) => { s.loading = false; s.items = a.payload; })
      .addCase(loadInvestments.rejected,  (s, a) => { s.loading = false; s.error = a.error.message; });
  },
});

export default investmentSlice.reducer;
