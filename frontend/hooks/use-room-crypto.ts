"use client"

/**
 * useRoomCrypto — хук для работы с E2E шифрованием в чате.
 * Используется в компоненте комнаты/чата.
 */

import { useCallback, useRef } from "react"
import {
    decryptRoomKey,
    encryptMessage,
    decryptMessage,
    generateRoomKey,
    encryptRoomKeyForMember,
} from "@/lib/crypto"   // ← путь к crypto.ts

interface Member {
    user_id: number
    public_key: string
}

export function useRoomCrypto() {
    // Кэш расшифрованных AES ключей комнат: roomId → CryptoKey
    const roomKeys = useRef<Map<number, CryptoKey>>(new Map())

    /**
     * Вызывается когда WebSocket отдаёт encrypted_room_key при join_room.
     * Расшифровывает AES ключ приватным ключом из IndexedDB и кэширует.
     */
    const loadRoomKey = useCallback(async (
        roomId: number,
        encryptedRoomKey: string
    ) => {
        if (roomKeys.current.has(roomId)) return  // уже расшифрован

        try {
            const key = await decryptRoomKey(encryptedRoomKey)
            roomKeys.current.set(roomId, key)
        } catch (e) {
            console.error(`[E2E] Не удалось расшифровать ключ комнаты ${roomId}:`, e)
            throw e
        }
    }, [])

    /**
     * Шифрует текст сообщения перед отправкой через WebSocket.
     */
    const encrypt = useCallback(async (
        roomId: number,
        text: string
    ): Promise<{ ciphertext: string; iv: string }> => {
        const key = roomKeys.current.get(roomId)
        if (!key) throw new Error(`Ключ комнаты ${roomId} не загружен`)
        return encryptMessage(text, key)
    }, [])

    /**
     * Расшифровывает входящее сообщение.
     */
    const decrypt = useCallback(async (
        roomId: number,
        ciphertext: string,
        iv: string
    ): Promise<string> => {
        const key = roomKeys.current.get(roomId)
        if (!key) throw new Error(`Ключ комнаты ${roomId} не загружен`)
        return decryptMessage(ciphertext, iv, key)
    }, [])

    /**
     * При создании новой комнаты:
     * генерирует AES ключ и шифрует его для каждого участника.
     * Возвращает массив для отправки через distribute_room_keys.
     */
    const prepareRoomKeys = useCallback(async (
        roomId: number,
        members: Member[]
    ): Promise<Array<{ user_id: number; encrypted_key: string }>> => {
        const roomKey = await generateRoomKey()
        roomKeys.current.set(roomId, roomKey)  // кэшируем для себя

        return Promise.all(
            members.map(async (member) => ({
                user_id: member.user_id,
                encrypted_key: await encryptRoomKeyForMember(roomKey, member.public_key),
            }))
        )
    }, [])

    return { loadRoomKey, encrypt, decrypt, prepareRoomKeys }
}