"use client"

import * as React from "react"
import {Archive, BookUser, Command, File, Inbox, MessageSquare, Send, Settings, Trash2} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarHeader,
    SidebarInput,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from "@/components/ui/sidebar"

import {ChatRoom, useWs} from "@/components/ws-provider"
import {useSelector} from "react-redux";
import {selectCurrentUser} from "@/lib/features/auth/authSlice";
import {useEffect} from "react";
import {useRouter} from "next/navigation";

const data = {
    user: {},
    navMain: [
        { id: "inbox", title: "Чаты", url: "#", icon: MessageSquare },
        { id: "drafts", title: "Архивы", url: "#", icon: Archive },
        { id: "sent", title: "Контакты", url: "#", icon: BookUser },
        { id: "junk", title: "Настройки", url: "#", icon: Settings },
    ],
}

type AppSidebarProps = React.ComponentProps<typeof Sidebar> & {
    activeChatId: string
    onSelectChat: (chatId: string) => void
}

function RoomItem({
                      room,
                      activeChatId,
                      onSelect
                  }: {
    room: ChatRoom
    activeChatId: string | null
    onSelect: (id: string) => void
}) {

    const { startDirectDialog } = useWs();
    const isActiveChat = room.id === activeChatId;

    const handleClick = () => {
        if (room.is_user) {
            startDirectDialog(room.id);
        } else {
            onSelect(room.id);
        }
    };

    function formatRoomDate(dateStr?: string): string {
        if (!dateStr) return "";
        const date = new Date(dateStr);
        const now = new Date();
        if (date.toDateString() === now.toDateString())
            return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        if (date.getFullYear() === now.getFullYear())
            return date.toLocaleDateString([], { day: "numeric", month: "short" });
        return date.toLocaleDateString([], { day: "numeric", month: "short", year: "numeric" });
    }

    return (
        <button
            type="button"
            onClick={handleClick}
            className={[
                "w-full text-left",
                "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                "flex flex-col items-start gap-2 border-b p-4 text-sm leading-tight whitespace-nowrap last:border-b-0",
                isActiveChat ? "bg-sidebar-accent text-sidebar-accent-foreground" : "",
            ].join(" ")}
        >
            <div className="flex w-full items-start gap-3">
                <Avatar className="h-10 w-10 shrink-0">
                    <AvatarImage
                        src={room.avatar ? `${room.avatar}` : undefined}
                        alt={room.title}
                    />
                    <AvatarFallback>
                        {(room.title || "U")
                            .split(" ")
                            .map((n: string) => n[0])
                            .join("")
                            .slice(0, 2)
                            .toUpperCase()}
                    </AvatarFallback>
                </Avatar>

                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <div className="flex items-center justify-between gap-2">
                        <span className="truncate font-medium">
                            {room.title ?? room.last_message?.user?.username}
                        </span>
                        <span className="shrink-0 text-xs text-muted-foreground">
                            {formatRoomDate(room.last_message?.created_at)}
                        </span>
                    </div>

                    <div className="flex items-center gap-1 max-w-[200px] text-sm text-muted-foreground">
                        {room.is_user ? (
                            <span className="truncate">Написать сообщение</span>
                        ) : (
                            <span className="truncate">
                                {room.last_message?.text || "Вложение"}
                            </span>
                        )}
                    </div>
                </div>

                {room.unread ? (
                    <span className="bg-blue-500 text-white rounded-full px-2 text-xs self-center">
                        {room.unread}
                    </span>
                ) : null}
            </div>
        </button>
    );
}
export function AppSidebar({ activeChatId, onSelectChat, ...props }: AppSidebarProps) {
    const [activeItem, setActiveItem] = React.useState(data.navMain[0])
    const { setOpen } = useSidebar()
    const user = useSelector(selectCurrentUser)
    const router = useRouter()
    const isChatListScreen = !activeChatId // ✅ если чат не выбран — мы в списке

    useEffect(() => {
        if (!user) {
            router.push("/auth/sign-in");
        }
    }, []);

    const { rooms, roomStatus, searchRooms, searchResults, searchQuery, setActiveChatId } = useWs();

    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    function formatRoomDate(dateStr?: string): string {
        if (!dateStr) return "";
        const date = new Date(dateStr);
        const now = new Date();
        const isToday = date.toDateString() === now.toDateString();
        const isThisYear = date.getFullYear() === now.getFullYear();

        if (isToday) return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        if (isThisYear) return date.toLocaleDateString([], { day: "numeric", month: "short" });
        return date.toLocaleDateString([], { day: "numeric", month: "short", year: "numeric" });
    }
    const displayedRooms = searchQuery ? searchResults : rooms;



    return (
        <Sidebar
            collapsible="icon"
            className="overflow-hidden *:data-[sidebar=sidebar]:flex-row"
            {...props}
        >
            {/* 1-й сайдбар (иконки) */}
            <Sidebar collapsible="none" className="w-[calc(var(--sidebar-width-icon)+1px)]! border-r">
                <SidebarHeader>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton size="lg" asChild className="md:h-8 md:p-0">
                                <a href="#">
                                    <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                                        <Command className="size-4" />
                                    </div>
                                    <div className="grid flex-1 text-left text-sm leading-tight">
                                        <span className="truncate font-medium">Acme Inc</span>
                                        <span className="truncate text-xs">Enterprise</span>
                                    </div>
                                </a>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarHeader>

                <SidebarContent>
                    <SidebarGroup>
                        <SidebarGroupContent className="px-1.5 md:px-0">
                            <SidebarMenu>
                                {data.navMain.map((item) => (
                                    <SidebarMenuItem key={item.id}>
                                        <SidebarMenuButton
                                            tooltip={{ children: item.title, hidden: false }}
                                            onClick={() => {
                                                setActiveItem(item)
                                                setOpen(true)
                                            }}
                                            isActive={activeItem?.id === item.id}
                                            className="px-2.5 md:px-2"
                                        >
                                            <item.icon />
                                            <span>{item.title}</span>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                </SidebarContent>

                {/*<SidebarFooter>*/}
                {/*    <NavUser user={user} />*/}
                {/*</SidebarFooter>*/}
            </Sidebar>

            {/* 2-й сайдбар (список чатов) */}
            <Sidebar collapsible="none" className="flex flex-1">
                <SidebarHeader className="gap-3.5 border-b p-4">
                    <SidebarInput placeholder="Поиск чатов"
                                  onChange={(e) => searchRooms(e.target.value)}
                    />
                </SidebarHeader>

                <SidebarContent>
                    <SidebarGroup className="px-0">
                        <SidebarGroupContent>
                            {roomStatus !== "open" && (
                                <div className="px-4 py-2 text-sm text-muted-foreground">
                                    {roomStatus === "connecting" ? "Загрузка диалогов..." : "Нет соединения"}
                                </div>
                            )}

                            {displayedRooms.map(room => (
                                <RoomItem
                                    key={room.id}
                                    room={room}
                                    activeChatId={activeChatId}
                                    onSelect={(id) => {
                                        setActiveChatId(id);
                                        onSelectChat(id);
                                    }}
                                />
                            ))}

                            {roomStatus === "open" && rooms.length === 0 && !searchQuery && (
                                <div className="px-4 py-2 text-sm text-muted-foreground">Диалогов нет</div>
                            )}
                        </SidebarGroupContent>
                    </SidebarGroup>
                </SidebarContent>
            </Sidebar>
        </Sidebar>
    )
}