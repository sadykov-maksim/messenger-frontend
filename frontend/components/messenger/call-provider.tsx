// components/call-provider.tsx
"use client"

import React from "react"
import { useSelector } from "react-redux"
import { selectCurrentToken, selectCurrentUser } from "@/lib/features/auth/authSlice"
import { CallModal } from "@/components/messenger/call-modal"
import { IncomingCallBanner } from "@/components/incoming-call-banner"

type IncomingCall = {
    caller: string
    rtcMessage: RTCSessionDescriptionInit
}

type CallContextValue = {
    callUser: (username: string, chatName?: string, avatarUrl?: string) => void
    ws: React.MutableRefObject<WebSocket | null>  // ← добавить
}

const CallContext = React.createContext<CallContextValue | null>(null)

export function useCall() {
    const ctx = React.useContext(CallContext)
    if (!ctx) throw new Error("useCall must be used within CallProvider")
    return ctx
}

export function CallProvider({ children }: { children: React.ReactNode }) {
    const user = useSelector(selectCurrentUser)
    const token = useSelector(selectCurrentToken)

    const [callOpen, setCallOpen] = React.useState(false)
    const [targetUser, setTargetUser] = React.useState<string | undefined>()
    const [callChatName, setCallChatName] = React.useState<string | undefined>()
    const [callAvatarUrl, setCallAvatarUrl] = React.useState<string | undefined>()
    const [incomingCall, setIncomingCall] = React.useState<IncomingCall | null>(null)

    // Глобальный WS для приёма входящих звонков
    const wsRef = React.useRef<WebSocket | null>(null)

    React.useEffect(() => {
        if (!token || !user?.username) return
        let cancelled = false

        const connect = () => {
            if (cancelled) return
            const ws = new WebSocket(`wss://ws.telebotic.host/ws/call/`)
            wsRef.current = ws

            ws.onopen = () => {
                ws.send(JSON.stringify({ type: "login", data: { name: user.username } }))
            }

            ws.onmessage = (e) => {
                const { type, data } = JSON.parse(e.data)

                // Входящий звонок — показываем баннер
                if (type === "call_received") {
                    setIncomingCall({ caller: data.caller, rtcMessage: data.rtcMessage })
                }
            }

            ws.onclose = () => {
                if (!cancelled) setTimeout(connect, 3000)  // переподключение
            }
        }

        connect()

        return () => {
            cancelled = true
            wsRef.current?.close()
            wsRef.current = null
        }
    }, [token, user?.username])

    const callUser = React.useCallback((username: string, chatName?: string, avatarUrl?: string) => {
        setTargetUser(username)
        setCallChatName(chatName)
        setCallAvatarUrl(avatarUrl)
        setCallOpen(true)
    }, [])

    const handleAnswerIncoming = () => {
        if (!incomingCall) return
        setTargetUser(undefined)
        setCallChatName(incomingCall.caller)
        setCallOpen(true)
        // ❌ НЕ делай setIncomingCall(null) здесь
    }

    const handleDeclineIncoming = () => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({
                type: "reject_call",
                data: { caller: incomingCall?.caller }
            }))
        }
        setIncomingCall(null)
    }

    return (
        <CallContext.Provider value={{ callUser, ws: wsRef }}>
            {children}

            {/* Баннер входящего звонка — виден всегда */}
            <IncomingCallBanner
                incomingCall={callOpen ? null : incomingCall}
                onAnswer={handleAnswerIncoming}
                onDecline={handleDeclineIncoming}
            />

            {/* Модалка звонка */}
            <CallModal
                open={callOpen}
                onClose={() => {
                    setCallOpen(false)
                    setTargetUser(undefined)
                    setIncomingCall(null)
                }}
                myName={user?.username ?? ""}
                targetUser={targetUser}
                chatName={callChatName}
                avatarUrl={callAvatarUrl}
                isVideo={true}
                sharedWs={wsRef}
                incomingCall={incomingCall}   // ✅ добавили
            />
        </CallContext.Provider>
    )
}