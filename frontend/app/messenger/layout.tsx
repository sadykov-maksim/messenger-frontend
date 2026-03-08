"use client"
import "@/app/globals.css"

import { WsProvider } from "@/components/ws-provider"
import * as React from "react"

import {MessengerLayoutInner} from "@/components/messenger/MessengerLayoutInner";
import { CallProvider } from "@/components/messenger/call-provider";

export default function MessengerLayout({ children }: { children: React.ReactNode }) {
    return (
        <WsProvider>
            <CallProvider>              {/* ← переместить сюда, выше MessengerLayoutInner */}
                <MessengerLayoutInner>
                    {children}
                </MessengerLayoutInner>
            </CallProvider>
        </WsProvider>
    )
}
