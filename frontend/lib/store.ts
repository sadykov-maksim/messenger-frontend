import { configureStore, combineReducers } from "@reduxjs/toolkit"
import {
    persistReducer,
    FLUSH,
    REHYDRATE,
    PAUSE,
    PERSIST,
    PURGE,
    REGISTER,
} from "redux-persist"
import storage from "redux-persist/lib/storage"

import { authService } from "@/services/auth"
import authReducer from "@/lib/features/auth/authSlice"
import companyWizardReducer from "@/lib/features/company_wizard/companyWizardSlice"
import {companiesWizardService} from "@/services/companies_wizard";
import {messengerApi} from "@/services/messenger";
import {cryptoApi} from "@/services/crypto";

const rootReducer = combineReducers({
    auth: authReducer,
    companyWizard: companyWizardReducer,
    [companiesWizardService.reducerPath]: companiesWizardService.reducer,
    [authService.reducerPath]: authService.reducer,
    [messengerApi.reducerPath]: messengerApi.reducer,
    [cryptoApi.reducerPath]: cryptoApi.reducer,
})

const persistConfig = {
    key: "root",
    version: 1,
    storage,
    whitelist: ['auth', 'companyWizard'],
    blacklist: [],
}

const persistedReducer = persistReducer(persistConfig, rootReducer)

export const makeStore = () =>
    configureStore({
        reducer: persistedReducer,
        middleware: (getDefaultMiddleware) =>
            getDefaultMiddleware({
                serializableCheck: {
                    ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
                },
            })
                .concat(authService.middleware)
                .concat(companiesWizardService.middleware)
                .concat(messengerApi.middleware)
                .concat(cryptoApi.middleware),
    })

export type AppStore = ReturnType<typeof makeStore>
export type RootState = ReturnType<AppStore["getState"]>
export type AppDispatch = AppStore["dispatch"]