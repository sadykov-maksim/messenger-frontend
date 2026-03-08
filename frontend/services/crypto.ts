import { createApi } from "@reduxjs/toolkit/query/react"
import { staggeredBaseQueryWithBailOut } from "@/services/auth"
import { generateAndStoreKeyPair, hasKeyPair, encryptRoomKeyForMember, generateRoomKey } from "@/lib/crypto"
import { loadSiteKey } from "@/components/ws-provider"
import { createAsyncThunk } from "@reduxjs/toolkit"

export interface UploadPublicKeyRequest {
    public_key: string
}

export interface UploadPublicKeyResponse {
    detail: string
}

export interface DistributeRoomKeysRequest {
    room_id: number
    encrypted_keys: Array<{
        user_id: number
        encrypted_key: string
    }>
}

export interface MemberPublicKey {
    user_id: number
    username: string
    public_key: string | null
}


export const cryptoApi = createApi({
    reducerPath: "cryptoApi",
    baseQuery: staggeredBaseQueryWithBailOut,
    tagTypes: ["PublicKey"],
    endpoints: (builder) => ({

        /**
         * POST /api/account/public-key/
         * Загружает публичный RSA ключ пользователя на сервер.
         * Вызывается один раз после регистрации или с нового устройства.
         */
        uploadPublicKey: builder.mutation<UploadPublicKeyResponse, UploadPublicKeyRequest>({
            query: (body) => ({
                url: "/messenger/account/public-key/",
                method: "POST",
                body,
            }),
            invalidatesTags: ["PublicKey"],
        }),

        /**
         * POST /api/rooms/distribute-keys/
         * Клиент-создатель отправляет зашифрованные копии AES ключа комнаты.
         * Сервер просто хранит base64 blob, не зная содержимого.
         */
        distributeRoomKeys: builder.mutation<{ detail: string }, DistributeRoomKeysRequest>({
            query: (body) => ({
                url: "/messenger/rooms/distribute-keys/",
                method: "POST",
                body,
            }),
        }),

        /**
         * GET /api/rooms/<room_id>/public-keys/
         * Возвращает публичные ключи всех участников комнаты.
         * Нужен при создании комнаты — чтобы зашифровать AES ключ для каждого.
         */
        getMembersPublicKeys: builder.query<MemberPublicKey[], number>({
            query: (roomId) => ({
                url: `/messenger/rooms/${roomId}/public-keys/`,
                method: "GET",
            }),
        }),

        getTransportKey: builder.mutation<{ key: string }, void>({
            query: () => ({
                url: "/transport-key/",
                method: "POST",
            }),
        }),

    }),
})

export const {
    useUploadPublicKeyMutation,
    useDistributeRoomKeysMutation,
    useGetMembersPublicKeysQuery,
    useGetTransportKeyMutation,
} = cryptoApi


/**
 * Вызывается после успешной регистрации или логина.
 * Если ключи уже есть в IndexedDB — ничего не делает.
 * Если нет — генерирует RSA пару и загружает публичный ключ на сервер.
 */
export const setupE2EKeysThunk = createAsyncThunk(
    "crypto/setupE2EKeys",
    async (_, { dispatch, rejectWithValue }) => {
        try {
            const alreadyHasKeys = await hasKeyPair()
            if (alreadyHasKeys) return

            const publicKeyBase64 = await generateAndStoreKeyPair()

            // mutations don't have .unsubscribe() — await directly
            await dispatch(
                cryptoApi.endpoints.uploadPublicKey.initiate({ public_key: publicKeyBase64 })
            ).unwrap()
        } catch (error) {
            console.error("[E2E] Не удалось настроить ключи:", error)
            return rejectWithValue(error)
        }
    }
)


/**
 * Вызывается после создания новой комнаты или start_direct_dialog.
 * 1. Запрашивает публичные ключи всех участников
 * 2. Генерирует AES ключ комнаты
 * 3. Шифрует его для каждого участника
 * 4. Отправляет зашифрованные копии на сервер
 *
 * Использование:
 *   await dispatch(initRoomE2EThunk(roomId))
 */

export const initRoomE2EThunk = createAsyncThunk(
    "crypto/initRoomE2E",
    async (roomId: number, { dispatch, rejectWithValue }) => {
        try {
            const keysPromise = dispatch(
                cryptoApi.endpoints.getMembersPublicKeys.initiate(roomId, { forceRefetch: true })
            )
            let members: MemberPublicKey[]
            try {
                members = await keysPromise.unwrap()
            } finally {
                keysPromise.unsubscribe()
            }

            const membersWithoutKeys = members.filter((m) => !m.public_key)
            if (membersWithoutKeys.length > 0) {
                console.warn(
                    "[E2E] Участники без публичного ключа (сообщения будут недоступны):",
                    membersWithoutKeys.map((m) => m.username)
                )
            }

            const roomKey = await generateRoomKey()

            const encrypted_keys = await Promise.all(
                members
                    .filter((m) => m.public_key)
                    .map(async (m) => ({
                        user_id: m.user_id,
                        encrypted_key: await encryptRoomKeyForMember(roomKey, m.public_key!),
                    }))
            )

            await dispatch(
                cryptoApi.endpoints.distributeRoomKeys.initiate({ room_id: roomId, encrypted_keys })
            ).unwrap()
        } catch (error) {
            console.error("[E2E] Не удалось инициализировать ключи комнаты:", error)
            return rejectWithValue(error)
        }
    }
)

export const loadTransportKeyThunk = createAsyncThunk(
    "crypto/loadTransportKey",
    async (_, { dispatch, rejectWithValue }) => {
        try {

            // getTransportKey is a mutation — no .unsubscribe(), await directly
            const data = await dispatch(
                cryptoApi.endpoints.getTransportKey.initiate()
            ).unwrap()
            await loadSiteKey(data) // ← весь объект,
            return data
        } catch (error) {
            console.error("[E2E] Не удалось загрузить транспортный ключ:", error)
            return rejectWithValue(error)
        }
    }
)
