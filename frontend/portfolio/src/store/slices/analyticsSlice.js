import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchPortfolioSummary, fetchStockWisePnL, fetchChartData } from '../../api/analyticsApi';

export const loadPortfolioSummary = createAsyncThunk('analytics/summary', async (customerId) => {
  return await fetchPortfolioSummary(customerId);
});

export const loadStockWisePnL = createAsyncThunk('analytics/stockWise', async (customerId) => {
  return await fetchStockWisePnL(customerId);
});

export const loadChartData = createAsyncThunk('analytics/chart', async ({ mode, stockId, ticker, range, customerId }) => {
  return await fetchChartData({ mode, stockId, ticker, range, customerId });
});

const analyticsSlice = createSlice({
  name: 'analytics',
  initialState: {
    summary:          null,
    stockWise:        [],
    chartData:        [],
    chartMode:        'portfolio',  // 'portfolio' | 'stock'
    chartRange:       'YEARLY',
    loadingSummary:   false,
    loadingStockWise: false,
    loadingChart:     false,
    error:            null,
  },
  reducers: {
    setChartMode(state, action)  { state.chartMode  = action.payload; },
    setChartRange(state, action) { state.chartRange = action.payload; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadPortfolioSummary.pending,   (s) => { s.loadingSummary = true; })
      .addCase(loadPortfolioSummary.fulfilled, (s, a) => { s.loadingSummary = false; s.summary = a.payload; })
      .addCase(loadPortfolioSummary.rejected,  (s) => { s.loadingSummary = false; })

      .addCase(loadStockWisePnL.pending,   (s) => { s.loadingStockWise = true; })
      .addCase(loadStockWisePnL.fulfilled, (s, a) => { s.loadingStockWise = false; s.stockWise = a.payload; })
      .addCase(loadStockWisePnL.rejected,  (s) => { s.loadingStockWise = false; })

      .addCase(loadChartData.pending,   (s) => { s.loadingChart = true; })
      .addCase(loadChartData.fulfilled, (s, a) => { s.loadingChart = false; s.chartData = a.payload; })
      .addCase(loadChartData.rejected,  (s) => { s.loadingChart = false; });
  },
});

export const { setChartMode, setChartRange } = analyticsSlice.actions;
export default analyticsSlice.reducer;
