"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import "flag-icons/css/flag-icons.min.css"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

type LangOption = {
    value: string
    label: string
    code: string
    group: "Восточная Европа и СНГ" | "Западная Европа" | "Америка" | "Азия" | "Южная Азия" | "Ближний Восток и Африка"
}

const LANGUAGES: LangOption[] = [

    // Восточная Европа и СНГ
    { value: "ru", code: "ru", label: "Русский",       group: "Восточная Европа и СНГ" },
    { value: "uk", code: "ua", label: "Українська",    group: "Восточная Европа и СНГ" },
    { value: "be", code: "by", label: "Беларуская",    group: "Восточная Европа и СНГ" },
    { value: "kk", code: "kz", label: "Қазақша",       group: "Восточная Европа и СНГ" },
    { value: "uz", code: "uz", label: "O'zbekcha",     group: "Восточная Европа и СНГ" },
    { value: "az", code: "az", label: "Azərbaycanca",  group: "Восточная Европа и СНГ" },
    { value: "hy", code: "am", label: "Հայերեն",       group: "Восточная Европа и СНГ" },
    { value: "ka", code: "ge", label: "ქართული",       group: "Восточная Европа и СНГ" },
    { value: "tg", code: "tj", label: "Тоҷикӣ",        group: "Восточная Европа и СНГ" },
    { value: "ky", code: "kg", label: "Кыргызча",      group: "Восточная Европа и СНГ" },
    { value: "tk", code: "tm", label: "Türkmençe",     group: "Восточная Европа и СНГ" },
    { value: "mn", code: "mn", label: "Монгол",        group: "Восточная Европа и СНГ" },

    // Западная Европа
    { value: "en", code: "gb", label: "English",       group: "Западная Европа" },
    { value: "de", code: "de", label: "Deutsch",       group: "Западная Европа" },
    { value: "fr", code: "fr", label: "Français",      group: "Западная Европа" },
    { value: "es", code: "es", label: "Español",       group: "Западная Европа" },
    { value: "it", code: "it", label: "Italiano",      group: "Западная Европа" },
    { value: "nl", code: "nl", label: "Nederlands",    group: "Западная Европа" },
    { value: "pl", code: "pl", label: "Polski",        group: "Западная Европа" },
    { value: "pt", code: "pt", label: "Português",     group: "Западная Европа" },
    { value: "sv", code: "se", label: "Svenska",       group: "Западная Европа" },
    { value: "no", code: "no", label: "Norsk",         group: "Западная Европа" },
    { value: "da", code: "dk", label: "Dansk",         group: "Западная Европа" },
    { value: "fi", code: "fi", label: "Suomi",         group: "Западная Европа" },
    { value: "cs", code: "cz", label: "Čeština",       group: "Западная Европа" },
    { value: "sk", code: "sk", label: "Slovenčina",    group: "Западная Европа" },
    { value: "hu", code: "hu", label: "Magyar",        group: "Западная Европа" },
    { value: "ro", code: "ro", label: "Română",        group: "Западная Европа" },
    { value: "bg", code: "bg", label: "Български",     group: "Западная Европа" },
    { value: "hr", code: "hr", label: "Hrvatski",      group: "Западная Европа" },
    { value: "sr", code: "rs", label: "Српски",        group: "Западная Европа" },
    { value: "sl", code: "si", label: "Slovenščina",   group: "Западная Европа" },
    { value: "lt", code: "lt", label: "Lietuvių",      group: "Западная Европа" },
    { value: "lv", code: "lv", label: "Latviešu",      group: "Западная Европа" },
    { value: "et", code: "ee", label: "Eesti",         group: "Западная Европа" },
    { value: "el", code: "gr", label: "Ελληνικά",      group: "Западная Европа" },
    { value: "tr", code: "tr", label: "Türkçe",        group: "Западная Европа" },
    { value: "sq", code: "al", label: "Shqip",         group: "Западная Европа" },
    { value: "mk", code: "mk", label: "Македонски",    group: "Западная Европа" },
    { value: "bs", code: "ba", label: "Bosanski",      group: "Западная Европа" },
    { value: "ca", code: "es", label: "Català",        group: "Западная Европа" },
    { value: "eu", code: "es", label: "Euskara",       group: "Западная Европа" },
    { value: "gl", code: "es", label: "Galego",        group: "Западная Европа" },
    { value: "cy", code: "gb", label: "Cymraeg",       group: "Западная Европа" },
    { value: "ga", code: "ie", label: "Gaeilge",       group: "Западная Европа" },
    { value: "is", code: "is", label: "Íslenska",      group: "Западная Европа" },
    { value: "mt", code: "mt", label: "Malti",         group: "Западная Европа" },
    { value: "lb", code: "lu", label: "Lëtzebuergesch",group: "Западная Европа" },

    // Америка
    { value: "en-us", code: "us", label: "English (US)",       group: "Америка" },
    { value: "es-mx", code: "mx", label: "Español (México)",   group: "Америка" },
    { value: "pt-br", code: "br", label: "Português (Brasil)", group: "Америка" },
    { value: "fr-ca", code: "ca", label: "Français (Canada)",  group: "Америка" },
    { value: "es-ar", code: "ar", label: "Español (Argentina)",group: "Америка" },
    { value: "es-co", code: "co", label: "Español (Colombia)", group: "Америка" },
    { value: "qu",    code: "pe", label: "Quechua",            group: "Америка" },

    // Азия — Восточная и ЮВА
    { value: "zh-hans", code: "cn", label: "中文 (简体)",      group: "Азия" },
    { value: "zh-hant", code: "tw", label: "中文 (繁體)",      group: "Азия" },
    { value: "ja",      code: "jp", label: "日本語",           group: "Азия" },
    { value: "ko",      code: "kr", label: "한국어",           group: "Азия" },
    { value: "vi",      code: "vn", label: "Tiếng Việt",       group: "Азия" },
    { value: "th",      code: "th", label: "ภาษาไทย",         group: "Азия" },
    { value: "id",      code: "id", label: "Bahasa Indonesia", group: "Азия" },
    { value: "ms",      code: "my", label: "Bahasa Melayu",    group: "Азия" },
    { value: "tl",      code: "ph", label: "Filipino",         group: "Азия" },
    { value: "km",      code: "kh", label: "ភាសាខ្មែរ",       group: "Азия" },
    { value: "lo",      code: "la", label: "ພາສາລາວ",          group: "Азия" },
    { value: "my",      code: "mm", label: "မြန်မာဘာသာ",      group: "Азия" },
    { value: "si",      code: "lk", label: "සිංහල",           group: "Азия" },

    // Азия — Южная
    { value: "hi",  code: "in", label: "हिन्दी",     group: "Южная Азия" },
    { value: "bn",  code: "bd", label: "বাংলা",       group: "Южная Азия" },
    { value: "ur",  code: "pk", label: "اردو",         group: "Южная Азия" },
    { value: "pa",  code: "in", label: "ਪੰਜਾਬੀ",      group: "Южная Азия" },
    { value: "gu",  code: "in", label: "ગુજરાતી",     group: "Южная Азия" },
    { value: "mr",  code: "in", label: "मराठी",       group: "Южная Азия" },
    { value: "ta",  code: "in", label: "தமிழ்",       group: "Южная Азия" },
    { value: "te",  code: "in", label: "తెలుగు",      group: "Южная Азия" },
    { value: "kn",  code: "in", label: "ಕನ್ನಡ",       group: "Южная Азия" },
    { value: "ml",  code: "in", label: "മലയാളം",      group: "Южная Азия" },
    { value: "ne",  code: "np", label: "नेपाली",      group: "Южная Азия" },
    { value: "si",  code: "lk", label: "සිංහල",       group: "Южная Азия" },

    // Ближний Восток и Северная Африка
    { value: "ar",  code: "sa", label: "العربية",      group: "Ближний Восток и Африка" },
    { value: "fa",  code: "ir", label: "فارسی",         group: "Ближний Восток и Африка" },
    { value: "he",  code: "il", label: "עברית",         group: "Ближний Восток и Африка" },
    { value: "ku",  code: "iq", label: "Kurdî",         group: "Ближний Восток и Африка" },
    { value: "ps",  code: "af", label: "پښتو",          group: "Ближний Восток и Африка" },
    { value: "am",  code: "et", label: "አማርኛ",         group: "Ближний Восток и Африка" },
    { value: "so",  code: "so", label: "Soomaali",      group: "Ближний Восток и Африка" },
    { value: "sw",  code: "ke", label: "Kiswahili",     group: "Ближний Восток и Африка" },
    { value: "ha",  code: "ng", label: "Hausa",         group: "Ближний Восток и Африка" },
    { value: "yo",  code: "ng", label: "Yorùbá",        group: "Ближний Восток и Африка" },
    { value: "ig",  code: "ng", label: "Igbo",          group: "Ближний Восток и Африка" },
    { value: "zu",  code: "za", label: "isiZulu",       group: "Ближний Восток и Африка" },
    { value: "af",  code: "za", label: "Afrikaans",     group: "Ближний Восток и Африка" },
    { value: "mg",  code: "mg", label: "Malagasy",      group: "Ближний Восток и Африка" },
];

function groupOptions(options: LangOption[]) {
    const groups = new Map<LangOption["group"], LangOption[]>()
    for (const opt of options) {
        const arr = groups.get(opt.group) ?? []
        arr.push(opt)
        groups.set(opt.group, arr)
    }
    return groups
}

export function LanguageCombobox({
                                     value,
                                     onChange,
                                     placeholder = "Выберите язык",
                                     className,
                                 }: {
    value?: string
    onChange: (value: string) => void
    placeholder?: string
    className?: string
}) {
    const [open, setOpen] = React.useState(false)

    const selected = React.useMemo(
        () => LANGUAGES.find((l) => l.value === value) ?? null,
        [value]
    )

    const groups = React.useMemo(() => groupOptions(LANGUAGES), [])

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    type="button"
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn("w-full  justify-between", className)}
                >
                   <span className="flex items-center gap-2">
                        {selected ? (
                            <>
                                <span className={`fi fi-${selected.code} rounded-sm w-6 h-[1.125rem] shrink-0`} />
                                <span>{selected.label}</span>
                            </>
                        ) : (
                            <span className="text-muted-foreground font-normal">{placeholder}</span>
                        )}
                    </span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>

            <PopoverContent
                className="p-0"
                align="start"
                style={{ width: 'var(--radix-popover-trigger-width)' }}
                sideOffset={4}
            >
                <Command>
                    <CommandInput placeholder="Поиск языка..." />
                    <CommandList>
                        <CommandEmpty>Ничего не найдено</CommandEmpty>

                        {Array.from(groups.entries()).map(([groupName, items], idx) => (
                            <React.Fragment key={groupName}>
                                {idx !== 0 && <CommandSeparator />}
                                <CommandGroup heading={groupName}>
                                    {items.map((item) => (
                                        <CommandItem
                                            key={item.value}
                                            value={`${item.label} ${item.value}`}
                                            onSelect={() => {
                                                onChange(item.value)
                                                setOpen(false)
                                            }}
                                        >
                                            <span className={`fi fi-${item.code} rounded-md w-6 h-[1.125rem] shrink-0 mr-2`} />
                                            <span>{item.label}</span>
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            </React.Fragment>
                        ))}
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}