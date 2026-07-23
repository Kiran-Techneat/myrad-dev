import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import {
  userRegister,
  VerifyRegisterOTP,
  userLogin,
  userLoginVerification,
  userphonelogin,
  userGoogleLogin,
  userGoogleLoginVerify,
  userFacebookLogin,
  userFacebookLoginVerify,
} from "./action";

interface AuthSliceState {
  // sessionId issued by a first-step call (register / signin / social) and
  // consumed by the matching verify / complete call.
  sessionId: string | null;
  // The identifier (email or phone) used to start a login, needed for 2FA verify.
  pendingUsername: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthSliceState = {
  sessionId: null,
  pendingUsername: null,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: "authSlice",
  initialState,
  reducers: {
    setPendingUsername(state, action: PayloadAction<string | null>) {
      state.pendingUsername = action.payload;
    },
    setSessionId(state, action: PayloadAction<string | null>) {
      state.sessionId = action.payload;
    },
    resetAuthFlow(state) {
      state.sessionId = null;
      state.pendingUsername = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // First-step calls that hand back a sessionId to continue with.
      .addCase(userRegister.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.sessionId = payload?.sessionId ?? null;
      })
      .addCase(userLogin.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.sessionId = payload?.sessionId ?? null;
      })
      .addCase(userphonelogin.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.sessionId = payload?.sessionId ?? null;
      })
      .addCase(userGoogleLogin.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.sessionId = payload?.sessionId ?? null;
      })
      .addCase(userFacebookLogin.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.sessionId = payload?.sessionId ?? null;
      })
      // Verify / complete calls end the flow.
      .addMatcher(
        (action) =>
          [
            VerifyRegisterOTP.fulfilled.type,
            userLoginVerification.fulfilled.type,
            userGoogleLoginVerify.fulfilled.type,
            userFacebookLoginVerify.fulfilled.type,
          ].includes(action.type),
        (state) => {
          state.loading = false;
          state.sessionId = null;
          state.pendingUsername = null;
          state.error = null;
        },
      )
      .addMatcher(
        (action) => action.type.startsWith("/authSlice/") && action.type.endsWith("/pending"),
        (state) => {
          state.loading = true;
          state.error = null;
        },
      )
      .addMatcher(
        (action) => action.type.startsWith("/authSlice/") && action.type.endsWith("/rejected"),
        (state, action: any) => {
          state.loading = false;
          state.error = action.payload?.headers?.message || action.error?.message || null;
        },
      );
  },
});

export const { setPendingUsername, setSessionId, resetAuthFlow } = authSlice.actions;
export default authSlice.reducer;
