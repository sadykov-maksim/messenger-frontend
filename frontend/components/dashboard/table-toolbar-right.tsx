import * as React from "react"
import { format } from "date-fns"
import { DateRange } from "react-day-picker"
import { ru } from "date-fns/locale"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

import {
    IconCalendar,
} from "@tabler/icons-react"
import {Option} from "@/types";
import {useEffect, useState} from "react";

export function useDealSources() {
    const [sources, setSources] = useState<Option[]>([
        { value: "all", label: "Все источники" },
    ])

    useEffect(() => {
        fetch('/api/bitrix/sources', { cache: "no-store" })
            .then(res => res.json())
            .then(json => {
                if (json.success) {
                    const items = json.sources.map((s: any) => ({
                        value: s.id,
                        label: s.name
                    }))
                    setSources([{ value: "all", label: "Все источники" }, ...items])
                }
            })
            .catch(console.error)
    }, [])

    return sources
}


export function useDealCategories() {
    const [categories, setCategories] = useState<Option[]>([
        { value: "all", label: "Все воронки" },
    ])

    useEffect(() => {
        fetch("/api/bitrix/deal-categories", { cache: "no-store" })
            .then((res) => res.json())
            .then((data) => {
                const items = (data.result ?? []).map((c: any) => ({
                    value: c.ID,
                    label: c.NAME,
                }))

                setCategories([{ value: "all", label: "Все воронки" }, ...items])
            })
            .catch(console.error)
    }, [])

    return categories
}

type Props = {
    table: any
    onAddSection?: () => void
    onFiltersChange?: (filters: {
        dateRange?: DateRange
        category?: string
        source?: string

    }) => void
}

export function TableToolbarRight({ table, onAddSection, onFiltersChange }: Props) {
    const [dateRange, setDateRange] = React.useState<DateRange | undefined>()
    const [category, setCategory] = React.useState<string>("7")
    const categories = useDealCategories()
    const [source, setSource] = React.useState<string>("all")
    const sources = useDealSources()

    useEffect(() => {
        onFiltersChange?.({ dateRange, category, source })
    }, [dateRange, category, source, onFiltersChange])

    useEffect(() => {
        if (onFiltersChange) {
            onFiltersChange({ dateRange, category })
        }
    }, [dateRange, category, onFiltersChange])

    const dateLabel = React.useMemo(() => {
        if (!dateRange?.from) return "Дата"
        if (dateRange.from && !dateRange.to) {
            return format(dateRange.from, "dd.MM.yyyy", { locale: ru })
        }
        return `${format(dateRange.from, "dd.MM.yyyy", { locale: ru })} — ${format(
            dateRange.to!,
            "dd.MM.yyyy",
            { locale: ru }
        )}`
    }, [dateRange])

    const hasFilters = Boolean(dateRange?.from) || category !== "all"

    return (
        <div className="flex flex-wrap items-center gap-2">
            {/* Фильтр: Канал */}
            <Select value={category} onValueChange={setCategory}>
                <SelectTrigger size={"sm"} className="w-[200px] h-8">
                    <SelectValue placeholder="Канал" />
                </SelectTrigger>
                <SelectContent align="end">
                    {categories.map(c => (
                        <SelectItem key={c.value} value={c.value}>
                            {c.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <Select value={source} onValueChange={setSource}>
                <SelectTrigger size="sm" className="w-[200px] h-8">
                    <SelectValue placeholder="Источник" />
                </SelectTrigger>
                <SelectContent align="end">
                    {sources.map((s) => (
                        <SelectItem key={s.value} value={s.value}>
                            {s.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    )
}
