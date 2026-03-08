"use client"

import {useCallback, useEffect, useState } from "react"
import { AppSidebar } from "@/components/dashboard/app-sidebar"
import { ChartAreaInteractive } from "@/components/dashboard/chart-area-interactive"
import {DataTable, Metrics, schema} from "@/components/dashboard/data-table"
import { SectionCards } from "@/components/dashboard/section-cards"
import { z } from "zod"
import { DateRange } from "react-day-picker"
import { format } from "date-fns"
import {Tabs, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {Calendar1, CalendarClock, CalendarDays, CalendarMinus, CalendarRange} from "lucide-react";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {Button} from "@/components/ui/button";
import {ru} from "date-fns/locale";
import {Calendar} from "@/components/ui/calendar";
import * as React from "react";
import {useRouter} from "next/navigation";
import {selectCurrentUser} from "@/lib/features/auth/authSlice";
import {useSelector} from "react-redux";

type Row = z.infer<typeof schema>

type TimeRange =
    | "today"
    | "yesterday"
    | "7d"
    | "30d"
    | "quarter"
    | "period"


export default function Page() {
    const [data, setData] = useState<Row[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [metrics, setMetrics] = useState<Metrics | null>(null);
    const [filters, setFilters] = useState<{
        dateRange?: DateRange
        category?: string
        source?: string

    }>({
        category: "7",
        dateRange: undefined,
        source: undefined
    })

    const [timeRange, setTimeRange] = React.useState<TimeRange>("today")
    const [dateRange, setDateRange] = React.useState<DateRange | undefined>()


    useEffect(() => {
        const ac = new AbortController()

        ;(async () => {
            try {
                const params = new URLSearchParams()

                // Добавляем те же фильтры, что и для таблицы
                if (filters.category && filters.category !== "all") {
                    params.append("category", filters.category)
                }




                if (filters.dateRange?.from) {
                    params.append("from", format(filters.dateRange.from, "yyyy-MM-dd"))
                }
                if (filters.dateRange?.to) {
                    params.append("to", format(filters.dateRange.to, "yyyy-MM-dd"))
                }

                const res = await fetch(`/api/bitrix/deal-funnel?${params.toString()}`, {
                    cache: "no-store",
                    signal: ac.signal,
                })
                const json = await res.json()
                if (json.metrics) {
                    setMetrics(json.metrics)
                }
            } catch (e: any) {
                if (e?.name !== "AbortError") console.error(e)
            }
        })()

        return () => ac.abort()
    }, [filters])

    useEffect(() => {
        async function fetchData() {
            setIsLoading(true)
            try {
                const params = new URLSearchParams()

                if (filters.category && filters.category !== "all") {
                    params.append("category", filters.category)
                }

                if (filters.source && filters.source !== "all") {
                    params.set("source", filters.source)
                }

                if (filters.dateRange?.from) {
                    params.append("from", format(filters.dateRange.from, "yyyy-MM-dd"))
                }
                if (filters.dateRange?.to) {
                    params.append("to", format(filters.dateRange.to, "yyyy-MM-dd"))
                }

                const response = await fetch(`/api/bitrix/deals?${params.toString()}`);
                const result = await response.json()

                if (result.rows) {
                    setData(result.rows)
                } else {
                    setData([])
                }
            } catch (error) {
                console.error("Ошибка при загрузке данных:", error)
            } finally {
                setIsLoading(false)
            }
        }

        fetchData()
    }, [filters])

    const handleFiltersChange = useCallback((newFilters: { dateRange?: DateRange, category?: string }) => {
        setFilters(prev => ({ ...prev, ...newFilters }))
    }, [])

    return (
        <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col gap-4 py-4 md:py-6">
                <div className="flex flex-col gap-4 mx-6">
                    <div className={'w-full flex flex-row justify-between '}>

                    {/* Time Range Selector */}
                        <Tabs
                            value={timeRange}
                            onValueChange={(v) => setTimeRange(v as TimeRange)}
                            className=""
                        >
                            <TabsList className="flex h-auto w-fit flex-wrap gap-2 p-1">
                                <TabsTrigger value="today" className="flex items-center gap-2 px-4 py-2 text-sm">
                                    <Calendar1 className="h-4 w-4" />
                                    Сегодня
                                </TabsTrigger>

                                <TabsTrigger value="yesterday" className="flex items-center gap-2 px-4 py-2 text-sm">
                                    <CalendarMinus className="h-4 w-4" />
                                    Вчера
                                </TabsTrigger>

                                <TabsTrigger value="7d" className="flex items-center gap-2 px-4 py-2 text-sm">
                                    <CalendarDays className="h-4 w-4" />
                                    Неделя
                                </TabsTrigger>

                                <TabsTrigger value="30d" className="flex items-center gap-2 px-4 py-2 text-sm">
                                    <CalendarClock className="h-4 w-4" />
                                    Месяц
                                </TabsTrigger>

                                <TabsTrigger value="quarter" className="flex items-center gap-2 px-4 py-2 text-sm">
                                    <CalendarDays className="h-4 w-4" />
                                    Квартал
                                </TabsTrigger>
                                <TabsTrigger value="period" className="flex items-center gap-2 px-4 py-2 text-sm">
                                    <CalendarDays className="h-4 w-4" />
                                    Период
                                </TabsTrigger>
                            </TabsList>
                        </Tabs>
                        {/* Date Range Picker */}
                        <div className="px-4 lg:px-6 flex gap-2 items-center">
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className="w-[280px] justify-start text-left font-normal"
                                        disabled={timeRange !== 'period'}
                                    >
                                        <CalendarRange className="mr-2 h-4 w-4" />
                                        {dateRange?.from ? (
                                            dateRange.to ? (
                                                <>
                                                    {format(dateRange.from, "dd MMM yyyy", { locale: ru })} —{" "}
                                                    {format(dateRange.to, "dd MMM yyyy", { locale: ru })}
                                                </>
                                            ) : (
                                                format(dateRange.from, "dd MMM yyyy", { locale: ru })
                                            )
                                        ) : (
                                            <span>Выберите период</span>
                                        )}
                                    </Button>
                                </PopoverTrigger>

                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        initialFocus
                                        mode="range"
                                        selected={dateRange}
                                        onSelect={setDateRange}
                                        numberOfMonths={2}
                                        locale={ru}
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>
                    </div>
                    <SectionCards />
                    <div className="px-4 lg:px-6">
                        <ChartAreaInteractive />
                    </div>
                    <DataTable
                        data={data}
                        metrics={metrics}
                        isLoading={isLoading}
                        onFiltersChange={handleFiltersChange}
                    />
            </div>
        </div>
    )
}