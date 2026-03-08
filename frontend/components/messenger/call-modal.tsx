"use client"

import React from "react"
import {
    Mic, MicOff, Video, VideoOff, Volume2, VolumeX,
    ScreenShare, PhoneOff, MessageSquare, Phone
} from "lucide-react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

type CallState = "idle" | "calling" | "receiving" | "active" | "ended"

interface CallModalProps {
    open: boolean
    onClose: () => void
    chatName?: string
    avatarUrl?: string
    isVideo?: boolean
    myName: string
    targetUser?: string
    wsUrl?: string
    sharedWs?: React.MutableRefObject<WebSocket | null>
    incomingCall?: { caller: string; rtcMessage: RTCSessionDescriptionInit } | null
}

const PC_CONFIG: RTCConfiguration = {
    iceServers: [
        { urls: "stun:stun.jap.bloggernepal.com:5349" },
        {
            urls: "turn:turn.jap.bloggernepal.com:5349",
            username: "guest",
            credential: "somepassword",
        },
    ],
}

export function CallModal({
                              open,
                              onClose,
                              chatName,
                              avatarUrl,
                              isVideo = true,
                              myName,
                              targetUser,
                              wsUrl,
                              sharedWs,
                              incomingCall
                          }: CallModalProps) {
    const [callState, setCallState] = React.useState<CallState>("idle")
    const [muted, setMuted] = React.useState(false)
    const [videoOff, setVideoOff] = React.useState(false)
    const [speakerOff, setSpeakerOff] = React.useState(false)
    const [duration, setDuration] = React.useState(0)
    const [callerName, setCallerName] = React.useState<string | undefined>(chatName)
    const [callerAvatar, setCallerAvatar] = React.useState<string | undefined>(avatarUrl)
    const [errorMsg, setErrorMsg] = React.useState<string | null>(null)
    const [remoteStream, setRemoteStream] = React.useState<MediaStream | null>(null)

    const socketRef = React.useRef<WebSocket | null>(null)
    const pcRef = React.useRef<RTCPeerConnection | null>(null)
    const localStreamRef = React.useRef<MediaStream | null>(null)
    const remoteRTCMessageRef = React.useRef<RTCSessionDescriptionInit | null>(null)
    const iceCandidateQueueRef = React.useRef<RTCIceCandidate[]>([])
    const timerRef = React.useRef<ReturnType<typeof setInterval> | null>(null)
    const callTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)
    const localVideoRef = React.useRef<HTMLVideoElement>(null)
    const remoteVideoRef = React.useRef<HTMLVideoElement>(null)
    const remoteAudioRef = React.useRef<HTMLAudioElement>(null)
    const otherUserRef = React.useRef<string | undefined>(targetUser)
    const isCallerRef = React.useRef(false)

    React.useEffect(() => {
        if (!remoteStream) return
        if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = remoteStream
            remoteVideoRef.current.play().catch(console.error)
        }
        if (remoteAudioRef.current) {
            remoteAudioRef.current.srcObject = remoteStream
            remoteAudioRef.current.play().catch(console.error)
        }
    }, [remoteStream])

    const formatDuration = (s: number) => {
        const m = Math.floor(s / 60).toString().padStart(2, "0")
        const sec = (s % 60).toString().padStart(2, "0")
        return `${m}:${sec}`
    }

    const startTimer = React.useCallback(() => {
        if (timerRef.current) return
        timerRef.current = setInterval(() => setDuration((d) => d + 1), 1000)
    }, [])

    const stopTimer = React.useCallback(() => {
        if (timerRef.current) {
            clearInterval(timerRef.current)
            timerRef.current = null
        }
    }, [])

    const cleanup = React.useCallback(() => {
        stopTimer()
        if (callTimeoutRef.current) {
            clearTimeout(callTimeoutRef.current)
            callTimeoutRef.current = null
        }
        localStreamRef.current?.getTracks().forEach((t) => t.stop())
        localStreamRef.current = null
        pcRef.current?.close()
        pcRef.current = null
        // Закрываем WS только если это НАШ сокет (не sharedWs)
        if (!sharedWs && socketRef.current?.readyState === WebSocket.OPEN) {
            socketRef.current.close()
        }
        socketRef.current = null
        iceCandidateQueueRef.current = []
        setRemoteStream(null)
        if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null
        if (remoteAudioRef.current) remoteAudioRef.current.srcObject = null
        if (localVideoRef.current) localVideoRef.current.srcObject = null
    }, [stopTimer, sharedWs])

    const sendWS = React.useCallback((type: string, data: unknown) => {
        const ws = sharedWs?.current ?? socketRef.current
        if (ws?.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type, data }))
        }
    }, [sharedWs])

    const createPeerConnection = React.useCallback(() => {
        const pc = new RTCPeerConnection(PC_CONFIG)
        pcRef.current = pc

        pc.onicecandidate = (event) => {
            if (event.candidate) {
                sendWS("ICEcandidate", {
                    user: otherUserRef.current,
                    rtcMessage: {
                        label: event.candidate.sdpMLineIndex,
                        id: event.candidate.sdpMid,
                        candidate: event.candidate.candidate,
                    },
                })
            }
        }

        pc.ontrack = (event) => {
            console.log("ontrack:", event.track.kind, "streams:", event.streams.length)
            const stream = event.streams[0]
            if (stream) setRemoteStream(stream)
        }

        pc.onconnectionstatechange = () => {
            console.log("PC state:", pc.connectionState)
            if (pc.connectionState === "failed" || pc.connectionState === "disconnected") {
                setErrorMsg("Соединение потеряно")
            }
        }

        pc.oniceconnectionstatechange = () => {
            console.log("ICE:", pc.iceConnectionState)
        }

        iceCandidateQueueRef.current.forEach((c) => pc.addIceCandidate(c).catch(console.error))
        iceCandidateQueueRef.current = []

        return pc
    }, [sendWS])

    const beReady = React.useCallback(async () => {
        const stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: isVideo,
        })
        localStreamRef.current = stream
        if (localVideoRef.current) localVideoRef.current.srcObject = stream

        const pc = createPeerConnection()
        stream.getTracks().forEach((t) => {
            console.log("Adding local track:", t.kind)
            pc.addTrack(t, stream)
        })
        return pc
    }, [isVideo, createPeerConnection])

    const processCall = React.useCallback(async (userName: string) => {
        try {
            setErrorMsg(null)
            const pc = await beReady()
            const offer = await pc.createOffer()
            await pc.setLocalDescription(offer)
            sendWS("call", { callee: userName, rtcMessage: offer })
            setCallState("calling")
        } catch (e) {
            console.error("processCall error:", e)
            setErrorMsg("Не удалось получить доступ к камере/микрофону")
        }
    }, [beReady, sendWS])

    const processAccept = React.useCallback(async () => {
        try {
            setErrorMsg(null)
            const pc = await beReady()
            await pc.setRemoteDescription(
                new RTCSessionDescription(remoteRTCMessageRef.current!)
            )
            const answer = await pc.createAnswer()
            await pc.setLocalDescription(answer)
            sendWS("answer_call", {
                caller: otherUserRef.current,
                rtcMessage: answer,
            })
            setCallState("active")
            startTimer()
        } catch (e) {
            console.error("processAccept error:", e)
            setErrorMsg("Не удалось получить доступ к камере/микрофону")
        }
    }, [beReady, sendWS, startTimer])

    // Обработчик входящих WS-сообщений (используется и для sharedWs и для собственного)
    const handleWsMessage = React.useCallback((e: MessageEvent) => {
        const { type, data } = JSON.parse(e.data)
        console.log("WS ←", type, data)

        switch (type) {
            case "connection":
                console.log(data.message)
                break

            case "login":
                if (data.success && isCallerRef.current && otherUserRef.current) {
                    processCall(otherUserRef.current)
                    callTimeoutRef.current = setTimeout(() => {
                        setErrorMsg("Пользователь не отвечает")
                        setCallState("ended")
                        cleanup()
                        setTimeout(onClose, 2000)
                    }, 30_000)
                }
                break

            case "error":
                console.error("Server error:", data.code, data.message)
                setErrorMsg(data.message)
                if (data.code === "user_offline") {
                    setCallState("ended")
                    cleanup()
                    setTimeout(onClose, 2000)
                }
                break

            case "call_received":
                otherUserRef.current = data.caller
                remoteRTCMessageRef.current = data.rtcMessage
                setCallerName(data.caller)
                setCallState("receiving")
                break

            case "call_answered":
                if (callTimeoutRef.current) {
                    clearTimeout(callTimeoutRef.current)
                    callTimeoutRef.current = null
                }
                if (pcRef.current) {
                    pcRef.current
                        .setRemoteDescription(new RTCSessionDescription(data.rtcMessage))
                        .then(() => {
                            console.log("Remote desc set (caller)")
                            setCallState("active")
                            startTimer()
                        })
                        .catch(console.error)
                }
                break

            case "call_rejected":
                setErrorMsg("Звонок отклонён")
                setCallState("ended")
                cleanup()
                setTimeout(onClose, 1500)
                break

            case "call_ended":
                setCallState("ended")
                stopTimer()
                cleanup()
                setTimeout(onClose, 1500)
                break

            case "ICEcandidate": {
                const { label, candidate } = data.rtcMessage
                const ice = new RTCIceCandidate({ sdpMLineIndex: label, candidate })
                if (pcRef.current) {
                    pcRef.current.addIceCandidate(ice).catch(console.error)
                } else {
                    iceCandidateQueueRef.current.push(ice)
                }
                break
            }

            default:
                console.warn("Unknown WS type:", type)
        }
    }, [processCall, cleanup, onClose, startTimer, stopTimer])

    const connectSocket = React.useCallback(() => {
        const url = wsUrl ?? `wss://ws.telebotic.host/ws/call/`
        const ws = new WebSocket(url)
        socketRef.current = ws

        ws.onopen = () => {
            console.log("WS opened, login as:", myName)
            ws.send(JSON.stringify({ type: "login", data: { name: myName } }))
        }

        ws.onmessage = handleWsMessage
        ws.onclose = (e) => console.log("WS closed", e.code, e.reason)
        ws.onerror = (e) => {
            console.error("WS error", e)
            setErrorMsg("Ошибка подключения к серверу")
        }
    }, [myName, wsUrl, handleWsMessage])

    React.useEffect(() => {
        if (!open) return

        // --- reset UI/refs ---
        setDuration(0)
        setMuted(false)
        setVideoOff(false)
        setErrorMsg(null)
        setRemoteStream(null)

        // очищаем видео/аудио (по желанию)
        if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null
        if (remoteAudioRef.current) remoteAudioRef.current.srcObject = null
        if (localVideoRef.current) localVideoRef.current.srcObject = null

        // кто мы: caller или нет
        isCallerRef.current = !!targetUser

        // выставим отображаемые данные по умолчанию из пропсов
        setCallerAvatar(avatarUrl)
        setCallerName(chatName)

        // --- IMPORTANT: определить входящий / исходящий ---
        const isIncoming = !targetUser && !!incomingCall?.rtcMessage && !!incomingCall?.caller

        if (isIncoming) {
            // ✅ Входящий: восстановить offer и перейти в receiving
            otherUserRef.current = incomingCall!.caller
            remoteRTCMessageRef.current = incomingCall!.rtcMessage
            setCallerName(incomingCall!.caller)        // перетираем chatName — правильно
            setCallState("receiving")
        } else {
            // ✅ Исходящий (или просто открыли без данных): сохраняем targetUser
            otherUserRef.current = targetUser
            setCallState(isCallerRef.current ? "calling" : "idle") // "idle" только если это не входящий и не исходящий
        }

        let openTimer: ReturnType<typeof setTimeout> | null = null

        const startCallFlow = () => {
            const ws = sharedWs?.current ?? socketRef.current
            if (!ws) return

            // Исходящий: стартуем процесс звонка
            if (isCallerRef.current && otherUserRef.current) {
                setTimeout(() => {
                    processCall(otherUserRef.current!)
                }, 2000)

                callTimeoutRef.current = setTimeout(() => {
                    setErrorMsg("Пользователь не отвечает")
                    setCallState("ended")
                    cleanup()
                    setTimeout(onClose, 2000)
                }, 32_000)
            }

            // Входящий: ничего не делаем, ждём нажатия "Ответить"
        }

        const ws = sharedWs?.current

        if (ws) {
            socketRef.current = ws
            ws.addEventListener("message", handleWsMessage)

            if (ws.readyState === WebSocket.OPEN) {
                startCallFlow()
            } else if (ws.readyState === WebSocket.CONNECTING) {
                setErrorMsg("Подключаемся к серверу звонков…")

                const onOpen = () => {
                    setErrorMsg(null)
                    startCallFlow()
                }

                ws.addEventListener("open", onOpen, { once: true })

                openTimer = setTimeout(() => {
                    if (ws.readyState !== WebSocket.OPEN) {
                        setErrorMsg("Не удалось подключиться к серверу звонков")
                    }
                }, 7000)

                return () => {
                    ws.removeEventListener("message", handleWsMessage)
                    ws.removeEventListener("open", onOpen as any)
                    if (openTimer) clearTimeout(openTimer)
                    socketRef.current = null
                }
            } else {
                setErrorMsg("Сокет звонков закрыт. Пробую переподключиться…")
                connectSocket()
                socketRef.current?.addEventListener("message", handleWsMessage)
            }

            return () => {
                ws.removeEventListener("message", handleWsMessage)
                if (openTimer) clearTimeout(openTimer)
                socketRef.current = null
            }
        }

        // sharedWs нет → создаём свой
        connectSocket()
        socketRef.current?.addEventListener("message", handleWsMessage)

        openTimer = setTimeout(() => {
            const s = socketRef.current?.readyState
            if (s !== WebSocket.OPEN) setErrorMsg("Не удалось подключиться к серверу звонков")
        }, 7000)

        return () => {
            if (socketRef.current) {
                socketRef.current.removeEventListener("message", handleWsMessage)
            }
            if (openTimer) clearTimeout(openTimer)
            cleanup()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, targetUser, incomingCall?.caller, incomingCall?.rtcMessage])

    React.useEffect(() => {
        localStreamRef.current?.getAudioTracks().forEach((t) => (t.enabled = !muted))
    }, [muted])

    React.useEffect(() => {
        localStreamRef.current?.getVideoTracks().forEach((t) => (t.enabled = !videoOff))
    }, [videoOff])

    React.useEffect(() => {
        if (remoteAudioRef.current) remoteAudioRef.current.muted = speakerOff
    }, [speakerOff])

    const handleAnswer = () => processAccept()

    const handleDecline = () => {
        sendWS("reject_call", { caller: otherUserRef.current })
        setCallState("ended")
        cleanup()
        setTimeout(onClose, 800)
    }

    const handleEnd = () => {
        sendWS("end_call", { peer: otherUserRef.current })
        setCallState("ended")
        stopTimer()
        cleanup()
        setTimeout(onClose, 1000)
    }

    const initials = callerName?.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase() ?? "?"
    const isVideoActive = isVideo && callState === "active" && !videoOff

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[340px] p-0 border-0 overflow-hidden rounded-3xl shadow-2xl [&>button]:hidden bg-transparent">
                <div className="relative flex flex-col h-[600px] overflow-hidden rounded-3xl">

                    {/* Background */}
                    <div className="absolute inset-0 z-0">
                        <div className={cn(
                            "absolute inset-0 transition-all duration-1000",
                            callState === "calling" && "bg-[radial-gradient(ellipse_at_top,_#1e293b_0%,_#0f172a_60%,_#020617_100%)]",
                            callState === "receiving" && "bg-[radial-gradient(ellipse_at_top,_#312e81_0%,_#0f172a_60%,_#020617_100%)]",
                            callState === "active" && isVideoActive
                                ? "bg-[radial-gradient(ellipse_at_top,_#1e3a5f_0%,_#0f172a_60%)]"
                                : callState === "active"
                                    ? "bg-[radial-gradient(ellipse_at_top,_#14532d_0%,_#0f172a_60%,_#020617_100%)]"
                                    : "bg-[radial-gradient(ellipse_at_top,_#1c1c1c_0%,_#0a0a0a_100%)]",
                        )} />

                        <div className="absolute inset-0 opacity-[0.03]" style={{
                            backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")",
                            backgroundRepeat: "repeat", backgroundSize: "128px",
                        }} />

                        <video
                            ref={remoteVideoRef}
                            autoPlay
                            playsInline
                            className={cn(
                                "absolute inset-0 w-full h-full object-cover transition-opacity duration-500",
                                isVideoActive ? "opacity-100" : "opacity-0 pointer-events-none"
                            )}
                        />
                        {isVideoActive && <div className="absolute inset-0 bg-black/20" />}

                        <audio ref={remoteAudioRef} autoPlay playsInline className="hidden" />

                        <div className={cn(
                            "absolute -top-20 -left-20 w-64 h-64 rounded-full blur-3xl opacity-20 transition-colors duration-1000",
                            callState === "active" && !isVideoActive ? "bg-emerald-500" : "bg-blue-600"
                        )} />
                        <div className={cn(
                            "absolute -bottom-20 -right-20 w-64 h-64 rounded-full blur-3xl opacity-15 transition-colors duration-1000",
                            callState === "active" && !isVideoActive ? "bg-teal-400" : "bg-indigo-500"
                        )} />
                    </div>

                    {/* Content */}
                    <div className="relative z-10 flex flex-col h-full">
                        <div className="flex items-center justify-between px-5 pt-5">
                            <span className="text-[11px] font-medium tracking-widest uppercase text-white/40">
                                {isVideo ? "Видеозвонок" : "Аудиозвонок"}
                            </span>
                            <button className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-[11px] text-white/60 hover:bg-white/15 transition-colors">
                                <MessageSquare className="h-3 w-3" />
                                Чат
                            </button>
                        </div>

                        {isVideo && (callState === "active" || callState === "calling") && (
                            <div className="absolute top-16 right-5 w-20 h-28 rounded-2xl overflow-hidden border border-white/10 shadow-xl bg-slate-800 z-20">
                                <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                            </div>
                        )}

                        <div className="flex flex-col items-center justify-center flex-1 gap-0 px-6">
                            <div className="relative mb-6">
                                {(callState === "calling" || callState === "receiving") && (
                                    <>
                                        <div className="absolute -inset-6 rounded-full border border-white/10 animate-ping" style={{ animationDuration: "2s" }} />
                                        <div className="absolute -inset-10 rounded-full border border-white/5 animate-ping" style={{ animationDuration: "2s", animationDelay: "0.5s" }} />
                                    </>
                                )}
                                {callState === "active" && <div className="absolute -inset-2 rounded-full bg-emerald-500/20 animate-pulse" />}

                                <div className="relative h-[100px] w-[100px]">
                                    {callerAvatar ? (
                                        <img src={callerAvatar} alt={callerName} className="h-full w-full rounded-full object-cover ring-2 ring-white/10" />
                                    ) : (
                                        <div className="h-full w-full rounded-full flex items-center justify-center text-3xl font-light text-white ring-2 ring-white/10 bg-gradient-to-br from-slate-600 to-slate-700">
                                            {initials}
                                        </div>
                                    )}
                                    {callState === "active" && (
                                        <span className="absolute bottom-1 right-1 h-3.5 w-3.5 rounded-full bg-emerald-400 ring-2 ring-slate-900" />
                                    )}
                                </div>
                            </div>

                            <h2 className="text-[22px] font-semibold text-white tracking-tight text-center">
                                {callerName ?? "Неизвестный"}
                            </h2>

                            <div className="mt-2 flex items-center gap-2">
                                {callState === "active" && <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />}
                                <span className={cn(
                                    "text-sm font-medium tabular-nums transition-colors",
                                    callState === "calling" && "text-white/50",
                                    callState === "receiving" && "text-violet-400",
                                    callState === "active" && "text-emerald-400",
                                    callState === "ended" && "text-red-400",
                                    callState === "idle" && "text-white/30",
                                )}>
                                    {callState === "idle" && "Подключение..."}
                                    {callState === "calling" && "Вызов..."}
                                    {callState === "receiving" && "Входящий звонок"}
                                    {callState === "active" && formatDuration(duration)}
                                    {callState === "ended" && "Звонок завершён"}
                                </span>
                            </div>

                            {errorMsg && (
                                <div className="mt-3 px-4 py-2 rounded-xl bg-red-500/15 border border-red-500/20">
                                    <p className="text-xs text-red-400 text-center">{errorMsg}</p>
                                </div>
                            )}
                        </div>

                        <div className="px-5 pb-8 space-y-3">
                            {callState === "active" && (
                                <div className="grid grid-cols-3 gap-3">
                                    <ControlButton onClick={() => setMuted(m => !m)} active={muted}
                                                   label={muted ? "Выкл." : "Микрофон"}
                                                   icon={muted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />} />
                                    {isVideo ? (
                                        <ControlButton onClick={() => setVideoOff(v => !v)} active={videoOff}
                                                       label={videoOff ? "Выкл." : "Камера"}
                                                       icon={videoOff ? <VideoOff className="h-5 w-5" /> : <Video className="h-5 w-5" />} />
                                    ) : (
                                        <ControlButton onClick={() => setSpeakerOff(s => !s)} active={speakerOff}
                                                       label={speakerOff ? "Выкл." : "Динамик"}
                                                       icon={speakerOff ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />} />
                                    )}
                                    <ControlButton onClick={() => { }} active={false} label="Экран"
                                                   icon={<ScreenShare className="h-5 w-5" />} />
                                </div>
                            )}

                            {callState === "receiving" && (
                                <div className="grid grid-cols-2 gap-3">
                                    <button onClick={handleDecline}
                                            className="flex items-center justify-center gap-2 h-14 rounded-2xl font-medium text-sm bg-red-500 hover:bg-red-600 text-white shadow-[0_4px_24px_rgba(239,68,68,0.35)] transition-all active:scale-[0.98]">
                                        <PhoneOff className="h-5 w-5" /> Отклонить
                                    </button>
                                    <button onClick={handleAnswer}
                                            className="flex items-center justify-center gap-2 h-14 rounded-2xl font-medium text-sm bg-emerald-500 hover:bg-emerald-600 text-white shadow-[0_4px_24px_rgba(52,211,153,0.35)] transition-all active:scale-[0.98]">
                                        {isVideo ? <Video className="h-5 w-5" /> : <Phone className="h-5 w-5" />} Ответить
                                    </button>
                                </div>
                            )}

                            {callState !== "receiving" && (
                                <button onClick={handleEnd} disabled={callState === "ended"}
                                        className={cn(
                                            "w-full flex items-center justify-center gap-2.5 h-14 rounded-2xl font-medium text-sm transition-all active:scale-[0.98]",
                                            callState !== "ended"
                                                ? "bg-red-500 hover:bg-red-600 text-white shadow-[0_4px_24px_rgba(239,68,68,0.35)]"
                                                : "bg-white/5 text-white/20 cursor-not-allowed"
                                        )}>
                                    <PhoneOff className="h-5 w-5" />
                                    {callState === "ended" ? "Завершено" : "Завершить звонок"}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}

function ControlButton({ onClick, active, label, icon }: {
    onClick: () => void; active: boolean; label: string; icon: React.ReactNode
}) {
    return (
        <button onClick={onClick}
                className={cn("flex flex-col items-center gap-1.5 rounded-2xl py-3 px-2 transition-all active:scale-95",
                    active ? "bg-white text-slate-900" : "text-white")}
                style={!active ? { backgroundColor: "rgba(255,255,255,0.08)" } : {}}>
            <span className="flex h-6 items-center justify-center">{icon}</span>
            <span className={cn("text-[10px] font-medium leading-none", active ? "text-slate-700" : "text-white/50")}>{label}</span>
        </button>
    )
}