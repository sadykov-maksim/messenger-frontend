"use client"

import { useEffect, useRef } from "react"

interface TelegramUser {
    id: number
    first_name: string
    last_name?: string
    username?: string
    photo_url?: string
    auth_date: number
    hash: string
}

interface Props {
    botName: string
    onAuth: (user: TelegramUser) => void
}

export function TelegramLoginButton({ botName, onAuth }: Props) {
    const ref = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (!ref.current) return

        (window as any).onTelegramAuth = (user: TelegramUser) => {
            onAuth(user)
        }

        const script = document.createElement("script")
        script.src = "https://telegram.org/js/telegram-widget.js?22"
        script.setAttribute("data-telegram-login", botName)
        script.setAttribute("data-size", "large")
        script.setAttribute("data-onauth", "onTelegramAuth(user)")
        script.setAttribute("data-request-access", "write")
        script.async = true

        ref.current.appendChild(script)

        return () => {
            delete (window as any).onTelegramAuth
        }
    }, [botName, onAuth])

    return <div ref={ref} />
}