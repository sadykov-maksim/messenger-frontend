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

type TimezoneOption = {
    value: string   // IANA id
    label: string   // название зоны
    offset: string  // UTC+3
    group: string
}

const TIMEZONES: TimezoneOption[] = [
    // Россия и СНГ
    { value: "Europe/Kaliningrad",           offset: "UTC+2",    label: "Калининград",               group: "Россия и СНГ" },
    { value: "Europe/Moscow",                offset: "UTC+3",    label: "Москва, Санкт-Петербург",   group: "Россия и СНГ" },
    { value: "Europe/Minsk",                 offset: "UTC+3",    label: "Минск",                     group: "Россия и СНГ" },
    { value: "Europe/Kiev",                  offset: "UTC+2",    label: "Киев",                      group: "Россия и СНГ" },
    { value: "Asia/Yerevan",                 offset: "UTC+4",    label: "Ереван",                    group: "Россия и СНГ" },
    { value: "Asia/Baku",                    offset: "UTC+4",    label: "Баку",                      group: "Россия и СНГ" },
    { value: "Asia/Tbilisi",                 offset: "UTC+4",    label: "Тбилиси",                   group: "Россия и СНГ" },
    { value: "Asia/Yekaterinburg",           offset: "UTC+5",    label: "Екатеринбург",              group: "Россия и СНГ" },
    { value: "Asia/Tashkent",                offset: "UTC+5",    label: "Ташкент",                   group: "Россия и СНГ" },
    { value: "Asia/Almaty",                  offset: "UTC+5",    label: "Алматы",                    group: "Россия и СНГ" },
    { value: "Asia/Ashgabat",                offset: "UTC+5",    label: "Ашхабад",                   group: "Россия и СНГ" },
    { value: "Asia/Dushanbe",                offset: "UTC+5",    label: "Душанбе",                   group: "Россия и СНГ" },
    { value: "Asia/Bishkek",                 offset: "UTC+6",    label: "Бишкек",                    group: "Россия и СНГ" },
    { value: "Asia/Omsk",                    offset: "UTC+6",    label: "Омск",                      group: "Россия и СНГ" },
    { value: "Asia/Krasnoyarsk",             offset: "UTC+7",    label: "Красноярск",                group: "Россия и СНГ" },
    { value: "Asia/Irkutsk",                 offset: "UTC+8",    label: "Иркутск",                   group: "Россия и СНГ" },
    { value: "Asia/Yakutsk",                 offset: "UTC+9",    label: "Якутск",                    group: "Россия и СНГ" },
    { value: "Asia/Vladivostok",             offset: "UTC+10",   label: "Владивосток",               group: "Россия и СНГ" },
    { value: "Asia/Magadan",                 offset: "UTC+11",   label: "Магадан",                   group: "Россия и СНГ" },
    { value: "Asia/Kamchatka",               offset: "UTC+12",   label: "Камчатка",                  group: "Россия и СНГ" },

    // Европа
    { value: "Atlantic/Azores",              offset: "UTC-1",    label: "Азорские острова",          group: "Европа" },
    { value: "Atlantic/Reykjavik",           offset: "UTC+0",    label: "Рейкьявик",                 group: "Европа" },
    { value: "Europe/London",                offset: "UTC+0",    label: "Лондон, Дублин",            group: "Европа" },
    { value: "Europe/Lisbon",                offset: "UTC+0",    label: "Лиссабон",                  group: "Европа" },
    { value: "Europe/Paris",                 offset: "UTC+1",    label: "Париж, Мадрид, Рим",        group: "Европа" },
    { value: "Europe/Berlin",                offset: "UTC+1",    label: "Берлин, Варшава, Вена",     group: "Европа" },
    { value: "Europe/Amsterdam",             offset: "UTC+1",    label: "Амстердам, Брюссель",       group: "Европа" },
    { value: "Europe/Stockholm",             offset: "UTC+1",    label: "Стокгольм, Осло, Копенгаген", group: "Европа" },
    { value: "Europe/Prague",                offset: "UTC+1",    label: "Прага, Братислава",         group: "Европа" },
    { value: "Europe/Budapest",              offset: "UTC+1",    label: "Будапешт",                  group: "Европа" },
    { value: "Europe/Belgrade",              offset: "UTC+1",    label: "Белград, Загреб, Сараево",  group: "Европа" },
    { value: "Europe/Athens",                offset: "UTC+2",    label: "Афины, Бухарест",           group: "Европа" },
    { value: "Europe/Helsinki",              offset: "UTC+2",    label: "Хельсинки, Рига, Таллин",   group: "Европа" },
    { value: "Europe/Sofia",                 offset: "UTC+2",    label: "София",                     group: "Европа" },
    { value: "Europe/Vilnius",               offset: "UTC+2",    label: "Вильнюс",                   group: "Европа" },
    { value: "Europe/Nicosia",               offset: "UTC+2",    label: "Никосия",                   group: "Европа" },

    // Америка
    { value: "America/Anchorage",            offset: "UTC-9",    label: "Анкоридж",                  group: "Америка" },
    { value: "America/Los_Angeles",          offset: "UTC-8",    label: "Лос-Анджелес, Ванкувер",    group: "Америка" },
    { value: "America/Denver",               offset: "UTC-7",    label: "Денвер, Солт-Лейк-Сити",    group: "Америка" },
    { value: "America/Phoenix",              offset: "UTC-7",    label: "Финикс",                    group: "Америка" },
    { value: "America/Chicago",              offset: "UTC-6",    label: "Чикаго, Даллас",            group: "Америка" },
    { value: "America/Mexico_City",          offset: "UTC-6",    label: "Мехико",                    group: "Америка" },
    { value: "America/New_York",             offset: "UTC-5",    label: "Нью-Йорк, Торонто, Майами", group: "Америка" },
    { value: "America/Bogota",               offset: "UTC-5",    label: "Богота, Лима",              group: "Америка" },
    { value: "America/Caracas",              offset: "UTC-4",    label: "Каракас",                   group: "Америка" },
    { value: "America/Halifax",              offset: "UTC-4",    label: "Галифакс",                  group: "Америка" },
    { value: "America/Santiago",             offset: "UTC-4",    label: "Сантьяго",                  group: "Америка" },
    { value: "America/Sao_Paulo",            offset: "UTC-3",    label: "Сан-Паулу, Рио-де-Жанейро", group: "Америка" },
    { value: "America/Argentina/Buenos_Aires", offset: "UTC-3", label: "Буэнос-Айрес",              group: "Америка" },
    { value: "America/St_Johns",             offset: "UTC-3:30", label: "Сент-Джонс",               group: "Америка" },
    { value: "Atlantic/South_Georgia",       offset: "UTC-2",    label: "Южная Георгия",             group: "Америка" },
    { value: "America/Adak",                 offset: "UTC-10",   label: "Гавайи (Адак)",             group: "Америка" },
    { value: "Pacific/Honolulu",             offset: "UTC-10",   label: "Гонолулу",                  group: "Америка" },

    // Ближний Восток и Африка
    { value: "Africa/Casablanca",            offset: "UTC+0",    label: "Касабланка",                group: "Ближний Восток и Африка" },
    { value: "Africa/Lagos",                 offset: "UTC+1",    label: "Лагос, Киншаса",            group: "Ближний Восток и Африка" },
    { value: "Africa/Cairo",                 offset: "UTC+2",    label: "Каир",                      group: "Ближний Восток и Африка" },
    { value: "Africa/Johannesburg",          offset: "UTC+2",    label: "Йоханнесбург",              group: "Ближний Восток и Африка" },
    { value: "Africa/Nairobi",               offset: "UTC+3",    label: "Найроби",                   group: "Ближний Восток и Африка" },
    { value: "Asia/Jerusalem",               offset: "UTC+2",    label: "Иерусалим, Тель-Авив",      group: "Ближний Восток и Африка" },
    { value: "Asia/Beirut",                  offset: "UTC+2",    label: "Бейрут, Дамаск",            group: "Ближний Восток и Африка" },
    { value: "Asia/Amman",                   offset: "UTC+2",    label: "Амман",                     group: "Ближний Восток и Африка" },
    { value: "Asia/Baghdad",                 offset: "UTC+3",    label: "Багдад",                    group: "Ближний Восток и Африка" },
    { value: "Asia/Kuwait",                  offset: "UTC+3",    label: "Кувейт, Эр-Рияд",          group: "Ближний Восток и Африка" },
    { value: "Asia/Tehran",                  offset: "UTC+3:30", label: "Тегеран",                   group: "Ближний Восток и Африка" },
    { value: "Asia/Dubai",                   offset: "UTC+4",    label: "Дубай, Абу-Даби",           group: "Ближний Восток и Африка" },
    { value: "Asia/Kabul",                   offset: "UTC+4:30", label: "Кабул",                     group: "Ближний Восток и Африка" },
    { value: "Asia/Karachi",                 offset: "UTC+5",    label: "Карачи, Исламабад",         group: "Ближний Восток и Африка" },

    // Азия
    { value: "Asia/Kolkata",                 offset: "UTC+5:30", label: "Мумбаи, Нью-Дели",          group: "Азия" },
    { value: "Asia/Kathmandu",               offset: "UTC+5:45", label: "Катманду",                  group: "Азия" },
    { value: "Asia/Dhaka",                   offset: "UTC+6",    label: "Дакка",                     group: "Азия" },
    { value: "Asia/Colombo",                 offset: "UTC+5:30", label: "Коломбо",                   group: "Азия" },
    { value: "Asia/Rangoon",                 offset: "UTC+6:30", label: "Янгон",                     group: "Азия" },
    { value: "Asia/Bangkok",                 offset: "UTC+7",    label: "Бангкок, Ханой, Джакарта",  group: "Азия" },
    { value: "Asia/Ho_Chi_Minh",             offset: "UTC+7",    label: "Хошимин",                   group: "Азия" },
    { value: "Asia/Singapore",               offset: "UTC+8",    label: "Сингапур, Куала-Лумпур",    group: "Азия" },
    { value: "Asia/Shanghai",                offset: "UTC+8",    label: "Пекин, Шанхай, Чунцин",     group: "Азия" },
    { value: "Asia/Hong_Kong",               offset: "UTC+8",    label: "Гонконг",                   group: "Азия" },
    { value: "Asia/Taipei",                  offset: "UTC+8",    label: "Тайбэй",                    group: "Азия" },
    { value: "Asia/Manila",                  offset: "UTC+8",    label: "Манила",                    group: "Азия" },
    { value: "Australia/Perth",              offset: "UTC+8",    label: "Перт",                      group: "Азия" },
    { value: "Asia/Seoul",                   offset: "UTC+9",    label: "Сеул",                      group: "Азия" },
    { value: "Asia/Tokyo",                   offset: "UTC+9",    label: "Токио, Осака",              group: "Азия" },
    { value: "Asia/Pyongyang",               offset: "UTC+9",    label: "Пхеньян",                   group: "Азия" },
    { value: "Australia/Adelaide",           offset: "UTC+9:30", label: "Аделаида",                  group: "Азия" },
    { value: "Australia/Sydney",             offset: "UTC+10",   label: "Сидней, Мельбурн",          group: "Азия" },
    { value: "Pacific/Guam",                 offset: "UTC+10",   label: "Гуам",                      group: "Азия" },
    { value: "Asia/Sakhalin",                offset: "UTC+11",   label: "Сахалин",                   group: "Азия" },
    { value: "Pacific/Auckland",             offset: "UTC+12",   label: "Окленд, Веллингтон",        group: "Азия" },
    { value: "Pacific/Fiji",                 offset: "UTC+12",   label: "Фиджи",                     group: "Азия" },
    { value: "Pacific/Tongatapu",            offset: "UTC+13",   label: "Нукуалофа (Тонга)",         group: "Азия" },
]

function groupOptions(options: TimezoneOption[]) {
    const groups = new Map<string, TimezoneOption[]>()
    for (const opt of options) {
        const arr = groups.get(opt.group) ?? []
        arr.push(opt)
        groups.set(opt.group, arr)
    }
    return groups
}

export function TimeZoneCombobox({
                                     value,
                                     onChange,
                                     placeholder = "Выберите временную зону",
                                     className,
                                 }: {
    value?: string
    onChange: (value: string) => void
    placeholder?: string
    className?: string
}) {
    const [open, setOpen] = React.useState(false)

    const selected = React.useMemo(
        () => TIMEZONES.find((t) => t.value === value) ?? null,
        [value]
    )

    const groups = React.useMemo(() => groupOptions(TIMEZONES), [])

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
                    <span className="flex items-center gap-2">
                        {selected ? (
                            <>
                                <span className="text-muted-foreground text-sm font-mono">{selected.offset}</span>
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
                style={{ width: "var(--radix-popover-trigger-width)" }}
                sideOffset={4}
            >
                <Command>
                    <CommandInput placeholder="Поиск временной зоны..." />
                    <CommandList>
                        <CommandEmpty>Ничего не найдено</CommandEmpty>

                        {Array.from(groups.entries()).map(([groupName, items], idx) => (
                            <React.Fragment key={groupName}>
                                {idx !== 0 && <CommandSeparator />}
                                <CommandGroup heading={groupName}>
                                    {items.map((item) => (
                                        <CommandItem
                                            key={item.value}
                                            value={`${item.offset} ${item.label} ${item.value}`}
                                            onSelect={() => {
                                                onChange(item.value)
                                                setOpen(false)
                                            }}
                                        >
                                            <span className="text-muted-foreground w-16 shrink-0 font-mono text-sm">
                                                {item.offset}
                                            </span>
                                            <span>{item.label}</span>
                                            <Check
                                                className={cn(
                                                    "ml-auto h-4 w-4",
                                                    value === item.value ? "opacity-100" : "opacity-0"
                                                )}
                                            />
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