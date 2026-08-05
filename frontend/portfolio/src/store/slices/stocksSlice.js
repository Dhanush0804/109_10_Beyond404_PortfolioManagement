import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchAllStocks } from '../../api/stocksApi';

export const loadAllStocks = createAsyncThunk('stocks/loadAll', async () => {
  return await fetchAllStocks();
});

const stocksSlice = createSlice({
  name: 'stocks',
  initialState: {
    items:         [],
    selectedStock: null,
    loading:       false,
    error:         null,
  },
  reducers: {
    setSelectedStock(state, action) { state.selectedStock = action.payload; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadAllStocks.pending,   (s) => { s.loading = true; s.error = null; })
      .addCase(loadAllStocks.fulfilled, (s, a) => { s.loading = false; s.items = a.payload; s.selectedStock = a.payload[0] ?? null; })
      .addCase(loadAllStocks.rejected,  (s, a) => { s.loading = false; s.error = a.error.message; });
  },
});

export const { setSelectedStock } = stocksSlice.actions;
export default stocksSlice.reducer;
