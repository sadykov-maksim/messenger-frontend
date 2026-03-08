"use client"

import * as React from "react"
import { SectionCards } from "@/components/dashboard/site-metrics/section-cards"
import { ChartAreaInteractive } from "@/components/dashboard/ad-effectiveness/chart-area-interactive"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useIsMobile } from "@/hooks/use-mobile"
import {
    CalendarDays,
    CalendarRange,
    CalendarClock,
    CalendarMinus,
    Calendar1,
} from "lucide-react"

import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"

import { DateRange } from "react-day-picker"
import { format } from "date-fns"
import { ru } from "date-fns/locale"
import { DataTable, schema } from "@/components/dashboard/ad-effectiveness/data-table"
import {Suspense, useCallback, useEffect, useState} from "react"
import { z } from "zod"
import { ChartPieDonut } from "@/components/dashboard/ad-effectiveness/charts/devices-chart"
import { GenderChartDonut } from "@/components/dashboard/ad-effectiveness/charts/sex-chart"
import { AgeChartDonut } from "@/components/dashboard/ad-effectiveness/charts/age-chart"
import { ClicksChart } from "@/components/dashboard/ad-effectiveness/clicks-chart"
import { ExpenditureChart } from "@/components/dashboard/ad-effectiveness/expenditure-chart"
import { ConversionChart } from "@/components/dashboard/ad-effectiveness/conversion-chart"

type Row = z.infer<typeof schema>

export type TimeRange =
    | "today"
    | "yesterday"
    | "7d"
    | "30d"
    | "quarter"
    | "period"

type Counter = {
    id: number
    name: string
    site: string
    status: string
    createdAt: string
    timezone: string
    stats: {
        visits: number
        pageviews: number
        users: number
        bounceRate: number
        pageDepth: number
        avgDuration: number
    }
    trafficSources: Array<{
        source: string
        visits: number
        pageviews: number
        users: number
        bounceRate: number
        pageDepth: number
        avgDuration: number
    }>
    goals: Array<{
        id: number
        name: string
        type: string
        isRetargeting: boolean
    }>
}

export default function SiteMetricsClient() {
    const isMobile = useIsMobile()
    const [timeRange, setTimeRange] = React.useState<TimeRange>("today")
    const [dateRange, setDateRange] = React.useState<DateRange | undefined>()
    const [category, setCategory] = React.useState<string>("")
    const [loading, setLoading] = useState(false)
    const [counters, setCounters] = useState<Row[]>([])
    const [error, setError] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isManualAuthLoading, setIsManualAuthLoading] = useState(false)

    useEffect(() => {
        fetchCounters()
    }, [])

    useEffect(() => {
        if (counters.length > 0 && !category) {
            setCategory(counters[0].id.toString())
        }
    }, [counters, category])

    const [data, setData] = useState(null)
    useEffect(() => {
        if (!category) return;

        const fetchData = async () => {
            setLoading(true)
            setError(null)

            try {
                // Вызов вашего API роута
                const res = await fetch(`/api/yandex-metrika/counters/${category}`)

                if (!res.ok) {
                    throw new Error(`Ошибка загрузки: ${res.status}`)
                }

                const json = await res.json()
                console.log(json.metrics)
                setData(json?.metrics)
            } catch (err: any) {
                setError(err?.message ?? "Ошибка")
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [category]) // Перезапускать эффект, если ID изменился

    const handleFiltersChange = React.useCallback(
        (filters: { dateRange?: DateRange; category?: string }) => {
            console.log("filters", filters)
        },
        []
    )

    const handleManualAuth = async () => {
        setIsManualAuthLoading(true)
        try {
            const res = await fetch("/api/yandex-metrika/manual-auth")
            const data = await res.json()

            if (res.ok) {
                alert("Токен успешно сохранен! Обновите страницу.")
            } else {
                alert(`Ошибка: ${data.error || "Не удалось получить токен"}`)
            }
        } catch (err) {
            alert("Ошибка при выполнении запроса")
        } finally {
            setIsManualAuthLoading(false)
        }
    }

    const fetchCounters = async () => {
        setIsLoading(true)
        try {
            const res = await fetch("/api/yandex-metrika/counters")
            const data = await res.json()

            if (res.ok) {
                const rows: Row[] = (data.counters ?? []).map((c: Counter) => ({
                    id: Number(c.id),
                    name: String(c.name ?? ""),
                    state: c.status === "Active" ? "ON" : "OFF",
                    status: String(c.status ?? ""),
                    type: "metrika",
                    adsCount: c.goals?.length ?? 0,
                    avgStats: {
                        impressions: Number(c.stats?.pageviews ?? 0),
                        clicks: Number(c.stats?.visits ?? 0),
                        ctr: Number(c.stats?.bounceRate ?? 0),
                        cpc: 0,
                        bounces: 0,
                        bounceRate: Number(c.stats?.bounceRate ?? 0),
                        cost: 0,
                        conversions: Number(c.goals?.length ?? 0),
                    },
                    ads: c.trafficSources?.map((source, idx) => ({
                        id: idx,
                        adGroupId: 0,
                        status: "ACCEPTED",
                        state: "ON",
                        type: "TEXT_AD",
                        title: source.source,
                        text: `Визиты: ${source.visits}`,
                        href: c.site,
                        stats: {
                            impressions: source.pageviews,
                            clicks: source.visits,
                            ctr: source.bounceRate,
                            cpc: 0,
                            bounces: 0,
                            bounceRate: source.bounceRate,
                            cost: 0,
                            conversions: 0,
                        },
                    })) ?? [],
                }))

                setCounters(rows)
            } else {
                setError(data.error)
                if (res.status === 401 && data.authUrl) window.location.href = data.authUrl
            }
        } catch (err) {
            setError("Ошибка загрузки данных")
        } finally {
            setIsLoading(false)
        }
    }

    const metrics = React.useMemo(() => {
        if (!counters.length) return null

        return {
            all: counters.length,
            activeTotal: counters.filter((c) => c.state === "ON").length,
            won: counters.filter((c) => c.state === "OFF").length,
        }
    }, [counters])

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen gap-4">
                <p className="text-destructive">Ошибка: {error}</p>
                <div className="flex gap-2">
                    <a href="/api/yandex-metrika/auth">
                        <Button>Авторизоваться в Яндекс.Метрике</Button>
                    </a>
                    <Button
                        variant="outline"
                        onClick={handleManualAuth}
                        disabled={isManualAuthLoading}
                    >
                        {isManualAuthLoading ? "Загрузка..." : "Ручная авторизация"}
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col gap-4 py-4 md:py-6">
                <div className="flex flex-col gap-4 mx-6">
                    {/* Tabs */}
                    <Tabs value={category} onValueChange={setCategory}>
                        <TabsList className="w-full justify-start">
                            {counters.map(counter => (
                                <TabsTrigger key={counter.id} value={counter.id.toString()}>
                                    {counter.name}
                                </TabsTrigger>
                            ))}
                        </TabsList>
                    </Tabs>
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

                <SectionCards timeRange={timeRange} dateRange={dateRange} data={data} />
                <div className="px-4 lg:px-6">
                    <ChartAreaInteractive />
                </div>
                {/* Сетка для линейных графиков */}
                <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-4 gap-4 px-4 lg:px-6">
                    <ClicksChart />
                    <ExpenditureChart />
                    <ConversionChart />
                    <ConversionChart />
                </div>

                {/* Сетка для круговых диаграмм */}
                <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-3 gap-4 px-4 lg:px-6 mt-4">
                    <ChartPieDonut />
                    <GenderChartDonut />
                    <AgeChartDonut />
                </div>
                <DataTable
                    data={counters}
                    metrics={metrics}
                    isLoading={isLoading}
                    onFiltersChange={handleFiltersChange}
                />
            </div>
        </div>
    )
}