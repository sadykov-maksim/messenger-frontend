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
    first_name?: string;
    last_name?: string;
    photo_url?: string;
    role?: string
    completed?: boolean;
}

export type CreateCompanyPayload = {
    name: string;
    website?: string;
    task_short?: string;
    industry_id?: number | null;
    team_size?: string;
    analytics_wishes?: string;
};

export type CompanyResponse = { id: number };

export const companiesWizardService = createApi({
    reducerPath: 'companiesWizardApi',
    baseQuery: staggeredBaseQueryWithBailOut,
    tagTypes: ['Companies',],
    endpoints: (build) => ({
        createCompany: build.mutation<CompanyResponse, CreateCompanyPayload>({
            query: (body) => ({
                url: "/companies/",
                method: "POST",
                body,
            }),
            invalidatesTags: ["Companies"],
        }),
        getMyCompanies: build.query<CompanyResponse[], void>({
            query: () => ({
                url: "/companies/",
                method: "GET",
            }),
            providesTags: ["Companies"],
        }),
    }),

})

export const { useCreateCompanyMutation, useGetMyCompaniesQuery } = companiesWizardService
