"use client"

import * as React from "react"
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { BellOff, ImageIcon, Download, Eraser, Trash2, BellRing } from "lucide-react"
import { cn } from "@/lib/utils"

// ─── ТИПЫ ─────────────────────────────────────────────────────────────────────

export type ChatModal =
    | "mute"
    | "wallpaper"
    | "export"
    | "clear"
    | "delete"
    | null

// ─── 1. ТИХИЙ РЕЖИМ ──────────────────────────────────────────────────────────

interface MuteModalProps {
    open: boolean
    onClose: () => void
    onConfirm: (duration: string) => void
    isMuted: boolean
}

export function MuteModal({ open, onClose, onConfirm, isMuted }: MuteModalProps) {
    const [duration, setDuration] = React.useState("1h")

    if (isMuted) {
        return (
            <Dialog open={open} onOpenChange={onClose}>
                <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <BellRing className="h-5 w-5" />
                            Включить уведомления
                        </DialogTitle>
                        <DialogDescription>
                            Уведомления от этого чата заглушены. Включить обратно?
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2">
                        <Button variant="outline" onClick={onClose}>Отмена</Button>
                        <Button onClick={() => { onConfirm("unmute"); onClose() }}>Включить</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        )
    }

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-sm">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <BellOff className="h-5 w-5" />
                        Тихий режим
                    </DialogTitle>
                    <DialogDescription>
                        Выберите, на какое время заглушить уведомления
                    </DialogDescription>
                </DialogHeader>

                <RadioGroup value={duration} onValueChange={setDuration} className="gap-3">
                    {[
                        { value: "1h",      label: "На 1 час" },
                        { value: "8h",      label: "На 8 часов" },
                        { value: "24h",     label: "На 24 часа" },
                        { value: "forever", label: "Навсегда" },
                    ].map((opt) => (
                        <Label
                            key={opt.value}
                            className={cn(
                                "flex items-center gap-3 rounded-lg border px-4 py-3 cursor-pointer transition-colors",
                                duration === opt.value
                                    ? "border-primary bg-primary/5"
                                    : "border-border hover:bg-muted"
                            )}
                        >
                            <RadioGroupItem value={opt.value} />
                            {opt.label}
                        </Label>
                    ))}
                </RadioGroup>

                <DialogFooter className="gap-2">
                    <Button variant="outline" onClick={onClose}>Отмена</Button>
                    <Button onClick={() => { onConfirm(duration); onClose() }}>
                        Заглушить
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

// ─── 2. УСТАНОВИТЬ ОБОИ ───────────────────────────────────────────────────────

const PRESET_WALLPAPERS = [
    { id: "w1", color: "from-blue-400 to-indigo-600" },
    { id: "w2", color: "from-rose-400 to-pink-600" },
    { id: "w3", color: "from-emerald-400 to-teal-600" },
    { id: "w4", color: "from-amber-400 to-orange-500" },
    { id: "w5", color: "from-violet-400 to-purple-600" },
    { id: "w6", color: "from-cyan-400 to-sky-600" },
    { id: "w7", color: "from-slate-400 to-slate-700" },
    { id: "none", color: "bg-background border-2" },
]

interface WallpaperModalProps {
    open: boolean
    onClose: () => void
    onConfirm: (wallpaper: string | null) => void
    currentWallpaper?: string | null
}

export function WallpaperModal({ open, onClose, onConfirm, currentWallpaper }: WallpaperModalProps) {
    const [selected, setSelected] = React.useState<string | null>(currentWallpaper ?? null)
    const [customUrl, setCustomUrl] = React.useState<string | null>(null)
    const fileRef = React.useRef<HTMLInputElement>(null)

    const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        const url = URL.createObjectURL(file)
        setCustomUrl(url)
        setSelected("custom")
    }

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <ImageIcon className="h-5 w-5" />
                        Обои чата
                    </DialogTitle>
                    <DialogDescription>
                        Выберите готовый фон или загрузите своё изображение
                    </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-4 gap-2">
                    {PRESET_WALLPAPERS.map((w) => (
                        <button
                            key={w.id}
                            type="button"
                            onClick={() => setSelected(w.id)}
                            className={cn(
                                "relative aspect-square rounded-xl overflow-hidden transition-all",
                                w.id === "none"
                                    ? "bg-muted border-2 border-dashed"
                                    : `bg-gradient-to-br ${w.color}`,
                                selected === w.id && "ring-2 ring-primary ring-offset-2"
                            )}
                        >
                            {w.id === "none" && (
                                <span className="absolute inset-0 flex items-center justify-center text-xs text-muted-foreground">
                                    Нет
                                </span>
                            )}
                        </button>
                    ))}

                    {/* Кастомное изображение */}
                    <button
                        type="button"
                        onClick={() => fileRef.current?.click()}
                        className={cn(
                            "relative aspect-square rounded-xl overflow-hidden border-2 border-dashed transition-all hover:border-primary",
                            selected === "custom" && "ring-2 ring-primary ring-offset-2"
                        )}
                        style={customUrl ? { backgroundImage: `url(${customUrl})`, backgroundSize: "cover" } : {}}
                    >
                        {!customUrl && (
                            <span className="absolute inset-0 flex items-center justify-center text-xs text-muted-foreground">
                                +
                            </span>
                        )}
                    </button>
                    <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
                </div>

                <DialogFooter className="gap-2">
                    <Button variant="outline" onClick={onClose}>Отмена</Button>
                    <Button onClick={() => {
                        onConfirm(selected === "custom" ? customUrl : selected === "none" ? null : selected)
                        onClose()
                    }}>
                        Применить
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

// ─── 3. ЭКСПОРТ ЧАТА ─────────────────────────────────────────────────────────

interface ExportModalProps {
    open: boolean
    onClose: () => void
    onConfirm: (format: string, includeMedia: boolean) => void
}

export function ExportModal({ open, onClose, onConfirm }: ExportModalProps) {
    const [format, setFormat] = React.useState("txt")
    const [includeMedia, setIncludeMedia] = React.useState(false)

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-sm">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Download className="h-5 w-5" />
                        Экспорт чата
                    </DialogTitle>
                    <DialogDescription>
                        Выберите формат для сохранения переписки
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    <RadioGroup value={format} onValueChange={setFormat} className="gap-3">
                        {[
                            { value: "txt",  label: "Текстовый файл (.txt)",   desc: "Только текст" },
                            { value: "json", label: "JSON (.json)",             desc: "Структурированные данные" },
                            { value: "html", label: "HTML (.html)",             desc: "С форматированием" },
                        ].map((opt) => (
                            <Label
                                key={opt.value}
                                className={cn(
                                    "flex items-start gap-3 rounded-lg border px-4 py-3 cursor-pointer transition-colors",
                                    format === opt.value
                                        ? "border-primary bg-primary/5"
                                        : "border-border hover:bg-muted"
                                )}
                            >
                                <RadioGroupItem value={opt.value} className="mt-0.5" />
                                <div>
                                    <div className="text-sm font-medium">{opt.label}</div>
                                    <div className="text-xs text-muted-foreground">{opt.desc}</div>
                                </div>
                            </Label>
                        ))}
                    </RadioGroup>

                    <Label className={cn(
                        "flex items-center gap-3 rounded-lg border px-4 py-3 cursor-pointer transition-colors",
                        includeMedia ? "border-primary bg-primary/5" : "border-border hover:bg-muted"
                    )}>
                        <input
                            type="checkbox"
                            checked={includeMedia}
                            onChange={(e) => setIncludeMedia(e.target.checked)}
                            className="rounded"
                        />
                        <div>
                            <div className="text-sm font-medium">Включить медиафайлы</div>
                            <div className="text-xs text-muted-foreground">Фото, видео, документы</div>
                        </div>
                    </Label>
                </div>

                <DialogFooter className="gap-2">
                    <Button variant="outline" onClick={onClose}>Отмена</Button>
                    <Button onClick={() => { onConfirm(format, includeMedia); onClose() }}>
                        Скачать
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

// ─── 4. ОЧИСТИТЬ ИСТОРИЮ ─────────────────────────────────────────────────────

interface ClearHistoryModalProps {
    open: boolean
    onClose: () => void
    onConfirm: () => void
}

export function ClearHistoryModal({ open, onClose, onConfirm }: ClearHistoryModalProps) {
    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-sm">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Eraser className="h-5 w-5" />
                        Очистить историю
                    </DialogTitle>
                    <DialogDescription>
                        Все сообщения будут удалены только у вас. Собеседник по-прежнему видит переписку.
                    </DialogDescription>
                </DialogHeader>

                <div className="rounded-lg bg-muted/50 px-4 py-3 text-sm text-muted-foreground">
                    ⚠️ Это действие нельзя отменить
                </div>

                <DialogFooter className="gap-2">
                    <Button variant="outline" onClick={onClose}>Отмена</Button>
                    <Button
                        variant="destructive"
                        onClick={() => { onConfirm(); onClose() }}
                    >
                        Очистить
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

// ─── 5. УДАЛИТЬ ЧАТ ──────────────────────────────────────────────────────────

interface DeleteChatModalProps {
    open: boolean
    onClose: () => void
    onConfirm: (alsoForPartner: boolean) => void
    chatName?: string
}

export function DeleteChatModal({ open, onClose, onConfirm, chatName }: DeleteChatModalProps) {
    const [alsoForPartner, setAlsoForPartner] = React.useState(false)

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-sm">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-destructive">
                        <Trash2 className="h-5 w-5" />
                        Удалить чат
                    </DialogTitle>
                    <DialogDescription>
                        {chatName
                            ? `Вы уверены, что хотите удалить чат с «${chatName}»?`
                            : "Вы уверены, что хотите удалить этот чат?"}
                    </DialogDescription>
                </DialogHeader>

                <Label className={cn(
                    "flex items-start gap-3 rounded-lg border px-4 py-3 cursor-pointer transition-colors",
                    alsoForPartner ? "border-destructive/50 bg-destructive/5" : "border-border hover:bg-muted"
                )}>
                    <input
                        type="checkbox"
                        checked={alsoForPartner}
                        onChange={(e) => setAlsoForPartner(e.target.checked)}
                        className="mt-0.5 rounded"
                    />
                    <div>
                        <div className="text-sm font-medium">Удалить у обоих</div>
                        <div className="text-xs text-muted-foreground">
                            Чат исчезнет и у собеседника
                        </div>
                    </div>
                </Label>

                <DialogFooter className="gap-2">
                    <Button variant="outline" onClick={onClose}>Отмена</Button>
                    <Button
                        variant="destructive"
                        onClick={() => { onConfirm(alsoForPartner); onClose() }}
                    >
                        Удалить
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

// ─── ГЛАВНЫЙ КОМПОНЕНТ: всё вместе ───────────────────────────────────────────

interface ChatActionsModalsProps {
    open: ChatModal
    onClose: () => void
    chatName?: string
    isMuted?: boolean
    onMute?: (duration: string) => void
    onWallpaper?: (wallpaper: string | null) => void
    onExport?: (format: string, includeMedia: boolean) => void
    onClearHistory?: () => void
    onDeleteChat?: (alsoForPartner: boolean) => void
}

export function ChatActionsModals({
                                      open,
                                      onClose,
                                      chatName,
                                      isMuted = false,
                                      onMute = () => {},
                                      onWallpaper = () => {},
                                      onExport = () => {},
                                      onClearHistory = () => {},
                                      onDeleteChat = () => {},
                                  }: ChatActionsModalsProps) {
    return (
        <>
            <MuteModal
                open={open === "mute"}
                onClose={onClose}
                onConfirm={onMute}
                isMuted={isMuted}
            />
            <WallpaperModal
                open={open === "wallpaper"}
                onClose={onClose}
                onConfirm={onWallpaper}
            />
            <ExportModal
                open={open === "export"}
                onClose={onClose}
                onConfirm={onExport}
            />
            <ClearHistoryModal
                open={open === "clear"}
                onClose={onClose}
                onConfirm={onClearHistory}
            />
            <DeleteChatModal
                open={open === "delete"}
                onClose={onClose}
                onConfirm={onDeleteChat}
                chatName={chatName}
            />
        </>
    )
}