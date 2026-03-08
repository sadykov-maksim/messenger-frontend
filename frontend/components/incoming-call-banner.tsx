"use client"

import * as React from "react"
import { Phone, PhoneOff, Video } from "lucide-react"
import { cn } from "@/lib/utils"
import type { IncomingCall } from "@/lib/use-web-call"

interface IncomingCallBannerProps {
    incomingCall: IncomingCall | null
    onAnswer: () => void
    onDecline: () => void
    isVideo?: boolean
}

export function IncomingCallBanner({ incomingCall, onAnswer, onDecline, isVideo = true }: IncomingCallBannerProps) {
    const [visible, setVisible] = React.useState(false)

    React.useEffect(() => {
        if (incomingCall) {
            // небольшая задержка для анимации появления
            requestAnimationFrame(() => setVisible(true))
        } else {
            setVisible(false)
        }
    }, [incomingCall])

    if (!incomingCall) return null

    const initials = incomingCall.caller
        ?.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase() ?? "?"

    return (
        <div className={cn(
            "fixed top-4 left-1/2 -translate-x-1/2 z-[9999]",
            "transition-all duration-300 ease-out",
            visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
        )}>
            <div className="flex items-center gap-3 bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl px-4 py-3 min-w-[300px]">
                {/* Аватар */}
                <div className="relative shrink-0">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center text-sm font-medium text-white ring-2 ring-white/10">
                        {initials}
                    </div>
                    {/* Пульсация */}
                    <span className="absolute inset-0 rounded-full border border-white/20 animate-ping" style={{ animationDuration: "1.5s" }} />
                </div>

                {/* Текст */}
                <div className="flex flex-col min-w-0 flex-1">
                    <span className="text-xs text-white/50 leading-none mb-0.5">
                        {isVideo ? "Входящий видеозвонок" : "Входящий звонок"}
                    </span>
                    <span className="text-sm font-semibold text-white truncate">
                        {incomingCall.caller}
                    </span>
                </div>

                {/* Кнопки */}
                <div className="flex items-center gap-2 shrink-0">
                    {/* Отклонить */}
                    <button
                        onClick={onDecline}
                        className="h-9 w-9 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center transition-colors active:scale-95 shadow-[0_2px_12px_rgba(239,68,68,0.4)]"
                        title="Отклонить"
                    >
                        <PhoneOff className="h-4 w-4 text-white" />
                    </button>

                    {/* Ответить */}
                    <button
                        onClick={onAnswer}
                        className="h-9 w-9 rounded-full bg-emerald-500 hover:bg-emerald-600 flex items-center justify-center transition-colors active:scale-95 shadow-[0_2px_12px_rgba(52,211,153,0.4)]"
                        title="Ответить"
                    >
                        {isVideo ? <Video className="h-4 w-4 text-white" /> : <Phone className="h-4 w-4 text-white" />}
                    </button>
                </div>
            </div>
        </div>
    )
}
