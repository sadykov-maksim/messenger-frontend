import { createApi } from '@reduxjs/toolkit/query/react'
import { fetchBaseQuery, retry } from '@reduxjs/toolkit/query'
import type {
    BaseQueryFn,
    FetchArgs,
    FetchBaseQueryError,
} from '@reduxjs/toolkit/query'
import {tokenReceived, loggedOut} from '@/lib/features/auth/authSlice'
import { RootState } from '@/lib/store'
import { Mutex } from 'async-mutex'

const mutex = new Mutex()

function getCookie(name: string): string | null {
    const cookieValue = document.cookie
        .split('; ')
        .find(row => row.startsWith(name + '='));
    return cookieValue ? decodeURIComponent(cookieValue.split('=')[1]) : null;
}


const baseQuery = fetchBaseQuery({
    baseUrl: 'https://api.telebotic.host/',
    prepareHeaders: (headers, { getState }) => {
        const csrfToken = getCookie('csrftoken');
        const token = (getState() as RootState).auth.access
        if (token) {
            headers.set('authorization', `Bearer ${token}`)
        }
        if (csrfToken) {
            headers.set('X-CSRFToken', csrfToken);
        }

        return headers
    },
    credentials: "include",
})

const baseQueryWithReAuth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (args, api, extraOptions) => {
    await mutex.waitForUnlock()
    let result = await baseQuery(args, api, extraOptions)
    if (result.error && result.error.status === 401) {
        if (!mutex.isLocked()) {
            const release = await mutex.acquire()
            try {
                const refreshResult = await baseQuery({url: '/token/refresh/', method: "POST"}, api, extraOptions)
                if (refreshResult.data) {
                    api.dispatch(tokenReceived(refreshResult.data))
                    result = await baseQuery(args, api, extraOptions)
                } else {
                    api.dispatch(loggedOut())
                }
            } finally {
                release()
            }
        } else {
            await mutex.waitForUnlock()
            result = await baseQuery(args, api, extraOptions)
        }
    }
    return result
}

export const staggeredBaseQueryWithBailOut = retry(
    async (args: string | FetchArgs, api, extraOptions) => {
        const result = await baseQueryWithReAuth(args, api, extraOptions)

        if (result.error?.status === 401) {
            retry.fail(result.error)
        }
        return result
    },
    {maxRetries: 0,}
)


export interface User {
    id: number;
    telegram_id: number;
    username?: string;
    display_name?: string;
    balance: number;
    avatar: string;
    first_name?: string;
    last_name?: string;
    photo_url?: string;
    role?: string
    completed?: boolean;
}

export interface UserResponse {
    user: User;
    access: string,
    refresh: string,
}

interface SMSRequestArgs {
    phone: string;
}

interface SMSVerifyArgs {
    phone: string
    code: string;
}

interface SSORequestArgs {
    email: string;
    password: string;
}

interface RegisterUserRequest {
    first_name: string;
    last_name: string;
    username: string;
    email: string;
    phone_number: string;
    password: string;
    re_password: string;
    consent_accepted: boolean;
    region: string;
    language: string;
    timezone: string;
}


export const authService = createApi({
    reducerPath: 'authService',
    baseQuery: staggeredBaseQueryWithBailOut,
    tagTypes: ['user',],
    endpoints: (build) => ({
        // Авторизация через Telegram
        authTelegram: build.mutation<UserResponse, any>({
            query: (initDataRaw) => ({
                url: '/auth/telegram/',
                method: 'POST',
                headers: {
                    Authorization: `tma ${initDataRaw}`,
                },
            }),
        }),
        // Регистрация пользователей
        registerUser: build.mutation<void, RegisterUserRequest>({
            query: (data) => ({
                url: '/auth/users/',
                method: 'POST',
                body: data,
            }),
        }),
        // Авторизация через SSO
        authSSO: build.mutation<UserResponse, SSORequestArgs>({
            query: ({email, password}) => ({
                url: '/token/',
                method: 'POST',
                body: { email, password },
            }),
        }),
        // Запрос на отправку SMS с кодом
        requestSMS: build.mutation<UserResponse, SMSRequestArgs>({
            query: ({ phone }) => ({
                url: '/auth/sms/request/',
                method: 'POST',
                body: { phone },
            }),
        }),
        // Верификация SMS кода
        verifySMS: build.mutation<UserResponse, SMSVerifyArgs>({
            query: ({ phone, code }) => ({
                url: '/auth/sms/verify/',
                method: 'POST',
                body: { phone, code },
            }),
        }),
        // Получение информации о текущем пользователе
        getMe: build.query<User, void>({
            query: () => ({
                url: '/auth/users/me/',
                method: 'GET',
            }),
        }),
    }),
})

export const { useAuthTelegramMutation, useGetMeQuery, useRequestSMSMutation, useVerifySMSMutation, useAuthSSOMutation, useRegisterUserMutation} = authService
