"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"
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

type RegionOption = {
    value: string
    label: string
    group: string
}

const REGIONS: RegionOption[] = [
    // Россия и СНГ
    { value: "ru", label: "Россия", group: "Россия и СНГ" },
    { value: "kz", label: "Казахстан", group: "Россия и СНГ" },
    { value: "by", label: "Беларусь", group: "Россия и СНГ" },
    { value: "ua", label: "Украина", group: "Россия и СНГ" },
    { value: "uz", label: "Узбекистан", group: "Россия и СНГ" },
    { value: "az", label: "Азербайджан", group: "Россия и СНГ" },
    { value: "ge", label: "Грузия", group: "Россия и СНГ" },
    { value: "am", label: "Армения", group: "Россия и СНГ" },
    { value: "tm", label: "Туркменистан", group: "Россия и СНГ" },
    { value: "tj", label: "Таджикистан", group: "Россия и СНГ" },
    { value: "kg", label: "Кыргызстан", group: "Россия и СНГ" },
    { value: "md", label: "Молдова", group: "Россия и СНГ" },

    // Европа
    { value: "de", label: "Германия", group: "Европа" },
    { value: "fr", label: "Франция", group: "Европа" },
    { value: "gb", label: "Великобритания", group: "Европа" },
    { value: "it", label: "Италия", group: "Европа" },
    { value: "es", label: "Испания", group: "Европа" },
    { value: "nl", label: "Нидерланды", group: "Европа" },
    { value: "be", label: "Бельгия", group: "Европа" },
    { value: "ch", label: "Швейцария", group: "Европа" },
    { value: "at", label: "Австрия", group: "Европа" },
    { value: "se", label: "Швеция", group: "Европа" },
    { value: "no", label: "Норвегия", group: "Европа" },
    { value: "dk", label: "Дания", group: "Европа" },
    { value: "fi", label: "Финляндия", group: "Европа" },
    { value: "pl", label: "Польша", group: "Европа" },
    { value: "cz", label: "Чехия", group: "Европа" },
    { value: "sk", label: "Словакия", group: "Европа" },
    { value: "hu", label: "Венгрия", group: "Европа" },
    { value: "ro", label: "Румыния", group: "Европа" },
    { value: "bg", label: "Болгария", group: "Европа" },
    { value: "hr", label: "Хорватия", group: "Европа" },
    { value: "rs", label: "Сербия", group: "Европа" },
    { value: "si", label: "Словения", group: "Европа" },
    { value: "ba", label: "Босния и Герцеговина", group: "Европа" },
    { value: "me", label: "Черногория", group: "Европа" },
    { value: "mk", label: "Северная Македония", group: "Европа" },
    { value: "al", label: "Албания", group: "Европа" },
    { value: "gr", label: "Греция", group: "Европа" },
    { value: "pt", label: "Португалия", group: "Европа" },
    { value: "ie", label: "Ирландия", group: "Европа" },
    { value: "is", label: "Исландия", group: "Европа" },
    { value: "lu", label: "Люксембург", group: "Европа" },
    { value: "li", label: "Лихтенштейн", group: "Европа" },
    { value: "mc", label: "Монако", group: "Европа" },
    { value: "mt", label: "Мальта", group: "Европа" },
    { value: "cy", label: "Кипр", group: "Европа" },
    { value: "ee", label: "Эстония", group: "Европа" },
    { value: "lv", label: "Латвия", group: "Европа" },
    { value: "lt", label: "Литва", group: "Европа" },
    { value: "ad", label: "Андорра", group: "Европа" },
    { value: "sm", label: "Сан-Марино", group: "Европа" },
    { value: "va", label: "Ватикан", group: "Европа" },
    { value: "xk", label: "Косово", group: "Европа" },

    // Америка
    { value: "us", label: "США", group: "Америка" },
    { value: "ca", label: "Канада", group: "Америка" },
    { value: "br", label: "Бразилия", group: "Америка" },
    { value: "mx", label: "Мексика", group: "Америка" },
    { value: "ar", label: "Аргентина", group: "Америка" },
    { value: "cl", label: "Чили", group: "Америка" },
    { value: "co", label: "Колумбия", group: "Америка" },
    { value: "pe", label: "Перу", group: "Америка" },
    { value: "ve", label: "Венесуэла", group: "Америка" },
    { value: "ec", label: "Эквадор", group: "Америка" },
    { value: "bo", label: "Боливия", group: "Америка" },
    { value: "py", label: "Парагвай", group: "Америка" },
    { value: "uy", label: "Уругвай", group: "Америка" },
    { value: "gy", label: "Гайана", group: "Америка" },
    { value: "sr", label: "Суринам", group: "Америка" },
    { value: "gt", label: "Гватемала", group: "Америка" },
    { value: "cu", label: "Куба", group: "Америка" },
    { value: "do", label: "Доминиканская Республика", group: "Америка" },
    { value: "ht", label: "Гаити", group: "Америка" },
    { value: "jm", label: "Ямайка", group: "Америка" },
    { value: "tt", label: "Тринидад и Тобаго", group: "Америка" },
    { value: "pa", label: "Панама", group: "Америка" },
    { value: "cr", label: "Коста-Рика", group: "Америка" },
    { value: "hn", label: "Гондурас", group: "Америка" },
    { value: "ni", label: "Никарагуа", group: "Америка" },
    { value: "sv", label: "Сальвадор", group: "Америка" },
    { value: "bz", label: "Белиз", group: "Америка" },
    { value: "bb", label: "Барбадос", group: "Америка" },
    { value: "bs", label: "Багамы", group: "Америка" },
    { value: "lc", label: "Сент-Люсия", group: "Америка" },
    { value: "vc", label: "Сент-Винсент и Гренадины", group: "Америка" },
    { value: "gd", label: "Гренада", group: "Америка" },
    { value: "ag", label: "Антигуа и Барбуда", group: "Америка" },
    { value: "dm", label: "Доминика", group: "Америка" },
    { value: "kn", label: "Сент-Китс и Невис", group: "Америка" },

    // Азия
    { value: "cn", label: "Китай", group: "Азия" },
    { value: "jp", label: "Япония", group: "Азия" },
    { value: "sg", label: "Сингапур", group: "Азия" },
    { value: "in", label: "Индия", group: "Азия" },
    { value: "kr", label: "Южная Корея", group: "Азия" },
    { value: "kp", label: "Северная Корея", group: "Азия" },
    { value: "id", label: "Индонезия", group: "Азия" },
    { value: "my", label: "Малайзия", group: "Азия" },
    { value: "th", label: "Таиланд", group: "Азия" },
    { value: "vn", label: "Вьетнам", group: "Азия" },
    { value: "ph", label: "Филиппины", group: "Азия" },
    { value: "pk", label: "Пакистан", group: "Азия" },
    { value: "bd", label: "Бангладеш", group: "Азия" },
    { value: "lk", label: "Шри-Ланка", group: "Азия" },
    { value: "np", label: "Непал", group: "Азия" },
    { value: "mm", label: "Мьянма", group: "Азия" },
    { value: "kh", label: "Камбоджа", group: "Азия" },
    { value: "la", label: "Лаос", group: "Азия" },
    { value: "mn", label: "Монголия", group: "Азия" },
    { value: "bt", label: "Бутан", group: "Азия" },
    { value: "mv", label: "Мальдивы", group: "Азия" },
    { value: "tl", label: "Восточный Тимор", group: "Азия" },
    { value: "bn", label: "Бруней", group: "Азия" },
    { value: "tw", label: "Тайвань", group: "Азия" },
    { value: "hk", label: "Гонконг", group: "Азия" },
    { value: "mo", label: "Макао", group: "Азия" },

    // Ближний Восток
    { value: "tr", label: "Турция", group: "Ближний Восток" },
    { value: "ae", label: "ОАЭ", group: "Ближний Восток" },
    { value: "sa", label: "Саудовская Аравия", group: "Ближний Восток" },
    { value: "il", label: "Израиль", group: "Ближний Восток" },
    { value: "ir", label: "Иран", group: "Ближний Восток" },
    { value: "iq", label: "Ирак", group: "Ближний Восток" },
    { value: "sy", label: "Сирия", group: "Ближний Восток" },
    { value: "jo", label: "Иордания", group: "Ближний Восток" },
    { value: "lb", label: "Ливан", group: "Ближний Восток" },
    { value: "kw", label: "Кувейт", group: "Ближний Восток" },
    { value: "qa", label: "Катар", group: "Ближний Восток" },
    { value: "bh", label: "Бахрейн", group: "Ближний Восток" },
    { value: "om", label: "Оман", group: "Ближний Восток" },
    { value: "ye", label: "Йемен", group: "Ближний Восток" },
    { value: "ps", label: "Палестина", group: "Ближний Восток" },
    { value: "af", label: "Афганистан", group: "Ближний Восток" },

    // Африка
    { value: "za", label: "ЮАР", group: "Африка" },
    { value: "ng", label: "Нигерия", group: "Африка" },
    { value: "eg", label: "Египет", group: "Африка" },
    { value: "ke", label: "Кения", group: "Африка" },
    { value: "et", label: "Эфиопия", group: "Африка" },
    { value: "gh", label: "Гана", group: "Африка" },
    { value: "tz", label: "Танзания", group: "Африка" },
    { value: "ug", label: "Уганда", group: "Африка" },
    { value: "ma", label: "Марокко", group: "Африка" },
    { value: "dz", label: "Алжир", group: "Африка" },
    { value: "tn", label: "Тунис", group: "Африка" },
    { value: "ly", label: "Ливия", group: "Африка" },
    { value: "sd", label: "Судан", group: "Африка" },
    { value: "ss", label: "Южный Судан", group: "Африка" },
    { value: "cm", label: "Камерун", group: "Африка" },
    { value: "ci", label: "Кот-д'Ивуар", group: "Африка" },
    { value: "ao", label: "Ангола", group: "Африка" },
    { value: "mz", label: "Мозамбик", group: "Африка" },
    { value: "mg", label: "Мадагаскар", group: "Африка" },
    { value: "zm", label: "Замбия", group: "Африка" },
    { value: "zw", label: "Зимбабве", group: "Африка" },
    { value: "sn", label: "Сенегал", group: "Африка" },
    { value: "ml", label: "Мали", group: "Африка" },
    { value: "bf", label: "Буркина-Фасо", group: "Африка" },
    { value: "ne", label: "Нигер", group: "Африка" },
    { value: "td", label: "Чад", group: "Африка" },
    { value: "so", label: "Сомали", group: "Африка" },
    { value: "rw", label: "Руанда", group: "Африка" },
    { value: "bi", label: "Бурунди", group: "Африка" },
    { value: "mw", label: "Малави", group: "Африка" },
    { value: "na", label: "Намибия", group: "Африка" },
    { value: "bw", label: "Ботсвана", group: "Африка" },
    { value: "ls", label: "Лесото", group: "Африка" },
    { value: "sz", label: "Эсватини", group: "Африка" },
    { value: "er", label: "Эритрея", group: "Африка" },
    { value: "dj", label: "Джибути", group: "Африка" },
    { value: "ga", label: "Габон", group: "Африка" },
    { value: "cg", label: "Республика Конго", group: "Африка" },
    { value: "cd", label: "ДР Конго", group: "Африка" },
    { value: "cf", label: "ЦАР", group: "Африка" },
    { value: "gq", label: "Экваториальная Гвинея", group: "Африка" },
    { value: "st", label: "Сан-Томе и Принсипи", group: "Африка" },
    { value: "cv", label: "Кабо-Верде", group: "Африка" },
    { value: "gm", label: "Гамбия", group: "Африка" },
    { value: "gw", label: "Гвинея-Бисау", group: "Африка" },
    { value: "gn", label: "Гвинея", group: "Африка" },
    { value: "sl", label: "Сьерра-Леоне", group: "Африка" },
    { value: "lr", label: "Либерия", group: "Африка" },
    { value: "tg", label: "Того", group: "Африка" },
    { value: "bj", label: "Бенин", group: "Африка" },
    { value: "km", label: "Коморы", group: "Африка" },
    { value: "sc", label: "Сейшелы", group: "Африка" },
    { value: "mu", label: "Маврикий", group: "Африка" },
    { value: "mr", label: "Мавритания", group: "Африка" },

    // Океания
    { value: "au", label: "Австралия", group: "Океания" },
    { value: "nz", label: "Новая Зеландия", group: "Океания" },
    { value: "fj", label: "Фиджи", group: "Океания" },
    { value: "pg", label: "Папуа — Новая Гвинея", group: "Океания" },
    { value: "sb", label: "Соломоновы Острова", group: "Океания" },
    { value: "vu", label: "Вануату", group: "Океания" },
    { value: "ws", label: "Самоа", group: "Океания" },
    { value: "to", label: "Тонга", group: "Океания" },
    { value: "ki", label: "Кирибати", group: "Океания" },
    { value: "fm", label: "Микронезия", group: "Океания" },
    { value: "mh", label: "Маршалловы Острова", group: "Океания" },
    { value: "pw", label: "Палау", group: "Океания" },
    { value: "nr", label: "Науру", group: "Океания" },
    { value: "tv", label: "Тувалу", group: "Океания" },
];

function groupOptions(options: RegionOption[]) {
    const groups = new Map<string, RegionOption[]>()
    for (const opt of options) {
        const arr = groups.get(opt.group) ?? []
        arr.push(opt)
        groups.set(opt.group, arr)
    }
    return groups
}

export function RegionCombobox({
                                   value,
                                   onChange,
                                   placeholder = "Выберите регион",
                                   className,
                               }: {
    value?: string
    onChange: (value: string) => void
    placeholder?: string
    className?: string
}) {
    const [open, setOpen] = React.useState(false)

    const selected = React.useMemo(
        () => REGIONS.find((r) => r.value === value) ?? null,
        [value]
    )

    const groups = React.useMemo(() => groupOptions(REGIONS), [])

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    type="button"
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn("w-full justify-between", className)}
                >
                    <span className="flex items-center">
                        {selected ? (
                            <span>{selected.label}</span>
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
                    <CommandInput placeholder="Поиск региона..." />
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