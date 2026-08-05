import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchAllCustomers, fetchCustomerById } from '../../api/customerApi';

export const loadAllUsers = createAsyncThunk('user/loadAll', async () => {
  return await fetchAllCustomers();
});

export const loadUserById = createAsyncThunk('user/loadById', async (id) => {
  return await fetchCustomerById(id);
});

const userSlice = createSlice({
  name: 'user',
  initialState: {
    allUsers:      [],
    selectedUser:  null,
    loadingUsers:  false,
    loadingProfile: false,
    error: null,
  },
  reducers: {
    setSelectedUser(state, action) { state.selectedUser = action.payload; },
    clearSelectedUser(state)       { state.selectedUser = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadAllUsers.pending,   (s) => { s.loadingUsers = true; s.error = null; })
      .addCase(loadAllUsers.fulfilled, (s, a) => { s.loadingUsers = false; s.allUsers = a.payload; })
      .addCase(loadAllUsers.rejected,  (s, a) => { s.loadingUsers = false; s.error = a.error.message; })
      .addCase(loadUserById.pending,   (s) => { s.loadingProfile = true; })
      .addCase(loadUserById.fulfilled, (s, a) => { s.loadingProfile = false; s.selectedUser = a.payload; })
      .addCase(loadUserById.rejected,  (s) => { s.loadingProfile = false; });
  },
});

export const { setSelectedUser, clearSelectedUser } = userSlice.actions;
export default userSlice.reducer;
