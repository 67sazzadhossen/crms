import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
type User = { id: string; name: string; email: string; role: string } | null;
const authSlice = createSlice({
  name: 'auth',
  initialState: { user: null as User, token: null as string | null },
  reducers: {
    setCredentials: (state, action: PayloadAction<{ user: NonNullable<User>; token: string }>) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
    },
  },
});
export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
