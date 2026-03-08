"use client"

import * as React from "react"
import Link from "next/link"
import { useMemo, useState } from "react"
import {
    MoreHorizontal,
    Search,
    ShieldCheck,
    ShieldX,
    ArrowUpDown,
    PhoneCall,
    CalendarCheck,
    FileText,
    TrendingUp,
    Wallet,
    Users,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"

type ManagerStatus = "active" | "inactive"

type Manager = {
    id: string
    name: string
    email: string
    role: "Входящий" | "Исходящий"
    status: ManagerStatus
    team?: string
    createdAt: string
    kpiPlan?: number
    avatarUrl?: string
    // KPI metrics
    calls?: number
    meetings?: number
    invoicesIssued?: number
    dealsClosedAmount?: number
    avgCheck?: number
    newLeads?: number
}

const demoManagers: Manager[] = [
    {
        id: "m_01",
        name: "Анна Котова",
        email: "anna.kotova@company.com",
        role: "Входящий",
        status: "active",
        team: "ВРТ",
        createdAt: "2025-10-03",
        kpiPlan: 120,
        avatarUrl: "https://i.pravatar.cc/64?img=32",
        calls: 312,
        meetings: 48,
        invoicesIssued: 34,
        dealsClosedAmount: 1850000,
        avgCheck: 54412,
        newLeads: 76,
    },
    {
        id: "m_02",
        name: "Илья Орлов",
        email: "ilya.orlov@company.com",
        role: "Исходящий",
        status: "active",
        team: "Карусель",
        createdAt: "2025-08-14",
        kpiPlan: 90,
        avatarUrl: "https://i.pravatar.cc/64?img=12",
        calls: 198,
        meetings: 31,
        invoicesIssued: 22,
        dealsClosedAmount: 940000,
        avgCheck: 42727,
        newLeads: 41,
    },
    {
        id: "m_03",
        name: "Мария Селиверстова",
        email: "m.seliverstova@company.com",
        role: "Входящий",
        status: "inactive",
        team: "ВРТ",
        createdAt: "2025-06-01",
        kpiPlan: 80,
        avatarUrl: "https://i.pravatar.cc/64?img=47",
        calls: 87,
        meetings: 12,
        invoicesIssued: 9,
        dealsClosedAmount: 320000,
        avgCheck: 35555,
        newLeads: 18,
    },
    {
        id: "m_01",
        name: "Анна Котова",
        email: "anna.kotova@company.com",
        role: "Входящий",
        status: "active",
        team: "ВРТ",
        createdAt: "2025-10-03",
        kpiPlan: 120,
        avatarUrl: "https://i.pravatar.cc/64?img=32",
        calls: 312,
        meetings: 48,
        invoicesIssued: 34,
        dealsClosedAmount: 1850000,
        avgCheck: 54412,
        newLeads: 76,
    },
    {
        id: "m_02",
        name: "Илья Орлов",
        email: "ilya.orlov@company.com",
        role: "Исходящий",
        status: "active",
        team: "Карусель",
        createdAt: "2025-08-14",
        kpiPlan: 90,
        avatarUrl: "https://i.pravatar.cc/64?img=12",
        calls: 198,
        meetings: 31,
        invoicesIssued: 22,
        dealsClosedAmount: 940000,
        avgCheck: 42727,
        newLeads: 41,
    },
    {
        id: "m_03",
        name: "Мария Селиверстова",
        email: "m.seliverstova@company.com",
        role: "Входящий",
        status: "inactive",
        team: "ВРТ",
        createdAt: "2025-06-01",
        kpiPlan: 80,
        avatarUrl: "https://i.pravatar.cc/64?img=47",
        calls: 87,
        meetings: 12,
        invoicesIssued: 9,
        dealsClosedAmount: 320000,
        avgCheck: 35555,
        newLeads: 18,
    },

]

type SortKey = "name" | "createdAt"
type SortDir = "asc" | "desc"

function formatDate(iso: string) {
    const d = new Date(iso)
    if (Number.isNaN(d.getTime())) return iso
    return new Intl.DateTimeFormat("ru-RU", { dateStyle: "medium" }).format(d)
}

function formatMoney(n: number) {
    return new Intl.NumberFormat("ru-RU", {
        style: "currency",
        currency: "RUB",
        maximumFractionDigits: 0,
    }).format(n)
}

type MetricCardProps = {
    icon: React.ReactNode
    label: string
    value: string
    sub?: string
    accent?: string
}

type ApiRow = {
    manager_id: number
    name: string
    direction: string
    team: string
    calls: number
    meetings: number
    invoices: number
    deals_sum: number
    avg_check: number
    leads: number
}

type ApiResponse = {
    period: { from: string; to: string }
    rows: ApiRow[]
    totals: {
        calls: number
        meetings: number
        invoices: number
        deals_sum: number
        leads: number
        avg_check: number
    }
}

function toISO(d: Date) {
    return d.toISOString().slice(0, 10)
}

function MetricCard({ icon, label, value, sub, accent = "bg-muted" }: MetricCardProps) {
    return (
        <Card className="flex flex-col gap-3 p-5">
            <div className="flex items-center gap-3">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${accent}`}>
                    {icon}
                </div>
                <span className="text-sm font-medium text-muted-foreground leading-tight">{label}</span>
            </div>
            <div className="flex flex-col gap-0.5">
                <span className="text-2xl font-bold tracking-tight">{value}</span>
                {sub && <span className="text-xs text-muted-foreground">{sub}</span>}
            </div>
        </Card>
    )
}

export default function KpiManagersPage() {
    const [q, setQ] = useState("")
    const [status, setStatus] = useState<"all" | ManagerStatus>("all")
    const [sortKey, setSortKey] = useState<SortKey>("name")
    const [sortDir, setSortDir] = useState<SortDir>("asc")
    const [items, setItems] = useState<Manager[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

// период (пока дефолт 30 дней; потом можно привязать к фильтру)
    const period = useMemo(() => {
        const to = new Date()
        const from = new Date(Date.now() - 29 * 864e5)
        return { from: toISO(from), to: toISO(to) }
    }, [])

    React.useEffect(() => {
        let aborted = false

        async function load() {
            setLoading(true)
            setError(null)

            try {
                const res = await fetch(`/api/bitrix/kpi/managers?from=${period.from}&to=${period.to}`, {
                    cache: "no-store",
                })
                if (!res.ok) throw new Error(await res.text())

                const data: ApiResponse = await res.json()

                // маппим под твой UI-тип Manager
                const mapped: Manager[] = data.rows.map((r) => ({
                    id: String(r.manager_id),
                    name: r.name,
                    email: "", // если нужно — можно подтягивать из user.get в API и вернуть email
                    role: (r.direction as any) || "Входящий", // у тебя role используется как "Направление"
                    status: "active",
                    team: r.team,

                    createdAt: data.period.from, // можно убрать/заменить
                    avatarUrl: undefined, // если добавишь avatar в API — подставишь сюда

                    calls: r.calls,
                    meetings: r.meetings,
                    invoicesIssued: r.invoices,
                    dealsClosedAmount: r.deals_sum,
                    avgCheck: r.avg_check,
                    newLeads: r.leads,
                }))

                if (!aborted) setItems(mapped)
            } catch (e: any) {
                if (!aborted) setError(e?.message ?? "Ошибка загрузки")
            } finally {
                if (!aborted) setLoading(false)
            }
        }

        load()
        return () => {
            aborted = true
        }
    }, [period.from, period.to])

    const metrics = useMemo(() => {
        const active = items.filter((m) => m.status === "active")
        const totalCalls = items.reduce((s, m) => s + (m.calls ?? 0), 0)
        const totalMeetings = items.reduce((s, m) => s + (m.meetings ?? 0), 0)
        const totalInvoices = items.reduce((s, m) => s + (m.invoicesIssued ?? 0), 0)
        const totalAmount = items.reduce((s, m) => s + (m.dealsClosedAmount ?? 0), 0)
        const avgCheck =
            items.filter((m) => m.avgCheck).length > 0
                ? Math.round(
                    items.filter((m) => m.avgCheck).reduce((s, m) => s + (m.avgCheck ?? 0), 0) /
                    items.filter((m) => m.avgCheck).length
                )
                : 0
        const totalLeads = items.reduce((s, m) => s + (m.newLeads ?? 0), 0)

        return { active: active.length, total: items.length, totalCalls, totalMeetings, totalInvoices, totalAmount, avgCheck, totalLeads }
    }, [items])

    // ── Filtered + sorted list ────────────────────────────────────────────────
    const filtered = useMemo(() => {
        const query = q.trim().toLowerCase()
        const base = items.filter((m) => {
            const statusOk = status === "all" ? true : m.status === status
            if (!statusOk) return false
            if (!query) return true
            const hay = `${m.name} ${m.email} ${m.role} ${m.team ?? ""}`.toLowerCase()
            return hay.includes(query)
        })
        base.sort((a, b) => {
            const aVal = sortKey === "name" ? a.name : a.createdAt
            const bVal = sortKey === "name" ? b.name : b.createdAt
            const cmp = aVal < bVal ? -1 : aVal > bVal ? 1 : 0
            return sortDir === "asc" ? cmp : -cmp
        })
        return base
    }, [items, q, status, sortKey, sortDir])

    function toggleSort(nextKey: SortKey) {
        if (sortKey !== nextKey) { setSortKey(nextKey); setSortDir("asc"); return }
        setSortDir((d) => (d === "asc" ? "desc" : "asc"))
    }

    function archiveManager(id: string) {
        setItems((prev) => prev.map((m) => (m.id === id ? { ...m, status: "inactive" } : m)))
    }

    return (
        <div className="flex flex-1 flex-col gap-6 mt-5">
            <div className="px-4 lg:px-6">

                {/* ── Key Metrics ─────────────────────────────────────────────── */}
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6 mb-6">
                    <MetricCard
                        icon={<Users className="h-5 w-5 text-sky-600" />}
                        label="Активных менеджеров"
                        value={`${metrics.active} / ${metrics.total}`}
                        sub="из общего числа"
                        accent="bg-sky-100 dark:bg-sky-950"
                    />
                    <MetricCard
                        icon={<PhoneCall className="h-5 w-5 text-violet-600" />}
                        label="Всего звонков"
                        value={metrics.totalCalls.toLocaleString("ru-RU")}
                        sub="за период"
                        accent="bg-violet-100 dark:bg-violet-950"
                    />
                    <MetricCard
                        icon={<CalendarCheck className="h-5 w-5 text-emerald-600" />}
                        label="Встречи"
                        value={metrics.totalMeetings.toLocaleString("ru-RU")}
                        sub="проведено"
                        accent="bg-emerald-100 dark:bg-emerald-950"
                    />
                    <MetricCard
                        icon={<FileText className="h-5 w-5 text-amber-600" />}
                        label="Выставлено счетов"
                        value={metrics.totalInvoices.toLocaleString("ru-RU")}
                        sub="КП / Счета"
                        accent="bg-amber-100 dark:bg-amber-950"
                    />
                    <MetricCard
                        icon={<Wallet className="h-5 w-5 text-rose-600" />}
                        label="Сумма сделок"
                        value={formatMoney(metrics.totalAmount)}
                        sub="закрытые договоры"
                        accent="bg-rose-100 dark:bg-rose-950"
                    />
                    <MetricCard
                        icon={<TrendingUp className="h-5 w-5 text-teal-600" />}
                        label="Средний чек"
                        value={formatMoney(metrics.avgCheck)}
                        sub={`новых заявок: ${metrics.totalLeads}`}
                        accent="bg-teal-100 dark:bg-teal-950"
                    />
                </div>

                {/* ── Table Card ──────────────────────────────────────────────── */}
                <Card>
                    <CardContent className="pt-0">
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[260px] ">
                                            <Button variant="ghost" className="ml-2 h-8 px-3" onClick={() => toggleSort("name")}>
                                                Менеджер <ArrowUpDown className="ml-2 h-4 w-4" />
                                            </Button>
                                        </TableHead>
                                        <TableHead>Направление</TableHead>
                                        <TableHead>Команда</TableHead>
                                        <TableHead className="text-center">Звонки</TableHead>
                                        <TableHead className="text-center">Встречи</TableHead>
                                        <TableHead className="text-center">Счета</TableHead>
                                        <TableHead className="text-center">Сумма сделок</TableHead>
                                        <TableHead className="text-center">Ср. чек</TableHead>
                                        <TableHead className="text-center mr-2">Заявки</TableHead>
                                    </TableRow>
                                </TableHeader>

                                <TableBody>
                                    {filtered.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={12} className="py-10 text-center text-sm text-muted-foreground">
                                                Ничего не найдено
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filtered.map((m) => (
                                            <TableRow key={m.id}>
                                                <TableCell className={'pl-5'}>
                                                    <div className="flex items-center gap-3 ">
                                                        <Avatar className="h-9 w-9">
                                                            <AvatarImage src={m.avatarUrl} alt={m.name} />
                                                            <AvatarFallback>
                                                                {m.name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase()}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div className="flex flex-col">
                                                            <Link href={`/kpi-managers/${m.id}`} className="font-medium leading-none hover:underline">
                                                                {m.name}
                                                            </Link>
                                                            <span className="text-xs text-muted-foreground">{m.email}</span>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline">{m.role}</Badge>
                                                </TableCell>
                                                <TableCell className="text-muted-foreground">{m.team ?? "—"}</TableCell>
                                                <TableCell className="text-center tabular-nums">{m.calls?.toLocaleString("ru-RU") ?? "—"}</TableCell>
                                                <TableCell className="text-center tabular-nums">{m.meetings?.toLocaleString("ru-RU") ?? "—"}</TableCell>
                                                <TableCell className="text-center tabular-nums">{m.invoicesIssued?.toLocaleString("ru-RU") ?? "—"}</TableCell>
                                                <TableCell className="text-center tabular-nums font-medium">
                                                    {typeof m.dealsClosedAmount === "number" ? formatMoney(m.dealsClosedAmount) : "—"}
                                                </TableCell>
                                                <TableCell className="text-center tabular-nums text-muted-foreground">
                                                    {typeof m.avgCheck === "number" ? formatMoney(m.avgCheck) : "—"}
                                                </TableCell>
                                                <TableCell className="text-center tabular-nums">{m.newLeads?.toLocaleString("ru-RU") ?? "—"}</TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}