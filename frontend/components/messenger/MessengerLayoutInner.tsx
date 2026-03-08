"use client"
import "@/app/globals.css"

import { AppSidebar } from "@/components/messenger/app-sidebar"
import { Separator } from "@/components/ui/separator"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import {useWs, WsProvider} from "@/components/ws-provider"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import * as React from "react"
import {Phone, MoreVertical, Paperclip, RadioTower, ArrowLeft} from "lucide-react"
import {
    DropdownMenu, DropdownMenuTrigger, DropdownMenuContent,
    DropdownMenuItem, DropdownMenuSeparator
} from "@/components/ui/dropdown-menu"
import { BellOff, ImageIcon, Download, Eraser, Trash2 } from "lucide-react"
import { ChatActionsModals, type ChatModal } from "@/components/messenger/chat-modals"
import { MediaModal } from "@/components/messenger/media-call-modals"
import {CallModal} from "@/components/messenger/call-modal"
import { type IncomingCall, useCallSocket } from "@/lib/use-web-call"
import {IncomingCallBanner} from "@/components/incoming-call-banner";
import {useAppSelector} from "@/lib/hook";
import {selectCurrentUser} from "@/lib/features/auth/authSlice";
import {useSelector} from "react-redux";
import {useEffect, useState} from "react";

interface ActiveChat {
    name: string
    avatarUrl?: string
    isOnline: boolean
    lastSeen?: Date
}



interface ActiveChat {
    name: string
    avatarUrl?: string
    isOnline: boolean
    lastSeen?: Date
}

import { formatLastSeen } from "@/lib/format-last-seen";
import {useCall} from "@/components/messenger/call-provider";



export function MessengerLayoutInner({ children }: { children: React.ReactNode }) {
    const router = useRouter()
    const params = useParams()
    const { callUser } = useCall()

    const activeChatId = params?.dialogId as string ?? ""

    const { rooms, typingUsers, onlineStatuses, lastSeenMap } = useWs();

    const activeRoom = rooms.find(r => r.id === activeChatId)
    const chatName = activeRoom?.title ?? (activeChatId ? `Диалог #${activeChatId}` : null)

    const [mediaOpen, setMediaOpen] = React.useState(false)
    const [modal, setModal] = React.useState<ChatModal>(null)

    console.log("activeRoom:", activeRoom)   // ← временно
    const otherUser = activeRoom?.other_user ?? null;   // ← переместить сюда
    const isOnline = otherUser ? (onlineStatuses[otherUser.id] ?? null) : null;
    const lastSeen = otherUser ? (lastSeenMap[otherUser.id] ?? null) : null;

    const handleCallUser = () => {
        console.log("[CALL] otherUser:", otherUser)   // ← временно
        if (!otherUser) return
        const name = otherUser.first_name && otherUser.last_name
            ? `${otherUser.first_name} ${otherUser.last_name}`
            : otherUser.username
        console.log("[CALL] calling:", otherUser.username, name)  // ← временно
        callUser(otherUser.username, name, otherUser.avatar)
    }
    const isMobile = typeof window !== "undefined" && window.innerWidth < 768

    return (
                            <SidebarProvider
                                style={{ "--sidebar-width": "350px" } as React.CSSProperties}
                                className="h-dvh overflow-hidden"
                            >
            <AppSidebar
                activeChatId={activeChatId}
                onSelectChat={(id) => router.push(`/messenger/dialog/${id}`)}
            />
            <SidebarInset className="flex flex-col min-h-0 overflow-hidden">
                <header className="bg-background sticky top-0 flex shrink-0 items-center gap-3 border-b px-4 py-3">
                    <div className="flex items-center gap-2">
                        {/* Кнопка назад — только на мобилке при открытом чате */}
                        {activeChatId && (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 md:hidden"   // скрыта на десктопе
                                onClick={() => router.push("/messenger")}
                            >
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                        )}
                        <SidebarTrigger className="-ml-1 hidden md:flex" />  {/* скрыть триггер на мобилке */}
                        <Separator orientation="vertical" className="mr-1 data-[orientation=vertical]:h-4 hidden md:block" />
                    </div>
                    {chatName ? (
                        <>
                            <div className="flex flex-col min-w-0 flex-1">
                                <span className="text-sm font-semibold leading-tight truncate">
                                    {chatName}
                                </span>
                                <span className="text-xs text-muted-foreground leading-tight">
                                    {typingUsers.length > 0
                                        ? `${typingUsers[0]} печатает...`
                                        : formatLastSeen(isOnline, lastSeen)  // ← было: "не в сети"
                                    }
                                </span>
                            </div>

                            <div className="flex items-center gap-4 shrink-0">
                                <Button variant="ghost" size="icon" className="h-8 w-8"
                                        onClick={() => setMediaOpen(true)}>
                                    <Paperclip className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8"
                                        onClick={handleCallUser}>
                                    <Phone className="h-4 w-4" />
                                </Button>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                            <MoreVertical className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-52">
                                        <DropdownMenuItem onSelect={() => setModal("mute")}>
                                            <BellOff className="mr-2 h-4 w-4" /> Тихий режим
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onSelect={() => setModal("clear")}>
                                            <Eraser className="mr-2 h-4 w-4" /> Очистить историю
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onSelect={() => setModal("delete")}
                                                          className="text-destructive focus:text-destructive">
                                            <Trash2 className="mr-2 h-4 w-4" /> Удалить чат
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </>
                    ) : (
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-muted-foreground">Выберите чат</span>
                            <SidebarTrigger className="-ml-1 flex" />
                        </div>
                    )}
                </header>

                <div className="flex flex-1 flex-col min-h-0 overflow-hidden">
                    {children}
                </div>
            </SidebarInset>

            <ChatActionsModals
                open={modal}
                onClose={() => setModal(null)}
                chatName={chatName ?? undefined}
                onMute={(d) => console.log("mute", d)}
                onWallpaper={(w) => console.log("wallpaper", w)}
                onExport={(f, m) => console.log("export", f, m)}
                onClearHistory={() => console.log("clear")}
                onDeleteChat={(b) => console.log("delete", b)}
            />
            <MediaModal
                open={mediaOpen}
                onClose={() => setMediaOpen(false)}
                chatName={chatName ?? undefined}
            />
        </SidebarProvider>
    )
}