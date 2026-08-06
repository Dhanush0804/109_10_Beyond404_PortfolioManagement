import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { runAlgoOnce } from '../../api/algoApi';

export const runAlgoAnalysis = createAsyncThunk(
  'algo/runOnce',
  async ({ customerId, tickers, strategyName, dryRun = true }, { rejectWithValue }) => {
    try {
      return await runAlgoOnce({ customerId, tickers, strategyName, dryRun });
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message ?? error?.response?.data ?? error?.message ?? 'Algo analysis failed');
    }
  }
);

const algoSlice = createSlice({
  name: 'algo',
  initialState: {
    runLoading: false,
    runError: null,
    lastRun: null,
  },
  reducers: {
    clearAlgoState(state) {
      state.runError = null;
      state.lastRun = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(runAlgoAnalysis.pending, (state) => {
        state.runLoading = true;
        state.runError = null;
      })
      .addCase(runAlgoAnalysis.fulfilled, (state, action) => {
        state.runLoading = false;
        state.lastRun = action.payload;
      })
      .addCase(runAlgoAnalysis.rejected, (state, action) => {
        state.runLoading = false;
        state.runError = action.payload ?? action.error.message;
      });
  },
});

export const { clearAlgoState } = algoSlice.actions;
export default algoSlice.reducer;
