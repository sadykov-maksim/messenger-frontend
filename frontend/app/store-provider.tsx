"use client"

import { useRef } from 'react'
import { Provider } from 'react-redux'
import {AppStore, makeStore} from "@/lib/store";
import { PersistGate } from 'redux-persist/integration/react';
import { persistStore } from 'redux-persist';

export default function StoreProvider({children,}: { children: React.ReactNode }) {
    const storeRef = useRef<AppStore | null>(null);
    const persistorRef = useRef<ReturnType<typeof persistStore> | null>(null);

    if (!storeRef.current) {
        // Create the store instance the first time this renders
        if (!storeRef.current) {
            storeRef.current = makeStore();
            persistorRef.current = persistStore(storeRef.current);
        }
    }

    return <Provider store={storeRef.current}>
        <PersistGate loading={null} persistor={persistorRef.current!}>
            {children}
        </PersistGate>
    </Provider>
}
