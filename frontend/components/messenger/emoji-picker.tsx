"use client"

import * as React from "react"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Smile } from "lucide-react"
import { cn } from "@/lib/utils"

// ─── Категории и эмодзи ───────────────────────────────────────────────────────

const CATEGORIES = [
    {
        id: "recent",
        label: "Недавние",
        icon: "🕐",
        emojis: [] as string[], // заполняется динамически
    },
    {
        id: "smileys",
        label: "Смайлы",
        icon: "😀",
        emojis: [
            "😀","😃","😄","😁","😆","😅","🤣","😂","🙂","🙃",
            "😉","😊","😇","🥰","😍","🤩","😘","😗","😚","😙",
            "🥲","😋","😛","😜","🤪","😝","🤑","🤗","🤭","🤫",
            "🤔","🤐","🤨","😐","😑","😶","😏","😒","🙄","😬",
            "🤥","😌","😔","😪","🤤","😴","😷","🤒","🤕","🤢",
            "🤮","🤧","🥵","🥶","🥴","😵","🤯","🤠","🥳","🥸",
            "😎","🤓","🧐","😕","😟","🙁","😮","😯","😲","😳",
            "🥺","😦","😧","😨","😰","😥","😢","😭","😱","😖",
            "😣","😞","😓","😩","😫","🥱","😤","😡","😠","🤬",
        ],
    },
    {
        id: "gestures",
        label: "Жесты",
        icon: "👋",
        emojis: [
            "👋","🤚","🖐","✋","🖖","👌","🤌","🤏","✌","🤞",
            "🤟","🤘","🤙","👈","👉","👆","🖕","👇","☝","👍",
            "👎","✊","👊","🤛","🤜","👏","🙌","👐","🤲","🤝",
            "🙏","✍","💅","🤳","💪","🦾","🦵","🦶","👂","🦻",
            "👃","🫀","🫁","🧠","🦷","🦴","👀","👁","👅","👄",
        ],
    },
    {
        id: "people",
        label: "Люди",
        icon: "👤",
        emojis: [
            "👶","🧒","👦","👧","🧑","👱","👨","🧔","👩","🧓",
            "👴","👵","🙍","🙎","🙅","🙆","💁","🙋","🧏","🙇",
            "🤦","🤷","👮","🕵","💂","🥷","👷","🤴","👸","👰",
            "🤵","🎅","🤶","🧑‍🎄","🦸","🦹","🧙","🧝","🧛","🧟",
        ],
    },
    {
        id: "animals",
        label: "Животные",
        icon: "🐶",
        emojis: [
            "🐶","🐱","🐭","🐹","🐰","🦊","🐻","🐼","🐨","🐯",
            "🦁","🐮","🐷","🐸","🐵","🙈","🙉","🙊","🐔","🐧",
            "🐦","🐤","🦆","🦅","🦉","🦇","🐺","🐗","🐴","🦄",
            "🐝","🐛","🦋","🐌","🐞","🐜","🦟","🦗","🕷","🦂",
            "🐢","🐍","🦎","🦖","🦕","🐙","🦑","🦐","🦞","🦀",
        ],
    },
    {
        id: "food",
        label: "Еда",
        icon: "🍕",
        emojis: [
            "🍎","🍊","🍋","🍇","🍓","🫐","🍈","🍒","🍑","🥭",
            "🍍","🥥","🥝","🍅","🍆","🥑","🥦","🥬","🥒","🌶",
            "🫑","🧄","🧅","🥔","🍠","🥐","🥯","🍞","🥖","🧀",
            "🥚","🍳","🧈","🥞","🧇","🥓","🥩","🍗","🍖","🦴",
            "🌭","🍔","🍟","🍕","🫓","🥪","🥙","🧆","🌮","🌯",
            "🫔","🥗","🥘","🫕","🥫","🍝","🍜","🍲","🍛","🍣",
            "🍱","🥟","🦪","🍤","🍙","🍘","🍥","🥮","🍢","🧁",
            "🍰","🎂","🍮","🍭","🍬","🍫","🍿","🍩","🍪","🌰",
        ],
    },
    {
        id: "travel",
        label: "Путешествия",
        icon: "✈️",
        emojis: [
            "🚗","🚕","🚙","🚌","🚎","🏎","🚓","🚑","🚒","🚐",
            "🛻","🚚","🚛","🚜","🏍","🛵","🛺","🚲","🛴","🛹",
            "🚏","✈","🛫","🛬","🛩","💺","🚀","🛸","🚁","🛶",
            "⛵","🚤","🛥","🛳","⛴","🚢","⚓","🪝","⛽","🚧",
            "🗺","🧭","🏔","⛰","🌋","🗻","🏕","🏖","🏜","🏝",
        ],
    },
    {
        id: "objects",
        label: "Объекты",
        icon: "💡",
        emojis: [
            "⌚","📱","💻","⌨","🖥","🖨","🖱","🖲","💾","💿",
            "📷","📸","📹","🎥","📽","🎞","📞","☎","📟","📠",
            "📺","📻","🧭","⏱","⏰","⏲","⌛","⏳","📡","🔋",
            "🔌","💡","🔦","🕯","🪔","🧱","🪟","🛒","🛍","🎁",
            "🎀","🎊","🎉","🎈","🎏","🎐","🧧","🎑","🎃","🎄",
        ],
    },
    {
        id: "symbols",
        label: "Символы",
        icon: "❤️",
        emojis: [
            "❤","🧡","💛","💚","💙","💜","🖤","🤍","🤎","💔",
            "❣","💕","💞","💓","💗","💖","💘","💝","💟","☮",
            "✝","☪","🕉","☸","✡","🔯","🕎","☯","☦","🛐",
            "⛎","♈","♉","♊","♋","♌","♍","♎","♏","♐",
            "♑","♒","♓","🆔","⚛","🉑","☢","☣","📴","📳",
            "🈶","🈚","🈸","🈺","🈷","✴","🆚","💮","🉐","㊙",
            "㊗","🈴","🈵","🈹","🈲","🅰","🅱","🆎","🆑","🅾",
        ],
    },
] as const

type CategoryId = (typeof CATEGORIES)[number]["id"]

// ─── Хук: недавние эмодзи ──────────────────────────────────────────────────────

const RECENT_KEY = "emoji_picker_recent"
const MAX_RECENT = 32

function getRecent(): string[] {
    if (typeof window === "undefined") return []
    try {
        return JSON.parse(localStorage.getItem(RECENT_KEY) ?? "[]")
    } catch {
        return []
    }
}

function addRecent(emoji: string) {
    const prev = getRecent().filter((e) => e !== emoji)
    localStorage.setItem(RECENT_KEY, JSON.stringify([emoji, ...prev].slice(0, MAX_RECENT)))
}

// ─── EmojiGrid ────────────────────────────────────────────────────────────────

interface EmojiGridProps {
    emojis: string[]
    onSelect: (emoji: string) => void
    hovered: string | null
    setHovered: (e: string | null) => void
}

function EmojiGrid({ emojis, onSelect, hovered, setHovered }: EmojiGridProps) {
    if (emojis.length === 0) {
        return (
            <div className="flex h-24 items-center justify-center text-sm text-muted-foreground">
                Ничего не найдено
            </div>
        )
    }
    return (
        <div className="grid grid-cols-8 gap-0.5">
            {emojis.map((emoji) => (
                <button
                    key={emoji}
                    type="button"
                    onClick={() => onSelect(emoji)}
                    onMouseEnter={() => setHovered(emoji)}
                    onMouseLeave={() => setHovered(null)}
                    className={cn(
                        "flex h-9 w-9 items-center justify-center rounded-md text-xl transition-colors",
                        hovered === emoji ? "bg-accent" : "hover:bg-accent"
                    )}
                >
                    {emoji}
                </button>
            ))}
        </div>
    )
}

// ─── EmojiPicker ──────────────────────────────────────────────────────────────

interface EmojiPickerProps {
    onSelect: (emoji: string) => void
}

export function EmojiPicker({ onSelect }: EmojiPickerProps) {
    const [search, setSearch] = React.useState("")
    const [activeTab, setActiveTab] = React.useState<CategoryId>("smileys")
    const [hovered, setHovered] = React.useState<string | null>(null)
    const [recent, setRecent] = React.useState<string[]>([])

    React.useEffect(() => {
        setRecent(getRecent())
    }, [])

    const handleSelect = React.useCallback(
        (emoji: string) => {
            addRecent(emoji)
            setRecent(getRecent())
            onSelect(emoji)
        },
        [onSelect]
    )

    const searchResults = React.useMemo(() => {
        if (!search.trim()) return []
        const q = search.toLowerCase()
        return CATEGORIES.flatMap((c) => (c.id === "recent" ? [] : c.emojis)).filter((e) =>
            e.includes(q)
        )
    }, [search])

    const categories = CATEGORIES.map((c) =>
        c.id === "recent" ? { ...c, emojis: recent } : c
    )

    return (
        <div className="flex w-[320px] flex-col gap-2 p-2">
            {/* Поиск */}
            <div className="relative">
                <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                    placeholder="Поиск эмодзи..."
                    className="h-8 pl-8 text-sm"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    autoFocus
                />
            </div>

            {/* Превью хovered */}
            <div className="flex h-7 items-center gap-1.5 px-1">
                {hovered ? (
                    <>
                        <span className="text-2xl leading-none">{hovered}</span>
                        <span className="text-xs text-muted-foreground">
              U+{hovered.codePointAt(0)?.toString(16).toUpperCase().padStart(4, "0")}
            </span>
                    </>
                ) : (
                    <span className="text-xs text-muted-foreground">Наведи на эмодзи</span>
                )}
            </div>

            {/* Результаты поиска */}
            {search.trim() ? (
                <ScrollArea className="h-[220px]">
                    <div className="pr-3">
                        <EmojiGrid
                            emojis={searchResults}
                            onSelect={handleSelect}
                            hovered={hovered}
                            setHovered={setHovered}
                        />
                    </div>
                </ScrollArea>
            ) : (
                <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as CategoryId)}>
                    {/* Иконки категорий */}
                    <TabsList className="flex h-auto w-full gap-0.5 bg-transparent p-0">
                        {categories.map((cat) => (
                            <TabsTrigger
                                key={cat.id}
                                value={cat.id}
                                className={cn(
                                    "flex h-8 w-8 flex-1 items-center justify-center rounded-md p-0 text-base transition-colors",
                                    "data-[state=active]:bg-accent data-[state=active]:shadow-none",
                                    cat.id === "recent" && cat.emojis.length === 0 && "opacity-40"
                                )}
                                disabled={cat.id === "recent" && cat.emojis.length === 0}
                                title={cat.label}
                            >
                                {cat.icon}
                            </TabsTrigger>
                        ))}
                    </TabsList>

                    {categories.map((cat) => (
                        <TabsContent key={cat.id} value={cat.id} className="mt-2">
                            <ScrollArea className="h-[220px]">
                                <div className="pr-3">
                                    <p className="mb-1.5 px-1 text-xs font-medium text-muted-foreground">
                                        {cat.label}
                                    </p>
                                    <EmojiGrid
                                        emojis={cat.emojis as unknown as string[]}
                                        onSelect={handleSelect}
                                        hovered={hovered}
                                        setHovered={setHovered}
                                    />
                                </div>
                            </ScrollArea>
                        </TabsContent>
                    ))}
                </Tabs>
            )}
        </div>
    )
}

// ─── EmojiPickerTrigger (готовый к использованию) ────────────────────────────

interface EmojiPickerTriggerProps {
    onSelect: (emoji: string) => void
}

export function EmojiPickerTrigger({ onSelect }: EmojiPickerTriggerProps) {
    const [open, setOpen] = React.useState(false)

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground"
                    title="Эмодзи"
                >
                    <Smile className="h-5 w-5" />
                </Button>
            </PopoverTrigger>
            <PopoverContent
                side="top"
                align="start"
                className="w-auto p-0"
                sideOffset={8}
            >
                <EmojiPicker
                    onSelect={(emoji) => {
                        onSelect(emoji)
                        setOpen(false)
                    }}
                />
            </PopoverContent>
        </Popover>
    )
}