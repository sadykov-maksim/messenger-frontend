"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardAction, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

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

type ApiResponse = {
    period: { from: string; to: string }
    deals_sum: number
    ad_cost: number
    leads: number
    cpa: number
}

const PAGE_SIZE = 4
const ROTATE_MS = 15_000

function formatNumber(n: number) {
    return new Intl.NumberFormat("ru-RU").format(n)
}

function formatMoneyUSD(n: number) {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n)
}

function formatMoneyRUB(n: number) {
    return new Intl.NumberFormat("ru-RU", { style: "currency", currency: "RUB", maximumFractionDigits: 0 }).format(n)
}

function pctDelta(cur: number, prev: number) {
    if (prev === 0) {
        if (cur === 0) return { delta: "0%", trend: "up" as Trend }
        return { delta: "+100%", trend: "up" as Trend } // условно
    }
    const p = ((cur - prev) / prev) * 100
    const sign = p >= 0 ? "+" : ""
    const trend: Trend = p >= 0 ? "up" : "down"
    return { delta: `${sign}${p.toFixed(1)}%`, trend }
}

function shiftPeriod(from: Date, to: Date) {
    const ms = to.getTime() - from.getTime()
    const prevTo = new Date(from.getTime() - 1) // день/мс назад
    const prevFrom = new Date(prevTo.getTime() - ms)
    return { prevFrom, prevTo }
}

function toISODate(d: Date) {
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, "0")
    const day = String(d.getDate()).padStart(2, "0")
    return `${y}-${m}-${day}`
}

async function fetchMetrics(from: string, to: string, signal?: AbortSignal): Promise<ApiResponse> {
    const res = await fetch(`/api/bitrix/metrics?from=${from}&to=${to}`, { cache: "no-store", signal })
    if (!res.ok) throw new Error(await res.text())
    return res.json()
}

export function SectionCards() {
    const [loading, setLoading] = useState(true)
    const [err, setErr] = useState<string | null>(null)

    const [cur, setCur] = useState<ApiResponse | null>(null)
    const [prev, setPrev] = useState<ApiResponse | null>(null)

    useEffect(() => {
        const ac = new AbortController()

        ;(async () => {
            try {
                setLoading(true)
                setErr(null)

                const to = new Date()
                const from = new Date(Date.now() - 29 * 864e5)

                const { prevFrom, prevTo } = shiftPeriod(from, to)

                const [curData, prevData] = await Promise.all([
                    fetchMetrics(toISODate(from), toISODate(to), ac.signal),
                    fetchMetrics(toISODate(prevFrom), toISODate(prevTo), ac.signal),
                ])

                setCur(curData)
                setPrev(prevData)
            } catch (e: any) {
                if (e?.name === "AbortError") return
                setErr(e?.message || "Ошибка загрузки метрик")
            } finally {
                setLoading(false)
            }
        })()

        return () => ac.abort()
    }, [])

    const metrics: Metric[] = useMemo(() => {
        // пока нет данных — показываем "заглушки"
        if (!cur || !prev) {
            return [
                {
                    key: "deals_sum",
                    title: "Сумма сделок",
                    value: loading ? "—" : "$0",
                    delta: "—",
                    trend: "up",
                    footerTitle: "Общая сумма активных сделок в CRM",
                    footerDesc: "Потенциальная выручка на текущий момент",
                },
                {
                    key: "ad_cost",
                    title: "Расход",
                    value: loading ? "—" : "$0",
                    delta: "—",
                    trend: "down",
                    footerTitle: "Фактические затраты на рекламу",
                    footerDesc: "Используется для расчёта CPA и ROI",
                },
                {
                    key: "leads",
                    title: "Кол-во лидов",
                    value: loading ? "—" : "0",
                    delta: "—",
                    trend: "up",
                    footerTitle: "Общее количество заявок с рекламы",
                    footerDesc: "Показывает объём входящего спроса",
                },
                {
                    key: "cpa",
                    title: "CPA",
                    value: loading ? "—" : "₽0",
                    delta: "—",
                    trend: "up",
                    footerTitle: "Средняя цена одной заявки",
                    footerDesc: "Ключевой показатель эффективности РК",
                },
            ]
        }

        const ds = pctDelta(cur.deals_sum, prev.deals_sum)
        const sp = pctDelta(cur.ad_cost, prev.ad_cost)
        const ld = pctDelta(cur.leads, prev.leads)
        const cp = pctDelta(cur.cpa, prev.cpa)

        return [
            {
                key: "deals_sum",
                title: "Сумма сделок",
                value: formatMoneyRUB(cur.deals_sum),
                delta: ds.delta,
                trend: ds.trend,
                footerTitle: "Общая сумма активных сделок в CRM",
                footerDesc: `Период: ${cur.period.from} — ${cur.period.to}`,
            },
            {
                key: "ad_cost",
                title: "Расход",
                value: formatMoneyRUB(cur.ad_cost),
                delta: sp.delta,
                trend: sp.trend,
                footerTitle: "Фактические затраты на рекламу",
                footerDesc: `Период: ${cur.period.from} — ${cur.period.to}`,
            },
            {
                key: "leads",
                title: "Кол-во лидов",
                value: formatNumber(cur.leads),
                delta: ld.delta,
                trend: ld.trend,
                footerTitle: "Общее количество заявок с рекламы",
                footerDesc: `Период: ${cur.period.from} — ${cur.period.to}`,
            },
            {
                key: "cpa",
                title: "CPA",
                value: formatMoneyRUB(cur.cpa),
                delta: cp.delta,
                trend: cp.trend,
                footerTitle: "Средняя цена одной заявки",
                footerDesc: "Расход / количество лидов",
            },

            // Остальные оставил как были — подключим позже, когда решим формулы/поля
            {
                key: "handled",
                title: "% обработанных",
                value: "—",
                delta: "—",
                trend: "up",
                footerTitle: "Доля лидов с успешным контактом",
                footerDesc: "Нужно определить статус/поле для расчёта",
            },
            {
                key: "cr",
                title: "CR",
                value: "—",
                delta: "—",
                trend: "up",
                footerTitle: "Доля лидов, дошедших до сделки",
                footerDesc: "Нужно определить логику конверсии",
            },
            {
                key: "ad_revenue",
                title: "Ad Revenue",
                value: "—",
                delta: "—",
                trend: "up",
                footerTitle: "Доход с рекламных каналов",
                footerDesc: "Нужна атрибуция/источник сделки",
            },
            {
                key: "roi",
                title: "ROI",
                value: "—",
                delta: "—",
                trend: "up",
                footerTitle: "Показывает прибыльность вложений",
                footerDesc: "ROI = (доход - расход) / расход",
            },
        ]
    }, [cur, prev, loading])

    const totalPages = Math.ceil(metrics.length / PAGE_SIZE)
    const [page, setPage] = useState(0)
    const pausedRef = useRef(false)

    useEffect(() => {
        const id = window.setInterval(() => {
            if (pausedRef.current) return
            setPage((p) => (p + 1) % totalPages)
        }, ROTATE_MS)
        return () => window.clearInterval(id)
    }, [totalPages])

    const visible = metrics.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE)

    return (
        <div
            onMouseEnter={() => (pausedRef.current = true)}
            onMouseLeave={() => (pausedRef.current = false)}
            className="px-4 lg:px-6"
        >
            {/*
            {err && (
                <div className="mb-4 rounded-md border px-3 py-2 text-sm">
                    Не удалось загрузить метрики: {err}
                </div>
            )}
            */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={page}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.35, ease: "easeOut" }}
                    className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 @5xl/main:grid-cols-4"
                >
                    {visible.map((m) => (
                        <Card key={m.key} className="@container/card">
                            <CardHeader>
                                <CardDescription>{m.title}</CardDescription>
                                <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                                    {m.value}
                                </CardTitle>
                                <CardAction>
                                    <Badge variant="outline">
                                        {m.trend === "up" ? <IconTrendingUp /> : <IconTrendingDown />}
                                        {m.delta}
                                    </Badge>
                                </CardAction>
                            </CardHeader>

                            <CardFooter className="flex-col items-start gap-1.5 text-sm">
                                <div className="line-clamp-1 flex gap-2 font-medium">
                                    {m.footerTitle}{" "}
                                    {m.trend === "up" ? <IconTrendingUp className="size-4" /> : <IconTrendingDown className="size-4" />}
                                </div>
                                <div className="text-muted-foreground">{m.footerDesc}</div>
                            </CardFooter>
                        </Card>
                    ))}
                </motion.div>
            </AnimatePresence>
        </div>
    )
}
