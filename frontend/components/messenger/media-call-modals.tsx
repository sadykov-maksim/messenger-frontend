"use client"

import * as React from "react"
import {
    Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import {
    Phone, PhoneOff, Video, VideoOff,
    Image as ImageIcon, Film, Music, FileText,
    Archive, Link2, Download, File,
    Mic, MicOff, PhoneCall, Volume2, ScreenShare, VolumeX, MessageSquare,
} from "lucide-react"
import { cn } from "@/lib/utils"

// ─── МОКОВЫЕ ДАННЫЕ ───────────────────────────────────────────────────────────

const MOCK_MEDIA = [
    { id: 1, type: "image", name: "photo_001.jpg",  size: "2.4 МБ", date: "Сегодня",   thumb: "from-sky-400 to-blue-500" },
    { id: 2, type: "image", name: "photo_002.png",  size: "1.1 МБ", date: "Сегодня",   thumb: "from-rose-400 to-pink-500" },
    { id: 3, type: "image", name: "screenshot.png", size: "840 КБ", date: "Вчера",      thumb: "from-violet-400 to-purple-500" },
    { id: 4, type: "image", name: "photo_003.jpg",  size: "3.2 МБ", date: "Вчера",      thumb: "from-amber-400 to-orange-500" },
    { id: 5, type: "image", name: "meme.jpg",       size: "512 КБ", date: "20 мая",     thumb: "from-emerald-400 to-teal-500" },
    { id: 6, type: "image", name: "photo_004.jpg",  size: "1.8 МБ", date: "20 мая",     thumb: "from-cyan-400 to-sky-500" },
    { id: 7, type: "video", name: "video_001.mp4",  size: "18 МБ",  date: "Вчера",      thumb: "from-slate-500 to-slate-700" },
    { id: 8, type: "video", name: "clip.mov",       size: "45 МБ",  date: "18 мая",     thumb: "from-zinc-500 to-zinc-700" },
    { id: 9, type: "audio", name: "voice_001.ogg",  size: "320 КБ", date: "Сегодня",    thumb: "from-indigo-400 to-indigo-600" },
    { id: 10, type: "audio", name: "track.mp3",     size: "6.2 МБ", date: "15 мая",     thumb: "from-fuchsia-400 to-fuchsia-600" },
]

const MOCK_DOCS = [
    { id: 1, name: "Договор_2024.pdf",        size: "1.2 МБ", date: "Сегодня",  ext: "pdf"  },
    { id: 2, name: "Презентация.pptx",         size: "8.4 МБ", date: "Вчера",    ext: "pptx" },
    { id: 3, name: "Таблица_расходов.xlsx",    size: "340 КБ", date: "20 мая",   ext: "xlsx" },
    { id: 4, name: "Техническое_задание.docx", size: "220 КБ", date: "18 мая",   ext: "docx" },
    { id: 5, name: "README.md",                size: "12 КБ",  date: "15 мая",   ext: "md"   },
]

const MOCK_ARCHIVES = [
    { id: 1, name: "project_v2.zip",    size: "24 МБ", date: "Вчера",   files: 48  },
    { id: 2, name: "backup_may.tar.gz", size: "156 МБ", date: "20 мая", files: 312 },
    { id: 3, name: "assets.rar",        size: "67 МБ", date: "15 мая",  files: 92  },
]

const MOCK_LINKS = [
    { id: 1, url: "https://github.com/org/repo",        title: "GitHub — org/repo",         date: "Сегодня" },
    { id: 2, url: "https://figma.com/file/xxx",         title: "Figma — UI Kit v3",          date: "Вчера"   },
    { id: 3, url: "https://notion.so/page/abc",         title: "Notion — Roadmap Q2",        date: "20 мая"  },
    { id: 4, url: "https://docs.google.com/spreadsheet", title: "Google Sheets — Budget",   date: "18 мая"  },
]

// ─── ВСПОМОГАТЕЛЬНЫЕ КОМПОНЕНТЫ ───────────────────────────────────────────────

const EXT_COLORS: Record<string, string> = {
    pdf:  "bg-red-100 text-red-700",
    docx: "bg-blue-100 text-blue-700",
    xlsx: "bg-green-100 text-green-700",
    pptx: "bg-orange-100 text-orange-700",
    md:   "bg-slate-100 text-slate-700",
}

function MediaTypeIcon({ type }: { type: string }) {
    if (type === "video") return <Film className="h-4 w-4 text-white/80" />
    if (type === "audio") return <Music className="h-4 w-4 text-white/80" />
    return null
}

// ─── ВКЛАДКА: МЕДИА ──────────────────────────────────────────────────────────

function MediaTab() {
    const groups = [
        { label: "Сегодня",   items: MOCK_MEDIA.filter(m => m.date === "Сегодня") },
        { label: "Вчера",     items: MOCK_MEDIA.filter(m => m.date === "Вчера")   },
        { label: "20 мая",    items: MOCK_MEDIA.filter(m => m.date === "20 мая")  },
        { label: "Остальное", items: MOCK_MEDIA.filter(m => !["Сегодня","Вчера","20 мая"].includes(m.date)) },
    ].filter(g => g.items.length > 0)

    return (
        <ScrollArea className="h-[400px]">
            <div className="space-y-4 pr-3">
                {groups.map((group) => (
                    <div key={group.label}>
                        <p className="mb-2 text-xs font-medium text-muted-foreground">{group.label}</p>
                        <div className="grid grid-cols-3 gap-1.5">
                            {group.items.map((item) => (
                                <div
                                    key={item.id}
                                    className={cn(
                                        "group relative aspect-square rounded-lg overflow-hidden cursor-pointer",
                                        `bg-gradient-to-br ${item.thumb}`
                                    )}
                                >
                                    {/* Иконка типа */}
                                    {(item.type === "video" || item.type === "audio") && (
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <MediaTypeIcon type={item.type} />
                                        </div>
                                    )}
                                    {/* Оверлей при ховере */}
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-end p-1.5 opacity-0 group-hover:opacity-100">
                                        <p className="text-[10px] text-white truncate w-full">{item.name}</p>
                                    </div>
                                    {/* Кнопка скачать */}
                                    <button
                                        className="absolute top-1 right-1 h-6 w-6 rounded-md bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
                                        title="Скачать"
                                    >
                                        <Download className="h-3 w-3 text-white" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </ScrollArea>
    )
}

// ─── ВКЛАДКА: ДОКУМЕНТЫ ──────────────────────────────────────────────────────

function DocsTab() {
    return (
        <ScrollArea className="h-[400px]">
            <div className="space-y-1.5 pr-3">
                {MOCK_DOCS.map((doc) => (
                    <div
                        key={doc.id}
                        className="group flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-muted transition-colors cursor-pointer"
                    >
                        <div className={cn(
                            "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-xs font-bold uppercase",
                            EXT_COLORS[doc.ext] ?? "bg-muted text-muted-foreground"
                        )}>
                            {doc.ext}
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium">{doc.name}</p>
                            <p className="text-xs text-muted-foreground">{doc.size} · {doc.date}</p>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                        >
                            <Download className="h-3.5 w-3.5" />
                        </Button>
                    </div>
                ))}
            </div>
        </ScrollArea>
    )
}

// ─── ВКЛАДКА: АРХИВЫ ─────────────────────────────────────────────────────────

function ArchivesTab() {
    return (
        <ScrollArea className="h-[400px]">
            <div className="space-y-1.5 pr-3">
                {MOCK_ARCHIVES.map((arc) => (
                    <div
                        key={arc.id}
                        className="group flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-muted transition-colors cursor-pointer"
                    >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
                            <Archive className="h-5 w-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium">{arc.name}</p>
                            <p className="text-xs text-muted-foreground">
                                {arc.size} · {arc.files} файлов · {arc.date}
                            </p>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                        >
                            <Download className="h-3.5 w-3.5" />
                        </Button>
                    </div>
                ))}
            </div>
        </ScrollArea>
    )
}

// ─── ВКЛАДКА: ССЫЛКИ ─────────────────────────────────────────────────────────

function LinksTab() {
    return (
        <ScrollArea className="h-[400px]">
            <div className="space-y-1.5 pr-3">
                {MOCK_LINKS.map((link) => (
                    <a
                        key={link.id}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-muted transition-colors"
                    >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
                            <Link2 className="h-5 w-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium">{link.title}</p>
                            <p className="truncate text-xs text-muted-foreground">{link.url}</p>
                        </div>
                        <Badge variant="secondary" className="shrink-0 text-[10px]">
                            {link.date}
                        </Badge>
                    </a>
                ))}
            </div>
        </ScrollArea>
    )
}

// ─── МОДАЛКА: МЕДИА И ФАЙЛЫ ──────────────────────────────────────────────────

interface MediaModalProps {
    open: boolean
    onClose: () => void
    chatName?: string
}

export function MediaModal({ open, onClose, chatName }: MediaModalProps) {
    const TABS = [
        { id: "media",    label: "Медиа",     icon: <ImageIcon className="h-3.5 w-3.5" />,  count: MOCK_MEDIA.length    },
        { id: "docs",     label: "Документы", icon: <FileText className="h-3.5 w-3.5" />,   count: MOCK_DOCS.length     },
        { id: "archives", label: "Архивы",    icon: <Archive className="h-3.5 w-3.5" />,    count: MOCK_ARCHIVES.length },
        { id: "links",    label: "Ссылки",    icon: <Link2 className="h-3.5 w-3.5" />,      count: MOCK_LINKS.length    },
    ]

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-lg p-0 gap-0 overflow-hidden">
                <DialogHeader className="px-5 pt-5 pb-0">
                    <DialogTitle className="flex items-center gap-2 text-base">
                        <File className="h-4 w-4" />
                        {chatName ? `Файлы — ${chatName}` : "Файлы и медиа"}
                    </DialogTitle>
                </DialogHeader>

                <Tabs defaultValue="media" className="mt-4">
                    <div className="px-5">
                        <TabsList className="w-full">
                            {TABS.map((tab) => (
                                <TabsTrigger
                                    key={tab.id}
                                    value={tab.id}
                                    className="flex-1 flex items-center gap-1.5 text-xs"
                                >
                                    {tab.icon}
                                    {tab.label}
                                    <span className={cn(
                                        "rounded-full px-1.5 py-0.5 text-[10px] font-medium",
                                        "bg-muted text-muted-foreground"
                                    )}>
                                        {tab.count}
                                    </span>
                                </TabsTrigger>
                            ))}
                        </TabsList>
                    </div>

                    <div className="px-5 py-4">
                        <TabsContent value="media"    className="mt-0"><MediaTab /></TabsContent>
                        <TabsContent value="docs"     className="mt-0"><DocsTab /></TabsContent>
                        <TabsContent value="archives" className="mt-0"><ArchivesTab /></TabsContent>
                        <TabsContent value="links"    className="mt-0"><LinksTab /></TabsContent>
                    </div>
                </Tabs>
            </DialogContent>
        </Dialog>
    )
}
