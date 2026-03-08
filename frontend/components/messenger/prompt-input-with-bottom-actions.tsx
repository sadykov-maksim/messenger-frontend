"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Textarea } from "@/components/ui/textarea";
import { Icon } from "@iconify/react";
import { cn } from "@/lib/utils";
import { useWs } from "@/components/ws-provider";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { useUploadAttachmentMutation } from "@/services/messenger";
import { EmojiPickerTrigger } from "@/components/messenger/emoji-picker";

// ─── Types ────────────────────────────────────────────────────────────────────

type AttachedFile = {
    id: string;
    file: File;
    preview?: string;
};

type InputMode = "text" | "voice";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function formatDuration(seconds: number): string {
    const m = Math.floor(seconds / 60)
        .toString()
        .padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
}

// ─── File Preview Modal ───────────────────────────────────────────────────────

function FilePreviewModal({
                              file,
                              open,
                              onClose,
                          }: {
    file: AttachedFile | null;
    open: boolean;
    onClose: () => void;
}) {
    if (!file) return null;
    const isImage = !!file.preview;
    const ext = file.file.name.split(".").pop()?.toUpperCase() ?? "FILE";

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle className="truncate text-sm font-medium">
                        {file.file.name}
                    </DialogTitle>
                </DialogHeader>
                <div className="flex flex-col items-center gap-4">
                    {isImage ? (
                        <img
                            src={file.preview}
                            alt={file.file.name}
                            className="max-h-[360px] w-full rounded-xl object-contain bg-muted"
                        />
                    ) : (
                        <div className="flex h-40 w-40 flex-col items-center justify-center rounded-2xl border bg-muted gap-3">
                            <Icon icon="lucide:file" className="text-5xl text-muted-foreground" />
                            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                                {ext}
                            </span>
                        </div>
                    )}
                    <div className="w-full rounded-lg border bg-muted/40 px-4 py-3 flex flex-col gap-1.5 text-sm">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Тип файла</span>
                            <span className="font-medium">{file.file.type || "Неизвестно"}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Размер</span>
                            <span className="font-medium">{formatSize(file.file.size)}</span>
                        </div>
                        {isImage && (
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Расширение</span>
                                <span className="font-medium">.{file.file.name.split(".").pop()}</span>
                            </div>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

// ─── Voice Recorder UI ────────────────────────────────────────────────────────

function VoiceRecorderPanel({
                                isRecording,
                                duration,
                                voiceBlob,
                                onPointerDown,
                                onPointerUp,
                                onCancel,
                                onSend,
                                onSwitchToText,
                                chatStatus,
                            }: {
    isRecording: boolean;
    duration: number;
    voiceBlob: Blob | null;
    onPointerDown: () => void;
    onPointerUp: () => void;
    onCancel: () => void;
    onSend: () => void;
    onSwitchToText: () => void;
    chatStatus: string;
}) {
    // Состояние: idle | recording | recorded
    const state = isRecording ? "recording" : voiceBlob ? "recorded" : "idle";

    return (
        <div className="flex w-full flex-col rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors overflow-hidden">
            <div className="flex items-center justify-between px-4 py-4 gap-3">

                {/* Left: switch back to text */}
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-10 w-10 shrink-0 border-2 border-primary text-primary hover:bg-primary/10 rounded-xl"
                                onClick={onSwitchToText}
                            >
                                <Icon icon="lucide:message-square" width={20} />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Переключиться на текст</TooltipContent>
                    </Tooltip>
                </TooltipProvider>

                {/* Center */}
                <div className="flex flex-1 items-center justify-center gap-3">
                    {/* Center */}
                    <div className="flex flex-1 items-center justify-center gap-3">
                        {state === "recording" && (
                            <span className="flex items-center gap-2 text-sm font-mono font-medium tabular-nums text-destructive">
                                <span className="relative flex h-2 w-2">
                                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-destructive opacity-75" />
                                    <span className="relative inline-flex h-2 w-2 rounded-full bg-destructive" />
                                </span>
                                {formatDuration(duration)}
                            </span>
                        )}

                        {state === "recorded" && (
                            <span className="flex items-center gap-2 text-sm font-mono font-medium tabular-nums text-primary">
                                <Icon
                                    icon="lucide:audio-waveform"
                                    width={16}
                                    className="text-primary shrink-0"
                                />
                                {formatDuration(duration)}
                            </span>
                        )}

                        {state === "idle" && (
                            <span className="flex items-center gap-1 text-sm sm:text-md text-muted-foreground">
                                <span className="hidden sm:inline">
                                    Удерживайте
                                </span>
                                {/* Mobile */}
                                <span className="sm:hidden">
                                    Удерживайте
                                </span>
                                <Icon icon="lucide:mic" width={14}  className="text-destructive sm:w-[16px] sm:h-[16px]" />
                                <span className="hidden sm:inline">
                                    чтобы начать запись
                                </span>

                                {/* Mobile */}
                                <span className="sm:hidden">
                                    для записи
                                </span>
                            </span>
                        )}
                    </div>
                </div>

                {/* Right */}
                <div className="flex items-center gap-3 shrink-0">
                    {state === "recorded" && (
                        <>
                            {/* Delete */}
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="h-9 w-9 text-muted-foreground hover:text-destructive"
                                            onClick={onCancel}
                                        >
                                            <Icon icon="lucide:trash-2" width={17} />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Удалить запись</TooltipContent>
                                </Tooltip>
                            </TooltipProvider>

                            {/* Send */}
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            type="button"
                                            size="icon"
                                            className="h-10 w-10 rounded-lg bg-primary text-primary-foreground"
                                            onClick={onSend}
                                        >
                                            <Icon icon="solar:arrow-up-linear" width={20} className="[&>path]:stroke-[2px]" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Отправить</TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </>
                    )}

                    {/* Hold-to-record button (idle + recording) */}
                    {state !== "recorded" && (
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        type="button"
                                        size="icon"
                                        variant="ghost"
                                        disabled={chatStatus !== "open"}
                                        className={cn(
                                            "h-10 w-10 rounded-full border border-destructive select-none",
                                            state === "recording" && "animate-pulse bg-destructive/10"
                                        )}
                                        onPointerDown={onPointerDown}
                                        onPointerUp={onPointerUp}
                                        onPointerLeave={onPointerUp}  // если палец/курсор ушёл
                                    >
                                        <Icon
                                            icon="lucide:mic"
                                            width={20}
                                            className={cn(
                                                "transition-colors",
                                                state === "recording" ? "text-destructive" : "text-destructive"
                                            )}
                                        />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    {state === "recording" ? "Отпустите для завершения" : "Удерживайте для записи"}
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    )}
                </div>
            </div>
        </div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function PromptInputWithBottomActions({
                                                         chatId,
                                                         onSent,
                                                     }: {
    chatId: string;
    onSent?: () => void;
}) {
    const [prompt, setPrompt] = React.useState<string>("");
    const [sending, setSending] = React.useState(false);
    const [attachedFiles, setAttachedFiles] = React.useState<AttachedFile[]>([]);
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const { chatStatus, setActiveChatId, sendChatMessage, sendTyping, typingUsers } = useWs();
    const [previewFile, setPreviewFile] = React.useState<AttachedFile | null>(null);
    const [uploadAttachment] = useUploadAttachmentMutation();
    const [pickMode, setPickMode] = React.useState<"any" | "image">("any");

    // ── Voice state ──────────────────────────────────────────────────────────
    const [inputMode, setInputMode] = React.useState<InputMode>("text");
    const [isRecording, setIsRecording] = React.useState(false);
    const [recordDuration, setRecordDuration] = React.useState(0);
    const mediaRecorderRef = React.useRef<MediaRecorder | null>(null);
    const audioChunksRef = React.useRef<Blob[]>([]);
    const durationTimerRef = React.useRef<ReturnType<typeof setInterval> | null>(null);
    const [voiceBlob, setVoiceBlob] = React.useState<Blob | null>(null);

    React.useEffect(() => {
        setActiveChatId(chatId);
    }, [chatId, setActiveChatId]);

    const canSend =
        (prompt.trim().length > 0 || attachedFiles.length > 0) &&
        !sending &&
        chatStatus === "open";

    const MAX_FILES = 10;
    const MAX_TOTAL_SIZE = 69 * 1024 * 1024;

    // ── File handling ────────────────────────────────────────────────────────

    const handleFiles = (files: FileList | null) => {
        if (!files) return;

        const imageFiles = Array.from(files).filter(f => f.type.startsWith("image/"));
        const otherFiles = Array.from(files).filter(f => !f.type.startsWith("image/"));

        const currentImages = attachedFiles.filter(f => f.preview).length;
        const allowedImages = Math.max(0, 10 - currentImages);

        const filesToAdd = [
            ...imageFiles.slice(0, allowedImages),
            ...otherFiles,
        ];

        const currentCount = attachedFiles.length;
        const allowedCount = MAX_FILES - currentCount;

        if (filesToAdd.length > allowedCount) {
            toast.error(`Можно прикрепить не более ${MAX_FILES} файлов`);
            filesToAdd.splice(allowedCount);
        }

        const currentSize = attachedFiles.reduce((sum, f) => sum + f.file.size, 0);
        let accumulatedSize = currentSize;
        const sizeChecked: typeof filesToAdd = [];

        for (const file of filesToAdd) {
            if (accumulatedSize + file.size > MAX_TOTAL_SIZE) {
                toast.error(`Общий размер файлов не должен превышать 69 МБ`);
                break;
            }
            accumulatedSize += file.size;
            sizeChecked.push(file);
        }

        if (imageFiles.length > allowedImages) {
            toast.error(`Можно прикрепить не более 10 изображений`);
        }

        const newFiles: AttachedFile[] = sizeChecked.map((file) => {
            const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
            const preview = file.type.startsWith("image/")
                ? URL.createObjectURL(file)
                : undefined;
            return { id, file, preview };
        });

        setAttachedFiles((prev) => [...prev, ...newFiles]);
    };

    const removeFile = (id: string) => {
        setAttachedFiles((prev) => {
            const file = prev.find((f) => f.id === id);
            if (file?.preview) URL.revokeObjectURL(file.preview);
            return prev.filter((f) => f.id !== id);
        });
    };

    // ── Voice recording ──────────────────────────────────────────────────────

    const startRecording = async () => {
        if (chatStatus !== "open") return;
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
                ? "audio/webm;codecs=opus"
                : MediaRecorder.isTypeSupported("audio/webm")
                    ? "audio/webm"
                    : "audio/ogg";

            const recorder = new MediaRecorder(stream, { mimeType });
            audioChunksRef.current = [];

            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) audioChunksRef.current.push(e.data);
            };

            recorder.start(200);
            mediaRecorderRef.current = recorder;
            setIsRecording(true);
            setRecordDuration(0);
            setVoiceBlob(null); // сбрасываем предыдущий blob

            durationTimerRef.current = setInterval(() => {
                setRecordDuration((d) => d + 1);
            }, 1000);
        } catch {
            toast.error("Не удалось получить доступ к микрофону");
        }
    };

    const handlePointerUp = async () => {
        if (!isRecording) return;
        const blob = await stopRecording();
        if (blob && blob.size >= 1000) {
            setVoiceBlob(blob);
        } else {
            toast.error("Запись слишком короткая");
            setVoiceBlob(null);
        }
    };

    const stopRecording = (): Promise<Blob | null> =>
        new Promise((resolve) => {
            const recorder = mediaRecorderRef.current;
            if (!recorder) return resolve(null);

            recorder.onstop = () => {
                const blob = new Blob(audioChunksRef.current, {
                    type: recorder.mimeType,
                });
                // Stop all tracks to release mic
                recorder.stream.getTracks().forEach((t) => t.stop());
                resolve(blob);
            };

            recorder.stop();
            if (durationTimerRef.current) clearInterval(durationTimerRef.current);
            setIsRecording(false);
        });

    const cancelRecording = async () => {
        if (isRecording) await stopRecording();
        audioChunksRef.current = [];
        setRecordDuration(0);
        setVoiceBlob(null);
    };

    const sendVoiceMessage = async () => {
        const blob = voiceBlob;
        if (!blob) return;

        setSending(true);
        try {
            const ext = blob.type.includes("ogg") ? "ogg" : "webm";
            const file = new File([blob], `voice_${Date.now()}.${ext}`, { type: blob.type });

            const formData = new FormData();
            formData.append("file", file, file.name);

            const uploaded = await uploadAttachment(formData).unwrap();
            sendChatMessage("", [uploaded.id]);
            onSent?.();
            setVoiceBlob(null);
            setRecordDuration(0);
        } catch {
            toast.error("Ошибка отправки голосового сообщения");
        } finally {
            setSending(false);
        }
    };

    const switchToVoice = () => {
        setInputMode("voice");
    };

    const switchToText = async () => {
        if (isRecording) await cancelRecording();
        setInputMode("text");
    };

    // ── Text send ────────────────────────────────────────────────────────────

    const typingTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

    const send = async () => {
        const value = prompt.trim();
        if ((!value && attachedFiles.length === 0) || sending) return;
        if (chatStatus !== "open") return;

        if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
        sendTyping(false);

        setSending(true);

        try {
            const attachmentIds: number[] = [];

            for (const f of attachedFiles) {
                const formData = new FormData();
                formData.append("file", f.file, f.file.name);
                const uploaded = await uploadAttachment(formData).unwrap();
                attachmentIds.push(uploaded.id);
            }

            sendChatMessage(value, attachmentIds);
            attachedFiles.forEach((f) => f.preview && URL.revokeObjectURL(f.preview));
            setPrompt("");
            setAttachedFiles([]);
            onSent?.();
        } catch {
            toast.error("Ошибка загрузки файлов");
        } finally {
            setSending(false);
        }
    };

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        void send();
    };

    const openPicker = (mode: "any" | "image") => {
        setPickMode(mode);
        setTimeout(() => fileInputRef.current?.click(), 0);
    };

    // ── Render ───────────────────────────────────────────────────────────────

    if (inputMode === "voice") {
        return (
            <div className="flex w-full flex-col gap-4">
                {typingUsers.length > 0 && (
                    <TypingIndicator typingUsers={typingUsers} />
                )}
                <VoiceRecorderPanel
                    isRecording={isRecording}
                    duration={recordDuration}
                    voiceBlob={voiceBlob}
                    onPointerDown={startRecording}
                    onPointerUp={handlePointerUp}
                    onCancel={cancelRecording}
                    onSend={sendVoiceMessage}
                    onSwitchToText={switchToText}
                    chatStatus={chatStatus}
                />
            </div>
        );
    }

    return (
        <div className="flex w-full flex-col gap-4">
            <FilePreviewModal
                file={previewFile}
                open={!!previewFile}
                onClose={() => setPreviewFile(null)}
            />

            {typingUsers.length > 0 && (
                <TypingIndicator typingUsers={typingUsers} />
            )}

            <form
                onSubmit={onSubmit}
                className="flex w-full flex-col items-start rounded-lg bg-muted/50 transition-colors hover:bg-muted/70"
            >
                {/* Attached files preview */}
                {attachedFiles.length > 0 && (
                    <div className="flex flex-wrap gap-2 px-4 pt-3 pb-3">
                        {attachedFiles.map((f) => (
                            <div key={f.id} className="relative group">
                                {f.preview ? (
                                    <div
                                        className="relative h-16 w-16 rounded-lg overflow-hidden border cursor-pointer"
                                        onClick={() => setPreviewFile(f)}
                                    >
                                        <img
                                            src={f.preview}
                                            alt={f.file.name}
                                            className="h-full w-full object-cover"
                                        />
                                    </div>
                                ) : (
                                    <div
                                        className="flex items-center gap-1.5 rounded-lg border bg-background px-2 py-1.5 text-xs max-w-[140px] cursor-pointer"
                                        onClick={() => setPreviewFile(f)}
                                    >
                                        <Icon icon="lucide:file" className="shrink-0 text-muted-foreground" />
                                        <span className="truncate">{f.file.name}</span>
                                    </div>
                                )}
                                <button
                                    type="button"
                                    onClick={() => removeFile(f.id)}
                                    className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-destructive text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <Icon icon="lucide:x" width={10} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                <div className="relative w-full">
                    <Textarea
                        className="min-h-[100px] resize-none border-0 bg-transparent px-4 py-3 pr-12 text-base shadow-none focus-visible:ring-0"
                        placeholder={chatStatus === "open" ? "Type your message..." : "Connecting..."}
                        value={prompt}
                        maxLength={2000}
                        onChange={(e) => {
                            setPrompt(e.target.value);
                            sendTyping(true);
                            if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
                            typingTimerRef.current = setTimeout(() => sendTyping(false), 3000);
                        }}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                void send();
                            }
                        }}
                        onPaste={(e) => {
                            const items = e.clipboardData?.items;
                            if (!items) return;
                            const files = Array.from(items)
                                .filter((i) => i.kind === "file")
                                .map((i) => i.getAsFile())
                                .filter(Boolean) as File[];
                            if (files.length > 0) {
                                const dt = new DataTransfer();
                                files.forEach((f) => dt.items.add(f));
                                handleFiles(dt.files);
                            }
                        }}
                    />

                    {/* Emoji button */}
                    <div className="absolute left-2 bottom-2 sm:left-3 sm:bottom-3">
                        <EmojiPickerTrigger onSelect={(emoji) => setPrompt((prev) => prev + emoji)} />
                    </div>

                    {/* Send / Voice toggle */}
                    <div
                        className={cn(
                            "absolute right-2 bottom-2 sm:right-3 sm:bottom-3",
                            "pb-[env(safe-area-inset-bottom)]",
                            "flex items-center gap-1.5"
                        )}
                    >
                        {/* Show mic button only when prompt is empty and no files attached */}
                        {!prompt.trim() && attachedFiles.length === 0 && (
                            <div className="hidden sm:block">
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                type="button"
                                                size="icon"
                                                variant="ghost"
                                                className="h-10 w-10 rounded-lg text-muted-foreground hover:text-foreground"
                                                onClick={switchToVoice}
                                            >
                                                <Icon icon="lucide:mic" width={18} />
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>Записать голосовое</TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </div>
                        )}

                        {/* Desktop send */}
                        <div className="hidden sm:block">
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            type="submit"
                                            size="icon"
                                            className={cn(
                                                "h-10 w-10 rounded-lg",
                                                !canSend
                                                    ? "bg-secondary text-secondary-foreground"
                                                    : "bg-primary text-primary-foreground"
                                            )}
                                            disabled={!canSend}
                                        >
                                            {sending ? (
                                                <Icon
                                                    icon="lucide:loader-2"
                                                    width={20}
                                                    className="animate-spin"
                                                />
                                            ) : (
                                                <Icon
                                                    icon="solar:arrow-up-linear"
                                                    width={20}
                                                    className={cn(
                                                        "[&>path]:stroke-[2px]",
                                                        !canSend ? "text-muted-foreground" : ""
                                                    )}
                                                />
                                            )}
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>
                                            {chatStatus !== "open"
                                                ? "WebSocket not connected"
                                                : sending && attachedFiles.length > 0
                                                    ? "Загрузка файлов..."
                                                    : sending
                                                        ? "Отправка..."
                                                        : "Send message"}
                                        </p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>

                        {/* Mobile send */}
                        <div className="sm:hidden">
                            <Button
                                type="submit"
                                size="icon"
                                className={cn(
                                    "h-11 w-11 rounded-xl",
                                    !canSend
                                        ? "bg-secondary text-secondary-foreground"
                                        : "bg-primary text-primary-foreground"
                                )}
                                disabled={!canSend}
                            >
                                <Icon
                                    className={cn(
                                        "[&>path]:stroke-[2px]",
                                        !canSend ? "text-muted-foreground" : ""
                                    )}
                                    icon="solar:arrow-up-linear"
                                    width={20}
                                />
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Bottom bar */}
                <div className="flex w-full items-center justify-between gap-2 overflow-x-auto px-4 pb-2 pt-2">
                    <div className="flex gap-2 items-center">
                        {/* Attach file */}
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        className="flex items-center gap-2 h-8 px-3 text-muted-foreground hover:text-foreground border"
                                        onClick={() => openPicker("any")}
                                    >
                                        <Icon icon="lucide:paperclip" width={16} />
                                        <span className="text-sm">Прикрепить файл</span>
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Прикрепить файл</TooltipContent>
                            </Tooltip>
                        </TooltipProvider>

                        {/* Switch to voice (mobile — bottom bar) */}
                        <div className="sm:hidden">
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            className="flex items-center gap-2 h-8 px-3 text-muted-foreground hover:text-foreground border"
                                            onClick={switchToVoice}
                                        >
                                            <Icon icon="lucide:mic" width={16} />
                                            <span className="text-sm">Голосовое</span>
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Записать голосовое</TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                    </div>

                    <p className="whitespace-nowrap py-3 text-xs text-muted-foreground">
                        {prompt.length}/2000
                    </p>
                </div>

                <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept={pickMode === "image" ? "image/*" : "*/*"}
                    className="hidden"
                    onChange={(e) => {
                        handleFiles(e.target.files);
                        e.currentTarget.value = "";
                    }}
                />
            </form>
        </div>
    );
}

// ─── Typing Indicator (extracted) ─────────────────────────────────────────────

function TypingIndicator({ typingUsers }: { typingUsers: string[] }) {
    return (
        <div className="flex items-center gap-2 px-1 text-xs text-muted-foreground">
            <span className="flex gap-0.5 items-end h-3">
                {[0, 1, 2].map((i) => (
                    <span
                        key={i}
                        className="inline-block w-1 h-1 rounded-full bg-muted-foreground animate-bounce"
                        style={{ animationDelay: `${i * 150}ms` }}
                    />
                ))}
            </span>
            <span>
                {typingUsers.length === 1
                    ? `${typingUsers[0]} печатает...`
                    : `${typingUsers.join(", ")} печатают...`}
            </span>
        </div>
    );
}