"use client";

import React from "react";
import { Icon } from "@iconify/react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { TooltipProvider } from "@/components/ui/tooltip";
import {
    ContextMenu,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuSeparator,
    ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {User} from "@/services/auth";
import {VoiceMessagePlayer} from "@/components/messenger/voice-message";

export type Attachment = {
    id: string;
    type: "image" | "file" | "voice";
    url: string;
    name: string;
    size: number;
};

export type MessageCardProps = React.HTMLAttributes<HTMLDivElement> & {
    avatar?: string;
    message?: React.ReactNode;
    status?: "success" | "failed";
    messageClassName?: string;
    isUser?: boolean;
    user: User;
    readBy?: number[];
    currentUserId?: number;
    totalMembers?: number;  // сколько всего участников кроме отправителя
    timestamp?: number;
    attachments?: Attachment[];
    onReply?: () => void;
    onCopy?: () => void;
    onForward?: () => void;
    onPin?: () => void;
    onEdit?: () => void;
    onDelete?: () => void;
};

function formatTime(ts?: number): string {
    if (!ts) return "";
    return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

const MessageCard = React.forwardRef<HTMLDivElement, MessageCardProps>(
    (
        {
            avatar,
            message,
            status,
            isUser = false,
            user,
            readBy,          // ← добавить
            totalMembers,    // ← добавить
            className,
            messageClassName,
            timestamp,
            attachments,
            onReply,
            onCopy,
            onForward,
            onPin,
            onEdit,
            onDelete,
            ...props
        },
        ref,
    ) => {
        const messageRef = React.useRef<HTMLDivElement>(null);
        const hasFailed = status === "failed";
        const hasAttachments = attachments && attachments.length > 0;

        const handleCopy = () => {
            if (messageRef.current) {
                navigator.clipboard.writeText(messageRef.current.innerText);
            }
            onCopy?.();
        };
        console.log(user)
        return (
            <TooltipProvider>
                <ContextMenu>
                    <ContextMenuTrigger asChild>
                        <div
                            {...props}
                            ref={ref}
                            className={cn(
                                "flex gap-3 px-1 w-full py-2",
                                isUser ? "flex-row-reverse" : "flex-row",
                                className
                            )}
                        >
                            {/* Avatar */}
                            <div className="relative flex-none">
                                <Avatar className="h-9 w-9 border shadow-sm">
                                    <AvatarImage
                                        src={user.avatar ? `${user.avatar}` : undefined}
                                        alt={user.username}
                                    />
                                    <AvatarFallback>
                                        {(user.username || "U")
                                            .split(" ")
                                            .map((n: string) => n[0])
                                            .join("")
                                            .slice(0, 2)
                                            .toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                {hasFailed && !isUser && (
                                    <Badge
                                        variant="destructive"
                                        className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center border-2 border-background"
                                    >
                                        <Icon icon="gravity-ui:circle-exclamation-fill" className="text-[12px]" />
                                    </Badge>
                                )}
                            </div>

                            {/* Bubble + timestamp */}
                            <div className={cn(
                                "flex max-w-[85%] md:max-w-[75%] flex-col gap-1",
                                isUser ? "items-end" : "items-start"
                            )}>
                                <div
                                    className={cn(
                                        "relative w-full rounded-2xl px-4 py-2.5 text-sm transition-all shadow-sm",
                                        isUser
                                            ? "bg-primary text-primary-foreground rounded-tr-none"
                                            : "bg-muted/50 text-foreground rounded-tl-none border border-border/40",
                                        hasFailed && !isUser && "bg-destructive/10 border-destructive/20 text-destructive",
                                        messageClassName
                                    )}
                                >
                                    {/* Текст */}
                                    {message && (
                                        <div ref={messageRef} className="leading-relaxed">
                                            {hasFailed && !isUser ? (
                                                <div className="space-y-1 text-xs opacity-90">
                                                    <p>Something went wrong. Contact support at</p>
                                                    <a href="mailto:support@acmeai.com" className="underline font-medium">
                                                        support@acmeai.com
                                                    </a>
                                                </div>
                                            ) : (
                                                message
                                            )}
                                        </div>
                                    )}

                                    {/* Вложения */}
                                    {hasAttachments && (
                                        <div className={cn("flex flex-col gap-2", message && "mt-2")}>
                                            {(() => {
                                                const images = attachments.filter((f) => f.type === "image");
                                                const others = attachments.filter((f) => f.type !== "image");

                                                return (
                                                    <>
                                                        {/* Сетка изображений */}
                                                        {images.length > 0 && (
                                                            <div
                                                                className={cn(
                                                                    "grid gap-2 rounded-xl overflow-hidden ",
                                                                    images.length === 1 && "grid-cols-1",
                                                                    images.length === 2 && "grid-cols-2",
                                                                    images.length >= 3 && "grid-cols-3",
                                                                )}
                                                            >
                                                                {images.map((file) => (
                                                                    <button
                                                                        key={file.id}
                                                                        type="button"
                                                                        // 👇 Убрали aspect-square, добавили w-full и max-h-[150px]
                                                                        className="relative w-full min-h-[100px] max-h-[150px] overflow-hidden hover:opacity-90 transition-opacity"
                                                                        onClick={() => window.open(file.url, "_blank")}
                                                                        title={file.name}
                                                                    >
                                                                        <img
                                                                            src={file.url}
                                                                            alt={file.name}
                                                                            // 👇 object-cover корректно заполнит пространство без искажений
                                                                            className="h-full w-full object-cover"
                                                                            loading="lazy"
                                                                        />
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        )}

                                                        {/* Остальные файлы */}
                                                        {others.map((file) => {
                                                            if (file.type === "voice") {
                                                                return (
                                                                    <VoiceMessagePlayer
                                                                        key={file.id}
                                                                        url={file.url}
                                                                        isMine={isUser}
                                                                    />
                                                                );
                                                            }

                                                            return (
                                                                <a
                                                                    key={file.id}
                                                                    href={file.url}
                                                                    target="_blank"
                                                                    rel="noreferrer"
                                                                    className="flex items-center gap-2 rounded-xl border px-3 py-2 text-xs hover:bg-muted/80 transition-colors"
                                                                >
                                                                    <Icon icon="lucide:file" className="text-base shrink-0" />
                                                                    <div className="flex flex-col min-w-0">
                                                                        <span className="truncate font-medium">{file.name}</span>
                                                                        <span className="opacity-60">{formatSize(file.size)}</span>
                                                                    </div>
                                                                    <Icon icon="lucide:download" className="text-base shrink-0 ml-auto" />
                                                                </a>
                                                            );
                                                        })}
                                                    </>
                                                );
                                            })()}
                                        </div>
                                    )}
                                </div>

                                {/* Timestamp */}
                                {timestamp && (
                                    <div className="flex items-center gap-1 px-1">
                                        <span className="text-[11px] text-muted-foreground">
                                            {formatTime(timestamp)}
                                        </span>

                                        {/* Галочки — только для своих сообщений */}
                                        {isUser && (
                                            <span className="flex items-center">
                                                {readBy && totalMembers && readBy.length >= totalMembers ? (
                                                    // Двойная синяя — все прочитали
                                                    <Icon
                                                        icon="lucide:check-check"
                                                        className="text-[13px] text-blue-500"
                                                    />
                                                ) : readBy && readBy.length > 0 ? (
                                                    // Двойная серая — доставлено
                                                    <Icon
                                                        icon="lucide:check-check"
                                                        className="text-[13px] text-muted-foreground"
                                                    />
                                                ) : (
                                                    // Одна галочка — отправлено
                                                    <Icon
                                                        icon="lucide:check"
                                                        className="text-[13px] text-muted-foreground"
                                                    />
                                                )}
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </ContextMenuTrigger>

                    {/* Context Menu */}
                    <ContextMenuContent className="w-48">
                        <ContextMenuItem onClick={onReply} className="gap-2">
                            <Icon icon="lucide:reply" className="text-base" />
                            Ответить
                        </ContextMenuItem>
                        <ContextMenuItem onClick={handleCopy} className="gap-2">
                            <Icon icon="lucide:copy" className="text-base" />
                            Копировать
                        </ContextMenuItem>
                        <ContextMenuItem onClick={onForward} className="gap-2">
                            <Icon icon="lucide:forward" className="text-base" />
                            Переслать
                        </ContextMenuItem>
                        <ContextMenuItem onClick={onPin} className="gap-2">
                            <Icon icon="lucide:pin" className="text-base" />
                            Закрепить
                        </ContextMenuItem>
                        {isUser && (
                            <>
                                <ContextMenuSeparator />
                                <ContextMenuItem onClick={onEdit} className="gap-2">
                                    <Icon icon="lucide:pencil" className="text-base" />
                                    Изменить
                                </ContextMenuItem>
                                <ContextMenuItem onClick={onDelete} className="gap-2 text-destructive focus:text-destructive">
                                    <Icon icon="lucide:trash-2" className="text-base" />
                                    Удалить
                                </ContextMenuItem>
                            </>
                        )}
                    </ContextMenuContent>
                </ContextMenu>
            </TooltipProvider>
        );
    },
);

MessageCard.displayName = "MessageCard";
export default MessageCard;