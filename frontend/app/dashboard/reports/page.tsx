"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
    BarChart3,
    LineChart,
    PieChart,
    Users,
    Smartphone,
    Mail,
    Search,
    Target,
    LucideIcon,
    Clock,
    Loader2, // Иконка загрузки
    Check, Activity    // Иконка успеха
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { cn } from "@/lib/utils" // Утилита для условных классов (стандарт shadcn)

// Обновили тип, добавив updatedAt
type ReportItem = {
    id: string
    title: string
    badge: string
    description: string
    icon: LucideIcon
    updatedAt: string
}

// Тип для статуса кнопки
type ButtonStatus = "idle" | "loading" | "success"

export default function Home() {
    const router = useRouter()

    // Состояние для хранения статусов кнопок по ID отчета
    const [reportStatuses, setReportStatuses] = React.useState<Record<string, ButtonStatus>>({})

    const [items] = React.useState<ReportItem[]>([
        {
            id: "summary",
            title: "Сводный отчет (ROI)",
            badge: "Главное",
            description: "Ключевые показатели эффективности: выручка, расходы, ROI и ДРР по всем каналам.",
            icon: BarChart3,
            updatedAt: "Обновлено: сегодня, 12:45",
        },
        {
            id: "seo",
            title: "SEO и Органика",
            badge: "Трафик",
            description: "Динамика позиций, видимость сайта и органический трафик (Яндекс/Google).",
            icon: Search,
            updatedAt: "Обновлено: сегодня, 12:45",
        },
        {
            id: "ppc",
            title: "Контекстная реклама",
            badge: "PPC",
            description: "Эффективность платного трафика: CPA, CPL и конверсии по кампаниям.",
            icon: Target,
            updatedAt: "Обновлено: сегодня, 12:45",
        },
        {
            id: "smm",
            title: "Социальные сети",
            badge: "SMM",
            description: "Охваты, вовлеченность и прирост подписчиков в Telegram, VK и Дзен.",
            icon: Smartphone,
            updatedAt: "Обновлено: сегодня, 12:45",
        },
        {
            id: "crm-funnel",
            title: "Воронка продаж",
            badge: "CRM",
            description: "Конверсия лидов в сделки на каждом этапе воронки продаж.",
            icon: LineChart,
            updatedAt: "Обновлено: сегодня, 12:45",
        },
        {
            id: "cohorts",
            title: "Когортный анализ",
            badge: "LTV",
            description: "Удержание клиентов (Retention Rate) и пожизненная ценность (LTV).",
            icon: Users,
            updatedAt: "Обновлено: сегодня, 12:45",
        },
        {
            id: "email",
            title: "Email маркетинг",
            badge: "Рассылки",
            description: "Открываемость (Open Rate), клики и отписки по триггерным цепочкам.",
            icon: Mail,
            updatedAt: "Обновлено: сегодня, 12:45",
        },
        {
            id: "sources",
            title: "Источники трафика",
            badge: "Аналитика",
            description: "Распределение трафика по каналам, устройствам и географии пользователей.",
            icon: PieChart,
            updatedAt: "Обновлено: сегодня, 12:45",
        },
    ])

    // Функция обработки клика
    const handleRequestReport = (id: string) => {
        // 1. Ставим статус "Загрузка"
        setReportStatuses((prev) => ({ ...prev, [id]: "loading" }))

        // 2. Имитируем запрос к серверу (1.5 секунды)
        setTimeout(() => {
            // 3. Ставим статус "Успех"
            setReportStatuses((prev) => ({ ...prev, [id]: "success" }))

            // 4. (Опционально) Через 2 секунды возвращаем кнопку в исходное состояние
            // Если вы хотите сразу переходить на страницу, раскомментируйте router.push ниже
            setTimeout(() => {
                setReportStatuses((prev) => ({ ...prev, [id]: "idle" }))

                // Если нужно переходить на страницу после "Отправлено":
                // router.push(`/reports/${id}`)
            }, 2000)

        }, 1500)
    }

    return (
        <div className="flex flex-1 flex-col gap-6 mt-5">
            <div className="px-4 lg:px-6">
                <div className="grid gap-5 mb-6 [grid-template-columns:repeat(auto-fit,minmax(300px,1fr))]">
                    {items.map((it) => {
                        const Icon = it.icon
                        // Получаем текущий статус конкретной кнопки (по умолчанию 'idle')
                        const status = reportStatuses[it.id] || "idle"

                        return (
                            <Card key={it.id} className="flex flex-col gap-4">
                                <CardHeader className="flex-1 min-w-0 gap-2">
                                    <div className="flex items-center justify-between gap-2">
                                        <CardTitle className="flex items-center gap-2 text-base">
                                            <div className="p-2 bg-muted rounded-md">
                                                <Icon className="h-5 w-5 text-primary" />
                                            </div>
                                            {it.title}
                                        </CardTitle>
                                        <Badge variant="secondary">{it.badge}</Badge>
                                    </div>

                                    <CardDescription className="line-clamp-3 pt-1">
                                        {it.description}
                                    </CardDescription>
                                </CardHeader>

                                <CardFooter className="mt-auto flex flex-col gap-4 items-start">
                                    <div className="flex items-center text-xs text-muted-foreground w-full">
                                        <Clock className="mr-1.5 h-3 w-3" />
                                        {it.updatedAt}
                                    </div>

                                    <Button
                                        className={cn(
                                            "w-full transition-all duration-300",
                                            status === "success" && "bg-green-600 hover:bg-green-700 text-white"
                                        )}
                                        disabled={status === "loading" || status === "success"}
                                        onClick={() => handleRequestReport(it.id)}
                                    >
                                        <Activity className="mr-2 h-4 w-4" />
                                        {status === "idle" && "Получить отчёт"}

                                        {status === "loading" && (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Формирование...
                                            </>
                                        )}

                                        {status === "success" && (
                                            <>
                                                <Check className="mr-2 h-4 w-4" />
                                                Отправлено
                                            </>
                                        )}
                                    </Button>
                                </CardFooter>
                            </Card>
                        )
                    })}
                </div>
            </div>
        </div>
    );
}