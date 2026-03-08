/**
 * E2E Encryption utilities
 * Генерация RSA-OAEP ключевой пары, хранение приватного ключа в IndexedDB,
 * загрузка публичного ключа на сервер.
 */

const DB_NAME = "e2e_crypto"
const DB_VERSION = 1
const STORE_NAME = "keys"
const PRIVATE_KEY_ID = "private_key"

// ─── IndexedDB ────────────────────────────────────────────────────────────────

function openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        const req = indexedDB.open(DB_NAME, DB_VERSION)

        req.onupgradeneeded = (e) => {
            const db = (e.target as IDBOpenDBRequest).result
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME)
            }
        }

        req.onsuccess = () => resolve(req.result)
        req.onerror = () => reject(req.error)
    })
}

async function savePrivateKey(key: CryptoKey): Promise<void> {
    const db = await openDB()
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readwrite")
        tx.objectStore(STORE_NAME).put(key, PRIVATE_KEY_ID)
        tx.oncomplete = () => resolve()
        tx.onerror = () => reject(tx.error)
    })
}

async function loadPrivateKey(): Promise<CryptoKey | null> {
    const db = await openDB()
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readonly")
        const req = tx.objectStore(STORE_NAME).get(PRIVATE_KEY_ID)
        req.onsuccess = () => resolve(req.result ?? null)
        req.onerror = () => reject(req.error)
    })
}

async function deletePrivateKey(): Promise<void> {
    const db = await openDB()
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readwrite")
        tx.objectStore(STORE_NAME).delete(PRIVATE_KEY_ID)
        tx.oncomplete = () => resolve()
        tx.onerror = () => reject(tx.error)
    })
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function arrayBufferToBase64(buffer: ArrayBuffer): string {
    return btoa(String.fromCharCode(...new Uint8Array(buffer)))
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binary = atob(base64)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
    return bytes.buffer
}

// ─── Key Generation ───────────────────────────────────────────────────────────

/**
 * Генерирует RSA-OAEP ключевую пару.
 * Приватный ключ сохраняется в IndexedDB (не покидает устройство).
 * Публичный ключ возвращается как base64 строка для отправки на сервер.
 */
export async function generateAndStoreKeyPair(): Promise<string> {
    const keyPair = await window.crypto.subtle.generateKey(
        {
            name: "RSA-OAEP",
            modulusLength: 2048,
            publicExponent: new Uint8Array([1, 0, 1]),
            hash: "SHA-256",
        },
        true,           // extractable — нужно для экспорта публичного ключа
        ["encrypt", "decrypt"]
    )

    // Приватный ключ — только в IndexedDB
    await savePrivateKey(keyPair.privateKey)

    // Публичный ключ — экспортируем в base64 для сервера
    const publicKeyBuffer = await window.crypto.subtle.exportKey("spki", keyPair.publicKey)
    return arrayBufferToBase64(publicKeyBuffer)
}

/**
 * Проверяет есть ли уже сохранённая ключевая пара у пользователя.
 */
export async function hasKeyPair(): Promise<boolean> {
    const key = await loadPrivateKey()
    return key !== null
}

/**
 * Отправляет публичный ключ на сервер.
 */
export async function uploadPublicKey(
    publicKeyBase64: string,
    apiBaseUrl = ""
): Promise<void> {
    const res = await fetch(`${apiBaseUrl}/api/account/public-key/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ public_key: publicKeyBase64 }),
    })

    if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data?.detail ?? "Не удалось загрузить публичный ключ")
    }
}

/**
 * Полный flow при регистрации:
 * 1. Генерирует ключевую пару
 * 2. Сохраняет приватный ключ в IndexedDB
 * 3. Отправляет публичный ключ на сервер
 */
export async function setupE2EKeys(apiBaseUrl = ""): Promise<void> {
    const alreadyHasKeys = await hasKeyPair()
    if (alreadyHasKeys) return // ключи уже есть — ничего не делаем

    const publicKeyBase64 = await generateAndStoreKeyPair()
    await uploadPublicKey(publicKeyBase64, apiBaseUrl)
}

// ─── Encryption / Decryption ──────────────────────────────────────────────────

/**
 * Импортирует публичный ключ участника из base64 строки.
 */
export async function importPublicKey(base64: string): Promise<CryptoKey> {
    return window.crypto.subtle.importKey(
        "spki",
        base64ToArrayBuffer(base64),
        { name: "RSA-OAEP", hash: "SHA-256" },
        false,
        ["encrypt"]
    )
}

/**
 * Генерирует AES-GCM ключ для комнаты.
 */
export async function generateRoomKey(): Promise<CryptoKey> {
    return window.crypto.subtle.generateKey(
        { name: "AES-GCM", length: 256 },
        true,
        ["encrypt", "decrypt"]
    )
}

/**
 * Шифрует AES roomKey публичным ключом участника.
 * Возвращает base64 строку для хранения на сервере.
 */
export async function encryptRoomKeyForMember(
    roomKey: CryptoKey,
    memberPublicKeyBase64: string
): Promise<string> {
    const rawRoomKey = await window.crypto.subtle.exportKey("raw", roomKey)
    const memberPublicKey = await importPublicKey(memberPublicKeyBase64)

    const encrypted = await window.crypto.subtle.encrypt(
        { name: "RSA-OAEP" },
        memberPublicKey,
        rawRoomKey
    )

    return arrayBufferToBase64(encrypted)
}

/**
 * Расшифровывает AES roomKey приватным ключом пользователя из IndexedDB.
 */
export async function decryptRoomKey(encryptedRoomKeyBase64: string): Promise<CryptoKey> {
    const privateKey = await loadPrivateKey()
    if (!privateKey) throw new Error("Приватный ключ не найден. Возможно, устройство не настроено.")

    const decrypted = await window.crypto.subtle.decrypt(
        { name: "RSA-OAEP" },
        privateKey,
        base64ToArrayBuffer(encryptedRoomKeyBase64)
    )

    return window.crypto.subtle.importKey(
        "raw",
        decrypted,
        { name: "AES-GCM" },
        true,
        ["encrypt", "decrypt"]
    )
}

/**
 * Шифрует текст сообщения AES-GCM ключом комнаты.
 * Возвращает { ciphertext, iv } в base64.
 */
export async function encryptMessage(
    text: string,
    roomKey: CryptoKey
): Promise<{ ciphertext: string; iv: string }> {
    const iv = window.crypto.getRandomValues(new Uint8Array(12))
    const encoded = new TextEncoder().encode(text)

    const encrypted = await window.crypto.subtle.encrypt(
        { name: "AES-GCM", iv },
        roomKey,
        encoded
    )

    return {
        ciphertext: arrayBufferToBase64(encrypted),
        iv: arrayBufferToBase64(iv.buffer),
    }
}

/**
 * Расшифровывает сообщение.
 */
export async function decryptMessage(
    ciphertextBase64: string,
    ivBase64: string,
    roomKey: CryptoKey
): Promise<string> {
    const decrypted = await window.crypto.subtle.decrypt(
        { name: "AES-GCM", iv: base64ToArrayBuffer(ivBase64) },
        roomKey,
        base64ToArrayBuffer(ciphertextBase64)
    )

    return new TextDecoder().decode(decrypted)
}

/**
 * Удаляет приватный ключ из IndexedDB (при выходе / смене аккаунта).
 */
export async function clearE2EKeys(): Promise<void> {
    await deletePrivateKey()
}