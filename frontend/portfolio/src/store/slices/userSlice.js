import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { createCustomer, fetchAllCustomers, fetchCustomerById } from '../../api/customerApi';

export const loadAllUsers = createAsyncThunk('user/loadAll', async () => {
  return await fetchAllCustomers();
});

export const loadUserById = createAsyncThunk('user/loadById', async (id) => {
  return await fetchCustomerById(id);
});

export const addUser = createAsyncThunk('user/add', async ({ customerName, riskLevel }, { dispatch, rejectWithValue }) => {
  try {
    const result = await createCustomer({ customerName, riskLevel });
    await dispatch(loadAllUsers()).unwrap();
    return result.payload;
  } catch (error) {
    return rejectWithValue(error?.response?.data?.message ?? error?.message ?? 'Unable to add user');
  }
});

const userSlice = createSlice({
  name: 'user',
  initialState: {
    allUsers:      [],
    selectedUser:  null,
    loadingUsers:  false,
    loadingProfile: false,
    error: null,
    creatingUser: false,
    createError: null,
    lastCreatedUserName: null,
  },
  reducers: {
    setSelectedUser(state, action) { state.selectedUser = action.payload; },
    clearSelectedUser(state)       { state.selectedUser = null; },
    clearUserCreateState(state) {
      state.createError = null;
      state.lastCreatedUserName = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadAllUsers.pending,   (s) => { s.loadingUsers = true; s.error = null; })
      .addCase(loadAllUsers.fulfilled, (s, a) => { s.loadingUsers = false; s.allUsers = a.payload; })
      .addCase(loadAllUsers.rejected,  (s, a) => { s.loadingUsers = false; s.error = a.error.message; })
      .addCase(loadUserById.pending,   (s) => { s.loadingProfile = true; })
      .addCase(loadUserById.fulfilled, (s, a) => { s.loadingProfile = false; s.selectedUser = a.payload; })
      .addCase(loadUserById.rejected,  (s) => { s.loadingProfile = false; })
      .addCase(addUser.pending, (s) => {
        s.creatingUser = true;
        s.createError = null;
        s.lastCreatedUserName = null;
      })
      .addCase(addUser.fulfilled, (s, a) => {
        s.creatingUser = false;
        s.lastCreatedUserName = a.payload.customerName;
      })
      .addCase(addUser.rejected, (s, a) => {
        s.creatingUser = false;
        s.createError = a.payload ?? a.error.message;
      });
  },
});

export const { setSelectedUser, clearSelectedUser, clearUserCreateState } = userSlice.actions;
export default userSlice.reducer;
