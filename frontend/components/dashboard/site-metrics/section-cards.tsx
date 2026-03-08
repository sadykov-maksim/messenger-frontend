"use client"

import { useEffect, useMemo, useState } from "react"
import { motion } from "framer-motion"
import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardAction, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

import { DateRange } from "react-day-picker"

export type TimeRange =
    | "today"
    | "yesterday"
    | "7d"
    | "30d"
    | "quarter"
    | "period"

type Trend = "up" | "down"

type Metric = {
    key: string
    title: string
    value: string
    delta: string
    trend: Trend
    footerTitle: string
    footerDesc: string
}

type TrafficSource = {
    name: string
    visits: number
    users: number
}

type ApiResponse = {
    pageviews: number
    visits: number
    users: number
    avgDuration: number   // секунды
    pageDepth: number
    bounceRate: number    // %
    sources: TrafficSource[]
}

type SectionCardsProps = {
    timeRange: TimeRange
    dateRange?: DateRange
    data?: ApiResponse | null
}

export function SectionCards({ timeRange, dateRange, data }: SectionCardsProps) {
    const [err, setErr] = useState<string | null>(null)

    const fmtInt = (n: number) =>
        new Intl.NumberFormat("ru-RU").format(n)

    const fmtFloat = (n: number, d = 2) =>
        n.toFixed(d).replace(".", ",")

    const fmtMin = (sec: number) =>
        `${Math.round(sec / 60)} м`

    const metrics: Metric[] = useMemo(() => {
        if (!data) {
            return [
                { key: "views", title: "Просмотры", value: "—", delta: "—", trend: "up", footerTitle: "Суммарные просмотры", footerDesc: "Общее количество загрузок страниц" },
                { key: "visits", title: "Визиты", value: "—", delta: "—", trend: "up", footerTitle: "Количество сессий", footerDesc: "Всего заходов на сайт" },
                { key: "users", title: "Посетители", value: "—", delta: "—", trend: "up", footerTitle: "Уникальные пользователи", footerDesc: "Охват аудитории" },
                { key: "time", title: "Время на сайте", value: "—", delta: "—", trend: "up", footerTitle: "Средняя длительность", footerDesc: "Время одной сессии" },
                { key: "depth", title: "Глубина просмотра", value: "—", delta: "—", trend: "up", footerTitle: "Страниц за визит", footerDesc: "Вовлеченность пользователя" },
                { key: "bounce", title: "Отказы", value: "—", delta: "—", trend: "down", footerTitle: "Показатель отказов", footerDesc: "Визиты с просмотром 1 страницы" },
            ]
        }

        return [
            {
                key: "views",
                title: "Просмотры",
                value: fmtInt(data.pageviews),
                delta: "—",
                trend: "up",
                footerTitle: "Суммарные просмотры",
                footerDesc: "Общее количество загрузок страниц",
            },
            {
                key: "visits",
                title: "Визиты",
                value: fmtInt(data.visits),
                delta: "—",
                trend: "up",
                footerTitle: "Количество сессий",
                footerDesc: "Всего заходов на сайт",
            },
            {
                key: "users",
                title: "Посетители",
                value: fmtInt(data.users),
                delta: "—",
                trend: "up",
                footerTitle: "Уникальные пользователи",
                footerDesc: "Охват аудитории",
            },
            {
                key: "time",
                title: "Время на сайте",
                value: fmtMin(data.avgDuration),
                delta: "—",
                trend: "up",
                footerTitle: "Средняя длительность",
                footerDesc: "Время одной сессии",
            },
            {
                key: "depth",
                title: "Глубина просмотра",
                value: fmtFloat(data.pageDepth),
                delta: "—",
                trend: "up",
                footerTitle: "Страниц за визит",
                footerDesc: "Вовлеченность пользователя",
            },
            {
                key: "bounce",
                title: "Отказы",
                value: `${fmtFloat(data.bounceRate, 1)}%`,
                delta: "—",
                trend: "down",
                footerTitle: "Показатель отказов",
                footerDesc: "Визиты с просмотром 1 страницы",
            },
        ]
    }, [data])

    return (
        <div className="px-4 lg:px-6">
            {err && (
                <div className="mb-4 rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                    Не удалось загрузить метрики: {err}
                </div>
            )}

            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6"
            >
                {metrics.map((m) => (
                    <Card key={m.key} className="flex flex-col justify-between">
                        <CardHeader>
                            <CardDescription>{m.title}</CardDescription>
                            <CardTitle className="text-2xl font-semibold tabular-nums">{m.value}</CardTitle>
                            <CardAction>
                                <Badge variant="outline">
                                    {m.trend === "up" ? (
                                        <IconTrendingUp className="mr-1 size-3" />
                                    ) : (
                                        <IconTrendingDown className="mr-1 size-3" />
                                    )}
                                    {m.delta}
                                </Badge>
                            </CardAction>
                        </CardHeader>

                        <CardFooter className="flex-col items-start gap-1.5 text-sm">
                            <div className="flex items-center gap-2 font-medium">{m.footerTitle}</div>
                            <div className="text-xs text-muted-foreground truncate w-full" title={m.footerDesc}>
                                {m.footerDesc}
                            </div>
                        </CardFooter>
                    </Card>
                ))}
            </motion.div>
        </div>
    )
}