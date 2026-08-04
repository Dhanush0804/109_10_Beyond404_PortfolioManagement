import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchInvestmentsByCustomer } from '../../api/investmentApi';

export const loadInvestments = createAsyncThunk('investments/load', async (customerId) => {
  return await fetchInvestmentsByCustomer(customerId);
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
