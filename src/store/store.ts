import { configureStore } from "@reduxjs/toolkit";
import authReducer from "@/redux/auth/authSlice";
import userReducer from "@/redux/user/slice";
import myfilesReducer from "@/redux/myfiles/slice";
import requestReducer from "@/redux/request/slice";
import billingReducer from "@/redux/billing/slice";
import scanCenterReducer from "@/redux/scancenter/slice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    user: userReducer,
    myfiles: myfilesReducer,
    request: requestReducer,
    billing: billingReducer,
    scanCenter: scanCenterReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
