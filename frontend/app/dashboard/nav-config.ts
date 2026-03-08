import {
    IconBriefcase,
    IconChartBar,
    IconDashboard, IconFileWord, IconHelp, IconPlug, IconReport,
    IconReportAnalytics,
    IconSettings,
    IconUsers,
    IconGraph
} from "@tabler/icons-react";
import {AudioWaveform, Command, GalleryVerticalEnd} from "lucide-react";

export const dashboardNav = {
    user: {},
    teams: [
        {
            name: "Default Project",
            logo: GalleryVerticalEnd,
            plan: "проект по умолчанию",
        },
    ],
    navMain: [
        {
            title: "Приборная панель",
            url: "/",
            icon: IconDashboard,
        },
        {
            title: "Эффективность РК",
            url: "/ad-effectiveness",
            icon: IconChartBar,
        },
        {
            title: "Метрика сайтов",
            url: "/site-metrics",
            icon: IconGraph,
        },
        {
            title: "KPI Менеджеры",
            url: "/kpi-managers",
            icon: IconUsers,
        },
        {
            title: "Проекты",
            url: "/projects",
            icon: IconBriefcase,
        },
        {
            title: "Отчеты",
            url: "/reports",
            icon: IconReportAnalytics,
        },
    ],
    navSecondary: [
        {
            title: "Настройка",
            url: "/settings",
            icon: IconSettings,
        },
        {
            title: "Помощь",
            url: "/get-help",
            icon: IconHelp,
        },
    ],
    documents: [
        {
            title: "Интеграция данных",
            url: "/integrations",
            icon: IconPlug,
        },
        {
            title: "Конструктор отчетов",
            url: "/report-designer",
            icon: IconReport,
        },
        {
            title: "Бизнес-помощник",
            url: "/business-assistant",
            icon: IconFileWord,
        },
    ],
}