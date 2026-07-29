import { createSlice } from "@reduxjs/toolkit";
import { getUserProfile } from "./action";
import type { IUserProfileResponse } from "./types/response";

interface IUserState {
    userProfile: IUserProfileResponse | null;
    loading: boolean;
}

const initialState: IUserState = {
    userProfile: null,
    loading: false,
};

const userSlice = createSlice({
    name: "userSlice",
    initialState,
    reducers: {
        clearUserProfile: (state) => {
            state.userProfile = null;
        },
    },
    extraReducers: (builder) => {
        // getUserProfile
        builder
            .addCase(getUserProfile.pending, (state) => {
                state.loading = true;
            })
            .addCase(getUserProfile.fulfilled, (state, action) => {
                const payload = action.payload as any;
                state.userProfile = payload?.recordInfo ?? payload;
                state.loading = false;
            })
            .addCase(getUserProfile.rejected, (state) => {
                state.loading = false;
            });
    },
});

export const { clearUserProfile } = userSlice.actions;
export default userSlice.reducer;
