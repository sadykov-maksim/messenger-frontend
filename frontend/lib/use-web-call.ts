"use client"

import React from "react"

export type IncomingCall = {
    caller: string
    rtcMessage: RTCSessionDescriptionInit
}

interface UseCallSocketOptions {
    myName: string
    wsUrl?: string
    onIncomingCall: (call: IncomingCall) => void
}

export function useCallSocket({ myName, wsUrl, onIncomingCall }: UseCallSocketOptions) {
    const socketRef = React.useRef<WebSocket | null>(null)
    const onIncomingCallRef = React.useRef(onIncomingCall)
    onIncomingCallRef.current = onIncomingCall

    const connect = React.useCallback(() => {
        if (socketRef.current?.readyState === WebSocket.OPEN) return socketRef.current

        const url = wsUrl ?? `wss://ws.telebotic.host/ws/call/`
        const ws = new WebSocket(url)
        socketRef.current = ws

        ws.onopen = () => {
            ws.send(JSON.stringify({ type: "login", data: { name: myName } }))
        }

        ws.onmessage = (e) => {
            const { type, data } = JSON.parse(e.data)

            if (type === "connection") console.log(data.message)

            if (type === "call_received") {
                onIncomingCallRef.current({ caller: data.caller, rtcMessage: data.rtcMessage })
            }

            if (type === "call_answered") {
                // обработай, если нужно
            }

            if (type === "ICEcandidate") {
                // обработай, если нужно
            }

            if (type === "error") {
                console.error("WS error:", data)
            }
        }

        ws.onerror = (e) => console.error("WS error", e)
        ws.onclose = () => console.log("WS closed")

        return ws
    }, [myName, wsUrl])

    const disconnect = React.useCallback(() => {
        socketRef.current?.close()
        socketRef.current = null
    }, [])

    // низкоуровневый send оставим
    const sendRaw = React.useCallback((type: string, data: unknown) => {
        socketRef.current?.send(JSON.stringify({ type, data }))
    }, [])

    // ✅ высокоуровневые методы
    const call = React.useCallback((callee: string, rtcMessage: RTCSessionDescriptionInit) => {
        sendRaw("call", { callee, rtcMessage })
    }, [sendRaw])

    const answerCall = React.useCallback((caller: string, rtcMessage: RTCSessionDescriptionInit) => {
        sendRaw("answer_call", { caller, rtcMessage })
    }, [sendRaw])

    const sendIceCandidate = React.useCallback((user: string, rtcMessage: any) => {
        sendRaw("ICEcandidate", { user, rtcMessage })
    }, [sendRaw])

    return { connect, disconnect, sendRaw, call, answerCall, sendIceCandidate, socketRef }
}