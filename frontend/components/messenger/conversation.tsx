"use client";

import React from "react";
import MessageCard from "./message-card";
import { useWs } from "@/components/ws-provider";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "@/lib/features/auth/authSlice";
import {toast} from "sonner";

export default function Conversation({ chatId }: { chatId: string }) {
    const { setActiveChatId, messages, chatStatus, sendChatMessage, deleteMessage, editMessage } = useWs();
    const user = useSelector(selectCurrentUser);
    const bottomRef = React.useRef<HTMLDivElement>(null);

    // Edit state
    const [editingId, setEditingId] = React.useState<string | null>(null);
    const [editText, setEditText] = React.useState("");
    const editInputRef = React.useRef<HTMLInputElement>(null);

    React.useEffect(() => {
        setActiveChatId(chatId);
    }, [chatId, setActiveChatId]);

    React.useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Focus input when editing starts
    React.useEffect(() => {
        if (editingId) editInputRef.current?.focus();
    }, [editingId]);

    const handleDelete = (messageId: string) => {
        deleteMessage(messageId);
    };

    const handleEdit = (messageId: string, text: string) => {
        setEditingId(messageId);
        setEditText(text);
    };

    const handleEditSubmit = () => {
        if (!editingId || !editText.trim()) return;
        editMessage(editingId, editText.trim());
        setEditingId(null);
        setEditText("");
    };

    const handleEditCancel = () => {
        setEditingId(null);
        setEditText("");
    };

    const handlePin = (messageId: string) => {
        toast.warning(`В данный момент мы не можем закреплять соообщения ${messageId}`);

        console.log("pin", messageId);
    };

    const handleForward = (messageId: string) => {
        toast.warning(`В данный момент мы не можем переслать сообщение ${messageId}`);

        console.log("forward", messageId);
    };

    const handleReply = (messageId: string) => {
        toast.warning(`В данный момент мы не можем ответиьт на сообщегние ${messageId}`);

        console.log("reply", messageId);
    };

    return (
        <div className="flex-1 overflow-y-auto">
            {messages.map((message) => {
                const isMe = message.user?.username === user?.username;
                const hasText = Boolean(message.message && String(message.message).trim() !== "");
                const hasAttachments = Boolean(message.attachments && message.attachments.length > 0);

                if (!hasText && !hasAttachments) return null;

                return (
                    <React.Fragment key={message.id}>
                        <MessageCard
                            key={message.id}
                            isUser={isMe}
                            user={message.user}
                            readBy={message?.read_by}
                            currentUserId={user?.id}
                            totalMembers={1}  // для диалога всегда 1 (собеседник)
                            message={message.message}
                            timestamp={message.ts}
                            attachments={message.attachments}
                            onReply={() => handleReply(message.id)}
                            onForward={() => handleForward(message.id)}
                            onPin={() => handlePin(message.id)}
                            onEdit={() => handleEdit(message.id, String(message.message))}
                            onDelete={() => handleDelete(message.id)}
                        />
                        {/* Inline edit form */}
                        {editingId === message.id && (
                            <div className="flex items-center gap-2 px-4 py-2 bg-muted/40 border-t border-border">
                                <input
                                    ref={editInputRef}
                                    className="flex-1 rounded-md border border-input bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                                    value={editText}
                                    onChange={(e) => setEditText(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") handleEditSubmit();
                                        if (e.key === "Escape") handleEditCancel();
                                    }}
                                    placeholder="Редактировать сообщение..."
                                />
                                <button
                                    onClick={handleEditSubmit}
                                    className="px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-sm hover:bg-primary/90"
                                >
                                    Сохранить
                                </button>
                                <button
                                    onClick={handleEditCancel}
                                    className="px-3 py-1.5 rounded-md bg-muted text-muted-foreground text-sm hover:bg-muted/80"
                                >
                                    Отмена
                                </button>
                            </div>
                        )}
                    </React.Fragment>
                );
            })}
            <div ref={bottomRef} />
        </div>
    );
}