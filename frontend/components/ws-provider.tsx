"use client";

import React from "react";
import { useSelector } from "react-redux";
import { selectCurrentToken } from "@/lib/features/auth/authSlice";
import { useRoomCrypto } from "@/hooks/use-room-crypto";
import {initRoomE2EThunk, loadTransportKeyThunk} from "@/services/crypto";
import { useAppDispatch } from "@/lib/hook";
import { encode, decode } from "@msgpack/msgpack";

// ─── Режим транспорта ────────────────────────────────────────────────────────
const IS_BINARY = process.env.NODE_ENV === "production";

function wsSend(ws: WebSocket, data: object) {
    if (IS_BINARY) {
        ws.send(encode(data));
    } else {
        ws.send(JSON.stringify(data));
    }
}


let siteKey: CryptoKey | null = null;
let siteKeyPrev: CryptoKey | null = null;  // ← этой строки нет

function hexToBytes(hex: string): Uint8Array {
    return new Uint8Array(hex.match(/.{1,2}/g)!.map(b => parseInt(b, 16)));
}

export async function loadSiteKey(data: { key: string; key_prev: string }): Promise<void> {
    console.log("[loadSiteKey] key:", data.key);
    console.log("[loadSiteKey] key_prev:", data.key_prev);
    siteKey = await importAesKey(data.key);
    siteKeyPrev = await importAesKey(data.key_prev);
}

async function importAesKey(hex: string): Promise<CryptoKey> {
    const raw = hexToBytes(hex);
    return crypto.subtle.importKey(
        "raw", raw.buffer, { name: "AES-GCM" }, false, ["decrypt"]
    );
}

export async function decryptTransport(buffer: ArrayBuffer): Promise<any> {
    if (!siteKey) throw new Error("Transport key not loaded");

    const bytes = new Uint8Array(buffer);
    const iv = bytes.slice(0, 12);
    const ciphertext = bytes.slice(12);

    for (const key of [siteKey, siteKeyPrev]) {
        if (!key) continue;
        try {
            const decrypted = await crypto.subtle.decrypt(
                { name: "AES-GCM", iv }, key, ciphertext
            );
            const { decode } = await import("@msgpack/msgpack");
            return decode(new Uint8Array(decrypted));
        } catch {
            continue;
        }
    }

    throw new Error("Не удалось расшифровать ни одним из ключей");
}

async function wsParse(eventData: any): Promise<any> {
    if (!IS_BINARY) {
        return typeof eventData === "string" ? JSON.parse(eventData) : null;
    }

    let buffer: ArrayBuffer;

    if (eventData instanceof ArrayBuffer) {
        buffer = eventData;
    } else if (eventData instanceof Blob) {
        buffer = await eventData.arrayBuffer();
    } else {
        console.warn("[ws] unknown data type:", eventData?.constructor?.name);
        return null;
    }

    return await decryptTransport(buffer);
}
// ────────────────────────────────────────────────────────────────────────────

export type ChatRoom = {
    id: string;
    title?: string;
    avatar?: string;           // ← добавить
    other_user?: {             // ← добавить
        id: number;
        username: string;
        first_name?: string;
        last_name?: string;
        avatar?: string;
    } | null;
    last_message?: {
        text: string;
        user: { username: string; role?: string };
        created_at: string;
    } | null;
    updated_at?: string | number;
    unread?: number;
    is_user?: boolean;
};

type User = {
    id: string;
    username: string;
    role?: "user" | "admin";
};

type Attachment = {
    id: string;
    type: "image" | "file" | "voice";
    url: string;
    name: string;
    size: number;
};

type ChatMessage = {
    id: string;
    user?: User;
    message: string;
    ts: number;
    attachments?: Attachment[];
    read_by?: number[];
};

type WsContextValue = {
    roomStatus: "connecting" | "open" | "closed" | "error";
    chatStatus: "idle" | "connecting" | "open" | "closed" | "error";
    rooms: ChatRoom[];
    activeChatId: number | null;
    messages: ChatMessage[];
    setActiveChatId: (chatId: string | null) => void;
    sendChatMessage: (text: string, attachmentIds?: number[]) => void;
    searchQuery: string;
    searchResults: ChatRoom[];
    searchRooms: (query: string) => void;
    deleteMessage: (messageId: string) => void;
    editMessage: (messageId: string, text: string) => void;
    startDirectDialog: (userId: string) => void;
    typingUsers: string[];           // список username печатающих
    sendTyping: (isTyping: boolean) => void;
    onlineStatuses: Record<number, boolean | null>;  // null = скрыт
    lastSeenMap: Record<number, string | null>;
};

const WsContext = React.createContext<WsContextValue | null>(null);

function makeWsUrl(path: string) {
    const base = "wss://ws.telebotic.host/";
    if (base) return `${base.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;
    if (typeof window !== "undefined") {
        const proto = window.location.protocol === "https:" ? "wss" : "ws";
        return `${proto}://${window.location.host}/${path.replace(/^\//, "")}`;
    }
    return `ws://localhost:8000/${path.replace(/^\//, "")}`;
}

function makeWs(url: string): WebSocket {
    const ws = new WebSocket(url);
    if (IS_BINARY) ws.binaryType = "arraybuffer";
    return ws;
}



function mapAttachments(raw: any[]): Attachment[] {
    return (raw ?? []).map((a: any) => ({
        id: String(a.id),
        type: a.type as "image" | "file" | "voice",  // ← берём type с бэкенда
        url: a.file ?? a.url ?? "",                   // ← поле file из DRF
        name: a.name ?? "",
        size: a.size ?? 0,
    }));
}

export function WsProvider({ children }: { children: React.ReactNode }) {
    const roomWsRef = React.useRef<WebSocket | null>(null);
    const chatWsRef = React.useRef<WebSocket | null>(null);
    const dispatch = useAppDispatch();

    const [roomStatus, setRoomStatus] = React.useState<WsContextValue["roomStatus"]>("connecting");
    const [chatStatus, setChatStatus] = React.useState<WsContextValue["chatStatus"]>("idle");
    const [rooms, setRooms] = React.useState<ChatRoom[]>([]);
    const [activeChatId, setActiveChatId] = React.useState<string | null>(null);
    const [messages, setMessages] = React.useState<ChatMessage[]>([]);
    const { loadRoomKey, encrypt, decrypt } = useRoomCrypto();
    const [searchQuery, setSearchQuery] = React.useState("");
    const [searchResults, setSearchResults] = React.useState<ChatRoom[]>([]);
    const [typingUsers, setTypingUsers] = React.useState<string[]>([]);

    const accessToken = useSelector(selectCurrentToken);
    const currentUser = useSelector((state: any) => state.auth.user);
    const onlineWsRef = React.useRef<WebSocket | null>(null);
    const [onlineStatuses, setOnlineStatuses] = React.useState<Record<number, boolean | null>>({});
    const [lastSeenMap, setLastSeenMap] = React.useState<Record<number, string | null>>({});

    const deleteMessage = React.useCallback((messageId: string) => {
        const ws = chatWsRef.current;
        if (!ws || ws.readyState !== WebSocket.OPEN) return;
        wsSend(ws, {
            action: "delete_message",
            message_id: Number(messageId),
            request_id: `del-${Date.now()}`,
        });
        setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
    }, []);

    const startDirectDialog = React.useCallback((userId: string) => {
        const ws = roomWsRef.current;
        if (!ws || ws.readyState !== WebSocket.OPEN) return;
        wsSend(ws, {
            action: "start_direct_dialog",
            user_id: Number(userId),
            request_id: `direct-${Date.now()}`,
        });
    }, []);

    const sendTyping = React.useCallback((isTyping: boolean) => {
        const ws = chatWsRef.current;
        if (!ws || ws.readyState !== WebSocket.OPEN) return;
        wsSend(ws, {
            action: "typing",
            is_typing: isTyping,
            request_id: `typing-${Date.now()}`,
        });
    }, []);

    const editMessage = React.useCallback((messageId: string, text: string) => {
        const ws = chatWsRef.current;
        if (!ws || ws.readyState !== WebSocket.OPEN) return;
        wsSend(ws, {
            action: "edit_message",
            message_id: Number(messageId),
            text,
            request_id: `edit-${Date.now()}`,
        });
        setMessages((prev) =>
            prev.map((msg) => msg.id === messageId ? { ...msg, message: text } : msg)
        );
    }, []);

    React.useEffect(() => {
        if (!IS_BINARY) return;
        dispatch(loadTransportKeyThunk());

        const interval = setInterval(() => {
            dispatch(loadTransportKeyThunk());
        }, 4 * 60 * 1000); // каждые 4 минуты

        return () => clearInterval(interval);
    }, []);

    React.useEffect(() => {
        if (!accessToken) return;
        let cancelled = false;

        const connect = () => {
            const url = makeWsUrl(`ws/online/?token=${accessToken}`);
            const ws = new WebSocket(url);
            // Онлайн-сокет всегда текстовый (JSON) — не бинарный
            onlineWsRef.current = ws;

            ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);

                    if (data.type === "online_list") {
                        const statusMap: Record<number, boolean | null> = {};
                        const seenMap: Record<number, string | null> = {};
                        (data.users ?? []).forEach((u: any) => {
                            statusMap[u.user_id] = u.is_online;
                            seenMap[u.user_id] = u.last_seen ?? null;
                        });
                        setOnlineStatuses(statusMap);
                        setLastSeenMap(seenMap);
                    }

                    if (data.type === "online_status") {
                        setOnlineStatuses(prev => ({
                            ...prev,
                            [data.user_id]: data.is_online,
                        }));
                        setLastSeenMap(prev => ({
                            ...prev,
                            [data.user_id]: data.last_seen ?? null,
                        }));
                    }
                } catch {
                    // ignore parse errors
                }
            };

            ws.onclose = () => {
                if (cancelled) return;
                setTimeout(connect, 3000);
            };
        };

        connect();

        return () => {
            cancelled = true;
            onlineWsRef.current?.close();
            onlineWsRef.current = null;
        };
    }, [accessToken]);

    React.useEffect(() => {
        let cancelled = false;

        const url = makeWsUrl(`ws/chat/room/?token=${accessToken}`);
        setRoomStatus("connecting");

        const ws = makeWs(url);
        roomWsRef.current = ws;

        ws.onopen = () => {
            if (cancelled) return;
            setRoomStatus("open");
            wsSend(ws, { action: "get_my_rooms", request_id: "rooms-init" });
        };

        ws.onclose = () => { if (!cancelled) setRoomStatus("closed"); };
        ws.onerror = () => { if (!cancelled) setRoomStatus("error"); };

        ws.onmessage = async (event) => {
            const data = await wsParse(event.data);
            if (!data) return;
            console.log("[CHAT WS]", data);  // ← добавить временно

            if (data.type === "typing") {
                const username: string = data.username;
                if (data.is_typing) {
                    setTypingUsers((prev) =>
                        prev.includes(username) ? prev : [...prev, username]
                    );
                } else {
                    setTypingUsers((prev) => prev.filter((u) => u !== username));
                }
                return;
            }
        };

        return () => {
            cancelled = true;
            ws.close();
            roomWsRef.current = null;
        };
    }, []);

    // ─── Сокет чата ──────────────────────────────────────────────────────────
    React.useEffect(() => {
        if (chatWsRef.current) {
            chatWsRef.current.close();
            chatWsRef.current = null;
        }

        if (!activeChatId) {
            setChatStatus("idle");
            setMessages([]);
            setTypingUsers([]);   // ← добавить

            return;
        }

        let cancelled = false;
        const url = makeWsUrl(`ws/chat/${activeChatId}/?token=${accessToken}`);
        setChatStatus("connecting");
        setMessages([]);
        setTypingUsers([]);   // ← добавить


        const ws = makeWs(url);
        chatWsRef.current = ws;

        ws.onopen = () => {
            if (cancelled) return;
            setChatStatus("open");
            const pk = Number(activeChatId);
            wsSend(ws, { action: "join_room", pk, request_id: "join" });
            wsSend(ws, { action: "subscribe_to_messages_in_room", pk, request_id: "sub" });
        };
        ws.onclose = () => { if (!cancelled) setChatStatus("closed"); };
        ws.onerror = () => { if (!cancelled) setChatStatus("error"); };

        ws.onmessage = async (event) => {
            const data = await wsParse(event.data);
            if (!data) return;

            console.log("[CHAT WS]", data);  // ← добавить временно

            if (data.type === "typing") {
                const username: string = data.username;
                if (data.is_typing) {
                    setTypingUsers((prev) =>
                        prev.includes(username) ? prev : [...prev, username]
                    );
                } else {
                    setTypingUsers((prev) => prev.filter((u) => u !== username));
                }
                return;
            }

            if (data.type === "message_history" && Array.isArray(data.data)) {
                const roomId = Number(activeChatId);

                // Загружаем ключ
                if (data.encrypted_room_key) {
                    await loadRoomKey(roomId, data.encrypted_room_key);
                } else {
                    const myEncryptedKey = await dispatch(initRoomE2EThunk(roomId)).unwrap();
                    if (myEncryptedKey) await loadRoomKey(roomId, myEncryptedKey);
                }

                const decryptedMessages = await Promise.all(
                    data.data.map(async (m: any) => {
                        let text = m.text ?? "";
                        // Убираем условие data.encrypted_room_key — пробуем расшифровать если есть iv
                        if (m.iv && data.encrypted_room_key) { // ← условие требует оба поля
                            try {
                                text = await decrypt(roomId, m.text, m.iv);
                            } catch {
                                text = "⚠️ Не удалось расшифровать";
                            }
                        }
                        return {
                            id: String(m.id),
                            user: m.user,
                            message: text,
                            ts: m.created_at ? new Date(m.created_at).getTime() : Date.now(),
                            attachments: mapAttachments(m.attachments),  // ← было: m.attachments ?? []
                        };
                    })
                );
                setMessages(decryptedMessages);
                return;
            }

            if (data.type === "message" && data.data) {
                const m = data.data;

                if (data.action === "delete") {
                    setMessages((prev) => prev.filter((msg) => msg.id !== String(m.id ?? data.pk)));
                    return;
                }
                if (data.action === "update") {
                    setMessages((prev) =>
                        prev.map((msg) =>
                            msg.id === String(m.id)
                                ? { ...msg, message: m.text ?? msg.message, attachments: m.attachments ?? msg.attachments }
                                : msg
                        )
                    );
                    return;
                }
                if (data.action === "create") {
                    const roomId = Number(activeChatId);
                    let text = m.text ?? "";
                    if (m.iv) {
                        try { text = await decrypt(roomId, m.text, m.iv); }
                        catch { text = "⚠️ Не удалось расшифровать"; }
                    }
                    setMessages((prev) => {
                        const withoutOptimistic = prev.filter(
                            (msg, idx) => !(msg.id.startsWith("local-") && idx === prev.length - 1)
                        );
                        return [...withoutOptimistic, {
                            id: String(m.id),
                            user: m.user,
                            message: text,
                            ts: m.created_at ? new Date(m.created_at).getTime() : Date.now(),
                            attachments: mapAttachments(m.attachments),  // ← было: m.attachments ?? []
                        }];
                    });
                    return;
                }
            }
        };

        return () => {
            cancelled = true;
            ws.close();
            chatWsRef.current = null;
        };
    }, [activeChatId]);

    const sendChatMessage = React.useCallback(async (text: string, attachmentIds: number[] = []) => {
        const ws = chatWsRef.current;
        if (!ws || ws.readyState !== WebSocket.OPEN) return;

        const roomId = Number(activeChatId);
        let messageToSend = text;
        let iv: string | undefined = undefined;

        // Шифруем только если есть текст
        if (text.trim()) {
            try {
                const encrypted = await encrypt(roomId, text);
                messageToSend = encrypted.ciphertext;
                iv = encrypted.iv;
            } catch (e) {
                console.warn("[E2E] Не удалось зашифровать, отправляем plaintext:", e);
            }
        }

        wsSend(ws, {
            action: "create_message",
            message: messageToSend,
            iv,
            attachment_ids: attachmentIds,
            request_id: `msg-${Date.now()}`,
        });

        // Оптимистичное сообщение — для голосового показываем плейсхолдер
        setMessages((prev) => [...prev, {
            id: `local-${Date.now()}`,
            user: currentUser ?? undefined,
            message: text,
            ts: Date.now(),
            attachments: [],
        }]);
    }, [currentUser, activeChatId, encrypt]);

    const searchRooms = React.useCallback((query: string) => {
        setSearchQuery(query);
        const ws = roomWsRef.current;
        if (!ws || ws.readyState !== WebSocket.OPEN) return;
        if (!query.trim()) { setSearchResults([]); return; }
        wsSend(ws, { action: "search_entities", query, request_id: `search-${Date.now()}` });
    }, []);

    const value: WsContextValue = React.useMemo(
        () => ({
            roomStatus, chatStatus, rooms, activeChatId, messages,
            setActiveChatId, sendChatMessage, searchQuery, searchResults,
            searchRooms, deleteMessage, editMessage, startDirectDialog,
            typingUsers, sendTyping,
            onlineStatuses,   // ← добавить
            lastSeenMap,      // ← добавить
        }),
        [
            roomStatus, chatStatus, rooms, activeChatId, messages, sendChatMessage,
            searchQuery, searchResults, searchRooms, deleteMessage, editMessage, startDirectDialog,
            typingUsers, sendTyping,
            onlineStatuses, lastSeenMap,  // ← добавить

        ]
    );

    return <WsContext.Provider value={value}>{children}</WsContext.Provider>;
}

export function useWs() {
    const ctx = React.useContext(WsContext);
    if (!ctx) throw new Error("useWs must be used within WsProvider");
    return ctx;
}