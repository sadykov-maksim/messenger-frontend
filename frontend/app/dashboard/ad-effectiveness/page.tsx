"use client"

import * as React from "react"
import { SectionCards } from "@/components/dashboard/ad-effectiveness/section-cards"
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
import {DataTable, Metrics, schema} from "@/components/dashboard/ad-effectiveness/data-table";
import {useCallback, useEffect, useState} from "react";
import { z } from "zod";
import {ChartPieDonut} from "@/components/dashboard/ad-effectiveness/charts/devices-chart";
import {GenderChartDonut} from "@/components/dashboard/ad-effectiveness/charts/sex-chart";
import {AgeChartDonut} from "@/components/dashboard/ad-effectiveness/charts/age-chart";
import {ClicksChart} from "@/components/dashboard/ad-effectiveness/clicks-chart";
import {ExpenditureChart} from "@/components/dashboard/ad-effectiveness/expenditure-chart";
import {ConversionChart} from "@/components/dashboard/ad-effectiveness/conversion-chart";
type Row = z.infer<typeof schema>

type TimeRange =
  | "today"
  | "yesterday"
  | "7d"
  | "30d"
  | "quarter"
  | "period"
 
type Campaign = {
    id: number
    name: string
    state: string
    status: string
    type: string
}




export default function Home() {
    const isMobile = useIsMobile()
    const [timeRange, setTimeRange] = React.useState<TimeRange>("today")
    const [dateRange, setDateRange] = React.useState<DateRange | undefined>()

    const [campaigns, setCampaigns] = useState<Row[]>([])
    const [error, setError] = useState("")
    const [isLoading, setIsLoading] = useState(true)
    const [category, setCategory] = React.useState<string>("")



    useEffect(() => {
        fetchCampaigns()
    }, [])

    useEffect(() => {
        if (campaigns.length > 0 && !category) {
            setCategory(campaigns[0].id.toString())
        }
    }, [campaigns, category])

// минимальный хендлер (пока просто заглушка)
    const handleFiltersChange = React.useCallback(
        (filters: { dateRange?: DateRange; category?: string }) => {
            // если нужно — потом будешь дергать fetch с параметрами
            console.log("filters", filters)
        },
        []
    )

    const fetchCampaigns = async () => {
        setIsLoading(true)
        try {
            const res = await fetch("/api/yandex-direct/campaigns")
            const data = await res.json()

            if (res.ok) {
                const rows: Row[] = (data.campaigns ?? []).map((c: any) => ({
                    id: Number(c.id),
                    name: String(c.name ?? ""),
                    state: String(c.state ?? ""),
                    status: String(c.status ?? ""),
                    type: String(c.type ?? ""),

                    adsCount: Number(c.adsCount ?? 0),

                    avgStats: {
                        impressions: Number(c.avgStats?.impressions ?? 0),
                        clicks: Number(c.avgStats?.clicks ?? 0),
                        ctr: Number(c.avgStats?.ctr ?? 0),
                        cpc: Number(c.avgStats?.cpc ?? 0),
                        bounces: Number(c.avgStats?.bounces ?? 0),
                        bounceRate: Number(c.avgStats?.bounceRate ?? 0),
                        cost: Number(c.avgStats?.cost ?? 0),
                        conversions: Number(c.avgStats?.conversions ?? 0),
                    },

                    ads: c.ads ?? [],
                }))

                setCampaigns(rows)
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
        if (!campaigns.length) return null

        return {
            all: campaigns.length,
            activeTotal: campaigns.filter((c) => c.state === "ON").length,
            won: campaigns.filter((c) => c.state === "OFF").length,
        }
    }, [campaigns])

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen gap-4">
                <p className="text-destructive">Ошибка: {error}</p>
                <a href="/api/yandex-direct/auth">
                    <Button>Авторизоваться в Яндекс</Button>
                </a>
            </div>
        )
    }
    
    const totals = React.useMemo(() => {
      return {
        all: campaigns.length,
        activeTotal: campaigns.filter((c) => c.state === "ON").length,
        won: campaigns.filter((c) => c.state === "OFF").length,
      }
    }, [campaigns])
    
    return (
        <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col gap-4 py-4 md:py-6">
                <div className="flex flex-col gap-4 mx-6">
                    {/* Tabs */}
                    <Tabs value={category} onValueChange={setCategory}>
                        <TabsList className="w-full justify-start">
                            {campaigns.map(campaign => (
                                <TabsTrigger key={campaign.id} value={campaign.id.toString()}>
                                    {campaign.name}
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

                <SectionCards timeRange={timeRange} dateRange={dateRange}  />
                {/* Сетка для линейных графиков */}
                <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-3 gap-4 px-4 lg:px-6">
                    <ClicksChart />
                    <ExpenditureChart />
                    <ConversionChart />
                </div>

                {/* Сетка для круговых диаграмм */}
                <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-3 gap-4 px-4 lg:px-6 mt-4">
                    <ChartPieDonut />
                    <GenderChartDonut />
                    <AgeChartDonut />
                </div>
                <DataTable
                    data={campaigns}
                    metrics={metrics}          // ✅ было null
                    isLoading={isLoading}
                    onFiltersChange={handleFiltersChange}
                />
            </div>
        </div>
    )
}