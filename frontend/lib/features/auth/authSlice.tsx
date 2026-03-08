import {createSlice} from '@reduxjs/toolkit'
import { authService, User } from '@/services/auth'
import type { RootState } from '@/lib/store'


type AuthState = {
    user: User | null
    access: string | null
    refresh: string | null
}

const initialState: AuthState = {
    user: null,
    access: null,
    refresh: null,
}


const slice = createSlice({
    name: 'auth',
    initialState: initialState,
    reducers: {
        tokenReceived: (state, action) => {
            state.access = action.payload.access;
        },
        loggedOut: state => {
            state.access = null;
            state.refresh = null;
            state.user = null;
        }
    },
    extraReducers: (builder) => {
        builder.addMatcher(
            authService.endpoints.authTelegram.matchFulfilled,
            (state, { payload }) => {
                state.access = payload.access
                state.refresh = payload.refresh
                state.user = payload.user
            },
        )
        builder.addMatcher(
            authService.endpoints.registerUser.matchFulfilled,
            (state, { payload }) => {
                state.access = payload.access
                state.refresh = payload.refresh
                state.user = payload.user
            },
        )

        builder.addMatcher(
            authService.endpoints.authSSO.matchFulfilled,
            (state, { payload }) => {
                state.access = payload.access
                state.refresh = payload.refresh
                state.user = payload.user
            },
        )
        builder.addMatcher(
            authService.endpoints.verifySMS.matchFulfilled,
            (state, { payload }) => {
                state.access = payload.access
                state.refresh = payload.refresh
                state.user = payload.user
            },
        )
    },
})

export default slice.reducer

export const { tokenReceived, loggedOut } = slice.actions
export const selectCurrentUser = (state: RootState) => state.auth?.user
export const selectCurrentToken = (state: RootState) => state.auth?.access