"use client";

import { MessageCircle, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWs } from "@/components/ws-provider";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";

export default function DialoguesPage() {
    const { rooms, searchRooms, searchResults, searchQuery } = useWs();
    const router = useRouter();
    const [localQuery, setLocalQuery] = useState("");

    const displayedRooms = searchQuery ? searchResults : rooms;

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setLocalQuery(e.target.value);
        searchRooms(e.target.value);
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
        <>
            {/* Мобильный список чатов — скрыт на десктопе */}
            <div className="flex flex-col h-full md:hidden">
                {/* Список */}
                <div className="flex-1 overflow-y-auto">
                    {displayedRooms.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full gap-3 text-muted-foreground p-8 text-center">
                            <MessageCircle className="h-10 w-10 opacity-30" />
                            <p className="text-sm">
                                {searchQuery ? "Ничего не найдено" : "Диалогов пока нет"}
                            </p>
                        </div>
                    ) : (
                        displayedRooms.map((room) => (
                            <button
                                key={room.id}
                                type="button"
                                onClick={() => router.push(`/messenger/dialog/${room.id}`)}
                                className="w-full text-left flex items-center gap-3 px-5 py-3 border-b hover:bg-accent transition-colors"
                            >
                                <Avatar className="h-11 w-11 shrink-0">
                                    <AvatarImage src={room.avatar ?? undefined} alt={room.title} />
                                    <AvatarFallback>
                                        {(room.title || "U")
                                            .split(" ")
                                            .map((n: string) => n[0])
                                            .join("")
                                            .slice(0, 2)
                                            .toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2">
                                        <span className="font-medium text-sm truncate">{room.title}</span>
                                        <span className="text-xs text-muted-foreground shrink-0">
                                            {formatRoomDate(room.last_message?.created_at)}
                                        </span>
                                    </div>
                                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                                        {room.last_message?.text || "Вложение"}
                                    </p>
                                </div>

                                {room.unread ? (
                                    <span className="bg-primary text-primary-foreground rounded-full px-2 py-0.5 text-xs shrink-0">
                                        {room.unread}
                                    </span>
                                ) : null}
                            </button>
                        ))
                    )}
                </div>
            </div>

            {/* Десктопная заглушка — скрыта на мобилке */}
            <div className="hidden md:flex h-full w-full flex-col items-center justify-center bg-zinc-50/50 dark:bg-zinc-950/50 select-none p-4">
                <div className="relative mx-auto flex max-w-[420px] flex-col items-center gap-6 rounded-2xl border border-dashed border-border/60 bg-background p-10 text-center shadow-sm">
                    <div className="relative flex h-20 w-20 items-center justify-center">
                        <div className="absolute inset-0 rounded-full bg-primary/10 blur-xl" />
                        <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                            <MessageCircle className="h-8 w-8" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-xl font-semibold tracking-tight">Здесь пока тихо</h2>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            Выберите диалог в меню слева или создайте новый.
                        </p>
                    </div>
                    <Button className="w-full gap-2">
                        <Plus className="h-4 w-4" />
                        Создать новый чат
                    </Button>
                </div>
            </div>
        </>
    );
}